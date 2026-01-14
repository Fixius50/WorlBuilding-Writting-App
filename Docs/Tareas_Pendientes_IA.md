# Tareas Pendientes y Roadmap (Guía para IA)

Este documento resume el estado actual del proyecto y las tareas críticas que deben abordarse en las próximas sesiones de desarrollo.

## Estado Actual
- **Editor de Mapas**: Funcional en estructura (Panel Derecho de Ajustes, Guardado) pero falta la interactividad real del Canvas.
- **Biblia**: Navegación por carpetas funcional, creación de entidades y mapas operativa.
- **Interfaz**: Migrada a un diseño de 3 paneles (Explorer, Canvas, Contexto).

## 1. Prioridad Alta: Editor de Mapas
El esqueleto está listo, pero falta el motor gráfico.
- [x] **Re-integrar Konva/Canvas**:
    - Actualmente `MapEditor.jsx` usa un `CanvasPlaceholder` (Corregido: ahora usa `Stage` y `Layer`).
    - Hay que descomentar y adaptar la lógica de `react-konva` (Stage, Layers, Transformers) que está comentada o fue simplificada.
    - Sincronizar el Canvas real con el `gridSize` y `bgImage` del panel derecho.
- [x] **Herramientas de Dibujo**:
    - Implementar lógica para las herramientas de la barra izquierda (Pincel, Figuras, Texto).
    - Conectar estas herramientas con el estado de Konva.

## 2. Refactorización del Constructor de Entidades (`EntityBuilder`)
El constructor actual es funcional pero necesita alinearse con el nuevo diseño de "Panel Derecho Global".
    - [x] Migrar Tabs al Panel Derecho (Completado).
- [x] **Mejoras en Identidad**:
    - [x] Añadir campo "Apariencia" (Texto rico o imagen).
    - [x] Permitir subir icono personalizado (Local Image) para la entidad.

## 3. Mejoras de "Calidad de Vida" (UX)
- [x] **Renombrar en Sidebar**: Añadir opción "Rename" al menú contextual del árbol lateral (Hecho).
- [x] **Breadcrumbs**: Implementar migas de pan en la vista de carpetas para mejorar la navegación profunda.
- [ ] **Favoritos**: Sección en el sidebar para acceso rápido a entidades frecuentes.

## 4. Refactorización Técnica y Backend (Desde TODOs) [COMPLETADO ESTA SESIÓN]
Tareas extraídas de `WorldBibleController.java`:
- [x] **Restaurar Explorador Lateral**: Limpiar el sidebar para mostrar solo estructura de carpetas relevante.
- [x] **Rutas de Creación Directa**: Implementar rutas como `/new/:type` para acceso rápido.
- [x] **Guardado Diferido (Post-draft)**: Permitir crear entidades en memoria y solo persistir al guardar (evitar basura en DB).
- [x] **Refactorización Flujo de Creación (Sin Prompts)**: Reemplazado todos los `window.prompt` por `InputModal` o edición en línea.
- [x] **Breadcrumbs**: Implementado en Backend (`FolderDetail`) y Frontend (`Breadcrumbs.jsx`).
- [x] **Herencia de Plantillas**: Completado mediante la implementación de **Atributos Globales**.

## 5. Implementación del Editor de Texto "Zen" (Nueva Fase)
Objetivo: Crear una zona de escritura limpia, minimalista y personalizada.
- [x] **Setup Inicial**: Se ha optado por **React-Quill** en lugar de Tiptap debido a estabilidad.
- [x] **Diseño "Zen" UI**: Implementado mediante CSS personalizado en `ZenEditor.jsx` (Dark Mode, bordes ocultos).
- [x] **Sistema de Menciones (@)**: Implementado en `ZenEditor.jsx` usando `quill-mention` y API de entidades.
- [x] **Toolbar**: Integrada toolbar estilo Google Docs (Snow theme) con overrides oscuros.

## Tareas Completadas Recientemente 
- [x] **Gestión de Plantillas Globales, UX EntityBuilder, Consistencia UI**.
- [x] **Corrección de Errores Críticos (Persistencia y Visualización)**.
