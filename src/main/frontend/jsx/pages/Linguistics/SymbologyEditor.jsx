import React, { useState } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Button from '../../components/common/Button';

const SymbologyEditor = ({ onBack, onSave }) => {
    const [strokeWidth, setStrokeWidth] = useState(4);
    const [activeTool, setActiveTool] = useState('curve');
    const [activeLayer, setActiveLayer] = useState(1);

    const tools = [
        { id: 'select', icon: 'near_me' },
        { id: 'curve', icon: 'gesture' },
        { id: 'eraser', icon: 'ink_eraser' },
        { id: 'line', icon: 'horizontal_rule' },
        { id: 'shape', icon: 'pentagon' },
        { id: 'text', icon: 'title' }
    ];

    const layers = [
        { id: 1, name: 'Trazo Principal', type: 'Vector', locked: true, visible: true },
        { id: 2, name: 'Detalles Secundarios', type: 'Vector', locked: true, visible: true },
        { id: 3, name: 'Boceto Ref.', type: 'Imagen (Raster)', locked: true, visible: false }
    ];

    return (
        <div className="flex-1 flex flex-col bg-[#0a0a0f] text-slate-300 font-sans h-full overflow-hidden relative">
            {/* Top Toolbar */}
            <header className="h-20 flex-none border-b border-white/5 flex items-center justify-between px-8 bg-surface-dark/80 backdrop-blur-md z-30">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div>
                        <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500 mb-0.5">
                            <span>Idiomas</span>
                            <span className="material-symbols-outlined text-sm">chevron_right</span>
                            <span className="text-white">Editor Gráfico</span>
                        </nav>
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-4 text-slate-500">
                                <button className="hover:text-white transition-colors"><span className="material-symbols-outlined text-xl">undo</span></button>
                                <button className="hover:text-white transition-colors"><span className="material-symbols-outlined text-xl">redo</span></button>
                            </div>
                            <div className="w-px h-4 bg-white/10 mx-2"></div>
                            <div className="flex gap-1">
                                <button className="p-1 rounded hover:bg-white/5 text-slate-500 hover:text-white"><span className="material-symbols-outlined text-lg">grid_on</span></button>
                                <button className="p-1 rounded bg-white/10 text-primary"><span className="material-symbols-outlined text-sm">hub</span></button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-xs font-black uppercase tracking-widest text-slate-400">
                        <span className="material-symbols-outlined text-lg">download</span>
                        Exportar SVG
                    </button>
                    <Button variant="primary" icon="save" className="px-8 py-3 shadow-xl shadow-primary/30" onClick={onSave}>
                        Guardar Glifo
                    </Button>
                    <div className="size-10 rounded-full bg-gradient-to-br from-primary to-orange-400 border-2 border-white/10 shadow-lg ml-2"></div>
                </div>
            </header>

            <div className="flex-1 flex relative overflow-hidden">
                {/* Full-Height Left Toolbox */}
                <aside className="h-full w-20 flex-none border-r border-white/5 bg-surface-dark/40 backdrop-blur-xl flex flex-col items-center py-6 gap-2 z-40">
                    {tools.map(tool => (
                        <button
                            key={tool.id}
                            onClick={() => setActiveTool(tool.id)}
                            className={`size-12 rounded-2xl flex items-center justify-center transition-all ${activeTool === tool.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-600 hover:text-white hover:bg-white/5'}`}
                        >
                            <span className="material-symbols-outlined text-2xl">{tool.icon}</span>
                        </button>
                    ))}
                    <div className="flex-1"></div>
                    <button className="size-12 rounded-2xl flex items-center justify-center text-slate-600 hover:text-white transition-all"><span className="material-symbols-outlined text-2xl">add_photo_alternate</span></button>
                    <button className="size-12 rounded-2xl flex items-center justify-center text-slate-600 hover:text-white transition-all"><span className="material-symbols-outlined text-2xl">settings</span></button>
                </aside>

                {/* Main Design Area */}
                <main className="flex-1 bg-[#050508] relative overflow-hidden flex items-center justify-center no-scrollbar">
                    {/* Perspective Grid Line Mock */}
                    <div className="absolute inset-x-20 top-1/2 h-px bg-red-500/20 pointer-events-none"></div>

                    <div className="relative group animate-in zoom-in-95 duration-700">
                        {/* Designer's Guideline Overlay */}
                        <div className="absolute inset-x-0 top-10 h-px bg-white/10"></div>
                        <div className="absolute inset-x-0 bottom-10 h-px bg-white/10"></div>

                        <div className="w-[600px] h-[600px] border border-white/5 rounded-3xl bg-black/40 flex items-center justify-center relative overflow-hidden">
                            {/* Vector Simbol Rendering (Mock Visual) */}
                            <svg width="400" height="400" className="drop-shadow-[0_0_20px_rgba(99,102,242,0.5)] scale-125">
                                <circle cx="200" cy="230" r="100" fill="none" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
                                <line x1="200" y1="230" x2="200" y2="380" stroke="#6366f1" strokeWidth="6" strokeLinecap="round" />
                                <circle cx="200" cy="230" r="4" fill="white" />
                                <rect x="196" y="376" width="8" height="8" fill="white" />
                                {/* Blue highlight nodes */}
                                <rect x="96" y="226" width="8" height="8" fill="#6366f1" />
                                <rect x="296" y="226" width="8" height="8" fill="#6366f1" />
                                <rect x="136" y="160" width="6" height="6" fill="#6366f1" className="opacity-40" />
                                <rect x="256" y="160" width="6" height="6" fill="#6366f1" className="opacity-40" />
                            </svg>

                            {/* Anchor Point Labels Mock */}
                            <div className="absolute top-[160px] left-[136px] size-1 border border-primary/40 border-dashed w-[20px] h-[100px] pointer-events-none"></div>
                            <div className="absolute top-[160px] right-[136px] size-1 border border-primary/40 border-dashed w-[20px] h-[100px] pointer-events-none"></div>
                        </div>
                    </div>

                    {/* Bottom Zoom Controls */}
                    <div className="absolute bottom-10 left-1/2 -translate-x-1/2">
                        <GlassPanel className="px-6 py-2.5 flex items-center gap-6 rounded-2xl border-white/10 bg-surface-dark/40 backdrop-blur-2xl shadow-2xl">
                            <button className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">remove</span></button>
                            <span className="text-[10px] font-black text-white w-12 text-center uppercase tracking-widest">120%</span>
                            <button className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">add</span></button>
                        </GlassPanel>
                    </div>
                </main>

                {/* Right Panels */}
                <aside className="w-96 flex-none flex flex-col p-10 gap-10 bg-surface-dark/20 backdrop-blur-xl border-l border-white/5 z-40 overflow-y-auto no-scrollbar">

                    {/* Properties Panel */}
                    <section className="space-y-6">
                        <header className="flex justify-between items-center group cursor-pointer">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Propiedades</h3>
                            <span className="material-symbols-outlined text-slate-700 text-sm">more_horiz</span>
                        </header>

                        <GlassPanel className="p-8 border-white/5 bg-surface-dark/40 rounded-[2rem] space-y-8">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400">Grosor de Trazo</span>
                                    <span className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-black text-white">{strokeWidth}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="20"
                                    value={strokeWidth}
                                    onChange={(e) => setStrokeWidth(e.target.value)}
                                    className="w-full accent-primary h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block ml-1">Color / Relleno</span>
                                <div className="flex items-center gap-4 bg-black/40 rounded-2xl p-4 border border-white/5">
                                    <div className="size-10 rounded-full bg-primary shadow-[0_0_15px_rgba(99,102,242,0.4)] border-2 border-white/20"></div>
                                    <input type="text" defaultValue="#2F2CED" className="bg-transparent border-none outline-none text-xs font-mono text-slate-300 w-full" />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block ml-1">Terminación (Cap)</span>
                                <div className="grid grid-cols-3 gap-2">
                                    <CapButton icon="square" />
                                    <CapButton icon="circle" active />
                                    <CapButton icon="rectangle" />
                                </div>
                            </div>

                            <button className="w-full py-4 rounded-2xl bg-white/5 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                                <span className="material-symbols-outlined text-lg">gesture</span>
                                Suavizar Trazo
                            </button>
                        </GlassPanel>
                    </section>

                    {/* Layers Panel */}
                    <section className="flex-1 flex flex-col gap-6">
                        <header className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Capas</h3>
                            <button className="p-1 rounded bg-white/5 text-slate-500 hover:text-white transition-all"><span className="material-symbols-outlined text-sm">add</span></button>
                        </header>

                        <div className="space-y-3 overflow-y-auto no-scrollbar flex-1">
                            {layers.map(layer => (
                                <div
                                    key={layer.id}
                                    onClick={() => setActiveLayer(layer.id)}
                                    className={`flex items-center gap-4 p-4 rounded-2xl transition-all cursor-pointer group ${activeLayer === layer.id ? 'bg-primary/10 border border-primary/20' : 'bg-white/[0.02] border border-white/5 opacity-60 hover:opacity-100 hover:border-white/10'}`}
                                >
                                    <button className="material-symbols-outlined text-sm text-slate-500 hover:text-white">{layer.visible ? 'visibility' : 'visibility_off'}</button>
                                    <div className="size-10 rounded-xl bg-black border border-white/10 flex items-center justify-center">
                                        <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors text-xl">{layer.type.includes('Vector') ? 'timeline' : 'image'}</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="text-xs font-bold text-white truncate">{layer.name}</h4>
                                        <p className="text-[9px] text-slate-600 font-bold uppercase tracking-widest">{layer.type}</p>
                                    </div>
                                    <button className="material-symbols-outlined text-slate-700 text-sm">lock</button>
                                </div>
                            ))}
                        </div>

                        <div className="flex gap-4 p-3 rounded-2xl bg-black/20 border border-white/5">
                            <button className="flex-1 p-2 rounded-xl hover:bg-white/5 text-slate-700 hover:text-white transition-all"><span className="material-symbols-outlined text-xl">delete</span></button>
                            <button className="flex-1 p-2 rounded-xl hover:bg-white/5 text-slate-700 hover:text-white transition-all"><span className="material-symbols-outlined text-xl">content_copy</span></button>
                            <button className="flex-1 p-2 rounded-xl hover:bg-white/5 text-slate-700 hover:text-white transition-all"><span className="material-symbols-outlined text-xl">folder</span></button>
                        </div>
                    </section>

                    {/* Vectorizing Tooltip Badge */}
                    <div className="p-6 rounded-[2rem] bg-gradient-to-br from-primary/20 to-orange-500/20 border border-white/10 space-y-4">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">auto_fix_high</span>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-white">Vectorización Inteligente</h4>
                        </div>
                        <p className="text-[10px] text-slate-500 leading-relaxed font-manrope">Arrastra una imagen para convertirla automáticamente en nodos editables.</p>
                        <Button variant="primary" size="sm" className="w-full text-[9px] py-3 rounded-xl shadow-lg">Importar y Procesar</Button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const CapButton = ({ icon, active }) => (
    <button className={`py-4 rounded-xl border transition-all flex items-center justify-center ${active ? 'bg-primary/20 border-primary shadow-lg shadow-primary/20' : 'bg-white/5 border-white/5 hover:border-white/10'}`}>
        <span className={`material-symbols-outlined text-lg ${active ? 'text-white' : 'text-slate-600'}`}>{icon}</span>
    </button>
);

export default SymbologyEditor;
