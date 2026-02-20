# Bitácora de Desarrollo - Sesión 2026-02-20

## 📋 Resumen Ejecutivo

Sesión crítica de estabilización del entorno de desarrollo y resolución de problemas de conectividad en componentes embebidos (Grafo Global). Se optimizó el flujo de arranque para evitar conflictos de puerto y se robusteció el sistema multi-tenant para soportar accesos desde iframes.

---

## 🐛 Bugs Corregidos

### 1. Conflicto de Puertos en el Arranque

**Problema**: El backend abría automáticamente una pestaña en el puerto 8080, mientras que el frontend abría el 3000, causando confusión. Además, el script `INICIAR.bat` lanzaba el frontend demasiado rápido provocando errores `ECONNREFUSED`.

**Solución**:

- Eliminado `launchBrowser` de `WorldbuildingApplication.java`.
- Actualizado `INICIAR.bat` con 25 segundos de espera y eliminado el `clean` innecesario en ejecuciones diarias.
- Configurado Vite para ser el único encargado de abrir el navegador.

### 2. Grafo Vacío en Iframe/Drawer

**Problema**: El `WorldBibleController` ignoraba el contexto del proyecto cuando se pedía desde el drawer inferior (iframe), devolviendo 401 o una estructura vacía debido a la falta de cookies de sesión.

**Solución**:

- **Backend**: El controlador ahora prioriza el `TenantContext` (alimentado por el header `X-Project-ID`) si no existe sesión activa.
- **Frontend**: Inyección automática del header en todas las peticiones de `api.js` y normalización de la respuesta en `GeneralGraphView.jsx`.

---

# Bitácora de Desarrollo - Sesión 2026-02-07

## 📋 Resumen Ejecutivo

Sesión enfocada en corrección de bugs críticos y mejoras de UX en WorldbuildingApp. Se resolvieron problemas de visualización, errores de backend (500), y se implementó un sistema de actualización automática para el grafo de relaciones.

---

## 🐛 Bugs Corregidos

### 1. Sistema de Favoritos Eliminado

**Problema**: Funcionalidad de favoritos incompleta y no utilizada.

**Solución**: Eliminado botón "Toggle Favorite" del menú contextual en `FolderItem.jsx`.

**Archivos modificados**:

- [FolderItem.jsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/frontend/jsx/components/worldbible/FolderItem.jsx)

---

### 2. Modal de Borrado de Páginas

**Problema**: El modal de confirmación ejecutaba la función de borrado incluso cuando mostraba un error ("No puedes borrar la última página").

**Solución**: Modificada la lógica del `ConfirmModal` para que:

- Solo ejecute `onConfirm` cuando NO hay error
- Muestre "OK" en lugar de "Confirmar" cuando hay error
- Actúe como simple cierre cuando hay error

**Archivos modificados**:

- [WritingView.jsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/frontend/jsx/pages/Writing/WritingView.jsx) (líneas 363-373)

**Código clave**:

```javascript
onConfirm={pageToDelete?.error === 'one_page' ? () => {
    setDeleteModalOpen(false);
    setPageToDelete(null);
} : confirmDeletePage}
```

---

### 3. Relaciones del Grafo No Visibles

**Problema**: La sección "Conexiones Activas" no se mostraba al seleccionar un nodo porque estaba dentro de un bloque condicional `selectedNode.isFull`.

**Solución**: Movida la sección fuera del bloque condicional para que siempre se muestre al seleccionar un nodo.

**Archivos modificados**:

- [GeneralGraphView.jsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/frontend/jsx/pages/Graph/GeneralGraphView.jsx) (líneas 358-378)

**Logs de depuración añadidos**:

```javascript
console.log('Node ID:', selectedNode.id, 'Relations found:', nodeRelations.length, 'Total elements:', elements.length);
```

---

### 4. Error 500 al Guardar/Borrar Páginas

**Problema**: Error SQL `no such column: n1_0.categoria` al intentar guardar o borrar páginas.

**Causa**: La tabla `nota_rapida` no tenía las columnas `linea` y `categoria` que el modelo Java esperaba.

**Solución**:

1. Actualizado `V1__Initial_Schema.sql` con las columnas faltantes
2. Añadidas al parche manual en `DatabaseMigration.java`

**Archivos modificados**:

- [V1__Initial_Schema.sql](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/resources/db/migration/V1__Initial_Schema.sql) (líneas 98-111)
- [DatabaseMigration.java](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/java/com/worldbuilding/app/config/DatabaseMigration.java) (línea 87)

**Schema actualizado**:

```sql
CREATE TABLE IF NOT EXISTS nota_rapida (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contenido TEXT NOT NULL,
    linea INTEGER NOT NULL,        -- AÑADIDO
    categoria VARCHAR(255),         -- AÑADIDO
    fecha_creacion TEXT,
    -- ... resto de columnas
);
```

---

## ✨ Nuevas Funcionalidades

### 1. Selector "Todo" en Gestor de Relaciones

**Descripción**: Añadida opción para ver todas las entidades sin filtrar por tipo específico.

**Implementación**:

- Nuevo valor en `ENTITY_TYPES`: `{ value: 'All', label: 'Todo' }`
- Lógica de filtrado: `const filtered = type === 'All' ? all : all.filter(...)`
- Valor por defecto cambiado a `'All'`

**Archivos modificados**:

- [RelationshipManager.jsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/frontend/jsx/components/relationships/RelationshipManager.jsx) (líneas 7-18, 27, 87)

**Beneficio**: Facilita la creación de relaciones al mostrar todas las entidades disponibles.

---

### 2. Sistema de Actualización Automática del Grafo

**Descripción**: Las relaciones creadas/eliminadas ahora se reflejan instantáneamente en "Conexiones Activas" sin refrescar la página.

**Implementación**:

#### Emisión de Eventos (`RelationshipManager.jsx`)

```javascript
// Después de guardar
window.dispatchEvent(new CustomEvent('relationships-update'));

// Después de eliminar
window.dispatchEvent(new CustomEvent('relationships-update'));
```

#### Escucha de Eventos (`GeneralGraphView.jsx`)

```javascript
useEffect(() => {
    const handleRelationshipUpdate = () => {
        console.log('>>> Relationships updated, reloading graph data...');
        loadData();
    };
    
    window.addEventListener('relationships-update', handleRelationshipUpdate);
    
    return () => {
        window.removeEventListener('relationships-update', handleRelationshipUpdate);
    };
}, []);
```

**Archivos modificados**:

- [RelationshipManager.jsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/frontend/jsx/components/relationships/RelationshipManager.jsx) (líneas 125-127, 138-140)
- [GeneralGraphView.jsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/frontend/jsx/pages/Graph/GeneralGraphView.jsx) (líneas 110-120)

**Beneficio**: Mejora significativa en la UX al eliminar la necesidad de refrescar manualmente.

---

## 🔧 Mejoras de UX

### 1. Editor de Escritura Ampliado

**Cambios**:

- Padding horizontal reducido: `px-32` → `px-20`
- Ancho máximo aumentado: `max-w-4xl` → `max-w-5xl`

**Archivo**: [WritingView.jsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/frontend/jsx/pages/Writing/WritingView.jsx)

---

### 2. Guardado Automático al Cambiar de Página

**Descripción**: El contenido se guarda automáticamente al cambiar de página.

**Implementación**: Llamada a `handleSave()` en `handlePageSelect()`.

**Archivo**: [WritingView.jsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/frontend/jsx/pages/Writing/WritingView.jsx)

---

### 3. Leyenda de Atajos de Teclado

**Añadida**: Leyenda visible en el panel derecho "Formato" con atajos de Markdown.

**Archivo**: [WritingView.jsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/frontend/jsx/pages/Writing/WritingView.jsx)

---

### 4. Texto Visible en ZenEditor

**Problema**: Texto blanco sobre fondo claro (invisible).

**Solución**: Cambiado a texto oscuro sobre fondo claro.

**Archivo**: [ZenEditor.jsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/frontend/jsx/components/writing/ZenEditor.jsx)

---

### 5. EntityBuilderSidebar a Ancho Completo

**Cambio**: Sidebar expandido para mejor visualización de atributos.

**Archivo**: [EntityBuilderSidebar.jsx](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/frontend/jsx/components/worldbible/EntityBuilderSidebar.jsx)

---

## 🗄️ Sistema de Migraciones

### Configuración Actual

El proyecto utiliza un sistema de migración personalizado con:

1. **Flyway con `repair()` automático**: Actualiza checksums en cada migración
2. **Parches manuales**: Añaden columnas faltantes antes de Flyway
3. **No requiere eliminación manual de BD**: Todo se gestiona automáticamente

### Archivo Clave

[DatabaseMigration.java](file:///c:/Users/rober/Desktop/Proyectos%20propios/WorldbuildingApp/src/main/java/com/worldbuilding/app/config/DatabaseMigration.java)

**Flujo**:

1. `@PostConstruct` ejecuta migraciones al iniciar
2. `manualPatchMissingColumns()` añade columnas faltantes
3. `flyway.repair()` actualiza checksums
4. `flyway.migrate()` aplica migraciones

---

## 📊 Archivos Modificados (Resumen)

### Frontend (JSX)

1. `FolderItem.jsx` - Eliminado favoritos
2. `WritingView.jsx` - Editor ampliado, guardado automático, modal corregido
3. `GeneralGraphView.jsx` - Relaciones visibles + eventos
4. `RelationshipManager.jsx` - Selector "Todo" + eventos
5. `EntityBuilderSidebar.jsx` - Ancho completo
6. `ZenEditor.jsx` - Texto visible

### Backend (Java)

1. `DatabaseMigration.java` - Parche para `nota_rapida`

### SQL

1. `V1__Initial_Schema.sql` - Columnas `linea` y `categoria`

---

## 🎯 Próximos Pasos Recomendados

1. **Reiniciar el servidor** para aplicar los parches de migración
2. **Probar el guardado/borrado de páginas** para verificar que los errores 500 desaparecieron
3. **Crear relaciones en el grafo** para verificar la actualización automática
4. **Revisar logs de consola** para confirmar que los eventos se emiten correctamente

---

## 📝 Notas Técnicas

### Grafo Sin Relaciones (No es un Bug)

Los logs muestran `Relations found: 0` porque el proyecto actual no tiene relaciones creadas en la base de datos. El código funciona correctamente.

### Sistema de Eventos

El patrón de eventos personalizado (`CustomEvent`) es ligero y eficiente para comunicación entre componentes sin necesidad de un estado global complejo.

---

**Fecha**: 2026-02-07  
**Autor**: Roberto Monedero Alonso  
**Versión**: WorldbuildingApp V2

---

**Fecha**: 2026-02-20  
**Autor**: Antigravity (IA)  
**Versión**: Chronos Atlas V2.1 (Maintenance Build)  

### Notas de la Intervención

Hoy se ha realizado un saneamiento profundo del sistema tras detectar inconsistencias críticas en el flujo de datos del Grafo y regresiones de i18n en el módulo de Escritura.

1. **Saneamiento de BBDD (Flyway V3)**: Se ha restaurado la integridad de la base de datos creando la tabla `nodo`, cuya ausencia provocaba el fallo estructural de la API de Grafo. Se han incluido tablas preventivas para los modelos `Zona`, `Interaccion`, `Construccion`, `Efectos` y `EntidadColectiva`.
2. **Refinamiento de UX de Grafos**: Se ha implementado un sistema de "Zoom y Ajuste" inteligente que centra el grafo automáticamente al cargar, sin destruir las posiciones personalizadas de los nodos guardadas por el usuario.
3. **Localización y Terminología**: Se ha completado la traducción al español de `WritingHub.jsx` y se ha consolidado el término "Archivador" en la UI.
4. **Política Local-First**: Se han desvinculado los CDNs externos en el módulo de Atlas, implementando assets locales para los iconos de Leaflet.

**Estado**: Estable y Sincronizado.
