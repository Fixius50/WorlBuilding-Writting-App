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
        
        // Esperar a que el DOM esté listo antes de inicializar contadores
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeCounters();
            });
        } else {
            this.initializeCounters();
        }
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
        // Verificar si hay proyecto activo
        if (!window.nombreProyectoGlobal) {
            console.warn('WARNING: No hay proyecto activo, intentando obtenerlo...');
            
            // Intentar obtener el proyecto activo
            try {
                const response = await fetch('/api/proyectos/activo');
                if (response.ok) {
                    const proyecto = await response.json();
                    window.nombreProyectoGlobal = proyecto.nombre;
                    console.log('SUCCESS: Proyecto activo obtenido:', window.nombreProyectoGlobal);
                } else {
                    console.error('ERROR: No se pudo obtener el proyecto activo');
                    this.showError('No hay proyecto activo');
                    return;
                }
            } catch (error) {
                console.error('ERROR: Error obteniendo proyecto activo:', error);
                this.showError('Error obteniendo proyecto activo');
                return;
            }
        }

        try {
            console.log('LOADING: Cargando datos del proyecto:', window.nombreProyectoGlobal);
            
            // Obtener los datos estructurados del proyecto
            const response = await fetch('/api/proyectos/datos-proyecto');
            if (!response.ok) {
                throw new Error(`Error obteniendo datos del proyecto: ${response.status} ${response.statusText}`);
            }

            const datosProyecto = await response.json();
            console.log('DATA: Datos del proyecto obtenidos:', datosProyecto);
            
            // Verificar que los datos tengan la estructura esperada
            if (!datosProyecto.tablas) {
                console.warn('WARNING: Los datos no tienen la estructura esperada:', datosProyecto);
                this.showError('Estructura de datos incorrecta');
                return;
            }
            
            // Procesar los datos estructurados
            this.processStructuredData(datosProyecto);
            this.updateUI();
            
            console.log('SUCCESS: Datos del proyecto cargados correctamente');
            
        } catch (error) {
            console.error('ERROR: Error cargando datos del proyecto:', error);
            this.showError(`Error cargando datos del proyecto: ${error.message}`);
        }
    }

    /**
     * Procesa los datos estructurados del proyecto
     */
    processStructuredData(datosProyecto) {
        console.log('PROCESSING: Datos del proyecto:', datosProyecto);
        
        // Limpiar datos anteriores
        this.projectData = {
            entidadesIndividuales: [],
            entidadesColectivas: [],
            construcciones: [],
            zonas: [],
            efectos: []
        };

        const tablas = datosProyecto.tablas || {};
        console.log('TABLES: Tablas disponibles:', Object.keys(tablas));
        
        // Procesar entidades individuales
        if (tablas.entidadIndividual && Array.isArray(tablas.entidadIndividual)) {
            console.log('INDIVIDUAL: Procesando entidades individuales:', tablas.entidadIndividual.length);
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
        } else {
            console.log('WARNING: No hay entidades individuales o formato incorrecto');
        }

        // Procesar entidades colectivas
        if (tablas.entidadColectiva && Array.isArray(tablas.entidadColectiva)) {
            console.log('COLLECTIVE: Procesando entidades colectivas:', tablas.entidadColectiva.length);
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
        } else {
            console.log('WARNING: No hay entidades colectivas o formato incorrecto');
        }

        // Procesar construcciones
        if (tablas.construccion && Array.isArray(tablas.construccion)) {
            console.log('BUILDINGS: Procesando construcciones:', tablas.construccion.length);
            this.projectData.construcciones = tablas.construccion.map(row => ({
                id: row.id || this.generateId(),
                nombre: row.nombre || '',
                apellidos: row.apellidos || '',
                tipo: row.tipo || '',
                descripcion: row.descripcion || '',
                tamanno: row.tamanno || '',
                desarrollo: row.desarrollo || ''
            }));
        } else {
            console.log('WARNING: No hay construcciones o formato incorrecto');
        }

        // Procesar zonas
        if (tablas.zona && Array.isArray(tablas.zona)) {
            console.log('ZONES: Procesando zonas:', tablas.zona.length);
            this.projectData.zonas = tablas.zona.map(row => ({
                id: row.id || this.generateId(),
                nombre: row.nombre || '',
                apellidos: row.apellidos || '',
                tipo: row.tipo || '',
                descripcion: row.descripcion || '',
                tamanno: row.tamanno || '',
                desarrollo: row.desarrollo || ''
            }));
        } else {
            console.log('WARNING: No hay zonas o formato incorrecto');
        }

        // Procesar efectos
        if (tablas.efectos && Array.isArray(tablas.efectos)) {
            console.log('EFFECTS: Procesando efectos:', tablas.efectos.length);
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
        } else {
            console.log('WARNING: No hay efectos o formato incorrecto');
        }

        console.log('PROCESSED: Datos procesados:', this.projectData);
        console.log('SUMMARY: Resumen de elementos:');
        console.log(`  INDIVIDUAL: Entidades individuales: ${this.projectData.entidadesIndividuales.length}`);
        console.log(`  COLLECTIVE: Entidades colectivas: ${this.projectData.entidadesColectivas.length}`);
        console.log(`  BUILDINGS: Construcciones: ${this.projectData.construcciones.length}`);
        console.log(`  ZONES: Zonas: ${this.projectData.zonas.length}`);
        console.log(`  EFFECTS: Efectos: ${this.projectData.efectos.length}`);
    }

    /**
     * Actualiza la interfaz de usuario con los datos cargados
     */
    updateUI() {
        console.log('UI: Iniciando actualización de la interfaz de usuario...');
        
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

        console.log('SUCCESS: Interfaz de usuario actualizada con datos del backend');
        console.log('FINAL: Estado final de la interfaz:');
        console.log(`  INDIVIDUAL: Contador entidades individuales: ${this.projectData.entidadesIndividuales.length}`);
        console.log(`  COLLECTIVE: Contador entidades colectivas: ${this.projectData.entidadesColectivas.length}`);
        console.log(`  BUILDINGS: Contador construcciones: ${this.projectData.construcciones.length}`);
        console.log(`  ZONES: Contador zonas: ${this.projectData.zonas.length}`);
        console.log(`  EFFECTS: Contador efectos: ${this.projectData.efectos.length}`);
    }

    /**
     * Actualiza el contador de una categoría
     */
    updateCategoryCount(categoryId, count) {
        const countElement = document.getElementById(`count-${categoryId}`);
        if (countElement) {
            countElement.textContent = count;
            console.log(`COUNTER: Contador actualizado para ${categoryId}: ${count}`);
        } else {
            console.error(`ERROR: Elemento contador no encontrado: count-${categoryId}`);
            console.error(`SEARCHING: Elemento con ID: count-${categoryId}`);
            console.error(`AVAILABLE: Elementos disponibles:`, document.querySelectorAll('[id^="count-"]'));
        }
    }

    /**
     * Renderiza la lista de objetos de una categoría
     */
    renderObjectList(categoryId, objects) {
        const listElement = document.getElementById(`list-${categoryId}`);
        if (!listElement) {
            console.error(`ERROR: Elemento lista no encontrado: list-${categoryId}`);
            console.error(`SEARCHING: Elemento con ID: list-${categoryId}`);
            console.error(`AVAILABLE: Elementos disponibles:`, document.querySelectorAll('[id^="list-"]'));
            return;
        }

        if (objects.length === 0) {
            listElement.innerHTML = '<div class="empty-category">No hay elementos</div>';
            console.log(`EMPTY: Lista vacía renderizada para ${categoryId}`);
            return;
        }

        try {
            listElement.innerHTML = objects.map(obj => this.createObjectElement(obj, categoryId)).join('');
            console.log(`RENDERED: Lista renderizada para ${categoryId}: ${objects.length} elementos`);
        } catch (error) {
            console.error(`ERROR: Error renderizando lista para ${categoryId}:`, error);
            listElement.innerHTML = '<div class="error-category">Error cargando elementos</div>';
        }
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
        
        console.log('DRAG: Iniciando drag:', objectData.nombre, 'tipo:', categoryType);
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
            console.warn('WARNING: FlowManager no disponible, creando marcador en el mapa');
            this.handleMapDrop(event);
            return;
        }

        try {
            const data = JSON.parse(event.dataTransfer.getData('text/plain'));
            console.log('DROP: Drop recibido:', data);
            
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
            console.error('ERROR: Error procesando drop:', error);
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
                console.error('ERROR: Error obteniendo datos del drop:', error);
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
            
            console.log('MARKER: Marcador agregado al mapa:', data.object.nombre, 'en', worldCoords);
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
            console.log('NODE: Nodo creado en React Flow:', newNode);
            
        } catch (error) {
            console.error('ERROR: Error creando nodo en React Flow:', error);
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
     * Inicializa los contadores con 0
     */
    initializeCounters() {
        console.log('INIT: Inicializando contadores...');
        
        const categories = [
            'entidades-individuales',
            'entidades-colectivas',
            'construcciones',
            'zonas',
            'efectos'
        ];
        
        // Verificar que todos los elementos del DOM estén disponibles
        const missingElements = [];
        categories.forEach(category => {
            const countElement = document.getElementById(`count-${category}`);
            const listElement = document.getElementById(`list-${category}`);
            
            if (!countElement) {
                missingElements.push(`count-${category}`);
            }
            if (!listElement) {
                missingElements.push(`list-${category}`);
            }
        });
        
        if (missingElements.length > 0) {
            console.error('ERROR: Elementos del DOM no encontrados:', missingElements);
            console.error('CHECKING: Verificando estado del DOM...');
            console.error('DOM: Document readyState:', document.readyState);
            console.error('COUNT: Elementos count disponibles:', document.querySelectorAll('[id^="count-"]'));
            console.error('LIST: Elementos list disponibles:', document.querySelectorAll('[id^="list-"]'));
            return;
        }
        
        console.log('SUCCESS: Todos los elementos del DOM están disponibles');
        
        // Inicializar contadores
        categories.forEach(category => {
            this.updateCategoryCount(category, 0);
        });
        
        console.log('SUCCESS: Contadores inicializados con 0');
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
