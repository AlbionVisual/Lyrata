from .db_documents import db_documents

class db_document_with_change_methods(db_documents):
    def add_document_content(self, document_id, block_type, *, parent_id:int = None, order_in_parent: int = None, attrs_json:str = None, data_json:str = None, content_json:str = None):
        """
        Пытается добавить элемент в какой-то документ по идентификатору

        `document_id` - идентификатор документа\n
        `block_type` - тип блока\n
        \*\n
        `parent_id` - идентификатор родителя, если таковой есть (иначе None) (по умолчанию None)\n
        `order_in_parent` - Позиция относительно братьев в дереве. Если не установлена (None), то выбирается автоматически. Если установлена, то сдвигает все элементы (по умолчанию None)\n
        `attrs_json` - JSON-строка, содержащая стили (по умолчанию None)\n
        `data_json` - JSON-строка, содержащая данные (по умолчанию None)\n
        `content_json` - JSON-строка, содержащая текст (по умолчанию None)\n
        """
        if document_id is None or block_type is None:
            raise TypeError("db_api->add_document_content: You need to provide two string arguments at least (document_id, type)")
        if order_in_parent is None:
            order_in_parent = 1
            with self as cursor:
                if parent_id is not None:
                    cursor.execute('SELECT order_in_parent FROM blocks WHERE document_id = ? AND parent_id = ?', (document_id,parent_id))
                else:
                    cursor.execute('SELECT order_in_parent FROM blocks WHERE document_id = ? AND parent_id IS NULL', (document_id,))
                ans = cursor.fetchall()
                if ans:
                    order_in_parent = max([el[0] for el in ans]) + 1
        elif type(order_in_parent) is not int: raise TypeError("db_api->add_document_content: order_in_parent must be integer!")
        res = -1
        with self as cursor:
            cursor.execute("UPDATE blocks SET order_in_parent = order_in_parent + 1 WHERE (parent_id = ? or parent_id IS NULL AND ? IS NULL) AND order_in_parent >= ?", (parent_id, parent_id, order_in_parent))
            cursor.execute("INSERT INTO blocks (document_id, type, order_in_parent, parent_id, attrs_json, data_json, content_json) VALUES (?, ?, ?, ?, ?, ?, ?)", (document_id, block_type, order_in_parent, parent_id,attrs_json, data_json, content_json))
            cursor.execute("SELECT id FROM blocks WHERE document_id = ? AND (parent_id = ? or parent_id IS NULL AND ? IS NULL) AND type = ?", (document_id, parent_id, parent_id, block_type))
            lst = cursor.fetchall()
            if len(lst) == 0: raise ValueError("db_document_with_change_methods->add_document_content: unexpected error, element wasn't found")
            res = lst[-1][0]
        self.update_document(document_id)
        return res

    def update_block(self, block_id:int,*,new_block_type:str = None, new_attrs_json:str = None, new_data_json:str = None, new_content_json:str = None):
        """
        Пытается обновить элемент `blocks` по его идентификатору. Если все аргументы обновления None, то бросается ошибка

        `block_id` - идентификатор целевого блока\n
        \*\n
        `new_block_type` - новый тип блока (по умолчанию None)\n
        `new_attrs_json` - обновлённая JSON-строка, содержащая стили (по умолчанию None)\n
        `new_data_json` - обновлённая JSON-строка, содержащая данные (по умолчанию None)\n
        `new_content_json` - обновлённая JSON-строка, содержащая текст (по умолчанию None)\n
        """
        if type(block_id) is not int or (type(new_block_type) is not str and type(new_attrs_json) is not str and type(new_data_json) is not str and type(new_content_json) is not str): raise TypeError("You need to provide at least block_id as integer and one new string parameter")
        ans = None
        with self as cursor:
            if (new_block_type):
                cursor.execute('UPDATE blocks SET type = ? WHERE id = ?', (new_block_type, block_id))
            if (new_attrs_json):
                cursor.execute('UPDATE blocks SET attrs_json = ? WHERE id = ?', (new_attrs_json, block_id))
            if (new_content_json):
                cursor.execute('UPDATE blocks SET content_json = ? WHERE id = ?', (new_content_json, block_id))
            if (new_data_json):
                cursor.execute('UPDATE blocks SET data_json = ? WHERE id = ?', (new_data_json, block_id))
            cursor.execute("SELECT document_id FROM blocks WHERE id = ?", (block_id,))
            ans = cursor.fetchone()[0]
        self.update_document(ans)

    def delete_block(self, block_id:int):
        """
        Пытается удалить блок с указанным идентификатором

        `block_id` - уникальный идентификатор удаляемого блока
        """
        if (type(block_id) is not int): raise TypeError("db_api->delete_block: You need to provide at least block's id")
        ans = None
        with self as cursor:
            cursor.execute("SELECT order_in_parent, parent_id, document_id FROM blocks WHERE id = ?", (block_id,))
            ans = cursor.fetchone()
            cursor.execute("DELETE FROM blocks WHERE id = ?", (block_id, ))
            cursor.execute("UPDATE blocks SET order_in_parent = order_in_parent - 1 WHERE order_in_parent >= ? AND (parent_id = ? or parent_id IS NULL AND ? IS NULL)",(ans[0], ans[1], ans[1]))
        self.update_document(ans[2])