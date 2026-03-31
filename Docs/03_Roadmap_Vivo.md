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
- [x] **Aislamiento de Seguridad:** Implementación de inyección de cabeceras COOP/COEP en el servidor Java para soporte inquebrantable de SQLite WASM.
- [x] **Zero-Config:** JRE embebido en el paquete de distribución.
- [x] **Manual Interactivo:** Consolidación de documentación en `Guia_Usuario.html`.

## FASE 4: EXPANSIÓN Y CONSOLIDACIÓN (En Progreso 🚧)

- [x] **Refinamiento Zen:** Rediseño del grafo circular y UX unificada de "+ Nuevo".
- [x] **Integridad:** Saneamiento de entidades huérfanas y claves foráneas en SQLite.
- [ ] **Tipado Estricto:** Refactorización continua hacia TypeScript estricto. Prohibido el uso de `any` en nuevos módulos o refactorizaciones.
- [ ] **Estética Inviolable:** Consolidación total del paradigma "Technical Zen / Monolithic" (estética técnica atemporal sin transparencias, paneles sólidos) y fuentes Serif para interfaces de lectura larga.
- [x] **Arquitectura API (Flexible):** Mantenimiento/reincorporación de llamadas de red para tareas que lo ameriten. Las APIs sí están permitidas (Cancelando la restricción original de aislamiento total).
- [ ] **Mapas:** Integración del visor Leaflet/MapLibre nativo sobre SQLite.
- [ ] **Sincronización:** Automatización de copias de seguridad y snapshots de SQLite (`.sqlite`) al disco físico a través del Servidor Auxiliar.
- [ ] Optimización de rendimiento en consultas relacionales complejas.

## IDEAS FUTURAS

- Generador de nombres procedural por cultura.
- Integración de IA local para resúmenes de historia.
- Modo "Presentación" para mostrar el mundo a lectores.
