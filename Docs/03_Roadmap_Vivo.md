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
- [ ] **Sincronización:** Automatización de copias de seguridad SQLite (`.sqlite`) vía Servidor Auxiliar.
- [ ] Optimización de rendimiento en consultas relacionales complejas.
- [ ] **Herramienta Borrador (MapEditor):** Eliminar trazos individuales de capas de dibujo.
- [ ] **Paginación EntityPicker:** Carga diferida si el proyecto crece mucho.

## VISIÓN ESTRATÉGICA POR MÓDULOS (DETALLE TÉCNICO-FUNCIONAL) 🔭

A partir de la Fase 4, el proyecto evoluciona hacia un "cerebro conectado" de nivel profesional. El desglose detallado por módulos es el siguiente:

### 1. Módulo de Escritura y Edición (features/Writing & features/Editor) 🟢
El núcleo `ZenEditor` con menciones `@` evolucionará hacia un entorno de autoría total:
- **Control de Versiones (Snapshots):** 🟢
    - **Modo Automático:** Configurable por el usuario (mínimo cada 5 minutos de actividad).
    - **Modo Manual:** Botón "Instant Snapshot" en la Top Bar para puntos de guardado críticos.
- **Seguimiento de Metas y Estadísticas:** 🟢
    - **Metas Custom:** Configurables por proyecto/capítulo (ej. "Meta de hoy: 1500 palabras").
    - Visualización de progreso mediante gráficos dinámicos utilizando la librería **@nivo**.
- **Split View Dinámico:** Capacidad de anclar fichas de la WorldBible en una mitad de la pantalla mientras se escribe en la otra, evitando modales flotantes que obstruyan el texto.

### 2. Módulo de Cartografía Profesional (features/Maps) 🟢
- **Atlas Dinámico:** 🟢
    - **Buscador Contextual:** Caja flotante tipo "Google Maps" para localizar entidades y marcadores al instante.
    - **Quick Filters:** Panel de switches para filtrar Ciudades, Ruinas y Eventos Históricos en tiempo real.
- **Herramienta de Medición de Distancias:** Compás digital que calcule distancias y tiempos de viaje (a pie, caballo, barco).
- **Capas Temáticas (Polygonal Layers):** Dibujo de fronteras y biomas.
- **Marcadores Personalizados (Custom Pins):** Soporte para iconos `.svg` / `.png`.

### 3. Módulo de la Biblia y Entidades (features/WorldBible & features/Entities) 🟢
- **Fichas 360° (Todo en Uno):** Organización por pestañas `[General] | [Relaciones] | [Apariciones]`. 🟢
- **Mini-Grafo Interactivo:** 🟢
    - Visualización de conexiones directas; al interactuar, permite expandir nodos y navegar internamente sin saltar de página (manteniendo el foco).
- **Backlinks Automáticos:** Sección de "Apariciones" que lista menciones cronológicas de la entidad en todo el proyecto.

### 4. Módulo de Líneas Temporales (features/Timeline)
Gestión avanzada del tiempo cronológico:
- **Filtrado por Entidades:** Capacidad de seleccionar un personaje o lugar y filtrar la línea temporal para mostrar *solo* los eventos en los que participó.
- **Múltiples Calendarios Paralelos:** Soporte para sistemas de tiempo divergentes (ej. Calendario Élfico vs Humano) sincronizados mediante un "tiempo absoluto" interno en el motor.

### 5. Módulo de Grafos Semánticos (features/Graph)
Visualización política y social profunda:
- **Filtros por Tipo de Relación:** Capacidad de ocultar o mostrar tipos de conexión específicos (ej. "Mostrar solo Enemistades y Vasallajes" para analizar el panorama de guerra) eliminando el ruido visual.

### 6. Herramientas de Productividad y Salida (Core)
- **Command Palette (Ctrl + K / Cmd + K):** Buscador global emergente para saltar instantáneamente a cualquier ficha, mapa o capítulo sin usar el ratón.
- **Módulo de Exportación Global:** 
    - Generador de **"Wiki Offline"** (exportación total a HTML/Markdown interconectado).
    - Compilador profesional a PDF para lectura externa.

### 7. Excelencia Técnica (QoL & Security)
- **Analytics Dashboard:** 🟢
    - Mapa de calor de contribución (estilo GitHub).
    - Sesiones de escritura activas (Pomodoro/Time Tracking).
- **Generación Procedural:** Integración de IA local (Ollama/WebLLM).

