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
            <button type="button" class="despliegue-datos" data-node-id="${node.id}" onclick="toggleNodeExpansion('${node.id}')">
                <article class="node-compact">
                    <section class="node-image">
                        <img src="../../../Otros/imagenes/mage.png"></img>
                    </section>
                    <section class="node-name">
                        <b class="node-type">Efecto</b>
                        <h2 class="node-name">${nodeData.nombre || 'Sin nombre'}</h2>
                    </section>
                </article>
                <article class="node-expanded">
                    <section>
                        <b class="node-b">Alias:</b>
                        <i class="node-value">${nodeData.alias || 'N/A'}</i>
                    </section>
                    <section>
                        <b class="node-b">Origen:</b>
                        <i class="node-value">${nodeData.origen || 'N/A'}</i>
                    </section>
                    <section>
                        <b class="node-b">Dureza:</b>
                        <i class="node-value">${nodeData.dureza || 'N/A'}</i>
                    </section>
                    <section>
                        <b class="node-b">Comportamiento:</b>
                        <i class="node-value">${nodeData.comportamiento || 'N/A'}</i>
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
            tipo: "efectos", // Clave para el DTO
            origenEfecto: data.origen || '',
            dureza: data.dureza || '',
            comportamientoEfecto: data.comportamiento || ''
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
    
    const expandedContent = nodeElement.querySelector('.node-expanded');
    
    if (expandedContent.style.display === 'none' || expandedContent.style.display === "") {
        // Expandir
        expandedContent.style.display = 'block';
        nodeElement.classList.remove('compact');
    } else {
        // Contraer
        expandedContent.style.display = 'none';
        nodeElement.classList.add('compact');
    }
};

// Exportar para uso global
window.EfectoNode = EfectoNode;