# Registro de Hotfixes y Estabilización

## Sesión de Estabilización Crítica (Resolución de Bugs Multi-Tenant)

### Contexto

Se reportaron errores críticos en la gestión de nuevos proyectos: datos que desaparecían ("Pérdida de Carpetas") y títulos que nunca cargaban ("Cargando... Infinito").

### Diagnóstico Técnico

1. **Split-Brain Identity (Cruce de Datos)**:
    * La aplicación utiliza SQLite Multi-Tenant (`{proyecto}.db`).
    * `ProjectDiscoveryService` inicializa el DB correctamente (ID 1).
    * Sin embargo, `EscrituraController` a veces creaba registros duplicados (ID 2, 3...) vacíos.
    * Los controladores utilizaban `findFirst()` sin orden específico. A veces cargaban el ID 1 (con datos), a veces el ID 2 (vacío), dando la ilusión de pérdida de datos.

2. **Context Switching Fail**:
    * La conmutación de bases de datos dependía implícitamente de un Interceptor. En ciertos flujos, este fallaba, escribiendo datos en el DB por defecto ("Prime World") en lugar del proyecto seleccionado.

3. **Null Pointer Exception (NPE)**:
    * Como resultado del Split-Brain, quedaron registros corruptos en la BBDD con `ID = NULL`.
    * El comparador de ordenación `Comparator.comparing(Cuaderno::getId)` lanzaba una excepción 500 al encontrar estos nulos, bloqueando el dashboard.

### Soluciones Implementadas

1. **Determinismo en Controladores**:
    * Se modificó `WorldBibleController` y `ProyectoController` para buscar usando `.sorted(Comparator.comparing(Cuaderno::getId))`. Esto prioriza siempre el registro Raíz (ID 1).

2. **Null Safety**:
    * Se añadió un filtro `.filter(c -> c.getId() != null)` antes de ordenar, inmunizando al servidor contra datos corruptos antiguos.

3. **Sincronización Explícita**:
    * Se forzó `TenantContext.setCurrentTenant()` en cada operación crítica de escritura, eliminando la dependencia ciega del Interceptor.

### Estado Actual

El sistema ahora soporta robustamente la creación y cambio entre múltiples proyectos/mundos.

## Sesión de Estabilización de Persistencia (Lazy Loading y Navegación)

### Contexto

El usuario reportó errores 500 al guardar entidades y fallos de navegación ("Interface no se quita") al editar.

### Diagnóstico Técnico

1. **LazyInitializationException**:
    * Hibernate devolvía proxies no inicializados de `Carpeta` y `AtributoPlantilla`.
    * Al serializar a JSON, Jackson intentaba acceder a ellos fuera de la transacción, lanzando excepción.
2. **Navigation Breakdown**:
    * El frontend dependía de la URL para saber a qué carpeta volver.
    * Si se accedía desde "Favoritos" o búsqueda, la URL no tenía slug de carpeta, rompiendo la redirección.

### Soluciones Implementadas

1. **Hydration Helper (`hydrateEntity`)**:
    * Método centralizado en `WorldBibleService` que fuerza `Hibernate.initialize()` en todas las relaciones críticas (`valores`, `plantilla`, `carpeta`) antes de cerrar la transacción.
2. **Server-Side Context**:
    * El frontend ahora ignora la URL y usa `entity.carpeta` (provista por el servidor) para determinar la redirección segura.

### Estado Actual

Guardado, Edición, Continuar Editando y Renombrado son totalmente estables.
