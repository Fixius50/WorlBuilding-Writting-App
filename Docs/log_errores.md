# ERROR REPORT (Global Window Error)

**Timestamp:** 2026-01-25T21:27:58.345882300
**Message:** Uncaught TypeError: handleCreateEntity is not a function

## Stack Trace

```
TypeError: handleCreateEntity is not a function
    at onClick (http://localhost:3000/jsx/pages/ProjectView.jsx:124:54)
    at HTMLUnknownElement.callCallback2 (http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-WAQW2HX5.js?v=87508fa8:3215:22)
    at Object.invokeGuardedCallbackDev (http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-WAQW2HX5.js?v=87508fa8:3240:24)
    at invokeGuardedCallback (http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-WAQW2HX5.js?v=87508fa8:3274:39)
    at invokeGuardedCallbackAndCatchFirstError (http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-WAQW2HX5.js?v=87508fa8:3277:33)
    at executeDispatch (http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-WAQW2HX5.js?v=87508fa8:6557:11)
    at processDispatchQueueItemsInOrder (http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-WAQW2HX5.js?v=87508fa8:6577:15)
    at processDispatchQueue (http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-WAQW2HX5.js?v=87508fa8:6586:13)
    at dispatchEventsForPlugins (http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-WAQW2HX5.js?v=87508fa8:6594:11)
    at http://localhost:3000/@fs/C:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/node_modules/.vite/deps/chunk-WAQW2HX5.js?v=87508fa8:6718:20
```

# ERROR REPORT (LazyLoading + Schema Mismatch)

**Timestamp:** 2026-01-25T21:24:51.520+01:00
**Message:** SQL error or missing database (no such column: ap1_0.descripcion)
**Context:** Favorites Implementation / Template Inheritance

## Details

1. **LazyInitializationException**: `getAllInheritedTemplates` failed because `Carpeta` was accessed outside transaction when loading templates recursively.
   - **Fix**: Added `@Transactional(readOnly = true)` and an overload accepting `folderId` to ensure a connected session.
2. **Schema Mismatch**: `AtributoPlantilla` entity had `private String descripcion;` but `V1__Initial_Schema.sql` did not have the column.
   - **Fix**: Added `descripcion TEXT` to `V1__Initial_Schema.sql` and forced project recreation (reset via API script).
   - **LazyInit Context**: `@JsonIgnore` caused data loss (user reported unsaved data).
   - **LazyInit Fix (List)**: Created `getEntitiesInFolder` with transaction.
   - **LazyInit Fix (Single)**: Created `getEntity(idOrSlug)` with transaction to fix `GET /entities/{slug}` returning 500, which caused "undefined" IDs in Frontend and failed saves.

## Frontend Resolution

- **Msg**: `TypeError: handleCreateEntity is not a function`. (Fixed in Frontend).
- **Msg**: `LazyInitializationException` on `Entity.carpeta` / `Entity.plantilla`.
- **Fix**: Created `WorldBibleService.hydrateEntity` to force partial graph loading inside transaction.
- **Msg**: Navigation failure after Save (Stuck in editor).
- **Fix**: Frontend now uses `entity.carpeta` from server response to determine redirect target, handling "Search/Favorite" context loss.

```
org.hibernate.exception.GenericJDBCException: could not prepare statement [[SQLITE_ERROR] SQL error or missing database (no such column: ap1_0.descripcion)]
    at org.hibernate.exception.internal.StandardSQLExceptionConverter.convert(StandardSQLExceptionConverter.java:63)
    ...
```
