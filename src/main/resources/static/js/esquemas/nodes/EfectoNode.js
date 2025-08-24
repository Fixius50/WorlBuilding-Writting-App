/**
 * EfectoNode.js - Nodo personalizado para efectos
 * Representa efectos mágicos, habilidades y poderes en el mundo
 * Recibe datos del backend y se muestra como un recuadro expandible
 */

class EfectoNode {
    constructor() {
        this.type = 'efecto';
        this.defaultData = {
            nombre: '',
            apellidos: '',
            origen: '',
            dureza: '',
            comportamiento: '',
            descripcion: ''
        };
        this.isExpanded = false;
    }

    /**
     * Renderiza el nodo de efecto
     * Se muestra como un recuadro compacto que se expande al hacer click
     */
    render(node) {
        const { data } = node;
        
        // Si no hay datos del backend, usar datos por defecto
        const nodeData = this.mergeWithBackendData(data);
        
        return `
            <div class="flow-node efecto-node compact" data-node-id="${node.id}" onclick="toggleNodeExpansion('${node.id}')">
                <div class="node-compact-view">
                    <div class="node-image-container">
                        <div class="node-image-placeholder">
                            <i class="fas fa-magic"></i>
                        </div>
                    </div>
                    <div class="node-name-container">
                        <h4 class="node-name">${nodeData.nombre || 'Sin nombre'}</h4>
                        <span class="node-type">Efecto</span>
                    </div>
                    <div class="node-expand-indicator">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="node-expanded-content" style="display: none;">
                    <div class="node-header">
                        <div class="node-icon">
                            <img src="/Otros/imagenes/magia.png" alt="Efecto" class="node-icon-img">
                        </div>
                        <div class="node-title">
                            <h3 class="node-name">${nodeData.nombre || 'Sin nombre'}</h3>
                            <span class="node-type">Efecto</span>
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
                            <label class="node-label">Origen:</label>
                            <span class="node-value">${nodeData.origen || 'N/A'}</span>
                        </div>
                        
                        <div class="node-section">
                            <label class="node-label">Dureza:</label>
                            <span class="node-value">${nodeData.dureza || 'N/A'}</span>
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
            const efectos = datosProyecto.tablas.efectos || [];
            
            // Buscar el efecto específico por ID o nombre
            const efecto = efectos.find(e => 
                e.id === entityId || e.nombre === entityId || e.nombre === this.getNodeName(nodeId)
            );
            
            if (efecto) {
                // Actualizar el nodo con los datos del backend
                this.updateNodeWithBackendData(nodeId, efecto);
                return efecto;
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
            origen: data.origen || '',
            dureza: data.dureza || '',
            comportamiento: data.comportamiento || '',
            descripcion: data.descripcion || '',
            tipoTabla: 'efectos',
            valoresExtraTabla: [
                'Efecto',
                data.origen || '',
                data.dureza || '',
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
            <div class="edit-form efecto-form">
                <h3>Editar Efecto</h3>
                
                <div class="form-group">
                    <label for="nombre-${nodeId}">Nombre *</label>
                    <input type="text" id="nombre-${nodeId}" value="${nodeData.nombre || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="apellidos-${nodeId}">Alias</label>
                    <input type="text" id="apellidos-${nodeId}" value="${nodeData.apellidos || ''}">
                </div>
                
                <div class="form-group">
                    <label for="origen-${nodeId}">Origen</label>
                    <input type="text" id="origen-${nodeId}" value="${nodeData.origen || ''}">
                </div>
                
                <div class="form-group">
                    <label for="dureza-${nodeId}">Dureza</label>
                    <input type="text" id="dureza-${nodeId}" value="${nodeData.dureza || ''}">
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
            <div class="create-form efecto-form">
                <h3>Crear Nuevo Efecto</h3>
                
                <div class="form-group">
                    <label for="nombre-new">Nombre *</label>
                    <input type="text" id="nombre-new" required>
                </div>
                
                <div class="form-group">
                    <label for="apellidos-new">Alias</label>
                    <input type="text" id="apellidos-new">
                </div>
                
                <div class="form-group">
                    <label for="origen-new">Origen</label>
                    <input type="text" id="origen-new">
                </div>
                
                <div class="form-group">
                    <label for="dureza-new">Dureza</label>
                    <input type="text" id="dureza-new">
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
                    <button type="button" onclick="createNewNode('efecto')" class="btn btn-primary">Crear</button>
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
                const efectoNode = new EfectoNode();
                efectoNode.loadBackendData(nodeId, node.data.nombre);
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
window.EfectoNode = EfectoNode;
