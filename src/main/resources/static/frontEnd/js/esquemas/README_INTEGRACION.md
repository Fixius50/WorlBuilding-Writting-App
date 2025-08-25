# 🚀 Sistema de Drag & Drop Integrado en ventanaProyectos.html

## 📋 Descripción

El sistema de drag & drop está **completamente integrado** en `ventanaProyectos.html` en la sección de "objects" (objetos). No hay archivos de prueba separados - todo funciona directamente en la ventana principal.

## 🏗️ Estructura Integrada

### **1. HTML en ventanaProyectos.html**
```html
<section class="objects">
    <button class="reload-btn" onclick="reloadProjectData()" title="Recargar datos">
        <i class="fas fa-sync-alt"></i>
    </button>
    <div class="objects-container">
        <!-- Entidades Individuales -->
        <div class="object-category">
            <div class="category-header">
                <span class="category-icon">👤</span>
                <span class="category-name">Personajes</span>
                <span class="category-count" id="count-entidades-individuales">0</span>
            </div>
            <div class="object-list" id="list-entidades-individuales">
                <!-- Los elementos se cargan dinámicamente -->
            </div>
        </div>
        
        <!-- Más categorías... -->
    </div>
</section>
```

### **2. Scripts Importados**
```html
<!-- Scripts necesarios para el mapa infinito y la carga de datos del proyecto -->
<script src="../js/esquemas/InfiniteMap.js"></script>
<script src="../js/esquemas/ProjectDataLoader.js"></script>
```

### **3. Inicialización Automática**
```javascript
document.addEventListener('DOMContentLoaded', () => {
    // ... código del proyecto ...
    
    // Inicializar el mapa infinito
    initializeInfiniteMap();
    
    // Inicializar el cargador de datos del proyecto
    initializeProjectDataLoader();
});
```

## 🎯 Funcionalidades Integradas

### **Contadores Dinámicos**
- ✅ Se actualizan automáticamente desde `/api/proyectos/datos-proyecto`
- ✅ Muestran el número real de elementos en cada categoría
- ✅ Se sincronizan en tiempo real con la base de datos

### **Elementos Arrastrables**
- ✅ **Personajes** (👤) - Entidades individuales
- ✅ **Organizaciones** (👥) - Entidades colectivas  
- ✅ **Construcciones** (🏗️) - Edificios y estructuras
- ✅ **Zonas** (🗺️) - Regiones y territorios
- ✅ **Efectos** (✨) - Magia y poderes

### **Destinos de Drop**
- ✅ **Mapa Infinito**: Crea marcadores con datos del backend
- ✅ **React Flow**: Crea nodos expandibles (cuando esté disponible)

## 🔧 Cómo Funciona

### **1. Carga de Datos**
```javascript
function initializeProjectDataLoader() {
    projectDataLoader = new ProjectDataLoader();
    
    // Cargar datos del proyecto después de un breve delay
    setTimeout(() => {
        projectDataLoader.loadProjectData();
    }, 500);
    
    console.log('📦 Cargador de datos del proyecto inicializado');
}
```

### **2. Actualización de UI**
```javascript
updateUI() {
    // Actualizar contadores desde el backend
    this.updateCategoryCount('entidades-individuales', this.projectData.entidadesIndividuales.length);
    // ... más contadores ...
    
    // Renderizar listas de objetos
    this.renderObjectList('entidades-individuales', this.projectData.entidadesIndividuales);
    // ... más listas ...
}
```

### **3. Drag & Drop**
```javascript
handleDrop(event) {
    // Determinar si es drop en mapa o React Flow
    if (mapContainer) {
        this.handleMapDrop(event, data);
    } else if (flowContainer) {
        this.handleFlowDrop(event, data);
    }
}
```

## 🎨 Estilos Integrados

### **CSS en ventanaProyectos.css**
- ✅ Estilos para elementos arrastrables
- ✅ Efectos hover y transiciones
- ✅ Diseño responsive con unidades `rem`
- ✅ Indicadores visuales de arrastre
- ✅ Scrollbars personalizados

### **Características Visuales**
- **Iconos únicos** para cada categoría
- **Colores distintivos** por tipo de elemento
- **Contadores en badges** azules
- **Indicadores de arrastre** con flechas
- **Efectos de hover** con elevación

## 🚀 Uso Directo

### **1. Abrir ventanaProyectos.html**
- Los datos se cargan automáticamente
- Los contadores se actualizan desde el backend
- Los elementos son arrastrables inmediatamente

### **2. Arrastrar Elementos**
- Hacer click y arrastrar desde cualquier grupo
- Soltar en el mapa o área de React Flow
- Los nodos/marcadores se crean automáticamente

### **3. Ver Contadores**
- Se actualizan automáticamente
- Muestran el número real de elementos
- Se sincronizan con la base de datos

## 🔍 Debugging

### **Console Logs**
```javascript
🔄 Cargando datos del proyecto desde el backend...
📄 Datos del proyecto obtenidos: {...}
📊 Contador actualizado para entidades-individuales: 2
🎯 Lista renderizada para entidades-individuales: 2 elementos
🚀 Iniciando drag: Gandalf tipo: entidades-individuales
📥 Drop recibido: {...}
🎯 Nodo creado en React Flow: {...}
```

### **Verificar Funcionamiento**
1. **Abrir consola del navegador** (F12)
2. **Recargar la página** para ver logs de inicialización
3. **Arrastrar elementos** para ver logs de drag & drop
4. **Verificar contadores** se actualizan correctamente

## ⚠️ Solución de Problemas

### **"No hay proyecto activo"**
- Verificar que haya un proyecto abierto en la sesión
- Comprobar endpoint `/api/proyectos/activo`

### **"Error obteniendo datos"**
- Verificar conexión con el backend
- Comprobar endpoint `/api/proyectos/datos-proyecto`

### **Elementos no arrastrables**
- Verificar que `ProjectDataLoader.js` esté cargado
- Comprobar que los datos se hayan cargado correctamente

## 🎉 Estado Actual

✅ **Sistema completamente integrado** en `ventanaProyectos.html`
✅ **Contadores dinámicos** desde el backend
✅ **Elementos arrastrables** por categoría
✅ **Drop en mapa infinito** funcional
✅ **Estilos CSS** integrados y funcionales
✅ **Inicialización automática** al cargar la página

---

## 📝 Notas Importantes

- **No hay archivos de prueba separados** - todo está en la ventana principal
- **Los datos se cargan automáticamente** al abrir la página
- **El drag & drop funciona inmediatamente** sin configuración adicional
- **Los estilos están integrados** en el CSS principal
- **La funcionalidad es nativa** de la aplicación

El sistema está **100% funcional** y **completamente integrado** en `ventanaProyectos.html`.
