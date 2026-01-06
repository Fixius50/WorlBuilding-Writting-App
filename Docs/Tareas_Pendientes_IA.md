# Tareas Pendientes y Roadmap (Guía para IA)

Este documento resume el estado actual del proyecto y las tareas críticas que deben abordarse en las próximas sesiones de desarrollo.

## Estado Actual
- **Editor de Mapas**: Funcional en estructura (Panel Derecho de Ajustes, Guardado) pero falta la interactividad real del Canvas.
- **Biblia**: Navegación por carpetas funcional, creación de entidades y mapas operativa.
- **Interfaz**: Migrada a un diseño de 3 paneles (Explorer, Canvas, Contexto).

## 1. Prioridad Alta: Editor de Mapas
El esqueleto está listo, pero falta el motor gráfico.
- [ ] **Re-integrar Konva/Canvas**:
    - Actualmente `MapEditor.jsx` usa un `CanvasPlaceholder`.
    - Hay que descomentar y adaptar la lógica de `react-konva` (Stage, Layers, Transformers) que está comentada o fue simplificada.
    - Sincronizar el Canvas real con el `gridSize` y `bgImage` del panel derecho.
- [ ] **Herramientas de Dibujo**:
    - Implementar lógica para las herramientas de la barra izquierda (Pincel, Figuras, Texto).
    - Conectar estas herramientas con el estado de Konva.

## 2. Refactorización del Constructor de Entidades (`EntityBuilder`)
El constructor actual es funcional pero necesita alinearse con el nuevo diseño de "Panel Derecho Global".
- [ ] **Migrar Tabs al Panel Derecho**:
    - Las pestañas "Notas", "Plantillas" y "Multimedia" deberían residir en el `ArchitectLayout` (zona derecha), similar a como se hizo con el Mapa.
- [ ] **Mejoras en Identidad**:
    - Añadir campo "Apariencia" (Texto rico o imagen).
    - Permitir subir icono personalizado (Local Image) para la entidad.

## 3. Mejoras de "Calidad de Vida" (UX)
- [ ] **Renombrar en Sidebar**: Añadir opción "Rename" al menú contextual del árbol lateral.
- [ ] **Breadcrumbs**: Implementar migas de pan en la vista de carpetas para mejorar la navegación profunda.
- [ ] **Favoritos**: Sección en el sidebar para acceso rápido a entidades frecuentes.

## Notas Técnicas
- **Persistencia**: Recuerda que `EntidadGenerica` usa un campo `descripcion` (String/JSON) para guardar datos complejos. Para los mapas, esto incluye capas, imágenes en base64 (o URLs) y metadatos.
- **Contexto Global**: `ArchitectLayout` usa `useOutletContext` para pasar estados del Panel Derecho (`rightPanelMode`, `setMapSettings`, etc.) a las páginas hijas. Todo nuevo editor debe engancharse a este contexto.
