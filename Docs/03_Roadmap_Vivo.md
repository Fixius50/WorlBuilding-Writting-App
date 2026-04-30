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
- [x] **Arquitectura Híbrida Definitiva:** Separación física `/frontend` (Vite + Clean Arch) y `/backend` (Java + DDD).
- [x] **Clean Architecture + Atomic Design:** Reestructuración total del frontend para escalabilidad y mantenibilidad.
- [x] **DDD (Domain-Driven Design):** Organización del backend Java por dominios (`worldbible`, `mapeditor`, `linguistics`).
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
- [x] **Panel de Control Global — Completado ✅**
  - [x] Sustitución del BottomGraphDrawer por un Panel de Control multi-sección extensible.
  - [x] Botón toggle flotante persistente (estilo Dashboard).
  - [x] Sección **Red**: Grafo de entidades integrado.
  - [x] Sección **Datos**: Base de datos general de todas las entidades con búsqueda y filtros.
  - [x] Sección **Notas**: Migración del NotebookManager al panel inferior.
  - [x] **Preview Inline**: Visualización de detalles de entidad dentro del panel sin navegar fuera.
  - [x] **Optimización UX**: Apertura y redimensionado instantáneo (sin transiciones de altura).
- [x] **Limpieza del Panel Derecho**: Eliminación de las pestañas Explorer y Quick Notes (migradas al ControlPanel); simplificación a solo "Contexto".
- [x] **Sincronización Automática — Completado ✅**
  - [x] Implementación de auto-backup cada 5 minutos hacia el servidor local (Java).
  - [x] Sincronización persistente de la base de datos `.sqlite` al disco físico.
- [x] **Paginación EntityPicker — Completado ✅**
- [x] **Integración de Estadísticas en ControlPanel — Completado ✅**
- [x] **Motor de Entidades Multiversal (EAV) — Completado ✅**
  - [x] Implementación de base de datos dinámica (EAV) para atributos ilimitados.
  - [x] **El Taller (ArchetypeManager)**: Interfaz para definir leyes del mundo y arquetipos dinámicos.
  - [x] **Gestor Masivo (BibleTableView)**: Interfaz tipo hoja de cálculo con @tanstack/react-table.
  - [x] **Ráfaga de Creación**: Fila de entrada rápida para poblar el mundo a alta velocidad.
  - [x] **Inyección Dinámica**: Fórmularios inteligentes en la ficha de entidad que responden a los arquetipos.
- [ ] Optimización de rendimiento en consultas relacionales complejas.

## FASE 5: EL ECOSISTEMA CONECTADO Y ESPECIALIZACIÓN PROFESIONAL (Futuro 🚀)

Esta fase transformará la herramienta de una base de datos creativa a un entorno de autoría integral y colaborativo.

- [ ] **Módulo de Planificación Visual (Whiteboards):** Lienzo infinito para planificación desestructurada ("Muro de Detective").
- [ ] **Especialización de Entidades Pro:** Módulos para Árboles Genealógicos y Sistemas de Magia.
- [ ] **Líneas Temporales de Segunda Generación:** Motor de calendarios fantásticos personalizables.
- [ ] **Motor Lingüístico Avanzado:** Autogeneración de conjugaciones y evolución fonética.
- [ ] **Sincronización P2P (Co-Autoría):** Colaboración directa vía WebRTC sin servidor central.
- [ ] **Compilación Editorial:** Exportación nativa a `.EPUB` y `.PDF` lista para publicación.

## VISIÓN ESTRATÉGICA POR MÓDULOS (DETALLE TÉCNICO-FUNCIONAL) 🔭

A partir de la Fase 4, el proyecto evoluciona hacia un "cerebro conectado" de nivel profesional. El desglose detallado por módulos es el siguiente:

### 1. Módulo de Escritura y Edición (features/Writing & features/Editor) 🟢
El núcleo `ZenEditor` con menciones `@` evolucionará hacia un entorno de autoría total:
- **Control de Versiones (Snapshots):** 🟢 [COMPLETADO ✅]
- **Seguimiento de Metas y Estadísticas:** 🟢 [COMPLETADO ✅]
- **Previsualización Inline:** 🟢 [COMPLETADO ✅] (Sustituye al Split View)

### 2. Módulo de Cartografía Profesional (features/Maps) 🟢
- **Atlas Dinámico:** 🟢
    - **Buscador Contextual:** Caja flotante tipo "Google Maps" para localizar entidades y marcadores al instante.
    - **Quick Filters:** Panel de switches para filtrar Ciudades, Ruinas y Eventos Históricos en tiempo real.
- **Herramienta de Medición de Distancias:** Compás digital que calcule distancias y tiempos de viaje (a pie, caballo, barco).
- **Capas Temáticas (Polygonal Layers):** Dibujo de fronteras y biomas.
- **Marcadores Personalizados (Custom Pins):** Soporte para iconos `.svg` / `.png`.

### 3. Módulo de la Biblia y Entidades (features/WorldBible & features/Entities) 🟢
- **Fichas 360° (Todo en Uno):** 🟢
- **Mini-Grafo Interactivo:** 🟢
- **Backlinks Automáticos:** 🟢

### 4. Módulo de Líneas Temporales (features/Timeline)
Gestión avanzada del tiempo cronológico:
- **Filtrado por Entidades:** Capacidad de seleccionar un personaje o lugar y filtrar la línea temporal para mostrar *solo* los eventos en los que participó.
- **Múltiples Calendarios Paralelos:** Soporte para sistemas de tiempo divergentes (ej. Calendario Élfico vs Humano) sincronizados mediante un "tiempo absoluto" interno en el motor.

### 5. Módulo de Grafos Semánticos (features/Graph)
Visualización política y social profunda:
- **Filtros por Tipo de Relación:** Capacidad de ocultar o mostrar tipos de conexión específicos (ej. "Mostrar solo Enemistades y Vasallajes" para analizar el panorama de guerra) eliminando el ruido visual.

### 6. Herramientas de Productividad y Salida (Core)
- **Command Palette (Ctrl + K / Cmd + K):** Buscador global emergente.
- **Compilador de Manuscritos:** Exportación a `.EPUB`, `.PDF` o `.DOCX`.
- **Exportación de la Biblia (Wiki Offline):** Generador de sitio HTML estático.

### 7. Planificación Visual y Narrativa
- **Pizarras Blancas (Whiteboards):** Espacios de planificación libre con post-its e hilos conectores.
- **Gestor de Arcos Narrativos:** Flujos interactivos para estructurar Planteamiento, Nudo y Clímax.

### 8. Worldbuilding Especializado Pro
- **Árboles Genealógicos:** Visualización de dinastías, matrimonios y linajes.
- **Calendarios Fantásticos:** Soporte para meses inventados y ciclos lunares múltiples.
- **Sistemas de Magia / Religión:** Registro de reglas, costes y jerarquías divinas.

### 9. Excelencia Técnica y Colaboración
- **Sincronización P2P (WebRTC):** Colaboración directa entre usuarios sin servidor central.
- **Analytics Dashboard:** 🟢 [COMPLETADO ✅]

---
> [!IMPORTANT]
> **Planificacin de Fase 5:** Los detalles tcnicos y flujos UX para las nuevas funcionalidades se encuentran detallados en [08_Especificaciones_Expansion.md](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/Docs/08_Especificaciones_Expansion.md).
