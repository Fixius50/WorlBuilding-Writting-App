/**
 * ZonaNode.js - Nodo personalizado para zonas
 * Representa regiones, territorios y zonas geográficas en el mundo
 * Recibe datos del backend y se muestra como un recuadro expandible
 */

class ZonaNode {
    constructor() {
        this.type = 'zona';
        this.defaultData = {
            nombre: '',
            apellidos: '',
            tamanno: '',
            tipo: '',
            desarrollo: '',
            descripcion: ''
        };
        this.isExpanded = false;
    }

    /**
     * Renderiza el nodo de zona
     * Se muestra como un recuadro compacto que se expande al hacer click
     */
    render(node) {
        const { data } = node;
        
        // Si no hay datos del backend, usar datos por defecto
        const nodeData = this.mergeWithBackendData(data);
        
        return `
            <div class="flow-node zona-node compact" data-node-id="${node.id}" onclick="toggleNodeExpansion('${node.id}')">
                <div class="node-compact-view">
                    <div class="node-image-container">
                        <div class="node-image-placeholder">
                            <i class="fas fa-map"></i>
                        </div>
                    </div>
                    <div class="node-name-container">
                        <h4 class="node-name">${nodeData.nombre || 'Sin nombre'}</h4>
                        <span class="node-type">${nodeData.tipo || 'Región'}</span>
                    </div>
                    <div class="node-expand-indicator">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="node-expanded-content" style="display: none;">
                    <div class="node-header">
                        <div class="node-icon">
                            <img src="/Otros/imagenes/zonas.png" alt="Zona" class="node-icon-img">
                        </div>
                        <div class="node-title">
                            <h3 class="node-name">${nodeData.nombre || 'Sin nombre'}</h3>
                            <span class="node-type">${nodeData.tipo || 'Región'}</span>
                        </div>
                        <div class="node-actions">
                            <button class="node-action-btn edit-btn" onclick="editNode('${node.id}')">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="node-action-btn delete-btn" onclick="deleteNode('${node.id}')">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                    
                    <div class="node-content">
                        <div class="node-section">
                            <label class="node-label">Alias:</label>
                            <span class="node-value">${nodeData.apellidos || 'N/A'}</span>
                        </div>
                        
                        <div class="node-section">
                            <label class="node-label">Tamaño:</label>
                            <span class="node-value">${nodeData.tamanno || 'N/A'}</span>
                        </div>
                        
                        <div class="node-section">
                            <label class="node-label">Desarrollo:</label>
                            <span class="node-value">${nodeData.desarrollo || 'N/A'}</span>
                        </div>
                        
                        <div class="node-section description">
                            <label class="node-label">Descripción:</label>
                            <p class="node-description">${nodeData.descripcion || 'Sin descripción'}</p>
                        </div>
                    </div>
                    
                    <div class="node-footer">
                        <div class="node-connections">
                            <span class="connection-count">${this.getConnectionCount(node.id)} conexiones</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Combina los datos del nodo con los datos del backend
     */
    mergeWithBackendData(nodeData) {
        // Si el nodo ya tiene datos del backend, usarlos
        if (nodeData.backendData) {
            return {
                ...this.defaultData,
                ...nodeData.backendData
            };
        }
        
        // Si no, usar los datos del nodo o por defecto
        return {
            ...this.defaultData,
            ...nodeData
        };
    }

    /**
     * Carga los datos del backend para este nodo
     * @param {string} nodeId - ID del nodo
     * @param {string} entityId - ID de la entidad en la base de datos
     */
    async loadBackendData(nodeId, entityId) {
        try {
            const response = await fetch('/api/proyectos/datos-proyecto');
            if (!response.ok) {
                throw new Error('Error obteniendo datos del proyecto');
            }
            
            const datosProyecto = await response.json();
            const zonas = datosProyecto.tablas.zona || [];
            
            // Buscar la zona específica por ID o nombre
            const zona = zonas.find(z => 
                z.id === entityId || z.nombre === entityId || z.nombre === this.getNodeName(nodeId)
            );
            
            if (zona) {
                // Actualizar el nodo con los datos del backend
                this.updateNodeWithBackendData(nodeId, zona);
                return zona;
            }
            
            return null;
        } catch (error) {
            console.error('Error cargando datos del backend:', error);
            return null;
        }
    }

    /**
     * Actualiza el nodo con datos del backend
     */
    updateNodeWithBackendData(nodeId, backendData) {
        const flowManager = window.flowManager;
        if (!flowManager) return;
        
        const nodes = flowManager.getNodes();
        const nodeIndex = nodes.findIndex(n => n.id === nodeId);
        
        if (nodeIndex !== -1) {
            nodes[nodeIndex].data = {
                ...nodes[nodeIndex].data,
                backendData: backendData
            };
            
            // Forzar re-renderizado del nodo
            flowManager.updateNode(nodeId, nodes[nodeIndex].data);
        }
    }

    /**
     * Obtiene el nombre del nodo
     */
    getNodeName(nodeId) {
        const flowManager = window.flowManager;
        if (!flowManager) return '';
        
        const nodes = flowManager.getNodes();
        const node = nodes.find(n => n.id === nodeId);
        return node ? (node.data.nombre || node.data.backendData?.nombre || '') : '';
    }

    /**
     * Obtiene el número de conexiones del nodo
     */
    getConnectionCount(nodeId) {
        const flowManager = window.flowManager;
        if (!flowManager) return 0;
        
        const edges = flowManager.getEdges();
        return edges.filter(edge => edge.source === nodeId || edge.target === nodeId).length;
    }

    /**
     * Formatea los datos para enviar al backend
     */
    formatDataForBackend(data) {
        return {
            nombre: data.nombre,
            apellidos: data.apellidos || '',
            tamanno: data.tamanno || '',
            tipo: data.tipo,
            desarrollo: data.desarrollo || '',
            descripcion: data.descripcion || '',
            tipoTabla: 'zonas',
            valoresExtraTabla: [
                'Zona',
                data.tamanno || '',
                data.desarrollo || ''
            ]
        };
    }

    /**
     * Obtiene el formulario de edición
     */
    getEditForm(nodeId) {
        const flowManager = window.flowManager;
        const nodes = flowManager.getNodes();
        const node = nodes.find(n => n.id === nodeId);
        
        if (!node) return '';
        
        const { data } = node;
        const nodeData = this.mergeWithBackendData(data);
        
        return `
            <div class="edit-form zona-form">
                <h3>Editar Zona</h3>
                
                <div class="form-group">
                    <label for="nombre-${nodeId}">Nombre *</label>
                    <input type="text" id="nombre-${nodeId}" value="${nodeData.nombre || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="apellidos-${nodeId}">Alias</label>
                    <input type="text" id="apellidos-${nodeId}" value="${nodeData.apellidos || ''}">
                </div>
                
                <div class="form-group">
                    <label for="tamanno-${nodeId}">Tamaño</label>
                    <input type="text" id="tamanno-${nodeId}" value="${nodeData.tamanno || ''}">
                </div>
                
                <div class="form-group">
                    <label for="tipo-${nodeId}">Tipo *</label>
                    <select id="tipo-${nodeId}" required>
                        <option value="Región" ${nodeData.tipo === 'Región' ? 'selected' : ''}>Región</option>
                        <option value="Ciudad" ${nodeData.tipo === 'Ciudad' ? 'selected' : ''}>Ciudad</option>
                        <option value="Bosque" ${nodeData.tipo === 'Bosque' ? 'selected' : ''}>Bosque</option>
                        <option value="Montaña" ${nodeData.tipo === 'Montaña' ? 'selected' : ''}>Montaña</option>
                        <option value="Desierto" ${nodeData.tipo === 'Desierto' ? 'selected' : ''}>Desierto</option>
                        <option value="Mar" ${nodeData.tipo === 'Mar' ? 'selected' : ''}>Mar</option>
                        <option value="Isla" ${nodeData.tipo === 'Isla' ? 'selected' : ''}>Isla</option>
                        <option value="Otro" ${nodeData.tipo === 'Otro' ? 'selected' : ''}>Otro</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="desarrollo-${nodeId}">Desarrollo</label>
                    <input type="text" id="desarrollo-${nodeId}" value="${nodeData.desarrollo || ''}">
                </div>
                
                <div class="form-group">
                    <label for="descripcion-${nodeId}">Descripción</label>
                    <textarea id="descripcion-${nodeId}">${nodeData.descripcion || ''}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" onclick="saveNodeEdit('${nodeId}')" class="btn btn-primary">Guardar</button>
                    <button type="button" onclick="cancelNodeEdit()" class="btn btn-secondary">Cancelar</button>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene el formulario de creación
     */
    getCreateForm() {
        return `
            <div class="create-form zona-form">
                <h3>Crear Nueva Zona</h3>
                
                <div class="form-group">
                    <label for="nombre-new">Nombre *</label>
                    <input type="text" id="nombre-new" required>
                </div>
                
                <div class="form-group">
                    <label for="apellidos-new">Alias</label>
                    <input type="text" id="apellidos-new">
                </div>
                
                <div class="form-group">
                    <label for="tamanno-new">Tamaño</label>
                    <input type="text" id="tamanno-new">
                </div>
                
                <div class="form-group">
                    <label for="tipo-new">Tipo *</label>
                    <select id="tipo-new" required>
                        <option value="">Seleccionar tipo</option>
                        <option value="Región">Región</option>
                        <option value="Ciudad">Ciudad</option>
                        <option value="Bosque">Bosque</option>
                        <option value="Montaña">Montaña</option>
                        <option value="Desierto">Desierto</option>
                        <option value="Mar">Mar</option>
                        <option value="Isla">Isla</option>
                        <option value="Otro">Otro</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="desarrollo-new">Desarrollo</label>
                    <input type="text" id="desarrollo-new">
                </div>
                
                <div class="form-group">
                    <label for="descripcion-new">Descripción</label>
                    <textarea id="descripcion-new"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" onclick="createNewNode('zona')" class="btn btn-primary">Crear</button>
                    <button type="button" onclick="cancelCreateNode()" class="btn btn-secondary">Cancelar</button>
                </div>
            </div>
        `;
    }
}

// Función global para alternar la expansión del nodo
window.toggleNodeExpansion = function(nodeId) {
    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeElement) return;
    
    const compactView = nodeElement.querySelector('.node-compact-view');
    const expandedContent = nodeElement.querySelector('.node-expanded-content');
    const expandIndicator = nodeElement.querySelector('.node-expand-indicator i');
    
    if (expandedContent.style.display === 'none') {
        // Expandir
        expandedContent.style.display = 'block';
        nodeElement.classList.remove('compact');
        expandIndicator.className = 'fas fa-chevron-up';
        
        // Cargar datos del backend si no están cargados
        const flowManager = window.flowManager;
        if (flowManager) {
            const nodes = flowManager.getNodes();
            const node = nodes.find(n => n.id === nodeId);
            if (node && !node.data.backendData) {
                const zonaNode = new ZonaNode();
                zonaNode.loadBackendData(nodeId, node.data.nombre);
            }
        }
    } else {
        // Contraer
        expandedContent.style.display = 'none';
        nodeElement.classList.add('compact');
        expandIndicator.className = 'fas fa-chevron-down';
    }
};

// Exportar para uso global
window.ZonaNode = ZonaNode;
