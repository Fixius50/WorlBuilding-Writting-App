"use strict";const e=require("electron");e.contextBridge.exposeInMainWorld("electronAPI",{ping:n=>e.ipcRenderer.invoke("ping",n)});
