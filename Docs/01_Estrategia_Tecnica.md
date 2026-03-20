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
* **Servidor Auxiliar:** Java 21 + Spring WebMVC (Jetty Embebido).
  * Un micro-servidor localizado en `server-aux`.
  * Responsabilidad: Funciones de interacción nativa (gestión del navegador, endpoints del sistema, scripts) que escapan al sandbox de React. Funciona estrictamente como un helper, no como monolito.

## ARQUITECTURA DE DATOS

1. **Entidades Base:** Todo en el mundo es una "Entidad" aislada guardada en formato relacional.
2. **Modularidad:** División estricta por módulos de lore (Atlas, Crónicas, Personajes).

## HISTORIAL DE TRANSICIÓN

Inicialmente concebido como un monolito pesado. El proyecto pivota y aprueba unívocamente el uso del stack **React + sqlocal (WASM)** en el frontend puro como solución hiperveloz y offline, manteniendo un **Backend Auxiliar Ligero (Java/Spring)** únicamente para rutinas locales de sistema imperativas.
