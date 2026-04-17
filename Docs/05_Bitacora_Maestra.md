# BITÁCORA MAESTRA DE DESARROLLO

Este documento consolida el registro sistemático y de desarrollo de WorldbuildingApp para una trazabilidad total.

## 🕒 CRONOLOGÍA DE HITOS (2026)

### ABRIL 2026

- **2026-04-17: Migración a Arquitectura Híbrida (Vite + Spring Boot DDD)**
  - **Separación Física:** El proyecto se divide en carpetas raíz `/frontend` y `/backend`.
  - **Clean Architecture Frontend:** Implementación de capas `domain`, `application`, `infrastructure` y `presentation`.
  - **Atomic Design presentación:** Distribución de componentes en `atoms`, `molecules`, `organisms`, `templates` y `pages`.
  - **DDD Backend:** Organización del servidor Java por dominios bajo `com.worldbuilding`.
  - **Path Aliasing:** Configuración de alias `@components`, `@features`, `@database`, `@assets` y `@` en Vite y TS.

### MARZO 2026

- **2026-03-31: MapEditor Multicapa — Fase de Estabilización y Cierre**
  - **Navegación corregida:** Al guardar un mapa nuevo, `MapRouter` volvía al `EntityRouter` genérico. Corregido: `onSave` ahora siempre hace `setView('manager')`.
  - **Previsualización reparada:** `MapEditor.handleSave` ahora extrae la URL de la primera capa imagen visible y la persiste como `snapshotUrl` + `bgImage`, que es lo que lee `MapManager.getPreview()`.
  - **Botón Editar:** Añadido en tarjetas (hover) y panel lateral del MapManager. Prop `onEditMap` conectado en `MapRouter`.
  - **Panel contextual residual:** El `InteractiveMapView` dejaba su `contextContent` activo al desmontar, tapando el portal del `MapEditor`. Fix: ambos componentes limpian el contenido en su destructor.
  - **Key de pestaña unificado:** Todos los componentes usan `'CONTEXT'` (antes había mezcla con `'CONTEXTO'`).
  - **Modales fuera del canvas:** `EntityPickerModal` y `ConfirmDeleteModal` movidos al nivel raíz del componente `MapEditor`, fuera del `<Map>` de MapLibre para evitar conflictos de eventos.
  - **InteractiveMapView refactorizado:** Eliminados botones sin función (Gestionar Marcadores, Ver Visionador). Panel lateral ahora muestra stats reales, lista de marcadores clicables y detalles de entidad vinculada.
  - **FolderView:** Tarjeta "+ Nueva Entidad" → "+ Nueva Creación" con menú desplegable (Entidad, Mapa, Línea de Tiempo). Eliminado bloque "Archivo Vacío". BibleCard tipo `Map` navega al Atlas.
  - **TypeScript:** Corrección de errores de tipo en `InteractiveMapView` (`unknown`, `entidadId→entityId`, cast de `imageWidth/imageHeight`).

- **2026-03-30: Refinamiento Zen y Saneamiento de Datos (Integridad Local-First)**
  - **Grafo Zen:** Rediseño del `ZenNode` con 24 handles perimetrales alineados al borde blanco.
  - **Integridad de Datos:** Activación de `PRAGMA foreign_keys = ON` en SQLite para borrado en cascada real.
  - **UX Unificada:** Tarjetas dinámicas `+ Nuevo` en grid de Biblia, Vista de Carpetas y Writing Hub.

- **2026-03-22: Gran Saneamiento Local-First y Eliminación de Legado**
  - **Cero Red:** Eliminación total de dependencias de `api.js` y el servicio `Axios`.
  - **Papelera Local:** Sistema de borrado lógico (columna `borrado`) para carpetas y entidades.
  - **Sync-Bridge:** Rediseño del `syncService` para usar `fetch` nativo como puente con el Servidor Auxiliar Java.

- **2026-03-22: Sistema de Atributos Globales y UX de Arrastre**
  - **Biblioteca Global:** Persistencia con `project_id: 0` para reutilización entre proyectos.
  - **Edición en Caliente:** Sistema de edición en línea (lápiz) en el sidebar.
  - **UX Premium:** Sustitución de `window.confirm` por `ConfirmModal` personalizado.

- **2026-03-21: Refactorización Estética del Entity Builder**

- **2026-03-15: Refactorización de Navegación, Reactividad y Notas Rápidas**
  - **Evolución de Notas:** "Cuadernos" → "Notas Rápidas" en el panel lateral derecho.
  - **Navegación Persistente:** "Settings" y "Logout" reubicados al pie del sidebar izquierdo.
  - **Sincronización Reactiva:** Eventos `storage_update` para actualizar Idioma y Tema sin recargar.

- **2026-03-14: Refactorización de Módulo Lingüístico y Tipado Estricto**
  - **LinguisticsHub:** Eliminación de tipos `any`, corrección de `never[]`, interfaces para `Shape`, `Layer`, `Word`.
  - **Motor de Fuentes:** Corrección de integración `opentype.js` con declaraciones de tipos manuales.

- **2026-03-12: Pivot Final a Local-First (SQLite WASM + TypeScript)**
  - **Cero Backend:** Eliminación de `src-tauri` y código Rust. App 100% frontend.
  - **SQLocal:** Implementación de persistencia con SQLite WASM y OPFS.
  - **Servicios Core:** `projectService`, `folderService`, `entityService`, `timelineService`.

---

## 🔴 ALERTAS Y ERRORES DOCUMENTADOS

### Stack Definitivo Consolidado

1. **Frontend Core:** React 19, Vite, TypeScript (strict).
2. **Persistencia:** SQLite WASM (`sqlocal`) + OPFS.
3. **Cartografía:** MapLibre GL JS (renderizado de mapas vectoriales e imagen).
4. **Backend Auxiliar:** Java 21 + Spring WebMVC para tareas de SO (backups, IO físico).

### Patrones Establecidos

- **Panel Derecho (GlobalRightPanel):** Usa key `'CONTEXT'` para la pestaña de contexto (NO 'CONTEXTO'). Los componentes inyectan contenido vía `createPortal` al `#global-right-panel-portal` O vía `setRightPanelContent()` del OutletContext. Si se usa `setRightPanelContent`, el componente **debe limpiar** con `setRightPanelContent(null)` en su destructor.
- **MapAttributes `[key: string]: unknown`:** Los campos extra de `MapAttributes` son `unknown`. Siempre castear explícitamente: `as string`, `as number`, etc.
- **MapMarker.entityId:** El campo de vínculo con entidades es `entityId` (no `entidadId`). No confundir entre versiones.
- **Guardado de Mapas:** `handleSave` en `MapEditor` debe incluir `snapshotUrl` y `bgImage` para que `MapManager.getPreview()` pueda mostrar la miniatura.

---

## 🎯 PRÓXIMAS PRIORIDADES

1. **Alta:** Herramienta Borrador en MapEditor para eliminar trazos individuales de capas de dibujo.
2. **Alta:** Sincronización automática de backups SQLite al disco físico vía Servidor Auxiliar.
3. **Media:** Optimización de rendimiento en consultas relacionales complejas.
4. **Baja:** Paginación/carga diferida del EntityPicker si el proyecto crece.
5. **Baja:** Generador de nombres procedural por cultura.
