# Integración Módulo Timeline (Cronologías)

**Fecha:** 07/01/2026
**Estado:** Completado / Estable

## Resumen
Se ha completado la integración del módulo de **Líneas de Tiempo** en la interfaz principal (`ArchitectLayout`), moviéndolo de una vista aislada a un panel lateral contextual (Right Sidebar) y una visualización central dedicada. Además, se han resuelto errores críticos de persistencia y sincronización.

## Cambios Realizados

### 1. Arquitectura Frontend (React)
- **Integración en `ArchitectLayout.jsx`**:
    - Se ha habilitado el modo `CUSTOM` en el panel lateral derecho para inyectar componentes dinámicos mediante **React Portals**.
    - `TimelineView.jsx` ahora renderiza los formularios de creación/edición de eventos en el sidebar derecho, manteniendo la visualización del grafo en el centro.
- **Sincronización de Contexto**:
    - Se implementó un `focus listener` en `ArchitectLayout` que fuerza la recarga del contexto del proyecto (`loadProject`) al cambiar de pestaña en el navegador. Esto corrige el error de mezcla de datos entre proyectos abiertos simultáneamente.

### 2. Backend (Spring Boot)
- **Consolidación de Entidades**:
    - Se eliminaron las clases redundantes `EventoCronologia` y `LineaTemporal`.
    - Se estandarizó el uso de `EventoTiempo` y `LineaTiempo`.
- **Nuevos Endpoints**:
    - `DELETE /api/timeline/evento/{id}`: Para borrado de eventos.
    - `DELETE /api/timeline/linea/{id}`: Para borrado de líneas de tiempo completas.
- **Optimización JSON**:
    - Se añadió `@JsonProperty(access = WRITE_ONLY)` en las relaciones bidireccionales (`EventoTiempo` -> `LineaTiempo`) para permitir la deserialización (guardado) sin causar recursión infinita en la serialización (lectura).

### 3. Corrección de Errores (Bugfixes)
- **Error de Borrado (Timeline y Eventos)**:
    - **Causa**: Faltaban los endpoints `DELETE` en el controlador y `api.js` fallaba al procesar respuestas vacías (`204 No Content`).
    - **Solución**: Implementación de endpoints y parcheo de `api.js` para devolver `null` en lugar de lanzar `SyntaxError` en respuestas vacías.
- **Error "No events yet"**:
    - **Causa**: El filtrado en cliente fallaba porque la relación `lineaTiempo` no se enviaba al cliente (por `@JsonIgnore`).
    - **Solución**: Se cambió a filtrado en servidor (`/timeline/linea/{id}/eventos`).
- **Ordenamiento de Eventos Negativos**:
    - **Solución**: Se corrigió la lógica de sugerencia de orden para respetar fechas negativas (a.C.), evitando que el contador se reinicie a 1 incorrectamente.

## Archivos Clave Modificados
- `src/main/frontend/jsx/pages/Timeline/TimelineView.jsx`
- `src/main/frontend/jsx/components/layout/ArchitectLayout.jsx`
- `src/main/frontend/js/services/api.js`
- `src/main/java/com/worldbuilding/app/controller/TimelineController.java`
- `src/main/java/com/worldbuilding/app/model/EventoTiempo.java`
