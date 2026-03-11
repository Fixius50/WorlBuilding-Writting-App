# BITÁCORA MAESTRA DE DESARROLLO

Este documento consolida el registro sistemático y de desarrollo de WorldbuildingApp para una trazabilidad total.

## 🕒 CRONOLOGÍA DE HITOS (2026)

### MARZO 2026

- **2026-03-11: Migración a Motor Rust y Base de Datos Integrada**
  - **SQLite Embebido:** Conexión nativa a base de datos SQLite gestionada desde Rust (`rusqlite`) con mecanismo de Fallback Anti-Crash.
  - **IPC Serverless:** Enlace bidireccional puro entre React UI y Rust a través de `tauri_commands` dejando obsoleto el uso de un servidor HTTP local en desarrollo.

- **2026-03-08: Transición Definitiva a Desktop Nativo (Adiós Java)**
  - **Reestructuración Frontend:** Feature-Sliced Design implementado, consolidando modularidad en React/Vite.
  - **Cambio de Ecosistema:** Se abandona la arquitectura pesada de Servidor (Java Spring Boot) por su incompatibilidad conceptual con apps Desktop.
  - **Integración Tauri:** Transición final de prototipos hacia Tauri + Rust puro.

- **2026-03-01: Visualización Avanzada y Swarm Intelligence**
  - **Línea Temporal:** Refactorización de `TimelineView.jsx` para integrar el eje horizontal interactivo con estética Dark Glassmorphism.
  - **Interfaz:** Creación de `TimelineEventCard.jsx` y centralización de estilos CSS en `src/main/frontend/css/`.
  - **Identidad:** Generación del icono oficial 'Chronos Atlas' para el empaquetado `.exe`.
  - **Roles de Enjambre:** Adopción de la estrategia de perfiles CEREBRO, INVESTIGADOR, ARQUITECTO y AUDITOR.

- **2026-03-01: Cimientos Antiguos (Backend Obsoleto)**
  - **Arquitectura Legacy:** Implementación inicial (descartada) de `UniversoController` y persistencia por jerarquía.

### FEBRERO 2026

- **2026-02-28: World Bible & Tiptap**
  - **Editor:** Integración de Tiptap con sistema dinámico de menciones mediante `@`.
  - **Estabilidad:** Corrección de bucles infinitos en el renderizado del Dashboard.
  - **Diseño:** Establecimiento de los primeros estándares de Glassmorphism.

## 🔴 ALERTAS Y ERRORES DOCUMENTADOS

- ~~**JPackage EXEs:** (Resuelto Arquitectónicamente).~~ Al descartar Java, el empaquetador será Electron Builder.
- **IPC Handlers:** Faltan por portar los manejadores de base de datos SQLite de Java al TypeScript nuevo.

## 🎯 PRÓXIMAS PRIORIDADES

1. Integración del visor de mapas (Leaflet/Mapbox).
2. Optimización de rendimiento para bases de datos de entidades extensas.
