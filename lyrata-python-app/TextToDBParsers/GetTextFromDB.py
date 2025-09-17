from DataBaseAPI import db_api

def get_text(db:db_api, document_id:int):
    """
    Складывает из идентификатора документа чистый текст без форматирования с метками блоков-носителей

    `db` - база данных\n
    `document_id` - уникальный идентификатор документа

    Returns:
            `text` - сложенный воедино чистый текст без форматирования\n
            `parts` - разбиение. Массив с элементами: {id: integer, positions: [integer, integer]}
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