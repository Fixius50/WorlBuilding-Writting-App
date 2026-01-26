/**
 * FlowInterface.js - Interfaz de usuario para React Flow
 * Maneja la interacción con nodos, conexiones y formularios
 */

class FlowInterface {
    constructor() {
        this.flowManager = null;
        this.currentEditNode = null;
        this.currentEditEdge = null;
        this.modalContainer = null;
        
        this.init();
    }

    /**
     * Inicializa la interfaz
     */
    init() {
        this.flowManager = new FlowManager();
        this.createModalContainer();
        this.setupEventListeners();
        this.setupToolbar();
    }

    /**
     * Crea el contenedor de modales
     */
    createModalContainer() {
        this.modalContainer = document.createElement('div');
        this.modalContainer.id = 'flow-modal-container';
        this.modalContainer.className = 'modal-container';
        this.modalContainer.style.display = 'none';
        document.body.appendChild(this.modalContainer);
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Event listeners para actualizaciones del flujo
        document.addEventListener('flowDataUpdate', this.handleFlowDataUpdate.bind(this));
        
        // Event listeners para acciones de nodos
        document.addEventListener('click', this.handleGlobalClick.bind(this));
        
        // Event listeners para teclas
        document.addEventListener('keydown', this.handleKeyDown.bind(this));
    }

    /**
     * Configura la barra de herramientas
     */
    setupToolbar() {
        const toolbar = document.createElement('div');
        toolbar.className = 'flow-toolbar';
        toolbar.innerHTML = `
            <div class="toolbar-section">
                <h3>Crear Elemento</h3>
                <div class="toolbar-buttons">
                    <button class="toolbar-btn" onclick="showCreateNodeForm('entidad-individual')">
                        <img src="/Otros/imagenes/mage.png" alt="Personaje">
                        <span>Personaje</span>
                    </button>
                    <button class="toolbar-btn" onclick="showCreateNodeForm('entidad-colectiva')">
                        <img src="/Otros/imagenes/colectivas.jpg" alt="Organización">
                        <span>Organización</span>
                    </button>
                    <button class="toolbar-btn" onclick="showCreateNodeForm('construccion')">
                        <img src="/Otros/imagenes/construcciones.jpg" alt="Construcción">
                        <span>Construcción</span>
                    </button>
                    <button class="toolbar-btn" onclick="showCreateNodeForm('zona')">
                        <img src="/Otros/imagenes/zonas.png" alt="Zona">
                        <span>Zona</span>
                    </button>
                    <button class="toolbar-btn" onclick="showCreateNodeForm('efecto')">
                        <img src="/Otros/imagenes/magia.png" alt="Efecto">
                        <span>Efecto</span>
                    </button>
                </div>
            </div>
            
            <div class="toolbar-section">
                <h3>Acciones</h3>
                <div class="toolbar-buttons">
                    <button class="toolbar-btn" onclick="toggleConnectionMode()">
                        <i class="fas fa-link"></i>
                        <span>Conectar</span>
                    </button>
                    <button class="toolbar-btn" onclick="clearAll()">
                        <i class="fas fa-trash"></i>
                        <span>Limpiar</span>
                    </button>
                    <button class="toolbar-btn" onclick="exportFlow()">
                        <i class="fas fa-download"></i>
                        <span>Exportar</span>
                    </button>
                </div>
            </div>
            
            <div class="toolbar-section">
                <h3>Vista</h3>
                <div class="toolbar-buttons">
                    <button class="toolbar-btn" onclick="fitView()">
                        <i class="fas fa-expand"></i>
                        <span>Ajustar Vista</span>
                    </button>
                    <button class="toolbar-btn" onclick="zoomIn()">
                        <i class="fas fa-search-plus"></i>
                        <span>Zoom +</span>
                    </button>
                    <button class="toolbar-btn" onclick="zoomOut()">
                        <i class="fas fa-search-minus"></i>
                        <span>Zoom -</span>
                    </button>
                </div>
            </div>
        `;
        
        // Insertar la barra de herramientas en el contenedor principal
        const flowContainer = document.querySelector('#flow-container') || document.body;
        flowContainer.insertBefore(toolbar, flowContainer.firstChild);
    }

    /**
     * Maneja las actualizaciones del flujo
     */
    handleFlowDataUpdate(event) {
        const { nodes, edges } = event.detail;
        this.updateFlowDisplay(nodes, edges);
    }

    /**
     * Actualiza la visualización del flujo
     */
    updateFlowDisplay(nodes, edges) {
        // Aquí se actualizaría React Flow con los nuevos datos
        // Por ahora, solo actualizamos el contador de elementos
        this.updateElementCounters(nodes, edges);
    }

    /**
     * Actualiza los contadores de elementos
     */
    updateElementCounters(nodes, edges) {
        const counters = {
            'entidad-individual': 0,
            'entidad-colectiva': 0,
            'construccion': 0,
            'zona': 0,
            'efecto': 0
        };

        nodes.forEach(node => {
            if (counters.hasOwnProperty(node.type)) {
                counters[node.type]++;
            }
        });

        // Actualizar contadores en la interfaz
        Object.keys(counters).forEach(type => {
            const counterElement = document.querySelector(`#counter-${type}`);
            if (counterElement) {
                counterElement.textContent = counters[type];
            }
        });
    }

    /**
     * Maneja clicks globales
     */
    handleGlobalClick(event) {
        // Cerrar modales si se hace click fuera
        if (event.target.classList.contains('modal-container')) {
            this.closeModal();
        }
    }

    /**
     * Maneja teclas presionadas
     */
    handleKeyDown(event) {
        // ESC para cerrar modales
        if (event.key === 'Escape') {
            this.closeModal();
        }
        
        // Ctrl+S para guardar
        if (event.ctrlKey && event.key === 's') {
            event.preventDefault();
            this.saveCurrentState();
        }
    }

    /**
     * Muestra el formulario de creación de nodo
     */
    showCreateNodeForm(nodeType) {
        const nodeTypes = this.flowManager.getNodeTypes();
        const nodeClass = nodeTypes[nodeType];
        
        if (!nodeClass) {
            console.error('Tipo de nodo no encontrado:', nodeType);
            return;
        }

        const formHtml = nodeClass.getCreateForm();
        this.showModal(formHtml, 'Crear Nuevo Elemento');
    }

    /**
     * Muestra el formulario de edición de nodo
     */
    showEditNodeForm(nodeId) {
        const nodes = this.flowManager.getNodes();
        const node = nodes.find(n => n.id === nodeId);
        
        if (!node) {
            console.error('Nodo no encontrado:', nodeId);
            return;
        }

        const nodeTypes = this.flowManager.getNodeTypes();
        const nodeClass = nodeTypes[node.type];
        
        if (!nodeClass) {
            console.error('Tipo de nodo no encontrado:', node.type);
            return;
        }

        const formHtml = nodeClass.getEditForm(nodeId);
        this.showModal(formHtml, 'Editar Elemento');
        this.currentEditNode = nodeId;
    }

    /**
     * Muestra el formulario de edición de conexión
     */
    showEditEdgeForm(edgeId) {
        const edges = this.flowManager.getEdges();
        const edge = edges.find(e => e.id === edgeId);
        
        if (!edge) {
            console.error('Conexión no encontrada:', edgeId);
            return;
        }

        const edgeTypes = this.flowManager.getEdgeTypes();
        const edgeClass = edgeTypes[edge.type];
        
        if (!edgeClass) {
            console.error('Tipo de conexión no encontrado:', edge.type);
            return;
        }

        const formHtml = edgeClass.getEditForm(edgeId);
        this.showModal(formHtml, 'Editar Relación');
        this.currentEditEdge = edgeId;
    }

    /**
     * Muestra un modal
     */
    showModal(content, title = '') {
        this.modalContainer.innerHTML = `
            <div class="modal-overlay">
                <div class="modal-content">
                    ${title ? `<div class="modal-header"><h2>${title}</h2></div>` : ''}
                    <div class="modal-body">
                        ${content}
                    </div>
                </div>
            </div>
        `;
        
        this.modalContainer.style.display = 'block';
        document.body.style.overflow = 'hidden';
    }

    /**
     * Cierra el modal
     */
    closeModal() {
        this.modalContainer.style.display = 'none';
        document.body.style.overflow = 'auto';
        this.currentEditNode = null;
        this.currentEditEdge = null;
    }

    /**
     * Guarda el estado actual
     */
    saveCurrentState() {
        // Aquí se podría implementar la funcionalidad de guardado
        console.log('Guardando estado actual...');
    }

    /**
     * Exporta el flujo
     */
    exportFlow() {
        const nodes = this.flowManager.getNodes();
        const edges = this.flowManager.getEdges();
        
        const exportData = {
            nodes: nodes,
            edges: edges,
            exportDate: new Date().toISOString(),
            version: '1.0'
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `worldbuilding-flow-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
    }

    /**
     * Limpia todos los elementos
     */
    clearAll() {
        if (confirm('¿Estás seguro de que quieres eliminar todos los elementos?')) {
            this.flowManager.nodes = [];
            this.flowManager.edges = [];
            this.flowManager.updateFlow();
        }
    }

    /**
     * Obtiene el gestor de flujo
     */
    getFlowManager() {
        return this.flowManager;
    }
}

// Funciones globales para uso desde HTML
window.showCreateNodeForm = function(nodeType) {
    if (window.flowInterface) {
        window.flowInterface.showCreateNodeForm(nodeType);
    }
};

window.editNode = function(nodeId) {
    if (window.flowInterface) {
        window.flowInterface.showEditNodeForm(nodeId);
    }
};

window.deleteNode = function(nodeId) {
    if (window.flowManager && confirm('¿Estás seguro de que quieres eliminar este elemento?')) {
        window.flowManager.deleteNode(nodeId);
    }
};

window.editEdge = function(edgeId) {
    if (window.flowInterface) {
        window.flowInterface.showEditEdgeForm(edgeId);
    }
};

window.deleteEdge = function(edgeId) {
    if (window.flowManager && confirm('¿Estás seguro de que quieres eliminar esta relación?')) {
        // Implementar eliminación de edge
    }
};

window.saveNodeEdit = function(nodeId) {
    // Implementar guardado de edición de nodo
    console.log('Guardando edición de nodo:', nodeId);
    window.flowInterface.closeModal();
};

window.cancelNodeEdit = function() {
    window.flowInterface.closeModal();
};

window.createNewNode = function(nodeType) {
    // Implementar creación de nuevo nodo
    console.log('Creando nuevo nodo:', nodeType);
    window.flowInterface.closeModal();
};

window.cancelCreateNode = function() {
    window.flowInterface.closeModal();
};

window.saveEdgeEdit = function(edgeId) {
    // Implementar guardado de edición de edge
    console.log('Guardando edición de edge:', edgeId);
    window.flowInterface.closeModal();
};

window.cancelEdgeEdit = function() {
    window.flowInterface.closeModal();
};

window.createNewEdge = function(sourceId, targetId) {
    // Implementar creación de nueva edge
    console.log('Creando nueva edge:', sourceId, targetId);
    window.flowInterface.closeModal();
};

window.cancelCreateEdge = function() {
    window.flowInterface.closeModal();
};

window.toggleConnectionMode = function() {
    // Implementar modo de conexión
    console.log('Cambiando modo de conexión');
};

window.clearAll = function() {
    if (window.flowInterface) {
        window.flowInterface.clearAll();
    }
};

window.exportFlow = function() {
    if (window.flowInterface) {
        window.flowInterface.exportFlow();
    }
};

window.fitView = function() {
    // Implementar ajuste de vista
    console.log('Ajustando vista');
};

window.zoomIn = function() {
    // Implementar zoom in
    console.log('Zoom in');
};

window.zoomOut = function() {
    // Implementar zoom out
    console.log('Zoom out');
};

// Exportar para uso global
window.FlowInterface = FlowInterface;