import json
from .sql_commands import *
from .db_document_with_change_methods import db_document_with_change_methods

class db_api(db_document_with_change_methods):
    def get_document_content(self, id: int | str):
        """
        Пытается получить все блоки данного документа в возрастающем порядке сначала parent_id, а затем order_in_parent

        `id` - строка-имя документа, либо уникальный идентификатор

        Returns:
                `blocks` - список блоков приписанных к этому документу в отсортированном порядке
        """
        if type(id) == str:
            res = []
            with self as cursor:
                cursor.execute("SELECT id FROM documents WHERE name = ?", (id,))
                id = cursor.fetchone()
        if type(id) is not int: raise TypeError("db_api->get_document_content: You need to provide integer id!")
        res = []
        with self as cursor:
            cursor.execute("SELECT * FROM blocks WHERE document_id = ? ORDER BY parent_id ASC, order_in_parent ASC", (id,))
            res = cursor.fetchall()
        return res
    
    def get_sorted_document_python(self, id: int | str):
        """
        Получает все блоки данного документа в правильно порядке благодаря python, не берёт часть, только весь документ

        `id` - строка-имя документа, либо уникальный идентификатор

        Returns:
                `block_array` - список блоков приписанных к этому документу в полностью отсортированном при помощи python порядке
        """
        raw = self.get_document_content(id)
        parents = {None:0}
        prev = None
        for i, block in enumerate(raw):
            if block[2] not in parents:
                parents[prev] = (parents[prev],i)
                prev = block[2]
                parents[block[2]] = i
        else:
            parents[prev] = (parents[prev], len(raw))
        
        res = []
        def add_all_children(id):
            nonlocal res
            if id not in parents: return
            for i in range(*parents[id]):
                res += [raw[i]]
                add_all_children(raw[i][0])
        add_all_children(None)

        return res

    def get_sorted_document(self, id: int, offset:int = None, amount:int = None):
        """
        Получает все блоки данного документа в правильном порядке благодаря sql-запросу. Если указано и offset, и amount запрос будет брать amount элементов и добавит некоторое количество блоков родителей, не включённых в изначальный запрос, но имеющих ссылки в основных блоках

        `id` - уникальный идентификатор документа\n
        `offset` - сколько первых блоков не учитывать сначала\n
        `amount` - сколько целевых блоков взять сначала

        Returns:
                `block_array` - список блоков приписанных к этому документу в полностью отсортированном при помощи sql-запроса порядке. Один блок - кортеж вида: (id, document_id, parent_id, order_in_parent, type, attrs_json, data_json, content_json, depth)
        """
        if type(id) is not int: raise TypeError("db_ast->get_sorted_document: You must provide integer value")
        res = None
        with self as cursor:
            if amount is not None and offset is not None:
                cursor.execute(sql_commands.hierarchichal_sort_with_range, (id, id, amount, offset))
            else:
                cursor.execute(sql_commands.hierarchichal_sort, (id,id))
            res = cursor.fetchall()
        for i, block in enumerate(res):
            res[i] = [*block[:5], json.loads(block[5]) if block[5] is not None else None, json.loads(block[6]) if block[6] is not None else None, *block[7:]]
        return res

def get_text(document: list[tuple])->str:
    """
    Из отсортированного списка блоков получает текст, объединяя все блоки с типом text

    `document` - правильно отсортированный список блоков

    Returns:
            `text` - результирующая строка
    """
    text = ''
    for el in document:
        if el[4] == 'text': text += el[7]
    return text

if __name__ == "__main__":
    from pprint import pprint as print
    import os.path as path
    db = db_api(path.abspath("my_database.db"))
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