import React from 'react';

const GlyphEditorProperties = ({
    // Tool Props
    tool,
    setTool,
    strokeWidth,
    setStrokeWidth,
    color,
    setColor,
    opacity,
    setOpacity,
    // Layer Props
    layers,
    activeLayerId,
    setActiveLayerId,
    onToggleLayerVisibility,
    onToggleLayerLock,
    onAddLayer,
    onDeleteLayer,
    activeShape
}) => {
    return (
        <div className="flex flex-col h-full gap-8 p-6 text-slate-300">
            {/* --- TOOLS SECTION (Moved from Center) --- */}
            <section className="bg-white/5 rounded-2xl p-4 grid grid-cols-4 gap-2">
                {[
                    { id: 'select', icon: 'near_me', label: 'Select' },
                    { id: 'brush', icon: 'gesture', label: 'Brush' },
                    { id: 'line', icon: 'horizontal_rule', label: 'Line' },
                    { id: 'rect', icon: 'rectangle', label: 'Box' },
                    { id: 'circle', icon: 'circle', label: 'Circle' },
                    { id: 'eraser', icon: 'ink_eraser', label: 'Erase' }
                ].map(t => (
                    <button
                        key={t.id}
                        onClick={() => setTool(t.id)}
                        className={`aspect-square rounded-xl flex flex-col items-center justify-center gap-1 transition-all ${tool === t.id ? 'bg-primary text-white shadow-[0_0_15px_rgba(0,229,255,0.4)]' : 'text-slate-400 hover:text-white hover:bg-white/10'}`}
                        title={t.label}
                    >
                        <span className="material-symbols-outlined text-xl">{t.icon}</span>
                    </button>
                ))}
                {/* Undo/Redo or Helpers placeholders? */}
                <button className="aspect-square rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10" title="Undo"><span className="material-symbols-outlined text-xl">undo</span></button>
                <button className="aspect-square rounded-xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-white/10" title="Redo"><span className="material-symbols-outlined text-xl">redo</span></button>
            </section>

            {/* --- PROPERTIES SECTION --- */}
            <section className="space-y-6">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 border-b border-white/5 pb-2">Propiedades</h3>

                {/* Stroke Width */}
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                        <span>Grosor de Trazo</span>
                        <span>{strokeWidth}px</span>
                    </div>
                    <input
                        type="range"
                        min="1"
                        max="50"
                        value={strokeWidth}
                        onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
                        className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                {/* Opacity */}
                <div className="space-y-3">
                    <div className="flex justify-between text-[10px] uppercase font-bold text-slate-500">
                        <span>Opacidad</span>
                        <span>{Math.round(opacity * 100)}%</span>
                    </div>
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={opacity}
                        onChange={(e) => setOpacity(parseFloat(e.target.value))}
                        className="w-full accent-primary h-1 bg-white/10 rounded-full appearance-none cursor-pointer"
                    />
                </div>

                {/* Color Picker (Simple) */}
                <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Color / Relleno</span>
                    <div className="flex items-center gap-3 p-2 bg-white/5 rounded-lg border border-white/5">
                        <input
                            type="color"
                            value={color}
                            onChange={(e) => setColor(e.target.value)}
                            className="size-8 rounded cursor-pointer bg-transparent border-none"
                        />
                        <span className="text-xs font-mono text-primary">{color}</span>
                    </div>
                </div>

                {/* Line Cap / Join (Visual Toggle) */}
                <div className="space-y-3">
                    <span className="text-[10px] uppercase font-bold text-slate-500">Terminación (Cap)</span>
                    <div className="flex bg-white/5 rounded-lg p-1">
                        {['butt', 'round', 'square'].map(cap => (
                            <button
                                key={cap}
                                className={`flex-1 py-2 rounded text-[10px] uppercase ${activeShape?.lineCap === cap ? 'bg-primary text-white' : 'hover:text-white text-slate-500'}`}
                            >
                                {cap === 'round' ? '●' : cap === 'square' ? '■' : '|'}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* --- LAYERS SECTION --- */}
            <section className="flex-1 flex flex-col min-h-0 space-y-4">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                    <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60">Capas</h3>
                    <button
                        onClick={onAddLayer}
                        className="size-6 flex items-center justify-center rounded bg-white/5 hover:bg-primary hover:text-white transition-colors"
                        title="Nueva Capa"
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                    {layers.slice().reverse().map(layer => (
                        <div
                            key={layer.id}
                            onClick={() => setActiveLayerId(layer.id)}
                            className={`group flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer ${activeLayerId === layer.id
                                ? 'bg-primary/10 border-primary/50'
                                : 'bg-white/5 border-transparent hover:border-white/10'
                                }`}
                        >
                            {/* Visibility Toggle */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleLayerVisibility(layer.id); }}
                                className={`text-slate-500 hover:text-white ${!layer.visible && 'opacity-30'}`}
                            >
                                <span className="material-symbols-outlined text-base">
                                    {layer.visible ? 'visibility' : 'visibility_off'}
                                </span>
                            </button>

                            {/* Layer Info */}
                            <div className="flex-1 flex flex-col">
                                <span className={`text-xs font-bold leading-none ${activeLayerId === layer.id ? 'text-white' : 'text-slate-400'}`}>
                                    {layer.name}
                                </span>
                                <span className="text-[9px] font-black uppercase text-slate-600 mt-1">
                                    {layer.shapes.length} Objetos
                                </span>
                            </div>

                            {/* Lock Toggle */}
                            <button
                                onClick={(e) => { e.stopPropagation(); onToggleLayerLock(layer.id); }}
                                className={`text-slate-500 hover:text-white ${layer.locked ? 'text-red-400' : 'opacity-0 group-hover:opacity-100'}`}
                            >
                                <span className="material-symbols-outlined text-sm">
                                    {layer.locked ? 'lock' : 'lock_open'}
                                </span>
                            </button>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
};

export default GlyphEditorProperties;
