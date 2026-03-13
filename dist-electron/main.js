//#region \0rolldown/runtime.js
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
	if (from && typeof from === "object" || typeof from === "function") for (var keys = __getOwnPropNames(from), i = 0, n = keys.length, key; i < n; i++) {
		key = keys[i];
		if (!__hasOwnProp.call(to, key) && key !== except) __defProp(to, key, {
			get: ((k) => from[k]).bind(null, key),
			enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable
		});
	}
	return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", {
	value: mod,
	enumerable: true
}) : target, mod));
//#endregion
let electron = require("electron");
let node_path = require("node:path");
node_path = __toESM(node_path);
let node_url = require("node:url");
//#region src/main/frontend/electron/main.ts
var __dirname$1;
try {
	__dirname$1 = node_path.default.dirname((0, node_url.fileURLToPath)({}.url));
} catch (e) {
	__dirname$1 = node_path.default.resolve();
}
process.env.DIST = node_path.default.join(__dirname$1, "../dist");
process.env.VITE_PUBLIC = electron.app.isPackaged ? process.env.DIST : node_path.default.join(__dirname$1, "../../public");
var win;
function createWindow() {
	win = new electron.BrowserWindow({
		icon: node_path.default.join(process.env.VITE_PUBLIC, "favicon.ico"),
		width: 1280,
		height: 800,
		titleBarStyle: "hidden",
		titleBarOverlay: {
			color: "#0a0a0c",
			symbolColor: "#6366f1",
			height: 30
		},
		webPreferences: {
			nodeIntegration: false,
			contextIsolation: true,
			preload: node_path.default.join(__dirname$1, "preload.js")
		},
		backgroundColor: "#0a0a0c",
		show: false
	});
	win.webContents.on("did-finish-load", () => {
		win?.webContents.send("main-process-message", (/* @__PURE__ */ new Date()).toLocaleString());
		win?.show();
	});
	if (process.env.VITE_DEV_SERVER_URL) win.loadURL(process.env.VITE_DEV_SERVER_URL);
	else win.loadFile(node_path.default.join(process.env.DIST, "index.html"));
	win.webContents.setWindowOpenHandler(({ url }) => {
		if (url.startsWith("https:")) electron.shell.openExternal(url);
		return { action: "deny" };
	});
}
electron.app.on("window-all-closed", () => {
	if (process.platform !== "darwin") {
		electron.app.quit();
		win = null;
	}
});
electron.app.on("activate", () => {
	if (electron.BrowserWindow.getAllWindows().length === 0) createWindow();
});
electron.app.whenReady().then(createWindow);
//#endregion
