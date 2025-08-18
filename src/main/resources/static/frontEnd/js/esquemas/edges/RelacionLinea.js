/**
 * RelacionLinea.js - Tipo de conexión personalizada para relaciones
 * Representa las conexiones entre diferentes elementos del mundo
 */

class RelacionLinea {
    constructor() {
        this.type = 'relacion-linea';
        this.defaultData = {
            direccion: 'Bidireccional',
            afectados: '',
            tipo: 'Relación'
        };
    }

    /**
     * Renderiza la conexión de relación
     */
    render(edge) {
        const { data } = edge;
        
        return `
            <div class="flow-edge relacion-linea-edge" data-edge-id="${edge.id}">
                <div class="edge-line ${this.getDirectionClass(data.direccion)}">
                    <div class="edge-arrow"></div>
                </div>
                <div class="edge-label">
                    <span class="edge-type">${data.tipo || 'Relación'}</span>
                    ${data.afectados ? `<span class="edge-affected">(${data.afectados})</span>` : ''}
                </div>
                <div class="edge-actions">
                    <button class="edge-action-btn edit-btn" onclick="editEdge('${edge.id}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="edge-action-btn delete-btn" onclick="deleteEdge('${edge.id}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene la clase CSS para la dirección
     */
    getDirectionClass(direccion) {
        const directionClasses = {
            'Bidireccional': 'direction-bidirectional',
            'Unidireccional': 'direction-unidirectional',
            'Jerárquica': 'direction-hierarchical',
            'Circular': 'direction-circular'
        };
        return directionClasses[direccion] || 'direction-bidirectional';
    }

    /**
     * Valida los datos de la conexión
     */
    validateData(data) {
        const errors = [];
        
        if (!data.tipo || data.tipo.trim() === '') {
            errors.push('El tipo de relación es obligatorio');
        }
        
        return errors;
    }

    /**
     * Formatea los datos para enviar al backend
     */
    formatDataForBackend(data) {
        return {
            id: data.id,
            source: data.source,
            target: data.target,
            direccion: data.direccion || 'Bidireccional',
            afectados: data.afectados || '',
            tipo: data.tipo
        };
    }

    /**
     * Obtiene el formulario de edición
     */
    getEditForm(edgeId) {
        const flowManager = window.flowManager;
        const edges = flowManager.getEdges();
        const edge = edges.find(e => e.id === edgeId);
        
        if (!edge) return '';
        
        const { data } = edge;
        
        return `
            <div class="edit-form relacion-form">
                <h3>Editar Relación</h3>
                
                <div class="form-group">
                    <label for="tipo-${edgeId}">Tipo de Relación *</label>
                    <select id="tipo-${edgeId}" required>
                        <option value="Relación" ${data.tipo === 'Relación' ? 'selected' : ''}>Relación</option>
                        <option value="Familia" ${data.tipo === 'Familia' ? 'selected' : ''}>Familia</option>
                        <option value="Amistad" ${data.tipo === 'Amistad' ? 'selected' : ''}>Amistad</option>
                        <option value="Enemistad" ${data.tipo === 'Enemistad' ? 'selected' : ''}>Enemistad</option>
                        <option value="Alianza" ${data.tipo === 'Alianza' ? 'selected' : ''}>Alianza</option>
                        <option value="Conflicto" ${data.tipo === 'Conflicto' ? 'selected' : ''}>Conflicto</option>
                        <option value="Jerarquía" ${data.tipo === 'Jerarquía' ? 'selected' : ''}>Jerarquía</option>
                        <option value="Comercio" ${data.tipo === 'Comercio' ? 'selected' : ''}>Comercio</option>
                        <option value="Dependencia" ${data.tipo === 'Dependencia' ? 'selected' : ''}>Dependencia</option>
                        <option value="Influencia" ${data.tipo === 'Influencia' ? 'selected' : ''}>Influencia</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="direccion-${edgeId}">Dirección</label>
                    <select id="direccion-${edgeId}">
                        <option value="Bidireccional" ${data.direccion === 'Bidireccional' ? 'selected' : ''}>Bidireccional</option>
                        <option value="Unidireccional" ${data.direccion === 'Unidireccional' ? 'selected' : ''}>Unidireccional</option>
                        <option value="Jerárquica" ${data.direccion === 'Jerárquica' ? 'selected' : ''}>Jerárquica</option>
                        <option value="Circular" ${data.direccion === 'Circular' ? 'selected' : ''}>Circular</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="afectados-${edgeId}">Afectados</label>
                    <textarea id="afectados-${edgeId}">${data.afectados || ''}</textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" onclick="saveEdgeEdit('${edgeId}')" class="btn btn-primary">Guardar</button>
                    <button type="button" onclick="cancelEdgeEdit()" class="btn btn-secondary">Cancelar</button>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene el formulario de creación
     */
    getCreateForm(sourceId, targetId) {
        return `
            <div class="create-form relacion-form">
                <h3>Crear Nueva Relación</h3>
                
                <div class="form-group">
                    <label for="tipo-new">Tipo de Relación *</label>
                    <select id="tipo-new" required>
                        <option value="">Seleccionar tipo</option>
                        <option value="Relación">Relación</option>
                        <option value="Familia">Familia</option>
                        <option value="Amistad">Amistad</option>
                        <option value="Enemistad">Enemistad</option>
                        <option value="Alianza">Alianza</option>
                        <option value="Conflicto">Conflicto</option>
                        <option value="Jerarquía">Jerarquía</option>
                        <option value="Comercio">Comercio</option>
                        <option value="Dependencia">Dependencia</option>
                        <option value="Influencia">Influencia</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="direccion-new">Dirección</label>
                    <select id="direccion-new">
                        <option value="Bidireccional">Bidireccional</option>
                        <option value="Unidireccional">Unidireccional</option>
                        <option value="Jerárquica">Jerárquica</option>
                        <option value="Circular">Circular</option>
                    </select>
                </div>
                
                <div class="form-group">
                    <label for="afectados-new">Afectados</label>
                    <textarea id="afectados-new"></textarea>
                </div>
                
                <div class="form-actions">
                    <button type="button" onclick="createNewEdge('${sourceId}', '${targetId}')" class="btn btn-primary">Crear</button>
                    <button type="button" onclick="cancelCreateEdge()" class="btn btn-secondary">Cancelar</button>
                </div>
            </div>
        `;
    }

    /**
     * Obtiene los estilos CSS para la conexión
     */
    getStyles() {
        return `
            .relacion-linea-edge {
                position: relative;
            }
            
            .edge-line {
                stroke: #666;
                stroke-width: 2;
                fill: none;
            }
            
            .direction-bidirectional .edge-line {
                stroke-dasharray: 5,5;
            }
            
            .direction-unidirectional .edge-line {
                marker-end: url(#arrowhead);
            }
            
            .direction-hierarchical .edge-line {
                stroke-width: 3;
                stroke: #333;
            }
            
            .direction-circular .edge-line {
                stroke-dasharray: 10,5;
                stroke: #999;
            }
            
            .edge-label {
                background: rgba(255,255,255,0.9);
                padding: 2px 6px;
                border-radius: 3px;
                font-size: 12px;
                pointer-events: none;
            }
            
            .edge-type {
                font-weight: bold;
                color: #333;
            }
            
            .edge-affected {
                color: #666;
                font-style: italic;
            }
            
            .edge-actions {
                position: absolute;
                top: -20px;
                right: 0;
                display: none;
            }
            
            .relacion-linea-edge:hover .edge-actions {
                display: flex;
            }
            
            .edge-action-btn {
                background: #fff;
                border: 1px solid #ddd;
                border-radius: 3px;
                padding: 2px 4px;
                margin-left: 2px;
                cursor: pointer;
                font-size: 10px;
            }
            
            .edge-action-btn:hover {
                background: #f0f0f0;
            }
        `;
    }
}

// Exportar para uso global
window.RelacionLinea = RelacionLinea;