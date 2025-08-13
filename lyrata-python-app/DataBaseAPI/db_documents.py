from .sql_commands import *
from datetime import datetime
from .db_file import db_file

class db_documents(db_file):

    def __init__(self, *args, **key_args):
        super().__init__(*args, **key_args)
        self.check_path()

    def check_path(self):
        """
        Пытается открыть базу данных и посмотреть наличие нужных таблиц. Если какой-то нету, то она создаётся
        """
        doc_exists = None
        with self as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='documents'")
            doc_exists = cursor.fetchone()
        if doc_exists is None:
            with self as cursor:
                cursor.execute(create_table_documents)
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_documents_name ON documents (name);")
                cursor.execute("CREATE INDEX IF NOT EXISTS idx_documents_updated_at ON documents (updated_at DESC);")

        blocks_exists = None
        with self as cursor:
            cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name='blocks'")
            blocks_exists = cursor.fetchone()
        if blocks_exists is None:
            with self as cursor:
                cursor.execute(create_table_blocks)
                cursor.execute("CREATE INDEX idx_blocks_document_id ON blocks (document_id);")
                cursor.execute("CREATE INDEX idx_blocks_parent_id_order ON blocks (parent_id, order_in_parent);")

    def get_documents(self):
        """
        Делает запрос на получение всех документов, хранящихся в базе данных

        Returns:
                `documents` - массив кортежей, содержащий все строки таблицы `documents`
        """
        res = None
        with self as cursor:
            cursor.execute("SELECT * FROM documents")
            res = cursor.fetchall()
        return res
    
    def add_document(self, name:str, author: str = "Lyrata"):
        """
        Добавляет новый документ с указанным именем, а также автором

        `name` - имя нового документа\n
        `author` - автор нового документа (по умолчанию 'Lyrata')

        Returns:
                `id` - идентификатор вновь добавленного блока
        """
        time = str(datetime.now())
        res = -1
        with self as cursor:
            cursor.execute("INSERT INTO documents ('name', 'author', 'created_at', 'updated_at') VALUES (?, ?, ?, ?)", (name, author, time, time))
            cursor.execute("SELECT id FROM documents WHERE created_at = ? AND name = ?", (time,name))
            res = cursor.fetchone()[0]
        return res

    def delete_document(self, id: int):
        """
        Пытается удалить документ по указанному id. Все блоки и подблоки этого документа также будут удалены

        `id` - уникальный идентификатор строки базы данных, описывающей целевой документ
        """
        with self as cursor:
            cursor.execute("DELETE FROM documents WHERE id = ?", (id, ))
    
    def update_document(self, id:int, name:str = None, author:str = None):
        """
        Обновляет имя, либо автора документа, если таковые аргументы предоставлены. Всегда обновляет время последнего изменения

        `id` - уникальный идентификатор целевого документа\n
        `name` - новое имя, либо None, если его обновлять не надо (по умолчанию None)\n
        `author` - новый автор, либо None, если его обновлять не надо (по умолчанию None)
        """
        if (type(id) is not int): raise TypeError("db_api->update_document: You need to provide at least document's id!")
        time = str(datetime.now())
        with self as cursor:
            if (name):
                cursor.execute("UPDATE documents SET name = ? WHERE id = ?", (name, id))
            if (author):
                cursor.execute("UPDATE documents SET author = ? WHERE id = ?", (author, id))
            cursor.execute("UPDATE documents SET updated_at = ? WHERE id = ?", (time, id))
        