from DataBaseAPI import db_api
from json import dumps

def update_data(db: db_api, poses, results, labels):
    # Записываем обратно в базу данных
    poses_ind = 0
    paragraph_data = {}
    with db: # Делаем всё единой транзакцией

        for span in results.keys(): # Для каждого промежутка
            while poses[poses_ind]['positions'][1] < span[0]: # Сопоставление
                poses_ind+=1
                db.update_block(poses[poses_ind]['id'], new_data_json=dumps(None))
                paragraph_data = {}

            # Вставка
            paragraph_data[max(span[0] - poses[poses_ind]['positions'][0], 0)] = [labels[results[span]]]
            # print(paragraph_data)
            db.update_block(poses[poses_ind]['id'], new_data_json=dumps(paragraph_data))
        
        while poses_ind < len(poses) - 1: # Обнуляем все оставшиеся
                poses_ind+=1
                db.update_block(poses[poses_ind]['id'], new_data_json=dumps(None))