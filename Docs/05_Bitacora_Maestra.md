# BITÁCORA MAESTRA DE DESARROLLO

Este documento consolida el registro sistemático y de desarrollo de WorldbuildingApp para una trazabilidad total.

## 🕒 CRONOLOGÍA DE HITOS (2026)

### MARZO 2026

- **2026-03-22: Gran Saneamiento Local-First y Eliminación de Legado**
  - **Cero Red:** Eliminación total de dependencias de `api.js` y el servicio `Axios` heredado. La app ya no requiere conexión a red para funcionar.
  - **Saneamiento Global:** Refactorización de más de 10 componentes críticos (Settings, Trash, Relationships, Linguistics) para usar exclusivamente el worker de SQLite WASM.
  - **Papelera Local:** Implementación de un sistema de borrado lógico (columna `borrado`) para carpetas y entidades, gestionado por `trashService.ts`.
  - **Sync-Bridge:** Rediseño del `syncService` para usar `fetch` nativo como puente con el Servidor Auxiliar Java encargado de Backups/Imports de base de datos física.
  - **Estabilidad:** Resolución de errores de compilación de Vite relacionados con módulos no encontrados.

- **2026-03-22: Sistema de Atributos Globales y UX de Arrastre**
  - **Biblioteca Global:** Implementación de persistencia con `project_id: 0`, permitiendo la reutilización de módulos en toda la aplicación.
  - **Edición en Caliente:** Integración de un sistema de edición en línea (Lápiz) en el sidebar para modificar nombre y tipo de atributos instantáneamente.
  - **UX Premium:** Refactorización del elemento drag-ghost (minimalista) y sustitución de diálogos `window.confirm` por `ConfirmModal` personalizado.
  - **Sincronización SQLite:** Optimización del flujo de guardado en `EntityBuilder.tsx` para asegurar que los IDs de base de datos se sincronicen con la UI tras el primer guardado sin recargar.
  - **Limpieza de Huérfanos:** Implementación de borrado físico de atributos en base de datos para evitar reapariciones de campos eliminados.

- **2026-03-21: Refactorización Estética del Entity Builder**

- **2026-03-15: Refactorización de Navegación, Reactividad y Notas Rápidas**
  - **Evolución de Notas:** Se ha transformado el módulo de "Cuadernos" en "Notas Rápidas" en el panel lateral derecho, optimizando el flujo de trabajo para anotaciones inmediatas.
  - **Auditoría de Traducciones:** Identificación y corrección de claves missing (`common.notes`, `project.analytics_title`, etc.) para eliminar etiquetas internas (`algo.algo`) de la UI.
  - **Navegación Persistente:** Reubicación de "Settings" y "Logout" al pie del sidebar izquierdo para mayor accesibilidad y limpieza visual (remoción de iconos en el header).
  - **Sincronización Reactiva:** Implementación de un sistema de eventos `storage_update` para actualizar Idioma y Tema en tiempo real en toda la app sin recargar la página.
  - **Soporte de Temas Real:** Eliminación de fondos HEX hardcodeados en componentes (`bg-[#0a0a0c]`) por clases de Tailwind (`bg-background`) que respetan las variables CSS dinámicas.

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
4. **Backend Auxiliar:** Servidor nativo ligero (Java 21 + Spring WebMVC) alojado en `server-aux/` para tareas exclusivas de manejo de SO terminales y automatizaciones puente del navegador.

### Razonamiento Estratégico

- **Cero Monolito, Pura Velocidad:** Se eliminan los problemas del monolito de base de datos lejana. Las consultas complejas típicas del Worldbuilding corren directo sobre la tecnología SQLite WASM del propio navegador del usuario, logrando cero latencia de red.
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
