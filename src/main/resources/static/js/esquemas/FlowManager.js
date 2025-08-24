/**
 * FlowManager.js - Gestor principal de React Flow para Worldbuilding App
 * Maneja el estado global de nodos, conexiones y la comunicación con el backend
 */

class FlowManager {
    constructor() {
        this.nodes = [];
        this.edges = [];
        this.projectActive = null;
        this.flowInstance = null;
        this.nodeTypes = {};
        this.edgeTypes = {};
        
        this.init();
    }

    /**
     * Inicializa el gestor de flujo
     */
    init() {
        this.loadProjectActive();
        this.registerNodeTypes();
        this.registerEdgeTypes();
        this.setupEventListeners();
    }

    /**
     * Registra los tipos de nodos personalizados
     */
    registerNodeTypes() {
        this.nodeTypes = {
            'entidad-individual': new EntidadIndividualNode(),
            'entidad-colectiva': new EntidadColectivaNode(),
            'construccion': new ConstruccionNode(),
            'zona': new ZonaNode(),
            'efecto': new EfectoNode(),
            'relacion': new RelacionNode()
        };
    }

    /**
     * Registra los tipos de conexiones personalizadas
     */
    registerEdgeTypes() {
        this.edgeTypes = {
            'relacion-linea': new RelacionLinea(),
            'jerarquia': new JerarquiaEdge(),
            'alianza': new AlianzaEdge(),
            'conflicto': new ConflictoEdge()
        };
    }

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Event listeners para cambios en el flujo
        document.addEventListener('flowNodesChange', this.handleNodesChange.bind(this));
        document.addEventListener('flowEdgesChange', this.handleEdgesChange.bind(this));
        document.addEventListener('flowConnect', this.handleConnect.bind(this));
    }

    /**
     * Carga el proyecto activo desde la sesión
     */
    async loadProjectActive() {
        try {
            const response = await fetch('/api/proyectos/activo');
            if (response.ok) {
                this.projectActive = await response.json();
                await this.loadProjectData();
            } else {
                console.warn('No hay proyecto activo');
            }
        } catch (error) {
            console.error('Error cargando proyecto activo:', error);
        }
    }

    /**
     * Carga los datos del proyecto desde el backend
     */
    async loadProjectData() {
        if (!this.projectActive) return;

        try {
            console.log('🔄 Cargando datos del proyecto desde el backend...');
            const response = await fetch('/api/proyectos/datos-proyecto');
            if (response.ok) {
                const datosProyecto = await response.json();
                console.log('📄 Datos del proyecto obtenidos:', datosProyecto);
                this.processStructuredData(datosProyecto);
            } else {
                console.warn('No se pudieron obtener los datos del proyecto');
            }
        } catch (error) {
            console.error('Error cargando datos del proyecto:', error);
        }
    }

    /**
     * Procesa los datos estructurados del backend
     */
    processStructuredData(datosProyecto) {
        const { tablas } = datosProyecto;
        
        // Procesar entidades individuales
        if (tablas.entidadIndividual) {
            this.processEntities(tablas.entidadIndividual, 'entidad-individual');
        }
        
        // Procesar entidades colectivas
        if (tablas.entidadColectiva) {
            this.processEntities(tablas.entidadColectiva, 'entidad-colectiva');
        }
        
        // Procesar construcciones
        if (tablas.construccion) {
            this.processEntities(tablas.construccion, 'construccion');
        }
        
        // Procesar zonas
        if (tablas.zona) {
            this.processEntities(tablas.zona, 'zona');
        }
        
        // Procesar efectos
        if (tablas.efectos) {
            this.processEntities(tablas.efectos, 'efecto');
        }
        
        // Procesar interacciones
        if (tablas.interaccion) {
            this.processInteractions(tablas.interaccion);
        }
        
        console.log('✅ Datos del proyecto procesados correctamente');
        this.updateFlow();
    }

    /**
     * Procesa entidades y las convierte en nodos
     */
    processEntities(entities, nodeType) {
        entities.forEach((entity, index) => {
            const nodeId = `${nodeType}-${index}`;
            const node = {
                id: nodeId,
                type: nodeType,
                position: { x: 100 + (index * 250), y: 100 + (index * 150) },
                data: {
                    nombre: entity.nombre || 'Sin nombre',
                    backendData: entity
                }
            };
            
            // Verificar si el nodo ya existe
            const existingNodeIndex = this.nodes.findIndex(n => n.id === nodeId);
            if (existingNodeIndex !== -1) {
                this.nodes[existingNodeIndex] = node;
            } else {
                this.nodes.push(node);
            }
        });
    }

    /**
     * Procesa interacciones y las convierte en conexiones
     */
    processInteractions(interactions) {
        interactions.forEach((interaction, index) => {
            const edgeId = `interaction-${index}`;
            const edge = {
                id: edgeId,
                source: interaction.source || 'unknown',
                target: interaction.target || 'unknown',
                type: 'relacion-linea',
                data: {
                    nombre: interaction.nombre || 'Interacción',
                    tipo: interaction.tipo || 'General',
                    descripcion: interaction.descripcion || '',
                    backendData: interaction
                }
            };
            
            // Verificar si la conexión ya existe
            const existingEdgeIndex = this.edges.findIndex(e => e.id === edgeId);
            if (existingEdgeIndex !== -1) {
                this.edges[existingEdgeIndex] = edge;
            } else {
                this.edges.push(edge);
            }
        });
    }

    /**
     * Actualiza el flujo con los datos cargados
     */
    updateFlow() {
        if (this.flowInstance) {
            this.flowInstance.setNodes(this.nodes);
            this.flowInstance.setEdges(this.edges);
        }
        
        // Disparar evento de actualización
        document.dispatchEvent(new CustomEvent('flowDataUpdated', {
            detail: { nodes: this.nodes, edges: this.edges }
        }));
    }

    /**
     * Maneja cambios en los nodos
     */
    handleNodesChange(changes) {
        changes.forEach(change => {
            if (change.type === 'position' && change.dragging === false) {
                this.saveNodePosition(change);
            }
        });
    }

    /**
     * Maneja cambios en las conexiones
     */
    handleEdgesChange(changes) {
        // Lógica para manejar cambios en edges
    }

    /**
     * Maneja nuevas conexiones
     */
    handleConnect(connection) {
        const newEdge = {
            id: `e${this.generateId()}`,
            source: connection.source,
            target: connection.target,
            type: 'relacion-linea'
        };
        
        this.edges.push(newEdge);
        this.saveEdge(newEdge);
    }

    /**
     * Guarda la posición de un nodo
     */
    async saveNodePosition(change) {
        const node = this.nodes.find(n => n.id === change.id);
        if (node) {
            node.position = change.position;
            // Aquí se podría guardar la posición en el backend si es necesario
        }
    }

    /**
     * Guarda una nueva conexión
     */
    async saveEdge(edge) {
        try {
            const response = await fetch('/api/bd/relacionar', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    id: edge.id,
                    source: edge.source,
                    target: edge.target,
                    direccion: edge.data?.direccion || '',
                    afectados: edge.data?.afectados || ''
                })
            });
            
            if (!response.ok) {
                console.error('Error guardando conexión');
            }
        } catch (error) {
            console.error('Error guardando conexión:', error);
        }
    }

    /**
     * Crea un nuevo nodo desde drag & drop
     */
    async createNode(nodeData) {
        try {
            const { type, position, data } = nodeData;
            
            // Crear el nodo localmente
            const newNode = {
                id: this.generateId(),
                type: type,
                position: position || { x: Math.random() * 800, y: Math.random() * 600 },
                data: data || {}
            };
            
            // Agregar el nodo a la lista local
            this.nodes.push(newNode);
            
            // Actualizar el flujo
            this.updateFlow();
            
            console.log('🎯 Nodo creado:', newNode);
            return newNode;
            
        } catch (error) {
            console.error('Error creando nodo:', error);
            throw error;
        }
    }

    /**
     * Mapea nombres de tabla a tipos de nodo (método legacy)
     */
    mapTableToNodeType(tableName) {
        const mapping = {
            'entidades_individuales': 'entidad-individual',
            'entidades_colectivas': 'entidad-colectiva',
            'construcciones': 'construccion',
            'zonas': 'zona',
            'efectos': 'efecto'
        };
        return mapping[tableName] || 'entidad-individual';
    }

    /**
     * Elimina un nodo
     */
    async deleteNode(nodeId) {
        try {
            const response = await fetch('/api/bd/eliminar', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: nodeId })
            });
            
            if (response.ok) {
                this.nodes = this.nodes.filter(n => n.id !== nodeId);
                this.edges = this.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
                this.updateFlow();
            }
        } catch (error) {
            console.error('Error eliminando nodo:', error);
        }
    }

    /**
     * Actualiza el flujo en la interfaz
     */
    updateFlow() {
        if (this.flowInstance) {
            this.flowInstance.setNodes(this.nodes);
            this.flowInstance.setEdges(this.edges);
        }
        
        // Disparar evento para actualizar React Flow
        const event = new CustomEvent('flowDataUpdated', {
            detail: { nodes: this.nodes, edges: this.edges }
        });
        document.dispatchEvent(event);
    }

    /**
     * Genera un ID único
     */
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    /**
     * Obtiene los nodos actuales
     */
    getNodes() {
        return this.nodes;
    }

    /**
     * Obtiene las conexiones actuales
     */
    getEdges() {
        return this.edges;
    }

    /**
     * Obtiene los tipos de nodos registrados
     */
    getNodeTypes() {
        return this.nodeTypes;
    }

    /**
     * Obtiene los tipos de conexiones registrados
     */
    getEdgeTypes() {
        return this.edgeTypes;
    }
}

// Exportar para uso global
window.FlowManager = FlowManager;
