const { app, BrowserWindow } = require("electron");
const path = require("node:path");

const createWindow = () => {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
    },
  });

  filePath = path.join(__dirname, "build", "index.html");

  win.loadFile("build/index.html");

  // win.loadURL("http://localhost:3000");
  win.webContents.openDevTools();
};

// Останавливать приложение, когда все окна закрыты
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

// Создание окна при готовности
app.whenReady().then(() => {
  createWindow();

  // Для MacOS: если приложение запущено, но нет окон, при активации приложения будет открыто окно
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
