# Roadmap Vivo

## Estado Actual

- **Fase**: Consolidación de Herramientas de Worldbuilding.
- **Hito Reciente**: Unificación del motor de dibujo (`UniversalCanvas`) y eliminación de código legado.

## Próximos Pasos (Prioridad Alta)

- [ ] **Validación de UniversalCanvas**: Confirmar que todas las herramientas (pincel, líneas, formas) funcionan en el nuevo componente.
- [ ] **Integración de Capas**: Asegurar que la gestión de capas en el panel de propiedades afecte al lienzo correctamente.
- [ ] **Persistencia**: Verificar que los glifos creados se guarden y carguen correctamente desde el backend.

## Backlog Técnico

- [ ] Refactorizar `MapEditor` para usar `UniversalCanvas` (a futuro).
- [ ] Implementar sistema de "Snapping" o guías en el lienzo.
- [ ] Mejorar el rendimiento del renderizado con muchos objetos en Konva.
