import React, { useState, useEffect } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import api from '../../../js/services/api';

const GraphView = () => {
    const [selectedNode, setSelectedNode] = useState(null);
    const [nodes, setNodes] = useState([]);
    const [connections, setConnections] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadGraph();
    }, []);

    const loadGraph = async () => {
        setLoading(true);
        try {
            const rawRels = await api.get('/bd/relacion');

            // Extract unique nodes from relationships
            const uniqueNodes = new Map();
            rawRels.forEach(r => {
                const originKey = `${r.tipoOrigen}-${r.nodoOrigenId}`;
                const destKey = `${r.tipoDestino}-${r.nodoDestinoId}`;

                if (!uniqueNodes.has(originKey)) uniqueNodes.set(originKey, { id: r.nodoOrigenId, type: r.tipoOrigen });
                if (!uniqueNodes.has(destKey)) uniqueNodes.set(destKey, { id: r.nodoDestinoId, type: r.tipoDestino });
            });

            // Fetch details for each node
            const nodesWithNames = await Promise.all(Array.from(uniqueNodes.values()).map(async (n, index) => {
                try {
                    // Unified fetch: Use ID directly
                    const detail = await api.get(`/world-bible/entities/${n.id}`);

                    let color = 'bg-slate-500';
                    let icon = 'help';

                    // Use category from detail, fallback to n.type
                    const typeToCheck = (detail.categoria || n.type || '').toLowerCase();

                    switch (typeToCheck) {
                        case 'individual':
                        case 'entidadindividual': color = 'bg-primary'; icon = 'person'; break;
                        case 'group':
                        case 'entidadcolectiva': color = 'bg-purple-500'; icon = 'groups'; break;
                        case 'location':
                        case 'zona': color = 'bg-emerald-500'; icon = 'location_on'; break;
                        case 'structure':
                        case 'construccion': color = 'bg-orange-500'; icon = 'apartment'; break;
                        case 'timeline':
                        case 'lineatiempo': color = 'bg-cyan-500'; icon = 'history'; break;
                        case 'event':
                        case 'eventotiempo': color = 'bg-red-500'; icon = 'event'; break;
                        case 'map':
                        case 'mapa': color = 'bg-amber-500'; icon = 'map'; break;
                        case 'item':
                        case 'objeto': color = 'bg-yellow-500'; icon = 'diamond'; break;
                        default: break;
                    }

                    return {
                        id: `${n.type}-${n.id}`,
                        originalId: n.id,
                        originalType: n.type,
                        name: detail.nombre,
                        description: detail.descripcion || '',
                        type: detail.categoria || n.type, // Show real category
                        icon,
                        x: 400 + (Math.cos(index) * 300) + (Math.random() * 50),
                        y: 400 + (Math.sin(index) * 300) + (Math.random() * 50),
                        color
                    };
                } catch (e) {
                    console.warn(`Node not found: ${n.type} ${n.id}`);
                    return null;
                }
            }));

            setNodes(nodesWithNames.filter(Boolean));
            setConnections(rawRels.map(r => ({
                from: `${r.tipoOrigen}-${r.nodoOrigenId}`,
                to: `${r.tipoDestino}-${r.nodoDestinoId}`,
                label: r.tipoRelacion || 'Related',
                description: r.descripcion
            })));
        } catch (err) {
            console.error("Error loading graph:", err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden bg-[#050508] relative group/canvas">
            {/* Background Grain/Grid */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

            {loading && (
                <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                    <div className="text-primary animate-pulse font-black uppercase tracking-widest text-lg">Calculating Resonance...</div>
                </div>
            )}

            {/* Left Controls */}
            <aside className="absolute left-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-6">
                <GlassPanel className="p-2 flex flex-col gap-2 rounded-2xl border-white/10 bg-surface-dark/40 backdrop-blur-2xl shadow-2xl">
                    <GraphControl icon="near_me" active />
                    <GraphControl icon="add_circle" />
                    <GraphControl icon="share" />
                    <div className="w-8 h-px bg-white/10 mx-auto my-1"></div>
                    <GraphControl icon="settings_input_component" />
                </GlassPanel>

                <div className="px-4 py-2 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md text-[9px] font-black tracking-widest text-slate-500 text-center">
                    FORCES: ACTIVE
                </div>
            </aside>

            {/* Main Canvas Area */}
            <main className="flex-1 relative overflow-auto bg-background-dark bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-700/10 via-background to-background cursor-move"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
            >
                {/* Connections */}
                <svg className="absolute top-0 left-0 w-[2000px] h-[2000px] pointer-events-none z-0">
                    {visibleConnections.map((c, i) => {
                        const fromNode = nodes.find(n => n.id === c.from);
                        const toNode = nodes.find(n => n.id === c.to);
                        if (!fromNode || !toNode) return null;

                        return (
                            <g key={i} className="group/line">
                                <line
                                    x1={fromNode.x + 20} y1={fromNode.y + 20}
                                    x2={toNode.x + 20} y2={toNode.y + 20}
                                    stroke="#4f46e5"
                                    strokeWidth="2"
                                    strokeOpacity="0.5"
                                    className="transition-all group-hover/line:stroke-white group-hover/line:stroke-width-4 cursor-pointer"
                                />
                                <title>{c.label}{c.description ? `: ${c.description}` : ''}</title>
                            </g>
                        );
                    })}
                </svg>

                {/* Nodes */}
                {visibleNodes.map(node => (
                    <div
                        key={node.id}
                        onMouseDown={(e) => handleMouseDown(e, node.id)}
                        onClick={() => setSelectedNode(node)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 z-10 ${selectedNode?.id === node.id ? 'scale-125 z-20' : ''}`}
                        style={{ left: node.x, top: node.y }}
                    >
                        <div className={`p-4 rounded-3xl bg-surface-dark border transition-all flex items-center gap-4 shadow-xl ${selectedNode?.id === node.id ? 'border-primary ring-4 ring-primary/20' : 'border-white/5 hover:border-white/20'}`}>
                            <div className={`size-10 rounded-2xl ${node.color} flex items-center justify-center text-white shadow-lg`}>
                                <span className="material-symbols-outlined text-xl">
                                    {node.icon}
                                </span>
                            </div>
                            <div className="pr-4">
                                <h4 className="text-[11px] font-black text-white whitespace-nowrap uppercase tracking-widest">{node.name}</h4>
                                <span className="text-[8px] font-bold text-slate-500 uppercase tracking-[0.2em]">{node.type}</span>
                            </div>
                        </div>
                    </div>
                ))}

                {/* Legend / Overlay */}
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-3 rounded-2xl bg-black/40 border border-white/10 backdrop-blur-xl">
                    <LegendItem color="bg-primary" label="Characters" />
                    <LegendItem color="bg-emerald-500" label="Locations" />
                    <LegendItem color="bg-amber-500" label="Items" />
                </div>
            </main>

            {/* Right Sidebar Inspector */}
            <aside className={`w-80 border-l border-white/5 bg-surface-dark/40 backdrop-blur-xl transition-all duration-700 overflow-hidden flex flex-col ${selectedNode ? 'opacity-100' : 'opacity-0 translate-x-10'}`}>
                {selectedNode && (
                    <div className="p-8 space-y-10">
                        <header className="space-y-6">
                            <div className="flex justify-between items-start">
                                <Avatar name={selectedNode.name} size="xl" className={`border-2 ${selectedNode.color.replace('bg-', 'border-')}/30`} />
                                <button onClick={() => setSelectedNode(null)} className="p-2 rounded-xl hover:bg-white/5 text-slate-600 hover:text-white transition-colors">
                                    <span className="material-symbols-outlined">close</span>
                                </button>
                            </div>
                            <div>
                                <h3 className="text-3xl font-manrope font-black text-white tracking-tight">{selectedNode.name}</h3>
                                <p className="text-[10px] font-black uppercase tracking-widest text-primary mt-1">{selectedNode.type}</p>
                            </div>
                        </header>

                        <div className="space-y-8">
                            <section className="space-y-4">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Active Connections</h4>
                                <div className="space-y-3">
                                    {connections.filter(c => c.from === selectedNode.id || c.to === selectedNode.id).map((c, i) => (
                                        <div key={i} className="flex justify-between items-center p-3 rounded-2xl bg-white/5 border border-white/5">
                                            <span className="text-[10px] font-bold text-slate-300">{nodes.find(n => n.id === (c.from === selectedNode.id ? c.to : c.from)).name}</span>
                                            <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[8px] font-black uppercase">{c.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            <Button variant="primary" icon="auto_stories" className="w-full py-4 rounded-2xl">Open Bible Entry</Button>
                        </div>
                    </div>
                )}
            </aside>
        </div>
    );
};

const GraphControl = ({ icon, active }) => (
    <button className={`size-12 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
    </button>
);

const LegendItem = ({ color, label }) => (
    <div className="flex items-center gap-2">
        <div className={`size-2 rounded-full ${color}`}></div>
        <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    </div>
);

export default GraphView;
