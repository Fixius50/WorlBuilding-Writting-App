# Guía de Desarrollo Diario (Electron + React Vite + SQLite WASM)

Esta guía explica el flujo de trabajo tras el pivot a la arquitectura **Local-First** 100% JavaScript/TypeScript.

## 1. Arrancar el Entorno de Desarrollo

Ya no se utiliza Tauri ni Rust. El stack se levanta directamente con Vite y Electron:

```bash
npm run dev
```

Este comando levanta:
1. **Frontend (Vite):** Servidor de desarrollo con Hot Module Replacement (HMR).
2. **Contenedor (Electron):** Abre la ventana nativa que carga el frontend de Vite.

## 2. Modificando la Interfaz y Lógica (TypeScript)

Todo el código vive ahora bajo `src/main/frontend/`.

- **UI:** Componentes React en `src/main/frontend/features/` y `src/main/frontend/components/`.
- **Persistencia:** Consultas directas a la base de datos vía `entityService.ts` utilizando `sqlocal` (SQLite WASM).
- **Tipado:** Es obligatorio usar **TypeScript** en modo estricto. No crear archivos `.js` o `.jsx` nuevos; usar siempre `.ts` o `.tsx`.

**Flujo:** Escribes código, guardas, y la ventana de Electron se actualiza automáticamente.

## 3. Base de Datos (SQLite WASM)

La base de datos reside en el navegador (WebWorker) y persiste en el sistema de archivos del usuario mediante OPFS. 

- No necesitas un proceso de base de datos externo.
- Para cambios en el esquema, se deben aplicar migraciones en los servicios correspondientes (`entityService`, `projectService`, etc.).

## 4. Empaquetado de Producción

Para generar el ejecutable nativo (`.exe`):

```bash
npm run build
```

Esto generará los archivos distribuibles en la carpeta `dist/` o `release/` (dependiendo de la configuración de Electron-Builder).
