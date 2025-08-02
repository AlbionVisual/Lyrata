const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: async () => {
    const fileContent = await ipcRenderer.invoke("dialog:openFile");
    return fileContent;
  },
});

contextBridge.exposeInMainWorld("appSettingsAPI", {
  getSettings: () => ipcRenderer.invoke("get:settings"),
  updateSettings: (newSettings) =>
    ipcRenderer.invoke("update:settings", newSettings),
});

contextBridge.exposeInMainWorld("appFileAPI", {
  loadTextFile: (fileName) => ipcRenderer.invoke("load:text-file", fileName),
  saveTextFile: (fileName, content) =>
    ipcRenderer.invoke("save:text-file", { fileName, content }),
  deleteTextFile: (fileName) =>
    ipcRenderer.invoke("delete:text-file", fileName),
});
