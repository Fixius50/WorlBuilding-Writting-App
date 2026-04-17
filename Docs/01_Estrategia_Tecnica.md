# ESTRATEGIA TÉCNICA Y STACK

Este documento define las decisiones arquitectónicas clave del proyecto tras la consolidación de la arquitectura Local-First.

## STACK TECNOLÓGICO Y ARQUITECTURA HÍBRIDA

El proyecto adopta un "Mapa de Carpetas Definitivo" con separación física total:

* **Frontend (UI y Lógica Core) en `/frontend`:** React 19.2.4 con Vite.
  * Arquitectura Interna: **Clean Architecture** (`domain`, `application`, `infrastructure`) + **Atomic Design** (`presentation`: `atoms`, `molecules`, `organisms`, `templates`, `pages`).
  * Estado: Context API + Zustand (Manejador de Estado Global ligero).
  * Routing: React Router Dom.
  * Estilos: Glassmorphism y utilidades Tailwind CSS.
  * Aliasing de rutas configurado (ej. `@components`, `@features`, `@database`, `@assets`).
* **Persistencia (BBDD Local-First):** SQLite WASM (`sqlocal`) sobre OPFS.
  * Almacenamiento absoluto de datos en el navegador del cliente. Cero latencia de red.
  * Aislamiento: Requiere cabeceras COOP/COEP inyectadas por el servidor auxiliar.
* **Backend Auxiliar (Helper) en `/backend`:** Java 21 + Spring Web / Jetty.
  * Arquitectura Interna: **Domain-Driven Design (DDD)** con subpaquetes como `worldbible`, `mapeditor` y `linguistics` bajo el namespace `com.worldbuilding`.
  * Responsabilidad: Gestión de archivos del sistema, OPFS bridge, snapshots en disco y utilidades de entorno.

## ARQUITECTURA DE DATOS

1. **Entidades Base:** Todo en el mundo es una "Entidad" aislada guardada en formato relacional.
2. **Modularidad:** División estricta por módulos de lore (Atlas, Crónicas, Personajes).

## HISTORIAL DE TRANSICIÓN

Inicialmente concebido como un monolito pesado o una app distribuida. El proyecto ha **completado con éxito** la transición a **Local-First (Vite + SQLocal)**. El **Backend Auxiliar (Java)** se mantiene exclusivamente como un facilitador de sistema para persistencia en disco (Snapshots) y utilidades de entorno.
