from AiTextProcessing import analise_document as external_analiser
from flask import Flask, Response, request, jsonify, g
from TextParsers import get_text, read_file
from DataBaseAPI import db_api
from flask_cors import CORS
import queue
import time
import json

# ---------- 0. Помощники ----------

event_queue = queue.Queue()

app = Flask(__name__)
CORS(app) # Инициализируем CORS для всего приложения. По умолчанию разрешает все источники.

def get_db():
    if 'db' not in g:
        g.db = db_api("F:\Projects\Lyrata\my_database.db")
    return g.db

@app.teardown_request
def close_connection(exception):
    g.pop('db', None)

def generate_queued_events():
    while True:
        try:
            event_data = event_queue.get(timeout=1) # {event: "document1", data: {}}
            if "data" not in event_data: event_data['data'] = {}
            print(f"event:{event_data['event']}\\ndata:{json.dumps(event_data['data'])}\\n\\n")
            # Типы ивентов: documents_table_update, document_update
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

# @app.route('/api/database/document_text/<int:document_id>', methods=['GET'])
# def get_document_text(document_id):
#     db = get_db()
#     text, parts = get_text(db, document_id)
#     if text:
#         return jsonify({
#             "text": text,
#             "parts": parts
#         })
#     else:
#         print('get_document: Wrong id provided')
#         return jsonify({"error": f"Документ с ID {document_id} не найден."}), 404

@app.route('/api/database/document/<int:document_id>', methods=['GET'])
def get_document(document_id):
    db = get_db()
    blocks = db.get_sorted_document(document_id)
    if blocks:
        return jsonify(blocks)
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
def analise_document(document_id):
    try:
        data = request.json
        division_type = 'sentence'
        analise_type = 'mixed'
        if data and data['division_type']:
            division_type = data['division_type']
        if data and data['analise_type']:
            analise_type = data['analise_type']
        db = get_db()
        external_analiser(document_id, db, division_type=division_type, analise_type=analise_type)
        event_queue.put({"event": "document_update", "data": {"document_id": document_id}})
        return jsonify({"status":"success"}), 200
    except:
        return jsonify({"status":"error", "message": "sth went wrong"}), 400
    

if __name__ == '__main__':
    # Запуск Flask-приложения в режиме отладки.
    app.run(debug=True, port=5000)