import React from 'react';
import { Shape, LayerData } from '../../../types/canvas';

interface UniversalCanvasPropertiesProps {
 tool: string;
 setTool: (tool: string) => void;
 strokeWidth: number;
 setStrokeWidth: (width: number) => void;
 color: string;
 setColor: (color: string) => void;
 opacity: number;
 setOpacity: (opacity: number) => void;
 lineCap: string;
 setLineCap: (cap: string) => void;
 strokeStyle: string;
 setStrokeStyle: (style: string) => void;
 layers: LayerData[];
 activeLayerId: string;
 setActiveLayerId: (id: string) => void;
 onToggleLayerVisibility: (id: string) => void;
 onToggleLayerLock: (id: string) => void;
 onAddLayer: () => void;
 onDeleteLayer: (id: string) => void;
 activeShape: Shape | null;
 onSetProperty: (prop: string, value: unknown) => void;
 onUndo: () => void;
 onRedo: () => void;
 onClear: () => void;
}

const UniversalCanvasProperties: React.FC<UniversalCanvasPropertiesProps> = ({
 // Tool Props
 tool,
 setTool,
 strokeWidth,
 setStrokeWidth,
 color,
 setColor,
 opacity,
 setOpacity,
 lineCap,
 setLineCap,
 strokeStyle,
 setStrokeStyle,
 // Layer Props
 layers,
 activeLayerId,
 setActiveLayerId,
 onToggleLayerVisibility,
 onToggleLayerLock,
 onAddLayer,
 onDeleteLayer,
 activeShape,
 onSetProperty,
 onUndo,
 onRedo,
 onClear
}) => {
 return (
 <div className="flex flex-col h-full gap-8 p-6 text-foreground/60">
 <section className="bg-foreground/5 rounded-none p-4 grid grid-cols-4 gap-2">
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
 className={`aspect-square rounded-none flex flex-col items-center justify-center gap-1 transition-all ${tool === t.id ? 'bg-primary text-foreground shadow-[0_0_15px_rgba(0,229,255,0.4)]' : 'text-foreground/60 hover:text-foreground hover:bg-foreground/10'}`}
 title={t.label}
 >
 <span className="material-symbols-outlined text-xl">{t.icon}</span>
 </button>
 ))}
 <button
 onClick={onUndo}
 className="aspect-square rounded-none flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/10"
 title="Undo"
 >
 <span className="material-symbols-outlined text-xl">undo</span>
 </button>
 <button
 onClick={onRedo}
 className="aspect-square rounded-none flex items-center justify-center text-foreground/60 hover:text-foreground hover:bg-foreground/10"
 title="Redo"
 >
 <span className="material-symbols-outlined text-xl">redo</span>
 </button>
 <button
 onClick={onClear}
 className="aspect-square rounded-none flex items-center justify-center text-foreground/60 hover:text-red-400 hover:bg-red-400/10"
 title="Clear Canvas"
 >
 <span className="material-symbols-outlined text-xl">delete_sweep</span>
 </button>
 </section>

 <section className="space-y-6">
 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60 border-b border-foreground/10 pb-2">Propiedades</h3>

 <div className="space-y-3">
 <div className="flex justify-between text-[10px] uppercase font-bold text-foreground/60">
 <span>Grosor de Trazo</span>
 <span>{strokeWidth}px</span>
 </div>
 <input
 type="range"
 min="1"
 max="50"
 value={strokeWidth}
 onChange={(e) => setStrokeWidth(parseInt(e.target.value))}
 className="w-full accent-primary h-1 bg-foreground/10 rounded-full appearance-none cursor-pointer"
 />
 </div>

 <div className="space-y-3">
 <div className="flex justify-between text-[10px] uppercase font-bold text-foreground/60">
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
 className="w-full accent-primary h-1 bg-foreground/10 rounded-full appearance-none cursor-pointer"
 />
 </div>

 <div className="space-y-3">
 <span className="text-[10px] uppercase font-bold text-foreground/60">Color / Relleno</span>
 <div className="flex items-center gap-3 p-2 bg-foreground/5 rounded-none border border-foreground/10">
 <input
 type="color"
 value={color}
 onChange={(e) => setColor(e.target.value)}
 className="size-8 rounded cursor-pointer bg-transparent border-none"
 />
 <span className="text-xs font-mono text-primary">{color}</span>
 </div>
 </div>

 <div className="space-y-3">
 <span className="text-[10px] uppercase font-bold text-foreground/60">Terminación (Cap)</span>
 <div className="flex bg-foreground/5 rounded-none p-1">
 {['butt', 'round', 'square'].map(cap => (
 <button
 key={cap}
 onClick={() => setLineCap(cap)}
 className={`flex-1 py-1 rounded text-[10px] uppercase transition-all ${lineCap === cap ? 'bg-primary text-foreground shadow-lg font-black' : 'hover:text-foreground text-foreground/60'}`}
 >
 {cap === 'round' ? '●' : cap === 'square' ? '■' : '|'}
 </button>
 ))}
 </div>
 </div>

 <div className="space-y-3">
 <span className="text-[10px] uppercase font-bold text-foreground/60">Estilo de Trazo</span>
 <div className="flex bg-foreground/5 rounded-none p-1">
 {[
 { id: 'linear', label: 'Línea', icon: 'segment' },
 { id: 'points', label: 'Puntos', icon: 'more_horiz' },
 { id: 'quadratic', label: 'Curva', icon: 'conversion_path' }
 ].map(style => (
 <button
 key={style.id}
 onClick={() => setStrokeStyle(style.id)}
 className={`flex-1 py-1.5 rounded flex items-center justify-center gap-2 text-[9px] uppercase transition-all ${strokeStyle === style.id ? 'bg-primary text-foreground shadow-lg font-black' : 'hover:text-foreground text-foreground/60'}`}
 title={style.label}
 >
 <span className="material-symbols-outlined text-xs">{style.icon}</span>
 </button>
 ))}
 </div>
 </div>
 </section>

 <section className="flex-1 flex flex-col min-h-0 space-y-4">
 <div className="flex items-center justify-between border-b border-foreground/10 pb-2">
 <h3 className="text-xs font-black uppercase tracking-[0.2em] text-primary/60">Capas</h3>
 <button
 onClick={onAddLayer}
 className="size-6 flex items-center justify-center rounded bg-foreground/5 hover:bg-primary hover:text-foreground transition-colors"
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
 className={`group flex items-center gap-3 p-3 rounded-none border transition-all cursor-pointer ${activeLayerId === layer.id
 ? 'bg-primary/10 border-primary/50'
 : 'bg-foreground/5 border-transparent hover:border-foreground/40'
 }`}
 >
 <button
 onClick={(e) => { e.stopPropagation(); onToggleLayerVisibility(layer.id); }}
 className={`text-foreground/60 hover:text-foreground ${!layer.visible && 'opacity-30'}`}
 >
 <span className="material-symbols-outlined text-base">
 {layer.visible ? 'visibility' : 'visibility_off'}
 </span>
 </button>

 <div className="flex-1 flex flex-col">
 <span className={`text-xs font-bold leading-none ${activeLayerId === layer.id ? 'text-foreground' : 'text-foreground/60'}`}>
 {layer.name}
 </span>
 <span className="text-[9px] font-black uppercase text-foreground/60 mt-1">
 {layer.shapes.length} Objetos
 </span>
 </div>

 <div className="flex items-center gap-1">
 <button
 onClick={(e) => { e.stopPropagation(); onToggleLayerLock(layer.id); }}
 className={`text-foreground/60 hover:text-foreground p-1 rounded hover:bg-foreground/5 ${layer.locked ? 'text-red-400 opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
 >
 <span className="material-symbols-outlined text-sm">
 {layer.locked ? 'lock' : 'lock_open'}
 </span>
 </button>
 <button
 onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
 className="p-1 text-foreground/60 hover:text-red-400 opacity-0 group-hover:opacity-100 rounded hover:bg-foreground/5"
 title="Eliminar Capa"
 >
 <span className="material-symbols-outlined text-sm">delete</span>
 </button>
 </div>
 </div>
 ))}
 </div>
 </section>
 </div>
 );
};

export default UniversalCanvasProperties;
