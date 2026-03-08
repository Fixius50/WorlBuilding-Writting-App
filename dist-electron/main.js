"use strict";const o=require("electron"),e=require("node:fs"),t=require("node:path"),i=require("node:url");var c=typeof document<"u"?document.currentScript:null;e.writeFileSync("electron-debug.log",`Arrancando electron (Nivel 2)...
`);process.on("uncaughtException",n=>{e.appendFileSync("electron-debug.log",`Fatal: ${n}
${n.stack}
`)});process.on("unhandledRejection",(n,r)=>{e.appendFileSync("electron-debug.log",`Unhandled Rejection at: ${r}, reason: ${n}
`)});try{const n=t.dirname(i.fileURLToPath(typeof document>"u"?require("url").pathToFileURL(__filename).href:c&&c.tagName.toUpperCase()==="SCRIPT"&&c.src||new URL("main.js",document.baseURI).href));e.appendFileSync("electron-debug.log",`dirname es: ${n}
`);let r=null;async function l(){e.appendFileSync("electron-debug.log",`Creando ventana...
`);try{r=new o.BrowserWindow({width:1200,height:800,webPreferences:{preload:t.join(n,"preload.mjs"),contextIsolation:!0,nodeIntegration:!1}}),process.env.VITE_DEV_SERVER_URL?(e.appendFileSync("electron-debug.log",`URL dev: ${process.env.VITE_DEV_SERVER_URL}
`),r.loadURL(process.env.VITE_DEV_SERVER_URL)):(e.appendFileSync("electron-debug.log",`Sin URL dev, cargando index.html...
`),r.loadFile(t.join(n,"../dist/index.html")))}catch(a){e.appendFileSync("electron-debug.log",`Error al crear ventana: ${a.message}
`)}}o.app.whenReady().then(async()=>{e.appendFileSync("electron-debug.log",`App Ready!
`),o.ipcMain.handle("ping",async(a,d)=>(console.log("Mensaje desde React capturado:",d),"Pong puro!")),l(),o.app.on("activate",()=>{o.BrowserWindow.getAllWindows().length===0&&l()})}).catch(a=>{e.appendFileSync("electron-debug.log",`Error en whenReady: ${a.message}
`)}),o.app.on("window-all-closed",()=>{process.platform!=="darwin"&&o.app.quit()})}catch(n){e.appendFileSync("electron-debug.log",`Error base: ${n.message}
`)}
