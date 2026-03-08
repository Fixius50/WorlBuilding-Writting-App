"use strict";
const electron = require("electron");
electron.contextBridge.exposeInMainWorld("electronAPI", {
  ping: (message) => electron.ipcRenderer.invoke("ping", message)
  // Añadiremos más métodos a medida que migremos los endpoints de Java (ej: guardarProyecto, cargarUniverso...)
});
