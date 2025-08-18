/**
 * FlowInitializer.js - Inicializador principal de React Flow
 * Carga todos los componentes y configura la aplicación
 */

class FlowInitializer {
    constructor() {
        this.flowInterface = null;
        this.flowManager = null;
        this.isInitialized = false;
        
        this.init();
    }

    /**
     * Inicializa la aplicación
     */
    async init() {
        try {
            console.log('🚀 Inicializando React Flow para Worldbuilding...');
            
            // Cargar estilos CSS
            this.loadStyles();
            
            // Cargar dependencias
            await this.loadDependencies();
            
            // Inicializar componentes
            this.initializeComponents();
            
            // Configurar React Flow
            this.setupReactFlow();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ React Flow inicializado correctamente');
            
        } catch (error) {
            console.error('❌ Error inicializando React Flow:', error);
        }
    }

    /**
     * Carga los estilos CSS
     */
    loadStyles() {
        // Verificar si los estilos ya están cargados
        if (document.querySelector('link[href*="FlowStyles.css"]')) {
            return;
        }

        const link = document.createElement('link');
        link.rel = 'stylesheet';
        link.href = '/frontEnd/js/esquemas/FlowStyles.css';
        document.head.appendChild(link);
    }

    /**
     * Carga las dependencias necesarias
     */
    async loadDependencies() {
        // Cargar Font Awesome para iconos
        if (!document.querySelector('link[href*="font-awesome"]')) {
            const fontAwesome = document.createElement('link');
            fontAwesome.rel = 'stylesheet';
            fontAwesome.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css';
            document.head.appendChild(fontAwesome);
        }

        // Cargar React Flow desde CDN si no está disponible
        if (typeof window.ReactFlow === 'undefined') {
            await this.loadReactFlowFromCDN();
        }
    }

    /**
     * Carga React Flow desde CDN
     */
    async loadReactFlowFromCDN() {
        return new Promise((resolve, reject) => {
            // Cargar React Flow CSS
            const cssLink = document.createElement('link');
            cssLink.rel = 'stylesheet';
            cssLink.href = 'https://unpkg.com/@xyflow/react@12.8.2/dist/style.css';
            document.head.appendChild(cssLink);

            // Cargar React Flow JS
            const script = document.createElement('script');
            script.src = 'https://unpkg.com/@xyflow/react@12.8.2/dist/index.umd.js';
            script.onload = () => {
                console.log('📦 React Flow cargado desde CDN');
                resolve();
            };
            script.onerror = reject;
            document.head.appendChild(script);
        });
    }

    /**
     * Inicializa los componentes principales
     */
    initializeComponents() {
        // Crear contenedor principal si no existe
        this.createMainContainer();
        
        // Inicializar FlowManager
        this.flowManager = new FlowManager();
        
        // Inicializar FlowInterface
        this.flowInterface = new FlowInterface();
        
        // Hacer disponibles globalmente
        window.flowManager = this.flowManager;
        window.flowInterface = this.flowInterface;
    }

    /**
     * Crea el contenedor principal
     */
    createMainContainer() {
        let container = document.querySelector('#flow-container');
        
        if (!container) {
            container = document.createElement('div');
            container.id = 'flow-container';
            container.className = 'flow-container';
            
            // Insertar en el body o en el elemento root
            const root = document.querySelector('#root') || document.body;
            root.appendChild(container);
        }
    }

    /**
     * Configura React Flow
     */
    setupReactFlow() {
        if (typeof window.ReactFlow === 'undefined') {
            console.warn('⚠️ React Flow no está disponible, usando modo de simulación');
            this.setupSimulationMode();
            return;
        }

        try {
            const { ReactFlow, Background, Controls, MiniMap } = window.ReactFlow;
            
            // Crear el componente React Flow
            this.createReactFlowComponent(ReactFlow, Background, Controls, MiniMap);
            
        } catch (error) {
            console.error('Error configurando React Flow:', error);
            this.setupSimulationMode();
        }
    }

    /**
     * Crea el componente React Flow
     */
    createReactFlowComponent(ReactFlow, Background, Controls, MiniMap) {
        const container = document.querySelector('#flow-container');
        
        // Crear el elemento React Flow
        const reactFlowElement = document.createElement('div');
        reactFlowElement.id = 'react-flow-container';
        reactFlowElement.style.width = '100%';
        reactFlowElement.style.height = 'calc(100vh - 80px)'; // Restar altura de toolbar
        container.appendChild(reactFlowElement);

        // Configurar React Flow con los datos iniciales
        this.updateReactFlowDisplay();
    }

    /**
     * Configura el modo de simulación (fallback)
     */
    setupSimulationMode() {
        const container = document.querySelector('#flow-container');
        
        const simulationDiv = document.createElement('div');
        simulationDiv.id = 'flow-simulation';
        simulationDiv.innerHTML = `
            <div class="simulation-message">
                <h2>🎭 Modo de Simulación</h2>
                <p>React Flow no está disponible. Mostrando simulación de la funcionalidad.</p>
                <div class="simulation-nodes"></div>
            </div>
        `;
        
        container.appendChild(simulationDiv);
        
        // Crear nodos de ejemplo
        this.createSimulationNodes();
    }

    /**
     * Crea nodos de simulación
     */
    createSimulationNodes() {
        const simulationContainer = document.querySelector('.simulation-nodes');
        
        const sampleNodes = [
            {
                id: '1',
                type: 'entidad-individual',
                data: {
                    nombre: 'Gandalf',
                    apellidos: 'el Gris',
                    tipo: 'Mago',
                    descripcion: 'Un poderoso mago gris que viaja por la Tierra Media',
                    estado: 'Vivo',
                    origen: 'Valinor',
                    comportamiento: 'Sabio y protector'
                }
            },
            {
                id: '2',
                type: 'entidad-colectiva',
                data: {
                    nombre: 'La Compañía del Anillo',
                    apellidos: 'Los Nueve Caminantes',
                    tipo: 'Grupo',
                    descripcion: 'Grupo de nueve compañeros que llevan el Anillo Único',
                    estado: 'Activa',
                    origen: 'Rivendel',
                    comportamiento: 'Unidos en su misión'
                }
            }
        ];

        sampleNodes.forEach(node => {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'simulation-node';
            nodeElement.style.cssText = `
                position: absolute;
                left: ${Math.random() * 400 + 50}px;
                top: ${Math.random() * 300 + 100}px;
                z-index: 10;
            `;
            
            const nodeTypes = this.flowManager.getNodeTypes();
            const nodeClass = nodeTypes[node.type];
            
            if (nodeClass) {
                nodeElement.innerHTML = nodeClass.render(node);
            }
            
            simulationContainer.appendChild(nodeElement);
        });
    }

    /**
     * Actualiza la visualización de React Flow
     */
    updateReactFlowDisplay() {
        if (!this.flowManager) return;

        const nodes = this.flowManager.getNodes();
        const edges = this.flowManager.getEdges();

        // Si estamos en modo simulación
        if (document.querySelector('#flow-simulation')) {
            this.updateSimulationDisplay(nodes, edges);
            return;
        }

        // Actualizar React Flow real
        if (window.reactFlowInstance) {
            window.reactFlowInstance.setNodes(nodes);
            window.reactFlowInstance.setEdges(edges);
        }
    }

    /**
     * Actualiza la visualización de simulación
     */
    updateSimulationDisplay(nodes, edges) {
        const simulationContainer = document.querySelector('.simulation-nodes');
        if (!simulationContainer) return;

        // Limpiar nodos existentes
        simulationContainer.innerHTML = '';

        // Crear nuevos nodos
        nodes.forEach(node => {
            const nodeElement = document.createElement('div');
            nodeElement.className = 'simulation-node';
            nodeElement.style.cssText = `
                position: absolute;
                left: ${node.position?.x || Math.random() * 400 + 50}px;
                top: ${node.position?.y || Math.random() * 300 + 100}px;
                z-index: 10;
            `;
            
            const nodeTypes = this.flowManager.getNodeTypes();
            const nodeClass = nodeTypes[node.type];
            
            if (nodeClass) {
                nodeElement.innerHTML = nodeClass.render(node);
            }
            
            simulationContainer.appendChild(nodeElement);
        });
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Event listener para actualizaciones del flujo
        document.addEventListener('flowDataUpdate', (event) => {
            this.updateReactFlowDisplay();
        });

        // Event listener para cambios en el proyecto activo
        document.addEventListener('projectChanged', () => {
            this.flowManager.loadProjectActive();
        });

        // Event listener para teclas de acceso rápido
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });
    }

    /**
     * Maneja atajos de teclado
     */
    handleKeyboardShortcuts(event) {
        // Ctrl+N: Nuevo nodo
        if (event.ctrlKey && event.key === 'n') {
            event.preventDefault();
            this.flowInterface.showCreateNodeForm('entidad-individual');
        }
        
        // Ctrl+S: Guardar
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            this.flowInterface.saveCurrentState();
        }
        
        // Ctrl+E: Exportar
        if (event.ctrlKey && event.key === 'e') {
            event.preventDefault();
            this.flowInterface.exportFlow();
        }
        
        // Delete: Eliminar elemento seleccionado
        if (event.key === 'Delete') {
            // Implementar eliminación del elemento seleccionado
        }
    }

    /**
     * Obtiene el estado de inicialización
     */
    isReady() {
        return this.isInitialized;
    }

    /**
     * Obtiene el gestor de flujo
     */
    getFlowManager() {
        return this.flowManager;
    }

    /**
     * Obtiene la interfaz de flujo
     */
    getFlowInterface() {
        return this.flowInterface;
    }

    /**
     * Reinicia la aplicación
     */
    restart() {
        console.log('🔄 Reiniciando React Flow...');
        this.isInitialized = false;
        
        // Limpiar contenedores
        const container = document.querySelector('#flow-container');
        if (container) {
            container.innerHTML = '';
        }
        
        // Reinicializar
        this.init();
    }
}

// Función global para inicializar
window.initializeFlow = function() {
    if (!window.flowInitializer) {
        window.flowInitializer = new FlowInitializer();
    }
    return window.flowInitializer;
};

// Auto-inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.initializeFlow();
    });
} else {
    window.initializeFlow();
}

// Exportar para uso global
window.FlowInitializer = FlowInitializer;
