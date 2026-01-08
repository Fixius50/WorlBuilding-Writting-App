# Log de Errores

## [2026-01-08] Error de Compilación: Método No Definido
- **Error**: `The method getFolderDetail(Long) is undefined for the type WorldBibleService` en `WorldBibleController.java`.
- **Causa**: El método `getFolderDetail` faltaba en el servicio `WorldBibleService`, aunque era invocado desde el controlador.
- **Solución**: Se implementó el método `getFolderDetail(Long id)` en `WorldBibleService.java`. El método devuelve un mapa con los detalles de la carpeta y su ruta (breadcrumbs).
- **Estado**: Resuelto.
