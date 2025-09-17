/**
 * Функция, позволяющая отправлять простые запросы в базу данных с указанными параметрами.
 *
 * @param url Путь, по которому поступит запрос (продолжение `http://localhost:5000/api/`)
 * @param data Данные, которые нужно передать в запрос
 * @param method Метод запроса. `POST` / `PUT` / `GET` / `DELETE`
 */
function db_fetch(url: string, data: any, method: string) {
  fetch("http://localhost:5000/api/" + url, {
    method: method, // Указываем метод
    headers: {
      "Content-Type": "application/json", // Обязательно указываем тип контента как JSON
    },
    body: JSON.stringify(data), // Преобразуем объект в JSON-строку
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  });
}

/**
 * Обёртка функции db_fetch для создания публикующего запроса (`POST`) с заданным url и данными.
 *
 * @param url Путь, по которому делается запрос (продолжение `http://localhost:5000/api/`)
 * @param post_data Данные, которые нужно передать с запросом
 */
export function db_save(url: string, post_data: any = {}) {
  db_fetch(url, post_data, "POST");
}

/**
 * Обёртка функции db_fetch для создания обновляющего запроса (`PUT`) с заданным url и данными.
 *
 * @param url Путь, по которому делается запрос (продолжение `http://localhost:5000/api/`)
 * @param put_data Данные, которые нужно передать с запросом
 */
export function db_update(url: string, put_data: any) {
  db_fetch(url, put_data, "PUT");
}

export function db_delete(url: string) {
  fetch("http://localhost:5000/api/" + url, {
    method: "DELETE", // Указываем метод POST
  }).then((response) => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
  });
}

/**
 * Обёртка функции db_save для отправки оповещения на бэк о старте нейросети
 *
 * @param document_id Идентификатор документа для старта работы нейросети
 */
export function db_analise(document_id: number) {
  db_save(`database/document/${document_id}/analise`);
}
