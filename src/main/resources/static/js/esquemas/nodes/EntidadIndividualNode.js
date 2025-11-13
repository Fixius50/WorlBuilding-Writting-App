/**
 * EntidadIndividualNode.js - Nodo personalizado para entidades individuales
 * Representa personajes, seres únicos, etc.
 */

class EntidadIndividualNode {
    constructor() {
        this.type = 'entidadIndividual';
        this.defaultData = {
            nombre: '',
            alias: '', // 'apellidos' en la BD
            estado: '',
            tipo: '',
            origen: '',
            comportamiento: '',
            descripcion: ''
        };
        this.isExpanded = false;
    }

    render(node) {
        const { data } = node;
        const nodeData = this.mergeWithBackendData(data);

        // El 'alias' en el DTO es 'apellidos', lo mapeamos aquí
        const alias = nodeData.apellidos || nodeData.alias || 'N/A';

        return `
            <button type="button" class="despliegue-datos" data-node-id="${node.id}">
                <article class="node-compact">
                    <section class="node-image">
                        <img src="../../../Otros/imagenes/mage.png"></img>
                    </section>
                    <section class="node-name">
                        <b class="node-type">Entidad Individual</b>
                        <h2 class="node-name">${nodeData.nombre || 'Sin nombre'}</h2>
                    </section>
                </article>
                <article class="node-expanded">
                    <section>
                        <b class="node-b">Alias:</b>
                        <i class="node-value">${alias}</i>
                    </section>
                    <section>
                        <b class="node-b">Estado:</b>
                        <i class="node-value">${nodeData.estado || 'N/A'}</i>
                    </section>
                    <section>
                        <b class="node-b">Tipo:</b>
                        <i class="node-value">${nodeData.tipo || 'N/A'}</i>
                    </section>
                    <section>
                        <b class="node-b">Origen:</b>
                        <i class="node-value">${nodeData.origen || 'N/A'}</i>
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

    mergeWithBackendData(nodeData) {
        // 'backendData' es lo que carga ProjectDataLoader
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

    /**
     * ELIMINADO - Esta lógica ahora vive en ProjectDataLoader
     */
    // async loadBackendData(nodeId, entityId) { ... }

    /**
     * ELIMINADO - Esta lógica ahora vive en ProjectDataLoader
     */
    // updateNodeWithBackendData(nodeId, backendData) { ... }

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

    /**
     * Formatea los datos para el DTO plano (Corregido)
     */
    formatDataForBackend(data) {
        return {
            nombre: data.nombre,
            apellidos: data.alias || '',
            descripcion: data.descripcion || '',
            tipo: "entidadindividual",
            estado: data.estado || '',
            origenEntidad: data.origen || '',
            comportamientoEntidad: data.comportamiento || ''
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
            <button type="button" class="despliegue-datos" data-node-id="${node.id}" onclick="toggleNodeExpansion('${node.id}')">
                <article class="node-compact">
                    <section class="node-image">
                        <img src="../../../Otros/imagenes/mage.png"></img>
                    </section>
                    <section class="node-name">
                        <b class="node-type">Entidad Individual</b>
                        <h2 class="node-name">${nodeData.nombre || 'Sin nombre'}</h2>
                    </section>
                </article>
                <article class="node-expanded">
                    <section>
                        <b class="node-b">Alias:</b>
                        <i class="node-value">${nodeData.alias || 'N/A'}</i>
                    </section>
                    <section>
                        <b class="node-b">Estado:</b>
                        <i class="node-value">${nodeData.estado || 'N/A'}</i>
                    </section>
                    <section>
                        <b class="node-b">Tipo:</b>
                        <i class="node-value">${nodeData.tipo || 'N/A'}</i>
                    </section>
                    <section>
                        <b class="node-b">Origen:</b>
                        <i class="node-value">${nodeData.origen || 'N/A'}</i>
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