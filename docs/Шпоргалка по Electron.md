## Содержание

1.  [Что такое Electron](#что-такое-electron)
2.  [Сохранение данных в папку приложения](#сохранение-данных-в-папку-приложения)
3.  [HTTP запросы на другой бэкенд](#http-запросы-на-другой-бэкенд)
4.  [Связь между процессами (IPC)](#связь-между-процессами-ipc)
    1.  [Главный процесс (Main Process)](#главный-процесс-main-process)
    2.  [Процессы рендеринга (Renderer Processes)](#процессы-рендеринга-renderer-processes)
    3.  [Зачем нужна связь между процессами](#зачем-нужна-связь-между-процессами)
    4.  [Отправка сообщений из рендерера в главный процесс (односторонняя)](#отправка-сообщений-из-рендерера-в-главный-процесс-односторонняя)
    5.  [Отправка сообщений из главного процесса в рендерер (односторонняя)](#отправка-сообщений-из-главного-процесса-в-рендерер-односторонняя)
    6.  [Двусторонняя связь (запрос-ответ)](#двусторонняя-связь-запрос-ответ)

---

### Что такое Electron

Electron — это фреймворк с открытым исходным кодом, разработанный GitHub, который позволяет создавать кроссплатформенные настольные приложения с использованием веб-технологий: HTML, CSS и JavaScript. Он объединяет в себе движок рендеринга Chromium (используемый в браузере Google Chrome) для отображения пользовательского интерфейса и среду выполнения Node.js для доступа к низкоуровневым системным функциям. Это позволяет веб-разработчикам создавать полноценные настольные приложения, используя уже знакомые им инструменты и навыки.

---

### Сохранение данных в папку приложения

Для настольных приложений часто требуется сохранять пользовательские настройки, кэш или другие данные локально. Electron предоставляет удобные способы доступа к системным путям, что позволяет хранить данные в соответствии с рекомендациями операционной системы.

Electron предоставляет модуль `app`, который позволяет получить различные системные пути. Наиболее полезными для сохранения данных являются:

- `app.getPath('userData')`: Путь к каталогу, предназначенному для хранения пользовательских данных приложения (например, настроек, профилей). Этот путь специфичен для каждого пользователя и операционной системы.
- `app.getAppPath()`: Путь к корневому каталогу вашего приложения. Используется для доступа к ресурсам, поставляемым вместе с приложением.

Для работы с файловой системой внутри этих папок используется встроенный модуль Node.js `fs`.

Пример сохранения и чтения JSON-файла с настройками пользователя в папке `userData`:

```javascript
// main.js (или другой файл главного процесса)
const { app } = require("electron");
const path = require("path");
const fs = require("fs");

// Путь к файлу настроек
const userDataPath = app.getPath("userData");
const settingsFilePath = path.join(userDataPath, "settings.json");

// Функция для сохранения настроек
function saveSettings(settings) {
  try {
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings, null, 2));
    console.log("Настройки успешно сохранены:", settingsFilePath);
  } catch (error) {
    console.error("Ошибка при сохранении настроек:", error);
  }
}

// Функция для загрузки настроек
function loadSettings() {
  try {
    if (fs.existsSync(settingsFilePath)) {
      const data = fs.readFileSync(settingsFilePath, "utf8");
      return JSON.parse(data);
    }
    console.log("Файл настроек не найден, возвращаем настройки по умолчанию.");
    return { theme: "dark", notifications: true }; // Настройки по умолчанию
  } catch (error) {
    console.error("Ошибка при загрузке настроек:", error);
    return { theme: "dark", notifications: true }; // Возвращаем настройки по умолчанию в случае ошибки
  }
}

// Пример использования:
// let currentSettings = loadSettings();
// console.log('Загруженные настройки:', currentSettings);

// currentSettings.theme = 'light';
// saveSettings(currentSettings);
```

---

### HTTP запросы на другой бэкенд

Electron-приложения, особенно их процессы рендеринга, ведут себя как обычные веб-страницы. Это означает, что для выполнения HTTP-запросов к внешним бэкендам (например, к Flask API) можно использовать стандартные веб-API, такие как `fetch` API.

Запросы могут быть выполнены как из **процесса рендеринга** (где находится ваш React-код), так и из **главного процесса**.

**Из процесса рендеринга (ваш React-код):**

Это наиболее распространенный сценарий, так как именно UI-часть приложения взаимодействует с данными. Здесь `fetch` работает точно так же, как в браузере.

```javascript
// renderer.js (или ваш React-компонент)
import React, { useState, useEffect } from "react";

function DataFetcher() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/data"); // Пример запроса к Flask API
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        setData(result);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return <p>Загрузка данных...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;

  return (
    <div>
      <h2>Данные с бэкенда:</h2>
      <p>{data.message}</p>
      <ul>
        {data.items.map((item, index) => (
          <li key={index}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

export default DataFetcher;
```

**Важное замечание о CORS:** Если ваш бэкенд (например, Flask) работает на другом порту или домене, чем ваше Electron-приложение (что часто бывает в процессе разработки, например, Electron на `file://` или `localhost:3000` и Flask на `localhost:5000`), вы столкнетесь с проблемой CORS (Cross-Origin Resource Sharing). Как упоминалось в шпоргалке по Flask, необходимо настроить CORS на стороне бэкенда (например, с помощью `Flask-CORS`) для разрешения запросов с источника вашего Electron-приложения.

**Из главного процесса:**

Главный процесс также может выполнять HTTP-запросы, используя встроенные модули Node.js (`http`, `https`) или сторонние библиотеки (`axios`, `node-fetch`). Это полезно для операций, которые не связаны напрямую с UI или требуют доступа к системным ресурсам.

```javascript
// main.js (пример запроса из главного процесса)
const https = require("https"); // Или http для HTTP

function fetchFromBackendInMainProcess(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        let data = "";
        res.on("data", (chunk) => {
          data += chunk;
        });
        res.on("end", () => {
          try {
            resolve(JSON.parse(data));
          } catch (e) {
            reject(e);
          }
        });
      })
      .on("error", (err) => {
        reject(err);
      });
  });
}

// Пример использования (вызов из другого места в main.js)
// fetchFromBackendInMainProcess('https://jsonplaceholder.typicode.com/todos/1')
//   .then(data => console.log('Данные из главного процесса:', data))
//   .catch(error => console.error('Ошибка в главном процессе:', error));
```

---

### Связь между процессами (IPC)

Electron-приложения работают в многопроцессной архитектуре, вдохновленной Chromium. Это означает, что приложение состоит из нескольких независимых процессов, которые взаимодействуют друг с другом. Понимание этой архитектуры критически важно для разработки в Electron.

#### Главный процесс (Main Process)

Это основной процесс вашего Electron-приложения. Он запускается при старте приложения и отвечает за:

- Создание и управление окнами приложения (BrowserWindow).
- Управление жизненным циклом приложения (открытие, закрытие, минимизация).
- Доступ к нативным API операционной системы (файловая система, меню, уведомления, диалоговые окна).
- Выполнение кода Node.js (поэтому здесь доступны все модули Node.js, такие как `fs`, `http`, `path`).

В Electron может быть только один главный процесс.

#### Процессы рендеринга (Renderer Processes)

Каждое окно в Electron (BrowserWindow) запускается в отдельном процессе рендеринга. Эти процессы отвечают за:

- Отображение пользовательского интерфейса (HTML, CSS, JavaScript).
- Выполнение JavaScript-кода, который вы пишете для вашего интерфейса (например, React-приложения).
- Поведение аналогично веб-браузеру: они изолированы от прямого доступа к системным ресурсам и Node.js API из соображений безопасности.

#### Зачем нужна связь между процессами

Поскольку главный процесс и процессы рендеринга изолированы, им нужен способ обмениваться данными и вызывать функции друг у друга. Это называется **межпроцессным взаимодействием (Inter-Process Communication - IPC)**. IPC необходим, когда:

- **Рендереру нужен доступ к системным ресурсам:** Например, React-компонент хочет сохранить файл или показать системное уведомление. Он не может сделать это напрямую, но может отправить запрос в главный процесс, который выполнит операцию.
- **Главному процессу нужно обновить UI:** Например, главный процесс получил данные из сети или отслеживает событие ОС и хочет обновить информацию в окне. Он отправляет сообщение в соответствующий процесс рендеринга.

Electron предоставляет модули `ipcMain` (для главного процесса) и `ipcRenderer` (для процессов рендеринга) для осуществления IPC.

#### Отправка сообщений из рендерера в главный процесс (односторонняя)

Используется для отправки запросов или уведомлений из UI в главный процесс без ожидания ответа.

**В процессе рендеринга (React-компонент):**

```javascript
// renderer.js (или ваш React-компонент)
const { ipcRenderer } = window.require("electron"); // Используем window.require для доступа к Electron API в рендерере

function MyButton() {
  const handleClick = () => {
    ipcRenderer.send("save-data", { key: "value", timestamp: Date.now() });
    console.log("Сообщение отправлено в главный процесс.");
  };

  return <button onClick={handleClick}>Сохранить данные</button>;
}
```

**В главном процессе (main.js):**

```javascript
// main.js
const { ipcMain } = require("electron");

ipcMain.on("save-data", (event, data) => {
  console.log("Получено сообщение из рендерера:", data);
  // Здесь можно выполнить операцию сохранения данных, например, используя fs
  // fs.writeFileSync(...)
});
```

#### Отправка сообщений из главного процесса в рендерер (односторонняя)

Используется для отправки данных или команд из главного процесса в UI.

**В главном процессе (main.js):**

```javascript
// main.js
const { BrowserWindow, ipcMain } = require("electron");

// Предположим, у вас есть ссылка на окно
let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // Включаем nodeIntegration для доступа к require в рендерере
      contextIsolation: false, // Отключаем contextIsolation для простоты примера, в продакшене лучше использовать preload скрипт
    },
  });

  mainWindow.loadFile("index.html"); // Или loadURL для React-приложения

  // Отправляем сообщение в рендерер через 5 секунд после запуска
  setTimeout(() => {
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.webContents.send("update-ui", {
        message: "Данные обновлены из главного процесса!",
        time: new Date().toLocaleTimeString(),
      });
      console.log("Сообщение отправлено в рендерер.");
    }
  }, 5000);
}

// ... (код для запуска приложения)
```

**В процессе рендеринга (React-компонент):**

```javascript
// renderer.js (или ваш React-компонент)
import React, { useState, useEffect } from "react";
const { ipcRenderer } = window.require("electron");

function UIMessageDisplay() {
  const [statusMessage, setStatusMessage] = useState("");

  useEffect(() => {
    // Слушаем сообщения от главного процесса
    ipcRenderer.on("update-ui", (event, data) => {
      console.log("Получено сообщение из главного процесса:", data);
      setStatusMessage(`${data.message} (${data.time})`);
    });

    // Очистка слушателя при размонтировании компонента
    return () => {
      ipcRenderer.removeAllListeners("update-ui");
    };
  }, []);

  return (
    <div>
      <h3>Статус из главного процесса:</h3>
      <p>{statusMessage || "Ожидание сообщений..."}</p>
    </div>
  );
}

export default UIMessageDisplay;
```

#### Двусторонняя связь (запрос-ответ)

Для сценариев, где рендереру нужен ответ от главного процесса (например, "сохрани файл и скажи, успешно ли"), используется `ipcRenderer.invoke()` и `ipcMain.handle()`. Это более современный и предпочтительный способ для таких взаимодействий.

**В процессе рендеринга (React-компонент):**

```javascript
// renderer.js (или ваш React-компонент)
const { ipcRenderer } = window.require("electron");

function FileSaver() {
  const [saveStatus, setSaveStatus] = useState("");

  const handleSaveFile = async () => {
    setSaveStatus("Сохранение...");
    try {
      const result = await ipcRenderer.invoke(
        "save-file-dialog",
        "my_document.txt",
        "Hello Electron!"
      );
      setSaveStatus(
        result.success
          ? `Файл сохранен: ${result.filePath}`
          : `Ошибка сохранения: ${result.error}`
      );
    } catch (error) {
      setSaveStatus(`Непредвиденная ошибка: ${error.message}`);
    }
  };

  return (
    <div>
      <button onClick={handleSaveFile}>Сохранить файл через диалог</button>
      <p>{saveStatus}</p>
    </div>
  );
}
```

**В главном процессе (main.js):**

```javascript
// main.js
const { ipcMain, dialog } = require("electron");
const fs = require("fs");

ipcMain.handle("save-file-dialog", async (event, defaultFilename, content) => {
  try {
    const { canceled, filePath } = await dialog.showSaveDialog({
      defaultPath: defaultFilename,
      filters: [
        { name: "Text Files", extensions: ["txt"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (canceled) {
      return { success: false, error: "Сохранение отменено пользователем." };
    } else {
      fs.writeFileSync(filePath, content);
      return { success: true, filePath: filePath };
    }
  } catch (error) {
    console.error("Ошибка при обработке save-file-dialog:", error);
    return { success: false, error: error.message };
  }
});
```
