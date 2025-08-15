from .classify_text import text_list_check, mix_batches, print_results, paragraph_divider,sentence_divider
from DataBaseAPI import db_api
from TextParsers import get_text
from json import dumps

def analise_document(document_id: int, db: db_api,*, division_type: str = "sentence", analise_type = 'mixed'):
    """
    Берёт предложенный текст из базы данных, делит его на части способом `division_type` и пропускает через нейросеть способом `analise_type`. Результат записывается обратно в базу данных в поле `data_json`.
    
    `document_id` - идентификатор документа в базе данных\n
    `db` - база данных\n
    \*\n
    `division_type` - тип разделения текста для анализа: по предложениям ("sentence" | "s" - по умолчанию), либо по абзацам ("paragraph" | "p"), остальные значения вызовут ошибку\n
    `analise_type` - тип анализа текста: по одному элементу ("single"), с учётом соседей ("batched"), усреднённый по двум предыдущим ("mixed" - по умолчанию)
    """

    # Извлечение текста
    text, poses = get_text(db, document_id)
    text_list = None
    spans = None
    if text == '' or document_id is None: raise ValueError("AiTextProcessing->analise_document: you need to provide valid document_id")
    
    # Извлечение текста с соответствующим типом
    if division_type[0] == "s":
        text_list, spans = sentence_divider(text)
    elif division_type[0] == "p":
        text_list, spans = paragraph_divider(text)
    else: raise ValueError("AiTextProcessing->analise_document: unknown division type (you can pass only 'sentence' or 'paragraph')")
    
    # Сам анализ текста с соответствующим типом
    weights = {0:1}
    if analise_type == "mixed":
        weights = {0:1, 3:1}
    elif analise_type == "batched":
        weights = {3:1}
    res = mix_batches(text_list, weights)

    # Запись данных обратно в базу данных
    poses_ind = 0
    paragraph_data = {}
    with db: # Делаем всё единой транзакцией

        for i, span in enumerate(spans): # Пока вставляем элементы всегда, независимо от значений
            while poses[poses_ind]['positions'][1] < span[0]: # Сопоставление
                poses_ind+=1
                paragraph_data = {}

            temp = {} # Выборка данных для вставки в поле
            for i, val in enumerate(res[i]):
                temp[val] = ['aggression', 'anxiety', 'sarcasm', 'positive', 'normal'][i]
            values = [el for el in sorted(temp) if el > 0.1]
            result = [temp[el] for el in values]

            # Вставка
            paragraph_data[max(span[0] - poses[poses_ind]['positions'][0], 0)] = result
            db.update_block(poses[poses_ind]['id'], new_data_json=dumps(paragraph_data))