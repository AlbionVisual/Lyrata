const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  openFile: async () => {
    // Вызываем ipcRenderer.invoke, который будет ждать ответа от main process
    const fileContent = await ipcRenderer.invoke("dialog:openFile");
    return fileContent;
  },
});
