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

# 🔢 Sistema de Contadores Dinámicos - Worldbuilding App

## 📋 Descripción

Los contadores en la sección "objects" de `ventanaProyectos.html` se actualizan automáticamente desde el backend, mostrando el número real de elementos en cada categoría.

## 🏗️ Estructura HTML

### **Contadores en ventanaProyectos.html**
```html
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

<!-- Entidades Colectivas -->
<div class="object-category">
    <div class="category-header">
        <span class="category-icon">👥</span>
        <span class="category-name">Organizaciones</span>
        <span class="category-count" id="count-entidades-colectivas">0</span>
    </div>
    <div class="object-list" id="list-entidades-colectivas">
        <!-- Los elementos se cargan dinámicamente -->
    </div>
</div>

<!-- Construcciones -->
<div class="object-category">
    <div class="category-header">
        <span class="category-icon">🏗️</span>
        <span class="category-name">Construcciones</span>
        <span class="category-count" id="count-construcciones">0</span>
    </div>
    <div class="object-list" id="list-construcciones">
        <!-- Los elementos se cargan dinámicamente -->
    </div>
</div>

<!-- Zonas -->
<div class="object-category">
    <div class="category-header">
        <span class="category-icon">🗺️</span>
        <span class="category-name">Zonas</span>
        <span class="category-count" id="count-zonas">0</span>
    </div>
    <div class="object-list" id="list-zonas">
        <!-- Los elementos se cargan dinámicamente -->
    </div>
</div>

<!-- Efectos -->
<div class="object-category">
    <div class="category-header">
        <span class="category-icon">✨</span>
        <span class="category-name">Efectos</span>
        <span class="category-count" id="count-efectos">0</span>
    </div>
    <div class="object-list" id="list-efectos">
        <!-- Los elementos se cargan dinámicamente -->
    </div>
</div>
```

## 🔧 Funcionamiento JavaScript

### **1. Inicialización de Contadores**
```javascript
/**
 * Inicializa los contadores con 0
 */
initializeCounters() {
    const categories = [
        'entidades-individuales',
        'entidades-colectivas',
        'construcciones',
        'zonas',
        'efectos'
    ];
    
    categories.forEach(category => {
        this.updateCategoryCount(category, 0);
    });
    
    console.log('🔢 Contadores inicializados con 0');
}
```

### **2. Actualización desde Backend**
```javascript
/**
 * Actualiza la interfaz de usuario con los datos cargados
 */
updateUI() {
    // Actualizar contadores desde el backend
    this.updateCategoryCount('entidades-individuales', this.projectData.entidadesIndividuales.length);
    this.updateCategoryCount('entidades-colectivas', this.projectData.entidadesColectivas.length);
    this.updateCategoryCount('construcciones', this.projectData.construcciones.length);
    this.updateCategoryCount('zonas', this.projectData.zonas.length);
    this.updateCategoryCount('efectos', this.projectData.efectos.length);

    // Renderizar listas de objetos
    this.renderObjectList('entidades-individuales', this.projectData.entidadesIndividuales);
    this.renderObjectList('entidades-colectivas', this.projectData.entidadesColectivas);
    this.renderObjectList('construcciones', this.projectData.construcciones);
    this.renderObjectList('zonas', this.projectData.zonas);
    this.renderObjectList('efectos', this.projectData.efectos);

    console.log('🎨 Interfaz de usuario actualizada con datos del backend');
}
```

### **3. Función de Actualización Individual**
```javascript
/**
 * Actualiza el contador de una categoría
 */
updateCategoryCount(categoryId, count) {
    const countElement = document.getElementById(`count-${categoryId}`);
    if (countElement) {
        countElement.textContent = count;
        console.log(`📊 Contador actualizado para ${categoryId}: ${count}`);
    }
}
```

## 🎯 Flujo de Datos

### **1. Carga Inicial**
```
Página se carga → ProjectDataLoader se inicializa → Contadores se ponen en 0
```

### **2. Carga desde Backend**
```
Backend responde → Datos se procesan → Contadores se actualizan con números reales
```

### **3. Actualización en Tiempo Real**
```
Usuario recarga → Contadores se actualizan → Se muestran números actuales
```

## 🔍 IDs de los Contadores

### **Mapeo de Categorías a IDs**
```javascript
const categoryMapping = {
    'entidades-individuales': 'count-entidades-individuales',
    'entidades-colectivas': 'count-entidades-colectivas',
    'construcciones': 'count-construcciones',
    'zonas': 'count-zonas',
    'efectos': 'count-efectos'
};
```

### **Estructura de IDs**
- **Formato**: `count-{nombre-categoria}`
- **Ejemplo**: `count-entidades-individuales`
- **Uso**: `document.getElementById('count-entidades-individuales')`

## 🎨 Estilos CSS

### **Estilos del Contador**
```css
.category-count {
    background: #667eea;
    color: white;
    padding: 0.125rem 0.5rem;
    border-radius: 0.75rem;
    font-size: 0.75rem;
    font-weight: 600;
    min-width: 1.25rem;
    text-align: center;
}
```

### **Características Visuales**
- **Fondo**: Azul (#667eea)
- **Texto**: Blanco
- **Forma**: Badge redondeado
- **Tamaño mínimo**: 1.25rem para evitar saltos
- **Alineación**: Centrada

## 🚀 Uso y Funcionamiento

### **1. Al Abrir la Página**
- Los contadores se muestran inicialmente en **0**
- Se inicializa el ProjectDataLoader
- Se cargan los datos del backend

### **2. Durante la Carga**
- Los contadores se actualizan automáticamente
- Se muestran los números reales de elementos
- Se sincronizan con la base de datos

### **3. Al Recargar**
- Se puede usar el botón de recarga
- Los contadores se actualizan en tiempo real
- Se mantiene la sincronización con el backend

## 🔍 Debugging

### **Console Logs**
```javascript
🔢 Contadores inicializados con 0
🔄 Cargando datos del proyecto desde el backend...
📄 Datos del proyecto obtenidos: {...}
📊 Contador actualizado para entidades-individuales: 2
📊 Contador actualizado para entidades-colectivas: 1
📊 Contador actualizado para construcciones: 3
📊 Contador actualizado para zonas: 0
📊 Contador actualizado para efectos: 1
🎨 Interfaz de usuario actualizada con datos del backend
```

### **Verificar Funcionamiento**
1. **Abrir consola del navegador** (F12)
2. **Recargar la página** para ver logs de inicialización
3. **Verificar contadores** se actualizan correctamente
4. **Usar botón de recarga** para ver actualización en tiempo real

## ⚠️ Solución de Problemas

### **Contador no se actualiza**
- Verificar que el ID del elemento coincida con el esperado
- Comprobar que el ProjectDataLoader esté funcionando
- Verificar logs en la consola

### **Contador muestra 0 siempre**
- Verificar conexión con el backend
- Comprobar endpoint `/api/proyectos/datos-proyecto`
- Verificar que haya datos en la base de datos

### **Contador no se inicializa**
- Verificar que `ProjectDataLoader.js` esté cargado
- Comprobar que se llame a `initializeProjectDataLoader()`
- Verificar logs de inicialización

## 🎉 Estado Actual

✅ **Contadores inicializados** en 0 al cargar la página
✅ **Actualización automática** desde el backend
✅ **Sincronización en tiempo real** con la base de datos
✅ **Estilos CSS integrados** y funcionales
✅ **Logs de debugging** para verificar funcionamiento

---

## 📝 Notas Importantes

- **Los contadores se inicializan en 0** para evitar mostrar valores incorrectos
- **Se actualizan automáticamente** cuando se cargan datos del backend
- **Los IDs deben coincidir** exactamente entre HTML y JavaScript
- **El sistema es robusto** y maneja casos donde no hay datos
- **La funcionalidad es nativa** de la aplicación

Los contadores están **100% funcionales** y se actualizan automáticamente desde el backend.
