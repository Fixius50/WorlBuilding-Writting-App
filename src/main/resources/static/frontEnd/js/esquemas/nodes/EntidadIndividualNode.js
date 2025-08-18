/**
 * EntidadIndividualNode.js - Nodo personalizado para entidades individuales
 * Representa personajes, NPCs y entidades individuales en el mundo
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
    }

    /**
     * Renderiza el nodo de entidad individual
     */
    render(node) {
        const { data } = node;
        
        return `
            <div class="flow-node entidad-individual-node" data-node-id="${node.id}">
                <div class="node-header">
                    <div class="node-icon">
                        <img src="/Otros/imagenes/mage.png" alt="Personaje" class="node-icon-img">
                    </div>
                    <div class="node-title">
                        <h3 class="node-name">${data.nombre || 'Sin nombre'}</h3>
                        <span class="node-type">${data.tipo || 'Personaje'}</span>
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
            tipoTabla: 'entidades_individuales',
            valoresExtraTabla: [
                'Entidad-Individual',
                data.estado || 'Vivo',
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
            <div class="edit-form entidad-individual-form">
                <h3>Editar Personaje</h3>
                
                <div class="form-group">
                    <label for="nombre-${nodeId}">Nombre *</label>
                    <input type="text" id="nombre-${nodeId}" value="${data.nombre || ''}" required>
                </div>
                
                <div class="form-group">
                    <label for="apellidos-${nodeId}">Apellidos</label>
                    <input type="text" id="apellidos-${nodeId}" value="${data.apellidos || ''}">
                </div>
                
                <div class="form-group">
                    <label for="tipo-${nodeId}">Tipo *</label>
                    <select id="tipo-${nodeId}" required>
                        <option value="Personaje" ${data.tipo === 'Personaje' ? 'selected' : ''}>Personaje</option>
                        <option value="NPC" ${data.tipo === 'NPC' ? 'selected' : ''}>NPC</option>
                        <option value="Antagonista" ${data.tipo === 'Antagonista' ? 'selected' : ''}>Antagonista</option>
                        <option value="Protagonista" ${data.tipo === 'Protagonista' ? 'selected' : ''}>Protagonista</option>
                        <option value="Secundario" ${data.tipo === 'Secundario' ? 'selected' : ''}>Secundario</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="estado-${nodeId}">Estado</label>
                    <select id="estado-${nodeId}">
                        <option value="Vivo" ${data.estado === 'Vivo' ? 'selected' : ''}>Vivo</option>
                        <option value="Muerto" ${data.estado === 'Muerto' ? 'selected' : ''}>Muerto</option>
                        <option value="Desaparecido" ${data.estado === 'Desaparecido' ? 'selected' : ''}>Desaparecido</option>
                        <option value="Herido" ${data.estado === 'Herido' ? 'selected' : ''}>Herido</option>
                        <option value="Enfermo" ${data.estado === 'Enfermo' ? 'selected' : ''}>Enfermo</option>
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

// Exportar para uso global
window.EntidadIndividualNode = EntidadIndividualNode;