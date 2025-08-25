/**
 * EntidadIndividualNode.js - Nodo personalizado para entidades individuales
 * Representa personajes, NPCs y entidades individuales en el mundo
 * Ahora recibe datos del backend y se muestra como un recuadro expandible
 */

class EntidadIndividualNode {
    constructor() {
        this.type = 'entidad-individual';
        this.defaultData = {
            nombre: '',
            apellidos: '',
            tipo: 'Personaje',
            descripcion: '',
            estado: 'Vivo',
            origen: '',
            comportamiento: ''
        };
        this.isExpanded = false;
    }

    /**
     * Renderiza el nodo de entidad individual
     * Ahora se muestra como un recuadro compacto que se expande al hacer click
     */
    render(node) {
        const { data } = node;
        
        // Si no hay datos del backend, usar datos por defecto
        const nodeData = this.mergeWithBackendData(data);
        
        return `
            <div class="flow-node entidad-individual-node compact" data-node-id="${node.id}" onclick="toggleNodeExpansion('${node.id}')">
                <div class="node-compact-view">
                    <div class="node-image-container">
                        <div class="node-image-placeholder">
                            <i class="fas fa-user"></i>
                        </div>
                    </div>
                    <div class="node-name-container">
                        <h4 class="node-name">${nodeData.nombre || 'Sin nombre'}</h4>
                        <span class="node-type">${nodeData.tipo || 'Personaje'}</span>
                    </div>
                    <div class="node-expand-indicator">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                
                <div class="node-expanded-content" style="display: none;">
                    <div class="node-header">
                        <div class="node-icon">
                            <img src="/Otros/imagenes/mage.png" alt="Personaje" class="node-icon-img">
                        </div>
                        <div class="node-title">
                            <h3 class="node-name">${nodeData.nombre || 'Sin nombre'}</h3>
                            <span class="node-type">${nodeData.tipo || 'Personaje'}</span>
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
                            <label class="node-label">Apellidos:</label>
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
            const entidadesIndividuales = datosProyecto.tablas.entidadIndividual || [];
            
            // Buscar la entidad específica por ID o nombre
            const entidad = entidadesIndividuales.find(e => 
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
            'Vivo': 'status-alive',
            'Muerto': 'status-dead',
            'Desaparecido': 'status-missing',
            'Herido': 'status-injured',
            'Enfermo': 'status-sick'
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
     * Formatea los datos para enviar al backend
     */
    formatDataForBackend(data) {
        return {
            nombre: data.nombre,
            apellidos: data.apellidos || '',
            tipo: data.tipo,
            descripcion: data.descripcion || '',
            tipoTabla: 'entidades_individuales',
            valoresExtraTabla: [
                'Entidad-Individual',
                data.estado || '',
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
            <div class="edit-form entidad-individual-form">
                <h3>Editar Personaje</h3>
                
                <div class="form-group">
                    <label for="nombre-${nodeId}">Nombre *</label>
                    <input type="text" id="nombre-${nodeId}" value="${nodeData.nombre || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="apellidos-${nodeId}">Apellidos</label>
                    <input type="text" id="apellidos-${nodeId}" value="${nodeData.apellidos || ''}">
                </div>
                
                <div class="form-group">
                    <label for="tipo-${nodeId}">Tipo *</label>
                    <select id="tipo-${nodeId}" required>
                        <option value="Personaje" ${nodeData.tipo === 'Personaje' ? 'selected' : ''}>Personaje</option>
                        <option value="NPC" ${nodeData.tipo === 'NPC' ? 'selected' : ''}>NPC</option>
                        <option value="Antagonista" ${nodeData.tipo === 'Antagonista' ? 'selected' : ''}>Antagonista</option>
                        <option value="Protagonista" ${nodeData.tipo === 'Protagonista' ? 'selected' : ''}>Protagonista</option>
                        <option value="Secundario" ${nodeData.tipo === 'Secundario' ? 'selected' : ''}>Secundario</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="estado-${nodeId}">Estado</label>
                    <select id="estado-${nodeId}">
                        <option value="Vivo" ${nodeData.estado === 'Vivo' ? 'selected' : ''}>Vivo</option>
                        <option value="Muerto" ${nodeData.tipo === 'Muerto' ? 'selected' : ''}>Muerto</option>
                        <option value="Desaparecido" ${nodeData.estado === 'Desaparecido' ? 'selected' : ''}>Desaparecido</option>
                        <option value="Herido" ${nodeData.estado === 'Herido' ? 'selected' : ''}>Herido</option>
                        <option value="Enfermo" ${nodeData.estado === 'Enfermo' ? 'selected' : ''}>Enfermo</option>
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
            <div class="create-form entidad-individual-form">
                <h3>Crear Nuevo Personaje</h3>
                
                <div class="form-group">
                    <label for="nombre-new">Nombre *</label>
                    <input type="text" id="nombre-new" required>
                </div>
                
                <div class="form-group">
                    <label for="apellidos-new">Apellidos</label>
                    <input type="text" id="apellidos-new">
                </div>
                
                <div class="form-group">
                    <label for="tipo-new">Tipo *</label>
                    <select id="tipo-new" required>
                        <option value="">Seleccionar tipo</option>
                        <option value="Personaje">Personaje</option>
                        <option value="NPC">NPC</option>
                        <option value="Antagonista">Antagonista</option>
                        <option value="Protagonista">Protagonista</option>
                        <option value="Secundario">Secundario</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="estado-new">Estado</label>
                    <select id="estado-new">
                        <option value="Vivo">Vivo</option>
                        <option value="Muerto">Muerto</option>
                        <option value="Desaparecido">Desaparecido</option>
                        <option value="Herido">Herido</option>
                        <option value="Enfermo">Enfermo</option>
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
                    <button type="button" onclick="createNewNode('entidad-individual')" class="btn btn-primary">Crear</button>
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
                const entidadIndividualNode = new EntidadIndividualNode();
                entidadIndividualNode.loadBackendData(nodeId, node.data.nombre);
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
window.EntidadIndividualNode = EntidadIndividualNode;