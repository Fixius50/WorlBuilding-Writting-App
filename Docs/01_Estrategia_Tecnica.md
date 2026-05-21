# ESTRATEGIA TÉCNICA Y STACK

Este documento define las decisiones arquitectónicas clave del proyecto tras la consolidación de la arquitectura Local-First.

## STACK TECNOLÓGICO Y ARQUITECTURA HÍBRIDA

El proyecto adopta un "Mapa de Carpetas Definitivo" con separación física total:

- **Frontend (UI y Lógica Core) en `/frontend`:** React 19.2.4 con Vite.
  - Arquitectura Interna: **Clean Architecture** (`domain`, `application/useCases`, `infrastructure`, `presentation`) + **Atomic Design** (`presentation`: `atoms`, `molecules`, `organisms`, `templates`, `pages`).
    - **Regla de ORO (DDD):** Prohibido el acceso directo a repositorios (`*Service`) desde la capa de UI. Todo acceso debe pasar por la capa `application/useCases/` (Ej. `WorldBibleUseCase`, `MapUseCase`).
    - **Regla de ORO (Componentes y Control de Flujo):** Obligatorio el uso de sintaxis Arrow Function (`const = () => {}`) y prohibición estricta de `early returns` dentro de bloques `if` en favor de condicionales envolventes. Tipado fuerte sin `any`.
  - Estado: Zustand (Manejador de Estado Global centralizado para UI y Paneles). Context API reservado exclusivamente para datos de proyecto/idioma inmutables en el render.
  - Routing: React Router Dom.
  - Estilos: Technical Zen (Monolithic) basado en variables CSS (`foreground/X`).
  - Aliasing de rutas configurado (ej. `@application`, `@components`, `@features`, `@database`, `@assets`).
- **Persistencia (BBDD Local-First):** SQLite WASM (`sqlocal`) sobre OPFS.
  - Almacenamiento absoluto de datos en el navegador del cliente. Cero latencia de red.
  - Aislamiento: Requiere cabeceras COOP/COEP inyectadas por el servidor auxiliar.

## ARQUITECTURA DE JERARQUÍAS (DDD + ATOMIC)

Para garantizar un código mantenible y escalable, las jerarquías del sistema (Mundos, Personajes, Mapas, etc.) siguen un patrón de desacoplamiento total:

1. **Capa de Dominio (`src/domain/models/hierarchy.ts`):** Define el **"Qué"**. Contiene los IDs literales y las descripciones de negocio. Es el Lenguaje Ubicuo del sistema.
2. **Capa de Presentación (`src/presentation/utils/hierarchyVisuals.ts`):** Define el **"Cómo se ve"**. Mapea los IDs de dominio a iconos (_Material Symbols_) y colores (_Tailwind Classes_).
3. **Desacoplamiento:** El dominio no conoce la existencia de Tailwind ni de iconos específicos, protegiendo la lógica de negocio de cambios estéticos.

- **Backend Auxiliar (Helper) en `/backend`:** Java 21 + Spring Web / Jetty.
  - Arquitectura Interna: **Domain-Driven Design (DDD)** con subpaquetes como `worldbible`, `mapeditor` y `linguistics` bajo el namespace `com.worldbuilding`.
  - Responsabilidad: Gestión de archivos del sistema, OPFS bridge, snapshots en disco y utilidades de entorno.

## ARQUITECTURA DE INSPECCIÓN CONTEXTUAL (SIN PANEL DERECHO GLOBAL)

1. **Sin Inspector Global:** Se elimina el contenedor lateral único. Cada feature gestiona su inspección en su propio contexto de UI.
2. **Patrones Permitidos:** Navegación por rutas, modales locales, drawers locales de feature y paneles embebidos en la vista activa.
3. **Regla de Integración:** Se prohíbe acoplar vistas al store `useRightPanelStore`. La comunicación entre módulos se realiza por casos de uso, navegación o estado local.

## HISTORIAL DE TRANSICIÓN

El proyecto ha **completado con éxito** la transición a la **Arquitectura Monolítica Zen (Mayo 2026)**, eliminando la deuda técnica de portales manuales y retirando el panel derecho global para simplificar la navegación contextual por feature. El **Backend Auxiliar (Java)** se mantiene exclusivamente como un facilitador de sistema para persistencia en disco (Snapshots) y utilidades de entorno.

### DEUDA TÉCNICA Y REFACTORIZACIONES PENDIENTES

Actualmente, los módulos de Configuración (Settings), Vistas Globales, Grafos, Genealogía, y Relaciones han sido migrados a sus respectivos UseCases (TemplateUseCase, WorkspaceUseCase, RelationshipUseCase).
Aún **existe deuda técnica masiva** por refactorizar (uso directo de \*Service en la capa de presentación) en los siguientes módulos, que deben extraerse a la capa de Aplicación:

- **Módulo Entities (Editor y Vistas):** CharacterEditor.tsx, EntityBuilder.tsx, FolderView.tsx, EntityInspector.tsx, FamilyTreeAssigner.tsx, CosmicCanvasEditor.tsx, etc.
- **Módulo Writing:** NotebookManager.tsx, WritingHub.tsx, WritingView.tsx, ZenEditor.tsx.
- **Módulo Maps:** InteractiveMapView.tsx, MapCreationWizard.tsx, MapManager.tsx, MapMarkerEditor.tsx, MapSearchBox.tsx, MapRouter.tsx.
- **Módulo Timeline:** useTimelineManager.ts, EventInspector.tsx.
- **Módulo Linguistics:** LinguisticsRouter.tsx, useLexiconManager.ts.
- **Módulo Calendars:** CalendarManagerView.tsx.
