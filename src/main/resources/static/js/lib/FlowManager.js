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
     * ¡REFACTORIZADO!
     */
    async loadProjectData() {
        if (!this.projectActive) return;

        try {
            console.log('🔄 [FlowManager] Cargando datos del proyecto desde la API...');

            const categorias = [
                'entidadindividual',
                'entidadcolectiva',
                'construccion',
                'zona',
                'efectos',
                'interaccion'
            ];

            const promesas = categorias.map(tipo =>
                fetch(`/api/bd/${tipo}`)
                    .then(res => res.ok ? res.json() : Promise.reject(`Error cargando ${tipo}`))
                    .catch(err => {
                        console.error(err);
                        return []; // Devuelve un array vacío si esta categoría falla
                    })
            );
            
            const [
                entidadesIndividuales,
                entidadesColectivas,
                construcciones,
                zonas,
                efectos,
                interacciones
            ] = await Promise.all(promesas);

            // Combinar todos los datos
            const projectData = {
                entidadindividual: entidadesIndividuales || [],
                entidadcolectiva: entidadesColectivas || [],
                construccion: construcciones || [],
                zona: zonas || [],
                efectos: efectos || [],
                interaccion: interacciones || []
            };
            
            console.log('📄 [FlowManager] Datos del proyecto obtenidos (API):', projectData);
            this.processStructuredData(projectData);

        } catch (error) {
            console.error('[FlowManager] Error cargando datos del proyecto:', error);
        }
    }

    /**
     * Procesa los datos estructurados del backend
     * ¡REFACTORIZADO!
     */
    processStructuredData(projectData) {
        
        // Limpiamos nodos y edges antiguos
        this.nodes = [];
        this.edges = [];

        // Procesar entidades y convertirlas en nodos
        if (projectData.entidadindividual) {
            this.processEntities(projectData.entidadindividual, 'entidad-individual');
        }
        if (projectData.entidadcolectiva) {
            this.processEntities(projectData.entidadcolectiva, 'entidad-colectiva');
        }
        if (projectData.construccion) {
            this.processEntities(projectData.construccion, 'construccion');
        }
        if (projectData.zona) {
            this.processEntities(projectData.zona, 'zona');
        }
        if (projectData.efectos) {
            this.processEntities(projectData.efectos, 'efecto');
        }
        
        // Procesar interacciones (como nodos o edges, según tu lógica)
        if (projectData.interaccion) {
            // Actualmente tu app trata 'interaccion' (Relaciones) como un nodo
            this.processEntities(projectData.interaccion, 'relacion'); 
            // Si 'interaccion' debiera ser un edge (línea), la lógica iría aquí
            // this.processInteractionsAsEdges(projectData.interaccion);
        }
        
        console.log('✅ [FlowManager] Datos del proyecto procesados correctamente');
        this.updateFlow();
    }

    /**
     * Procesa entidades y las convierte en nodos
     */
    processEntities(entities, nodeType) {
        entities.forEach((entity, index) => {
            // Usar un ID único basado en el tipo y el ID de la BD
            const nodeId = `${nodeType}-${entity.id}`; 
            
            const node = {
                id: nodeId,
                type: nodeType,
                // Asignar posición aleatoria (idealmente, esto se guardaría y cargaría)
                position: { x: 100 + (index * 50) + (Math.random() * 50), y: 100 + (index * 100) },
                data: {
                    nombre: entity.nombre || 'Sin nombre',
                    backendData: entity // Almacenamos todos los datos de la BD aquí
                }
            };
            
            // Verificar si el nodo ya existe (aunque acabamos de limpiar, es buena práctica)
            const existingNodeIndex = this.nodes.findIndex(n => n.id === nodeId);
            if (existingNodeIndex !== -1) {
                this.nodes[existingNodeIndex] = node;
            } else {
                this.nodes.push(node);
            }
        });
    }

    /**
     * Procesa interacciones y las convierte en conexiones (EJEMPLO, NO USADO AÚN)
     */
    processInteractionsAsEdges(interactions) {
        interactions.forEach((interaction, index) => {
            const edgeId = `interaction-${interaction.id}`;
            const edge = {
                id: edgeId,
                // ¡NECESITARÍAS LÓGICA AQUÍ para saber qué nodos conectar!
                // Ej. si 'interaccion' tuviera 'nodo_origen_id' y 'nodo_destino_id'
                source: interaction.source_node_id || 'unknown', 
                target: interaction.target_node_id || 'unknown',
                type: 'relacion-linea',
                data: {
                    nombre: interaction.nombre || 'Interacción',
                    tipo: interaction.tipo || 'General',
                    descripcion: interaction.descripcion || '',
                    backendData: interaction
                }
            };
            
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