# Arquitectura: Híbrida Frontend-Centric + Servidor Auxiliar

Este documento describe la arquitectura oficial de la aplicación, tras abandonar los contenedores de escritorio basados en Chromium (Electron/Tauri) a favor de un entorno **Desacoplado y Local-First**.

## Principio Básico: Thick Frontend & Thin Backend

El diseño se basa en una distribución de responsabilidades donde el navegador (o webview del SO) es el actor principal:

### 1. Motor de Datos y Estado (Frontend)
- **Persistencia Directa**: La base de datos SQLite vive en el frontend gracias a `SQLocal` (tecnología WASM). No hay peticiones de red para leer o guardar entidades base (Cuadernos, Personajes, Grafos).
- **Lógica de Negocio**: React (Zustand) mantiene el estado complejo, el filtrado y las relaciones del grafo.

### 2. Motor Auxiliar de Sistema (Spring v4 + Java 24)
- **Rol Secundario**: El servidor Java solo interviene cuando el Frontend lo solicita para tareas fuera del alcance de la web (E/S de archivos profunda del usuario, renderizado de IA nativo, procesos intensivos y prolongados).
- **Compatibilidad**: Se utiliza Spring 4.3.x por diseño legacy especificado, bajo el runtime de vanguardia Java 24.
- **Comunicación**: Peticiones HTTP REST estándar u opcionalmente WebSockets si se requiere asincronía de servidor.

## Ventajas del Modelo
1. **Velocidad Extrema del CRUD**: Guardar un nodo del grafo o un párrafo del `ZenEditor` es inmediato; la escritura a SQLite en WASM es síncrona/rápida en el cliente.
2. **Estabilidad Estructural**: Si el proceso de UI se "cuelga", el backend (si está activo para otra tarea) no colapsa, a diferencia de los procesos render/main de Electron.
3. **Despliegue Portable**: La app visual es estática. El backend auxiliar es un `.jar`. Ambos conviven pero no se rompen mutuamente.

---
© 2026 - WorldbuildingApp Architecture Docs
