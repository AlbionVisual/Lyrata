const { app, BrowserWindow, ipcMain, dialog, Menu } = require("electron");
const path = require("node:path");
const fs = require("node:fs/promises");

let appSettings = {};

const settingsFilePath = path.join(app.getPath("userData"), "settings.json");
const importedTextsDirPath = path.join(
  app.getPath("userData"),
  "imported_texts"
);

async function loadSettingsFromDisk() {
  try {
    const data = await fs.readFile(settingsFilePath, { encoding: "utf8" });
    appSettings = JSON.parse(data);
  } catch (error) {
    if (error.code === "ENOENT") {
      console.log("Settings file not found. Using default settings.");
      appSettings = { defaultSetting1: true, defaultSetting2: "value" }; // Настройки по умолчанию
    } else {
      console.error("Error loading settings:", error);
      appSettings = { defaultSetting1: true, defaultSetting2: "value" }; // Fallback на дефолтные
    }
  }
}

async function saveSettingsToDisk() {
  try {
    const jsonSettings = JSON.stringify(appSettings, null, 2);
    await fs.writeFile(settingsFilePath, jsonSettings, { encoding: "utf8" });
  } catch (error) {
    console.error("Error saving settings:", error);
  }
}

const createWindow = () => {
  // Создаём окно. sandbox по умолчанию true, но он мешает работе API
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

  win.loadFile("build/index.html"); // Для сбилженной версии
  // win.loadURL("http://localhost:3000"); // Для разработки
  // win.webContents.openDevTools();

  // Обработчик для чтения конкретного текстового файла по запросу
  ipcMain.handle("load:text-file", async (event, fileName) => {
    try {
      const filePath = path.join(importedTextsDirPath, fileName);
      const content = await fs.readFile(filePath, { encoding: "utf8" });
      return { success: true, content: content };
    } catch (error) {
      console.error(`Failed to load text file ${fileName}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("save:text-file", async (event, { fileName, content }) => {
    try {
      await fs.mkdir(importedTextsDirPath, { recursive: true });
      const filePath = path.join(importedTextsDirPath, fileName);
      await fs.writeFile(filePath, content, { encoding: "utf8" });
      return { success: true, filePath: filePath };
    } catch (error) {
      console.error(`Failed to save text file ${fileName}:`, error);
      return { success: false, error: error.message };
    }
  });

  ipcMain.handle("delete:text-file", async (event, fileName) => {
    try {
      const filePath = path.join(importedTextsDirPath, fileName);
      await fs.rm(filePath);
      return { success: true };
    } catch (error) {
      console.error(`Failed to remove text file ${fileName}:`, error);
      return { success: false, error: error.message };
    }
  });

  // Обработчик для получения текущих настроек
  ipcMain.handle("get:settings", () => {
    return appSettings;
  });

  ipcMain.handle("update:settings", (event, newSettings) => {
    appSettings = { ...appSettings, ...newSettings };
    return { success: true };
  });

  // Обработчик IPC для открытия файла
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
app.whenReady().then(async () => {
  await loadSettingsFromDisk();
  createWindow();

  // Для MacOS: если приложение запущено, но нет окон, при активации приложения будет открыто окно
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("before-quit", async (event) => {
  // event.preventDefault(); // Закомментируйте, если хотите отложить закрытие
  await saveSettingsToDisk(); // Сохраняем настройки перед выходом
});
