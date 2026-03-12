# BITÁCORA MAESTRA DE DESARROLLO

Este documento consolida el registro sistemático y de desarrollo de WorldbuildingApp para una trazabilidad total.

## 🕒 CRONOLOGÍA DE HITOS (2026)

### MARZO 2026

- **2026-03-11: Migración a Motor Rust y Base de Datos Integrada**
  - **SQLite Embebido:** Conexión nativa a base de datos SQLite gestionada desde Rust (`rusqlite`) con mecanismo de Fallback Anti-Crash.
  - **IPC Serverless:** Enlace bidireccional puro entre React UI y Rust a través de `tauri_commands` dejando obsoleto el uso de un servidor HTTP local en desarrollo.

- **2026-03-08: Transición Definitiva a Desktop Nativo (Adiós Java)**
  - **Reestructuración Frontend:** Feature-Sliced Design implementado, consolidando modularidad en React/Vite.
  - **Cambio de Ecosistema:** Se abandona la arquitectura pesada de Servidor (Java Spring Boot) por su incompatibilidad conceptual con apps Desktop.
  - **Integración Tauri:** Transición final de prototipos hacia Tauri + Rust puro.

- **2026-03-01: Visualización Avanzada y Swarm Intelligence**
  - **Línea Temporal:** Refactorización de `TimelineView.jsx` para integrar el eje horizontal interactivo con estética Dark Glassmorphism.
  - **Interfaz:** Creación de `TimelineEventCard.jsx` y centralización de estilos CSS en `src/main/frontend/css/`.
  - **Identidad:** Generación del icono oficial 'Chronos Atlas' para el empaquetado `.exe`.
  - **Roles de Enjambre:** Adopción de la estrategia de perfiles CEREBRO, INVESTIGADOR, ARQUITECTO y AUDITOR.

- **2026-03-01: Cimientos Antiguos (Backend Obsoleto)**
  - **Arquitectura Legacy:** Implementación inicial (descartada) de `UniversoController` y persistencia por jerarquía.

### FEBRERO 2026

- **2026-02-28: World Bible & Tiptap**
  - **Editor:** Integración de Tiptap con sistema dinámico de menciones mediante `@`.
  - **Estabilidad:** Corrección de bucles infinitos en el renderizado del Dashboard.
  - **Diseño:** Establecimiento de los primeros estándares de Glassmorphism.

## 🔴 ALERTAS Y ERRORES DOCUMENTADOS

### Estado Actual — Marzo 2026

| # | Error / Alerta | Estado | Módulo |
|---|---|---|---|
| 1 | `SyntaxError: Unexpected token '<'` al cargar carpetas de la World Bible | 🔴 Pendiente | `ArchitectLayout → /world-bible/folders` |
| 2 | Fetch legacy a `/world-bible/entities` en CRUD del explorador | 🔴 Pendiente | `ArchitectLayout → confirmDeletion, handleMoveEntity, etc.` |
| 3 | Fetch legacy a `/world-bible/templates` en Settings | 🔴 Pendiente | `ArchitectLayout → handleDeleteTemplate, handleUpdateTemplate` |
| 4 | iFrame de Grafo Global hace petición a ruta relativa vacía | 🔴 Pendiente | `ArchitectLayout → /graph` (iframe) |
| 5 | Backup Global no funciona en entorno browser (solo Tauri nativo) | ✅ Esperado | `WorkspaceSelector → export_backup` |
| 6 | `invoke` no disponible en Vite dev (browser) — **RESUELTO** con Polyfill | ✅ Resuelto | `main.jsx + invoke.js` |
| 7 | Redirect POST-selección de cuaderno enviaba a URL rota `/{name}/{name}` — **RESUELTO** | ✅ Resuelto | `workspaceService.select → /local/{name}` |
| 8 | Guard de ruta en `ArchitectLayout` redirigía en caso de error — **RESUELTO** | ✅ Resuelto | `loadProject() → sin navigate('/')` |

---

## 🗄️ ARQUITECTURA DE GESTIÓN DE DATOS

### Estrategia Dual: Desarrollo vs. Producción

```
         DESARROLLO (Vite/Browser)        PRODUCCIÓN (Tauri/EXE)
         ┌─────────────────────────┐      ┌────────────────────────────┐
         │   main.jsx polyfill     │      │  @tauri-apps/api/core      │
         │   window.__TAURI_INVOKE │      │  invoke() → Rust backend   │
         │   → localStorage mock   │      │  → SQLite local            │
         └─────────────────────────┘      └────────────────────────────┘
                     │                                  │
                     └──────────→ invoke.js ←───────────┘
                                 (auto-detect entorno)
```

### Tablas SQLite Implementadas

| Tabla | Estado | Comando Rust |
|---|---|---|
| `proyectos` | ✅ Completo | `get_proyectos`, `create_proyecto`, `get_proyecto_by_name`, `export_backup` |
| `entidades` | ✅ Completo | `get_entidades`, `get_entidad_by_id`, `create_entidad`, `delete_entidad` |
| `eventos` | ✅ Completo | `get_eventos`, `create_evento` |
| `lenguas` | ✅ Completo | `get_lenguas`, `create_lengua` |
| `carpetas` | 🔴 Pendiente | — |
| `plantillas` | 🔴 Pendiente | — |

---

## 🎯 PRÓXIMAS PRIORIDADES

1. **Alta:** Migrar `carpetas` y sistema de explorador de la World Bible a SQLite + Rust.
2. **Alta:** Eliminar fetches legacy en `ArchitectLayout` (folders, entities CRUD, templates).
3. **Media:** Migrar vista del Grafo Global a datos nativos.
4. **Baja:** Optimización de rendimiento para bases de datos de entidades extensas.
5. **Baja:** Integración del visor de mapas (Leaflet/Mapbox).
