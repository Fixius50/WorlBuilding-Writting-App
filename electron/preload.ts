import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('electronAPI', {
    ping: (message: string) => ipcRenderer.invoke('ping', message),
    // Añadiremos más métodos a medida que migremos los endpoints de Java (ej: guardarProyecto, cargarUniverso...)
});
