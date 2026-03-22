# ESTRATEGIA TÉCNICA Y STACK

Este documento define las decisiones arquitectónicas clave del proyecto tras la consolidación de la arquitectura Local-First.

## STACK TECNOLÓGICO ACTUAL

* **Frontend (UI y Lógica Core):** React 19+ con Vite.
  * Estado: Context API + Zustand (Manejador de Estado Global ligero).
  * Routing: React Router Dom.
  * Estilos: Glassmorphism y utilidades Tailwind CSS.
* **Persistencia (BBDD Local-First):** SQLite WASM (`sqlocal`) sobre OPFS (Origin Private File System).
  * Almacenamiento absoluto de datos en el navegador del cliente. Cero latencia de red.
  * Búsqueda: Consultas ultra-rápidas mediante Web Workers procesando SQLite.
* **Servidor Auxiliar (Spring Boot Helper):** Java 21 + Spring WebMVC.
  * Localizado en `server-aux`.
  * Responsabilidad: Tareas de sistema "Bridge" (Puente). Principalmente **Sincronización Bulk** (exportación e importación de archivos `.sqlite` del OPFS al disco duro físico) y automatizaciones de sistema operativo. No gestiona la lógica de negocio ni el CRUD diario.

## ARQUITECTURA DE DATOS

1. **Entidades Base:** Todo en el mundo es una "Entidad" aislada guardada en formato relacional.
2. **Modularidad:** División estricta por módulos de lore (Atlas, Crónicas, Personajes).

## HISTORIAL DE TRANSICIÓN

Inicialmente concebido como un monolito pesado o una app distribuida. El proyecto ha **completado con éxito** la transición a **Local-First (Vite + SQLocal)**. El **Backend Auxiliar (Java)** se mantiene exclusivamente como un facilitador de sistema para persistencia en disco (Snapshots) y utilidades de entorno.
