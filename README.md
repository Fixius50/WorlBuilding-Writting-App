# WorlBuilding-Writting-App

App en desarrollo para la creación de mundos enfocados en una forma de crearlos como si estuvieras planificando una historia de DnD. Este proyecto es con mucha pasión y esfuerzo.

## 1. Cómo Arrancar la Aplicación (¡Importante!)

Este proyecto ha sido refactorizado a un modelo híbrido que **automatiza la configuración de la base de datos**. Ya no es necesario usar `phpmyadmin` para ejecutar scripts manualmente.

El flujo de arranque para cualquier usuario es ahora mucho más simple:

1.  **Encender MySQL:** Abrir el panel de control de XAMPP y hacer clic en **"Start"** únicamente en el servicio de **`MySQL`**.
    * **NO** es necesario iniciar `Apache` o `Tomcat`.
2.  **Ejecutar la App:** Iniciar la aplicación Spring Boot (desde tu IDE o ejecutando el archivo `.jar`).

¡Eso es todo! La aplicación arrancará, se conectará a MySQL y configurará automáticamente todas las tablas y procedimientos.

## 2. Composición del Proyecto

La siguiente estructura no debe borrarse; primero se explica como es y luego se dice que se hace:

* `.gitignore` y `readme.md`: Es para el repositorio de github.
* `.idea`, `.mvn`, y `.vscode`: Son para ejecutar la app en distintos editores de código.
* `target`: Es para que el proyecto se sincronice automáticamente con las carpetas y archivos de "src/main".
* `pom.xml`: Es para enlazar con el repositorio y poder ejecutar los archivos sin descargarlos.
* `src`: Es donde se crea el proyecto junto a todos los archivos, tanto de programación como multimedia.
    * `src/main/java`: Contiene todo el código del backend (Spring Boot).
    * `src/main/resources`: Contiene la configuración (`application.properties`), los scripts SQL automáticos (`worldbuilding.sql`) y todo el frontend (`static/`).

## 3. Arquitectura del Backend (Java / Spring Boot)

El backend ha sido refactorizado a un modelo híbrido "Java Manda" que automatiza la gestión de la base de datos.

### 3.1. Configuración de la Base de Datos (El Modelo Híbrido)

El sistema **NO** requiere que el usuario ejecute scripts SQL manualmente en phpMyAdmin. La configuración es automática:

1.  **`spring.jpa.hibernate.ddl-auto=update`**: Esta propiedad en `application.properties` le ordena a Hibernate (JPA) que **cree o actualice automáticamente todas las TABLAS** (`zona`, `efectos`, `nodo`, `relacion`, etc.) basándose en las clases `@Entity` (ej. `Zona.java`, `Efectos.java`) del paquete de modelos.
2.  **`spring.sql.init.schema-locations=classpath:worldbuilding.sql`**: Esta propiedad le dice a Spring Boot que, *después* de que Hibernate cree las tablas, debe ejecutar el archivo `worldbuilding.sql` (ubicado en `src/main/resources/`).
3.  **Rol de `worldbuilding.sql`**: Este archivo **SOLO** contiene la lógica que Hibernate no puede crear, como tus **Funciones (`CREATE FUNCTION`) y Procedimientos Almacenados (`CREATE PROCEDURE`)**.
4.  **`spring.jpa.defer-datasource-initialization=true`**: Esta es la clave que une todo, asegurando que el script `worldbuilding.sql` (Paso 2) se ejecute *después* de que JPA haya creado las tablas (Paso 1), evitando errores de "tabla no existe".

### 3.2. Controladores Principales

* **`ProyectoController.java`**: Gestiona la **creación y apertura de proyectos**.
    * `POST /api/proyectos/crear`: Guarda un nuevo proyecto en la tabla `crearProyecto` de la BD y, además, crea un archivo `.sql` en `src/main/data/` como un **historial/log** de operaciones.
    * `GET /api/proyectos/{nombre}`: Abre un proyecto consultando la BD.
    * [cite_start]`GET /api/proyectos/activo`: Devuelve el proyecto activo guardado en la sesión HTTP. [cite: 4]

* **`BDController.java`**: Es el "Despachador" de datos. Gestiona todas las entidades del mundo (personajes, zonas, etc.).
    * `PUT /api/bd/insertar`: Recibe un JSON (el `DatosTablaDTO`) desde el frontend. [cite_start]Lee el campo `tipo` (ej. "zona") y usa el repositorio correcto (ej. `zonaRepo.save()`) para guardar los datos en la tabla correspondiente. [cite: 4]
    * `GET /api/bd/{tipo}` (ej. `/api/bd/zona`): Obtiene **TODOS** los registros de una tabla específica.
    * [cite_start]`DELETE /api/bd/eliminar`: Elimina un registro. [cite: 4]
    * [cite_start]`PATCH /api/bd/modificar`: Modifica un elemento. [cite: 4]
    * `POST /api/bd/activar-nodo`: Llama al procedimiento `activarNodo` en la base de datos.

---

## 4. Arquitectura del Frontend (HTML / JS)

El frontend está dividido en varias páginas clave:

* **`menuInicialLog.html`**: Página de aterrizaje (ahora potenciada por React). Permite "Crear" o "Abrir" un proyecto. La lógica está en `js/paginas/menuInicialLog.js`.
* **`ventanaProyectos.html`**: El *dashboard* principal. Contiene la barra lateral de objetos y el mapa infinito/React Flow.
* **`ventanaCreacion.html`**: Una página "lanzadora" que carga dinámicamente los formularios de creación.
* **`opciones/*.html`**: (ej. `zona.html`, `entidad-individual.html`) Son los formularios individuales para crear cada tipo de entidad.
* [cite_start]**`js/esquemas/`**: Contiene la lógica pesada del frontend (React Flow, Carga de Datos, Mapa). [cite: 3]

---

## 5. Flujo de Datos (¡El Núcleo del Cambio!)

Esta sección detalla cómo el frontend y el backend interactúan. **El sistema antiguo de parsear archivos `.sql` ha sido eliminado y reemplazado por llamadas directas a la API de la base de datos.**

### 5.1. Flujo: Creación de un Proyecto

1.  El usuario rellena el formulario en `menuInicialLog.html`.
2.  `menuInicialLog.js` llama a `fetch("POST", "/api/proyectos/crear")`.
3.  El `ProyectoController` (Backend) recibe la llamada.
4.  Guarda el nuevo proyecto en la tabla `crearProyecto` de MySQL.
5.  Crea un archivo de log vacío (ej. `MiProyecto.sql`) en `src/main/data/`.
6.  Guarda el proyecto en la `HttpSession` y redirige al usuario a `ventanaProyectos.html`.

### 5.2. Flujo: Creación de una Entidad (Ej: Una "Zona")

1.  El usuario está en `ventanaCreacion.html` y abre el formulario `zonas.html`.
2.  Rellena los campos (Nombre, Tamaño, etc.) y pulsa "Guardar".
3.  El `<script>` dentro de `zonas.html` (en la función `guardarEntidad`) crea un **objeto JSON plano (DatosTablaDTO)**:
    ```javascript
    {
      "nombre": "Bosque Tenebroso",
      "apellidos": "Norte",
      "tipo": "zona", // ¡Esta es la clave para el despachador!
      "descripcion": "...",
      "tamannoZona": "grande",
      "desarrolloZona": "natural"
      // ... (otros campos en null)
    }
    ```
4.  El script llama a `fetch("PUT", "/api/bd/insertar")` con este JSON.
5.  El `BDController` (Backend) recibe el JSON. Mira `if (dto.getTipo().equals("zona"))`.
6.  Llama a `zonaRepo.save()`, guardando la nueva zona en la tabla `zona` de MySQL.
7.  Responde con un "200 OK" al frontend.

### 5.3. Flujo: Carga de Datos (La Barra Lateral)

Esto ha sido completamente refactorizado. El sistema **ya no parsea archivos SQL**.

1.  El usuario carga `ventanaProyectos.html`.
2.  [cite_start]Se inicializa `ProjectDataLoader.js`. [cite: 2]
3.  [cite_start]La función `loadProjectData()` se ejecuta. [cite: 2]
4.  **¡El Cambio Clave!** `ProjectDataLoader.js` ejecuta `Promise.all` para llamar a **TODOS** los endpoints de la API en paralelo:
    * `GET /api/bd/entidadindividual`
    * `GET /api/bd/entidadcolectiva`
    * `GET /api/bd/zona`
    * `GET /api/bd/construccion`
    * `GET /api/bd/efectos`
5.  El `BDController` (Backend) recibe estas 5 llamadas, consulta la base de datos MySQL 5 veces (ej. `zonaRepo.findAll()`) y devuelve 5 listas JSON con los datos reales.
6.  `ProjectDataLoader.js` recibe todas las listas JSON y las guarda en `this.projectData`.
7.  [cite_start]Se llama a `updateUI()`, que actualiza los **contadores dinámicos** (ej. "Zonas (3)") y rellena la **lista de objetos arrastrables** con los datos de la base de datos. [cite: 2]

---

## 6. Componentes Clave del Frontend

### 6.1. `ProjectDataLoader.js`

* **Rol:** El componente principal para cargar y gestionar los datos del proyecto.
* **Carga de Datos:** (Ver Flujo 5.3) Llama a todos los endpoints `/api/bd/{tipo}` para obtener datos frescos de la base de datos.
* [cite_start]**Gestión de UI:** Rellena la barra lateral en `ventanaProyectos.html` con los **contadores dinámicos** y los **elementos arrastrables**. [cite: 2]
* [cite_start]**Drag & Drop:** Gestiona el `dragstart` de un elemento de la lista (ej. "Gandalf"). [cite: 2]

### 6.2. `InfiniteMap.js`

* [cite_start]**Rol:** Proporciona un lienzo de mapa 2D infinito con una cuadrícula. [cite: 1]
* **Características:**
    * [cite_start]Navegación (Pan) y Zoom (Rueda del ratón). [cite: 1]
    * [cite_start]Controles de teclado (Flechas, +/-, 0). [cite: 1]
    * [cite_start]API para añadir "Marcadores" (`addMarker()`). [cite: 1]
* **Integración:**
    * `ProjectDataLoader` usa este componente. [cite_start]Cuando un objeto se suelta (`handleDrop`) en el mapa, llama a `infiniteMap.addMarker()` para crear un pin visual en esa coordenada. [cite: 1]

### 6.3. [cite_start]Sistema React Flow (Diagramas) [cite: 3]

* [cite_start]**Rol:** El sistema avanzado (alternativo al `InfiniteMap`) para crear diagramas de relaciones (grafos). [cite: 3]
* [cite_start]**Archivos:** `FlowManager.js`, `FlowInterface.js`, y las clases en `nodes/` y `edges/`. [cite: 3, 4]
* **`FlowManager.js`:** Es el "cerebro". [cite_start]Mantiene el estado de los nodos y conexiones y se comunica con el backend. [cite: 3, 4]
* [cite_start]**`nodes/` (ej. `EntidadIndividualNode.js`):** Son plantillas que definen cómo se ve y se comporta un nodo (ej. "Personaje") en el diagrama. [cite: 3, 4]
* [cite_start]**`edges/` (ej. `RelacionLinea.js`):** Define cómo se ven las líneas de conexión. [cite: 3, 4]
* **Flujo de Datos (Corregido):**
    * **Carga:** El `FlowManager` (al igual que el `ProjectDataLoader`) debe cargar sus datos llamando a los endpoints `/api/bd/{tipo}`.
    * [cite_start]**Creación:** Cuando se crea un nodo, debe llamar a `/api/bd/insertar` (o `/api/bd/modificar` para editar) usando el DTO plano correcto. [cite: 4]
    * **Casos de Uso:** Mapear relaciones de personajes, crear árboles genealógicos, visualizar sistemas de magia o estructuras organizacionales.

---

## 7. El Nuevo Rol de los Archivos SQL

Esto es un cambio fundamental respecto al sistema antiguo.

### 7.1. `src/main/resources/worldbuilding.sql` (El Archivo "Maestro")

* **Rol:** Contiene **SOLAMENTE** `CREATE FUNCTION` y `CREATE PROCEDURE`.
* **NO CONTIENE** `CREATE TABLE`.
* **Ejecución:** Se ejecuta **automáticamente** una vez al arrancar Spring Boot para añadir tu lógica SQL personalizada a la base de datos.
* **Mantenimiento:** Si cambias un procedimiento, solo lo editas aquí.

### 7.2. `src/main/data/*.sql` (ej. `MiProyecto.sql`) (Los Archivos "Log")

* **Rol:** Son **SOLO UN HISTORIAL O LOG** de las operaciones del proyecto.
* **NO SE USAN PARA CARGAR DATOS.** `ProjectDataLoader` **nunca** lee estos archivos.
* **Escritura:** El `ProyectoController` (a través de `ProyectoService`) *sigue* añadiendo texto a estos archivos (ej. `INSERT INTO...`) como una forma de trazabilidad.
* **Ventaja:** Tienes un log de todo lo que ha pasado, pero la aplicación usa la base de datos MySQL, que es mucho más rápida y fiable.
