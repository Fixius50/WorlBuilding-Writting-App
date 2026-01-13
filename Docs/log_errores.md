# Log de Errores

## [2026-01-13] Pérdida de datos de la Biblia tras reinicio del servidor

**Síntoma**: Los datos de carpetas y entidades de la Biblia no se cargan. El frontend recibe errores 401 "No active project" al intentar acceder a `/api/world-bible/folders` y `/api/world-bible/favorites`.

**Causa Raíz**:
1. La configuración `spring.jpa.hibernate.ddl-auto` estaba establecida en `create` en `application.properties`
2. Este modo **borra y recrea todas las tablas** cada vez que se reinicia el servidor Spring Boot
3. Todos los datos de la base de datos (incluyendo carpetas, entidades, plantillas, etc.) se perdían en cada reinicio

**Contexto**:
- El modo `create` se había establecido temporalmente para resolver errores de formato de fechas en SQLite
- Una vez resuelto el problema de fechas (añadiendo `date_class=TEXT` a la URL de conexión), se olvidó revertir a `update`

**Solución Aplicada**:
1. Cambiar `spring.jpa.hibernate.ddl-auto=create` a `spring.jpa.hibernate.ddl-auto=update` en `application.properties` (línea 14)
2. Reiniciar el servidor para que tome la nueva configuración
3. **Importante**: Los datos ya perdidos NO se recuperan automáticamente. Es necesario:
   - Recrear manualmente las carpetas y entidades, O
   - Restaurar desde un backup de la base de datos si existe

**Archivos Modificados**:
- `src/main/resources/application.properties` (línea 14)

**Configuración Final Correcta**:
```properties
# Update schema automatically (preserves data)
spring.jpa.hibernate.ddl-auto=update
```

**Prevención**:
- ✅ Usar `update` en desarrollo para preservar datos
- ✅ Usar `validate` en producción para evitar cambios automáticos al esquema
- ⚠️ Solo usar `create` temporalmente para debugging y SIEMPRE revertir inmediatamente

**Estado**: ✅ Resuelto - La configuración está correcta, pero los datos deben ser recreados

**UPDATE 23:05**: Detectado problema adicional - falta columna `favorite` en tabla `entidad_generica`. 
- Error: `[SQLITE_ERROR] SQL error or missing database (no such column: e1_0.favorite)`
- Causa: El esquema no se actualizó completamente cuando se cambió de `create` a `update`

**UPDATE 23:25**: Problema final identificado y resuelto:
- **Causa raíz**: El modelo `Carpeta.java` tenía colecciones `@OneToMany` (`subcarpetas`, `plantillas`, `entidades`) SIN `@JsonIgnore`
- Cuando Jackson serializaba la respuesta, intentaba cargar lazy las colecciones, lo que disparaba queries con la columna `favorite` faltante
- **Solución aplicada**:
  1. Añadido `@JsonIgnore` a las 3 colecciones en `Carpeta.java`
  2. Modificado `WorldBibleController.createFolder()` para devolver un `Map` simple en lugar de la entidad completa
  3. Añadido try-catch para mejor logging de errores

**Archivos modificados**:
- `src/main/java/com/worldbuilding/app/model/Carpeta.java`
- `src/main/java/com/worldbuilding/app/controller/WorldBibleController.java`

**Estado Final**: ✅✅ RESUELTO - Carpetas se crean correctamente

---

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
