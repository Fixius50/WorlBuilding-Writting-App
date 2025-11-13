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

    render(node) {
        const { data } = node;
        const nodeData = this.mergeWithBackendData(data);
        const alias = nodeData.apellidos || nodeData.alias || 'N/A';

        return `
            <button type="button" class="despliegue-datos" data-node-id="${node.id}">
                <article class="node-compact">
                    <section class="node-image">
                        <img src="../../../Otros/imagenes/mage.png"></img>
                    </section>
                    <section class="node-name">
                        <b class="node-type">Zona</b>
                        <h2 class="node-name">${nodeData.nombre || 'Sin nombre'}</h2>
                    </section>
                </article>
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

    mergeWithBackendData(nodeData) {
        if (nodeData.backendData) {
            // Mapeo inverso: los datos de la BD (zonas) tienen 'tamanno' y 'desarrollo'
            // pero el DTO usa 'tamannoZona' y 'desarrolloZona'.
            // Los datos de la entidad 'Zona' SÍ tienen 'tamanno' y 'desarrollo'.
            // Tu 'ProjectDataLoader' ahora carga directamente desde la API de 'Zona',
            // así que los nombres de campo (tamanno, desarrollo) son correctos.
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

    // ... (loadBackendData y updateNodeWithBackendData eliminados) ...

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
            apellidos: data.apellidos || '',
            descripcion: data.descripcion || '',
            tipo: "zona", // ¡Clave!
            tamannoZona: data.tamanno || '', // Mapeo al DTO
            desarrolloZona: data.desarrollo || '' // Mapeo al DTO
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
