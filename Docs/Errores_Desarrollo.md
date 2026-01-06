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
**Diagnóstico:** Conflicto de versiones. eact-konva v19 requiere React 19, pero el proyecto usa React 18.
**Solución:** Downgrade a eact-konva@18.2.10 y konva@9.3.16.
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

