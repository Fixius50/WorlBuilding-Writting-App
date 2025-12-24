import React, { useState } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Button from '../../components/common/Button';

const MapEditor = ({ mapTitle = 'Reino de Aethelgard', onSave, onBack }) => {
    const [opacity, setOpacity] = useState(100);
    const [brushSize, setBrushSize] = useState(24);
    const [activeTool, setActiveTool] = useState('brush');
    const [activeLayer, setActiveLayer] = useState(1);

    const tools = [
        { id: 'select', icon: 'near_me' },
        { id: 'brush', icon: 'brush' },
        { id: 'eraser', icon: 'ink_eraser' },
        { id: 'fill', icon: 'format_color_fill' },
        { id: 'measure', icon: 'straighten' },
        { id: 'text', icon: 'title' }
    ];

    const layers = [
        { id: 1, name: 'Terreno Base', visible: true, locked: false, type: 'raster' },
        { id: 2, name: 'Ríos y Lagos', visible: true, locked: false, type: 'vector' },
        { id: 3, name: 'Ciudades', visible: true, locked: false, type: 'icon' },
        { id: 4, name: 'Fondo de Papel', visible: true, locked: true, type: 'texture' }
    ];

    return (
        <div className="flex-1 flex flex-col bg-[#050508] text-slate-300 font-sans h-full overflow-hidden relative">
            {/* Top Toolbar */}
            <header className="h-20 flex-none border-b border-white/5 flex items-center justify-between px-8 bg-surface-dark/80 backdrop-blur-md z-30">
                <div className="flex items-center gap-6">
                    <button onClick={onBack} className="p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">arrow_back</span>
                    </button>
                    <div className="w-px h-8 bg-white/10"></div>
                    <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">{mapTitle}</h2>
                        <div className="flex items-center gap-2">
                            <div className="size-1.5 rounded-full bg-primary"></div>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Guardado localmente</span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm font-bold">
                        <span className="material-symbols-outlined text-xl">cloud_upload</span>
                        Guardar
                    </button>
                    <Button variant="primary" icon="ios_share" className="px-6 py-2.5 shadow-lg shadow-primary/20">
                        Exportar
                    </Button>
                    <div className="size-10 rounded-full bg-gradient-to-br from-primary to-cyan-400 border-2 border-white/10 shadow-lg"></div>
                </div>
            </header>

            <div className="flex-1 flex relative overflow-hidden">
                {/* Floating Left Toolbox */}
                <aside className="absolute left-8 top-1/2 -translate-y-1/2 z-40">
                    <GlassPanel className="p-2 flex flex-col gap-2 rounded-2xl border-white/10 bg-surface-dark/40 backdrop-blur-2xl shadow-2xl">
                        {tools.map(tool => (
                            <button
                                key={tool.id}
                                onClick={() => setActiveTool(tool.id)}
                                className={`size-12 rounded-xl flex items-center justify-center transition-all ${activeTool === tool.id ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
                            >
                                <span className="material-symbols-outlined text-xl">{tool.icon}</span>
                            </button>
                        ))}
                        <div className="w-8 h-px bg-white/10 mx-auto my-1"></div>
                        <div className="size-12 rounded-xl flex items-center justify-center relative group cursor-pointer">
                            <div className="size-7 rounded-full bg-red-400 border-2 border-white/20 shadow-inner group-hover:scale-110 transition-transform"></div>
                        </div>
                        <div className="size-12 rounded-xl flex items-center justify-center">
                            <div className="size-7 rounded-full bg-white/5 border border-white/10"></div>
                        </div>
                    </GlassPanel>
                </aside>

                {/* Main Canvas Area */}
                <main className="flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat relative overflow-hidden flex items-center justify-center p-20 no-scrollbar">
                    {/* Grid Background Mock */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                    <div className="relative group animate-in zoom-in-95 duration-700">
                        <p className="absolute -top-10 left-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Lienzo: 1024x768px • RGB</p>

                        <div className="w-[800px] h-[600px] bg-white rounded shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center overflow-hidden border border-white/10">
                            <span className="text-8xl font-manrope font-black text-slate-200 pointer-events-none select-none italic">300x300</span>
                        </div>

                        {/* Interactive UI Overlay (Mock) */}
                        <div className="absolute inset-0 border-2 border-primary/20 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
                    </div>
                </main>

                {/* Right Panels */}
                <aside className="absolute right-8 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-6 w-80">
                    {/* Properties Panel */}
                    <GlassPanel className="p-6 space-y-6 rounded-3xl border-white/10 bg-surface-dark/40 backdrop-blur-2xl shadow-2xl">
                        <header className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Propiedades</h3>
                            <button className="text-slate-600 hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">settings_input_component</span></button>
                        </header>

                        <div className="space-y-6">
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400">Tamaño</span>
                                    <span className="text-xs font-black text-white">{brushSize}px</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="100"
                                    value={brushSize}
                                    onChange={(e) => setBrushSize(e.target.value)}
                                    className="w-full accent-primary h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-bold text-slate-400">Opacidad</span>
                                    <span className="text-xs font-black text-white">{opacity}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="0"
                                    max="100"
                                    value={opacity}
                                    onChange={(e) => setOpacity(e.target.value)}
                                    className="w-full accent-primary h-1 bg-white/5 rounded-full appearance-none cursor-pointer"
                                />
                            </div>

                            <div className="space-y-2">
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 block ml-1">Modo de Fusión</span>
                                <select className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-primary/50 outline-none appearance-none cursor-pointer">
                                    <option>Normal</option>
                                    <option>Multiplicar</option>
                                    <option>Superpolar</option>
                                </select>
                            </div>
                        </div>
                    </GlassPanel>

                    {/* Layers Panel */}
                    <GlassPanel className="p-6 space-y-6 rounded-3xl border-white/10 bg-surface-dark/40 backdrop-blur-2xl shadow-2xl flex-1 max-h-[400px] overflow-hidden flex flex-col">
                        <header className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Capas</h3>
                            <div className="flex gap-2 text-slate-600">
                                <button className="hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">add</span></button>
                                <button className="hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">folder</span></button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                            {layers.map(layer => (
                                <div
                                    key={layer.id}
                                    onClick={() => setActiveLayer(layer.id)}
                                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer group ${activeLayer === layer.id ? 'bg-primary/10 border border-primary/20' : 'bg-transparent border border-transparent hover:bg-white/5'}`}
                                >
                                    <button className={`material-symbols-outlined text-lg ${layer.visible ? 'text-slate-500' : 'text-slate-700'}`}>
                                        {layer.locked ? 'lock' : (layer.visible ? 'visibility' : 'visibility_off')}
                                    </button>
                                    <div className="size-10 rounded-lg bg-surface-light border border-white/5 flex items-center justify-center overflow-hidden">
                                        {layer.name === 'Terreno Base' ? (
                                            <img src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=100&q=80" alt="Thumb" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="material-symbols-outlined opacity-30 text-xl">{layer.type === 'raster' ? 'texture' : layer.type === 'vector' ? 'water_drop' : 'domain'}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold truncate ${activeLayer === layer.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{layer.name}</p>
                                    </div>
                                    <button className="material-symbols-outlined text-slate-700 hover:text-white transition-colors opacity-0 group-hover:opacity-100">edit</button>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </aside>

                {/* Bottom Canvas Controls */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
                    <GlassPanel className="px-6 py-3 flex items-center gap-8 rounded-2xl border-white/10 bg-surface-dark/40 backdrop-blur-2xl shadow-2xl">
                        <div className="flex items-center gap-4 text-slate-500 border-r border-white/10 pr-6">
                            <button className="hover:text-white transition-colors"><span className="material-symbols-outlined">undo</span></button>
                            <button className="hover:text-white transition-colors opacity-30 cursor-not-allowed"><span className="material-symbols-outlined">redo</span></button>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined">remove</span></button>
                            <span className="text-[10px] font-black text-white w-10 text-center">85%</span>
                            <button className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined">add</span></button>
                        </div>
                        <div className="w-px h-6 bg-white/10"></div>
                        <button className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined">fullscreen</span></button>
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
};

export default MapEditor;
