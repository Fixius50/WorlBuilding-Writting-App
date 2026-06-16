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
- [x] **Visor de Mapas y Estudio Cartográfico (Atlas) — Completado ✅**
  - [x] Optimización de rendimiento mediante caché local en memoria para trazos y opacidades.
  - [x] Acotado dinámico del canvas a las dimensiones naturales de la imagen base de fondo.
  - [x] Panel derecho colapsable estilo VS Code con tooltips CSS (Modo Enfoque).
  - [x] Instalación de dependencias profesionales de dibujo vectorial 2D/3D (@mapbox/mapbox-gl-draw y @deck.gl-community/editable-layers).
- [ ] Optimización de rendimiento en consultas relacionales complejas.

## FASE 5: EL ECOSISTEMA CONECTADO Y ESPECIALIZACIÓN PROFESIONAL (Futuro 🚀)

- [ ] **Módulo de Planificación Visual (Whiteboards):** Lienzo infinito para planificación desestructurada.
  - [ ] Post-its, imágenes de referencia e hilos conectores.
  - [ ] Gestor de arcos narrativos con diagramas de flujo (planteamiento, nudo, clímax).
- [ ] **Especialización de Entidades Pro:** Módulos para Árboles Genealógicos y Sistemas de Magia.
  - [ ] Árboles genealógicos con linajes, sucesiones y parentescos complejos.
  - [ ] Sistemas de magia/religión con reglas, costes, limitaciones y jerarquías.
- [ ] **Líneas Temporales de Segunda Generación:** Motor de calendarios fantásticos personalizables.
  - [ ] Meses inventados, múltiples lunas y ciclos personalizados.
- [ ] **Motor Lingüístico Avanzado:** Autogeneración de conjugaciones y evolución fonética.
  - [ ] Composer de palabras por reglas silábicas y diccionario relacional expandido.
  - [ ] Motor de glifos con importación SVG, transliteración en tiempo real y exportación `.ttf`.
- [ ] **Compilación Editorial:** Exportación nativa a `.EPUB` y `.PDF`.
  - [ ] Compilación de manuscritos y generación de índice.
  - [ ] Exportación adicional a `.DOCX` y wiki offline HTML.
- [ ] **Colaboración P2P (WebRTC):** coautoría local sin servidor central.
  - [ ] Flujo: generar código de invitación -> conexión de coautor -> sincronización silenciosa.
  - [ ] Resolución de conflictos: conservar local, aceptar remoto o fusión manual asistida.

## CRONOLOGÍA DE HITOS (CONSOLIDADO)

### JUNIO 2026

- **2026-06-15:** Optimización del Estudio Cartográfico (Atlas): caché local de dibujo, acotamiento dinámico al tamaño real de imagen, panel colapsable estilo VS Code con tooltips CSS e instalación de kits de dibujo avanzado (@mapbox/mapbox-gl-draw y @deck.gl-community/editable-layers).

### MAYO 2026

- **2026-05-21:** Retirada total del panel derecho global y transición a inspección contextual por feature.
- **2026-05-13:** Normalización Hook-View y corrección de tipos en mapas/grafo.
- **2026-05-11:** Consolidación de Clean Architecture mediante `application/useCases`.
- **2026-05-06:** Refactorización DDD de jerarquías y menciones dinámicas reales.
- **2026-05-05:** Hito histórico de Chameleon Inspector (supersedido por el cambio del 2026-05-21).
- **2026-05-01:** Consolidación funcional del motor EAV (plantillas/valores, taller de arquetipos y gestión masiva tabular).

### ABRIL 2026

- **2026-04-25:** Escritura avanzada (snapshots), preview inline y consolidación del panel de control global.
- **2026-04-17:** Migración a arquitectura híbrida (`/frontend` + `/backend`) con Clean Architecture y DDD.

### MARZO 2026

- **2026-03-31:** Estabilización de MapEditor multicapa y navegación asociada.
- **2026-03-30:** Refinamiento Zen y saneamiento de datos con integridad local-first.
- **2026-03-22:** Eliminación de legado de red y consolidación del bridge local.
- **2026-03-22:** Sistema de atributos globales con mejoras de UX de arrastre y edición.
- **2026-03-21:** Refactorización estética del Entity Builder.
- **2026-03-15:** Refactorización de navegación, reactividad y notas rápidas.
- **2026-03-14:** Refactorización del módulo lingüístico y tipado estricto.
- **2026-03-12:** Pivot final a Local-First con SQLite WASM + TypeScript.
