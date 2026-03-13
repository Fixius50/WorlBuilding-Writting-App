import { contextBridge, ipcRenderer } from 'electron';

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('electronAPI', {
  onMainMessage: (callback: (message: string) => void) => 
    ipcRenderer.on('main-process-message', (_event, value) => callback(value)),
});
