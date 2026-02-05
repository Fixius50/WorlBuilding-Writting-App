# Bitácora de Desarrollo y Logs Históricos (05)

Este documento consolida el historial de prompts, decisiones y errores técnicos resueltos durante el desarrollo de WorldbuildingApp.

## 📜 Historial de Prompts y Decisiones

### [2026-02] Refactorización de Documentación

* **Objetivo**: Aplicar "Divide y Vencerás" a la documentación monolítica.
* **Acción**: Separación en estrategia técnica, diseño y roadmap. Creación de `01`, `02`, `03` y `04`.
* **Estado**: Completado. Estructura limpia y numerada.

### [2026-01-26] Migración Gráfica (Cytoscape)

* **Objetivo**: Migrar visualización de grafos a Cytoscape.js.
* **Acción**: Implementación de `GeneralGraphView.jsx` y endpoint `/api/world-bible/graph`.
* **Estado**: Completado. Verificado rendering de nodos.

### [2026-01-26] Estabilización (Entity Persistence)

* **Objetivo**: Resolver errores 500 y navegación rota en guardado.
* **Acción**: Backend `hydrateEntity` para LazyLoading. Frontend actualización de redirecciones en `EntityBuilder`.
* **Estado**: Completado.

### [2026-01-25] Strict Multi-Tenancy

* **Objetivo**: Eliminar "Prime World" hardcoded.
* **Acción**: Refactor total de controladores para usar sesión estricta.
* **Estado**: Completado. Aislamiento total por archivo SQLite.

---

## 🐛 Registro de Errores Notables (Histórico)

### [Resuelto] `t is not defined` (ProjectView)

* **Fecha**: 2026-02-05
* **Contexto**: Error en `ActionCard` dentro de `ProjectView.jsx`.
* **Causa**: Posible prop drilling fallido de la función de traducción `t`.
* **Estado**: No reproducible en la última revisión de código. Monitorizando.

### [Resuelto] `SQLITE_ERROR: no such column: h1_0.deleted`

* **Fecha**: 2026-01-26
* **Contexto**: Fallo al abrir cuadernos.
* **Causa**: Discrepancia entre Entidades JPA (nuevos campos soft-delete) y esquema SQLite existente.
* **Solución**: Migración manual via `JdbcTemplate` y `ALTER TABLE`.

### [Resuelto] `LazyInitializationException`

* **Contexto**: Serialización de objetos JPA fuera de transacciones.
* **Solución**: Hidratación explícita de relaciones antes de cerrar la sesión de Hibernate.

---

## 📂 Archivos Técnicos Consolidados

### Informe Técnico: Discrepancia en Inicialización de Proyectos

**Fecha:** 25/01/2026 | **Estado:** Resuelto

**Contexto:** Error crítico en la persistencia y recuperación de datos iniciales en nuevos proyectos. El sistema mostraba un comportamiento contradictorio donde los logs de escritura confirmaban inserción pero los de lectura devolvían 404.

**Diagnóstico:**

* **Desalineación SQL/JPA:** Las tablas `carpeta` y `linea_tiempo` incluían columnas `deleted` en SQL (Flyway V1) pero faltaban en las entidades Java y la anotación `@SQLRestriction` estaba ausente.
* **Conflicto Flyway:** Flyway leía scripts desde cache del classpath en lugar de filesystem en tiempo real.

**Solución Final:**

1. Sincronización total de Entidades JPA con Schema SQL (añadidos campos `deleted`).
2. Configuration de Flyway forzada a `filesystem:src/main/resources/db/migration`.
3. Migración a SLF4J para trazabilidad real.

### Registro de Refactorización: Migración Hibernate @Where

**Fecha:** 25/01/2026 | **Tipo:** Eliminación de Deuda Técnica

Hibernate 6.3 marcó como obsoleta `@Where`. Se reemplazó sistemáticamente por `@SQLRestriction("deleted = 0")` en todas las entidades (`Zona`, `NotaRapida`, `EntidadGenerica`, etc.) para asegurar compatibilidad estricta con SQLite (0/1 booleanos).
