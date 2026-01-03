import React, { useState } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Button from '../../components/common/Button';

const MapEditor = ({ mapTitle = 'Reino de Aethelgard', onSave, onBack }) => {
    const [opacity, setOpacity] = useState(100);
    const [brushSize, setBrushSize] = useState(24);
    const [brushColor, setBrushColor] = useState('#000000');
    const [activeTool, setActiveTool] = useState('brush');
    const [activeLayer, setActiveLayer] = useState(1);

    // Initial Layers
    const [layers, setLayers] = useState([
        { id: 1, name: 'Terreno Base', visible: true, locked: false, type: 'raster' },
        { id: 2, name: 'Ríos y Lagos', visible: true, locked: false, type: 'vector' },
    ]);

    const canvasRef = React.useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);

    const tools = [
        { id: 'select', icon: 'near_me' },
        { id: 'brush', icon: 'brush' },
        { id: 'eraser', icon: 'ink_eraser' },
        { id: 'fill', icon: 'format_color_fill' },
        { id: 'measure', icon: 'straighten' },
        { id: 'text', icon: 'title' }
    ];

    // Helper to get canvas context
    const getCtx = () => canvasRef.current?.getContext('2d');

    const startDrawing = (e) => {
        const layer = layers.find(l => l.id === activeLayer);
        if (!layer || !layer.visible || layer.locked) return;

        const ctx = getCtx();
        if (!ctx) return;

        setIsDrawing(true);
        ctx.beginPath();
        ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);

        // Setup Brush
        ctx.lineWidth = brushSize;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.globalAlpha = opacity / 100;

        if (activeTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
        } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = brushColor;
        }
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const ctx = getCtx();
        if (!ctx) return;

        ctx.lineTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
        ctx.stroke();
    };

    const stopDrawing = () => {
        if (isDrawing) {
            setIsDrawing(false);
            getCtx()?.closePath();
            // Here we would ideally save the layer state to history/state
        }
    };

    // Layer Actions
    const toggleLayerVisibility = (id) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
        // Note: Real implementation would need to redraw the canvas stack based on visibility
    };

    const toggleLayerLock = (id) => {
        setLayers(prev => prev.map(l => l.id === id ? { ...l, locked: !l.locked } : l));
    };

    const addNewLayer = () => {
        const newLayer = {
            id: Date.now(),
            name: `Capa ${layers.length + 1}`,
            visible: true,
            locked: false,
            type: 'raster'
        };
        setLayers([newLayer, ...layers]);
        setActiveLayer(newLayer.id);
    };

    const deleteLayer = (id) => {
        if (layers.length <= 1) return; // Prevent deleting last layer
        setLayers(prev => prev.filter(l => l.id !== id));
        if (activeLayer === id) setActiveLayer(layers[0].id);
    };

    const handleSave = () => {
        const dataUrl = canvasRef.current?.toDataURL();
        console.log("Saving Map Data:", dataUrl ? "Data present" : "Empty");
        // onSave(dataUrl); // Allow parent to handle
        alert("Mapa guardado localmente (Simulado)");
    };

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
                    <button onClick={handleSave} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-sm font-bold">
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

                        {/* Color Picker */}
                        <div className="relative group">
                            <input
                                type="color"
                                value={brushColor}
                                onChange={(e) => setBrushColor(e.target.value)}
                                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                            />
                            <div className="size-12 rounded-xl flex items-center justify-center cursor-pointer">
                                <div className="size-7 rounded-full border-2 border-white/20 shadow-inner group-hover:scale-110 transition-transform" style={{ backgroundColor: brushColor }}></div>
                            </div>
                        </div>
                    </GlassPanel>
                </aside>

                {/* Main Canvas Area */}
                <main className="flex-1 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat relative overflow-hidden flex items-center justify-center p-20 no-scrollbar">
                    {/* Grid Background Mock */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>

                    <div className="relative group animate-in zoom-in-95 duration-700">
                        <p className="absolute -top-10 left-0 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">Lienzo: 800x600px • RGB</p>

                        <div className="relative bg-white rounded shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden border border-white/10 cursor-crosshair">
                            {/* In a real app, you'd layer multiple canvases here. For MVP we use one. */}
                            <canvas
                                ref={canvasRef}
                                width={800}
                                height={600}
                                onMouseDown={startDrawing}
                                onMouseMove={draw}
                                onMouseUp={stopDrawing}
                                onMouseLeave={stopDrawing}
                            />
                        </div>
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
                                    <span className="text-xs font-bold text-slate-400">Tamaño del Pincel</span>
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
                        </div>
                    </GlassPanel>

                    {/* Layers Panel */}
                    <GlassPanel className="p-6 space-y-6 rounded-3xl border-white/10 bg-surface-dark/40 backdrop-blur-2xl shadow-2xl flex-1 max-h-[400px] overflow-hidden flex flex-col">
                        <header className="flex justify-between items-center">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Capas</h3>
                            <div className="flex gap-2 text-slate-600">
                                <button onClick={addNewLayer} className="hover:text-white transition-colors"><span className="material-symbols-outlined text-sm">add</span></button>
                            </div>
                        </header>

                        <div className="flex-1 overflow-y-auto no-scrollbar space-y-2">
                            {layers.map(layer => (
                                <div
                                    key={layer.id}
                                    onClick={() => setActiveLayer(layer.id)}
                                    className={`flex items-center gap-3 p-3 rounded-2xl transition-all cursor-pointer group select-none ${activeLayer === layer.id ? 'bg-primary/10 border border-primary/20' : 'bg-transparent border border-transparent hover:bg-white/5'}`}
                                >
                                    <button
                                        onClick={(e) => { e.stopPropagation(); toggleLayerVisibility(layer.id); }}
                                        className={`material-symbols-outlined text-lg ${layer.visible ? 'text-slate-500 hover:text-white' : 'text-slate-700'}`}
                                    >
                                        {layer.locked ? 'lock' : (layer.visible ? 'visibility' : 'visibility_off')}
                                    </button>

                                    <div className="size-10 rounded-lg bg-surface-light border border-white/5 flex items-center justify-center overflow-hidden">
                                        <span className="material-symbols-outlined opacity-30 text-xl">{layer.type === 'raster' ? 'texture' : 'water_drop'}</span>
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <p className={`text-xs font-bold truncate ${activeLayer === layer.id ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{layer.name}</p>
                                    </div>

                                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={(e) => { e.stopPropagation(); toggleLayerLock(layer.id); }}
                                            className="material-symbols-outlined text-sm text-slate-700 hover:text-white transition-colors"
                                        >
                                            {layer.locked ? 'lock_open' : 'lock'}
                                        </button>
                                        <button
                                            onClick={(e) => { e.stopPropagation(); deleteLayer(layer.id); }}
                                            className="material-symbols-outlined text-sm text-red-900/50 hover:text-red-400 transition-colors"
                                        >
                                            delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </aside>

                {/* Bottom Canvas Controls (Zoom - Mocked) */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-40">
                    <GlassPanel className="px-6 py-3 flex items-center gap-8 rounded-2xl border-white/10 bg-surface-dark/40 backdrop-blur-2xl shadow-2xl">
                        <div className="flex items-center gap-4 text-slate-500 border-r border-white/10 pr-6">
                            <button className="hover:text-white transition-colors"><span className="material-symbols-outlined">undo</span></button>
                            <button className="hover:text-white transition-colors opacity-30 cursor-not-allowed"><span className="material-symbols-outlined">redo</span></button>
                        </div>
                        <div className="flex items-center gap-4">
                            <button className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined">remove</span></button>
                            <span className="text-[10px] font-black text-white w-10 text-center">100%</span>
                            <button className="text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined">add</span></button>
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
};

export default MapEditor;
