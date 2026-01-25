# Registro de Refactorización: Migración Hibernate @Where

**Fecha:** 25/01/2026
**Tipo de Cambio:** Refactorización Técnica / Eliminación de Deuda Técnica
**Estado:** Completado

## Contexto

Hibernate 6.3 marcó como obsoleta (deprecated) la anotación `@Where`, recomendando el uso de `@SQLRestriction` para definir filtros SQL a nivel de entidad.

## Cambio Implementado

Se ha reemplazado sistemáticamente la anotación:

```java
@Where(clause = "deleted = false")
```

Por la nueva sintaxis estándar:

```java
@SQLRestriction("deleted = 0")
```

**Nota sobre la sintaxis:** Se utiliza explícitamente `deleted = 0` en lugar de `false` para garantizar la compatibilidad total con el dialecto de SQLite, que almacena los valores booleanos como enteros (`0`/`1`).

## Archivos Afectados

La migración se aplicó a las siguientes entitades del paquete `com.worldbuilding.app.model`:

1. `Zona.java`
2. `NotaRapida.java`
3. `Interaccion.java`
4. `Hoja.java`
5. `EntidadIndividual.java`
6. `EntidadGenerica.java`
7. `EntidadColectiva.java`
8. `Efectos.java`
9. `Construccion.java`

*Nota: `Carpeta.java` y `Cuaderno.java` ya contaban con la configuración correcta previamente.*

## Verificación

* Se realizó una búsqueda global (`grep`) para asegurar que no quedaban referencias a `@Where`.
* El proyecto compila correctamente (`mvn compile`), confirmando que las nuevas anotaciones son válidas y reconocidas.
