# Guía de Desarrollo Diario (Tauri + React Vite)

Esta guía explica cómo es el flujo de trabajo diario al programar Chronos Atlas tras la migración a la arquitectura nativa "Serverless" de Tauri.

## 1. Arrancar el Entorno de Desarrollo (Modo Dios)

Ya no hay que correr bases de datos por separado ni servidores Tomcat. Todo el stack se levanta con un solo comando desde la raíz del proyecto:

```bash
npm run tauri dev
```

Este comando levanta dos cosas en paralelo:
1. **Frontend (Vite):** Enciende el servidor en `localhost:3000` con Hot Module Replacement (HMR).
2. **Backend (Tauri/Rust):** Compila tu código en Rust y levanta la ventana nativa de Windows (WebView2) inyectando el frontend.

La terminal se quedará bloqueada escuchando cambios. Déjala minimizada mientras programas.

## 2. Modificando la Interfaz Visual (React)

Todo el código de la UI vive en `src/main/frontend/src/`.

**Flujo:** Escribes código (ej. cambias un botón en un archivo `.tsx`), le das a guardar (`Ctrl+S`), y la ventana del programa **se actualiza en menos de un segundo** automáticamente. No necesitas cerrar y volver a abrir la ventana de Tauri.

## 3. Programando "Backend" (Rust y SQLite)

La lógica dura (Bases de datos SQLite, manipulación de archivos del sistema operativo) vive en `src-tauri/src/`. No podemos acceder a SQLite directamente desde React por seguridad, así que usamos el puente nativo (IPC).

Paso A (Rust): Creas un comando (una función pública) en Rust, por ejemplo, para agregar un registro a la base de datos.
Paso B (React): Importas `invoke` desde `@tauri-apps/api/core` en el Frontend y ejecutas el comando.

```typescript
import { invoke } from "@tauri-apps/api/core";

// Llamando a una función Rust desde React
const resultado = await invoke("mi_funcion_rust", { argumento: "valor" });
```

**Hot Reload de Rust:**
Si modificas y guardas un archivo en la carpeta `src-tauri` (Rust), la terminal detectará el cambio, recompilará el binario súper rápido (C++) y reiniciará automáticamente la ventana de Tauri.

## 4. Empaquetando la App Final

Cuando tu actualización esté lista para distribuirse a clientes, ejecutas:

```bash
npm run tauri build
```
Rust tomará tu UI de React, la comprimirá, y generará un único instalador `.msi` o `.exe` de ~10MB en la carpeta `src-tauri/target/release/bundle/`.
