/**
 * EntidadColectivaNode.js - Nodo personalizado para entidades colectivas
 * Representa organizaciones, grupos, facciones y entidades colectivas en el mundo
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
    }

    /**
     * Renderiza el nodo de entidad colectiva
     */
    render(node) {
        const { data } = node;
        
        return `
            <div class="flow-node entidad-colectiva-node" data-node-id="${node.id}">
                <div class="node-header">
                    <div class="node-icon">
                        <img src="/Otros/imagenes/colectivas.jpg" alt="Organización" class="node-icon-img">
                    </div>
                    <div class="node-title">
                        <h3 class="node-name">${data.nombre || 'Sin nombre'}</h3>
                        <span class="node-type">${data.tipo || 'Organización'}</span>
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
                        <span class="node-value">${data.apellidos || 'N/A'}</span>
                    </div>
                    
                    <div class="node-section">
                        <label class="node-label">Estado:</label>
                        <span class="node-status ${this.getStatusClass(data.estado)}">${data.estado || 'Desconocido'}</span>
                    </div>
                    
                    <div class="node-section">
                        <label class="node-label">Origen:</label>
                        <span class="node-value">${data.origen || 'N/A'}</span>
                    </div>
                    
                    <div class="node-section">
                        <label class="node-label">Comportamiento:</label>
                        <span class="node-value">${data.comportamiento || 'N/A'}</span>
                    </div>
                    
                    <div class="node-section description">
                        <label class="node-label">Descripción:</label>
                        <p class="node-description">${data.descripcion || 'Sin descripción'}</p>
                    </div>
                </div>
                
                <div class="node-footer">
                    <div class="node-connections">
                        <span class="connection-count">${this.getConnectionCount(node.id)} conexiones</span>
                    </div>
                </div>
            </div>
        `;
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
        
        return `
            <div class="edit-form entidad-colectiva-form">
                <h3>Editar Organización</h3>
                
                <div class="form-group">
                    <label for="nombre-${nodeId}">Nombre *</label>
                    <input type="text" id="nombre-${nodeId}" value="${data.nombre || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="apellidos-${nodeId}">Alias</label>
                    <input type="text" id="apellidos-${nodeId}" value="${data.apellidos || ''}">
                </div>
                
                <div class="form-group">
                    <label for="tipo-${nodeId}">Tipo *</label>
                    <select id="tipo-${nodeId}" required>
                        <option value="Organización" ${data.tipo === 'Organización' ? 'selected' : ''}>Organización</option>
                        <option value="Gremio" ${data.tipo === 'Gremio' ? 'selected' : ''}>Gremio</option>
                        <option value="Gobierno" ${data.tipo === 'Gobierno' ? 'selected' : ''}>Gobierno</option>
                        <option value="Facción" ${data.tipo === 'Facción' ? 'selected' : ''}>Facción</option>
                        <option value="Ejército" ${data.tipo === 'Ejército' ? 'selected' : ''}>Ejército</option>
                        <option value="Orden" ${data.tipo === 'Orden' ? 'selected' : ''}>Orden</option>
                        <option value="Culto" ${data.tipo === 'Culto' ? 'selected' : ''}>Culto</option>
                        <option value="Familia" ${data.tipo === 'Familia' ? 'selected' : ''}>Familia</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="estado-${nodeId}">Estado</label>
                    <select id="estado-${nodeId}">
                        <option value="Activa" ${data.estado === 'Activa' ? 'selected' : ''}>Activa</option>
                        <option value="Inactiva" ${data.estado === 'Inactiva' ? 'selected' : ''}>Inactiva</option>
                        <option value="Disuelta" ${data.estado === 'Disuelta' ? 'selected' : ''}>Disuelta</option>
                        <option value="En guerra" ${data.estado === 'En guerra' ? 'selected' : ''}>En guerra</option>
                        <option value="En paz" ${data.estado === 'En paz' ? 'selected' : ''}>En paz</option>
                        <option value="Secretamente activa" ${data.estado === 'Secretamente activa' ? 'selected' : ''}>Secretamente activa</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="origen-${nodeId}">Origen</label>
                    <input type="text" id="origen-${nodeId}" value="${data.origen || ''}">
                </div>
                
                <div class="form-group">
                    <label for="comportamiento-${nodeId}">Comportamiento</label>
                    <textarea id="comportamiento-${nodeId}">${data.comportamiento || ''}</textarea>
                </div>
                
                <div class="form-group">
                    <label for="descripcion-${nodeId}">Descripción</label>
                    <textarea id="descripcion-${nodeId}">${data.descripcion || ''}</textarea>
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

// Exportar para uso global
window.EntidadColectivaNode = EntidadColectivaNode;
