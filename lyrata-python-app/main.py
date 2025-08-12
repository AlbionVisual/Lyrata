# ----- SPACY DIVISION TEST -----
# import spacy

# nlp = spacy.load("ru_core_news_sm")

# def text_to_doc(text: str):
#     return nlp(text)

# if __name__ == "__main__":
#     text = """Привет, мир! Как дела?
#     Новый абзац, как ты будешь обозначаться?"""
#     doc = text_to_doc(text)
#     print(doc.text) # Доступ к исходному тексту документа

#     # Итерация по токенам
#     for token in doc:
#         print(f"Токен: '{token.text}'")
#         # Доступ к атрибутам токена:
#         print(f"  Лемма: {token.lemma_}") # Базовая форма слова
#         print(f"  Часть речи (Universal): {token.pos_}")
#         print(f"  Часть речи (Treebank): {token.tag_}")
#         print(f"  Зависимость: {token.dep_}") # Синтаксическая зависимость
#         print(f"  Является ли стоп-словом: {token.is_stop}")
#         print(f"  Является ли пунктуацией: {token.is_punct}")
#         print(f"  Начальный индекс символа (offset): {token.idx}")
#         print(f"  Конечный индекс символа (offset): {token.idx + len(token.text)}")

#     # Итерация по предложениям
#     for sent in doc.sents:
#         print(f"Предложение: '{sent.text}'")
#         print(f"  Начальный индекс символа (offset): {sent.start_char}")
#         print(f"  Конечный индекс символа (offset): {sent.end_char}")

#     # Итерация по именованным сущностям (если есть)
#     for ent in doc.ents:
#         print(f"Сущность: '{ent.text}'")
#         print(f"  Тип сущности: {ent.label_}")
#         print(f"  Начальный индекс символа (offset): {ent.start_char}")
#         print(f"  Конечный индекс символа (offset): {ent.end_char}")

# ----- DATABASE API TEST -----
from pprint import pprint as print
import os.path as path
import DataBaseAPI
db = DataBaseAPI.db_api(path.abspath("my_database.db"))
b = 'non exit'
while b != 'exit' and b != '':
    b = input('next move: ')
    ans = b.split()
    try:
        if ans[0] == 'list':
            print(db.get_documents())
        elif ans[0] == 'show':
            print(db.get_sorted_document(int(ans[1]), int(ans[2]) if ans[2] != "None" else None, int(ans[3]) if ans[3] != "None" else None))
        elif ans[0] == 'add_doc':
            db.add_document(ans[1])
        elif ans[0] == 'delete_doc':
            db.delete_document(int(ans[1]))
        elif ans[0] == 'update_doc':
            db.update_document(int(ans[1]), ans[2])
        elif ans[0] == 'add_block':
            db.add_document_content(int(ans[1]), 'unknown', parent_id=int(ans[2]) if ans[2] != 'None' else None, order_in_parent=int(ans[3]) if ans[3] != 'None' else None)
        elif ans[0] == 'delete_block':
            db.delete_block(int(ans[1]))
        elif ans[0] == 'update_block':
            db.update_block(int(ans[1]), new_block_type=ans[2], new_attrs_json='updated block')
        else:
            print("I don't know this command, try again or 'exit' to stop")
    except TypeError as e:
        print(f'TypeError, try again... {e}')
    except IndexError as e:
        print(f'List index out of range, try again! {e}')