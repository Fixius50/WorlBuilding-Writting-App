/**
 * ProjectDataLoader.js - Cargador de datos del proyecto desde la base de datos
 * Maneja la carga de entidades y el drag & drop al mapa para crear nodos de React Flow
 */

class ProjectDataLoader {
    constructor() {
        this.projectData = {
            entidadesIndividuales: [],
            entidadesColectivas: [],
            construcciones: [],
            zonas: [],
            efectos: []
        };
        this.draggedElement = null;
        this.init();
    }

    /**
     * Inicializa el cargador
     */
    init() {
        this.setupEventListeners();
        this.initializeCounters();
    }

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

    /**
     * Configura los event listeners
     */
    setupEventListeners() {
        // Event listeners para drag & drop
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
    }

    /**
     * Carga los datos del proyecto desde la base de datos
     */
    async loadProjectData() {
        if (!window.nombreProyectoGlobal) {
            console.warn('No hay proyecto activo');
            return;
        }

        try {
            console.log('🔄 Cargando datos del proyecto:', window.nombreProyectoGlobal);
            
            // Obtener los datos estructurados del proyecto
            const response = await fetch('/api/proyectos/datos-proyecto');
            if (!response.ok) {
                throw new Error('Error obteniendo datos del proyecto');
            }

            const datosProyecto = await response.json();
            console.log('📄 Datos del proyecto obtenidos:', datosProyecto);
            
            // Procesar los datos estructurados
            this.processStructuredData(datosProyecto);
            this.updateUI();
            
            console.log('✅ Datos del proyecto cargados correctamente');
            
        } catch (error) {
            console.error('❌ Error cargando datos del proyecto:', error);
            this.showError('Error cargando datos del proyecto');
        }
    }

    /**
     * Procesa los datos estructurados del proyecto
     */
    processStructuredData(datosProyecto) {
        // Limpiar datos anteriores
        this.projectData = {
            entidadesIndividuales: [],
            entidadesColectivas: [],
            construcciones: [],
            zonas: [],
            efectos: []
        };

        const tablas = datosProyecto.tablas || {};
        
        // Procesar entidades individuales
        if (tablas.entidadIndividual) {
            this.projectData.entidadesIndividuales = tablas.entidadIndividual.map(row => ({
                id: row.id || this.generateId(),
                nombre: row.nombre || '',
                apellidos: row.apellidos || '',
                tipo: row.tipo || '',
                descripcion: row.descripcion || '',
                estado: row.estado || '',
                origen: row.origen || '',
                comportamiento: row.comportamiento || ''
            }));
        }

        // Procesar entidades colectivas
        if (tablas.entidadColectiva) {
            this.projectData.entidadesColectivas = tablas.entidadColectiva.map(row => ({
                id: row.id || this.generateId(),
                nombre: row.nombre || '',
                apellidos: row.apellidos || '',
                tipo: row.tipo || '',
                descripcion: row.descripcion || '',
                estado: row.estado || '',
                origen: row.origen || '',
                comportamiento: row.comportamiento || ''
            }));
        }

        // Procesar construcciones
        if (tablas.construccion) {
            this.projectData.construcciones = tablas.construccion.map(row => ({
                id: row.id || this.generateId(),
                nombre: row.nombre || '',
                apellidos: row.apellidos || '',
                tipo: row.tipo || '',
                descripcion: row.descripcion || '',
                tamanno: row.tamanno || '',
                desarrollo: row.desarrollo || ''
            }));
        }

        // Procesar zonas
        if (tablas.zona) {
            this.projectData.zonas = tablas.zona.map(row => ({
                id: row.id || this.generateId(),
                nombre: row.nombre || '',
                apellidos: row.apellidos || '',
                tipo: row.tipo || '',
                descripcion: row.descripcion || '',
                tamanno: row.tamanno || '',
                desarrollo: row.desarrollo || ''
            }));
        }

        // Procesar efectos
        if (tablas.efectos) {
            this.projectData.efectos = tablas.efectos.map(row => ({
                id: row.id || this.generateId(),
                nombre: row.nombre || '',
                apellidos: row.apellidos || '',
                tipo: row.tipo || '',
                descripcion: row.descripcion || '',
                origen: row.origen || '',
                dureza: row.dureza || '',
                comportamiento: row.comportamiento || ''
            }));
        }

        console.log('📊 Datos procesados:', this.projectData);
    }

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

    /**
     * Renderiza la lista de objetos de una categoría
     */
    renderObjectList(categoryId, objects) {
        const listElement = document.getElementById(`list-${categoryId}`);
        if (!listElement) return;

        if (objects.length === 0) {
            listElement.innerHTML = '<div class="empty-category">No hay elementos</div>';
            return;
        }

        listElement.innerHTML = objects.map(obj => this.createObjectElement(obj, categoryId)).join('');
        console.log(`🎯 Lista renderizada para ${categoryId}: ${objects.length} elementos`);
    }

    /**
     * Crea un elemento HTML para un objeto arrastrable
     */
    createObjectElement(obj, categoryId) {
        const icon = this.getCategoryIcon(categoryId);
        const color = this.getCategoryColor(categoryId);
        
        return `
            <div class="draggable-object" 
                 draggable="true" 
                 data-id="${obj.id}" 
                 data-type="${categoryId}"
                 data-object='${JSON.stringify(obj)}'
                 title="Arrastrar para crear nodo en el mapa">
                <div class="object-icon" style="background-color: ${color}">
                    ${icon}
                </div>
                <div class="object-info">
                    <div class="object-name">${obj.nombre}</div>
                    <div class="object-type">${obj.tipo || this.getCategoryDisplayName(categoryId)}</div>
                </div>
                <div class="drag-hint">
                    <i class="fas fa-arrows-alt"></i>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene el icono para una categoría
     */
    getCategoryIcon(categoryId) {
        const icons = {
            'entidades-individuales': '👤',
            'entidades-colectivas': '👥',
            'construcciones': '🏗️',
            'zonas': '🗺️',
            'efectos': '✨'
        };
        return icons[categoryId] || '📦';
    }

    /**
     * Obtiene el nombre de visualización para una categoría
     */
    getCategoryDisplayName(categoryId) {
        const names = {
            'entidades-individuales': 'Personaje',
            'entidades-colectivas': 'Organización',
            'construcciones': 'Construcción',
            'zonas': 'Zona',
            'efectos': 'Efecto'
        };
        return names[categoryId] || 'Elemento';
    }

    /**
     * Obtiene el color para una categoría
     */
    getCategoryColor(categoryId) {
        const colors = {
            'entidades-individuales': '#667eea',
            'entidades-colectivas': '#f093fb',
            'construcciones': '#4facfe',
            'zonas': '#43e97b',
            'efectos': '#fa709a'
        };
        return colors[categoryId] || '#6c757d';
    }

    /**
     * Maneja el inicio del drag
     */
    handleDragStart(event) {
        if (!event.target.classList.contains('draggable-object')) return;
        
        this.draggedElement = event.target;
        event.target.classList.add('dragging');
        
        const objectData = JSON.parse(event.target.dataset.object);
        const categoryType = event.target.dataset.type;
        
        // Configurar datos para el drag & drop
        event.dataTransfer.setData('text/plain', JSON.stringify({
            id: objectData.id,
            type: categoryType,
            object: objectData,
            nodeType: this.mapCategoryToNodeType(categoryType)
        }));
        
        event.dataTransfer.effectAllowed = 'copy';
        
        console.log('🚀 Iniciando drag:', objectData.nombre, 'tipo:', categoryType);
    }

    /**
     * Mapea la categoría del frontend al tipo de nodo de React Flow
     */
    mapCategoryToNodeType(categoryId) {
        const mapping = {
            'entidades-individuales': 'entidad-individual',
            'entidades-colectivas': 'entidad-colectiva',
            'construcciones': 'construccion',
            'zonas': 'zona',
            'efectos': 'efecto'
        };
        return mapping[categoryId] || 'entidad-individual';
    }

    /**
     * Maneja el fin del drag
     */
    handleDragEnd(event) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.draggedElement = null;
        }
    }

    /**
     * Maneja el drag over
     */
    handleDragOver(event) {
        // Permitir drop en el mapa y en el área de React Flow
        if (event.target.closest('#infinite-map-container') || 
            event.target.closest('.react-flow') ||
            event.target.closest('.flow-container')) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        }
    }

    /**
     * Maneja el drop
     */
    async handleDrop(event) {
        event.preventDefault();
        
        // Verificar si hay un FlowManager disponible
        if (!window.flowManager) {
            console.warn('❌ FlowManager no disponible, creando marcador en el mapa');
            this.handleMapDrop(event);
            return;
        }

        try {
            const data = JSON.parse(event.dataTransfer.getData('text/plain'));
            console.log('📥 Drop recibido:', data);
            
            // Determinar si es drop en el mapa o en React Flow
            const mapContainer = event.target.closest('#infinite-map-container');
            const flowContainer = event.target.closest('.react-flow, .flow-container');
            
            if (mapContainer) {
                // Drop en el mapa - crear marcador
                this.handleMapDrop(event, data);
            } else if (flowContainer) {
                // Drop en React Flow - crear nodo
                this.handleFlowDrop(event, data);
            }
            
        } catch (error) {
            console.error('Error procesando drop:', error);
        }
    }

    /**
     * Maneja el drop en el mapa
     */
    handleMapDrop(event, data = null) {
        if (!data) {
            try {
                data = JSON.parse(event.dataTransfer.getData('text/plain'));
            } catch (error) {
                console.error('Error obteniendo datos del drop:', error);
                return;
            }
        }

        const mapContainer = event.target.closest('#infinite-map-container');
        if (!mapContainer || !this.draggedElement) return;

        const rect = mapContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        // Convertir coordenadas de pantalla a coordenadas del mundo
        if (window.infiniteMap && window.infiniteMap.getWorldCoordinates) {
            const worldCoords = window.infiniteMap.getWorldCoordinates(x, y);
            
            // Agregar marcador al mapa
            this.addMarkerToMap(data.object, worldCoords.x, worldCoords.y);
            
            console.log('📍 Marcador agregado al mapa:', data.object.nombre, 'en', worldCoords);
        }
    }

    /**
     * Maneja el drop en React Flow
     */
    async handleFlowDrop(event, data) {
        const flowContainer = event.target.closest('.react-flow, .flow-container');
        if (!flowContainer || !this.draggedElement) return;

        const rect = flowContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        try {
            // Crear nodo en React Flow
            const newNode = await this.createFlowNode(data, x, y);
            console.log('🎯 Nodo creado en React Flow:', newNode);
            
        } catch (error) {
            console.error('Error creando nodo en React Flow:', error);
            this.showError('Error creando nodo en el diagrama');
        }
    }

    /**
     * Crea un nodo en React Flow
     */
    async createFlowNode(data, x, y) {
        if (!window.flowManager) {
            throw new Error('FlowManager no disponible');
        }

        const nodeData = {
            nombre: data.object.nombre,
            backendData: data.object
        };

        const newNode = await window.flowManager.createNode({
            type: data.nodeType,
            position: { x, y },
            data: nodeData
        });

        return newNode;
    }

    /**
     * Agrega un marcador al mapa
     */
    addMarkerToMap(object, x, y) {
        if (!window.infiniteMap) return;

        const categoryId = this.getCategoryFromObject(object);
        const color = this.getCategoryColor(categoryId);
        
        window.infiniteMap.addMarker(x, y, {
            color: color,
            size: 12,
            label: object.nombre,
            data: {
                id: object.id,
                type: categoryId,
                object: object
            }
        });
    }

    /**
     * Obtiene la categoría de un objeto
     */
    getCategoryFromObject(object) {
        // Determinar la categoría basándose en los campos del objeto
        if (object.estado !== undefined) {
            return object.origen !== undefined ? 'entidades-individuales' : 'entidades-colectivas';
        }
        if (object.tamanno !== undefined) {
            return object.desarrollo !== undefined ? 'construcciones' : 'zonas';
        }
        if (object.origen !== undefined && object.dureza !== undefined) {
            return 'efectos';
        }
        return 'entidades-individuales'; // Por defecto
    }

    /**
     * Genera un ID único
     */
    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    /**
     * Muestra un error
     */
    showError(message) {
        // Crear una notificación de error
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 1.25rem;
            right: 1.25rem;
            background: #dc3545;
            color: white;
            padding: 0.75rem 1.25rem;
            border-radius: 0.375rem;
            z-index: 10000;
            box-shadow: 0 0.25rem 0.75rem rgba(0, 0, 0, 0.2);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.remove();
        }, 3000);
    }

    /**
     * Recarga los datos del proyecto
     */
    async reload() {
        return this.loadProjectData();
    }

    /**
     * Obtiene los datos del proyecto
     */
    getProjectData() {
        return this.projectData;
    }
}

// Exportar para uso global
window.ProjectDataLoader = ProjectDataLoader;
