# ESTRATEGIA TÉCNICA Y STACK

Este documento define las decisiones arquitectónicas clave del proyecto tras la consolidación de la arquitectura Local-First.

## STACK TECNOLÓGICO Y ARQUITECTURA HÍBRIDA

El proyecto adopta un "Mapa de Carpetas Definitivo" con separación física total:

* **Frontend (UI y Lógica Core) en `/frontend`:** React 19.2.4 con Vite.
  * Arquitectura Interna: **Clean Architecture** (`domain`, `application`, `infrastructure`) + **Atomic Design** (`presentation`: `atoms`, `molecules`, `organisms`, `templates`, `pages`).
  * Estado: Zustand (Manejador de Estado Global centralizado para UI y Paneles). Context API reservado exclusivamente para datos de proyecto/idioma inmutables en el render.
  * Routing: React Router Dom.
  * Estilos: Technical Zen (Monolithic) basado en variables CSS (`foreground/X`). Prohibido glassmorphism legacy.
  * Aliasing de rutas configurado (ej. `@components`, `@features`, `@database`, `@assets`).
* **Persistencia (BBDD Local-First):** SQLite WASM (`sqlocal`) sobre OPFS.
  * Almacenamiento absoluto de datos en el navegador del cliente. Cero latencia de red.
  * Aislamiento: Requiere cabeceras COOP/COEP inyectadas por el servidor auxiliar.
* **Backend Auxiliar (Helper) en `/backend`:** Java 21 + Spring Web / Jetty.
  * Arquitectura Interna: **Domain-Driven Design (DDD)** con subpaquetes como `worldbible`, `mapeditor` y `linguistics` bajo el namespace `com.worldbuilding`.
  * Responsabilidad: Gestión de archivos del sistema, OPFS bridge, snapshots en disco y utilidades de entorno.

## ARQUITECTURA DE PANELES (CHAMELEON INSPECTOR)

1. **Inspector Universal:** El panel derecho es un contenedor inteligente (`UniversalInspector`) que reacciona al `mode` y `activeId` del store global.
2. **Inyección de Contenido:** Las vistas pueden inyectar componentes personalizados vía `setCustomContent`, eliminando la necesidad de portales o comunicación via props.
3. **Persistencia Visual:** El panel mantiene su estado de apertura y contenido de forma independiente a la navegación del `Outlet`.

## HISTORIAL DE TRANSICIÓN

El proyecto ha **completado con éxito** la transición a la **Arquitectura Monolítica Zen (Mayo 2026)**, eliminando la deuda técnica de los portales manuales y centralizando la lógica de inspección. El **Backend Auxiliar (Java)** se mantiene exclusivamente como un facilitador de sistema para persistencia en disco (Snapshots) y utilidades de entorno.
