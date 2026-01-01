import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
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

const EntityBuilderContent = () => {
    const { entityId } = useParams();
    const { setRightOpen, setAvailableTemplates } = useOutletContext();
    const [entity, setEntity] = useState(null);
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
        loadEntity();
        loadLinkableEntities();
        setViewMode('attributes');
    }, [entityId]);

    const loadLinkableEntities = async () => {
        try {
            const all = await api.get('/world-bible/entities');
            setLinkableEntities(all);
        } catch (e) { console.error("Could not load linkable entities", e); }
    };

    const loadEntity = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/world-bible/entities/${entityId}`);
            setEntity(data);

            // Transform attributes to nodes
            if (data.valores) {
                const initialNodes = data.valores.map((val, index) => ({
                    id: val.id.toString(),
                    type: 'custom',
                    position: { x: 100 + (index % 3) * 320, y: 100 + Math.floor(index / 3) * 200 },
                    data: {
                        attribute: val,
                        value: val.valor,
                        linkableEntities: [], // Will be populated
                        onChange: (newVal) => handleAttributeChange(val.id, newVal)
                    },
                }));
                setNodes(initialNodes);
            }

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

    // Update nodes with linkable entities once loaded
    useEffect(() => {
        if (nodes.length > 0 && linkableEntities.length > 0) {
            setNodes((nds) => nds.map((node) => ({
                ...node,
                data: {
                    ...node.data,
                    linkableEntities: linkableEntities
                }
            })));
        }
    }, [linkableEntities.length]); // Only run if linkableEntities loads

    const handleAttributeChange = useCallback((id, value) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === id.toString()) {
                    // Update data value
                    node.data = { ...node.data, value: value };
                }
                return node;
            })
        );
    }, [setNodes]);

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = nodes.map(node => ({
                valorId: parseInt(node.id),
                nuevoValor: node.data.value
            }));
            await api.patch(`/world-bible/entities/${entityId}/values`, updates);
            // Optional: Save positions too if backend supported it
        } catch (err) {
            console.error("Error saving entity:", err);
        } finally {
            setSaving(false);
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

            if (typeof type === 'undefined' || !type) {
                return;
            }

            const position = reactFlowWrapper.current.getBoundingClientRect();
            const positionFlow = project({
                x: event.clientX - position.left,
                y: event.clientY - position.top,
            });

            if (type === 'attribute') {
                const templateId = event.dataTransfer.getData('templateId');
                // Create attribute via API
                try {
                    await api.post(`/world-bible/entities/${entityId}/attributes`, { plantillaId: templateId });
                    // Refresh entity to get the new ID and data, then add node
                    // Ideally we just get the new ID back. For now, reload full entity to be safe or just append if we knew the ID.
                    // Doing a full reload is safer but slower. Let's try to reload.
                    loadEntity();
                } catch (err) {
                    console.error("Failed to add attribute on drop", err);
                }
            } else if (type === 'entity') {
                const draggedId = event.dataTransfer.getData('entityId');
                const draggedName = event.dataTransfer.getData('entityName');

                // Create a 'Link' node. 
                // Ideally, this should also save to the backend as a special "attribute" or "relation".
                // For now, in this visual canvas, it remains a node.
                // We could use a specific 'entityLink' node type if we had one, but 'default' works for MVP.

                const newNode = {
                    id: `link-${draggedId}-${Date.now()}`,
                    type: 'default', // Or 'input'/'output' if we want it to be a pure source/target
                    position: positionFlow,
                    data: { label: `🔗 ${draggedName}` },
                    className: 'bg-surface-dark border-2 border-primary text-white rounded-xl p-2 shadow-lg min-w-[150px] text-center font-bold text-xs'
                };
                setNodes((nds) => nds.concat(newNode));
            }
        },
        [project, entityId]
    );

    if (loading) return <div className="p-20 text-center animate-pulse text-text-muted uppercase tracking-widest font-black">Summoning Entity...</div>;
    if (!entity) return <div className="p-20 text-center text-red-500">Entity lost in the void.</div>;

    return (
        <div className="flex-1 flex flex-col h-full w-full">
            {/* Header */}
            <header className="flex-none p-6 flex items-end justify-between gap-6 border-b border-white/5 bg-background-dark/50 backdrop-blur z-10">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary italic">
                        <span className="material-symbols-outlined text-sm">folder</span>
                        {entity.carpeta?.nombre || 'Root'}
                    </div>
                    <h1 className="text-4xl font-black text-white tracking-tighter">{entity.nombre}</h1>
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
                    onInit={setReactFlowInstance => console.log('flow loaded:', setReactFlowInstance)}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    nodeTypes={nodeTypes}
                    fitView
                    className="bg-background-dark"
                >
                    <Background color="#ffffff" gap={20} size={1} variant="dots" className="opacity-5" />
                    <Controls className="bg-surface-dark border border-white/10 text-white fill-white" />
                </ReactFlow>

                {/* Overlay Instruction */}
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-black/40 backdrop-blur px-4 py-2 rounded-full border border-white/5 text-xs text-text-muted pointer-events-none">
                    Drag attributes from Toolbox or Entities from Explorer
                </div>
            </div>

            {/* Specialized Views (keep existing logic) */}
            {viewMode === 'special' && (
                <div className="w-full flex-1 overflow-auto">
                    {entity.tipoEspecial === 'map' && <SpecializedMap entity={entity} active={true} />}
                    {entity.tipoEspecial === 'timeline' && <SpecializedTimeline entity={entity} active={true} />}
                </div>
            )}

            {/* Contextual Function Tabs */}
            {entity.tipoEspecial && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 flex gap-4 animate-slide-up z-40 bg-surface-dark/80 backdrop-blur-xl p-2 rounded-2xl border border-glass-border shadow-2xl">
                    <button
                        onClick={() => setViewMode('attributes')}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${viewMode === 'attributes' ? 'bg-white text-surface-dark shadow-lg scale-105' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined">dataset</span>
                        Struct
                    </button>
                    <button
                        onClick={() => setViewMode('special')}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${viewMode === 'special' ? 'bg-primary text-white shadow-lg scale-105' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined">
                            {entity.tipoEspecial === 'map' ? 'map' : entity.tipoEspecial === 'timeline' ? 'timeline' : 'analytics'}
                        </span>
                        View
                    </button>
                </div>
            )}
        </div>
    );
};

const EntityBuilder = () => (
    <ReactFlowProvider>
        <EntityBuilderContent />
    </ReactFlowProvider>
);

export default EntityBuilder;
