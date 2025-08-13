import sqlite3
import os.path as path

class db_file:
    def __init__(self, db_path: str):
        """
        Инициализация по названию или путю файла

        `db_path` - путь или название файла (добавляется database.db в случае неверного формата, либо указания только директории)
        """
        if not path.exists(db_path):
            if not path.exists(path.dirname(db_path)):
                raise ValueError("Directory name does not exists!")
        if path.isdir(db_path): db_path = path.join(db_path, "database.db")
        if path.basename(db_path)[-3:] != ".db":
            db_path = path.join(path.dirname(db_path), "database.db")
        self.path = db_path
        self.deepness = 0
        
    def __enter__(self):
        """
        Удобная фнукциональность при помощи блока `with ... as ...:`. Создаёт подключение к базе данных, а также курсор
        
        Returns:
                `cursor` - курсор к базе данных для получения через `with ... as cursor:`
        """
        self.deepness += 1
        if self.deepness > 1:
            return self.cursor
        self.db = sqlite3.connect(self.path)
        self.cursor = self.db.cursor()
        self.cursor.execute("PRAGMA foreign_keys = ON;")
        return self.cursor
    
    def __exit__(self, exc_type, exc_val, exc_tb):
        """
        Парный метод к методу __enter__ для закрытия with ... as ... Закрывает подключение, предварительно откатив изменения (если были ошибки), либо приняв изменения

        `exc_type` - тип ошибки, если таковая есть\n
        `exc_val` - значение ошибки, если таковая есть\n
        `exc_tb` - ?
        """
        self.deepness -= 1
        if self.deepness <= 0:
            self.deepness = 0
            if exc_type:
                print(f"An exception occurred: {exc_val}")
                self.db.rollback()
            else:
                self.db.commit()
            self.db.close()