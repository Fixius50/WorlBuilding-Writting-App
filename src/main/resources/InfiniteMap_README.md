# Mapa Infinito - Worldbuilding App

## 🗺️ Descripción

El `InfiniteMap.js` es un componente de mapa infinito con líneas horizontales y verticales que permite navegar por un espacio 2D ilimitado. Está diseñado específicamente para la ventana de proyectos de Worldbuilding App.

## ✨ Características

### **🎯 Navegación Infinita**
- **Pan**: Arrastrar con el mouse para mover la vista
- **Zoom**: Rueda del mouse para acercar/alejar
- **Teclado**: Flechas para navegar, +/- para zoom
- **Touch**: Soporte para dispositivos móviles

### **📐 Cuadrícula Inteligente**
- Líneas horizontales y verticales configurables
- Coordenadas automáticas en los ejes
- Tamaño de cuadrícula personalizable
- Opacidad y colores configurables

### **📍 Marcadores**
- Agregar marcadores en posiciones específicas
- Colores y tamaños personalizables
- Etiquetas de texto
- Gestión completa (agregar, eliminar, limpiar)

### **📱 Responsive**
- Funciona en desktop, tablet y mobile
- Alta resolución (HiDPI) automática
- Adaptación automática al tamaño de pantalla

## 🔧 Instalación

### **1. Incluir el Script**

```html
<script src="../js/esquemas/InfiniteMap.js"></script>
```

### **2. Crear Contenedor**

```html
<div id="infinite-map-container" class="map-area">
    <!-- El mapa se cargará aquí -->
</div>
```

### **3. Inicializar**

```javascript
const infiniteMap = new InfiniteMap('infinite-map-container', {
    gridSize: 50,
    gridColor: '#e0e0e0',
    gridOpacity: 0.3,
    backgroundColor: '#f8f9fa',
    zoomLevel: 1,
    minZoom: 0.1,
    maxZoom: 5,
    showCoordinates: true
});
```

## ⚙️ Configuración

### **Opciones Disponibles**

| Opción | Tipo | Default | Descripción |
|--------|------|---------|-------------|
| `gridSize` | number | 50 | Tamaño de la cuadrícula en píxeles |
| `gridColor` | string | '#e0e0e0' | Color de las líneas de la cuadrícula |
| `gridOpacity` | number | 0.3 | Opacidad de la cuadrícula (0-1) |
| `backgroundColor` | string | '#f8f9fa' | Color de fondo del mapa |
| `zoomLevel` | number | 1 | Nivel de zoom inicial |
| `minZoom` | number | 0.1 | Zoom mínimo permitido |
| `maxZoom` | number | 5 | Zoom máximo permitido |
| `panSpeed` | number | 1 | Velocidad de movimiento |
| `showCoordinates` | boolean | true | Mostrar coordenadas en los ejes |
| `coordinateColor` | string | '#666' | Color de las coordenadas |

### **Ejemplo de Configuración Completa**

```javascript
const mapConfig = {
    gridSize: 100,              // Cuadrícula más grande
    gridColor: '#cccccc',       // Gris más oscuro
    gridOpacity: 0.5,           // Más visible
    backgroundColor: '#ffffff', // Fondo blanco
    zoomLevel: 0.5,            // Zoom inicial más alejado
    minZoom: 0.05,             // Zoom mínimo más alejado
    maxZoom: 10,               // Zoom máximo más cercano
    panSpeed: 1.5,             // Movimiento más rápido
    showCoordinates: true,     // Mostrar coordenadas
    coordinateColor: '#333333' // Coordenadas más oscuras
};

const infiniteMap = new InfiniteMap('container-id', mapConfig);
```

## 🎮 Controles

### **Mouse**
- **Arrastrar**: Mover la vista del mapa
- **Rueda**: Zoom in/out hacia la posición del mouse
- **Click**: Seleccionar elementos (futuro)

### **Teclado**
- **Flechas**: Mover la vista (50px por pulsación)
- **+ / =**: Zoom in
- **-**: Zoom out
- **0**: Resetear vista al origen

### **Touch (Móviles)**
- **Deslizar**: Mover la vista
- **Pinch**: Zoom in/out (futuro)

## 📍 API de Marcadores

### **Agregar Marcador**

```javascript
const marker = infiniteMap.addMarker(x, y, {
    color: '#ff0000',      // Color del marcador
    size: 15,              // Tamaño en píxeles
    label: 'Mi Marcador',  // Etiqueta de texto
    data: {                // Datos personalizados
        id: 1,
        type: 'ciudad'
    }
});
```

### **Eliminar Marcador**

```javascript
infiniteMap.removeMarker(marker);
```

### **Limpiar Todos los Marcadores**

```javascript
infiniteMap.clearMarkers();
```

### **Ejemplo Completo de Marcadores**

```javascript
// Agregar marcadores de ejemplo
infiniteMap.addMarker(100, 100, {
    color: '#ff0000',
    size: 15,
    label: 'Ciudad Capital'
});

infiniteMap.addMarker(-150, 200, {
    color: '#00ff00',
    size: 12,
    label: 'Bosque Mágico'
});

infiniteMap.addMarker(300, -100, {
    color: '#0000ff',
    size: 10,
    label: 'Montaña Sagrada'
});
```

## 🎯 Métodos Principales

### **Navegación**

```javascript
// Resetear vista al origen
infiniteMap.resetView();

// Centrar en un punto específico
infiniteMap.centerOn(x, y);

// Zoom in/out
infiniteMap.zoomIn();
infiniteMap.zoomOut();
```

### **Coordenadas**

```javascript
// Obtener coordenadas del mundo en posición del mouse
const worldCoords = infiniteMap.getWorldCoordinates(mouseX, mouseY);

// Obtener coordenadas de pantalla de posición del mundo
const screenCoords = infiniteMap.getScreenCoordinates(worldX, worldY);
```

### **Estado**

```javascript
// Obtener estado actual
const state = infiniteMap.getState();

// Restaurar estado
infiniteMap.setState(state);
```

### **Destrucción**

```javascript
// Limpiar recursos
infiniteMap.destroy();
```

## 🎨 Personalización Visual

### **Estilos CSS**

```css
/* Contenedor del mapa */
.map-container {
    width: 100%;
    height: 100%;
    border-radius: 8px;
    overflow: hidden;
}

/* Área del mapa */
.map-area {
    flex: 1;
    position: relative;
    min-height: 400px;
}

/* Canvas del mapa */
#infinite-map-canvas {
    width: 100% !important;
    height: 100% !important;
    border: none !important;
}
```

### **Temas Personalizados**

```javascript
// Tema oscuro
const darkTheme = {
    backgroundColor: '#1a1a1a',
    gridColor: '#333333',
    coordinateColor: '#ffffff'
};

// Tema de fantasía
const fantasyTheme = {
    backgroundColor: '#f0f8ff',
    gridColor: '#8b4513',
    coordinateColor: '#654321'
};
```

## 🔄 Integración con Backend

### **Cargar Marcadores desde Base de Datos**

```javascript
async function loadMarkersFromDatabase() {
    try {
        const response = await fetch('/api/proyectos/archivo-sql');
        const sqlContent = await response.text();
        
        // Parsear SQL y extraer posiciones
        const markers = parseSQLToMarkers(sqlContent);
        
        // Agregar marcadores al mapa
        markers.forEach(marker => {
            infiniteMap.addMarker(marker.x, marker.y, marker.options);
        });
    } catch (error) {
        console.error('Error cargando marcadores:', error);
    }
}
```

### **Guardar Posiciones**

```javascript
async function saveMarkerPosition(marker) {
    try {
        const response = await fetch('/api/bd/insertar', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                nombre: marker.label,
                tipo: 'Marcador',
                posicionX: marker.x,
                posicionY: marker.y,
                color: marker.color
            })
        });
        
        if (response.ok) {
            console.log('Marcador guardado');
        }
    } catch (error) {
        console.error('Error guardando marcador:', error);
    }
}
```

## 🐛 Solución de Problemas

### **Problemas Comunes**

1. **El mapa no se muestra**
   - Verificar que el contenedor existe
   - Comprobar que el script se cargó correctamente
   - Revisar la consola para errores

2. **El zoom no funciona**
   - Verificar que el canvas tiene el foco
   - Comprobar que los límites de zoom son correctos
   - Revisar eventos del mouse

3. **Los marcadores no aparecen**
   - Verificar que se llamó `addMarker()`
   - Comprobar que las coordenadas son números válidos
   - Revisar que `render()` se ejecuta después de agregar marcadores

### **Debugging**

```javascript
// Habilitar modo debug
infiniteMap.debug = true;

// Ver estado actual
console.log('Estado del mapa:', infiniteMap.getState());
console.log('Marcadores:', infiniteMap.markers);
console.log('Configuración:', infiniteMap.config);
```

## 📈 Próximas Mejoras

- [ ] **Capas**: Múltiples capas de elementos
- [ ] **Imágenes**: Cargar imágenes como marcadores
- [ ] **Líneas**: Conectar marcadores con líneas
- [ ] **Áreas**: Dibujar áreas y polígonos
- [ ] **Exportación**: Exportar mapa como imagen
- [ ] **Colaboración**: Marcadores en tiempo real
- [ ] **Historial**: Deshacer/rehacer cambios
- [ ] **Búsqueda**: Buscar marcadores por nombre

## 🤝 Contribución

Para contribuir al desarrollo del mapa infinito:

1. Crear nuevas funcionalidades en archivos separados
2. Mantener compatibilidad con la API existente
3. Documentar nuevas características
4. Probar en diferentes dispositivos y navegadores

## 📄 Licencia

Este código es parte del proyecto Worldbuilding App y sigue las mismas licencias del proyecto principal.
