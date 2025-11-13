# ProjectDataLoader - Cargador de Datos del Proyecto

## 📦 Descripción

El `ProjectDataLoader.js` es un componente que carga automáticamente las entidades del proyecto desde la base de datos y las muestra en la interfaz como elementos arrastrables que se pueden colocar en el mapa infinito.

## ✨ Características

### **🔄 Carga Automática de Datos**
- Lee el archivo SQL del proyecto activo
- Parsea las sentencias INSERT para extraer entidades
- Actualiza la interfaz en tiempo real
- Maneja errores de carga graciosamente

### **📋 Categorías Soportadas**
- **👤 Personajes** (Entidades Individuales)
- **🏛️ Organizaciones** (Entidades Colectivas)
- **🏰 Construcciones**
- **🗺️ Zonas**
- **✨ Efectos**

### **🎯 Drag & Drop Inteligente**
- Elementos arrastrables desde la lista
- Drop automático en el mapa
- Conversión de coordenadas de pantalla a mundo
- Marcadores con colores por categoría

### **📊 Contadores Dinámicos**
- Muestra el número de elementos por categoría
- Actualización automática al recargar
- Indicador visual cuando no hay elementos

## 🔧 Instalación

### **1. Incluir el Script**

```html
<script src="../js/esquemas/ProjectDataLoader.js"></script>
```

### **2. Inicializar**

```javascript
const projectDataLoader = new ProjectDataLoader();
projectDataLoader.loadProjectData();
```

### **3. Integrar con el Mapa**

```javascript
// El ProjectDataLoader se integra automáticamente con InfiniteMap
// Los elementos arrastrados se convierten en marcadores
```

## 📊 Estructura de Datos

### **Entidades Individuales**
```javascript
{
    id: "1",
    nombre: "Gandalf",
    apellidos: "el Gris",
    tipo: "Mago",
    descripcion: "Un poderoso mago...",
    estado: "Vivo",
    origen: "Valinor",
    comportamiento: "Sabio"
}
```

### **Entidades Colectivas**
```javascript
{
    id: "2",
    nombre: "La Compañía del Anillo",
    apellidos: "",
    tipo: "Grupo",
    descripcion: "Un grupo de héroes...",
    estado: "Activo",
    origen: "Rivendel",
    comportamiento: "Cooperativo"
}
```

### **Construcciones**
```javascript
{
    id: "3",
    nombre: "Minas Tirith",
    apellidos: "",
    tipo: "Ciudad",
    descripcion: "La ciudad capital...",
    tamanno: "Grande",
    desarrollo: "Completo"
}
```

### **Zonas**
```javascript
{
    id: "4",
    nombre: "Bosque Negro",
    apellidos: "",
    tipo: "Bosque",
    descripcion: "Un bosque oscuro...",
    tamanno: "Enorme",
    desarrollo: "Natural"
}
```

### **Efectos**
```javascript
{
    id: "5",
    nombre: "El Anillo Único",
    apellidos: "",
    tipo: "Artefacto",
    descripcion: "Un anillo poderoso...",
    origen: "Mordor",
    dureza: "Indestructible",
    comportamiento: "Corruptor"
}
```

## 🎨 Colores por Categoría

| Categoría | Color | Icono |
|-----------|-------|-------|
| Personajes | `#667eea` | 👤 |
| Organizaciones | `#f093fb` | 🏛️ |
| Construcciones | `#4facfe` | 🏰 |
| Zonas | `#43e97b` | 🗺️ |
| Efectos | `#fa709a` | ✨ |

## 🔄 API de Métodos

### **Carga de Datos**

```javascript
// Cargar datos del proyecto
await projectDataLoader.loadProjectData();

// Recargar datos
await projectDataLoader.reload();

// Obtener datos actuales
const data = projectDataLoader.getProjectData();
```

### **Gestión de UI**

```javascript
// Actualizar interfaz
projectDataLoader.updateUI();

// Actualizar contador de categoría
projectDataLoader.updateCategoryCount('entidades-individuales', 5);

// Renderizar lista de objetos
projectDataLoader.renderObjectList('entidades-individuales', objects);
```

### **Drag & Drop**

```javascript
// Agregar marcador al mapa
projectDataLoader.addMarkerToMap(object, x, y);

// Obtener categoría de objeto
const category = projectDataLoader.getCategoryFromObject(object);
```

## 📝 Parsing SQL

### **Sentencias Soportadas**

El parser reconoce sentencias INSERT como:

```sql
INSERT INTO entidades_individuales (id, nombre, apellidos, tipo, descripcion, estado, origen, comportamiento) 
VALUES ('1', 'Gandalf', 'el Gris', 'Mago', 'Un poderoso mago...', 'Vivo', 'Valinor', 'Sabio');
```

### **Campos Extraídos**

- **Campos básicos**: id, nombre, apellidos, tipo, descripcion
- **Campos específicos**: estado, origen, comportamiento, tamanno, desarrollo, dureza

### **Manejo de Errores**

- Valores faltantes se reemplazan con strings vacíos
- IDs duplicados se generan automáticamente
- Errores de parsing se muestran en consola

## 🎯 Integración con Mapa

### **Flujo de Drag & Drop**

1. **Drag Start**: Elemento se marca como arrastrando
2. **Drag Over**: Mapa acepta el drop
3. **Drop**: Coordenadas se convierten y se agrega marcador
4. **Marcador**: Se crea con color y datos del objeto

### **Conversión de Coordenadas**

```javascript
// Coordenadas de pantalla a mundo
const worldCoords = infiniteMap.getWorldCoordinates(screenX, screenY);

// Agregar marcador
infiniteMap.addMarker(worldCoords.x, worldCoords.y, {
    color: color,
    size: 12,
    label: object.nombre,
    data: object
});
```

## 🔧 Configuración

### **Personalización de Colores**

```javascript
// Modificar colores de categorías
const colors = {
    'entidades-individuales': '#ff6b6b',
    'entidades-colectivas': '#4ecdc4',
    // ... más colores
};
```

### **Personalización de Iconos**

```javascript
// Modificar iconos de categorías
const icons = {
    'entidades-individuales': '🧙‍♂️',
    'entidades-colectivas': '⚔️',
    // ... más iconos
};
```

## 🐛 Solución de Problemas

### **Problemas Comunes**

1. **No se cargan datos**
   - Verificar que hay un proyecto activo
   - Comprobar que el archivo SQL existe
   - Revisar la consola para errores

2. **Drag & Drop no funciona**
   - Verificar que el mapa está inicializado
   - Comprobar que los elementos tienen `draggable="true"`
   - Revisar que el contenedor del mapa existe

3. **Marcadores no aparecen**
   - Verificar que `infiniteMap` está disponible globalmente
   - Comprobar que las coordenadas son válidas
   - Revisar que `addMarker` se ejecuta correctamente

### **Debugging**

```javascript
// Habilitar logs detallados
console.log('Datos del proyecto:', projectDataLoader.getProjectData());
console.log('Elemento arrastrado:', projectDataLoader.draggedElement);
console.log('Coordenadas del drop:', worldCoords);
```

## 📈 Próximas Mejoras

- [ ] **Filtros**: Filtrar elementos por tipo o nombre
- [ ] **Búsqueda**: Buscar elementos en tiempo real
- [ ] **Edición**: Editar elementos directamente desde la lista
- [ ] **Agrupación**: Agrupar elementos por criterios
- [ ] **Exportación**: Exportar lista de elementos
- [ ] **Sincronización**: Sincronización en tiempo real
- [ ] **Historial**: Historial de cambios
- [ ] **Backup**: Backup automático de posiciones

## 🤝 Contribución

Para contribuir al desarrollo del ProjectDataLoader:

1. Mantener compatibilidad con la API existente
2. Documentar nuevas características
3. Probar con diferentes tipos de datos SQL
4. Seguir las convenciones de código existentes

## 📄 Licencia

Este código es parte del proyecto Worldbuilding App y sigue las mismas licencias del proyecto principal.
