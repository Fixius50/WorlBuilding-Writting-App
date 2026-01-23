# Registro de Hotfixes y Estabilización

## Sesión de Estabilización Crítica (Resolución de Bugs Multi-Tenant)

### Contexto
Se reportaron errores críticos en la gestión de nuevos proyectos: datos que desaparecían ("Pérdida de Carpetas") y títulos que nunca cargaban ("Cargando... Infinito").

### Diagnóstico Técnico
1.  **Split-Brain Identity (Cruce de Datos)**:
    *   La aplicación utiliza SQLite Multi-Tenant (`{proyecto}.db`).
    *   `ProjectDiscoveryService` inicializa el DB correctamente (ID 1).
    *   Sin embargo, `EscrituraController` a veces creaba registros duplicados (ID 2, 3...) vacíos.
    *   Los controladores utilizaban `findFirst()` sin orden específico. A veces cargaban el ID 1 (con datos), a veces el ID 2 (vacío), dando la ilusión de pérdida de datos.

2.  **Context Switching Fail**:
    *   La conmutación de bases de datos dependía implícitamente de un Interceptor. En ciertos flujos, este fallaba, escribiendo datos en el DB por defecto ("Prime World") en lugar del proyecto seleccionado.

3.  **Null Pointer Exception (NPE)**:
    *   Como resultado del Split-Brain, quedaron registros corruptos en la BBDD con `ID = NULL`.
    *   El comparador de ordenación `Comparator.comparing(Cuaderno::getId)` lanzaba una excepción 500 al encontrar estos nulos, bloqueando el dashboard.

### Soluciones Implementadas
1.  **Determinismo en Controladores**:
    *   Se modificó `WorldBibleController` y `ProyectoController` para buscar usando `.sorted(Comparator.comparing(Cuaderno::getId))`. Esto prioriza siempre el registro Raíz (ID 1).

2.  **Null Safety**:
    *   Se añadió un filtro `.filter(c -> c.getId() != null)` antes de ordenar, inmunizando al servidor contra datos corruptos antiguos.

3.  **Sincronización Explícita**:
    *   Se forzó `TenantContext.setCurrentTenant()` en cada operación crítica de escritura, eliminando la dependencia ciega del Interceptor.

### Estado Actual
El sistema ahora soporta robustamente la creación y cambio entre múltiples proyectos/mundos.
