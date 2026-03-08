# ESTRATEGIA TÉCNICA Y STACK

Este documento define las decisiones arquitectónicas clave del proyecto tras la transición a una arquitectura de Escritorio Nativo (Desktop App).

## STACK TECNOLÓGICO ACTUAL (MIGRADO A ELECTRON)

* **Contenedor / Empaquetado:** **Electron.js**
  * Generación de ejecutables nativos (`.exe`) para Windows sin requerir Java ni JRE.
  * Arquitectura "Main Process" en Node.js puro para manejo del hardware local.
* **Frontend (UI):** React 18+ con Vite (Feature-Sliced Design).
  * Estado: Context API + Zustand (Manejador de Estado Global ligero).
  * Routing: React Router Dom.
  * Estilos: Glassmorphism y utilidades a medida (CSS Modules / Tailwind parcial).
* **Backend (Lógica Local):** TypeScript Nativo.
  * Corre en el Main Process de Electron simulando una arquitectura de Servicios Inyectables.
  * Comunicación: Eventos asíncronos limpios mediante el canal IPC (`ipcMain` / `ipcRenderer`).
* **Persistencia:** Base de Datos Embebida (SQLite vía `better-sqlite3`).
  * Almacenamiento absoluto de datos en local. No hay peticiones web a servidores externos.
  * Búsqueda: Motor FTS5 integrado en SQLite para consultas Full-Text instantáneas.

## ARQUITECTURA DE DATOS

1. **Entidades Base:** Todo en el mundo es una "Entidad" aislada guardada en formato relacional.
2. **Modularidad:** División estricta por módulos de lore (Atlas, Crónicas, Personajes).

## HISTORIAL DE TRANSICIÓN

Inicialmente concebido como un monolito en `Java 21 + Spring Boot 3`. La plataforma demostró problemas de consumo excesivo de memoria RAM (>500MB) para un cliente local y complejidades en la distribución del `.exe` (JPackage). El proyecto pivota y aprueba unívocamente el uso del stack **TypeScript/Electron** como solución hiperveloz, offline, y con un diseño de componentes puro.
