# ROADMAP VIVO DEL PROYECTO

## FASE 1: CIMIENTOS (Completada ✅)

- [x] Configuración inicial Spring Boot + React.
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
  - [x] **Papelera:** Sistema de recuperación local basado en base de datos.

## FASE 3: PULIDO Y EMPAQUETADO (Completada ✅)

- [x] **Estabilidad React 19:** Resolución de conflictos con `framer-motion` y `reactflow` (Migración a `@xyflow/react`).
- [x] **Empaquetado Nativo:** Creación del lanzador `Chronos Atlas.exe` usando Node.js + `pkg`.
- [x] **Aislamiento de Seguridad:** Implementación de inyección de cabeceras COOP/COEP en el servidor Java para soporte SQLite WASM.
- [x] **Zero-Config:** JRE embebido en el paquete de distribution.
- [x] **Manual Interactivo:** Consolidación de documentación en `Guia_Usuario.html`.

## FASE 4: EXPANSIÓN (En Progreso 🚧)

- [x] **Refinamiento Zen:** Rediseño del grafo circular con 24 handles perimetrales y UX unificada de "+ Nuevo".
- [x] **Integridad:** Saneamiento de entidades huérfanas y activación de claves foráneas nativas en SQLite.
- [ ] **Mapas:** Integración del visor Leaflet/MapLibre nativo sobre SQLite.
- [ ] **Sincronización:** Automatización de copias de seguridad (.sqlite) al disco físico.
- [ ] Optimización de rendimiento en consultas relacionales complejas.
- [ ] Temas visuales personalizados (Glassmorphism avanzado).

## IDEAS FUTURAS

- Generador de nombres procedural por cultura.
- Integración de IA local para resúmenes de historia.
- Modo "Presentación" para mostrar el mundo a lectores.
