/**
 * ProjectDataLoader.js - Cargador de datos del proyecto desde la base de datos
 * Maneja la carga de entidades y el drag & drop al mapa
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
                tamanno: row.tamanno || '',
                desarrollo: row.desarrollo || ''
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
     * Parsea el contenido SQL para extraer las entidades (método legacy)
     */
    parseSQLContent(sqlContent) {
        // Limpiar datos anteriores
        this.projectData = {
            entidadesIndividuales: [],
            entidadesColectivas: [],
            construcciones: [],
            zonas: [],
            efectos: []
        };

        // Buscar INSERT statements para cada tipo de tabla
        this.extractEntities(sqlContent, 'entidades_individuales', 'entidadesIndividuales');
        this.extractEntities(sqlContent, 'entidades_colectivas', 'entidadesColectivas');
        this.extractEntities(sqlContent, 'construcciones', 'construcciones');
        this.extractEntities(sqlContent, 'zonas', 'zonas');
        this.extractEntities(sqlContent, 'efectos', 'efectos');
    }

    /**
     * Extrae entidades de un tipo específico del SQL
     */
    extractEntities(sqlContent, tableName, dataKey) {
        const regex = new RegExp(`INSERT INTO ${tableName} \\(.*?\\) VALUES \\((.*?)\\);`, 'g');
        let match;

        while ((match = regex.exec(sqlContent)) !== null) {
            const values = this.parseSQLValues(match[1]);
            if (values.length >= 5) {
                const entity = {
                    id: values[0] || this.generateId(),
                    nombre: values[1] || '',
                    apellidos: values[2] || '',
                    tipo: values[3] || '',
                    descripcion: values[4] || '',
                    ...this.extractExtraFields(tableName, values)
                };
                
                this.projectData[dataKey].push(entity);
            }
        }
    }

    /**
     * Parsea los valores de una sentencia SQL INSERT
     */
    parseSQLValues(valuesString) {
        // Dividir por comas, pero respetando las comillas
        const values = [];
        let current = '';
        let inQuotes = false;
        let escapeNext = false;

        for (let i = 0; i < valuesString.length; i++) {
            const char = valuesString[i];
            
            if (escapeNext) {
                current += char;
                escapeNext = false;
                continue;
            }

            if (char === '\\') {
                escapeNext = true;
                continue;
            }

            if (char === "'") {
                inQuotes = !inQuotes;
                continue;
            }

            if (char === ',' && !inQuotes) {
                values.push(current.trim());
                current = '';
                continue;
            }

            current += char;
        }

        // Agregar el último valor
        if (current.trim()) {
            values.push(current.trim());
        }

        return values;
    }

    /**
     * Extrae campos adicionales según el tipo de tabla
     */
    extractExtraFields(tableName, values) {
        const extraFields = {};
        
        switch (tableName) {
            case 'entidades_individuales':
            case 'entidades_colectivas':
                if (values[5]) extraFields.estado = values[5];
                if (values[6]) extraFields.origen = values[6];
                if (values[7]) extraFields.comportamiento = values[7];
                break;
            case 'construcciones':
                if (values[5]) extraFields.tamanno = values[5];
                if (values[6]) extraFields.desarrollo = values[6];
                break;
            case 'zonas':
                if (values[5]) extraFields.tamanno = values[5];
                if (values[6]) extraFields.desarrollo = values[6];
                break;
            case 'efectos':
                if (values[5]) extraFields.origen = values[5];
                if (values[6]) extraFields.dureza = values[6];
                if (values[7]) extraFields.comportamiento = values[7];
                break;
        }
        
        return extraFields;
    }

    /**
     * Actualiza la interfaz de usuario con los datos cargados
     */
    updateUI() {
        this.updateCategoryCount('entidades-individuales', this.projectData.entidadesIndividuales.length);
        this.updateCategoryCount('entidades-colectivas', this.projectData.entidadesColectivas.length);
        this.updateCategoryCount('construcciones', this.projectData.construcciones.length);
        this.updateCategoryCount('zonas', this.projectData.zonas.length);
        this.updateCategoryCount('efectos', this.projectData.efectos.length);

        this.renderObjectList('entidades-individuales', this.projectData.entidadesIndividuales);
        this.renderObjectList('entidades-colectivas', this.projectData.entidadesColectivas);
        this.renderObjectList('construcciones', this.projectData.construcciones);
        this.renderObjectList('zonas', this.projectData.zonas);
        this.renderObjectList('efectos', this.projectData.efectos);
    }

    /**
     * Actualiza el contador de una categoría
     */
    updateCategoryCount(categoryId, count) {
        const countElement = document.getElementById(`count-${categoryId}`);
        if (countElement) {
            countElement.textContent = count;
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
    }

    /**
     * Crea un elemento HTML para un objeto
     */
    createObjectElement(obj, categoryId) {
        const icon = this.getCategoryIcon(categoryId);
        const color = this.getCategoryColor(categoryId);
        
        return `
            <div class="draggable-object" 
                 draggable="true" 
                 data-id="${obj.id}" 
                 data-type="${categoryId}"
                 data-object='${JSON.stringify(obj)}'>
                <div class="object-icon" style="background-color: ${color}">
                    ${icon}
                </div>
                <div class="object-info">
                    <div class="object-name">${obj.nombre}</div>
                    <div class="object-type">${obj.tipo}</div>
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
            'entidades-colectivas': '🏛️',
            'construcciones': '🏰',
            'zonas': '🗺️',
            'efectos': '✨'
        };
        return icons[categoryId] || '📦';
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
        event.dataTransfer.setData('text/plain', JSON.stringify({
            id: objectData.id,
            type: event.target.dataset.type,
            object: objectData
        }));
        
        event.dataTransfer.effectAllowed = 'copy';
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
        if (event.target.closest('#infinite-map-container')) {
            event.preventDefault();
            event.dataTransfer.dropEffect = 'copy';
        }
    }

    /**
     * Maneja el drop
     */
    handleDrop(event) {
        event.preventDefault();
        
        const mapContainer = event.target.closest('#infinite-map-container');
        if (!mapContainer || !this.draggedElement) return;

        try {
            const data = JSON.parse(event.dataTransfer.getData('text/plain'));
            const rect = mapContainer.getBoundingClientRect();
            const x = event.clientX - rect.left;
            const y = event.clientY - rect.top;
            
            // Convertir coordenadas de pantalla a coordenadas del mundo
            const worldCoords = window.infiniteMap.getWorldCoordinates(x, y);
            
            // Agregar marcador al mapa
            this.addMarkerToMap(data.object, worldCoords.x, worldCoords.y);
            
            console.log('📍 Marcador agregado:', data.object.nombre, 'en', worldCoords);
            
        } catch (error) {
            console.error('Error procesando drop:', error);
        }
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
