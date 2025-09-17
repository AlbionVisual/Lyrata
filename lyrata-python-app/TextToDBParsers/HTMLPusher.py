from bs4 import BeautifulSoup
from DataBaseAPI import db_api
from json import dumps

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