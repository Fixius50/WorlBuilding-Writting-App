import { app, BrowserWindow, ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

fs.writeFileSync('electron-debug.log', 'Arrancando electron (Nivel 2)...\n');

process.on('uncaughtException', (err) => {
    fs.appendFileSync('electron-debug.log', `Fatal: ${err}\n${err.stack}\n`);
});

process.on('unhandledRejection', (reason, promise) => {
    fs.appendFileSync('electron-debug.log', `Unhandled Rejection at: ${promise}, reason: ${reason}\n`);
});

try {
    const __dirname = path.dirname(fileURLToPath(import.meta.url));
    fs.appendFileSync('electron-debug.log', `dirname es: ${__dirname}\n`);

    let mainWindow: BrowserWindow | null = null;

    async function createWindow() {
        fs.appendFileSync('electron-debug.log', 'Creando ventana...\n');
        try {
            mainWindow = new BrowserWindow({
                width: 1200,
                height: 800,
                webPreferences: {
                    preload: path.join(__dirname, 'preload.mjs'),
                    contextIsolation: true,
                    nodeIntegration: false,
                },
            });

            if (process.env.VITE_DEV_SERVER_URL) {
                fs.appendFileSync('electron-debug.log', `URL dev: ${process.env.VITE_DEV_SERVER_URL}\n`);
                mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
            } else {
                fs.appendFileSync('electron-debug.log', 'Sin URL dev, cargando index.html...\n');
                mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
            }
        } catch (err: any) {
            fs.appendFileSync('electron-debug.log', `Error al crear ventana: ${err.message}\n`);
        }
    }

    app.whenReady().then(async () => {
        fs.appendFileSync('electron-debug.log', 'App Ready!\n');

        ipcMain.handle('ping', async (event, message) => {
            console.log('Mensaje desde React capturado:', message);
            return 'Pong puro!';
        });

        createWindow();

        app.on('activate', () => {
            if (BrowserWindow.getAllWindows().length === 0) {
                createWindow();
            }
        });
    }).catch((err) => {
        fs.appendFileSync('electron-debug.log', `Error en whenReady: ${err.message}\n`);
    });

    app.on('window-all-closed', () => {
        if (process.platform !== 'darwin') {
            app.quit();
        }
    });

} catch (e: any) {
    fs.appendFileSync('electron-debug.log', `Error base: ${e.message}\n`);
}
