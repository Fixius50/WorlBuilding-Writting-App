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
    <div className="flex flex-col h-full bg-background border-l border-foreground/10 w-full animate-in slide-in-from-right duration-500">
      {/* Header */}
      <div className="p-[1.5rem] border-b border-foreground/10 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-center justify-between mb-[0.5rem]">
          <h3 className="text-[0.75rem] font-black uppercase tracking-[0.15em] text-primary flex items-center gap-[0.5rem]">
            <span className="material-symbols-outlined text-[1rem]">schema</span> Atributos/Plantillas
          </h3>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className={`size-[2rem] rounded-full flex items-center justify-center transition-all ${isCreating ? 'bg-red-500 text-white rotate-45' : 'bg-foreground/5 text-primary hover:bg-primary hover:text-white'}`}
          >
            <span className="material-symbols-outlined text-[1rem]">add</span>
          </button>
        </div>

        {isCreating ? (
          <div className="space-y-[0.75rem] p-[1rem] rounded-none bg-background/40 border border-primary/20 animate-in fade-in zoom-in-95">
            <input
              autoFocus
              placeholder="Nombre del atributo..."
              className="w-full bg-transparent border-b border-foreground/40 py-[0.25rem] text-[0.75rem] text-foreground outline-none focus:border-primary"
              value={newTpl.nombre}
              onChange={e => setNewTpl({ ...newTpl, nombre: e.target.value })}
            />
            <select
              className="w-full monolithic-panel border border-foreground/10 rounded-none px-[0.5rem] py-[0.375rem] text-[0.625rem] text-foreground/70 outline-none bg-background"
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
              className="w-full py-[0.5rem] bg-primary text-white rounded-none text-[0.625rem] font-black uppercase tracking-[0.15em] shadow-lg shadow-primary/20"
            >
              Pre-visualizar Atributo
            </button>
          </div>
        ) : (
          <div className="relative">
            <span className="material-symbols-outlined absolute left-[0.75rem] top-1/2 -translate-y-1/2 text-[0.75rem] text-foreground/60">search</span>
            <input
              type="text"
              placeholder="Buscar plantillas..."
              className="w-full monolithic-panel rounded-none pl-[2.25rem] pr-[1rem] py-[0.5rem] text-[0.75rem] text-foreground focus:border-primary/50 outline-none transition-all placeholder:text-foreground/20 bg-background border border-foreground/10"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        )}
      </div>

      {/* Current Attributes Summary */}
      {currentFields.length > 0 && (
        <div className="space-y-[0.5rem] p-[1.5rem] pt-0 mt-[1rem]">
          <div className="flex items-center gap-[0.5rem] text-foreground/60 px-[0.25rem]">
            <span className="material-symbols-outlined text-[0.75rem]">summary</span>
            <span className="text-[0.625rem] font-black uppercase tracking-[0.15em]">Atributos Activos</span>
          </div>
          <div className="max-h-[12rem] overflow-y-auto custom-scrollbar space-y-[0.25rem] bg-foreground/[0.02] rounded-none p-[0.5rem] border border-foreground/10">
            {currentFields.map((f, i) => (
              <div key={f.id || i} className="flex flex-col p-[0.375rem] rounded-none monolithic-panel border border-foreground/5 bg-background">
                <span className="text-[0.5625rem] font-bold text-primary uppercase tracking-tighter truncate">{f.attribute?.nombre || f.plantilla?.nombre || 'Sin nombre'}</span>
                <span className="text-[0.625rem] text-foreground/60 truncate">
                  {typeof f.value === 'string' && f.value.startsWith('[') ? 'Múltiples valores' : (f.value || '---')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-[0.5rem] p-[1rem] pr-[0.5rem]">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-[2rem] text-foreground/60 text-[0.75rem] italic">
            No se encontraron plantillas.
          </div>
        ) : (
          filteredTemplates.map(tpl => (
            <div
              key={tpl.id}
              className="bg-foreground/[0.03] border border-foreground/5 hover:border-primary/30 rounded-none p-[1rem] transition-all group cursor-pointer"
              onClick={() => onAddTemplate(tpl)}
            >
              <div className="flex items-center justify-between mb-[0.5rem]">
                <span className="text-[0.75rem] font-bold text-foreground group-hover:text-primary transition-colors">{tpl.nombre}</span>
                <span className="material-symbols-outlined text-foreground/40 text-[1rem] opacity-50 group-hover:opacity-100">add_circle</span>
              </div>
              <div className="flex items-center gap-[0.5rem]">
                <div className={`text-[0.5rem] font-black px-[0.5rem] py-[0.125rem] rounded-none uppercase tracking-wider border ${
                  tpl.tipo === 'text' ? 'bg-primary/10 text-primary border-primary/20' :
                  tpl.tipo === 'number' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' :
                  tpl.tipo === 'boolean' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                  'bg-foreground/5 text-foreground/60 border-foreground/10'
                }`}>
                  {tpl.tipo}
                </div>
                {tpl.es_obligatorio ? (
                  <span className="text-[0.5rem] font-black text-rose-500 uppercase tracking-tight">Obligatorio</span>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-[1rem] border-t border-foreground/10 text-center bg-foreground/[0.02]">
        <p className="text-[0.5625rem] font-bold uppercase tracking-[0.15em] text-foreground/40">
          Haz clic para añadir a la entidad
        </p>
      </div>
    </div>
  );
};

export default EntityBuilderSidebar;
