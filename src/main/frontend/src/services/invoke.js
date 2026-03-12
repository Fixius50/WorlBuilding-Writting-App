/**
 * invoke.js - Wrapper universal para Tauri IPC
 *
 * En modo Tauri nativo (escritorio), usa la función real de @tauri-apps/api/core.
 * En modo Vite/navegador (desarrollo), usa el polyfill inyectado en main.jsx.
 */
const isTauri = typeof window !== 'undefined' && window.__TAURI_INTERNALS__ !== undefined;

let _invoke;

if (isTauri) {
    // Carga dinámica para evitar errores en entorno browser donde el módulo no existe.
    _invoke = async (cmd, args) => {
        const { invoke } = await import('@tauri-apps/api/core');
        return invoke(cmd, args);
    };
} else {
    // Usar el polyfill de desarrollo inyectado en main.jsx
    _invoke = async (cmd, args) => {
        if (typeof window !== 'undefined' && window.__TAURI_INVOKE_MOCK__) {
            return window.__TAURI_INVOKE_MOCK__(cmd, args);
        }
        throw new Error(`invoke('${cmd}') falló: no hay entorno Tauri y el polyfill no está cargado.`);
    };
}

export const invoke = _invoke;
