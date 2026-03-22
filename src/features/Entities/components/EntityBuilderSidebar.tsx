import React, { useState } from 'react';
// Force Refresh 19:12
import { Plantilla, Valor } from '../../../database/types';
import { templateService } from '../../../database/templateService';
import ConfirmModal from '../../../components/common/ConfirmModal';
import Button from '../../../components/common/Button';

interface EntityBuilderSidebarProps {
  templates: Plantilla[];
  onAddTemplate: (tpl: Plantilla) => void;
  onRefresh?: () => void;
  onDeleteTemplate?: (id: number) => void;
  currentFields?: any[]; // Usually Valor[] + isTemp but typed loosely for flexibility in builder
}

const EntityBuilderSidebar: React.FC<EntityBuilderSidebarProps> = ({ 
  templates, 
  onAddTemplate, 
  onRefresh, 
  onDeleteTemplate,
  currentFields = [] 
}) => {
  const [filter, setFilter] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [newTpl, setNewTpl] = useState({ nombre: '', tipo: 'text' });
  const [editingTpl, setEditingTpl] = useState<Plantilla | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const filteredTemplates = (templates || []).filter(tpl =>
    tpl.nombre?.toLowerCase().includes(filter.toLowerCase())
  );

  const handleDragStart = (e: React.DragEvent, template: Plantilla) => {
    const data = JSON.stringify(template);
    e.dataTransfer.setData('application/worldbuilder/attribute', data);
    e.dataTransfer.setData('text/plain', data); // Fallback
    e.dataTransfer.effectAllowed = 'copy';
    
    // Create drag preview ghost - ENHANCED FOR MINIMALISM
    const ghost = document.createElement('div');
    ghost.style.position = 'absolute';
    ghost.style.top = '-1000px'; // Offscreen
    ghost.className = 'px-3 py-1 bg-primary text-white font-black uppercase text-[9px] tracking-widest pointer-events-none shadow-2xl skew-x-[-10deg]';
    ghost.innerText = template.nombre;
    document.body.appendChild(ghost);
    e.dataTransfer.setDragImage(ghost, 0, 0);
    setTimeout(() => { if (document.body.contains(ghost)) document.body.removeChild(ghost); }, 0);
  };

  const handleDeleteTemplate = async (id: number) => {
    // Legacy - replaced by custom modal logic
  };

  const handleCreateTemplate = async () => {
    if (!newTpl.nombre.trim()) return;
    try {
      const created = await templateService.create({
        ...newTpl,
        project_id: 0, // Global Template
        valor_defecto: '',
        metadata: null,
        es_obligatorio: 0
      } as any);
      
      if (onRefresh) await onRefresh();
      onAddTemplate(created);
      setNewTpl({ nombre: '', tipo: 'text' });
      setIsCreating(false);
    } catch (err) {
      console.error('Error creating global template:', err);
    }
  };

  const handleUpdateTemplate = async () => {
    if (!editingTpl || !editingTpl.nombre.trim()) return;
    try {
      await templateService.update(editingTpl.id, {
        nombre: editingTpl.nombre,
        tipo: editingTpl.tipo
      });
      if (onRefresh) await onRefresh();
      setEditingTpl(null);
    } catch (err) {
      console.error('Error updating template:', err);
    }
  };

  const confirmDelete = async () => {
    if (!deletingId) return;
    try {
      await templateService.delete(deletingId);
      if (onRefresh) await onRefresh();
      setDeletingId(null);
    } catch (err) {
      console.error('Error deleting template:', err);
    }
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

      {/* Removed Atributos Activos section as per user request */}

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
              draggable
              onDragStart={(e) => handleDragStart(e, tpl)}
              className="bg-foreground/[0.03] border border-foreground/5 hover:border-primary/30 rounded-none p-[1rem] transition-all group cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center justify-between mb-[0.5rem]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary/40 text-[1rem]">drag_indicator</span>
                  <span className="text-[0.75rem] font-bold text-foreground group-hover:text-primary transition-colors">{tpl.nombre}</span>
                </div>
                <div className="flex items-center gap-1">
                  <button 
                    title="Borrar de la biblioteca"
                    className="size-[1.5rem] rounded-full flex items-center justify-center hover:bg-red-500/20 text-foreground/20 hover:text-red-500 transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingId(tpl.id);
                    }}
                  >
                    <span className="material-symbols-outlined text-[0.875rem]">delete</span>
                  </button>
                  <button 
                    title="Editar definición"
                    className="size-[1.5rem] rounded-full flex items-center justify-center hover:bg-primary/20 text-foreground/40 hover:text-primary transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTpl(tpl);
                    }}
                  >
                    <span className="material-symbols-outlined text-[1rem]">edit</span>
                  </button>
                </div>
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

      {/* Edit Form Overlay/Section */}
      {editingTpl && (
        <div className="p-[1.5rem] border-t border-foreground/10 bg-primary/5 space-y-[0.75rem] animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between">
            <h4 className="text-[0.625rem] font-black uppercase text-primary tracking-widest">Editando Módulo</h4>
            <button onClick={() => setEditingTpl(null)} className="text-foreground/40 hover:text-primary transition-colors">
              <span className="material-symbols-outlined text-[1rem]">close</span>
            </button>
          </div>
          <input
            autoFocus
            className="w-full bg-background border-b border-primary/40 py-[0.25rem] text-[0.75rem] text-foreground outline-none focus:border-primary"
            value={editingTpl.nombre}
            onChange={e => setEditingTpl({ ...editingTpl, nombre: e.target.value })}
          />
          <select
            className="w-full monolithic-panel border border-foreground/10 rounded-none px-[0.5rem] py-[0.375rem] text-[0.625rem] text-foreground/70 outline-none bg-background"
            value={editingTpl.tipo}
            onChange={e => setEditingTpl({ ...editingTpl, tipo: e.target.value as any })}
          >
            <option value="text">Texto Largo</option>
            <option value="short_text">Texto Corto</option>
            <option value="number">Número</option>
            <option value="boolean">Booleano</option>
            <option value="date">Fecha</option>
            <option value="select">Selección Única</option>
          </select>
          <div className="flex gap-2">
            <button
               onClick={() => setEditingTpl(null)}
               className="flex-1 py-[0.5rem] bg-foreground/5 text-foreground/60 text-[0.625rem] font-black uppercase tracking-widest hover:bg-foreground/10"
            >
              Cancelar
            </button>
            <button
              onClick={handleUpdateTemplate}
              className="flex-1 py-[0.5rem] bg-primary text-white text-[0.625rem] font-black uppercase tracking-widest"
            >
              Actualizar
            </button>
          </div>
        </div>
      )}

      {/* Footer Instructions */}
      <div className="p-[1rem] border-t border-foreground/10 text-center bg-foreground/[0.02]">
        <p className="text-[0.5625rem] font-bold uppercase tracking-[0.15em] text-foreground/40">
          Arrastra módulos al centro para añadir
        </p>
      </div>

      {/* Custom Deletion Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={confirmDelete}
        title="Eliminar Atributo Global"
        message="¿Estás seguro de que quieres borrar este módulo? Se eliminará de la biblioteca global y no podrás usarlo en nuevas entidades. Las entidades que ya lo tengan podrían verse afectadas."
        confirmText="Eliminar permanentemente"
        cancelText="Conservar"
        isDestructive={true}
      />
    </div>
  );
};

export default EntityBuilderSidebar;
