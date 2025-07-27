const { app, BrowserWindow } = require('electron');
const path = require('path');
const isDev = require('electron-is-dev'); // Установите npm install electron-is-dev

function createWindow() {
  // Создаем окно браузера.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'), // Если нужен preload скрипт
      nodeIntegration: true, // Включаем интеграцию Node.js (будьте осторожны с безопасностью)
      contextIsolation: false, // Отключаем изоляцию контекста (для простоты, но не рекомендуется для продакшена)
    },
  });

  // Загружаем index.html вашего React-приложения
  // В режиме разработки:
  mainWindow.loadURL(
    isDev
      ? 'http://localhost:3000' // Порт, на котором работает React-разработка
      : `file://${path.join(__dirname, '../build/index.html')}` // Путь к собранному React-приложению
  );

  // Открываем DevTools, если в режиме разработки.
  if (isDev) {
    mainWindow.webContents.openDevTools();
  }
}

// Этот метод будет вызван, когда Electron закончит инициализацию
// и будет готов к созданию окон браузера.
app.whenReady().then(createWindow);

// Выход из приложения, когда все окна закрыты (кроме macOS).
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Активация приложения, когда док-иконка кликнута (macOS).
app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});