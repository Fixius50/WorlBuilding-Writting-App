/**
 * EntidadIndividualNode.js - Nodo personalizado para entidades individuales
 * Representa personajes, seres únicos, etc.
 */

class EntidadIndividualNode {
    constructor() {
        this.type = 'entidadIndividual';
        this.defaultData = {
            nombre: '',
            alias: '',
            especie: '',
            origen: '',
            descripcion: ''
        };
        this.isExpanded = false;
    }

    render(node) {
        const { data } = node;
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
                        <span class="node-type">Entidad Individual</span>
                    </div>
                    <div class="node-expand-indicator">
                        <i class="fas fa-chevron-down"></i>
                    </div>
                </div>
                <div class="node-expanded-content" style="display: none;">
                    <div class="node-header">
                        <div class="node-icon">
                            <img src="/Otros/imagenes/personaje.png" alt="Entidad" class="node-icon-img">
                        </div>
                        <div class="node-title">
                            <h3 class="node-name">${nodeData.nombre || 'Sin nombre'}</h3>
                            <span class="node-type">Entidad Individual</span>
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
                            <span class="node-value">${nodeData.alias || 'N/A'}</span>
                        </div>
                        <div class="node-section">
                            <label class="node-label">Especie:</label>
                            <span class="node-value">${nodeData.especie || 'N/A'}</span>
                        </div>
                        <div class="node-section">
                            <label class="node-label">Origen:</label>
                            <span class="node-value">${nodeData.origen || 'N/A'}</span>
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

    mergeWithBackendData(nodeData) {
        if (nodeData.backendData) {
            return {
                ...this.defaultData,
                ...nodeData.backendData
            };
        }
        return {
            ...this.defaultData,
            ...nodeData
        };
    }

    async loadBackendData(nodeId, entityId) {
        try {
            const response = await fetch('/api/proyectos/datos-proyecto');
            if (!response.ok) throw new Error('Error obteniendo datos del proyecto');
            const datosProyecto = await response.json();
            const entidades = datosProyecto.tablas.entidadesIndividuales || [];
            const entidad = entidades.find(e =>
                e.id === entityId || e.nombre === entityId || e.nombre === this.getNodeName(nodeId)
            );
            if (entidad) {
                this.updateNodeWithBackendData(nodeId, entidad);
                return entidad;
            }
            return null;
        } catch (error) {
            console.error('Error cargando datos del backend:', error);
            return null;
        }
    }

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
            flowManager.updateNode(nodeId, nodes[nodeIndex].data);
        }
    }

    getNodeName(nodeId) {
        const flowManager = window.flowManager;
        if (!flowManager) return '';
        const nodes = flowManager.getNodes();
        const node = nodes.find(n => n.id === nodeId);
        return node ? (node.data.nombre || node.data.backendData?.nombre || '') : '';
    }

    getConnectionCount(nodeId) {
        const flowManager = window.flowManager;
        if (!flowManager) return 0;
        const edges = flowManager.getEdges();
        return edges.filter(edge => edge.source === nodeId || edge.target === nodeId).length;
    }

    formatDataForBackend(data) {
        return {
            nombre: data.nombre,
            alias: data.alias || '',
            especie: data.especie || '',
            origen: data.origen || '',
            descripcion: data.descripcion || '',
            tipoTabla: 'entidadesIndividuales',
            valoresExtraTabla: [
                'EntidadIndividual',
                data.especie || '',
                data.origen || ''
            ]
        };
    }

    getEditForm(nodeId) {
        const flowManager = window.flowManager;
        const nodes = flowManager.getNodes();
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return '';
        const { data } = node;
        const nodeData = this.mergeWithBackendData(data);
        return `
            <div class="edit-form entidad-individual-form">
                <h3>Editar Entidad Individual</h3>
                <div class="form-group">
                    <label for="nombre-${nodeId}">Nombre *</label>
                    <input type="text" id="nombre-${nodeId}" value="${nodeData.nombre || ''}" required>
                </div>
                <div class="form-group">
                    <label for="alias-${nodeId}">Alias</label>
                    <input type="text" id="alias-${nodeId}" value="${nodeData.alias || ''}">
                </div>
                <div class="form-group">
                    <label for="especie-${nodeId}">Especie</label>
                    <input type="text" id="especie-${nodeId}" value="${nodeData.especie || ''}">
                </div>
                <div class="form-group">
                    <label for="origen-${nodeId}">Origen</label>
                    <input type="text" id="origen-${nodeId}" value="${nodeData.origen || ''}">
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

    getCreateForm() {
        return `
            <div class="create-form entidad-individual-form">
                <h3>Crear Nueva Entidad Individual</h3>
                <div class="form-group">
                    <label for="nombre-new">Nombre *</label>
                    <input type="text" id="nombre-new" required>
                </div>
                <div class="form-group">
                    <label for="alias-new">Alias</label>
                    <input type="text" id="alias-new">
                </div>
                <div class="form-group">
                    <label for="especie-new">Especie</label>
                    <input type="text" id="especie-new">
                </div>
                <div class="form-group">
                    <label for="origen-new">Origen</label>
                    <input type="text" id="origen-new">
                </div>
                <div class="form-group">
                    <label for="descripcion-new">Descripción</label>
                    <textarea id="descripcion-new"></textarea>
                </div>
                <div class="form-actions">
                    <button type="button" onclick="createNewNode('entidadIndividual')" class="btn btn-primary">Crear</button>
                    <button type="button" onclick="cancelCreateNode()" class="btn btn-secondary">Cancelar</button>
                </div>
            </div>
        `;
    }
}

window.toggleNodeExpansion = function(nodeId) {
    const nodeElement = document.querySelector(`[data-node-id="${nodeId}"]`);
    if (!nodeElement) return;
    const compactView = nodeElement.querySelector('.node-compact-view');
    const expandedContent = nodeElement.querySelector('.node-expanded-content');
    const expandIndicator = nodeElement.querySelector('.node-expand-indicator i');
    if (expandedContent.style.display === 'none') {
        expandedContent.style.display = 'block';
        nodeElement.classList.remove('compact');
        expandIndicator.className = 'fas fa-chevron-up';
        const flowManager = window.flowManager;
        if (flowManager) {
            const nodes = flowManager.getNodes();
            const node = nodes.find(n => n.id === nodeId);
            if (node && !node.data.backendData) {
                const entidadNode = new EntidadIndividualNode();
                entidadNode.loadBackendData(nodeId, node.data.nombre);
            }
        }
    } else {
        expandedContent.style.display = 'none';
        nodeElement.classList.add('compact');
        expandIndicator.className = 'fas fa-chevron-down';
    }
};

window.EntidadIndividualNode = EntidadIndividualNode;