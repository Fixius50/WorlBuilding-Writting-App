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
- [x] **Estética Inviolable:** Consolidación total del paradigma "Technical Zen / Monolithic".
- [x] **Arquitectura API (Flexible):** Llamadas de red permitidas para tareas que lo ameriten.
- [x] **Mapas Multicapa (MapEditor) — Completado ✅**
  - [x] Motor de renderizado de capas con soporte SVG→PNG (DataURL).
  - [x] Capas tipo imagen, dibujo spray y trayectos (LineString acumulativo).
  - [x] Marcadores vinculables a entidades de la Biblia via modal EntityPicker.
  - [x] Popups enriquecidos: imagen de entidad, botones Ver/Cambiar/Borrar, auto-guardado al vincular.
  - [x] Previsualización (`snapshotUrl` + `bgImage`) correctamente persistida en MapManager.
  - [x] Flujo de navegación corregido: guardar → volver al Atlas (no al EntityRouter genérico).
  - [x] Botón "Editar en Editor" desde tarjetas y panel lateral del MapManager.
  - [x] Modales (EntityPicker, ConfirmDelete) movidos fuera del canvas de MapLibre.
  - [x] Panel contextual limpiado al cambiar de vista (contextContent residual resuelto).
- [x] **FolderView — "Nueva Creación":** Menú desplegable con Entidad / Mapa / Línea de Tiempo; eliminado "Archivo Vacío".
- [x] **Routing de Mapas:** BibleCard tipo `Map` navega al Atlas; key de tab `CONTEXT` unificado en todos los componentes.
- [x] **InteractiveMapView refactorizado:** Panel lateral funcional (lista de marcadores, stats, detalles de entidad vinculada); limpia contextContent al desmontar.
- [ ] **Sincronización:** Automatización de copias de seguridad SQLite (`.sqlite`) vía Servidor Auxiliar.
- [ ] Optimización de rendimiento en consultas relacionales complejas.
- [ ] **Herramienta Borrador (MapEditor):** Eliminar trazos individuales de capas de dibujo.
- [ ] **Paginación EntityPicker:** Carga diferida si el proyecto crece mucho.

## IDEAS FUTURAS

- Generador de nombres procedural por cultura.
- Integración de IA local para resúmenes de historia.
- Modo "Presentación" para mostrar el mundo a lectores.
