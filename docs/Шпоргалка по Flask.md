# Работа с Flask

### Простейшее приложение на Flask

Создайте файл `app.py` и добавьте следующий код:

```python
from flask import Flask

app = Flask(__name__)  # Создаём экземпляр приложения Flask

@app.route('/')  # Декоратор для маршрута (URL) "/"
def home():
    return "Привет, это Flask!"

if __name__ == '__main__':
    app.run(debug=True)  # Запускаем сервер в режиме отладки
```

- **Пояснение**:
  - `Flask(__name__)` — создаёт приложение Flask.
  - `@app.route('/')` — определяет, что при обращении к корневому URL (`/`) будет вызвана функция `home()`.
  - `app.run(debug=True)` — запускает локальный сервер на `http://127.0.0.1:5000`.

Запустите приложение:

```bash
python app.py
```

Откройте браузер и перейдите по адресу `http://127.0.0.1:5000`. Вы увидите текст: **"Привет, это Flask!"**.

### Создание API с Flask

Flask часто используется для создания REST API, чтобы передавать данные на фронтенд (например, React). Пример API:

```python
from flask import Flask, jsonify

app = Flask(__name__)

# Пример данных
users = [
    {"id": 1, "name": "Алексей"},
    {"id": 2, "name": "Мария"}
]

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(users)  # Возвращает JSON

if __name__ == '__main__':
    app.run(debug=True)
```

- **Что происходит**:
  - Маршрут `/api/users` возвращает список пользователей в формате JSON.
  - `jsonify` преобразует Python-словарь в JSON.

Проверьте API, перейдя по `http://127.0.0.1:5000/api/users`. Вы увидите JSON:

```json
[
  { "id": 1, "name": "Алексей" },
  { "id": 2, "name": "Мария" }
]
```

### Добавление CORS (для связи с React)

React будет работать на другом порту (например, 3000), а Flask — на 5000. Чтобы избежать проблем с политикой CORS (межсайтовые запросы), установите модуль `flask-cors`:

```bash
pip install flask-cors
```

Добавьте CORS в код:

```python
from flask import Flask, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Разрешаем CORS для всех маршрутов

users = [
    {"id": 1, "name": "Алексей"},
    {"id": 2, "name": "Мария"}
]

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(users)

if __name__ == '__main__':
    app.run(debug=True)
```

Теперь Flask готов взаимодействовать с React.

## Часть 2: Создание фронтенда на React

**React** — это библиотека JavaScript для создания пользовательских интерфейсов. Мы настроим React-приложение, которое будет получать данные с Flask API.

### Получение данных с Flask API

Мы создадим компонент React, который делает запрос к Flask API и отображает список пользователей.

1. Установите библиотеку `axios` для HTTP-запросов:

   ```bash
   npm install axios
   ```

2. Создайте файл `src/App.js` с следующим кодом:

```jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

function App() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    // Запрос к Flask API
    axios
      .get("http://127.0.0.1:5000/api/users")
      .then((response) => {
        setUsers(response.data); // Сохраняем данные в состояние
      })
      .catch((error) => {
        console.error("Ошибка при загрузке данных:", error);
      });
  }, []); // Пустой массив зависимостей — запрос выполняется один раз при загрузке

  return (
    <div>
      <h1>Пользователи</h1>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

- **Пояснение**:
  - `useState` — хранит список пользователей.
  - `useEffect` — выполняет запрос к Flask API при загрузке компонента.
  - `axios.get` — отправляет GET-запрос к `http://127.0.0.1:5000/api/users`.
  - Данные отображаются в виде списка.

### Запуск

1. Запустите Flask-сервер:
   ```bash
   python app.py
   ```
2. Запустите React-приложение:
   ```bash
   npm start
   ```

Откройте `http://localhost:3000` в браузере. Вы увидите список пользователей: **Алексей, Мария**.

---

### Получение данных с Flask API

Мы создадим компонент React, который делает запрос к Flask API и отображает список пользователей. Для HTTP-запросов мы будем использовать встроенный API `fetch`.

Создайте файл `src/App.js` с следующим кодом:

```jsx
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    // Запрос к Flask API с использованием fetch
    fetch("http://127.0.0.1:5000/api/users")
      .then((response) => response.json())
      .then((data) => setUsers(data))
      .catch((error) => console.error("Ошибка при загрузке данных:", error));
  }, []); // Пустой массив зависимостей — запрос выполняется один раз при загрузке

  const addUser = async () => {
    const newUser = { id: users.length + 1, name };
    try {
      const response = await fetch("http://127.0.0.1:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        throw new Error("Ошибка при добавлении пользователя");
      }
      setUsers([...users, newUser]); // Обновляем локальный список
      setName(""); // Очищаем поле ввода
    } catch (error) {
      console.error("Ошибка:", error);
    }
  };

  return (
    <div className="App">
      <h1>Пользователи</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Введите имя"
      />
      <button onClick={addUser}>Добавить</button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

- **Пояснение**:
  - `fetch` используется вместо `axios` для выполнения GET- и POST-запросов.
  - Для GET-запроса мы вызываем `fetch('http://127.0.0.1:5000/api/users')`, преобразуем ответ в JSON с помощью `response.json()` и сохраняем данные в состояние.
  - Для POST-запроса мы используем `fetch` с параметрами `method`, `headers` и `body`, где `body` содержит JSON-строку нового пользователя.
  - Обработка ошибок осуществляется через `try/catch` и проверку `response.ok`.

## Часть 3: Расширенные возможности и советы

### 1. Добавление POST-запросов

Чтобы отправлять данные с React на Flask (например, добавлять нового пользователя), добавьте маршрут в Flask:

```python
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

users = [
    {"id": 1, "name": "Алексей"},
    {"id": 2, "name": "Мария"}
]

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(users)

@app.route('/api/users', methods=['POST'])
def add_user():
    new_user = request.get_json()  # Получаем JSON из запроса
    users.append(new_user)
    return jsonify({"message": "Пользователь добавлен", "user": new_user}), 201

if __name__ == '__main__':
    app.run(debug=True)
```

Добавьте форму в React для отправки данных (`src/App.js`):

```jsx
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    // Запрос к Flask API с использованием fetch
    fetch("http://127.0.0.1:5000/api/users")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ошибка при загрузке данных");
        }
        return response.json();
      })
      .then((data) => setUsers(data))
      .catch((error) => console.error("Ошибка:", error));
  }, []); // Пустой массив зависимостей — запрос выполняется один раз при загрузке

  const addUser = async () => {
    const newUser = { id: users.length + 1, name };
    try {
      const response = await fetch("http://127.0.0.1:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        throw new Error("Ошибка при добавлении пользователя");
      }
      setUsers([...users, newUser]); // Обновляем локальный список
      setName(""); // Очищаем поле ввода
    } catch (error) {
      console.error("Ошибка при добавлении:", error);
    }
  };

  return (
    <div>
      <h1>Пользователи</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Введите имя"
      />
      <button onClick={addUser}>Добавить</button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

Теперь вы можете добавлять новых пользователей через форму.

## Часть 4: Пример полной интеграции

### Flask backend (`backend/app.py`):

```python
from flask import Flask, jsonify, request
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

users = [
    {"id": 1, "name": "Алексей"},
    {"id": 2, "name": "Мария"}
]

@app.route('/api/users', methods=['GET'])
def get_users():
    return jsonify(users)

@app.route('/api/users', methods=['POST'])
def add_user():
    new_user = request.get_json()
    users.append(new_user)
    return jsonify({"message": "Пользователь добавлен", "user": new_user}), 201

if __name__ == '__main__':
    app.run(debug=True)
```

### React frontend (`frontend/src/App.js`):

```jsx
import React, { useState, useEffect } from "react";
import "./App.css";

function App() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");

  useEffect(() => {
    // Запрос к Flask API с использованием fetch
    fetch("http://127.0.0.1:5000/api/users")
      .then((response) => {
        if (!response.ok) {
          throw new Error("Ошибка при загрузке данных");
        }
        return response.json();
      })
      .then((data) => setUsers(data))
      .catch((error) => console.error("Ошибка:", error));
  }, []); // Пустой массив зависимостей — запрос выполняется один раз при загрузке

  const addUser = async () => {
    const newUser = { id: users.length + 1, name };
    try {
      const response = await fetch("http://127.0.0.1:5000/api/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newUser),
      });
      if (!response.ok) {
        throw new Error("Ошибка при добавлении пользователя");
      }
      setUsers([...users, newUser]); // Обновляем локальный список
      setName(""); // Очищаем поле ввода
    } catch (error) {
      console.error("Ошибка при добавлении:", error);
    }
  };

  return (
    <div>
      <h1>Пользователи</h1>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Введите имя"
      />
      <button onClick={addUser}>Добавить</button>
      <ul>
        {users.map((user) => (
          <li key={user.id}>{user.name}</li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

### CSS (`frontend/src/App.css`):

```css
.App {
  text-align: center;
  max-width: 600px;
  margin: 0 auto;
  padding: 20px;
}

input {
  padding: 10px;
  margin-right: 10px;
}

button {
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

ul {
  list-style: none;
  padding: 0;
}

li {
  padding: 10px;
  border-bottom: 1px solid #ddd;
}
```
