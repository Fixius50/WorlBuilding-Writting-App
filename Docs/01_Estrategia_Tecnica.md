# ESTRATEGIA TÉCNICA Y STACK

Este documento define la arquitectura vigente del proyecto y las reglas de estructura que deben seguir desarrolladores e IA.

## STACK Y ARQUITECTURA HÍBRIDA

- **Frontend en `/frontend`:** React + Vite + TypeScript.
- **Persistencia local-first:** SQLite WASM (`sqlocal`) sobre OPFS.
- **Backend auxiliar en `/backend`:** Java + Spring/Jetty para bridge de sistema de archivos, snapshots y soporte de entorno.

## ARQUITECTURA FRONTEND VIGENTE

El frontend usa **Feature-Sliced Architecture (Vertical Slice)**:

1. La unidad principal es la **feature** (`src/features/<FeatureName>`).
2. Cada feature encapsula sus capas internas.
3. `Shared` es solo un kernel transversal de UI/utilidades, no un contenedor de lógica de negocio.
4. Integraciones de negocio que aún pasan por Shared deben declararse en `Shared/adapters` de forma explícita.

### Estructura estándar por feature

Carpetas permitidas según necesidad real:

- `application`: casos de uso y orquestación de negocio.
- `components`: componentes visuales reutilizables dentro de la feature.
- `hooks`: hooks reutilizables dentro de la feature.
- `pages`: vistas de ruta y hooks colocalizados de pantalla.
- `domain`: tipos, modelos y contratos de dominio.
- `store`: estado local de feature (Zustand u otro store local).

No todas las features deben tener todas las carpetas. Solo se crean cuando hay archivos que lo justifiquen.

## REGLAS DE COLOCACIÓN (CRÍTICAS PARA IA)

1. **Pantalla + hook exclusivo:** Si un hook solo lo usa una pantalla, debe vivir junto a ella en `pages/`.
2. **Hook reutilizable entre múltiples componentes/páginas:** Debe vivir en `hooks/`.
3. **Hook de componente movido de `components/`:** Los `use*` no deben quedarse dentro de `components/`; van a `hooks/`.
4. **`index.ts` por feature:** Debe permanecer en la raíz de la feature como API pública.
5. **Sin capas globales legacy en `src/`:** Evitar reintroducir `src/application`, `src/store`, `src/domain` o `src/presentation` como centros de lógica transversal.
6. **Sin imports profundos entre features:** Desde una feature no importar `@features/<OtraFeature>/(components|hooks|pages|application|domain|store)/*`; usar `@features/<OtraFeature>` (API pública).
7. **Shared kernel limpio:** `src/features/Shared/*` no debe importar features de negocio directamente. Excepciones temporales solo dentro de `src/features/Shared/adapters/*`.
8. **Capa de Infraestructura Obligatoria:** NUNCA realices consultas SQL directas (`sql` o `sqlocal`) dentro de los componentes o hooks de las `features`. Todo el acceso a datos debe orquestarse y encapsularse a través de la capa transversal de repositorios en `src/infrastructure/localDB/repositories/` (importando desde el alias `@repositories/*`).

## ALIAS Y RESOLUCIÓN DE RUTAS (ACTUAL)

Aliases clave de frontend:

- `@features/*` -> `src/features/*`
- `@components/*` -> `src/features/Shared/*`
- `@components` -> `src/features/Shared/index`
- `@context/*` -> `src/features/App/context/*`
- `@domain/*` -> dominios por feature (`App`, `Maps`, `Timeline`, `Writing`, `Linguistics`, `WorldBible`, `Graph`, `Shell`)

Implicación: los imports de Shared deben usar `@components` y `@components/*` (sin segmento `ui`).

## GUARDRAILS AUTOMÁTICOS DE ARQUITECTURA

Comandos en `frontend/package.json`:

- `npm run arch:check`: genera reporte de arquitectura sin romper CI local.
- `npm run arch:check:strict`: falla si existen violaciones.

Salida del reporte:

- `frontend/reports/architecture-guard-report.json`

Reglas verificadas por script:

1. Imports profundos cruzados entre features.
2. Dependencias de negocio dentro de Shared fuera de `Shared/adapters`.

## ARQUITECTURA DE INSPECCIÓN CONTEXTUAL

1. No existe panel derecho global único.
2. Cada feature resuelve inspección contextual por rutas, modales locales o paneles embebidos.
3. Evitar acoplamiento con stores globales legacy de panel.

## PATRONES OPERATIVOS TRANSVERSALES

1. Estabilizar props/handlers con `useMemo` y `useCallback` cuando aplique.
2. Tipar explícitamente datos dinámicos (`unknown` + casteo seguro) al leer `contenido_json`.
3. En flujos de alta frecuencia (canvas/edición), usar caché en memoria y flush controlado a SQLite.
4. Mantener contratos estables entre `application` y `infrastructure`.

## REFERENCIAS CRUZADAS

- UI/UX y estilo visual: `02_Diseño_UI_UX.md`
- Gobierno documental: `00_Reglas_Maestras.md`
- Workspaces y flujo macro: `04_Arquitectura_Workspaces.md`
- Historial de cambios: `03_Roadmap_Vivo.md`
