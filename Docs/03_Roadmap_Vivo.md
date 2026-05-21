# ROADMAP VIVO DEL PROYECTO

## FASE 1: CIMIENTOS (Completada ✅)

- [x] Pivot Arquitectónico Local-First: 100% Vite Frontend (React 19) Web-centric.
- [x] Configuración Inicial: Servidor Auxiliar (Java/Spring) exclusivo para tareas de sistema (backups, IO físico).
- [x] Sistema de autenticación de usuario único (Local).
- [x] Gestión de Proyectos y Universos.
- [x] Creación básica de Entidades.

## FASE 2: EL ARQUITECTO (Completada ✅)

- [x] **World Bible:** Buscador global, Wiki interna y CRUD Local-First.
- [x] **Relaciones:** Visualización de grafos dinámicos entre entidades.
- [x] **Líneas Temporales:** Motor de eventos local y visualización horizontal.
- [x] **Escritura:** Módulo de Cuadernos y Notas con persistencia local.
- [x] **Especialización:**
  - [x] Conlangs (Motor fonético, diseño de glifos y exportación .ttf).
  - [x] **Entity Builder:** Sistema de atributos globales dinámicos.
  - [x] **Papelera:** Sistema de recuperación local en base de datos.

## FASE 3: PULIDO Y EMPAQUETADO (Completada ✅)

- [x] **Estabilidad React 19:** Migración a `@xyflow/react` para resolver conflictos de dependencias.
- [x] **Empaquetado Nativo:** Creación del lanzador `Chronos Atlas.exe` usando Node.js + `pkg`.
- [x] **Aislamiento de Seguridad:** Implementación de cabeceras COOP/COEP en el servidor Java para soporte de SQLite WASM.
- [x] **Zero-Config:** JRE embebido en el paquete de distribución.
- [x] **Manual Interactivo:** Consolidación de documentación en `Guia_Usuario.html`.

## FASE 4: EXPANSIÓN Y CONSOLIDACIÓN (En Progreso 🚧)

- [x] **Refinamiento Zen:** Rediseño del grafo circular y UX unificada de "+ Nuevo".
- [x] **Integridad:** Saneamiento de entidades huérfanas y claves foráneas en SQLite.
- [x] **Tipado Estricto:** Refactorización continua hacia TypeScript estricto.
- [x] **Estética Inviolable:** Consolidación total del paradigma "Technical Zen / Monolithic" (Mayo 2026 ✅).
- [x] **Retirada del Panel Derecho Global:** Eliminación completa del flujo lateral unificado (incluyendo `GlobalRightPanel` y `UniversalInspector`) y migración a inspección contextual por rutas/modales locales. (Mayo 2026 ✅).
- [x] **Saneamiento Arquitectónico Estricto:** Eliminación total de _early returns_ en la UI, consolidación de Arrow Functions y eliminación de tipos `any`. (Mayo 2026 ✅).
- [x] **Arquitectura Híbrida Definitiva:** Separación física `/frontend` (Vite + Clean Arch) y `/backend` (Java + DDD).
- [x] **Mapas Multicapa (MapEditor) — Completado ✅**
  - [x] Motor de renderizado de capas con soporte SVG→PNG (DataURL).
  - [x] Capas tipo imagen, dibujo spray y trayectos (LineString acumulativo).
  - [x] Marcadores vinculables a entidades de la Biblia via modal EntityPicker.
  - [x] Previsualización (`snapshotUrl` + `bgImage`) correctamente persistida en MapManager.
- [x] **Panel de Control Global — Completado ✅**
  - [x] Sustitución del BottomGraphDrawer por un Panel de Control multi-sección extensible.
  - [x] Sección **Red**: Grafo de entidades integrado.
  - [x] Sección **Datos**: Base de datos general de todas las entidades con búsqueda y filtros.
  - [x] Sección **Notas**: Migración del NotebookManager al panel inferior.
- [x] **Sincronización Automática — Completado ✅**
  - [x] Implementación de auto-backup cada 5 minutos hacia el servidor local (Java).
- [x] **Motor de Entidades Multiversal (EAV) — Completado ✅**
  - [x] Implementación de base de datos dinámica (EAV) para atributos ilimitados.
  - [x] **Gestor Masivo (BibleTableView)**: Interfaz tipo hoja de cálculo con @tanstack/react-table.
- [ ] Optimización de rendimiento en consultas relacionales complejas.

## FASE 5: EL ECOSISTEMA CONECTADO Y ESPECIALIZACIÓN PROFESIONAL (Futuro 🚀)

- [ ] **Módulo de Planificación Visual (Whiteboards):** Lienzo infinito para planificación desestructurada.
- [ ] **Especialización de Entidades Pro:** Módulos para Árboles Genealógicos y Sistemas de Magia.
- [ ] **Líneas Temporales de Segunda Generación:** Motor de calendarios fantásticos personalizables.
- [ ] **Motor Lingüístico Avanzado:** Autogeneración de conjugaciones y evolución fonética.
- [ ] **Compilación Editorial:** Exportación nativa a `.EPUB` y `.PDF`.
