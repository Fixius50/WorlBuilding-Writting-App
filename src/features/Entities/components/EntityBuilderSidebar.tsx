import React, { useState } from 'react';
import { Plantilla, Valor } from '../../../database/types';

interface EntityBuilderSidebarProps {
 templates: Plantilla[];
 onAddTemplate: (tpl: Plantilla) => void;
 currentFields?: any[]; // Usually Valor[] + isTemp but typed loosely for flexibility in builder
}

const EntityBuilderSidebar: React.FC<EntityBuilderSidebarProps> = ({ templates, onAddTemplate, currentFields = [] }) => {
 const [filter, setFilter] = useState('');
 const [isCreating, setIsCreating] = useState(false);
 const [newTpl, setNewTpl] = useState({ nombre: '', tipo: 'text' });

 const filteredTemplates = (templates || []).filter(tpl =>
 tpl.nombre?.toLowerCase().includes(filter.toLowerCase())
 );

 const handleDragStart = (e: React.DragEvent, template: Plantilla) => {
 e.dataTransfer.setData('application/reactflow/type', 'attribute');
 e.dataTransfer.setData('templateId', template.id.toString());
 e.dataTransfer.setData('templateData', JSON.stringify(template));
 e.dataTransfer.effectAllowed = 'copy';
 };

 const handleCreateTemplate = () => {
 if (!newTpl.nombre.trim()) return;
 // The real template save should happen in project settings, 
 // but here we can emit a temporary one or trigger a service call.
 onAddTemplate({
 ...newTpl,
 id: Date.now(),
 project_id: 1, // Placeholder
 valor_defecto: '',
 metadata: null,
 es_obligatorio: 0,
 created_at: new Date().toISOString()
 } as Plantilla);
 setNewTpl({ nombre: '', tipo: 'text' });
 setIsCreating(false);
 };

 return (
 <div className="flex flex-col h-full bg-[#0a0a0c] border-l border-foreground/10 w-full animate-in slide-in-from-right duration-500">
 {/* Header */}
 <div className="p-6 border-b border-foreground/10 bg-gradient-to-br from-indigo-500/10 to-transparent">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-xs font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2">
 <span className="material-symbols-outlined text-sm">schema</span> Atributos/Plantillas
 </h3>
 <button
 onClick={() => setIsCreating(!isCreating)}
 className={`size-8 rounded-full flex items-center justify-center transition-all ${isCreating ? 'bg-red-500 text-foreground rotate-45' : 'bg-foreground/5 text-indigo-400 hover:bg-indigo-500 hover:text-foreground'}`}
 >
 <span className="material-symbols-outlined text-sm">add</span>
 </button>
 </div>

 {isCreating ? (
 <div className="space-y-3 p-4 rounded-none bg-background/40 border border-indigo-500/20 animate-in fade-in zoom-in-95">
 <input
 autoFocus
 placeholder="Nombre del atributo..."
 className="w-full bg-transparent border-b border-foreground/40 py-1 text-xs text-foreground outline-none focus:border-indigo-400"
 value={newTpl.nombre}
 onChange={e => setNewTpl({ ...newTpl, nombre: e.target.value })}
 />
 <select
 className="w-full monolithic-panel rounded-none px-2 py-1.5 text-[10px] text-foreground/70 outline-none"
 value={newTpl.tipo}
 onChange={e => setNewTpl({ ...newTpl, tipo: e.target.value })}
 >
 <option value="text">Texto Largo</option>
 <option value="short_text">Texto Corto</option>
 <option value="number">Número</option>
 <option value="boolean">Booleano</option>
 <option value="date">Fecha</option>
 <option value="select">Selección Única</option>
 </select>
 <button
 onClick={handleCreateTemplate}
 className="w-full py-2 bg-indigo-500 text-foreground rounded-none text-[10px] font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20"
 >
 Pre-visualizar Atributo
 </button>
 </div>
 ) : (
 <div className="relative">
 <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xs text-foreground/60">search</span>
 <input
 type="text"
 placeholder="Buscar plantillas..."
 className="w-full monolithic-panel rounded-none pl-9 pr-4 py-2 text-xs text-foreground focus:border-indigo-500/50 outline-none transition-all placeholder:text-foreground/10"
 value={filter}
 onChange={(e) => setFilter(e.target.value)}
 />
 </div>
 )}
 </div>

 {/* Current Attributes Summary */}
 {currentFields.length > 0 && (
 <div className="space-y-2 p-6 pt-0 mt-4">
 <div className="flex items-center gap-2 text-foreground/60 px-1">
 <span className="material-symbols-outlined text-xs">summary</span>
 <span className="text-[10px] font-black uppercase tracking-widest">Atributos Activos</span>
 </div>
 <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 bg-white/[0.02] rounded-none p-2 border border-foreground/10">
 {currentFields.map((f, i) => (
 <div key={f.id || i} className="flex flex-col p-1.5 rounded monolithic-panel">
 <span className="text-[9px] font-bold text-indigo-400 uppercase tracking-tighter truncate">{f.attribute?.nombre || f.plantilla?.nombre || 'Sin nombre'}</span>
 <span className="text-[10px] text-foreground/60 truncate text-xs">
 {typeof f.value === 'string' && f.value.startsWith('[') ? 'Múltiples valores' : (f.value || '---')}
 </span>
 </div>
 ))}
 </div>
 </div>
 )}

 {/* List */}
 <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 p-4 pr-2">
 {filteredTemplates.length === 0 ? (
 <div className="text-center py-8 text-foreground/60 text-xs italic">
 No se encontraron plantillas.
 </div>
 ) : (
 filteredTemplates.map(tpl => (
 <div
 key={tpl.id}
 draggable
 onDragStart={(e) => handleDragStart(e, tpl)}
 className="bg-[#1a1a20] hover:monolithic-panel hover:border-indigo-500/30 rounded-none p-4 cursor-grab active:cursor-grabbing transition-all group"
 >
 <div className="flex items-center justify-between mb-2">
 <span className="text-xs font-bold text-foreground group-hover:text-indigo-400 transition-colors">{tpl.nombre}</span>
 <span className="material-symbols-outlined text-foreground/60 text-sm opacity-50">drag_indicator</span>
 </div>
 <div className="flex items-center gap-2">
 <div className={`text-[8px] font-black px-2 py-0.5 rounded uppercase tracking-wider ${
 tpl.tipo === 'text' ? 'bg-indigo-500/10 text-indigo-300' :
 tpl.tipo === 'number' ? 'bg-emerald-500/10 text-emerald-300' :
 tpl.tipo === 'boolean' ? 'bg-amber-500/10 text-amber-300' :
 'bg-foreground/5 text-foreground/60'
 }`}>
 {tpl.tipo}
 </div>
 {tpl.es_obligatorio ? (
 <span className="text-[8px] font-black text-rose-500 uppercase tracking-tight">Obligatorio</span>
 ) : null}
 </div>
 </div>
 ))
 )}
 </div>

 {/* Footer */}
 <div className="p-4 border-t border-foreground/10 text-center">
 <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/60">
 Arrastra para añadir a la entidad
 </p>
 </div>
 </div>
 );
};

export default EntityBuilderSidebar;
