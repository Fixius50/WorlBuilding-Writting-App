# ESTRATEGIA TÉCNICA Y STACK

Este documento define las decisiones arquitectónicas clave del proyecto tras la consolidación de la arquitectura Local-First.

## STACK TECNOLÓGICO Y ARQUITECTURA HÍBRIDA

El proyecto adopta un "Mapa de Carpetas Definitivo" con separación física total:

- **Frontend (UI y Lógica Core) en `/frontend`:** React 19.2.4 con Vite.
  - Arquitectura Interna: **Clean Architecture** (`domain`, `application/useCases`, `infrastructure`, `presentation`).
  - **Alcance de Atomic Design:** se aplica exclusivamente dentro de `src/presentation/` (`atoms`, `molecules`, `organisms`, `templates`, `pages`).
  - Estado: Zustand para estado global de UI y stores de feature; Context API reservado para datos transversales estables (idioma/proyecto).
  - Routing: React Router Dom.
  - Aliasing de rutas configurado (ej. `@application`, `@features`, `@domain`, `@infrastructure`, `@presentation`).
- **Persistencia (BBDD Local-First):** SQLite WASM (`sqlocal`) sobre OPFS.
  - Almacenamiento absoluto de datos en el navegador del cliente. Cero latencia de red.
  - Aislamiento: Requiere cabeceras COOP/COEP inyectadas por el servidor auxiliar.
- **Backend Auxiliar (Helper) en `/backend`:** Java 21 + Spring Web / Jetty.
  - Arquitectura Interna: Domain-Driven Design (DDD) por subdominios (`worldbible`, `mapeditor`, `linguistics`, etc.).
  - Responsabilidad: bridge de sistema de archivos, snapshots en disco y utilidades de entorno.

## ZONA DE APIS Y CONTRATOS DEL PROYECTO

Esta sección centraliza las APIs que usa el sistema para evitar dispersión en otros bloques.

### 1) APIs de Aplicación (Frontend)

Punto de entrada obligatorio para la UI: `src/application/useCases/`.

- `WorldBibleUseCase`
- `EntityUseCase`
- `TemplateUseCase`
- `RelationshipUseCase`
- `TimelineUseCase`
- `MapUseCase`
- `WritingUseCase`
- `WorkspaceUseCase`
- `DashboardUseCase`
- `SettingsUseCase`
- `TrashUseCase`

### 2) APIs de Infraestructura (Frontend)

Implementadas en `src/infrastructure/` y consumidas por Application:

- Local DB sobre SQLite WASM/OPFS (repositorios y utilidades de persistencia).
- Cliente de red para llamadas al backend auxiliar cuando aplica (snapshots, operaciones de sistema).

### 3) APIs del Backend Auxiliar (Java)

Expuestas por `/backend` para funciones de soporte de entorno:

- Endpoints de respaldo/sincronización local.
- Endpoints de utilidades de archivos para empaquetado y snapshots.
- Inyección de cabeceras requeridas para el aislamiento de SQLite WASM.

### 4) APIs de Plataforma (Navegador)

- OPFS (persistencia binaria local).
- Web Workers (ejecución aislada de SQLite WASM).
- Event APIs para sincronización reactiva de UI cuando corresponde.

## ARQUITECTURA DE JERARQUÍAS

Para garantizar un código mantenible y escalable, las jerarquías del sistema (Mundos, Personajes, Mapas, etc.) siguen un patrón de desacoplamiento total:

1. **Capa de Dominio (`src/domain/models/hierarchy.ts`):** Define el **"Qué"**. Contiene los IDs literales y las descripciones de negocio. Es el Lenguaje Ubicuo del sistema.
2. **Capa de Presentación (`src/presentation/utils/hierarchyVisuals.ts`):** Define el **"Cómo se ve"**. Mapea los IDs de dominio a iconos (_Material Symbols_) y colores (_Tailwind Classes_).
3. **Desacoplamiento:** El dominio no conoce la existencia de Tailwind ni de iconos específicos, protegiendo la lógica de negocio de cambios estéticos.

## ARQUITECTURA DE INSPECCIÓN CONTEXTUAL (SIN PANEL DERECHO GLOBAL)

1. **Sin Inspector Global:** Se elimina el contenedor lateral único. Cada feature gestiona su inspección en su propio contexto de UI.
2. **Patrones Permitidos:** Navegación por rutas, modales locales, drawers locales de feature y paneles embebidos en la vista activa.
3. **Regla de Integración:** Evitar acoplamiento de vistas a stores de panel global legacy. La comunicación entre módulos se realiza por casos de uso, navegación o estado local.

## PATRONES OPERATIVOS TRANSVERSALES

1. **Estabilidad de render:** Contextos y props derivados deben estabilizarse con `useMemo`/`useCallback`.
2. **Efectos reactivos estables:** Para handlers inestables en `useEffect`, priorizar patrón con `useRef`.
3. **Persistencia dinámica:** Valores `unknown` provenientes de `contenido_json` deben castearse explícitamente en capa de presentación.
4. **Contratos de mapas:** `MapMarker.entityId` se mantiene como clave canónica de vínculo y `snapshotUrl`/`bgImage` deben persistirse en guardado de mapas.

## REFERENCIAS CRUZADAS (EVITAR DUPLICIDAD)

- Lineamientos visuales y de estilos: `02_Diseño_UI_UX.md`
- Gobernanza documental y precedencia de fuentes: `00_Reglas_Maestras.md`
- Build y distribución operativa: `00_Reglas_Maestras.md` (Sección 5)
- Historial y trazabilidad de cambios: `03_Roadmap_Vivo.md`
