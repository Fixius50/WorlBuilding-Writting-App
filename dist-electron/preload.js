let electron = require("electron");
//#region src/main/frontend/electron/preload.ts
electron.contextBridge.exposeInMainWorld("electronAPI", { onMainMessage: (callback) => electron.ipcRenderer.on("main-process-message", (_event, value) => callback(value)) });
//#endregion
