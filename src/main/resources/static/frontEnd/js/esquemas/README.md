# React Flow Integration - Worldbuilding App

Esta carpeta contiene la integración completa de React Flow para crear diagramas interactivos de elementos del mundo en la aplicación Worldbuilding.

## 📁 Estructura de Archivos

```
js/esquemas/
├── FlowManager.js              # Gestor principal del flujo
├── FlowInterface.js            # Interfaz de usuario
├── FlowInitializer.js          # Inicializador de la aplicación
├── FlowStyles.css              # Estilos CSS
├── nodes/                      # Tipos de nodos personalizados
│   ├── EntidadIndividualNode.js
│   ├── EntidadColectivaNode.js
│   ├── ConstruccionNode.js     # (Pendiente)
│   ├── ZonaNode.js            # (Pendiente)
│   └── EfectoNode.js          # (Pendiente)
├── edges/                      # Tipos de conexiones
│   ├── RelacionLinea.js
│   ├── JerarquiaEdge.js       # (Pendiente)
│   ├── AlianzaEdge.js         # (Pendiente)
│   └── ConflictoEdge.js       # (Pendiente)
└── README.md                   # Esta documentación
```

## 🚀 Características Principales

### ✨ **Nodos Personalizados**
- **Entidades Individuales**: Personajes, NPCs, protagonistas, antagonistas
- **Entidades Colectivas**: Organizaciones, gremios, gobiernos, facciones
- **Construcciones**: Edificios, estructuras, monumentos
- **Zonas**: Regiones, territorios, reinos
- **Efectos**: Magia, eventos, fenómenos

### 🔗 **Conexiones Inteligentes**
- **Relaciones**: Conexiones entre elementos
- **Jerarquías**: Estructuras organizacionales
- **Alianzas**: Acuerdos y cooperaciones
- **Conflictos**: Enemistades y rivalidades

### 🎨 **Interfaz Moderna**
- Barra de herramientas intuitiva
- Modales para edición
- Drag & drop de elementos
- Zoom y navegación
- Exportación de diagramas

## 🔧 Instalación y Uso

### 1. **Inclusión en HTML**

```html
<!-- Incluir los archivos JavaScript en orden -->
<script src="/frontEnd/js/esquemas/FlowManager.js"></script>
<script src="/frontEnd/js/esquemas/nodes/EntidadIndividualNode.js"></script>
<script src="/frontEnd/js/esquemas/nodes/EntidadColectivaNode.js"></script>
<script src="/frontEnd/js/esquemas/edges/RelacionLinea.js"></script>
<script src="/frontEnd/js/esquemas/FlowInterface.js"></script>
<script src="/frontEnd/js/esquemas/FlowInitializer.js"></script>

<!-- Los estilos CSS se cargan automáticamente -->
```

### 2. **Inicialización Automática**

La aplicación se inicializa automáticamente cuando el DOM está listo:

```javascript
// La inicialización es automática, pero puedes acceder a la instancia:
const flowInitializer = window.flowInitializer;
const flowManager = window.flowManager;
const flowInterface = window.flowInterface;
```

### 3. **Uso Básico**

```javascript
// Crear un nuevo personaje
flowInterface.showCreateNodeForm('entidad-individual');

// Editar un nodo existente
flowInterface.showEditNodeForm('node-id');

// Exportar el diagrama
flowInterface.exportFlow();
```

## 📊 Integración con Backend

### **APIs Utilizadas**

| Endpoint | Método | Descripción |
|----------|--------|-------------|
| `/api/proyectos/activo` | GET | Obtener proyecto activo |
| `/api/proyectos/archivo-sql` | GET | Obtener datos del proyecto |
| `/api/bd/insertar` | PUT | Crear nuevo elemento |
| `/api/bd/eliminar` | DELETE | Eliminar elemento |
| `/api/bd/modificar` | PATCH | Modificar elemento |
| `/api/bd/relacionar` | POST | Crear relación |

### **Flujo de Datos**

```
Base de Datos ←→ API Spring Boot ←→ FlowManager ←→ React Flow
```

1. **Carga**: Los datos se cargan desde el archivo SQL del proyecto
2. **Creación**: Los nuevos elementos se guardan en la base de datos
3. **Edición**: Los cambios se sincronizan automáticamente
4. **Relaciones**: Las conexiones se almacenan como relaciones en la BD

## 🎯 Casos de Uso

### **1. Mapa de Personajes**
```javascript
// Crear personaje principal
const gandalf = {
    nombre: 'Gandalf',
    apellidos: 'el Gris',
    tipo: 'Mago',
    descripcion: 'Poderoso mago gris',
    estado: 'Vivo',
    origen: 'Valinor',
    comportamiento: 'Sabio y protector'
};

flowManager.createNode(gandalf);
```

### **2. Organizaciones y Jerarquías**
```javascript
// Crear organización
const compania = {
    nombre: 'La Compañía del Anillo',
    apellidos: 'Los Nueve Caminantes',
    tipo: 'Grupo',
    descripcion: 'Grupo de nueve compañeros',
    estado: 'Activa',
    origen: 'Rivendel',
    comportamiento: 'Unidos en su misión'
};

flowManager.createNode(compania);
```

### **3. Relaciones entre Elementos**
```javascript
// Crear relación entre Gandalf y la Compañía
const relacion = {
    source: 'gandalf-id',
    target: 'compania-id',
    tipo: 'Liderazgo',
    direccion: 'Unidireccional',
    afectados: 'Todos los miembros'
};

flowManager.createEdge(relacion);
```

## 🎨 Personalización

### **Crear Nuevo Tipo de Nodo**

```javascript
class MiNodoPersonalizado {
    constructor() {
        this.type = 'mi-nodo';
        this.defaultData = {
            nombre: '',
            tipo: 'Mi Tipo',
            // ... otros campos
        };
    }

    render(node) {
        return `
            <div class="flow-node mi-nodo-node">
                <!-- HTML personalizado -->
            </div>
        `;
    }

    validateData(data) {
        // Validación personalizada
    }

    formatDataForBackend(data) {
        // Formato para backend
    }
}

// Registrar el nuevo tipo
window.MiNodoPersonalizado = MiNodoPersonalizado;
```

### **Personalizar Estilos**

```css
/* Estilos para nodo personalizado */
.mi-nodo-node .node-header {
    background: linear-gradient(135deg, #tu-color1, #tu-color2);
}

.mi-nodo-node .node-content {
    /* Estilos del contenido */
}
```

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + N` | Crear nuevo nodo |
| `Ctrl + S` | Guardar estado |
| `Ctrl + E` | Exportar diagrama |
| `Delete` | Eliminar seleccionado |
| `ESC` | Cerrar modal |

## 🔄 Estados y Validación

### **Estados de Nodos**

- **Entidades Individuales**: Vivo, Muerto, Desaparecido, Herido, Enfermo
- **Entidades Colectivas**: Activa, Inactiva, Disuelta, En guerra, En paz, Secretamente activa

### **Validación de Datos**

Cada tipo de nodo incluye validación automática:

```javascript
// Ejemplo de validación
validateData(data) {
    const errors = [];
    
    if (!data.nombre || data.nombre.trim() === '') {
        errors.push('El nombre es obligatorio');
    }
    
    return errors;
}
```

## 📱 Responsive Design

La interfaz es completamente responsive:

- **Desktop**: Barra de herramientas completa
- **Tablet**: Botones reorganizados
- **Mobile**: Interfaz adaptada para touch

## 🚨 Modo de Simulación

Si React Flow no está disponible, la aplicación funciona en modo de simulación:

- Nodos estáticos con funcionalidad básica
- Formularios de edición funcionales
- Exportación de datos
- Interfaz visual similar

## 🔧 Configuración Avanzada

### **Opciones de Inicialización**

```javascript
const config = {
    autoLoad: true,           // Carga automática de datos
    enableSimulation: true,   // Habilitar modo simulación
    defaultZoom: 1,          // Zoom inicial
    minZoom: 0.1,           // Zoom mínimo
    maxZoom: 2              // Zoom máximo
};

window.flowInitializer = new FlowInitializer(config);
```

### **Eventos Personalizados**

```javascript
// Escuchar cambios en el flujo
document.addEventListener('flowDataUpdate', (event) => {
    const { nodes, edges } = event.detail;
    console.log('Flujo actualizado:', nodes.length, 'nodos,', edges.length, 'conexiones');
});

// Escuchar cambios de proyecto
document.addEventListener('projectChanged', () => {
    console.log('Proyecto cambiado');
});
```

## 🐛 Solución de Problemas

### **Problemas Comunes**

1. **React Flow no se carga**
   - Verificar conexión a internet
   - Revisar consola para errores de CDN
   - El modo simulación se activará automáticamente

2. **Datos no se cargan**
   - Verificar que hay un proyecto activo
   - Revisar las APIs del backend
   - Comprobar la sesión del usuario

3. **Nodos no se renderizan**
   - Verificar que los tipos de nodo están registrados
   - Revisar la consola para errores JavaScript
   - Comprobar que los datos tienen el formato correcto

### **Debugging**

```javascript
// Habilitar modo debug
window.flowManager.debug = true;

// Ver estado actual
console.log('Nodos:', flowManager.getNodes());
console.log('Conexiones:', flowManager.getEdges());
console.log('Proyecto activo:', flowManager.projectActive);
```

## 📈 Próximas Mejoras

- [ ] Nodos para Construcciones, Zonas y Efectos
- [ ] Conexiones Jerarquía, Alianza y Conflicto
- [ ] Filtros y búsqueda de elementos
- [ ] Temas visuales personalizables
- [ ] Colaboración en tiempo real
- [ ] Historial de cambios
- [ ] Importación de diagramas externos

## 🤝 Contribución

Para contribuir al desarrollo:

1. Crear nuevos tipos de nodos en `nodes/`
2. Implementar conexiones personalizadas en `edges/`
3. Mejorar estilos en `FlowStyles.css`
4. Documentar nuevas funcionalidades

## 📄 Licencia

Este código es parte del proyecto Worldbuilding App y sigue las mismas licencias del proyecto principal.
