# Sistema de Archivos SQL por Proyecto

## Descripción General

El sistema ahora genera un archivo SQL específico para cada proyecto creado, utilizando `worldbuilding.sql` como base de referencia. Los archivos de proyecto solo contienen `use worldbuilding;` y las operaciones específicas, sin duplicar las definiciones de tablas y funciones.

## Funcionalidades Implementadas

### 1. Creación de Proyectos con Archivo SQL Específico

Cuando se crea un nuevo proyecto, el sistema:

1. **Verifica la existencia de `worldbuilding.sql`** como archivo base
2. **Crea un archivo `nombre_proyecto.sql`** en la carpeta `src/main/data/`
3. **Agrega metadatos del proyecto** (nombre, enfoque, fecha de creación)
4. **Incluye solo `use worldbuilding;`** como referencia a la base de datos
5. **Incluye la inserción del proyecto** en la tabla `crearProyecto`
6. **Agrega comentarios y ejemplos** para futuras operaciones

### 2. Estructura del Archivo SQL del Proyecto

Cada archivo de proyecto tiene la siguiente estructura:

```sql
-- ===========================================
-- PROYECTO: [Nombre del Proyecto]
-- ENFOQUE: [Enfoque del Proyecto]
-- FECHA DE CREACIÓN: [Timestamp]
-- ===========================================

-- REFERENCIA A LA BASE DE DATOS GENERAL
-- Este archivo usa worldbuilding.sql como base
-- Las tablas y funciones están definidas en worldbuilding.sql

use worldbuilding;

-- ===========================================
-- OPERACIONES ESPECÍFICAS DEL PROYECTO: [Nombre]
-- ===========================================

-- Crear el proyecto en la base de datos
INSERT INTO crearProyecto (nombreProyecto, enfoqueProyecto) VALUES ('[nombre]', '[enfoque]');

-- ===========================================
-- AQUÍ SE AGREGARÁN LAS OPERACIONES ESPECÍFICAS DEL PROYECTO
-- ===========================================

-- Ejemplos de operaciones que se pueden agregar:
-- INSERT INTO entidadIndividual (...) VALUES (...);
-- INSERT INTO construccion (...) VALUES (...);
-- etc.

-- Operación agregada: [timestamp]
[Operaciones SQL específicas del proyecto]
```

### 3. Operaciones Automáticas

El sistema automáticamente agrega operaciones SQL al archivo del proyecto cuando:

- **Se insertan datos** desde los formularios HTML
- **Se eliminan datos** 
- **Se modifican datos**
- **Se crean relaciones** entre elementos

### 4. Endpoints Nuevos

#### ProyectoController

- `POST /api/proyectos/agregar-operacion`: Agrega una operación SQL manual al archivo del proyecto
- `GET /api/proyectos/archivo-sql`: Obtiene el contenido del archivo SQL del proyecto activo

#### BDController (Actualizado)

- Todos los métodos ahora requieren `HttpSession` para obtener el proyecto activo
- Las operaciones se escriben automáticamente en el archivo SQL del proyecto
- Se genera SQL válido con escape de caracteres especiales

## Ventajas del Sistema

### 1. **Aislamiento de Proyectos**
- Cada proyecto tiene su propio archivo SQL
- No hay interferencia entre proyectos
- Fácil respaldo y versionado por proyecto

### 2. **Trazabilidad Completa**
- Todas las operaciones quedan registradas con timestamp
- Historial completo de cambios en cada proyecto
- Fácil auditoría y debugging

### 3. **Flexibilidad**
- Los archivos SQL pueden ser modificados manualmente
- Compatibilidad con herramientas SQL externas
- Posibilidad de ejecutar scripts personalizados

### 4. **Eficiencia**
- **Archivos más pequeños y limpios**: Solo contienen operaciones específicas
- **Sin duplicación**: Las tablas y funciones están solo en `worldbuilding.sql`
- **Fácil mantenimiento**: Cambios en la estructura solo requieren modificar `worldbuilding.sql`

### 5. **Reutilización**
- `worldbuilding.sql` sirve como plantilla base con todas las definiciones
- Estructura consistente entre proyectos
- Fácil mantenimiento y actualizaciones

## Ejemplo de Uso

### 1. Crear un Proyecto

```bash
POST /api/proyectos
Content-Type: application/x-www-form-urlencoded

nombre=Mi Mundo Fantástico&enfoque=fantasia
```

**Resultado**: Se crea `src/main/data/Mi Mundo Fantástico.sql` con estructura limpia

### 2. Insertar Datos

```javascript
// Desde un formulario HTML
fetch('/api/bd/insertar', {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
        nombre: "Gandalf",
        apellidos: "el Gris",
        tipo: "inmortal",
        descripcion: "Un poderoso mago",
        estado: "activo",
        origen: "ficticio",
        comportamiento: "activo"
    })
});
```

**Resultado**: Se agrega al archivo SQL:
```sql
-- Operación agregada: 2024-01-15T10:35:22
INSERT INTO entidadIndividual (nombre, apellidos, tipo, descripcion, estado, origen, comportamiento) VALUES ('Gandalf', 'el Gris', 'inmortal', 'Un poderoso mago', 'activo', 'ficticio', 'activo');
```

### 3. Agregar Operación Manual

```bash
POST /api/proyectos/agregar-operacion
Content-Type: application/x-www-form-urlencoded

operacionSQL=UPDATE entidadIndividual SET descripcion = 'Mago más poderoso' WHERE nombre = 'Gandalf';
```

### 4. Ver Archivo SQL

```bash
GET /api/proyectos/archivo-sql
```

## Consideraciones Técnicas

### 1. **Escape de Caracteres**
- El sistema escapa automáticamente comillas simples y barras invertidas
- Previene inyección SQL básica
- Genera SQL válido y seguro

### 2. **Manejo de Errores**
- Verificación de existencia de archivos
- Validación de proyecto activo
- Mensajes de error descriptivos

### 3. **Sesiones HTTP**
- Uso de `HttpSession` para mantener el proyecto activo
- Persistencia del estado entre requests
- Validación de sesión en cada operación

### 4. **Concurrencia**
- Uso de `StandardOpenOption.TRUNCATE_EXISTING` para escrituras atómicas
- Lectura completa antes de escritura para evitar pérdida de datos
- Manejo seguro de archivos concurrentes

### 5. **Estructura de Archivos**
- **`worldbuilding.sql`**: Contiene todas las definiciones de tablas, funciones y procedimientos
- **`nombre_proyecto.sql`**: Solo contiene `use worldbuilding;` y operaciones específicas
- **Sin duplicación**: Evita redundancia y facilita el mantenimiento

## Archivos Modificados

1. **ProyectoController.java**: Lógica de creación de archivos SQL por proyecto (estructura limpia)
2. **BDController.java**: Integración con archivos SQL específicos
3. **MetodosBaseDatos.java**: Actualización de interfaz con HttpSession
4. **Todos los HTML de opciones**: Actualización para usar el nuevo sistema

## Próximos Pasos

1. **Implementar ejecución de archivos SQL**: Ejecutar automáticamente las operaciones en la base de datos
2. **Sistema de versionado**: Control de versiones de archivos SQL
3. **Backup automático**: Respaldo periódico de archivos de proyecto
4. **Interfaz de visualización**: Editor visual para archivos SQL
5. **Validación SQL**: Verificación de sintaxis antes de escribir al archivo
6. **Sincronización**: Asegurar que los archivos de proyecto estén sincronizados con `worldbuilding.sql` 