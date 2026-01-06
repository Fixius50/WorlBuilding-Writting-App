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

