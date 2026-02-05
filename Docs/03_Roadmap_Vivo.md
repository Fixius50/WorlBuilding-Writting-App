# Roadmap y Estado del Proyecto (03)

Registro vivo de tareas, hitos completados y deuda técnica.

## 🔴 Prioridad Inmediata (Next Steps)

1. **Refinamiento Editor de Mapas**:
    * [ ] **Persistencia**: Verificar que las capas complejas se guardan correctamente en `json_attributes`.

---

## 🟢 Hitos Completados (Histórico)

### Febrero 2026 - Sprint de Calidad

* [x] **Map Editor Fix**: Corregido bug de selección/deselección. El fondo ahora actúa como zona neutra.
* [x] **UI Check**: Verificado `ProjectView.jsx` para error `t is not defined`. No reproducible en código actual.
* [x] **Doc Refactor**: Separación de estrategia en documentos técnicos, de diseño y roadmap (`00` a `04`).

### Febrero 2026 - Análisis de Arquitectura

* [x] **Core Upgrade**: Confirmado Spring Boot 4.0.2.
* [x] **Graph Engine**: Implementado `GeneralGraphView.jsx` con Cytoscape.js.
* [x] **Metadata Real**: `ProjectDiscoveryService` lee títulos e imágenes reales de los archivos SQLite (Adios Mocks).
* [x] **Map Editor Base**: Implementado con Konva y almacenamiento Backend.

### Enero 2026 - Estabilidad

* [x] **LazyInitializationFix**: Solucionado error de carga perezosa con hidratación profunda en `WorldBibleService`.
* [x] **Navegación Robusta**: Redirección correcta tras guardar entidades nuevas.
* [x] **Backup V2**: Sistema de exportación ZIP limpio (solo `.db`).

---

## Plan Maestro de Migración (Legacy References)

### Deuda Técnica Resuelta

* **Flyway**: Implementado orquestador manual para Multi-Tenant SQLite.
* **JSON Attributes**: Columna añadida a `EntidadGenerica` para flexibilidad futura sin migraciones SQL constantes.

### Futuras Expansiones (Icebox)

* **Electron Desktop App**: Empaquetar todo en un ejecutable único.
* **Sincronización Cloud**: Adaptador para PostgreSQL/Supabase.
