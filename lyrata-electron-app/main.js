const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");

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

  Menu.setApplicationMenu(null); // Полностью убирает полосу меню сверху

  filePath = path.join(__dirname, "build", "index.html");

  // win.loadFile("build/index.html"); // Для сбилженной версии
  win.loadURL("http://localhost:3000"); // Для разработки
  win.webContents.openDevTools();

  // --- Обработчик IPC для открытия файла
  ipcMain.handle("dialog:openFile", async (event) => {
    const { canceled, filePaths } = await dialog.showOpenDialog(win, {
      properties: ["openFile"],
      filters: [
        { name: "Text Files", extensions: ["txt", "html", "md"] },
        { name: "All Files", extensions: ["*"] },
      ],
    });

    if (canceled) {
      return null;
    } else {
      const filePath = filePaths[0];
      try {
        const fileContent = await fs.readFile(filePath, { encoding: "utf8" });
        return fileContent;
      } catch (error) {
        console.error("Failed to read file:", error);
        return null;
      }
    }
  });
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
