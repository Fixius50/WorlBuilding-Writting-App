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
- **Estado**: Resuelto (Backend reiniciado).

## [2026-01-10] Error Pantalla Blanca (Vite Port 5173 / Tiptap)
- **Error**: La aplicación carga en blanco en desarrollo (puerto 5173), aunque build producción (8080) funciona.
- **Causa Inicial**: Conflicto de versiones de Tiptap (v3.15.3 beta/bleeding edge).
- **Acciones**:
  1. Downgrade de librerías Tiptap a `v2.10.3`.
  2. Crash persistente por `index.css` (Resuelto simplificando CSS).
  3. Crash persistente por dependencias faltantes (`@tiptap/extension-color`, etc.) que no se instalaron en el downgrade inicial.
- **Estado Actual**:
  - La aplicación carga correctamente ("Green Screen" superada).
  - **Aislado**: El componente `WritingView` (o `ZenEditor`) causa un crash al importarse. Se ha comentado su ruta en `App.jsx` para permitir el acceso al menú principal.
- **Investigación (23:45)**:
  - Se detectó que `TiptapExtensions.js` importa `MergeAttributes` directamente de `@tiptap/core`.
  - `@tiptap/core` NO está listado en `package.json`. Esto causa un fallo de resolución de módulo en Vite al iniciar.
- **Acción Correctiva**: Instalar `@tiptap/core` explícitamente y re-habilitar el editor.
- **Nuevo Hallazgo (00:05)**:
  - Error al compilar: `No matching export in ... for import "canInsertNode"`.
  - Origen: `@tiptap/extension-horizontal-rule` intenta usar una función que no existe en `@tiptap/core` v2.10.3.
  - Causa: Desajuste de versiones (Version Mismatch). Es probable que `starter-kit` haya instalado una versión más reciente de `horizontal-rule` que es incompatible con el `core` v2.10.3 forzado.
- **Estabilización (00:20)**:
  - Se eliminó Tiptap por completo y se reemplazó `ZenEditor` con un `<textarea>` nativo.
  - **Resultado**: La aplicación carga correctamente y es estable. Se confirma que el origen de todos los crashes era la librería Tiptap y sus dependencias.
- **Intento Final (00:23)**:
  - Se re-instaló Tiptap v2.10.3 estricto.
  - **Resultado**: Fallo persistente (White Screen) en Vite.
- **Resolución Definitiva**: 
  - Se ha **eliminado Tiptap** del proyecto.
  - Se ha implementado un componente `ZenEditor` nativo (textarea estilizado) que garantiza estabilidad.
  - **Alternativa Propuesta**: React-Quill (Implementado).
- **Implementación React-Quill (00:30)**:
  - Se instaló `react-quill`.
  - Se reemplazó `ZenEditor` con una instancia de Quill configurada con toolbar completa (Google Docs style) y estilos CSS personalizados para el modo oscuro/Zen.
  - Se restauró `index.css` a su estado original.
  - **Resultado**: ÉXITO. El usuario confirma "carga y va la app". Editor estable y estilos restaurados.
- **Nuevo Error Backend (00:33)**: 
  - `500 Internal Server Error` en `/api/escritura/cuaderno/1/hojas`.
  - **Causa**: `spring.jpa.hibernate.ddl-auto` estaba en `create` (reseteando DB) pero fallaba al crear las tablas por bloqueos o configuración, o simplemente borraba los datos.
  - **Solución (2026-01-13)**: Se cambió `ddl-auto` a `update` en `application.properties`. Se verificó Entidad `Hoja.java`.
  - **Estado**: Resuelto.

## [2026-01-13] Inconsistencia Frontend Zen Editor
- **Error**: El código fuente mostraba `Tiptap` v3.15.3 instalado y en uso, a pesar de que los logs decían que se había reemplazado por Quill.
- **Acción**: Se ha reescrito `ZenEditor.jsx` para usar `React-Quill` (ya instalado en package.json), aplicando estilos Dark Mode.
- **Estado**: Implementado.
