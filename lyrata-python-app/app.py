from TextToDBParsers import analise_document, read_file
from flask import Flask, Response, request, jsonify, g
from DataBaseAPI import db_api
from AiTextProcessing import TextAnaliser, MODELS
from flask_cors import CORS
import threading
import atexit
import queue
import time
import json
import os

# ---------- 0. Помощники ----------

event_queue = queue.Queue()

settings = {
    "division_type": "sentence", # sentence | paragraph | tokened
    "result_getter_type": "weighted", # weighted | average
    "smooth_type": "distanced", # direct | distanced
    "model_name": 0
} # Здесь по умолчанию
settings_lock = threading.Lock()
model_lock = threading.Lock()
model = TextAnaliser()

app = Flask(__name__)
CORS(app) # Инициализируем CORS для всего приложения. По умолчанию разрешает все источники.

PATH_TO_SETTINGS = "F:\Projects\Lyrata\settgins.json"
PATH_TO_DATABASE = "F:\Projects\Lyrata\my_database.db"

def get_db():
    if 'db' not in g:
        g.db = db_api(PATH_TO_DATABASE)
    return g.db

@app.teardown_request
def close_connection(exception):
    g.pop('db', None)

def save_settings_json():
    try:
        os.makedirs(os.path.dirname(PATH_TO_SETTINGS), exist_ok=True)
        with open(PATH_TO_SETTINGS, 'w', encoding='utf-8') as f:
            json.dump(settings, f, indent=4, ensure_ascii=False)
        print(f"Настройки успешно сохранены в {PATH_TO_SETTINGS}")
    except IOError as e:
        print(f"Ошибка при сохранении настроек в {PATH_TO_SETTINGS}: {e}")
atexit.register(save_settings_json)

def load_settings_json() -> dict:
    global settings
    with settings_lock:
        try:
            with open(PATH_TO_SETTINGS, 'r', encoding='utf-8') as f:
                settings = {**settings, **json.load(f)}
        except json.JSONDecodeError as e:
            print("json decoder error")
        except IOError as e:
            print("writing error")


def generate_queued_events():
    while True:
        try:
            event_data = event_queue.get(timeout=1) # {event: "document1", data: {}}
            if "data" not in event_data: event_data['data'] = {}
            print(f"event:{event_data['event']}\\ndata:{json.dumps(event_data['data'])}\\n\\n")
            # Типы ивентов: documents_table_update, document_update, settings_update
            yield f"event:{event_data['event']}\ndata:{json.dumps(event_data['data'])}\n\n"
        except queue.Empty:
            yield "data: \n\n" # Пустое сообщение для keep-alive
            time.sleep(1) # Небольшая задержка, чтобы не нагружать CPU в пустом цикле

# ---------- 1. Ивент-разсылатель ---------- 

@app.route('/api/database/update_caller')
def live_updates_stream():
    return Response(generate_queued_events(), mimetype='text/event-stream',
                    headers={
                        'Cache-Control': 'no-cache',
                        'Connection': 'keep-alive'
                    })

# ---------- 2. Списки документов ----------

@app.route('/api/database/document_list', defaults={'amount': 0})
@app.route('/api/database/document_list/<int:amount>', methods=['GET'])
def get_document_list(amount):
    """
    Берёт из базы данных n-ное количество первых документов

    `amount` - количество документов

    Returns:
            JSON-строку вида [[<id>, <name>, <author>, <created_at>, <updated_at>, <reading_progress>],...]
    """
    db = get_db()
    docs = db.get_documents(amount)
    data = {
        "items": docs
    }
    return jsonify(data) # jsonify автоматически устанавливает Content-Type: application/json

# ---------- 3. Информация о документе ----------

@app.route('/api/database/document_info/<int:id>', methods=['GET'])
def get_document_info(id):
    db = get_db()
    if id is not None and type(id) == int:
        doc = db.get_documents(id=id)
        data = {"items":doc}
        if doc:
            return jsonify(data)
    print('get_document_by_id: Wrong id provided')
    return jsonify({"error": f"Документ с ID {id} не найден."}), 404

# ---------- 4. Содержимое документа ----------

@app.route('/api/database/document/<int:document_id>', defaults={'amount': 0, 'offset': 0})
@app.route('/api/database/document/<int:document_id>/<int:offset>', defaults={'amount': 0})
@app.route('/api/database/document/<int:document_id>/<int:offset>/<int:amount>', methods=['GET'])
def get_document(document_id, offset, amount):
    if amount == 0: amount = None
    db = get_db()
    blocks = db.get_sorted_document(document_id, offset, amount)
    if blocks:
        return jsonify(blocks), 200
    else:
        print('get_document: Wrong id provided')
        return jsonify({"error": f"Документ с ID {document_id} не найден."}), 404
    
# ---------- 5. Изменить список документов ----------

@app.route('/api/database/add_document', methods=['POST'])
def add_document():
    db = get_db()
    if not request.is_json:
        return jsonify({"status": "error", "message": "Запрос должен быть в формате JSON"}), 400
    received_data = request.get_json()
    try:
        read_file(received_data['path'], db)
        event_queue.put({"event": "documents_table_update"})
        return jsonify({"status": "success"}), 200
    except Exception:
        return jsonify({"status": "error", "message": "Что-то пошло не так"}), 400

@app.route('/api/database/remove_document/<int:document_id>', methods=['DELETE'])
def remove_document(document_id):
    try:
        db = get_db()
        db.delete_document(document_id)
        event_queue.put({"event": "documents_table_update"})
        return jsonify({"status":"success"}), 200
    except:
        return jsonify({"status":"error", "message": "sth went wrong"}), 400

# ---------- 6. Изменить строки таблицы documents ----------

@app.route('/api/database/document/<int:document_id>/progress', methods=['PUT'])
def update_documents_progress(document_id):
    data = request.json
    if not data:
        return jsonify({"error": "Request body is empty"}), 400
    db = get_db()
    db.update_document(document_id,reading_progress=data['progress'])
    event_queue.put({"event": "documents_table_update"})
    return jsonify({"status": "success"}), 200

# ---------- 7. Обновление документов ----------

@app.route('/api/database/document/<int:document_id>/analise', methods=['POST'])
def api_analise_document(document_id):
    try:
        start_ai()
        with model_lock:
            db = get_db() 
            set_copy = None
            with settings_lock:
                set_copy = {**settings}
            analise_document(db, document_id, model, smooth_type=set_copy["smooth_type"], result_getter_type=set_copy["result_getter_type"],) # dividion_type, smooth_type, result_getter_type, model_name
            event_queue.put({"event": "document_update", "data": {"document_id": document_id}})
        return jsonify({"status":"success"}), 200
    except RuntimeError as e:
        return jsonify({"status":"error", "message": "sth went wrong"}), 500
    except:
        return jsonify({"status":"error", "message": "You most likely provide wrong document id"}), 400
    
# ---------- 8. Изменение настроек ----------

@app.route('/api/settings', methods=['PUT'])
def change_settings():
    data = request.json
    if not data:
        return jsonify({"error": "Request body is empty"}), 400
    with settings_lock:
        for el in data.keys():
            if data[el]:
                if (type(data[el]) == list and data[el][0] == -1): continue
                settings[el] = data[el]
    event_queue.put({"event": "settings_update"})
    return jsonify({"status": "success"}), 200

@app.route('/api/settings', methods=['GET'])
def get_settings():
    return jsonify(settings), 200

# ---------- 9. Контроль над нейронкой ----------

@app.route('/api/ai/start', methods=['POST'])
def start_ai():
    with model_lock:
        with settings_lock:
            if model.model_name != MODELS[settings["model_name"]]:
                model.model_name = MODELS[settings["model_name"]]
            if model.division_type != settings["division_type"]:
                model.division_type = settings["division_type"]
        model.load()


@app.route('/api/ai/stop', methods=['POST'])
def stop_ai():
    model.unload()

if __name__ == '__main__':
    # Запуск Flask-приложения в режиме отладки.
    load_settings_json()
    app.run(debug=True, port=5000)