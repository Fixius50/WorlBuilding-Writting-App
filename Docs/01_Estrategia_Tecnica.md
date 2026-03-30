# ESTRATEGIA TÉCNICA Y STACK

Este documento define las decisiones arquitectónicas clave del proyecto tras la consolidación de la arquitectura Local-First.

## STACK TECNOLÓGICO ACTUAL

* **Frontend (UI y Lógica Core):** React 19.2.4 con Vite.
  * Estado: Context API + Zustand (Manejador de Estado Global ligero).
  * Routing: React Router Dom.
  * Estilos: Glassmorphism y utilidades Tailwind CSS.
  * Compatibilidad: Optimizado para React 19 (Evitando librerías legacy como `reactflow@11` en favor de `@xyflow/react`).
* **Persistencia (BBDD Local-First):** SQLite WASM (`sqlocal`) sobre OPFS (Origin Private File System).
  * Almacenamiento absoluto de datos en el navegador del cliente. Cero latencia de red.
  * Aislamiento: Requiere cabeceras COOP/COEP inyectadas por el servidor auxiliar.
* **Servidor Auxiliar (Helper):** Java 21 + Spring Web / Jetty.
  * Localizado en `src/main/java`.
  * Empaquetado: Servido mediante un lanzador **Node.js (compilado con `pkg`)** llamado `Chronos Atlas.exe`.
  * Responsabilidad: Gestión de archivos del sistema, inyección de cabeceras de seguridad y servidor de archivos estáticos para la SPA.

## ARQUITECTURA DE DATOS

1. **Entidades Base:** Todo en el mundo es una "Entidad" aislada guardada en formato relacional.
2. **Modularidad:** División estricta por módulos de lore (Atlas, Crónicas, Personajes).

## HISTORIAL DE TRANSICIÓN

Inicialmente concebido como un monolito pesado o una app distribuida. El proyecto ha **completado con éxito** la transición a **Local-First (Vite + SQLocal)**. El **Backend Auxiliar (Java)** se mantiene exclusivamente como un facilitador de sistema para persistencia en disco (Snapshots) y utilidades de entorno.
