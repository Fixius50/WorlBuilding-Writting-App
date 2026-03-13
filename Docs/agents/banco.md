# BANCO DE CONTEXTO TÉCNICO GLOBAL
**Proyecto:** WorldbuildingApp (Chronos Atlas)
**Dominio:** Escritura de sci-fi, gestión jerárquica de mundos, timelines y conlangs.

## Stack Actual Acordado:
- **Frontend Core:** React 18, HTML/CSS puro (sin Tailwind para mayor control visual "Dark Glassmorphism").
- **Tipado:** TypeScript estricto.
- **Datos (Local-First):** SQLite compilado a WASM, ejecutándose en el Thread de Web Workers. Almacenamiento en origen privado (OPFS). Wrapper preferido: `sqlocal`.
- **Desktop:** Electron (Empaquetado offline).
- **Adiós a:** Java (Spring Boot), Rust (Tauri), IndexedDB plana.

## Reglas de Interfaz (Inviolables):
1. **Lógica Visual Rica:** Uso de gradientes HSL (variables `--surface-light`, `--background-dark`), blur-backdrop y transiciones suaves (`micro-animations`).
2. Estado Global y Routing via React Router `Outlet` contextuado.

*Lee este archivo siempre antes de proponer cambios fuertes de arquitectura.*
