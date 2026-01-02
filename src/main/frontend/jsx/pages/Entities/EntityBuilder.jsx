import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import ReactFlow, {
    Background,
    Controls,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    ReactFlowProvider
} from 'reactflow';
import 'reactflow/dist/style.css';

import api from '../../../js/services/api';
import SpecializedMap from './Specialized/SpecializedMap';
import SpecializedTimeline from './Specialized/SpecializedTimeline';
import CanvasNode from './Nodes/CanvasNode';

const nodeTypes = {
    custom: CanvasNode
};

const EntityBuilderContent = ({ mode }) => {
    const { username, projectName, entitySlug, folderSlug, type } = useParams();
    const navigate = useNavigate();
    const isCreation = mode === 'creation';
    const {
        setRightOpen,
        setRightPanelMode,
        setAvailableTemplates,
        setAddAttributeHandler,
        setCreateTemplateHandler
    } = useOutletContext();

    const [entity, setEntity] = useState(null);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ nombre: '', tipo: 'text', global: false });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState('attributes'); // 'attributes', 'special'
    const [linkableEntities, setLinkableEntities] = useState([]);

    // ReactFlow State
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const reactFlowWrapper = useRef(null);
    const { project } = useReactFlow();

    useEffect(() => {
        setRightPanelMode('TOOLBOX');
        setRightOpen(true);
        loadLinkableEntities();

        if (isCreation) {
            loadCreationMode();
        } else {
            loadEntity();
        }

        return () => {
            setRightPanelMode('NOTES'); // Revert on exit
        };
    }, [entitySlug, folderSlug, isCreation]);

    const loadLinkableEntities = async () => {
        try {
            const all = await api.get('/world-bible/entities');
            setLinkableEntities(all);
        } catch (e) { console.error("Could not load linkable entities", e); }
    };

    const loadCreationMode = async () => {
        setLoading(true);
        try {
            const folderInfo = await api.get(`/world-bible/folders/${folderSlug}`);
            const templates = await api.get(`/world-bible/folders/${folderSlug}/templates`);

            setEntity({
                nombre: `Nuevo ${type === 'map' ? 'Mapa' : type === 'timeline' ? 'Cronograma' : 'Ente'}`,
                carpeta: folderInfo,
                tipoEspecial: type,
                isNew: true
            });
            setAvailableTemplates(templates);

            let currentNodes = [];
            let yOffset = 50;

            // Name Node (Only in creation or as editable core)
            currentNodes.push({
                id: 'core-name',
                type: 'custom',
                position: { x: 50, y: yOffset },
                data: {
                    attribute: { nombre: 'Nombre', tipo: 'short_text', descripcion: 'Nombre de la entidad' },
                    value: '',
                    onChange: (val) => handleCoreChange('nombre', val),
                    isCore: true
                }
            });
            yOffset += 150;

            // Description & Tags
            currentNodes.push({
                id: 'core-desc',
                type: 'custom',
                position: { x: 50, y: yOffset },
                data: {
                    attribute: { nombre: 'Descripción', tipo: 'text', descripcion: 'Descripción principal' },
                    value: '',
                    onChange: (val) => handleCoreChange('descripcion', val),
                    isCore: true
                }
            });
            yOffset += 300;

            currentNodes.push({
                id: 'core-tags',
                type: 'custom',
                position: { x: 50, y: yOffset },
                data: {
                    attribute: { nombre: 'Etiquetas', tipo: 'short_text', descripcion: 'Separadas por comas' },
                    value: '',
                    onChange: (val) => handleCoreChange('tags', val),
                    isCore: true
                }
            });

            // Template Nodes with defaults
            templates.forEach((tpl, index) => {
                currentNodes.push({
                    id: `temp-${tpl.id}`,
                    type: 'custom',
                    position: { x: 450 + (index % 2) * 350, y: 50 + Math.floor(index / 2) * 200 },
                    data: {
                        attribute: tpl,
                        value: tpl.valorDefecto || '',
                        onChange: (newVal) => handleTempAttributeChange(tpl.id, newVal)
                    },
                });
            });

            setNodes(currentNodes);
        } catch (err) {
            console.error("Error preparing creation mode:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadEntity = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/world-bible/entities/${entitySlug}`);
            setEntity(data);

            let currentNodes = [];
            let yOffset = 50;

            // Name Node (Editable for existing too)
            currentNodes.push({
                id: 'core-name',
                type: 'custom',
                position: { x: 50, y: yOffset },
                data: {
                    attribute: { nombre: 'Nombre', tipo: 'short_text', descripcion: 'Nombre de la entidad' },
                    value: data.nombre,
                    onChange: (val) => handleCoreChange('nombre', val),
                    isCore: true
                }
            });
            yOffset += 150;

            currentNodes.push({
                id: 'core-desc',
                type: 'custom',
                position: { x: 50, y: yOffset },
                data: {
                    attribute: { nombre: 'Descripción General', tipo: 'text', descripcion: 'Descripción principal.' },
                    value: data.descripcion || '',
                    onChange: (val) => handleCoreChange('descripcion', val),
                    isCore: true
                }
            });
            yOffset += 300;

            currentNodes.push({
                id: 'core-tags',
                type: 'custom',
                position: { x: 50, y: yOffset },
                data: {
                    attribute: { nombre: 'Etiquetas', tipo: 'short_text', descripcion: 'Separadas por comas' },
                    value: data.tags || '',
                    onChange: (val) => handleCoreChange('tags', val),
                    isCore: true
                }
            });

            if (data.valores) {
                data.valores.forEach((val, index) => {
                    currentNodes.push({
                        id: val.id.toString(),
                        type: 'custom',
                        position: { x: 450 + (index % 2) * 350, y: 50 + Math.floor(index / 2) * 200 },
                        data: {
                            attribute: val.plantilla,
                            value: val.valor,
                            onChange: (newVal) => handleAttributeChange(val.id, newVal)
                        },
                    });
                });
            }

            setNodes(currentNodes);

            if (data.carpeta?.id) {
                const templates = await api.get(`/world-bible/folders/${data.carpeta.id}/templates`);
                setAvailableTemplates(templates);
            }
        } catch (err) {
            console.error("Error loading entity:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleTempAttributeChange = (templateId, value) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === `temp-${templateId}`) {
                return { ...node, data: { ...node.data, value: value } };
            }
            return node;
        }));
    };

    useEffect(() => {
        const t = entity?.tipoEspecial || type;
        if (t === 'map' || t === 'timeline') {
            setViewMode('special');
        } else {
            setViewMode('attributes');
        }
    }, [entity?.tipoEspecial, type]);

    // Update Nodes with Linkables
    useEffect(() => {
        if (nodes.length > 0 && linkableEntities.length > 0) {
            setNodes((nds) => nds.map((node) => ({
                ...node,
                data: { ...node.data, linkableEntities: linkableEntities }
            })));
        }
    }, [linkableEntities.length]);

    // --- HANDLERS ---

    const handleCoreChange = (field, value) => {
        if (field === 'nombre') {
            setEntity(prev => ({ ...prev, nombre: value }));
        }
        setNodes((nds) => nds.map((node) => {
            if (node.data.isCore && node.id === `core-${field}`) {
                return { ...node, data: { ...node.data, value: value } };
            }
            return node;
        }));
    };

    const handleAttributeChange = useCallback((id, value) => {
        setNodes((nds) => nds.map((node) => {
            if (node.id === id.toString()) {
                return { ...node, data: { ...node.data, value: value } };
            }
            return node;
        }));
    }, [setNodes]);

    const handleAddAttribute = async (templateId) => {
        if (isCreation) {
            // In creation mode, we just add a "temp" node
            const tpl = availableTemplates.find(t => t.id === parseInt(templateId));
            if (!tpl) return;

            setNodes(nds => [...nds, {
                id: `temp-${tpl.id}`,
                type: 'custom',
                position: { x: 400, y: 400 }, // Initial position
                data: {
                    attribute: tpl,
                    value: tpl.valorDefecto || '',
                    onChange: (newVal) => handleTempAttributeChange(tpl.id, newVal)
                }
            }]);
        } else {
            try {
                await api.post(`/world-bible/entities/${entity.id}/attributes`, { plantillaId: templateId });
                loadEntity(); // Refresh
            } catch (err) { console.error("Failed to add attribute", err); }
        }
    };

    const handleSave = async () => {
        if (!entity) return;
        setSaving(true);
        try {
            const nameNode = nodes.find(n => n.id === 'core-name');
            const descNode = nodes.find(n => n.id === 'core-desc');
            const tagsNode = nodes.find(n => n.id === 'core-tags');

            const payload = {
                nombre: nameNode?.data.value || entity.nombre,
                descripcion: descNode?.data.value || '',
                tags: tagsNode?.data.value || '',
                tipoEspecial: entity.tipoEspecial || 'entidadindividual'
            };

            if (isCreation) {
                // 1. Create the Entity
                payload.carpetaId = entity.carpeta.id;
                const newEntity = await api.post('/world-bible/entities', payload);

                // 2. Create Attributes from temp nodes
                const tempNodes = nodes.filter(n => n.id.startsWith('temp-'));
                for (const node of tempNodes) {
                    const templateId = parseInt(node.id.replace('temp-', ''));
                    const val = await api.post(`/world-bible/entities/${newEntity.id}/attributes`, {
                        plantillaId: templateId
                    });
                    // Set initial value
                    await api.patch(`/world-bible/entities/${newEntity.id}/values`, [{
                        valorId: val.id,
                        nuevoValor: node.data.value
                    }]);
                }

                setSaving(false);
                // Redirect to new entity URL
                navigate(`/${username}/${projectName}/bible/folder/${folderSlug}/entity/${newEntity.slug || newEntity.id}`, { replace: true });
            } else {
                // Update Existing
                if (payload.nombre !== entity.nombre) {
                    await api.put(`/world-bible/entities/${entity.id}`, { nombre: payload.nombre });
                }

                await api.patch(`/world-bible/entities/${entity.id}/details`, {
                    descripcion: payload.descripcion,
                    tags: payload.tags
                });

                const attrUpdates = nodes
                    .filter(n => !n.data.isCore && !n.id.startsWith('link-') && !n.id.startsWith('temp-'))
                    .map(node => ({
                        valorId: parseInt(node.id),
                        nuevoValor: node.data.value
                    }));

                if (attrUpdates.length > 0) {
                    await api.patch(`/world-bible/entities/${entity.id}/values`, attrUpdates);
                }
                setSaving(false);
            }
        } catch (err) {
            console.error("Error saving entity:", err);
            setSaving(false);
            alert("Error al guardar la entidad.");
        }
    };

    const onConnect = useCallback((params) => setEdges((eds) => addEdge(params, eds)), [setEdges]);
    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        async (event) => {
            event.preventDefault();
            const type = event.dataTransfer.getData('application/reactflow/type');
            if (typeof type === 'undefined' || !type) return;

            if (type === 'attribute') {
                const templateId = event.dataTransfer.getData('templateId');
                await handleAddAttribute(templateId);
            }
        },
        [entity?.id]
    );

    const handleCreateTemplateSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/world-bible/folders/${entity.carpeta.id}/templates`, newTemplate);
            setShowCreateModal(false);
            setNewTemplate({ nombre: '', tipo: 'text', global: false });
            // Refresh Templates
            if (entity.carpeta?.id) {
                const templates = await api.get(`/world-bible/folders/${entity.carpeta.id}/templates`);
                setAvailableTemplates(templates);
            }
        } catch (err) {
            console.error("Failed to create template", err);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-text-muted uppercase tracking-widest font-black">Summoning Entity...</div>;
    if (!entity) return <div className="p-20 text-center text-red-500">Entity lost in the void.</div>;

    return (
        <div className="flex-1 flex flex-col h-full w-full relative">
            {/* Create Template Modal Overlay */}
            {showCreateModal && (
                <div className="absolute inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface-dark border border-glass-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-black text-white mb-4">Nueva Plantilla</h3>
                        <form onSubmit={handleCreateTemplateSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs uppercase font-bold text-text-muted block mb-1">Nombre</label>
                                <input
                                    autoFocus
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-primary"
                                    value={newTemplate.nombre}
                                    onChange={e => setNewTemplate({ ...newTemplate, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase font-bold text-text-muted block mb-1">Tipo</label>
                                    <select
                                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-primary"
                                        value={newTemplate.tipo}
                                        onChange={e => setNewTemplate({ ...newTemplate, tipo: e.target.value })}
                                    >
                                        <option value="text">Texto Largo</option>
                                        <option value="short_text">Texto Corto</option>
                                        <option value="number">Número</option>
                                        <option value="boolean">Si/No</option>
                                        <option value="date">Fecha</option>
                                        <option value="entity_link">Vínculo Entidad</option>
                                        <option value="image">Imagen URL</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-white/5 rounded-xl w-full hover:bg-white/10 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={newTemplate.global}
                                            onChange={e => setNewTemplate({ ...newTemplate, global: e.target.checked })}
                                            className="accent-primary size-4"
                                        />
                                        <span className="text-sm font-bold text-white">Es Global?</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-text-muted hover:text-white font-bold">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Header */}
            <header className="flex-none p-6 flex items-end justify-between gap-6 border-b border-white/5 bg-background-dark/50 backdrop-blur z-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary italic">
                        <span className="material-symbols-outlined text-sm">folder</span>
                        {entity.carpeta?.nombre || 'Root'}
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">{entity.nombre}</h1>
                    {entity.tags && (
                        <div className="flex gap-2">
                            {entity.tags.split(',').map((tag, i) => (
                                <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-[10px] uppercase font-bold text-text-muted border border-white/5">
                                    {tag.trim()}
                                </span>
                            ))}
                        </div>
                    )}
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all ${saving && 'opacity-50 animate-pulse'}`}
                    >
                        <span className="material-symbols-outlined">{saving ? 'sync' : 'save'}</span>
                    </button>
                </div>
            </header>

            {/* Canvas Area */}
            <div className={`flex-1 w-full h-full relative ${viewMode !== 'attributes' ? 'hidden' : ''}`} ref={reactFlowWrapper}>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-background-dark"
                >
                    <Background color="#ffffff" gap={20} size={1} variant="dots" className="opacity-5" />
                    <Controls className="bg-surface-dark border border-white/10 text-white fill-white" />
                </ReactFlow>
            </div>

            {/* Special modes */}
            {viewMode === 'special' && (entity?.tipoEspecial === 'map' || type === 'map') && (
                <SpecializedMap entity={entity} />
            )}
            {viewMode === 'special' && (entity?.tipoEspecial === 'timeline' || type === 'timeline') && (
                <SpecializedTimeline entity={entity} />
            )}
        </div>
    );
};

const EntityBuilder = ({ mode }) => (
    <ReactFlowProvider>
        <EntityBuilderContent mode={mode} />
    </ReactFlowProvider>
);

export default EntityBuilder;
