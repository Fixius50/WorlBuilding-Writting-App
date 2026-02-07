# Roadmap Vivo

## Estado Actual

El proyecto se encuentra en la **Fase 2 (Creador)**, con el núcleo de la Worldbuilding App funcional y en proceso de pulido estético y funcional de las herramientas especializadas (Atlas, Timeline, Grafos).

## Tareas por Módulo

### Biblia y Entidades

- [x] Corrección de crash ‘isCreating’ en la Biblia
- [x] Robustecimiento de `EntityBuilderSidebar.jsx`
- [x] Soporte para duplicación de entidades/mapas con `carpetaId`

### Atlas (Cartografía)

- [x] Migración del panel de detalles al Portal Global (`CONTEXT`)
- [x] Implementación de 'Herramientas Globales' en panel derecho (Multicapa, N:M)
- [x] Sincronización de apertura de panel al seleccionar mapas

### Cronología (Timeline)

- [x] Sincronización de eventos al cambiar de línea temporal (Multiverso)
- [x] Limpieza de estado de eventos al deseleccionar
- [x] Unificación de pestaña a `CONTEXT`

### Grafo de Relaciones

- [x] Implementación de **Edición In-Situ** (Inputs directos en el panel)
- [x] Truncamiento de valores largos y base64 (Elipsis a 100 caracteres)
- [x] Corrección de redireccionamiento (Mantenimiento en la vista de Grafo)

## Próximos Pasos (Prioridad Alta)

- [ ] Implementar la funcionalidad real de los botones 'Multicapa' y 'N:M' vinculados al motor de Leaflet.
- [ ] Refactorizar el renderizado de etiquetas en el Grafo para mayor legibilidad.
