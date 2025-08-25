/**
 * EntidadColectivaNode.js - Nodo personalizado para entidades colectivas
 * Representa organizaciones, grupos, facciones y entidades colectivas en el mundo
 * Ahora recibe datos del backend y se muestra como un recuadro expandible
 */

class EntidadColectivaNode {
    constructor() {
        this.type = 'entidad-colectiva';
        this.defaultData = {
            nombre: '',
            apellidos: '',
            tipo: 'Organización',
            descripcion: '',
            estado: 'Activa',
            origen: '',
            comportamiento: ''
        };
        this.isExpanded = false;
    }

    /**
     * Renderiza el nodo de entidad colectiva
     * Ahora se muestra como un recuadro compacto que se expande al hacer click
     */
    render(node) {
        const { data } = node;
        
        // Si no hay datos del backend, usar datos por defecto
        const nodeData = this.mergeWithBackendData(data);
        
        return `
            <div class="flow-node entidad-colectiva-node compact" data-node-id="${node.id}" onclick="toggleNodeExpansion('${node.id}')">
                <div class="node-compact-view">
                    <div class="node-image-container">
                        <div class="node-image-placeholder">
                            <i class="fas fa-users"></i>
                        </div>
                    </div>
                    <div class="node-name-container">
                        <h4 class="node-name">${nodeData.nombre || 'Sin nombre'}</h4>
                        <span class="node-type">${nodeData.tipo || 'Organización'}</span>
                    </div>
                    <div class="node-expand-indicator">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="node-expanded-content" style="display: none;">
                    <div class="node-header">
                        <div class="node-icon">
                            <img src="/Otros/imagenes/colectivas.jpg" alt="Organización" class="node-icon-img">
                        </div>
                        <div class="node-title">
                            <h3 class="node-name">${nodeData.nombre || 'Sin nombre'}</h3>
                            <span class="node-type">${nodeData.tipo || 'Organización'}</span>
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
                            <label class="node-label">Estado:</label>
                            <span class="node-status ${this.getStatusClass(nodeData.estado)}">${nodeData.estado || 'Desconocido'}</span>
                        </div>
                        
                        <div class="node-section">
                            <label class="node-label">Origen:</label>
                            <span class="node-value">${nodeData.origen || 'N/A'}</span>
                        </div>
                        
                        <div class="node-section">
                            <label class="node-label">Comportamiento:</label>
                            <span class="node-value">${nodeData.comportamiento || 'N/A'}</span>
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
            const entidadesColectivas = datosProyecto.tablas.entidadColectiva || [];
            
            // Buscar la entidad específica por ID o nombre
            const entidad = entidadesColectivas.find(e => 
                e.id === entityId || e.nombre === entityId || e.nombre === this.getNodeName(nodeId)
            );
            
            if (entidad) {
                // Actualizar el nodo con los datos del backend
                this.updateNodeWithBackendData(nodeId, entidad);
                return entidad;
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
     * Obtiene la clase CSS para el estado
     */
    getStatusClass(estado) {
        const statusClasses = {
            'Activa': 'status-active',
            'Inactiva': 'status-inactive',
            'Disuelta': 'status-dissolved',
            'En guerra': 'status-war',
            'En paz': 'status-peace',
            'Secretamente activa': 'status-secret'
        };
        return statusClasses[estado] || 'status-unknown';
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
     * Valida los datos del nodo
     */
    validateData(data) {
        const errors = [];
        
        if (!data.nombre || data.nombre.trim() === '') {
            errors.push('El nombre es obligatorio');
        }
        
        if (!data.tipo || data.tipo.trim() === '') {
            errors.push('El tipo es obligatorio');
        }
        
        return errors;
    }

    /**
     * Formatea los datos para enviar al backend
     */
    formatDataForBackend(data) {
        return {
            nombre: data.nombre,
            apellidos: data.apellidos || '',
            tipo: data.tipo,
            descripcion: data.descripcion || '',
            tipoTabla: 'entidades_colectivas',
            valoresExtraTabla: [
                'Entidad-Colectiva',
                data.estado || 'Activa',
                data.origen || '',
                data.comportamiento || ''
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
            <div class="edit-form entidad-colectiva-form">
                <h3>Editar Organización</h3>
                
                <div class="form-group">
                    <label for="nombre-${nodeId}">Nombre *</label>
                    <input type="text" id="nombre-${nodeId}" value="${nodeData.nombre || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="apellidos-${nodeId}">Alias</label>
                    <input type="text" id="apellidos-${nodeId}" value="${nodeData.apellidos || ''}">
                </div>
                
                <div class="form-group">
                    <label for="tipo-${nodeId}">Tipo *</label>
                    <select id="tipo-${nodeId}" required>
                        <option value="Organización" ${nodeData.tipo === 'Organización' ? 'selected' : ''}>Organización</option>
                        <option value="Gremio" ${nodeData.tipo === 'Gremio' ? 'selected' : ''}>Gremio</option>
                        <option value="Gobierno" ${nodeData.tipo === 'Gobierno' ? 'selected' : ''}>Gobierno</option>
                        <option value="Facción" ${nodeData.tipo === 'Facción' ? 'selected' : ''}>Facción</option>
                        <option value="Ejército" ${nodeData.tipo === 'Ejército' ? 'selected' : ''}>Ejército</option>
                        <option value="Orden" ${nodeData.tipo === 'Orden' ? 'selected' : ''}>Orden</option>
                        <option value="Culto" ${nodeData.tipo === 'Culto' ? 'selected' : ''}>Culto</option>
                        <option value="Familia" ${nodeData.tipo === 'Familia' ? 'selected' : ''}>Familia</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="estado-${nodeId}">Estado</label>
                    <select id="estado-${nodeId}">
                        <option value="Activa" ${nodeData.estado === 'Activa' ? 'selected' : ''}>Activa</option>
                        <option value="Inactiva" ${nodeData.estado === 'Inactiva' ? 'selected' : ''}>Inactiva</option>
                        <option value="Disuelta" ${nodeData.estado === 'Disuelta' ? 'selected' : ''}>Disuelta</option>
                        <option value="En guerra" ${nodeData.tipo === 'En guerra' ? 'selected' : ''}>En guerra</option>
                        <option value="En paz" ${nodeData.estado === 'En paz' ? 'selected' : ''}>En paz</option>
                        <option value="Secretamente activa" ${nodeData.estado === 'Secretamente activa' ? 'selected' : ''}>Secretamente activa</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="origen-${nodeId}">Origen</label>
                    <input type="text" id="origen-${nodeId}" value="${nodeData.origen || ''}">
                </div>
                
                <div class="form-group">
                    <label for="comportamiento-${nodeId}">Comportamiento</label>
                    <textarea id="comportamiento-${nodeId}">${nodeData.comportamiento || ''}</textarea>
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
            <div class="create-form entidad-colectiva-form">
                <h3>Crear Nueva Organización</h3>
                
                <div class="form-group">
                    <label for="nombre-new">Nombre *</label>
                    <input type="text" id="nombre-new" required>
                </div>
                
                <div class="form-group">
                    <label for="apellidos-new">Alias</label>
                    <input type="text" id="apellidos-new">
                </div>
                
                <div class="form-group">
                    <label for="tipo-new">Tipo *</label>
                    <select id="tipo-new" required>
                        <option value="">Seleccionar tipo</option>
                        <option value="Organización">Organización</option>
                        <option value="Gremio">Gremio</option>
                        <option value="Gobierno">Gobierno</option>
                        <option value="Facción">Facción</option>
                        <option value="Ejército">Ejército</option>
                        <option value="Orden">Orden</option>
                        <option value="Culto">Culto</option>
                        <option value="Familia">Familia</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="estado-new">Estado</label>
                    <select id="estado-new">
                        <option value="Activa">Activa</option>
                        <option value="Inactiva">Inactiva</option>
                        <option value="Disuelta">Disuelta</option>
                        <option value="En guerra">En guerra</option>
                        <option value="En paz">En paz</option>
                        <option value="Secretamente activa">Secretamente activa</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="origen-new">Origen</label>
                    <input type="text" id="origen-new">
                </div>
                
                <div class="form-group">
                    <label for="comportamiento-new">Comportamiento</label>
                    <textarea id="comportamiento-new"></textarea>
                </div>
                
                <div class="form-group">
                    <label for="descripcion-new">Descripción</label>
                    <textarea id="descripcion-new"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" onclick="createNewNode('entidad-colectiva')" class="btn btn-primary">Crear</button>
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
        expandIndicator.className = 'fas fa-chevron-down';
        
        // Cargar datos del backend si no están cargados
        const flowManager = window.flowManager;
        if (flowManager) {
            const nodes = flowManager.getNodes();
            const node = nodes.find(n => n.id === nodeId);
            if (node && !node.data.backendData) {
                const entidadColectivaNode = new EntidadColectivaNode();
                entidadColectivaNode.loadBackendData(nodeId, node.data.nombre);
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
window.EntidadColectivaNode = EntidadColectivaNode;
