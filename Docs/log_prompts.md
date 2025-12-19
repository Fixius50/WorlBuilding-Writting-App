# BitÃ¡cora de Desarrollo (Log Prompts)

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
