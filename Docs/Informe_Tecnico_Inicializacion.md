# Informe Técnico: Discrepancia en Inicialización de Proyectos

**Fecha:** 25/01/2026
**Estado:** Resuelto
**Contexto:** Error crítico en la persistencia y recuperación de datos iniciales (Biblia y Cronología) en nuevos proyectos.

## 1. La Discrepancia Observada

El sistema mostraba un comportamiento contradictorio:

1. **Logs de Escritura (Service):** Confirmaban una inserción exitosa de datos (`INSERT INTO cuaderno... executed`, `Rows: 1`).
2. **Logs de Lectura (API/Controller):** Devolvían listas vacías o estado 404 inmediatamente después de la creación.
3. **Logs de Base de Datos:** `MultiTenantDataSource` indicaba que se estaba conectando a la base de datos correcta.

## 2. Diagnóstico y Causas Raíz

### A. Desalineación Esquema-Entidad (Causa Principal)

Se identificó una ruptura en la consistencia entre el modelo de datos físico (SQL) y el modelo lógico (Java/Hibernate):

* **SQL (Flyway V1):** Las tablas `carpeta` y `linea_tiempo` incluían las columnas `deleted` (BOOLEAN) y `deleted_date` (DATETIME) como parte de la estrategia de borrado lógico.
* **Java (JPA):** Las entidades `Carpeta.java` y `LineaTiempo.java` carecían de los campos correspondientes y, más críticamente, de la anotación `@SQLRestriction("deleted = 0")`.

**Efecto:** Aunque los datos se insertaban (con SQL nativo en `ProjectDiscoveryService`), Hibernate no gestionaba correctamente el ciclo de vida de estos registros en consultas subsiguientes, y existía el riesgo latente de recuperar datos "borrados" o fallar en operaciones que esperaban la columna.

### B. Conflicto de Rutas y Migraciones (Flyway)

* **Problema:** Flyway estaba configurado para leer migraciones desde `classpath:db/migration`, lo que provocaba que leyera versiones cacheadas o incompletas de los scripts SQL en lugar de los archivos fuente editados en tiempo real.
* **Efecto:** En algunos intentos, la base de datos se creaba sin las columnas `deleted`, provocando fallos silenciosos en inserciones o lecturas inconsistentes.
* **Solución:** Se forzó el uso de `filesystem:src/main/resources/db/migration` y se consolidó el esquema en un único archivo `V1__Initial_Schema.sql`.

### C. Silenciamiento de Logs

* **Problema:** El uso de `System.out.println` no garantizaba la aparición de trazas en el log del servidor gestionado por Spring Boot/Tomcat.
* **Solución:** Se migró a `SLF4J` (Logger) en `ProjectDiscoveryService` y `MultiTenantDataSource`, revelando la ruta exacta de los archivos `.db` y confirmando la unificación de contextos.

## 3. Conclusiones y Solución Final

La discrepancia no era un fallo único, sino una cadena de fallos de configuración e integridad:

1. **Consistencia SQL/Java:** Es imperativo que cualquier cambio en scripts de Flyway se refleje inmediatamente en las Entidades JPA. Se añadieron los campos `deleted` y las anotaciones `@SQLDelete` y `@SQLRestriction`.
2. **Atomicidad de Migraciones:** Para desarrollo local, es más seguro consolidar migraciones en un archivo maestro (V1) que manejar múltiples deltas pequeños que pueden desincronizarse.
3. **Gestión de Rutas:** La resolución de la ruta de la base de datos SQLite debe ser idéntica para el servicio de creación y el DataSource dinámico. Se verificó que lógica coincida.

## 4. Estado Actual

El sistema ahora crea proyectos ("Genesis", "PathFinal2") con toda su estructura de carpetas y líneas de tiempo iniciales correctamente persistidas y accesibles vía API.
