# Bitácora de Desarrollo (Log Prompts)

---

### Prompt ID: 22 (RediseÃ±o "Chronos Atlas Next")

**Prompt:** "LAS FUNCIONALIDADES (capturas que te pase) sobreescribelas en ese archivo funcionalidades.md. Con esto YA"
**Resultados:**

- [DOCS] TranscripciÃ³n total de 10 imÃ¡genes detallando el nuevo paradigma modular.
- [PLAN] CreaciÃ³n del plan de implementaciÃ³n para el esquema dinÃ¡mico (Folders/Templates).
- [ARCH] ReestructuraciÃ³n visual hacia 3 paneles + Bottom Dock.

---

### Prompt ID: 0 (Setup Inicial)
>
> Analizame la app WorldbuildingApp y todas sus versiones... serverless pero con funcionamiento en el explorador...
**Resultados:**

- [ANÃƒï¿½LISIS] Determinada estructura (v1/v2 Java, v3 Next.js).
- [ESTRATEGIA] MigraciÃƒÂ³n exitosa a Java Spring Boot + H2 (standalone).

---

### Prompt ID: 3 (Estructura de Cuadernos)
>
> ...cuaderno/libro... plantillas/hojas... numerando las hojas...

- [BUG FIX] Corregido error en `DynamicDataSourceConfig`: el inicializador SQL ignoraba bloques que empezaban con comentarios, omitiendo la creaciÃƒÂ³n de tablas.
- [COMPATIBILIDAD] Cambiado `MEDIUMTEXT` por `CLOB` en todas las entidades para asegurar compatibilidad total con H2.
- [VERIFICACIÃƒâ€œN] Verificado flujo completo en un nuevo proyecto "Mundo_Arreglado".

### Prompt ID: 6 (NavegaciÃƒÂ³n y Arquitectura)
>
> Elimina la sidebar, pon un menÃƒÂº radial arriba y prepara el backend para multi-usuario...
**Resultados:**

- [UX] Implementado menÃƒÂº radial Top-Center (Glassmorphism). Refactorizados todos los HTMLs.
- [BACKEND] Creada entidad Usuario y repositorio JPA. Configurado redirecciÃƒÂ³n a Login.

---

### Prompt ID: 7 (MigraciÃ³n a SQLite)
>
> Migrate to SQLite Database
**Resultados:**

- [DATABASE] MigraciÃ³n completa de H2 a SQLite (data/worldbuilding.db).
- [CLEANUP] Eliminado cÃ³digo legacy H2 (DynamicDataSourceConfig, H2Functions).
- [REFACTOR] Reescritura de ProyectoController y BDController para JPA estÃ¡ndar.

### Prompt ID: 8 (Multi-tenancy & Real Login)
>
> Aislamiento de datos por usuario y registro funcional.
**Resultados:**

- [SECURITY] Implementado `ProjectSessionInterceptor` para proteger APIs.
- [AUTH] Completado `AuthController` con registro, login y logout real.
- [DATA] Modificados modelos (`Proyecto`) y repositorios para filtrar por `Usuario`.
- [FIX] Resuelto conflicto de puerto 8080.

---

### Prompt ID: 9 (Refinamiento UI & LibrerÃ­a)
>
> Refinamiento estÃ©tico, Biblia de Entidades y MÃ³dulo de LibrerÃ­a.
**Resultados:**

- [UX] MenÃº Radial optimizado (mÃ¡s amplio) y Perfil unificado (Dashboard style).
- [BIBLIA] RediseÃ±o total con filtros superiores, conteo dinÃ¡mico en tiempo real y nuevos tipos (Magia, Zonas, Efectos).
- [DASHBOARD] AÃ±adidos campos de gÃ©nero, tipo e imagen al crear proyectos.
- [LIBRERÃA] Creado mÃ³dulo de gestiÃ³n de hojas (`libreria.html`) con navegaciÃ³n avanzada.

---

### [2026-01-25] Sesión: Estabilidad, Fixes de UI y Multi-tenencia Estricta

**Prompt:** Solución a "Hojas en blanco", error de carpetas faltantes y limpieza de multi-tenencia (nada por defecto).
**Resultados:**

- [FIX] **Hojas en Blanco**: `EscrituraController` ahora inicializa pÃ¡ginas con `<p></p>` para evitar fallos de renderizado en Tiptap/Quill.
- [FIX] **Timeline NPE**: Corregido NullPointerException en `BDController.listarPorTipo` cuando `lineaTiempoRepo.findAll()` devolvÃ­a elementos nulos.
- [REFACTOR] **Multi-Tenencia Estricta**:
  - Eliminadas todas las redirecciones automÃ¡ticas a "Prime World".
  - `Default World` ahora se usa como un cuaderno estÃ¡ndar con su propio archivo `.db`.
  - Limpieza de `DataInitializer`: No se inyectan datos globales al arrancar; cada proyecto es autÃ³nomo.
- [LOGS] Creado `Docs/log_prompts.md` y actualizado `Docs/log_errores.md`.
- [FIX] **Permisos SQLite**: Redirigida la carpeta temporal de SQLite a `./target/sqlite-tmp` para evitar `AccessDeniedException` en entornos Windows restringidos.
- [CLEANUP] Saneamiento de `DataInitializer.java` eliminando mÃ©todos de inicializaciÃ³n hardcoded.
- [FIX] **Panel Derecho**: Corregido error de compresiÃ³n mediante `shrink-0` y aÃ±adidos iconos representativos para todos los modos cuando el panel estÃ¡ colapsado.
- [UX] **Estabilidad Visual**: Optimizada la carga inicial de `TimelineView.jsx` para evitar parpadeos y asegurar la selecciÃ³n del proyecto correcto.
- [FIX] **Jerarquía Biblia**: Implementada jerarquía plana (Root -> Carpetas -> Entidades). Eliminada la creación de subcarpetas redundantes.
- [UX] **Sistema CRUD Biblia**: Añadido menú de creación rápida dentro de las carpetas para todos los tipos de entidad (Personajes, Mapas, Lore, etc.).
- [CLEANUP] **Eliminación de Self-Healing**: Eliminada toda lógica de auto-recuperación silenciosa en controladores para exponer errores de contexto reales.
- [FIX] **Gestión Global de Errores**: Implementado `GlobalExceptionHandler.java` para interceptar y limpiar excepciones de Java, devolviendo errores legibles al frontend.
- [DOCS] **Formalización de Reglas**: Creado [04_Reglas_Strictas_Proyecto.md](file:///c:/Users/rober/Desktop/Proyectos propios/WorldbuildingApp/Docs/04_Reglas_Strictas_Proyecto.md) consolidando prohibición de self-healing, jerarquía plana y gestión estricta de errores como estándares definitivos del proyecto.
