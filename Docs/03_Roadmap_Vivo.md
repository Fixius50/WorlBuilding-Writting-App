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

## FASE 3: PULIDO Y EMPAQUETADO (En Progreso 🚧)

- [ ] **Mapas:** Integración del visor Leaflet nativo sobre SQLite.
- [ ] **Sincronización:** Refactorización avanzada del Servidor Auxiliar Java para snapshots automáticos.
- [ ] Optimización de rendimiento en SQLite embebido.
- [ ] Refactorización de estilos globales y temas.
- [ ] Configuración del empaquetado nativo cruzado (Vite + Webview wrapper).

- [ ] Refactorización de estilos globales.
- [ ] Optimización de rendimiento en SQLite embebido.
- [ ] Configuración del empaquetado nativo cruzado con `electron-builder` (`.exe`).

## IDEAS FUTURAS

* Generador de nombres procedural por cultura.
- Integración de IA local para resúmenes de historia.
- Modo "Presentación" para mostrar el mundo a lectores.
