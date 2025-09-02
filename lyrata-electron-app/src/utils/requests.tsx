function db_fetch(url: string, data: any, method: string) {
  fetch("http://localhost:5000/api/" + url, {
    method: method, // Указываем метод POST
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

export function db_save(url: string, post_data: any = {}) {
  db_fetch(url, post_data, "POST");
}

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

export function db_analise(document_id: number) {
  db_save(`database/document/${document_id}/analise`);
}
