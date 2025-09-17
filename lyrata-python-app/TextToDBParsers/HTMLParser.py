from DataBaseAPI import db_api
from pathlib import Path
from .HTMLPusher import push_html

def parse_html(db: db_api, file:str | Path = None, html:str = None):
    """
    Берёт путь к html или сам текст html вместе с названием и добавлет его в базу данных. Имя ставится в соответствии с названием файла и переписывается, если в head есть title

    `db` - база данных\n
    `file` - путь в виде строки или Path, а при наличии html - название\n
    `html` - текст в виде html
    """
    if file is not None and html is None:
        if type(file) == str:file = Path(file)
        if file.suffix != '.html': raise TypeError("TextParsers->parse_html: File type didn't match html")
        with open(file, 'r', encoding='utf-8') as f:
            html = f.read()
            ind = db.add_document(file.stem)
            title = push_html(db, ind, html)
            if title: db.update_document(ind, title)
    elif html is not None:
        if file is None: file = 'unnamed'
        ind = db.add_document(file.stem)
        title = push_html(db,ind,html)
        if title: db.update_document(ind, title)