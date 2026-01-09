# Log de Errores

## [2026-01-08] Error de Compilación: Método No Definido
- **Error**: `The method getFolderDetail(Long) is undefined for the type WorldBibleService` en `WorldBibleController.java`.
- **Causa**: El método `getFolderDetail` faltaba en el servicio `WorldBibleService`, aunque era invocado desde el controlador.
- **Solución**: Se implementó el método `getFolderDetail(Long id)` en `WorldBibleService.java`. El método devuelve un mapa con los detalles de la carpeta y su ruta (breadcrumbs).
- **Estado**: Resuelto.

## [2026-01-08] Error de Persistencia y Visualización (404)
- **Error**: `TypeError: Cannot read properties of null (reading 'id')` al guardar entidades, y "Unnamed Folder" / 404 al acceder a carpetas renombradas.
- **Causa**:
  1. Frontend: `EntityBuilder` no manejaba carpetas nulas (ocasionado por fallo de carga).
  2. Backend: Renombrar carpeta cambiaba el `slug`, rompiendo la URL en el frontend y causando 404.
- **Solución**:
  1. **Backend**: Se desactivó la actualización automática del slug en `WorldBibleService.java` al renombrar.
  2. **Frontend**: Se añadió protección contra nulos en `EntityBuilder.jsx` y redirección automática en `FolderView.jsx` si se detecta cambio de slug.
- **Estado**: Resuelto (Requiere reinicio de Backend).

## [2026-01-09] Error de Serialización Backend (Hibernate Proxy)
- **Error**: `HttpMessageConversionException` ... `ByteBuddyInterceptor` al acceder a `.../entities`.
- **Causa**: Jackson intentaba serializar el proxy de Hibernate generado para la relación Lazy `AtributoValor.plantilla`.
- **Solución**: Se añadió `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` a la clase `AtributoPlantilla` para evitar la serialización de los campos internos del proxy.
- **Estado**: Resuelto (Requiere reinicio de Backend).

## [2026-01-09] Error de Base de Datos Missing Table (SQLite)
- **Error**: `SQLITE_ERROR: no such table: hoja`.
- **Causa**: Fallo en creación automática de esquema (`ddl-auto=create`).
- **Solución**: Cambiado `ddl-auto` a `update` en `application.properties`.
- **Estado**: En espera de reinicio.
