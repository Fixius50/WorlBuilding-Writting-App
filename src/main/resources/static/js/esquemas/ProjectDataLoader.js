/**
 * ProjectDataLoader.js - Cargador de datos del proyecto desde la base de datos
 *
 * MODIFICADO:
 * - `loadProjectData` ahora llama a los endpoints reales de la API `/api/bd/{tipo}`
 * en lugar del obsoleto `/api/proyectos/datos-proyecto`.
 * - Utiliza `Promise.all` para cargar todas las categorías en paralelo.
 * - Eliminada la lógica de parseo de SQL, ahora consume JSON real.
 */

class ProjectDataLoader {
    constructor() {
        this.projectData = {
            entidadesIndividuales: [],
            entidadesColectivas: [],
            construcciones: [],
            zonas: [],
            efectos: [],
            interacciones: [] // Añadida interaccion
        };
        this.draggedElement = null;
        this.init();
    }

    /**
     * Inicializa el cargador
     */
    init() {
        this.setupEventListeners();
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                this.initializeCounters();
            });
        } else {
            this.initializeCounters();
        }
    }

    /**
     * Configura los event listeners (sin cambios)
     */
    setupEventListeners() {
        document.addEventListener('dragstart', this.handleDragStart.bind(this));
        document.addEventListener('dragend', this.handleDragEnd.bind(this));
        document.addEventListener('dragover', this.handleDragOver.bind(this));
        document.addEventListener('drop', this.handleDrop.bind(this));
    }

    /**
     * Carga los datos del proyecto desde la base de datos
     * ¡REFACTORIZADO!
     */
    async loadProjectData() {
        // 1. Verificar si hay proyecto activo (sin cambios)
        if (!window.nombreProyectoGlobal) {
            // console.warn('WARNING: No hay proyecto activo, intentando obtenerlo...');
            try {
                const response = await fetch('/api/proyectos/activo');
                if (response.ok) {
                    const proyecto = await response.json();
                    window.nombreProyectoGlobal = proyecto.nombre;
                    // console.log('SUCCESS: Proyecto activo obtenido:', window.nombreProyectoGlobal);
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

        // 2. Cargar todas las categorías de la base de datos en paralelo
        try {
            // console.log('LOADING: Cargando datos del proyecto:', window.nombreProyectoGlobal);
            
            const categorias = [
                'entidadindividual',
                'entidadcolectiva',
                'construccion',
                'zona',
                'efectos',
                'interaccion'
            ];

            // Creamos un array de promesas de fetch
            const promesas = categorias.map(tipo => 
                fetch(`/api/bd/${tipo}`)
                    .then(res => {
                        if (!res.ok) {
                            throw new Error(`Error cargando ${tipo}: ${res.statusText}`);
                        }
                        return res.json();
                    })
                    .catch(err => {
                        console.error(err);
                        return []; // Devuelve un array vacío si esta categoría falla
                    })
            );

            // Ejecutamos todas las peticiones en paralelo
            const [
                entidadesIndividuales,
                entidadesColectivas,
                construcciones,
                zonas,
                efectos,
                interacciones
            ] = await Promise.all(promesas);

            // 3. Asignar los datos reales de la BD
            this.projectData = {
                entidadesIndividuales: entidadesIndividuales || [],
                entidadesColectivas: entidadesColectivas || [],
                construcciones: construcciones || [],
                zonas: zonas || [],
                efectos: efectos || [],
                interacciones: interacciones || []
            };
            
            // console.log('DATA: Datos del proyecto obtenidos:', this.projectData);

            // 4. Actualizar la UI
            this.updateUI();
            
            // console.log('SUCCESS: Datos del proyecto cargados correctamente');
            
        } catch (error) {
            console.error('ERROR: Error cargando datos del proyecto:', error);
            this.showError(`Error cargando datos del proyecto: ${error.message}`);
        }
    }

    /**
     * Procesa los datos estructurados del proyecto
     * (Este método ya no es necesario, la lógica está en loadProjectData)
     */
    // processStructuredData(datosProyecto) { ... }


    /**
     * Actualiza la interfaz de usuario con los datos cargados
     * MODIFICADO: IDs de categoría actualizados para coincidir con el HTML
     */
    updateUI() {
        // console.log('UI: Iniciando actualización de la interfaz de usuario...');
        
        // Actualizar contadores desde el backend
        this.updateCategoryCount('entidades-individuales', this.projectData.entidadesIndividuales.length);
        this.updateCategoryCount('entidades-colectivas', this.projectData.entidadesColectivas.length);
        this.updateCategoryCount('construcciones', this.projectData.construcciones.length);
        this.updateCategoryCount('zonas', this.projectData.zonas.length);
        this.updateCategoryCount('efectos', this.projectData.efectos.length);
        // (No hay contador/lista para 'interacciones' en el HTML, así que se omite)

        // Renderizar listas de objetos
        this.renderObjectList('entidades-individuales', this.projectData.entidadesIndividuales);
        this.renderObjectList('entidades-colectivas', this.projectData.entidadesColectivas);
        this.renderObjectList('construcciones', this.projectData.construcciones);
        this.renderObjectList('zonas', this.projectData.zonas);
        this.renderObjectList('efectos', this.projectData.efectos);

        // console.log('SUCCESS: Interfaz de usuario actualizada con datos del backend');
    }

    /**
     * Actualiza el contador de una categoría (sin cambios)
     */
    updateCategoryCount(categoryId, count) {
        const countElement = document.getElementById(`count-${categoryId}`);
        if (countElement) {
            countElement.textContent = count;
            // console.log(`COUNTER: Contador actualizado para ${categoryId}: ${count}`);
        } else {
            // console.error(`ERROR: Elemento contador no encontrado: count-${categoryId}`);
        }
    }

    /**
     * Renderiza la lista de objetos de una categoría (sin cambios)
     */
    renderObjectList(categoryId, objects) {
        const listElement = document.getElementById(`list-${categoryId}`);
        if (!listElement) {
            // console.error(`ERROR: Elemento lista no encontrado: list-${categoryId}`);
            return;
        }

        if (objects.length === 0) {
            listElement.innerHTML = '<div class="empty-category">No hay elementos</div>';
            // console.log(`EMPTY: Lista vacía renderizada para ${categoryId}`);
            return;
        }

        try {
            listElement.innerHTML = objects.map(obj => this.createObjectElement(obj, categoryId)).join('');
            // console.log(`RENDERED: Lista renderizada para ${categoryId}: ${objects.length} elementos`);
        } catch (error) {
            // console.error(`ERROR: Error renderizando lista para ${categoryId}:`, error);
            listElement.innerHTML = '<div class="error-category">Error cargando elementos</div>';
        }
    }

    /**
     * Crea un elemento HTML para un objeto arrastrable (sin cambios)
     */
    createObjectElement(obj, categoryId) {
        const icon = this.getCategoryIcon(categoryId);
        const color = this.getCategoryColor(categoryId);
        
        // Limpiamos el objeto para el data-object, quitando campos nulos
        const cleanObj = Object.fromEntries(Object.entries(obj).filter(([_, v]) => v != null));

        return `
            <div class="draggable-object" 
                 draggable="true" 
                 data-id="${obj.id}" 
                 data-type="${categoryId}"
                 data-object='${JSON.stringify(cleanObj)}'
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

    // ... (Resto de métodos de ayuda: getCategoryIcon, getCategoryDisplayName, getCategoryColor ... sin cambios) ...
    
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


    // ... (Métodos de Drag & Drop: handleDragStart, mapCategoryToNodeType, handleDragEnd, handleDragOver, handleDrop, etc. ... sin cambios) ...

    handleDragStart(event) {
        if (!event.target.classList.contains('draggable-object')) return;
        
        this.draggedElement = event.target;
        event.target.classList.add('dragging');
        
        const objectData = JSON.parse(event.target.dataset.object);
        const categoryType = event.target.dataset.type;
        
        event.dataTransfer.setData('text/plain', JSON.stringify({
            id: objectData.id,
            type: categoryType,
            object: objectData,
            nodeType: this.mapCategoryToNodeType(categoryType)
        }));
        event.dataTransfer.effectAllowed = 'copy';
        // console.log('DRAG: Iniciando drag:', objectData.nombre, 'tipo:', categoryType);
    }

    mapCategoryToNodeType(categoryId) {
        const mapping = {
            'entidades-individuales': 'entidadindividual',
            'entidades-colectivas': 'entidadcolectiva',
            'construcciones': 'construccion',
            'zonas': 'zona',
            'efectos': 'efecto'
        };
        return mapping[categoryId] || 'entidadindividual';
    }

    handleDragEnd(event) {
        if (this.draggedElement) {
            this.draggedElement.classList.remove('dragging');
            this.draggedElement = null;
        }
    }

    handleDragOver(event) {
        if (event.target.closest('#infinite-map-container') || 
            event.target.closest('.react-flow') ||
            event.target.closest('.flow-container')) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        }
    }

    async handleDrop(event) {
        event.preventDefault();
        
        if (!window.flowManager) {
            // console.warn('WARNING: FlowManager no disponible, creando marcador en el mapa');
            this.handleMapDrop(event);
            return;
        }

        try {
            const data = JSON.parse(event.dataTransfer.getData('text/plain'));
            // console.log('DROP: Drop recibido:', data);
            
            const mapContainer = event.target.closest('#infinite-map-container');
            const flowContainer = event.target.closest('.react-flow, .flow-container');
            
            if (mapContainer) {
                this.handleMapDrop(event, data);
            } else if (flowContainer) {
                this.handleFlowDrop(event, data);
            }
            
        } catch (error) {
            // console.error('ERROR: Error procesando drop:', error);
        }
    }

    handleMapDrop(event, data = null) {
        if (!data) {
            try {
                data = JSON.parse(event.dataTransfer.getData('text/plain'));
            } catch (error) {
                // console.error('ERROR: Error obteniendo datos del drop:', error);
                return;
            }
        }

        const mapContainer = event.target.closest('#infinite-map-container');
        if (!mapContainer || !this.draggedElement) return;

        const rect = mapContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        if (window.infiniteMap && window.infiniteMap.getWorldCoordinates) {
            const worldCoords = window.infiniteMap.getWorldCoordinates(x, y);
            this.addMarkerToMap(data.object, worldCoords.x, worldCoords.y);
            // console.log('MARKER: Marcador agregado al mapa:', data.object.nombre, 'en', worldCoords);
        }
    }

    async handleFlowDrop(event, data) {
        const flowContainer = event.target.closest('.react-flow, .flow-container');
        if (!flowContainer || !this.draggedElement) return;

        const rect = flowContainer.getBoundingClientRect();
        const x = event.clientX - rect.left;
        const y = event.clientY - rect.top;
        
        try {
            const newNode = await this.createFlowNode(data, x, y);
            // console.log('NODE: Nodo creado en React Flow:', newNode);
        } catch (error) {
            // console.error('ERROR: Error creando nodo en React Flow:', error);
            this.showError('Error creando nodo en el diagrama');
        }
    }

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
     * MODIFICADO: Lógica simplificada basada en los datos reales de la BD
     */
    getCategoryFromObject(object) {
        if (object.estado !== undefined) {
            return 'entidades-individuales'; // O 'entidades-colectivas', pero 'estado' está en ambas
        }
        if (object.tamanno !== undefined) {
             return 'zonas'; // O 'construcciones'
        }
        if (object.dureza !== undefined) {
            return 'efectos';
        }
        if (object.direccion !== undefined) {
            return 'interacciones';
        }
        return 'entidades-individuales'; // Por defecto
    }

    /**
     * Inicializa los contadores con 0 (sin cambios)
     */
    initializeCounters() {
        // console.log('INIT: Inicializando contadores...');
        
        const categories = [
            'entidades-individuales',
            'entidades-colectivas',
            'construcciones',
            'zonas',
            'efectos'
        ];
        
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
            // console.error('ERROR: Elementos del DOM no encontrados:', missingElements);
            return;
        }
        
        // console.log('SUCCESS: Todos los elementos del DOM están disponibles');
        
        categories.forEach(category => {
            this.updateCategoryCount(category, 0);
        });
        
        // console.log('SUCCESS: Contadores inicializados con 0');
    }

    generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    showError(message) {
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

    async reload() {
        return this.loadProjectData();
    }

    getProjectData() {
        return this.projectData;
    }
}

// Exportar para uso global
window.ProjectDataLoader = ProjectDataLoader;