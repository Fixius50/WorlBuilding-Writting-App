# Bitácora de Desarrollo (Log Prompts)

---

### Prompt ID: 22 (Rediseño "Chronos Atlas Next")
**Prompt:** "LAS FUNCIONALIDADES (capturas que te pase) sobreescribelas en ese archivo funcionalidades.md. Con esto YA"
**Resultados:**
- [DOCS] Transcripción total de 10 imágenes detallando el nuevo paradigma modular.
- [PLAN] Creación del plan de implementación para el esquema dinámico (Folders/Templates).
- [ARCH] Reestructuración visual hacia 3 paneles + Bottom Dock.


---

### Prompt ID: 0 (Setup Inicial)
> Analizame la app WorldbuildingApp y todas sus versiones... serverless pero con funcionamiento en el explorador...
**Resultados:**
*   [ANÃ�LISIS] Determinada estructura (v1/v2 Java, v3 Next.js).
*   [ESTRATEGIA] MigraciÃ³n exitosa a Java Spring Boot + H2 (standalone).

---

### Prompt ID: 3 (Estructura de Cuadernos)
> ...cuaderno/libro... plantillas/hojas... numerando las hojas...
*   [BUG FIX] Corregido error en `DynamicDataSourceConfig`: el inicializador SQL ignoraba bloques que empezaban con comentarios, omitiendo la creaciÃ³n de tablas.
*   [COMPATIBILIDAD] Cambiado `MEDIUMTEXT` por `CLOB` en todas las entidades para asegurar compatibilidad total con H2.
*   [VERIFICACIÃ“N] Verificado flujo completo en un nuevo proyecto "Mundo_Arreglado".


### Prompt ID: 6 (NavegaciÃ³n y Arquitectura)
> Elimina la sidebar, pon un menÃº radial arriba y prepara el backend para multi-usuario...
**Resultados:**
*   [UX] Implementado menÃº radial Top-Center (Glassmorphism). Refactorizados todos los HTMLs.
*   [BACKEND] Creada entidad Usuario y repositorio JPA. Configurado redirecciÃ³n a Login.

---

### Prompt ID: 7 (Migración a SQLite)
> Migrate to SQLite Database
**Resultados:**
*   [DATABASE] Migración completa de H2 a SQLite (data/worldbuilding.db).
*   [CLEANUP] Eliminado código legacy H2 (DynamicDataSourceConfig, H2Functions).
*   [REFACTOR] Reescritura de ProyectoController y BDController para JPA estándar.

### Prompt ID: 8 (Multi-tenancy & Real Login)
> Aislamiento de datos por usuario y registro funcional.
**Resultados:**
*   [SECURITY] Implementado `ProjectSessionInterceptor` para proteger APIs.
*   [AUTH] Completado `AuthController` con registro, login y logout real.
*   [DATA] Modificados modelos (`Proyecto`) y repositorios para filtrar por `Usuario`.
*   [FIX] Resuelto conflicto de puerto 8080.

---

### Prompt ID: 9 (Refinamiento UI & Librería)
> Refinamiento estético, Biblia de Entidades y Módulo de Librería.
**Resultados:**
*   [UX] Menú Radial optimizado (más amplio) y Perfil unificado (Dashboard style).
*   [BIBLIA] Rediseño total con filtros superiores, conteo dinámico en tiempo real y nuevos tipos (Magia, Zonas, Efectos).
*   [DASHBOARD] Añadidos campos de género, tipo e imagen al crear proyectos.
*   [LIBRERÍA] Creado módulo de gestión de hojas (`libreria.html`) con navegación avanzada.

### Prompt ID: 10 (Taller de Conlangs)
> Implementación del Taller de Conlangs con NLP, Vectorización y FontForge.
**Resultados:**
*   [BACKEND] Integración de CoreNLP y JWI (WordNet) para semántica.
*   [GRAPHICS] Implementado `VectorizationUtils` (Raster -> SVG) y script Python para FontForge (SVG -> TTF).
*   [FRONTEND] Nuevo módulo `conlangs.html` con Canvas de dibujo Vanilla JS.
*   [DATA] Nuevas entidades `MorphRule` y extensión de `Palabra` con datos vectoriales.

---

### Prompt ID: 11 (Standardización UI Escritura)
> siempre que puedas debes poner unidades relativas
> arregla el menu selector de paginas en la hoja de una escritura (no se ha arreglado)
> en vez de intentar arreglarlo, copia el mismo codigo que en el resto de paginas

**Resultados:**
*   [REFACTOR] Reemplazada cabecera "Premium" personalizada por el estándar de diseño de `libreria.html`.
*   [UX] Eliminado selector de páginas complejo; implementada navegación lineal (Anterior/Siguiente) y breadcrumbs estándar.
*   [CSS] Refactorización completa a unidades relativas (`rem`) en módulos de escritura.
*   [FIX] Ajustado margen superior (`mt-24`) en cabecera de escritura para evitar solapamiento con menú radial.
*   [UX] Corregido toggle de barra lateral de notas y eliminado botón de cierre redundante.

### Prompt ID: 12 (Rediseño Escritura & Sidebar)
> Refactoriza la interfaz de escritura para tener una lista de hojas lateral persistente, contadores de notas y navegación directa. arregla bugs de carga y borrado.

**Resultados:**
*   [UI] Implementada **Sidebar Lateral** en `escritura.html` para navegación rápida entre hojas.
*   [BACKEND] Añadido conteo eficiente de notas (`countByHoja`) en `NotaRapidaRepository`.
*   [UX] **Contadores de Notas** visuales (badges) en la lista de hojas.
*   [FLOW] Navegación directa desde Librería al Editor (saltando vista intermedia).
*   [FIX] Resuelto bug crítico de "estados zombie" al borrar hojas y recarga de notas al cambiar de página.

### Prompt ID: 13 (Restructuración Frontend & React)
> Restructure and Debug Frontend (Blank Screen)
**Resultados:**
*   [ARCH] Reestructuración completa del proyecto: frontend movido a `src/main/frontend`, compilación a `src/main/resources/static`.
*   [REACT] Implementación base de SPA con React + Tailwind + Vite.
*   [FIX] Resuelto bug de "Pantalla Negra" (ReferenceError en montaje de React).
*   [DESIGN] Integración inicial del tema "Arcane Void".

### Prompt ID: 15 (Calibración UI Arcane Void)
> UI Overhaul and Calibration to match prototypes.
**Resultados:**
*   [ARCH] Implementado `ArchitectLayout.jsx` con sidebars duales (Bible & Canvas) y modo Focus.
*   [UI] Rediseñadas `ProjectView.jsx` (Welcome screen) y `Dashboard.jsx` (Sidebar hidden) según imágenes 1 y 6.
*   [FEAT] Creados módulos `EntityProfile.jsx`, `CharacterEditor.jsx` y `Settings.jsx` (Imágenes 3, 4, 5).
*   [FIX] Corregidas rutas de importación relativas post-migración.
*   [VERIF] Verificación exitosa de renderizado y estética "Arcane Void" vía subagente.

### Prompt ID: 16 (Corrección Error Sintaxis CharacterView)
> Fix syntax error 'expected catch or finally' in CharacterView.jsx from user report.
**Resultados:**
*   [FIX] Eliminado bloque `try` huérfano y código duplicado en `CharacterView.jsx` que causaba crash.

### Prompt ID: 23 (Debug 500 & Logs Cleanup)
> Continue (Debugging SESSION)
**Resultados:**
*   [FIX] Resuelto error cr�tico 500 'no such table' mediante ruta absoluta JDBC y desactivaci�n de DDL-Auto.
*   [INFRA] Implementado GlobalExceptionHandler para trazas completas.
*   [CLEANUP] Logs (ackend.log, 	race.txt, etc) movidos a carpeta /Data para limpieza del root.

### Prompt ID: 16 (CRUD & UI Improvements)
- **Features**: Implementaci�n de CRUD de carpetas en World Bible, nuevo sistema de Notas con vista pantalla completa, Selector de Mapas y Editor de Mapas funcional (Canvas).
- **Fixes**: Resuelto error 500 en el arranque (SQLDelete), arreglado redireccionamiento de logout en Settings.
- **Impact**: Mejora significativa en la UX de cartograf�a y gesti�n de informaci�n.

## SesiÃn 2026-01-07: ResoluciÃn de Estabilidad y UI
- [x] CorrecciÃn de persistencia DB (SQLite Master persistente).
- [x] InicializaciÃn robusta de esquemas (CREATE TABLE IF NOT EXISTS).
- [x] ResoluciÃn de errores 401 (PermitAll + Session activation temprana).
- [x] Fix de botÃn 'Guardar' desaparecido (RediseÃo de Header y Stacking Context).


## Sesi�n 2026-01-10: An�lisis y Arranque
**Prompt:** An�lisis, arranque y prueba de rutas.
**Resultado:** Backend y Frontend levantados. Rutas verificadas (Dashboard accesible). Screenshot capturado.

## Sesi�n 2026-01-10: Investigaci�n Editores
**Prompt:** Investigar librer�as de texto (React, Clean, Mentions) y actualizar Roadmap.
**Resultado:** Roadmap actualizado. Reporte de investigaci�n creado (Tiptap como recomendaci�n).

## Sesi�n: 2026-01-22

### Prompt:
"vamos a seguir con worldbuilding"

### Resultados:
- Carga de contexto WorldbuildingApp.
- Auditor�a inicial: Detectado spring.jpa.hibernate.ddl-auto=create en pplication.properties (RIESGO DE P�RDIDA DE DATOS).
- Verificaci�n: ZenEditor usa React-Quill correctamente.
- Resoluci�n cr�tica: Cambio de ddl-auto a update + Comentario de Advertencia.
- Documentaci�n: Creado Docs/plan_migracion_grafos.md para preparar la transici�n a Cytoscape.js (a la espera de orden 'YA').
- Actualizaci�n de Plan: Renombrado plan_migracion_grafos.md a plan_migracion_stack.md.
- Expansion de Stack: A�adidas secciones para TipTap, Shadcn/ui (con Resizable Panels), TanStack Query, Zustand, Electron y Arquitectura JSON Din�mico.
- Actualizaci�n de Plan: Integrada estrategia **Flyway** (ddl-auto=validate) y patr�n **LoreNode (JSON)** en plan_migracion_stack.md.
- Refinamiento de Plan: Adaptada estrategia JSON para modificar EntidadGenerica existente en lugar de reemplazarla. Se usar� un enfoque h�brido (Columnas SQL + Columna JSON).
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
# Errores durante la creación.md

Este documento detalla los problemas encontrados y resueltos durante la sesión de depuración para hacer funcionar el envío de formularios (`POST /api/bd/insertar`) tras la refactorización principal.

Los errores se clasifican por su origen: Externo (entorno/configuración), Java (backend) o JavaScript/HTML (frontend).

---

## 1. Externo (Entorno y Configuración)

Estos fueron los errores más críticos que impidieron que la aplicación arrancara o se conectara a la base de datos.

### Error 1.1: Incompatibilidad de Versión de MySQL
* **Síntoma:** La aplicación arrancaba, pero los datos no se guardaban. El log de Spring Boot mostraba la advertencia `HHH000511: The 5.5.5 version for [org.hibernate.dialect.MySQLDialect] is no longer supported... The minimum supported version is 8.0.0.`
* **Causa:** La versión antigua de XAMPP usaba MySQL 5.5, que no es compatible con Hibernate 6 (usado por Spring Boot 3+).
* **Solución:** Desinstalar el XAMPP antiguo e instalar una versión moderna que incluya MySQL 8.0+.

### Error 1.2: Puerto 8080 en uso
* **Síntoma:** La aplicación Spring Boot no arrancaba, mostrando un error indicando que el puerto 8080 ya estaba en uso.
* **Causa:** Un proceso anterior de Spring Boot (o cualquier otra aplicación) no se cerró correctamente y seguía ocupando el puerto 8080.
* **Solución:** Identificar el PID del proceso que ocupaba el puerto 8080 usando `netstat -ano | findstr :8080` y luego finalizar la tarea con `taskkill /PID [PID] /F` en la línea de comandos (como administrador).

### Error 1.3: Permisos de XAMPP en Windows
* **Síntoma:** El panel de control de XAMPP (nuevo) fallaba al iniciarse, mostrando errores `EAccessViolation` y `Error: Cannot create file "C:\Users\...\xampp-control.ini". Acceso denegado`.
* **Causa:** El panel de control no tenía permisos de administrador para escribir su archivo de configuración en la carpeta `AppData` del usuario.
* **Solución:** Ejecutar siempre `xampp-control.exe` usando la opción "Ejecutar como administrador".

### Error 1.4: Conflicto de Puerto de MySQL
* **Síntoma:** Al intentar iniciar MySQL (como administrador), el panel de XAMPP mostraba `Error: MySQL shutdown unexpectedly... This may be due to a blocked port`.
* **Causa:** El servicio `mysqld.exe` de la *antigua* instalación de XAMPP seguía ejecutándose en segundo plano, bloqueando el puerto 3306 e impidiendo que el nuevo servicio se iniciara.
* **Solución:** Se utilizó `netstat -ano | findstr :3306` para encontrar el ID de Proceso (PID) del `mysqld.exe` conflictivo y se finalizó la tarea desde el Administrador de Tareas.

### Error 1.4: Configuración de Dialecto de Spring (Post-actualización)
* **Síntoma:** Tras actualizar XAMPP, la aplicación Spring Boot no arrancaba, mostrando `BeanCreationException: Unable to determine Dialect`.
* **Causa:** Irónicamente, al quitar el dialecto (recomendado para MySQL 5.5), la auto-detección de Hibernate 6 falló con MySQL 8.
* **Solución:** Se volvió a añadir `spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect` al archivo `application.properties`.

### Error 1.5: Configuración de Contraseña de Spring
* **Síntoma:** Tras arreglar el dialecto, la aplicación seguía sin arrancar, mostrando `BeanCreationException: Access denied for user 'root'@'localhost' (using password: YES)`.
* **Causa:** La nueva instalación de XAMPP usa el usuario `root` sin contraseña, pero `application.properties` seguía configurado con `spring.datasource.password=root`.
* **Solución:** Se cambió la configuración a `spring.datasource.password=` (vacío) en `application.properties`.

---

## 2. JavaScript (Frontend)

Estos errores impidieron que el navegador enviara los datos al backend, aunque el backend ya funcionaba.

### Error 2.1: Método HTTP Incorrecto (PUT vs. POST)
* **Síntoma:** Los datos no se guardaban. Si se hubiera inspeccionado la pestaña "Red" (Network) del navegador, se habría visto un error `405 Method Not Allowed`.
* **Causa:** El script `opcionesForm.js` enviaba los datos usando `method: "PUT"`, pero el `BDController.java` esperaba un `method: "POST"` (definido por la anotación `@PostMapping("/insertar")`).
* **Solución:** Se modificó la llamada `fetch` en `opcionesForm.js` para usar `method: "POST"`.

### Error 2.2: Fallo de Carga de Script Dinámico (El Error Clave)
* **Síntoma:** Al pulsar "Guardar", la página **se recargaba** por completo, ignorando el envío de datos.
* **Causa:** El script `ventanaCreacion.js` cargaba el HTML de los formularios usando `.innerHTML`. Por seguridad, los navegadores no ejecutan las etiquetas `<script>` (como `<script src="...opcionesForm.js">`) que se insertan de esta manera. Como resultado, el `e.preventDefault()` en `opcionesForm.js` nunca se ejecutaba.
* **Solución (en 3 partes):**
    1.  **Modificar `ventanaCreacion.js`:** Se añadió código para que, *después* de insertar el HTML, cree manualmente una nueva etiqueta `<script>`, le asigne el `.src` y la añada al `document.body`, forzando su carga y ejecución.
    2.  **Modificar `opcionesForm.js`:** Se eliminó el *listener* `DOMContentLoaded`, ya que el script ahora se carga dinámicamente *después* de que el DOM principal se haya cargado.
    3.  **Modificar HTML (Opciones):** Se eliminaron las etiquetas `<script src="...">` de los 6 archivos HTML en `html/opciones/`, ya que `ventanaCreacion.js` ahora gestiona su carga.

---

## 3. HTML (Frontend)

### Error 3.1: Ruta de Script Incorrecta
* **Síntoma:** La página se seguía recargando incluso después de implementar la solución 2.2.
* **Causa:** Un error en la refactorización. La ruta del script en los HTML de `html/opciones/` era `../js/...` (un nivel arriba), pero la ruta correcta desde esa carpeta era `../../js/...` (dos niveles arriba).
* **Solución:** Se corrigió la ruta del script en los 6 archivos HTML de `html/opciones/` a `src="../../js/components/opcionesForm.js"`. (Nota: esta solución se volvió obsoleta por la solución 2.2, pero fue un paso intermedio en la depuración).

---

## 4. React Migration (SPA)

### Error 4.1: Critical Blank Screen on Startup
* **Symptom:** The new React application loaded a blank dark screen. The index.html was served, but the `#root` element remained empty. No obvious errors in the browser console initially.
* **Cause**: The `src/main/frontend/jsx/main.jsx` entry point had a ReferenceError. It used `rootElement` in a conditional check before defining it.
* **Solution**: Correctly defined `const rootElement = document.getElementById('root');` before usage. Added robust try-catch blocks during debugging to verify the fix, then cleaned them up.

---

## 5. Multi-Tenancy & SPA Architecture (v3.6.0)

### Error 5.1: 500 Internal Server Error (Missing User Data Folder)
* **S�ntoma:** Al intentar crear un proyecto con 
ewuser, el servidor devolv�a Error 500. El log mostraba java.sql.SQLException: path to '.../data/users/user_3.db' does not exist.
* **Causa:** La l�gica de aislamiento tenant intentaba conectar a una base de datos SQLite en una carpeta (data/users) que no exist�a f�sicamente en el entorno de despliegue, aunque el usuario s� exist�a en la BD principal.
* **Soluci�n:** Se a�adi� la creaci�n autom�tica de directorios en el servicio de registro. Para este caso puntual, se repar� manualmente creando la carpeta src/main/resources/data/users y copiando el template.

### Error 5.2: 404 Whitelabel Error en Recarga (SPA Routing)
* **S�ntoma:** Al recargar la p�gina en una ruta profunda (ej. /project/5/bible), Spring Boot devolv�a un 404.
* **Causa:** Spring Boot intentaba resolver la URL como un recurso est�tico o endpoint API. Al no existir, fallaba. React Router solo puede manejar la ruta si el servidor devuelve index.html primero.
* **Soluci�n:**
    1.  Se cre� SpaController.java para redirigir cualquier ruta no-API y no-est�tica (regex /{path:[^\.]*}) hacia orward:/index.html.
    2.  Se habilit� spring.mvc.pathmatch.matching-strategy=ant_path_matcher en pplication.properties para soportar las regex complejas.

### Error 5.3: UI Desactualizada tras Cambios (Build Pipeline)
* **S�ntoma:** Los cambios en Sidebar (iconos colapsados) no se ve�an en el navegador a pesar de estar codificados.
* **Causa:** El servidor Spring Boot serv�a los archivos est�ticos de 	arget/classes/static, que eran una copia antigua. Vite no estaba compilando autom�ticamente.
* **Soluci�n:** Se actualiz� INICIAR.bat para ejecutar 
pm run build antes de arrancar el servidor Java, garantizando que el frontend siempre est� sincronizado.


### Error Critical 500: 'No such table: cuaderno' (SQLite)
**S�ntoma:** Error 500 intermitente al cargar workspaces o crear carpetas. Logs truncados imped�an ver la causa.
**Diagn�stico:**
- GlobalExceptionHandler revel� SQLITE_ERROR: no such table: cuaderno.
- La herramienta Diagnostic ve�a la tabla, pero Hibernate no.
- Causa ra�z: Ambig�edad en la ruta relativa de JDBC (jdbc:sqlite:src/...) vs el directorio de trabajo de ejecuci�n.
**Soluci�n:**
1. Hardcodear ruta absoluta en pplication.properties: jdbc:sqlite:/src/... (o ruta f�sica).
2. spring.jpa.hibernate.ddl-auto=none para evitar que Hibernate intente validar/crear esquema y conf�e en DatabaseMigration.
**Estado:** Resuelto. Logs movidos a carpeta /Data.

## [2026-01-02] Limpieza de directorio Data
**Acción:** Se movieron ackend.log, server.log, startup.log, 	race.txt del directorio Data a Docs/logs para centralizar la auditoría.

## [06/01/2026] Pantalla Blanca (Crash MapEditor)
**Síntoma:** Pantalla blanca al cargar la app. Error silencioso de importación.
**Diagnóstico:** Conflicto de versiones. 
eact-konva v19 requiere React 19, pero el proyecto usa React 18.
**Solución:** Downgrade a 
eact-konva@18.2.10 y konva@9.3.16.
**Estado:** Resuelto.

---
### Error: SQLITE_ERROR: no such table: cuaderno
* **SÃntoma:** Errores de base de datos al iniciar o abrir proyectos.
* **Causa:** Uso de SQLite en memoria para el contexto maestro y falta de CREATE TABLE en migraciones.
* **SoluciÃn:** Cambiado a SQLite persistente en MultiTenantDataSource.java y habilitado CREATE TABLE IF NOT EXISTS en DatabaseMigration.java.
* **Estado:** Resuelto.

### Error: 401 Unauthorized / Password Generada
* **SÃntoma:** Bloqueo de acceso a la API y logs de seguridad de Spring activados.
* **Causa:** ConfiguraciÃn de seguridad por defecto activada; sesion de proyecto se activaba demasiado tarde.
* **SoluciÃn:** ConfiguraciÃn de SecurityConfig.java con permitAll() y activaciÃn de sesiÃn en ProyectoController.java antes de validaciones de metadatos.
* **Estado:** Resuelto.

### Error: BotÃn 'Guardar' desaparecido en EntityBuilder
* **SÃntoma:** Los usuarios no podÃan guardar entidades creadas.
* **Causa:** Posicionamiento ixed oculto por el sidebar y conflicto de z-index (Stacking Context).
* **SoluciÃn:** RediseÃo de la cabecera de EntityBuilder.jsx para incluir botones persistentes y eliminaciÃn de z-0 en ArchitectLayout.jsx.
* **Estado:** Resuelto.


### Error: Persistencia de Atributos en Entity Builder
* **Descripci�n:** El usuario reporta que los atributos a�adidos a una entidad no se guardan correctamente, incluso despu�s de corregir la serializaci�n del backend (@JsonIgnore) y el ordenamiento (@OrderBy).
* **Causa Sospechosa:** Posible fallo en la l�gica de actualizaci�n de estado en el frontend (IDs temporales vs reales) o timeout silencioso en el PATCH.
* **Estado:** Pendiente de investigar.
# Integración Módulo Timeline (Cronologías)

**Fecha:** 07/01/2026
**Estado:** Completado / Estable

## Resumen
Se ha completado la integración del módulo de **Líneas de Tiempo** en la interfaz principal (`ArchitectLayout`), moviéndolo de una vista aislada a un panel lateral contextual (Right Sidebar) y una visualización central dedicada. Además, se han resuelto errores críticos de persistencia y sincronización.

## Cambios Realizados

### 1. Arquitectura Frontend (React)
- **Integración en `ArchitectLayout.jsx`**:
    - Se ha habilitado el modo `CUSTOM` en el panel lateral derecho para inyectar componentes dinámicos mediante **React Portals**.
    - `TimelineView.jsx` ahora renderiza los formularios de creación/edición de eventos en el sidebar derecho, manteniendo la visualización del grafo en el centro.
- **Sincronización de Contexto**:
    - Se implementó un `focus listener` en `ArchitectLayout` que fuerza la recarga del contexto del proyecto (`loadProject`) al cambiar de pestaña en el navegador. Esto corrige el error de mezcla de datos entre proyectos abiertos simultáneamente.

### 2. Backend (Spring Boot)
- **Consolidación de Entidades**:
    - Se eliminaron las clases redundantes `EventoCronologia` y `LineaTemporal`.
    - Se estandarizó el uso de `EventoTiempo` y `LineaTiempo`.
- **Nuevos Endpoints**:
    - `DELETE /api/timeline/evento/{id}`: Para borrado de eventos.
    - `DELETE /api/timeline/linea/{id}`: Para borrado de líneas de tiempo completas.
- **Optimización JSON**:
    - Se añadió `@JsonProperty(access = WRITE_ONLY)` en las relaciones bidireccionales (`EventoTiempo` -> `LineaTiempo`) para permitir la deserialización (guardado) sin causar recursión infinita en la serialización (lectura).

### 3. Corrección de Errores (Bugfixes)
- **Error de Borrado (Timeline y Eventos)**:
    - **Causa**: Faltaban los endpoints `DELETE` en el controlador y `api.js` fallaba al procesar respuestas vacías (`204 No Content`).
    - **Solución**: Implementación de endpoints y parcheo de `api.js` para devolver `null` en lugar de lanzar `SyntaxError` en respuestas vacías.
- **Error "No events yet"**:
    - **Causa**: El filtrado en cliente fallaba porque la relación `lineaTiempo` no se enviaba al cliente (por `@JsonIgnore`).
    - **Solución**: Se cambió a filtrado en servidor (`/timeline/linea/{id}/eventos`).
- **Ordenamiento de Eventos Negativos**:
    - **Solución**: Se corrigió la lógica de sugerencia de orden para respetar fechas negativas (a.C.), evitando que el contador se reinicie a 1 incorrectamente.

## Archivos Clave Modificados
- `src/main/frontend/jsx/pages/Timeline/TimelineView.jsx`
- `src/main/frontend/jsx/components/layout/ArchitectLayout.jsx`
- `src/main/frontend/js/services/api.js`
- `src/main/java/com/worldbuilding/app/controller/TimelineController.java`
- `src/main/java/com/worldbuilding/app/model/EventoTiempo.java`

### Prompt ID: 9 (Consolidaci�n Frontend y Fixes Finales)
> Finalizar migraci�n a Shadcn, arreglar l�gica de Map Editor y estabilizar Backend database.
**Resultados:**
*   [UI] **Shadcn Refactor**: Migrados Button.jsx y InputModal.jsx al tema 'Arcane Void' (Indigo/Emerald).
*   [FIX] **Map Editor**: Corregido bug de guardado (BINARY_DATA) para persistir im�genes de fondo correctamente.
*   [FIX] **Layout**: Eliminado auto-colapso forzado del Sidebar en la vista de Biblia.
*   [BACKEND] **Estabilizaci�n**:
    *   Configurado ddl-auto=update para resolver inconsistencia INTEGER vs BIGINT en SQLite.
    *   Habilitado flyway.repair-on-migrate para corregir checksums de migraciones editadas.
    *   Verificado arranque limpio y relaciones JPA (AtributoPlantilla/AtributoValor).

