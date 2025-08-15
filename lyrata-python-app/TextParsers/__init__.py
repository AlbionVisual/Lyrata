import markdown
from bs4 import BeautifulSoup
import re
from DataBaseAPI import db_api
from pathlib import Path
from json import dumps, loads

def parse_md(file:str | Path)->str:
    """
    Получает markdown файл и преобразует его в html.

    `file` - путь к файлу

    Returns:
            'html_result' - строка html
    """
    res = ''
    if type(file) == str:file = Path(file)
    with open(file, 'r', encoding='utf-8') as f:
        res = f.read()
        res = re.sub(r"([^\n])\n\s*([^\n])", r"\1\n\n\2", res)
        res = markdown.markdown(res, extensions=[
            'fenced_code',
            'tables',
            'attr_list',
            'footnotes',
            'sane_lists',
        ])
    return res

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

def push_html( db: db_api, document_id:int, html:str):
    """
    Html текст заносит в базу данных сохраняя данные атрибутов, типов тегов, но ориентируясь впервую очередь на body, если таковой есть.

    `db` - база данных для заноса текста\n
    `document_ind` - индекс документа, под которым сохранять блоки\n
    `html` - текст для вноса в базу данных

    Returns:
            'title' - название внутри html переданное при помощи head
    """
    
    soup = BeautifulSoup(html, 'html.parser')
    title = soup.title.contents[0] if soup.title else ''
    if title == '' or type(title) is not str: title = None

    def parse_block(el, parent_id = None):

        if el == '\n': return
        tag = el.name
        attrs = '{}'
        if tag is not None: attrs = dumps(el.attrs, ensure_ascii=False)

        text = ''
        if tag is None:
            tag = 'text'
            text = el
        
        ind = db.add_document_content(document_id, tag,parent_id=parent_id, attrs_json=attrs,content_json=text)
        if tag != 'text':
            for child in el.children:
                parse_block(child, ind)
    
    lst = soup.body.children if soup.body else soup.children
    for el in lst:
        parse_block(el)
    
    return title

def read_file(file: str | Path, db: db_api):
    if type(file) == str:file = Path(file)
    html = ''
    with db:
        if file.suffix == '.txt' or file.suffix == '.md':
            html = parse_md(file)
            parse_html(db, file, html)
        elif file.suffix == '.html':
            parse_html(db, file)

def get_text(db:db_api, document_id:int)->str:
    """
    Складывает из идентификатора документа чистый текст без форматирования с метками блоков-носителей

    `db` - база данных\n
    `document_id` - уникальный идентификатор документа

    Returns:
            `text` - сложенный воедино чистый текст без форматирования
            `parts`
    """
    res = ''
    ind = 0
    blocks = db.get_sorted_document(document_id)
    parts = []
    # (0: id, 1:document_id, 2: parent_id, 3: order_in_parent, 4: type, 5: attrs_json, 6: data_json, 7: content_json, 8: depth)
    for block in blocks:
        if block[4] == 'p':
            if len(res) == 0:
                res += '\t'
                ind += 1
            else:
                res += '\n\t'
                ind += 2
        elif block[4] == 'text':
            res += block[7]
            parts += [{'id': block[0], 'positions': [ind, ind + len(block[7])]}]
            ind += len(block[7])
    
    return res, parts