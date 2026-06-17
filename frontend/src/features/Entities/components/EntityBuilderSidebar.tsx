import React from "react";
import ConfirmModal from "@components/ui/ConfirmModal";
import TemplateSettingsModal from "@features/Entities/components/TemplateSettingsModal";
import { useEntityBuilderSidebar } from "../hooks/useEntityBuilderSidebar";
import { Plantilla } from "@domain/database";

interface EntityBuilderSidebarProps {
  templates: Plantilla[];
  onAddTemplate: (tpl: Plantilla) => void;
  onRefresh?: () => void;
  projectId?: number;
}

const EntityBuilderSidebar: React.FC<EntityBuilderSidebarProps> = ({
  templates,
  onAddTemplate,
  onRefresh,
  projectId = 1,
}) => {
  const {
    filter,
    setFilter,
    isCreating,
    setIsCreating,
    newTpl,
    setNewTpl,
    editingTpl,
    setEditingTpl,
    deletingId,
    setDeletingId,
    filteredTemplates,
    handleDragStart,
    handleCreateTemplate,
    handleUpdateTemplate,
    confirmDelete,
  } = useEntityBuilderSidebar(templates, onAddTemplate, onRefresh, projectId);

  return (
    <div className="flex flex-col h-full bg-background w-full">
      <div className="p-[1.5rem] border-b border-foreground/10 bg-gradient-to-br from-primary/10 to-transparent">
        <div className="flex items-center justify-between mb-[0.5rem]">
          <h3 className="text-[0.75rem] font-black uppercase tracking-[0.15em] text-[hsl(var(--primary))] flex items-center gap-[0.5rem]">
            <span className="material-symbols-outlined text-[1rem]">
              schema
            </span>{" "}
            Atributos/Plantillas
          </h3>
          <button
            onClick={() => setIsCreating(!isCreating)}
            className={`size-[2rem] rounded-full flex items-center justify-center transition-all ${isCreating ? "bg-destructive text-primary-foreground rotate-45" : "bg-[hsl(var(--foreground)/0.05)] text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary))] hover:text-[hsl(var(--primary-foreground))]"}`}
          >
            <span className="material-symbols-outlined text-[1rem]">add</span>
          </button>
        </div>

        {isCreating ? (
          <div className="space-y-[0.75rem] p-[1rem] rounded-none bg-background/40 border border-[hsl(var(--primary)/0.2)] animate-in fade-in zoom-in-95">
            <input
              autoFocus
              placeholder="Nombre del atributo..."
              className="w-full bg-transparent border-b border-[hsl(var(--foreground)/0.4)] py-[0.25rem] text-[0.75rem] text-[hsl(var(--foreground))] outline-none focus:border-[hsl(var(--primary))]"
              value={newTpl.nombre}
              onChange={(e) => setNewTpl({ ...newTpl, nombre: e.target.value })}
            />
            <select
              className="w-full monolithic-panel border border-[hsl(var(--foreground)/0.1)] rounded-none px-[0.5rem] py-[0.375rem] text-[0.625rem] text-[hsl(var(--foreground)/0.7)] outline-none bg-background"
              value={newTpl.tipo}
              onChange={(e) => setNewTpl({ ...newTpl, tipo: e.target.value })}
            >
              <option value="text">Texto Largo</option>
              <option value="short_text">Texto Corto</option>
              <option value="number">Número</option>
              <option value="boolean">Booleano</option>
              <option value="date">Fecha</option>
              <option value="select">Selección Única</option>
              <option value="multi_select">Selección Múltiple</option>
            </select>
            <button
              onClick={handleCreateTemplate}
              className="w-full py-[0.5rem] bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] rounded-none text-[0.625rem] font-black uppercase tracking-[0.15em] shadow-lg shadow-[hsl(var(--primary)/0.2)] hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              Crear Módulo
            </button>
          </div>
        ) : (
          <div className="relative">
            <span className="material-symbols-outlined absolute left-[0.75rem] top-1/2 -translate-y-1/2 text-[0.75rem] text-[hsl(var(--foreground)/0.6)]">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar plantillas..."
              className="w-full monolithic-panel rounded-none pl-[2.25rem] pr-[1rem] py-[0.5rem] text-[0.75rem] text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary)/0.5)] outline-none transition-all placeholder:text-[hsl(var(--foreground)/0.2)] bg-background border border-[hsl(var(--foreground)/0.1)]"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
        )}
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-[0.5rem] p-[1rem] pr-[0.5rem]">
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-[2rem] text-foreground/60 text-[0.75rem] italic">
            No se encontraron plantillas.
          </div>
        ) : (
          filteredTemplates.map((tpl) => (
            <div
              key={tpl.id}
              draggable
              onDragStart={(e) => handleDragStart(e, tpl)}
              className="bg-foreground/[0.03] border border-foreground/5 hover:border-primary/30 rounded-none p-[1rem] transition-all group cursor-grab active:cursor-grabbing"
            >
              <div className="flex items-center justify-between mb-[0.5rem]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[hsl(var(--primary)/0.4)] text-[1rem]">
                    drag_indicator
                  </span>
                  <span className="text-[0.75rem] font-bold text-[hsl(var(--foreground))] group-hover:text-[hsl(var(--primary))] transition-colors">
                    {tpl.nombre}
                  </span>
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
                    <span className="material-symbols-outlined text-[0.875rem]">
                      delete
                    </span>
                  </button>
                  <button
                    title="Editar definición"
                    className="size-[1.5rem] rounded-full flex items-center justify-center hover:bg-[hsl(var(--primary)/0.2)] text-[hsl(var(--foreground)/0.4)] hover:text-[hsl(var(--primary))] transition-all"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingTpl(tpl);
                    }}
                  >
                    <span className="material-symbols-outlined text-[1rem]">
                      edit
                    </span>
                  </button>
                </div>
              </div>
              <div className="flex items-center gap-[0.5rem]">
                <div
                  className={`text-[0.5rem] font-black px-[0.5rem] py-[0.125rem] rounded-none uppercase tracking-wider border ${
                    tpl.tipo === "text"
                      ? "bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] border-[hsl(var(--primary)/0.2)]"
                      : tpl.tipo === "number"
                        ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
                        : tpl.tipo === "boolean"
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/20"
                          : "bg-[hsl(var(--foreground)/0.05)] text-[hsl(var(--foreground)/0.6)] border-[hsl(var(--foreground)/0.1)]"
                  }`}
                >
                  {tpl.tipo}
                </div>
                {tpl.es_obligatorio ? (
                  <span className="text-[0.5rem] font-black text-rose-500 uppercase tracking-tight">
                    Obligatorio
                  </span>
                ) : null}
              </div>
            </div>
          ))
        )}
      </div>

      {editingTpl && (
        <TemplateSettingsModal
          template={editingTpl}
          onClose={() => setEditingTpl(null)}
          onSave={async () => {
            if (onRefresh) {
              await onRefresh();
            }
            setEditingTpl(null);
          }}
        />
      )}

      <div className="p-[1rem] border-t border-[hsl(var(--foreground)/0.1)] text-center bg-[hsl(var(--foreground)/0.02)]">
        <p className="text-[0.5625rem] font-bold uppercase tracking-[0.15em] text-[hsl(var(--foreground)/0.4)]">
          Arrastra módulos al centro para añadir
        </p>
      </div>

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

