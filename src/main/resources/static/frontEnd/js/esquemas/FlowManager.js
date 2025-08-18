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
     * Carga los datos del proyecto desde el archivo SQL
     */
    async loadProjectData() {
        if (!this.projectActive) return;

        try {
            const response = await fetch('/api/proyectos/archivo-sql');
            if (response.ok) {
                const sqlContent = await response.text();
                this.parseSQLToFlowData(sqlContent);
            }
        } catch (error) {
            console.error('Error cargando datos del proyecto:', error);
        }
    }

    /**
     * Parsea el contenido SQL a datos de React Flow
     */
    parseSQLToFlowData(sqlContent) {
        // Extraer INSERT statements y convertirlos a nodos
        const insertRegex = /INSERT INTO (\w+) \(.*?\) VALUES \(.*?\);/g;
        let match;
        
        while ((match = insertRegex.exec(sqlContent)) !== null) {
            const tableName = match[1];
            const values = this.extractValuesFromSQL(match[0]);
            
            if (values) {
                const node = this.createNodeFromSQLData(tableName, values);
                if (node) {
                    this.nodes.push(node);
                }
            }
        }

        // Extraer relaciones y convertirlas a edges
        const relationRegex = /INSERT INTO relaciones \(.*?\) VALUES \(.*?\);/g;
        while ((match = relationRegex.exec(sqlContent)) !== null) {
            const values = this.extractValuesFromSQL(match[0]);
            if (values) {
                const edge = this.createEdgeFromSQLData(values);
                if (edge) {
                    this.edges.push(edge);
                }
            }
        }

        this.updateFlow();
    }

    /**
     * Extrae valores de una sentencia SQL INSERT
     */
    extractValuesFromSQL(sqlStatement) {
        const valuesMatch = sqlStatement.match(/VALUES \((.*?)\)/);
        if (valuesMatch) {
            return valuesMatch[1].split(',').map(v => v.trim().replace(/'/g, ''));
        }
        return null;
    }

    /**
     * Crea un nodo a partir de datos SQL
     */
    createNodeFromSQLData(tableName, values) {
        const nodeType = this.mapTableToNodeType(tableName);
        if (!nodeType) return null;

        return {
            id: values[0] || this.generateId(),
            type: nodeType,
            position: { x: Math.random() * 800, y: Math.random() * 600 },
            data: {
                nombre: values[1] || '',
                apellidos: values[2] || '',
                tipo: values[3] || '',
                descripcion: values[4] || '',
                ...this.extractExtraData(tableName, values)
            }
        };
    }

    /**
     * Mapea nombres de tabla a tipos de nodo
     */
    mapTableToNodeType(tableName) {
        const mapping = {
            'entidades_individuales': 'entidad-individual',
            'entidades_colectivas': 'entidad-colectiva',
            'construcciones': 'construccion',
            'zonas': 'zona',
            'efectos': 'efecto'
        };
        return mapping[tableName] || null;
    }

    /**
     * Extrae datos adicionales según el tipo de tabla
     */
    extractExtraData(tableName, values) {
        const extraData = {};
        
        switch (tableName) {
            case 'entidades_individuales':
            case 'entidades_colectivas':
                extraData.estado = values[5] || '';
                extraData.origen = values[6] || '';
                extraData.comportamiento = values[7] || '';
                break;
            case 'construcciones':
                extraData.tamanno = values[5] || '';
                extraData.desarrollo = values[6] || '';
                break;
            case 'zonas':
                extraData.tamanno = values[5] || '';
                extraData.desarrollo = values[6] || '';
                break;
            case 'efectos':
                extraData.origen = values[5] || '';
                extraData.dureza = values[6] || '';
                extraData.comportamiento = values[7] || '';
                break;
        }
        
        return extraData;
    }

    /**
     * Crea una conexión a partir de datos SQL
     */
    createEdgeFromSQLData(values) {
        return {
            id: `e${values[0]}`,
            source: values[1],
            target: values[2],
            type: 'relacion-linea',
            data: {
                direccion: values[3] || '',
                afectados: values[4] || ''
            }
        };
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
     * Crea un nuevo nodo
     */
    async createNode(nodeData) {
        try {
            const response = await fetch('/api/bd/insertar', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(nodeData)
            });
            
            if (response.ok) {
                const newNode = {
                    id: this.generateId(),
                    type: this.mapTableToNodeType(nodeData.tipoTabla),
                    position: { x: Math.random() * 800, y: Math.random() * 600 },
                    data: nodeData
                };
                
                this.nodes.push(newNode);
                this.updateFlow();
                return newNode;
            }
        } catch (error) {
            console.error('Error creando nodo:', error);
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
        // Disparar evento para actualizar React Flow
        const event = new CustomEvent('flowDataUpdate', {
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
