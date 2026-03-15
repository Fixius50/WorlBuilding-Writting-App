# BITÁCORA MAESTRA DE DESARROLLO

Este documento consolida el registro sistemático y de desarrollo de WorldbuildingApp para una trazabilidad total.

## 🕒 CRONOLOGÍA DE HITOS (2026)

### MARZO 2026

- **2026-03-14: Refactorización de Módulo Lingüístico y Tipado Estricto**
  - **LinguisticsHub:** Refactorización total para eliminar tipos `any`, corregir estados `never[]` y asegurar interfaces para `Shape`, `Layer` y `Word`.
  - **Motor de Fuentes:** Corrección de la integración con `opentype.js` mediante declaraciones de tipos manuales (`opentype.d.ts`) e imports nombrados.
  - **Local-First Sync:** Eliminación de dependencias de `api.js` (legacy Java) y migración total a `entityService` para persistencia local.
  - **Exportación Local:** Implementación de generación de fuentes `.ttf` directa en el cliente sin necesidad de servidor intermedio.

- **2026-03-12: Pivot Final a Local-First (SQLite WASM + TypeScript)**
  - **Cero Backend:** Se elimina `src-tauri` y código Rust. La app es 100% frontend.
  - **SQLocal:** Implementación de persistencia con SQLite WASM y OPFS.
  - **Servicios Core:** Creación de `projectService`, `folderService`, `entityService` y `timelineService` en TypeScript.
  - **UI Typing:** Migración de `App.tsx`, `WorkspaceSelector.tsx` y modales de Dashboard a TypeScript.

- **2026-03-11: Migración a Motor Rust y Base de Datos Integrada (Obsoleto por Pivot Local-First)**
  - **SQLite Embebido:** Conexión nativa a base de datos SQLite gestionada desde Rust (`rusqlite`) con mecanismo de Fallback Anti-Crash.
  - **IPC Serverless:** Enlace bidireccional puro entre React UI y Rust a través de `tauri_commands`.

### FEBRERO 2026

- **2026-02-28: World Bible & Tiptap**
  - **Editor:** Integración de Tiptap con sistema dinámico de menciones mediante `@`.
  - **Estabilidad:** Corrección de bucles infinitos en el renderizado del Dashboard.
  - **Diseño:** Establecimiento de los primeros estándares de Glassmorphism.

## 🔴 ALERTAS Y ERRORES DOCUMENTADOS

### Estado Actual — Marzo 2026 (Pivot a Local-First)

**NUEVO PIVOT ARQUITECTÓNICO:**
Se ha decidido abandonar completamente el backend nativo (Rust/Tauri) y el servidor tradicional (Java/Spring). La aplicación abraza el paradigma **Local-First 100% Frontend**: todo el procesamiento, incluyendo la base de datos relacional completa, ocurre en el navegador del cliente mediante WebAssembly. Además, todo el código base migrará de JavaScript a **TypeScript**.

### Stack Definitivo Consolidado
1. **Frontend Core:** React 18, Vite, HTML/CSS puro.
2. **Tipado:** Migración total a **TypeScript** (strict mode).
3. **Persistencia (BBDD):** SQLite ejecutado vía WebAssembly (`sqlocal`), respaldado persistentemente por File System OPFS.
4. **Desktop build:** Electron empaquetando los estáticos de React.

### Razonamiento Estratégico
- **Cero Backend:** Se eliminan los problemas de puertos, procesos colgados y despliegues mixtos.
- **Rendimiento Cero-Latencia:** Las consultas complejas típicas del Worldbuilding corren directo sobre la RAM local del disco del cliente, sin viajes de red.
- **Roles Ágiles Setup:** Se han creado skills/prompts para agentes (Investigador, Arquitecto, Auditor) en la carpeta `Docs/agents/` (formato `.md`) y un `banco.md` para contexto persistente.

---

## 🗄️ NUEVA RUTA DE MIGRACIÓN: SQLITE WASM + TYPESCRIPT

### Prioridades Inmediatas
1. **Borrado y Setup:** Eliminar `src-tauri` y código Rust. Inicializar entorno TypeScript (`tsconfig.json`, renombrado a `.tsx`).
2. **Setup Base de Datos Cliente:** Instalar dependencias de SQLite WASM transaccional (`sqlocal`).
3. **Esquemas:** Reescribir el file `schema.sql` (antiguo Rust) para inicializar DB en el browser.
4. **Migración Servicios:** Reemplazar todo `invoke` y `api.get` por consultas directas SQL al worker de WASM.

---

## 🎯 PRÓXIMAS PRIORIDADES

1. **Alta:** Migrar `carpetas` y sistema de explorador de la World Bible a SQLite + Rust.
2. **Alta:** Eliminar fetches legacy en `ArchitectLayout` (folders, entities CRUD, templates).
3. **Media:** Migrar vista del Grafo Global a datos nativos.
4. **Baja:** Optimización de rendimiento para bases de datos de entidades extensas.
5. **Baja:** Integración del visor de mapas (Leaflet/Mapbox).
