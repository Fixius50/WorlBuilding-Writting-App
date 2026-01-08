import React, { useState, useEffect, useCallback, useRef } from 'react';
import ReactFlow, {
    addEdge,
    useNodesState,
    useEdgesState,
    Controls,
    Background,
    MarkerType,
    ReactFlowProvider,
    useReactFlow
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

import { useParams } from 'react-router-dom';
import api from '../../../js/services/api';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

// Node Components (Custom optional)
// const CustomNode = ({ data }) => (...)

const GeneralGraphView = () => {
    const { username, projectName } = useParams();
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const [entities, setEntities] = useState([]); // Sidebar list
    const [filteredEntities, setFilteredEntities] = useState([]);
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // React Flow Instance for D&D
    const [reactFlowInstance, setReactFlowInstance] = useState(null);

    useEffect(() => {
        loadData();
    }, []);

    useEffect(() => {
        filterEntities();
    }, [entities, categoryFilter, searchQuery, nodes]); // Re-filter when entities or filter changes or nodes change (to hide already placed?)

    const loadData = async () => {
        setLoading(true);
        try {
            // 1. Get All Entities
            const allEntities = await api.get('/world-bible/entities');
            setEntities(allEntities);

            // 2. Get Relationships (Assume we have an endpoint, using existing logical mock or future endpoint)
            // For now, let's just load entities. If backend doesn't support graph persistence yet, we start empty or load existing positions.
            // If current GraphView was using '/bd/relacion', we can use that too.
            // But for this "New Page", let's assume we want to build it.
            // If we want to visualize existing relationships, we need to fetch them.

            // Let's try to fetch existing graph data if available
            // const relationships = await api.get('/bd/relacion');
            // ... process relationships ...

            // For now, initialize empty canvas or load from local storage/backend
            setNodes([]);
            setEdges([]);

        } catch (err) {
            console.error("Failed to load data", err);
        } finally {
            setLoading(false);
        }
    };

    const filterEntities = () => {
        let result = entities;

        if (categoryFilter !== 'All') {
            result = result.filter(e => {
                if (categoryFilter === 'Individual') return e.categoria === 'Individual' || (!e.categoria && (e.tipoEspecial === 'entidadindividual' || !e.tipoEspecial));
                return e.categoria === categoryFilter;
            });
        }

        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            result = result.filter(e => e.nombre.toLowerCase().includes(q));
        }

        // Optional: Exclude entities already on canvas?
        // const placedIds = new Set(nodes.map(n => n.data.entityId));
        // result = result.filter(e => !placedIds.has(e.id));

        setFilteredEntities(result);
    };

    const onConnect = useCallback((params) => setEdges((eds) => addEdge({
        ...params,
        type: 'smoothstep',
        animated: true,
        style: { stroke: '#6366f1' },
        markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
    }, eds)), []);

    const onDragOver = useCallback((event) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
        (event) => {
            event.preventDefault();

            const entityId = event.dataTransfer.getData('application/reactflow/id');
            const entityData = JSON.parse(event.dataTransfer.getData('application/reactflow/data'));

            if (!entityId || !entityData) {
                return;
            }

            const position = reactFlowInstance.screenToFlowPosition({
                x: event.clientX,
                y: event.clientY,
            });

            // Color based on category/type
            let bg = '#1e293b'; // slate-800
            let border = '#475569'; // slate-600

            if (entityData.categoria === 'Individual') { bg = '#312e81'; border = '#6366f1'; } // Indigo
            else if (entityData.categoria === 'Location') { bg = '#064e3b'; border = '#10b981'; } // Emerald
            else if (entityData.categoria === 'Group') { bg = '#581c87'; border = '#a855f7'; } // Purple

            const newNode = {
                id: `node-${entityId}`,
                type: 'default', // or custom
                position,
                data: { label: entityData.nombre, entityId: entityId, ...entityData },
                style: {
                    background: 'rgba(20, 20, 25, 0.9)',
                    color: '#fff',
                    border: `1px solid ${border}`,
                    borderRadius: '12px',
                    padding: '10px',
                    minWidth: '150px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                },
            };

            setNodes((nds) => nds.concat(newNode));
        },
        [reactFlowInstance],
    );



    const getLayoutedElements = (nodes, edges, direction = 'TB') => {
        const dagreGraph = new dagre.graphlib.Graph();
        dagreGraph.setDefaultEdgeLabel(() => ({}));

        const isHorizontal = direction === 'LR';
        dagreGraph.setGraph({ rankdir: direction });

        nodes.forEach((node) => {
            dagreGraph.setNode(node.id, { width: 220, height: 100 });
        });

        edges.forEach((edge) => {
            dagreGraph.setEdge(edge.source, edge.target);
        });

        dagre.layout(dagreGraph);

        const layoutedNodes = nodes.map((node) => {
            const nodeWithPosition = dagreGraph.node(node.id);
            node.targetPosition = isHorizontal ? 'left' : 'top';
            node.sourcePosition = isHorizontal ? 'right' : 'bottom';

            // Shift position to center anchor
            node.position = {
                x: nodeWithPosition.x - 220 / 2,
                y: nodeWithPosition.y - 100 / 2,
            };

            return node;
        });

        return { nodes: layoutedNodes, edges };
    };

    const handleAutoLayout = () => {
        // 1. Generate Nodes from ALL entities
        const newNodes = entities.map(ent => {
            let bg = '#1e293b';
            let border = '#475569';

            if (ent.categoria === 'Individual') { bg = '#312e81'; border = '#6366f1'; }
            else if (ent.categoria === 'Location') { bg = '#064e3b'; border = '#10b981'; }
            else if (ent.categoria === 'Group') { bg = '#581c87'; border = '#a855f7'; }

            return {
                id: `node-${ent.id}`,
                type: 'default',
                position: { x: 0, y: 0 },
                data: { label: ent.nombre, entityId: ent.id, ...ent },
                style: {
                    background: 'rgba(20, 20, 25, 0.9)',
                    color: '#fff',
                    border: `1px solid ${border}`,
                    borderRadius: '12px',
                    padding: '10px',
                    minWidth: '150px',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                },
            };
        });

        // 2. Generate Edges from Entity Links
        const newEdges = [];
        entities.forEach(ent => {
            if (ent.valores && Array.isArray(ent.valores)) {
                ent.valores.forEach(val => {
                    if (val.plantilla && val.plantilla.tipo === 'entity_link' && val.valor) {
                        // Check if target exists
                        const targetId = `node-${val.valor}`;
                        const sourceId = `node-${ent.id}`;
                        // Avoid self-loops if basic
                        if (targetId !== sourceId) {
                            newEdges.push({
                                id: `e${ent.id}-${val.valor}`,
                                source: sourceId,
                                target: targetId,
                                type: 'smoothstep',
                                animated: true,
                                style: { stroke: '#6366f1' },
                                markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
                            });
                        }
                    }
                });
            }
        });

        // 3. Apply Layout
        const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
            newNodes,
            newEdges
        );

        setNodes([...layoutedNodes]);
        setEdges([...layoutedEdges]);

        setTimeout(() => {
            if (reactFlowInstance) reactFlowInstance.fitView();
        }, 100);
    };

    const onDragStart = (event, entity) => {
        event.dataTransfer.setData('application/reactflow/id', entity.id);
        event.dataTransfer.setData('application/reactflow/data', JSON.stringify(entity));
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <div className="w-full flex h-full bg-[#050508] relative overflow-hidden font-manrope">
            {/* --- LEFT SIDEBAR (Entity List) --- */}
            <aside className="w-80 border-r border-white/5 bg-surface-dark/80 backdrop-blur-xl flex flex-col z-20 shadow-2xl">
                <div className="p-6 border-b border-white/5 space-y-6 bg-gradient-to-b from-white/5 to-transparent">
                    <h2 className="text-sm font-black uppercase tracking-widest text-white flex items-center gap-3">
                        <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-white text-lg">hub</span>
                        </div>
                        Graph Composer
                    </h2>

                    {/* Search */}
                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm group-focus-within:text-primary transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="Search entities..."
                            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-3 text-xs text-white focus:border-primary/50 focus:bg-black/50 outline-none transition-all placeholder:text-slate-600 font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    {/* Filter Tabs */}
                    <div className="flex gap-2 p-1 bg-black/40 rounded-xl overflow-x-auto no-scrollbar border border-white/5">
                        {['All', 'Individual', 'Location', 'Group', 'Event'].map(cat => (
                            <button
                                key={cat}
                                onClick={() => setCategoryFilter(cat)}
                                className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${categoryFilter === cat ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-slate-300 hover:bg-white/5'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2">
                    <p className="text-[10px] uppercase font-bold text-slate-600 mb-3 pl-2 flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">drag_indicator</span>
                        Drag to Canvas
                    </p>
                    {filteredEntities.map(ent => (
                        <div
                            key={ent.id}
                            draggable
                            onDragStart={(event) => onDragStart(event, ent)}
                            className="group flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-transparent hover:border-primary/30 hover:bg-white/10 hover:shadow-lg hover:shadow-primary/5 cursor-grab active:cursor-grabbing transition-all select-none"
                        >
                            <Avatar name={ent.nombre} url={ent.iconUrl} size="sm" className="rounded-lg opacity-80 group-hover:opacity-100 ring-2 ring-transparent group-hover:ring-primary/20 transition-all" />
                            <div className="flex-1 min-w-0">
                                <div className="text-xs font-bold text-slate-300 group-hover:text-white truncate transition-colors">{ent.nombre}</div>
                                <div className="flex items-center gap-2">
                                    <span className={`text-[9px] uppercase tracking-wider font-bold ${ent.categoria === 'Individual' ? 'text-indigo-400' : 'text-slate-500'}`}>
                                        {ent.categoria || 'Entity'}
                                    </span>
                                    {ent.carpeta && <span className="text-[9px] text-white/30 truncate">• {ent.carpeta.nombre}</span>}
                                </div>
                            </div>
                            <span className="material-symbols-outlined text-slate-700 group-hover:text-primary text-lg transition-colors opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 duration-300">add_circle</span>
                        </div>
                    ))}
                    {filteredEntities.length === 0 && (
                        <div className="p-12 text-center text-slate-600 text-xs italic border-2 border-dashed border-white/5 rounded-xl m-4">
                            No entities found.
                        </div>
                    )}
                </div>
            </aside>

            {/* --- MAIN GRAPH CANVAS --- */}
            <div className="flex-1 h-full relative" ref={reactFlowWrapper}>
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-indigo-900/10 via-[#050508] to-[#050508] pointer-events-none z-0"></div>
                <ReactFlow
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setReactFlowInstance}
                    onDrop={onDrop}
                    onDragOver={onDragOver}
                    fitView
                    className="bg-[#050508]"
                >
                    <Background color="#222" gap={24} size={1} />
                    <Controls className="bg-surface-dark border border-white/10 text-white fill-white rounded-xl overflow-hidden shadow-xl" />
                </ReactFlow>

                {/* Overlay Controls */}
                <div className="absolute top-6 right-6 z-10 flex gap-3">
                    <div className="bg-surface-dark/80 backdrop-blur border border-white/10 rounded-xl p-1 flex shadow-2xl">
                        <Button variant="ghost" size="sm" icon="save" className="hover:bg-white/5">Save Layout</Button>
                        <div className="w-px bg-white/10 my-1"></div>
                        <Button onClick={handleAutoLayout} variant="primary" size="sm" icon="auto_fix_high" className="shadow-lg shadow-primary/20">Auto Layout</Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default () => (
    <ReactFlowProvider>
        <GeneralGraphView />
    </ReactFlowProvider>
);
