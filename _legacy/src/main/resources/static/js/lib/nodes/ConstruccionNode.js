/**
 * ConstruccionNode.js - Nodo personalizado para construcciones
 * Representa edificios, estructuras y construcciones en el mundo
 * Recibe datos del backend y se muestra como un recuadro expandible
 */

class ConstruccionNode {
    constructor() {
        this.type = 'construccion';
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
     * Renderiza el nodo de construcción
     * Se muestra como un recuadro compacto que se expande al hacer click
     */
    render(node) {
        const { data } = node;
        
        // Si no hay datos del backend, usar datos por defecto
        const nodeData = this.mergeWithBackendData(data);
        const alias = nodeData.apellidos || nodeData.alias || 'N/A';
        
        return `
            <button type="button" class="despliegue-datos" data-node-id="${node.id}" onclick="toggleNodeExpansion('${node.id}')">
                <div class="node-compact">
                    <div class="node-image">
                        <img src="../../../Otros/imagenes/construcciones.jpg">
                    </div>
                    <section class="node-name">
                        <b class="node-type">Construccion</b>
                        <h2 class="node-name">${nodeData.nombre || 'Sin nombre'}</h2>
                    </section>
                </div>
                <article class="node-expanded">
                    <section>
                        <b class="node-b">Alias:</b>
                        <i class="node-value">${alias}</i>
                    </section>
                    <section>
                        <b class="node-b">Tamaño:</b>
                        <i class="node-value">${nodeData.tamanno || 'N/A'}</i>
                    </section>
                    <section>
                        <b class="node-b">Tipo:</b>
                        <i class="node-value">${nodeData.tipo || 'N/A'}</i>
                    </section>
                    <section>
                        <b class="node-b">Desarrollo:</b>
                        <i class="node-value">${nodeData.desarrollo || 'N/A'}</i>
                    </section>
                    <section class="description">
                        <b class="node-b">Descripción:</b>
                        <p class="node-description">${nodeData.descripcion || 'Sin descripción'}</p>
                    </section>
                </article>
                <article class="node-footer">
                    <section class="node-connections">
                        <b class="connection-count">Conexiones: ${this.getConnectionCount(node.id)}</b>
                    </section>
                </article>
            </button>
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
     * Formatea los datos para enviar al backend (DTO)
     */
    formatDataForBackend(data) {
        return {
            nombre: data.nombre,
            apellidos: data.apellidos || '',
            descripcion: data.descripcion || '',
            tipo: "construccion",
            tamannoCons: data.tamanno || '',
            desarrolloCons: data.desarrollo || ''
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
            <div class="edit-form construccion-form">
                <h3>Editar Construcción</h3>
                
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
                        <option value="Edificio" ${nodeData.tipo === 'Edificio' ? 'selected' : ''}>Edificio</option>
                        <option value="Castillo" ${nodeData.tipo === 'Castillo' ? 'selected' : ''}>Castillo</option>
                        <option value="Templo" ${nodeData.tipo === 'Templo' ? 'selected' : ''}>Templo</option>
                        <option value="Torre" ${nodeData.tipo === 'Torre' ? 'selected' : ''}>Torre</option>
                        <option value="Puente" ${nodeData.tipo === 'Puente' ? 'selected' : ''}>Puente</option>
                        <option value="Muro" ${nodeData.tipo === 'Muro' ? 'selected' : ''}>Muro</option>
                        <option value="Puerta" ${nodeData.tipo === 'Puerta' ? 'selected' : ''}>Puerta</option>
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
            <div class="create-form construccion-form">
                <h3>Crear Nueva Construcción</h3>
                
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
                        <option value="Edificio">Edificio</option>
                        <option value="Castillo">Castillo</option>
                        <option value="Templo">Templo</option>
                        <option value="Torre">Torre</option>
                        <option value="Puente">Puente</option>
                        <option value="Muro">Muro</option>
                        <option value="Puerta">Puerta</option>
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
                    <button type="button" onclick="createNewNode('construccion')" class="btn btn-primary">Crear</button>
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

    const expandedContent = nodeElement.querySelector('.node-expanded');
    
    if (expandedContent.style.display === 'none' || expandedContent.style.display === "") {
        expandedContent.style.display = 'block';
        nodeElement.classList.remove('compact');
    } else {
        expandedContent.style.display = 'none';
        nodeElement.classList.add('compact');
    }
};

// Exportar para uso global
window.ConstruccionNode = ConstruccionNode;