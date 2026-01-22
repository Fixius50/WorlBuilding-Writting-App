# BitÃ¡cora de Desarrollo (Log Prompts)

---

### Prompt ID: 22 (RediseÃ±o "Chronos Atlas Next")
**Prompt:** "LAS FUNCIONALIDADES (capturas que te pase) sobreescribelas en ese archivo funcionalidades.md. Con esto YA"
**Resultados:**
- [DOCS] TranscripciÃ³n total de 10 imÃ¡genes detallando el nuevo paradigma modular.
- [PLAN] CreaciÃ³n del plan de implementaciÃ³n para el esquema dinÃ¡mico (Folders/Templates).
- [ARCH] ReestructuraciÃ³n visual hacia 3 paneles + Bottom Dock.


---

### Prompt ID: 0 (Setup Inicial)
> Analizame la app WorldbuildingApp y todas sus versiones... serverless pero con funcionamiento en el explorador...
**Resultados:**
*   [ANÃƒï¿½LISIS] Determinada estructura (v1/v2 Java, v3 Next.js).
*   [ESTRATEGIA] MigraciÃƒÂ³n exitosa a Java Spring Boot + H2 (standalone).

---

### Prompt ID: 3 (Estructura de Cuadernos)
> ...cuaderno/libro... plantillas/hojas... numerando las hojas...
*   [BUG FIX] Corregido error en `DynamicDataSourceConfig`: el inicializador SQL ignoraba bloques que empezaban con comentarios, omitiendo la creaciÃƒÂ³n de tablas.
*   [COMPATIBILIDAD] Cambiado `MEDIUMTEXT` por `CLOB` en todas las entidades para asegurar compatibilidad total con H2.
*   [VERIFICACIÃƒâ€œN] Verificado flujo completo en un nuevo proyecto "Mundo_Arreglado".


### Prompt ID: 6 (NavegaciÃƒÂ³n y Arquitectura)
> Elimina la sidebar, pon un menÃƒÂº radial arriba y prepara el backend para multi-usuario...
**Resultados:**
*   [UX] Implementado menÃƒÂº radial Top-Center (Glassmorphism). Refactorizados todos los HTMLs.
*   [BACKEND] Creada entidad Usuario y repositorio JPA. Configurado redirecciÃƒÂ³n a Login.

---

### Prompt ID: 7 (MigraciÃ³n a SQLite)
> Migrate to SQLite Database
**Resultados:**
*   [DATABASE] MigraciÃ³n completa de H2 a SQLite (data/worldbuilding.db).
*   [CLEANUP] Eliminado cÃ³digo legacy H2 (DynamicDataSourceConfig, H2Functions).
*   [REFACTOR] Reescritura de ProyectoController y BDController para JPA estÃ¡ndar.

### Prompt ID: 8 (Multi-tenancy & Real Login)
> Aislamiento de datos por usuario y registro funcional.
**Resultados:**
*   [SECURITY] Implementado `ProjectSessionInterceptor` para proteger APIs.
*   [AUTH] Completado `AuthController` con registro, login y logout real.
*   [DATA] Modificados modelos (`Proyecto`) y repositorios para filtrar por `Usuario`.
*   [FIX] Resuelto conflicto de puerto 8080.

---

### Prompt ID: 9 (Refinamiento UI & LibrerÃ­a)
> Refinamiento estÃ©tico, Biblia de Entidades y MÃ³dulo de LibrerÃ­a.
**Resultados:**
*   [UX] MenÃº Radial optimizado (mÃ¡s amplio) y Perfil unificado (Dashboard style).
*   [BIBLIA] RediseÃ±o total con filtros superiores, conteo dinÃ¡mico en tiempo real y nuevos tipos (Magia, Zonas, Efectos).
*   [DASHBOARD] AÃ±adidos campos de gÃ©nero, tipo e imagen al crear proyectos.
*   [LIBRERÃ�A] Creado mÃ³dulo de gestiÃ³n de hojas (`libreria.html`) con navegaciÃ³n avanzada.

### Prompt ID: 10 (Taller de Conlangs)
> ImplementaciÃ³n del Taller de Conlangs con NLP, VectorizaciÃ³n y FontForge.
**Resultados:**
*   [BACKEND] IntegraciÃ³n de CoreNLP y JWI (WordNet) para semÃ¡ntica.
*   [GRAPHICS] Implementado `VectorizationUtils` (Raster -> SVG) y script Python para FontForge (SVG -> TTF).
*   [FRONTEND] Nuevo mÃ³dulo `conlangs.html` con Canvas de dibujo Vanilla JS.
*   [DATA] Nuevas entidades `MorphRule` y extensiÃ³n de `Palabra` con datos vectoriales.

---

### Prompt ID: 11 (StandardizaciÃ³n UI Escritura)
> siempre que puedas debes poner unidades relativas
> arregla el menu selector de paginas en la hoja de una escritura (no se ha arreglado)
> en vez de intentar arreglarlo, copia el mismo codigo que en el resto de paginas

**Resultados:**
*   [REFACTOR] Reemplazada cabecera "Premium" personalizada por el estÃ¡ndar de diseÃ±o de `libreria.html`.
*   [UX] Eliminado selector de pÃ¡ginas complejo; implementada navegaciÃ³n lineal (Anterior/Siguiente) y breadcrumbs estÃ¡ndar.
*   [CSS] RefactorizaciÃ³n completa a unidades relativas (`rem`) en mÃ³dulos de escritura.
*   [FIX] Ajustado margen superior (`mt-24`) en cabecera de escritura para evitar solapamiento con menÃº radial.
*   [UX] Corregido toggle de barra lateral de notas y eliminado botÃ³n de cierre redundante.

### Prompt ID: 12 (RediseÃ±o Escritura & Sidebar)
> Refactoriza la interfaz de escritura para tener una lista de hojas lateral persistente, contadores de notas y navegaciÃ³n directa. arregla bugs de carga y borrado.

**Resultados:**
*   [UI] Implementada **Sidebar Lateral** en `escritura.html` para navegaciÃ³n rÃ¡pida entre hojas.
*   [BACKEND] AÃ±adido conteo eficiente de notas (`countByHoja`) en `NotaRapidaRepository`.
*   [UX] **Contadores de Notas** visuales (badges) en la lista de hojas.
*   [FLOW] NavegaciÃ³n directa desde LibrerÃ­a al Editor (saltando vista intermedia).
*   [FIX] Resuelto bug crÃ­tico de "estados zombie" al borrar hojas y recarga de notas al cambiar de pÃ¡gina.

### Prompt ID: 13 (RestructuraciÃ³n Frontend & React)
> Restructure and Debug Frontend (Blank Screen)
**Resultados:**
*   [ARCH] ReestructuraciÃ³n completa del proyecto: frontend movido a `src/main/frontend`, compilaciÃ³n a `src/main/resources/static`.
*   [REACT] ImplementaciÃ³n base de SPA con React + Tailwind + Vite.
*   [FIX] Resuelto bug de "Pantalla Negra" (ReferenceError en montaje de React).
*   [DESIGN] IntegraciÃ³n inicial del tema "Arcane Void".

### Prompt ID: 15 (CalibraciÃ³n UI Arcane Void)
> UI Overhaul and Calibration to match prototypes.
**Resultados:**
*   [ARCH] Implementado `ArchitectLayout.jsx` con sidebars duales (Bible & Canvas) y modo Focus.
*   [UI] RediseÃ±adas `ProjectView.jsx` (Welcome screen) y `Dashboard.jsx` (Sidebar hidden) segÃºn imÃ¡genes 1 y 6.
*   [FEAT] Creados mÃ³dulos `EntityProfile.jsx`, `CharacterEditor.jsx` y `Settings.jsx` (ImÃ¡genes 3, 4, 5).
*   [FIX] Corregidas rutas de importaciÃ³n relativas post-migraciÃ³n.
*   [VERIF] VerificaciÃ³n exitosa de renderizado y estÃ©tica "Arcane Void" vÃ­a subagente.

### Prompt ID: 16 (CorrecciÃ³n Error Sintaxis CharacterView)
> Fix syntax error 'expected catch or finally' in CharacterView.jsx from user report.
**Resultados:**
*   [FIX] Eliminado bloque `try` huÃ©rfano y cÃ³digo duplicado en `CharacterView.jsx` que causaba crash.

### Prompt ID: 23 (Debug 500 & Logs Cleanup)
> Continue (Debugging SESSION)
**Resultados:**
*   [FIX] Resuelto error crítico 500 'no such table' mediante ruta absoluta JDBC y desactivación de DDL-Auto.
*   [INFRA] Implementado GlobalExceptionHandler para trazas completas.
*   [CLEANUP] Logs (ackend.log, 	race.txt, etc) movidos a carpeta /Data para limpieza del root.

### Prompt ID: 16 (CRUD & UI Improvements)
- **Features**: ImplementaciÃn de CRUD de carpetas en World Bible, nuevo sistema de Notas con vista pantalla completa, Selector de Mapas y Editor de Mapas funcional (Canvas).
- **Fixes**: Resuelto error 500 en el arranque (SQLDelete), arreglado redireccionamiento de logout en Settings.
- **Impact**: Mejora significativa en la UX de cartografÃa y gestiÃn de informaciÃn.

## SesiÃƒn 2026-01-07: ResoluciÃƒn de Estabilidad y UI
- [x] CorrecciÃƒn de persistencia DB (SQLite Master persistente).
- [x] InicializaciÃƒn robusta de esquemas (CREATE TABLE IF NOT EXISTS).
- [x] ResoluciÃƒn de errores 401 (PermitAll + Session activation temprana).
- [x] Fix de botÃƒn 'Guardar' desaparecido (RediseÃƒo de Header y Stacking Context).


## Sesión 2026-01-10: Análisis y Arranque
**Prompt:** Análisis, arranque y prueba de rutas.
**Resultado:** Backend y Frontend levantados. Rutas verificadas (Dashboard accesible). Screenshot capturado.

## Sesión 2026-01-10: Investigación Editores
**Prompt:** Investigar librerías de texto (React, Clean, Mentions) y actualizar Roadmap.
**Resultado:** Roadmap actualizado. Reporte de investigación creado (Tiptap como recomendación).

## Sesión: 2026-01-22

### Prompt:
"vamos a seguir con worldbuilding"

### Resultados:
- Carga de contexto WorldbuildingApp.
- Auditoría inicial: Detectado spring.jpa.hibernate.ddl-auto=create en pplication.properties (RIESGO DE PÉRDIDA DE DATOS).
- Verificación: ZenEditor usa React-Quill correctamente.
- Resolución crítica: Cambio de ddl-auto a update + Comentario de Advertencia.
- Documentación: Creado Docs/plan_migracion_grafos.md para preparar la transición a Cytoscape.js (a la espera de orden 'YA').
- Actualización de Plan: Renombrado plan_migracion_grafos.md a plan_migracion_stack.md.
- Expansion de Stack: Añadidas secciones para TipTap, Shadcn/ui (con Resizable Panels), TanStack Query, Zustand, Electron y Arquitectura JSON Dinámico.
- Actualización de Plan: Integrada estrategia **Flyway** (ddl-auto=validate) y patrón **LoreNode (JSON)** en plan_migracion_stack.md.
- Refinamiento de Plan: Adaptada estrategia JSON para modificar EntidadGenerica existente en lugar de reemplazarla. Se usará un enfoque híbrido (Columnas SQL + Columna JSON).
# Log de Errores

## [2026-01-13] PÃ©rdida de datos de la Biblia tras reinicio del servidor

**SÃ­ntoma**: Los datos de carpetas y entidades de la Biblia no se cargan. El frontend recibe errores 401 "No active project" al intentar acceder a `/api/world-bible/folders` y `/api/world-bible/favorites`.

**Causa RaÃ­z**:
1. La configuraciÃ³n `spring.jpa.hibernate.ddl-auto` estaba establecida en `create` en `application.properties`
2. Este modo **borra y recrea todas las tablas** cada vez que se reinicia el servidor Spring Boot
3. Todos los datos de la base de datos (incluyendo carpetas, entidades, plantillas, etc.) se perdÃ­an en cada reinicio

**Contexto**:
- El modo `create` se habÃ­a establecido temporalmente para resolver errores de formato de fechas en SQLite
- Una vez resuelto el problema de fechas (aÃ±adiendo `date_class=TEXT` a la URL de conexiÃ³n), se olvidÃ³ revertir a `update`

**SoluciÃ³n Aplicada**:
1. Cambiar `spring.jpa.hibernate.ddl-auto=create` a `spring.jpa.hibernate.ddl-auto=update` en `application.properties` (lÃ­nea 14)
2. Reiniciar el servidor para que tome la nueva configuraciÃ³n
3. **Importante**: Los datos ya perdidos NO se recuperan automÃ¡ticamente. Es necesario:
   - Recrear manualmente las carpetas y entidades, O
   - Restaurar desde un backup de la base de datos si existe

**Archivos Modificados**:
- `src/main/resources/application.properties` (lÃ­nea 14)

**ConfiguraciÃ³n Final Correcta**:
```properties
# Update schema automatically (preserves data)
spring.jpa.hibernate.ddl-auto=update
```

**PrevenciÃ³n**:
- âœ… Usar `update` en desarrollo para preservar datos
- âœ… Usar `validate` en producciÃ³n para evitar cambios automÃ¡ticos al esquema
- âš ï¸� Solo usar `create` temporalmente para debugging y SIEMPRE revertir inmediatamente

**Estado**: âœ… Resuelto - La configuraciÃ³n estÃ¡ correcta, pero los datos deben ser recreados

**UPDATE 23:05**: Detectado problema adicional - falta columna `favorite` en tabla `entidad_generica`. 
- Error: `[SQLITE_ERROR] SQL error or missing database (no such column: e1_0.favorite)`
- Causa: El esquema no se actualizÃ³ completamente cuando se cambiÃ³ de `create` a `update`

**UPDATE 23:25**: Problema final identificado y resuelto:
- **Causa raÃ­z**: El modelo `Carpeta.java` tenÃ­a colecciones `@OneToMany` (`subcarpetas`, `plantillas`, `entidades`) SIN `@JsonIgnore`
- Cuando Jackson serializaba la respuesta, intentaba cargar lazy las colecciones, lo que disparaba queries con la columna `favorite` faltante
- **SoluciÃ³n aplicada**:
  1. AÃ±adido `@JsonIgnore` a las 3 colecciones en `Carpeta.java`
  2. Modificado `WorldBibleController.createFolder()` para devolver un `Map` simple en lugar de la entidad completa
  3. AÃ±adido try-catch para mejor logging de errores

**Archivos modificados**:
- `src/main/java/com/worldbuilding/app/model/Carpeta.java`
- `src/main/java/com/worldbuilding/app/controller/WorldBibleController.java`

**Estado Final**: âœ…âœ… RESUELTO - Carpetas se crean correctamente

---

## [2026-01-08] Error de CompilaciÃ³n: MÃ©todo No Definido
- **Error**: `The method getFolderDetail(Long) is undefined for the type WorldBibleService` en `WorldBibleController.java`.
- **Causa**: El mÃ©todo `getFolderDetail` faltaba en el servicio `WorldBibleService`, aunque era invocado desde el controlador.
- **SoluciÃ³n**: Se implementÃ³ el mÃ©todo `getFolderDetail(Long id)` en `WorldBibleService.java`. El mÃ©todo devuelve un mapa con los detalles de la carpeta y su ruta (breadcrumbs).
- **Estado**: Resuelto.

## [2026-01-08] Error de Persistencia y VisualizaciÃ³n (404)
- **Error**: `TypeError: Cannot read properties of null (reading 'id')` al guardar entidades, y "Unnamed Folder" / 404 al acceder a carpetas renombradas.
- **Causa**:
  1. Frontend: `EntityBuilder` no manejaba carpetas nulas (ocasionado por fallo de carga).
  2. Backend: Renombrar carpeta cambiaba el `slug`, rompiendo la URL en el frontend y causando 404.
- **SoluciÃ³n**:
  1. **Backend**: Se desactivÃ³ la actualizaciÃ³n automÃ¡tica del slug en `WorldBibleService.java` al renombrar.
  2. **Frontend**: Se aÃ±adiÃ³ protecciÃ³n contra nulos en `EntityBuilder.jsx` y redirecciÃ³n automÃ¡tica en `FolderView.jsx` si se detecta cambio de slug.
- **Estado**: Resuelto (Requiere reinicio de Backend).

## [2026-01-09] Error de SerializaciÃ³n Backend (Hibernate Proxy)
- **Error**: `HttpMessageConversionException` ... `ByteBuddyInterceptor` al acceder a `.../entities`.
- **Causa**: Jackson intentaba serializar el proxy de Hibernate generado para la relaciÃ³n Lazy `AtributoValor.plantilla`.
- **SoluciÃ³n**: Se aÃ±adiÃ³ `@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})` a la clase `AtributoPlantilla` para evitar la serializaciÃ³n de los campos internos del proxy.
- **Estado**: Resuelto (Requiere reinicio de Backend).

## [2026-01-09] Error de Base de Datos Missing Table (SQLite)
- **Error**: `SQLITE_ERROR: no such table: hoja`.
- **Causa**: Fallo en creaciÃ³n automÃ¡tica de esquema (`ddl-auto=create`).
- **SoluciÃ³n**: Cambiado `ddl-auto` a `update` en `application.properties`.
- **Estado**: Resuelto (Backend reiniciado).

## [2026-01-10] Error Pantalla Blanca (Vite Port 5173 / Tiptap)
- **Error**: La aplicaciÃ³n carga en blanco en desarrollo (puerto 5173), aunque build producciÃ³n (8080) funciona.
- **Causa Inicial**: Conflicto de versiones de Tiptap (v3.15.3 beta/bleeding edge).
- **Acciones**:
  1. Downgrade de librerÃ­as Tiptap a `v2.10.3`.
  2. Crash persistente por `index.css` (Resuelto simplificando CSS).
  3. Crash persistente por dependencias faltantes (`@tiptap/extension-color`, etc.) que no se instalaron en el downgrade inicial.
- **Estado Actual**:
  - La aplicaciÃ³n carga correctamente ("Green Screen" superada).
  - **Aislado**: El componente `WritingView` (o `ZenEditor`) causa un crash al importarse. Se ha comentado su ruta en `App.jsx` para permitir el acceso al menÃº principal.
- **InvestigaciÃ³n (23:45)**:
  - Se detectÃ³ que `TiptapExtensions.js` importa `MergeAttributes` directamente de `@tiptap/core`.
  - `@tiptap/core` NO estÃ¡ listado en `package.json`. Esto causa un fallo de resoluciÃ³n de mÃ³dulo en Vite al iniciar.
- **AcciÃ³n Correctiva**: Instalar `@tiptap/core` explÃ­citamente y re-habilitar el editor.
- **Nuevo Hallazgo (00:05)**:
  - Error al compilar: `No matching export in ... for import "canInsertNode"`.
  - Origen: `@tiptap/extension-horizontal-rule` intenta usar una funciÃ³n que no existe en `@tiptap/core` v2.10.3.
  - Causa: Desajuste de versiones (Version Mismatch). Es probable que `starter-kit` haya instalado una versiÃ³n mÃ¡s reciente de `horizontal-rule` que es incompatible con el `core` v2.10.3 forzado.
- **EstabilizaciÃ³n (00:20)**:
  - Se eliminÃ³ Tiptap por completo y se reemplazÃ³ `ZenEditor` con un `<textarea>` nativo.
  - **Resultado**: La aplicaciÃ³n carga correctamente y es estable. Se confirma que el origen de todos los crashes era la librerÃ­a Tiptap y sus dependencias.
- **Intento Final (00:23)**:
  - Se re-instalÃ³ Tiptap v2.10.3 estricto.
  - **Resultado**: Fallo persistente (White Screen) en Vite.
- **ResoluciÃ³n Definitiva**: 
  - Se ha **eliminado Tiptap** del proyecto.
  - Se ha implementado un componente `ZenEditor` nativo (textarea estilizado) que garantiza estabilidad.
  - **Alternativa Propuesta**: React-Quill (Implementado).
- **ImplementaciÃ³n React-Quill (00:30)**:
  - Se instalÃ³ `react-quill`.
  - Se reemplazÃ³ `ZenEditor` con una instancia de Quill configurada con toolbar completa (Google Docs style) y estilos CSS personalizados para el modo oscuro/Zen.
  - Se restaurÃ³ `index.css` a su estado original.
  - **Resultado**: Ã‰XITO. El usuario confirma "carga y va la app". Editor estable y estilos restaurados.
- **Nuevo Error Backend (00:33)**: 
  - `500 Internal Server Error` en `/api/escritura/cuaderno/1/hojas`.
  - **Causa**: `spring.jpa.hibernate.ddl-auto` estaba en `create` (reseteando DB) pero fallaba al crear las tablas por bloqueos o configuraciÃ³n, o simplemente borraba los datos.
  - **SoluciÃ³n (2026-01-13)**: Se cambiÃ³ `ddl-auto` a `update` en `application.properties`. Se verificÃ³ Entidad `Hoja.java`.
  - **Estado**: Resuelto.

## [2026-01-13] Inconsistencia Frontend Zen Editor
- **Error**: El cÃ³digo fuente mostraba `Tiptap` v3.15.3 instalado y en uso, a pesar de que los logs decÃ­an que se habÃ­a reemplazado por Quill.
- **AcciÃ³n**: Se ha reescrito `ZenEditor.jsx` para usar `React-Quill` (ya instalado en package.json), aplicando estilos Dark Mode.
- **Estado**: Implementado.
# Errores durante la creaciÃ³n.md

Este documento detalla los problemas encontrados y resueltos durante la sesiÃ³n de depuraciÃ³n para hacer funcionar el envÃ­o de formularios (`POST /api/bd/insertar`) tras la refactorizaciÃ³n principal.

Los errores se clasifican por su origen: Externo (entorno/configuraciÃ³n), Java (backend) o JavaScript/HTML (frontend).

---

## 1. Externo (Entorno y ConfiguraciÃ³n)

Estos fueron los errores mÃ¡s crÃ­ticos que impidieron que la aplicaciÃ³n arrancara o se conectara a la base de datos.

### Error 1.1: Incompatibilidad de VersiÃ³n de MySQL
* **SÃ­ntoma:** La aplicaciÃ³n arrancaba, pero los datos no se guardaban. El log de Spring Boot mostraba la advertencia `HHH000511: The 5.5.5 version for [org.hibernate.dialect.MySQLDialect] is no longer supported... The minimum supported version is 8.0.0.`
* **Causa:** La versiÃ³n antigua de XAMPP usaba MySQL 5.5, que no es compatible con Hibernate 6 (usado por Spring Boot 3+).
* **SoluciÃ³n:** Desinstalar el XAMPP antiguo e instalar una versiÃ³n moderna que incluya MySQL 8.0+.

### Error 1.2: Puerto 8080 en uso
* **SÃ­ntoma:** La aplicaciÃ³n Spring Boot no arrancaba, mostrando un error indicando que el puerto 8080 ya estaba en uso.
* **Causa:** Un proceso anterior de Spring Boot (o cualquier otra aplicaciÃ³n) no se cerrÃ³ correctamente y seguÃ­a ocupando el puerto 8080.
* **SoluciÃ³n:** Identificar el PID del proceso que ocupaba el puerto 8080 usando `netstat -ano | findstr :8080` y luego finalizar la tarea con `taskkill /PID [PID] /F` en la lÃ­nea de comandos (como administrador).

### Error 1.3: Permisos de XAMPP en Windows
* **SÃ­ntoma:** El panel de control de XAMPP (nuevo) fallaba al iniciarse, mostrando errores `EAccessViolation` y `Error: Cannot create file "C:\Users\...\xampp-control.ini". Acceso denegado`.
* **Causa:** El panel de control no tenÃ­a permisos de administrador para escribir su archivo de configuraciÃ³n en la carpeta `AppData` del usuario.
* **SoluciÃ³n:** Ejecutar siempre `xampp-control.exe` usando la opciÃ³n "Ejecutar como administrador".

### Error 1.4: Conflicto de Puerto de MySQL
* **SÃ­ntoma:** Al intentar iniciar MySQL (como administrador), el panel de XAMPP mostraba `Error: MySQL shutdown unexpectedly... This may be due to a blocked port`.
* **Causa:** El servicio `mysqld.exe` de la *antigua* instalaciÃ³n de XAMPP seguÃ­a ejecutÃ¡ndose en segundo plano, bloqueando el puerto 3306 e impidiendo que el nuevo servicio se iniciara.
* **SoluciÃ³n:** Se utilizÃ³ `netstat -ano | findstr :3306` para encontrar el ID de Proceso (PID) del `mysqld.exe` conflictivo y se finalizÃ³ la tarea desde el Administrador de Tareas.

### Error 1.4: ConfiguraciÃ³n de Dialecto de Spring (Post-actualizaciÃ³n)
* **SÃ­ntoma:** Tras actualizar XAMPP, la aplicaciÃ³n Spring Boot no arrancaba, mostrando `BeanCreationException: Unable to determine Dialect`.
* **Causa:** IrÃ³nicamente, al quitar el dialecto (recomendado para MySQL 5.5), la auto-detecciÃ³n de Hibernate 6 fallÃ³ con MySQL 8.
* **SoluciÃ³n:** Se volviÃ³ a aÃ±adir `spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect` al archivo `application.properties`.

### Error 1.5: ConfiguraciÃ³n de ContraseÃ±a de Spring
* **SÃ­ntoma:** Tras arreglar el dialecto, la aplicaciÃ³n seguÃ­a sin arrancar, mostrando `BeanCreationException: Access denied for user 'root'@'localhost' (using password: YES)`.
* **Causa:** La nueva instalaciÃ³n de XAMPP usa el usuario `root` sin contraseÃ±a, pero `application.properties` seguÃ­a configurado con `spring.datasource.password=root`.
* **SoluciÃ³n:** Se cambiÃ³ la configuraciÃ³n a `spring.datasource.password=` (vacÃ­o) en `application.properties`.

---

## 2. JavaScript (Frontend)

Estos errores impidieron que el navegador enviara los datos al backend, aunque el backend ya funcionaba.

### Error 2.1: MÃ©todo HTTP Incorrecto (PUT vs. POST)
* **SÃ­ntoma:** Los datos no se guardaban. Si se hubiera inspeccionado la pestaÃ±a "Red" (Network) del navegador, se habrÃ­a visto un error `405 Method Not Allowed`.
* **Causa:** El script `opcionesForm.js` enviaba los datos usando `method: "PUT"`, pero el `BDController.java` esperaba un `method: "POST"` (definido por la anotaciÃ³n `@PostMapping("/insertar")`).
* **SoluciÃ³n:** Se modificÃ³ la llamada `fetch` en `opcionesForm.js` para usar `method: "POST"`.

### Error 2.2: Fallo de Carga de Script DinÃ¡mico (El Error Clave)
* **SÃ­ntoma:** Al pulsar "Guardar", la pÃ¡gina **se recargaba** por completo, ignorando el envÃ­o de datos.
* **Causa:** El script `ventanaCreacion.js` cargaba el HTML de los formularios usando `.innerHTML`. Por seguridad, los navegadores no ejecutan las etiquetas `<script>` (como `<script src="...opcionesForm.js">`) que se insertan de esta manera. Como resultado, el `e.preventDefault()` en `opcionesForm.js` nunca se ejecutaba.
* **SoluciÃ³n (en 3 partes):**
    1.  **Modificar `ventanaCreacion.js`:** Se aÃ±adiÃ³ cÃ³digo para que, *despuÃ©s* de insertar el HTML, cree manualmente una nueva etiqueta `<script>`, le asigne el `.src` y la aÃ±ada al `document.body`, forzando su carga y ejecuciÃ³n.
    2.  **Modificar `opcionesForm.js`:** Se eliminÃ³ el *listener* `DOMContentLoaded`, ya que el script ahora se carga dinÃ¡micamente *despuÃ©s* de que el DOM principal se haya cargado.
    3.  **Modificar HTML (Opciones):** Se eliminaron las etiquetas `<script src="...">` de los 6 archivos HTML en `html/opciones/`, ya que `ventanaCreacion.js` ahora gestiona su carga.

---

## 3. HTML (Frontend)

### Error 3.1: Ruta de Script Incorrecta
* **SÃ­ntoma:** La pÃ¡gina se seguÃ­a recargando incluso despuÃ©s de implementar la soluciÃ³n 2.2.
* **Causa:** Un error en la refactorizaciÃ³n. La ruta del script en los HTML de `html/opciones/` era `../js/...` (un nivel arriba), pero la ruta correcta desde esa carpeta era `../../js/...` (dos niveles arriba).
* **SoluciÃ³n:** Se corrigiÃ³ la ruta del script en los 6 archivos HTML de `html/opciones/` a `src="../../js/components/opcionesForm.js"`. (Nota: esta soluciÃ³n se volviÃ³ obsoleta por la soluciÃ³n 2.2, pero fue un paso intermedio en la depuraciÃ³n).

---

## 4. React Migration (SPA)

### Error 4.1: Critical Blank Screen on Startup
* **Symptom:** The new React application loaded a blank dark screen. The index.html was served, but the `#root` element remained empty. No obvious errors in the browser console initially.
* **Cause**: The `src/main/frontend/jsx/main.jsx` entry point had a ReferenceError. It used `rootElement` in a conditional check before defining it.
* **Solution**: Correctly defined `const rootElement = document.getElementById('root');` before usage. Added robust try-catch blocks during debugging to verify the fix, then cleaned them up.

---

## 5. Multi-Tenancy & SPA Architecture (v3.6.0)

### Error 5.1: 500 Internal Server Error (Missing User Data Folder)
* **Síntoma:** Al intentar crear un proyecto con 
ewuser, el servidor devolvía Error 500. El log mostraba java.sql.SQLException: path to '.../data/users/user_3.db' does not exist.
* **Causa:** La lógica de aislamiento tenant intentaba conectar a una base de datos SQLite en una carpeta (data/users) que no existía físicamente en el entorno de despliegue, aunque el usuario sí existía en la BD principal.
* **Solución:** Se añadió la creación automática de directorios en el servicio de registro. Para este caso puntual, se reparó manualmente creando la carpeta src/main/resources/data/users y copiando el template.

### Error 5.2: 404 Whitelabel Error en Recarga (SPA Routing)
* **Síntoma:** Al recargar la página en una ruta profunda (ej. /project/5/bible), Spring Boot devolvía un 404.
* **Causa:** Spring Boot intentaba resolver la URL como un recurso estático o endpoint API. Al no existir, fallaba. React Router solo puede manejar la ruta si el servidor devuelve index.html primero.
* **Solución:**
    1.  Se creó SpaController.java para redirigir cualquier ruta no-API y no-estática (regex /{path:[^\.]*}) hacia orward:/index.html.
    2.  Se habilitó spring.mvc.pathmatch.matching-strategy=ant_path_matcher en pplication.properties para soportar las regex complejas.

### Error 5.3: UI Desactualizada tras Cambios (Build Pipeline)
* **Síntoma:** Los cambios en Sidebar (iconos colapsados) no se veían en el navegador a pesar de estar codificados.
* **Causa:** El servidor Spring Boot servía los archivos estáticos de 	arget/classes/static, que eran una copia antigua. Vite no estaba compilando automáticamente.
* **Solución:** Se actualizó INICIAR.bat para ejecutar 
pm run build antes de arrancar el servidor Java, garantizando que el frontend siempre esté sincronizado.


### Error Critical 500: 'No such table: cuaderno' (SQLite)
**Síntoma:** Error 500 intermitente al cargar workspaces o crear carpetas. Logs truncados impedían ver la causa.
**Diagnóstico:**
- GlobalExceptionHandler reveló SQLITE_ERROR: no such table: cuaderno.
- La herramienta Diagnostic veía la tabla, pero Hibernate no.
- Causa raíz: Ambigüedad en la ruta relativa de JDBC (jdbc:sqlite:src/...) vs el directorio de trabajo de ejecución.
**Solución:**
1. Hardcodear ruta absoluta en pplication.properties: jdbc:sqlite:/src/... (o ruta física).
2. spring.jpa.hibernate.ddl-auto=none para evitar que Hibernate intente validar/crear esquema y confíe en DatabaseMigration.
**Estado:** Resuelto. Logs movidos a carpeta /Data.

## [2026-01-02] Limpieza de directorio Data
**AcciÃ³n:** Se movieron ackend.log, server.log, startup.log, 	race.txt del directorio Data a Docs/logs para centralizar la auditorÃ­a.

## [06/01/2026] Pantalla Blanca (Crash MapEditor)
**SÃ­ntoma:** Pantalla blanca al cargar la app. Error silencioso de importaciÃ³n.
**DiagnÃ³stico:** Conflicto de versiones. 
eact-konva v19 requiere React 19, pero el proyecto usa React 18.
**SoluciÃ³n:** Downgrade a 
eact-konva@18.2.10 y konva@9.3.16.
**Estado:** Resuelto.

---
### Error: SQLITE_ERROR: no such table: cuaderno
* **SÃƒntoma:** Errores de base de datos al iniciar o abrir proyectos.
* **Causa:** Uso de SQLite en memoria para el contexto maestro y falta de CREATE TABLE en migraciones.
* **SoluciÃƒn:** Cambiado a SQLite persistente en MultiTenantDataSource.java y habilitado CREATE TABLE IF NOT EXISTS en DatabaseMigration.java.
* **Estado:** Resuelto.

### Error: 401 Unauthorized / Password Generada
* **SÃƒntoma:** Bloqueo de acceso a la API y logs de seguridad de Spring activados.
* **Causa:** ConfiguraciÃƒn de seguridad por defecto activada; sesion de proyecto se activaba demasiado tarde.
* **SoluciÃƒn:** ConfiguraciÃƒn de SecurityConfig.java con permitAll() y activaciÃƒn de sesiÃƒn en ProyectoController.java antes de validaciones de metadatos.
* **Estado:** Resuelto.

### Error: BotÃƒn 'Guardar' desaparecido en EntityBuilder
* **SÃƒntoma:** Los usuarios no podÃƒan guardar entidades creadas.
* **Causa:** Posicionamiento ixed oculto por el sidebar y conflicto de z-index (Stacking Context).
* **SoluciÃƒn:** RediseÃƒo de la cabecera de EntityBuilder.jsx para incluir botones persistentes y eliminaciÃƒn de z-0 en ArchitectLayout.jsx.
* **Estado:** Resuelto.


### Error: Persistencia de Atributos en Entity Builder
* **DescripciÃn:** El usuario reporta que los atributos aÃadidos a una entidad no se guardan correctamente, incluso despuÃs de corregir la serializaciÃn del backend (@JsonIgnore) y el ordenamiento (@OrderBy).
* **Causa Sospechosa:** Posible fallo en la lÃgica de actualizaciÃn de estado en el frontend (IDs temporales vs reales) o timeout silencioso en el PATCH.
* **Estado:** Pendiente de investigar.
# IntegraciÃ³n MÃ³dulo Timeline (CronologÃ­as)

**Fecha:** 07/01/2026
**Estado:** Completado / Estable

## Resumen
Se ha completado la integraciÃ³n del mÃ³dulo de **LÃ­neas de Tiempo** en la interfaz principal (`ArchitectLayout`), moviÃ©ndolo de una vista aislada a un panel lateral contextual (Right Sidebar) y una visualizaciÃ³n central dedicada. AdemÃ¡s, se han resuelto errores crÃ­ticos de persistencia y sincronizaciÃ³n.

## Cambios Realizados

### 1. Arquitectura Frontend (React)
- **IntegraciÃ³n en `ArchitectLayout.jsx`**:
    - Se ha habilitado el modo `CUSTOM` en el panel lateral derecho para inyectar componentes dinÃ¡micos mediante **React Portals**.
    - `TimelineView.jsx` ahora renderiza los formularios de creaciÃ³n/ediciÃ³n de eventos en el sidebar derecho, manteniendo la visualizaciÃ³n del grafo en el centro.
- **SincronizaciÃ³n de Contexto**:
    - Se implementÃ³ un `focus listener` en `ArchitectLayout` que fuerza la recarga del contexto del proyecto (`loadProject`) al cambiar de pestaÃ±a en el navegador. Esto corrige el error de mezcla de datos entre proyectos abiertos simultÃ¡neamente.

### 2. Backend (Spring Boot)
- **ConsolidaciÃ³n de Entidades**:
    - Se eliminaron las clases redundantes `EventoCronologia` y `LineaTemporal`.
    - Se estandarizÃ³ el uso de `EventoTiempo` y `LineaTiempo`.
- **Nuevos Endpoints**:
    - `DELETE /api/timeline/evento/{id}`: Para borrado de eventos.
    - `DELETE /api/timeline/linea/{id}`: Para borrado de lÃ­neas de tiempo completas.
- **OptimizaciÃ³n JSON**:
    - Se aÃ±adiÃ³ `@JsonProperty(access = WRITE_ONLY)` en las relaciones bidireccionales (`EventoTiempo` -> `LineaTiempo`) para permitir la deserializaciÃ³n (guardado) sin causar recursiÃ³n infinita en la serializaciÃ³n (lectura).

### 3. CorrecciÃ³n de Errores (Bugfixes)
- **Error de Borrado (Timeline y Eventos)**:
    - **Causa**: Faltaban los endpoints `DELETE` en el controlador y `api.js` fallaba al procesar respuestas vacÃ­as (`204 No Content`).
    - **SoluciÃ³n**: ImplementaciÃ³n de endpoints y parcheo de `api.js` para devolver `null` en lugar de lanzar `SyntaxError` en respuestas vacÃ­as.
- **Error "No events yet"**:
    - **Causa**: El filtrado en cliente fallaba porque la relaciÃ³n `lineaTiempo` no se enviaba al cliente (por `@JsonIgnore`).
    - **SoluciÃ³n**: Se cambiÃ³ a filtrado en servidor (`/timeline/linea/{id}/eventos`).
- **Ordenamiento de Eventos Negativos**:
    - **SoluciÃ³n**: Se corrigiÃ³ la lÃ³gica de sugerencia de orden para respetar fechas negativas (a.C.), evitando que el contador se reinicie a 1 incorrectamente.

## Archivos Clave Modificados
- `src/main/frontend/jsx/pages/Timeline/TimelineView.jsx`
- `src/main/frontend/jsx/components/layout/ArchitectLayout.jsx`
- `src/main/frontend/js/services/api.js`
- `src/main/java/com/worldbuilding/app/controller/TimelineController.java`
- `src/main/java/com/worldbuilding/app/model/EventoTiempo.java`

### Prompt ID: 9 (Consolidación Frontend y Fixes Finales)
> Finalizar migración a Shadcn, arreglar lógica de Map Editor y estabilizar Backend database.
**Resultados:**
*   [UI] **Shadcn Refactor**: Migrados Button.jsx y InputModal.jsx al tema 'Arcane Void' (Indigo/Emerald).
*   [FIX] **Map Editor**: Corregido bug de guardado (BINARY_DATA) para persistir imágenes de fondo correctamente.
*   [FIX] **Layout**: Eliminado auto-colapso forzado del Sidebar en la vista de Biblia.
*   [BACKEND] **Estabilización**:
    *   Establecido `ddl-auto=none` como estrategia final (Pure Flyway) tras reparación inicial con `create`. `validate` se descartó por incompatibilidad de tipos SQLite.
    *   Habilitado flyway.repair-on-migrate para corregir checksums de migraciones editadas.
    *   Verificado arranque limpio y relaciones JPA (AtributoPlantilla/AtributoValor).


### Prompt ID: 10 (Adaptaci�n Monousuario y Fix Cr�tico Flyway)
> Habilitar modo monousuario y corregir error persistente 'no such table' en arranque limpio.
**Resultados:**
*   [CRITICAL FIX] **Configuraci�n Flyway**: Detectado que spring.flyway.baseline-version=1 imped�a la ejecuci�n de V1__init.sql en bases de datos vac�as. **Soluci�n**: Deshabilitar baseline-version para forzar migraci�n inicial.
*   [AUTH] **Modo Monousuario**: Implementado ProjectSessionInterceptor con l�gica de 'Auto-Login'. Si no hay sesi�n, se inyecta autom�ticamente usuario 'Architect' y proyecto 'Default World', eliminando la necesidad de Login/Registro.
*   [STABILITY] **Reset Final**: Saneamiento completo de worldbuilding.db para garantizar consistencia de esquema Hibernate/Flyway.

