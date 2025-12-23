import { useState } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

const GraphView = () => {
    const [layers, setLayers] = useState({
        characters: true,
        locations: true,
        conflicts: false
    });

    // Mock Nodes Data
    const [nodes, setNodes] = useState([
        { id: '1', type: 'character', x: 400, y: 300, label: 'Arion', sub: 'Protagonist', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCcQivzMq-YjwEg-zcTdDlbNkD6ZXeEwr4kyItqswmM8cpLcwaGl3YqInJzc0NaR-CVVgPJRAxu9JzaE1yg7JdjQWVUFqa1uNJu6OqdDfD_pIble5SAGvp5PygxQW18UG0DBFxuHxl7roE_BvTyWCQZw9qrULqDolvrbjQ4TNO2LuBdtzi3XQYmkiulq8TR0q3IEPCUu1yLhFvy_lN1SBCifoKg5MpxaGFMgB7XxO803z97mvJ2WmEp6e6pJCH0WdPtuniehLF_iPk' },
        { id: '2', type: 'character', x: 300, y: 450, label: 'Elara', sub: 'Weaver', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC5wrA90E3iR_n72y4TFiYkSf3rPv_D5QFb0SJth3Kl1UaBKnE7lU0Fsj3O-jCJXEEjk_Gybekesf6hQQLSJ3_OQRotMJ6nQeayQ7roTvhzuK-QF-S0OzPtcsraoXjTnZYSQGFZoPNCl8nnsScT3dJfjfcXshdQxGliJ2VvpZ2WTsag0upqgNgL83K-TiY4FEif3q_RANKImopD6_S1Dx1OlkE_L2U65BoxsFX35Ex3bcKYMLONzF8D6KP47cvaCOgAcWSBH6JHP-A' },
        { id: '3', type: 'location', x: 600, y: 250, label: 'Shadowhold', sub: 'Fortress', img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBjZD3W0wgoLUU8QBGI9cDQSvtddbyvQxPQFs4ZO3ongKxfVCLye41Zid6ZVos779xwVspRP6A0JkWO5o6VruPPusPZw-bPf6HaUFWWM3jNFyHR6RuuGDssk_cd73dm_4YlRQgyrZKYojvJyAHr0iaMiUE3Qq3SrkHxvd5eSWgQ89GeiZTdVGVG4OmkPF6oR8ZM86V8hOLH2pMpRepEelvC8Eg95blntg2Ojb-H6c-tZCYxD-Si6ohaa-rNqu4pWskIBt4lMNMA6xI' },
    ]);

    const links = [
        { from: '1', to: '2', label: 'Estranged Siblings' },
        { from: '1', to: '3', label: 'Seeks Entry' },
    ];

    return (
        <div className="flex h-full relative overflow-hidden bg-background-dark">
            {/* Sidebar (Overlay) */}
            <div className="absolute top-0 left-0 bottom-0 w-80 bg-surface-dark/90 backdrop-blur-md border-r border-glass-border p-4 z-20 flex flex-col">
                <div className="mb-4">
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500">search</span>
                        <input type="text" placeholder="Search entities..." className="w-full bg-surface-light border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-primary" />
                    </div>
                </div>

                <div className="flex gap-2 mb-4 overflow-x-auto no-scrollbar pb-2">
                    <span className="px-3 py-1 rounded-full bg-primary text-white text-xs font-bold whitespace-nowrap">All</span>
                    <span className="px-3 py-1 rounded-full bg-surface-light text-slate-400 hover:text-white text-xs whitespace-nowrap border border-white/5">Characters</span>
                    <span className="px-3 py-1 rounded-full bg-surface-light text-slate-400 hover:text-white text-xs whitespace-nowrap border border-white/5">Locations</span>
                </div>

                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Drag to Canvas</h3>
                <div className="space-y-2 flex-1 overflow-y-auto">
                    {nodes.map(node => (
                        <div key={node.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 cursor-grab active:cursor-grabbing border border-transparent hover:border-white/10 transition-all">
                            <Avatar url={node.img} size="sm" />
                            <div>
                                <div className="text-sm font-bold text-white">{node.label}</div>
                                <div className="text-xs text-slate-500 capitalize">{node.sub}</div>
                            </div>
                            <span className="material-symbols-outlined ml-auto text-slate-600">drag_indicator</span>
                        </div>
                    ))}
                </div>

                <Button className="mt-4 w-full" variant="primary">
                    <span className="material-symbols-outlined">add</span> Create New Entity
                </Button>
            </div>

            {/* Main Canvas */}
            <div className="flex-1 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] relative overflow-hidden cursor-move">
                {/* Header Overlay */}
                <div className="absolute top-4 left-80 right-0 flex justify-center z-10 pointer-events-none">
                    <div className="glass-panel px-4 py-2 flex items-center gap-2 pointer-events-auto">
                        <span className="text-slate-400 text-sm">Project: Aethelgard</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-slate-400 text-sm">Visualizations</span>
                        <span className="text-slate-600">/</span>
                        <span className="flex items-center gap-1 text-emerald-400 text-sm font-bold">
                            <span className="size-2 rounded-full bg-emerald-400"></span>
                            Main Conflict Graph
                        </span>
                    </div>
                </div>

                {/* Layer Control Overlay */}
                <div className="absolute top-4 right-4 z-20">
                    <GlassPanel className="p-4 w-64">
                        <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4">Visible Layers</h4>
                        <div className="space-y-3">
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-purple-400">group</span>
                                    <span className="text-sm text-white">Characters</span>
                                </div>
                                <input type="checkbox" checked={layers.characters} onChange={() => setLayers({ ...layers, characters: !layers.characters })} className="accent-primary size-4 rounded bg-surface-dark border-white/20" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-emerald-400">public</span>
                                    <span className="text-sm text-white">Locations</span>
                                </div>
                                <input type="checkbox" checked={layers.locations} onChange={() => setLayers({ ...layers, locations: !layers.locations })} className="accent-primary size-4 rounded bg-surface-dark border-white/20" />
                            </label>
                            <label className="flex items-center justify-between cursor-pointer group">
                                <div className="flex items-center gap-2">
                                    <span className="material-symbols-outlined text-orange-400">bolt</span>
                                    <span className="text-sm text-white">Conflicts</span>
                                </div>
                                <input type="checkbox" checked={layers.conflicts} onChange={() => setLayers({ ...layers, conflicts: !layers.conflicts })} className="accent-primary size-4 rounded bg-surface-dark border-white/20" />
                            </label>
                        </div>
                    </GlassPanel>
                </div>

                {/* SVG Render */}
                <svg className="w-full h-full pointer-events-none">
                    <defs>
                        <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="28" refY="3.5" orient="auto">
                            <polygon points="0 0, 10 3.5, 0 7" fill="#4f51c0" />
                        </marker>
                    </defs>
                    {/* Connections */}
                    {links.map((link, i) => {
                        const start = nodes.find(n => n.id === link.from);
                        const end = nodes.find(n => n.id === link.to);
                        if (!start || !end) return null;
                        return (
                            <g key={i}>
                                <line
                                    x1={start.x} y1={start.y}
                                    x2={end.x} y2={end.y}
                                    stroke="#4f51c0"
                                    strokeWidth="2"
                                    strokeDasharray="5,5"
                                    markerEnd="url(#arrowhead)"
                                />
                                <rect x={(start.x + end.x) / 2 - 40} y={(start.y + end.y) / 2 - 10} width="80" height="20" rx="10" fill="#0f172a" fillOpacity="0.8" />
                                <text x={(start.x + end.x) / 2} y={(start.y + end.y) / 2} dy="4" textAnchor="middle" fill="#94a3b8" fontSize="10">{link.label}</text>
                            </g>
                        );
                    })}
                </svg>

                {/* Nodes (HTML Overlay for interaction) */}
                <div className="absolute inset-0 pointer-events-none">
                    {nodes.map(node => (
                        <div
                            key={node.id}
                            style={{ left: node.x, top: node.y }}
                            className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-auto cursor-pointer group"
                        >
                            <div className={`size-16 rounded-full p-1 bg-surface-dark border-2 ${node.id === '1' ? 'border-primary shadow-[0_0_20px_rgba(99,102,242,0.4)]' : 'border-white/20 hover:border-white'}`}>
                                <Avatar url={node.img} size="full" className="rounded-full" />
                            </div>
                            {node.id === '1' && (
                                <div className="absolute -top-1 -right-1 size-6 bg-surface-dark rounded-full flex items-center justify-center border border-primary">
                                    <span className="material-symbols-outlined text-[14px] text-primary">star</span>
                                </div>
                            )}
                            <div className="mt-2 glass-panel px-3 py-1 text-center">
                                <div className="text-sm font-bold text-white leading-tight">{node.label}</div>
                                <div className="text-[10px] text-slate-400">{node.sub}</div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Controls */}
                <div className="absolute bottom-6 left-1/2 -translate-x-1/2">
                    <GlassPanel className="flex items-center gap-4 p-2 px-4">
                        <button className="text-white hover:text-primary"><span className="material-symbols-outlined">remove</span></button>
                        <span className="text-sm font-mono text-slate-400 w-12 text-center">100%</span>
                        <button className="text-white hover:text-primary"><span className="material-symbols-outlined">add</span></button>
                        <div className="w-px h-4 bg-white/10"></div>
                        <button className="text-white hover:text-primary"><span className="material-symbols-outlined">center_focus_strong</span></button>
                        <button className="bg-primary hover:bg-primary-hover text-white rounded p-1"><span className="material-symbols-outlined">grid_view</span></button>
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
};

export default GraphView;
