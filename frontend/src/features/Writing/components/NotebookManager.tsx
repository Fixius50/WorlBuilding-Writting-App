import React from "react";
import ConfirmationModal from "@organisms/ConfirmationModal";
import InputModal from "@organisms/InputModal";
import { Notebook } from "@domain/writing";
import ZenEditor from "@features/Editor/components/ZenEditor";
import { Hoja as HojaModel } from "@domain/database";
import { useNotebookManager } from "./useNotebookManager";

interface NotebookManagerProps {
  projectId: number | string | null;
}

const NotebookManager: React.FC<NotebookManagerProps> = ({ projectId }) => {
  const [isCreateModalOpen, setIsCreateModalOpen] =
    React.useState<boolean>(false);
  const [createTitleAlertOpen, setCreateTitleAlertOpen] =
    React.useState<boolean>(false);
  const {
    notebooks,
    isLoading,
    activeNotebook,
    setActiveNotebook,
    editingTitleId,
    setEditingTitleId,
    confirmDeleteId,
    setConfirmDeleteId,
    createNotebook,
    updateNotebook,
    deleteNotebook,
  } = useNotebookManager(projectId);

  const handleCreateNotebook = (title: string): void => {
    switch (!!title.trim()) {
      case true:
        createNotebook(title);
        setIsCreateModalOpen(false);
        break;
      default:
        setCreateTitleAlertOpen(true);
        break;
    }
  };

  if (isLoading)
    return (
      <div className="p-8 text-center opacity-30 italic text-[10px] uppercase font-bold">
        Iniciando Codex...
      </div>
    );

  if (activeNotebook) {
    // VIEW: Single Notebook Editor
    return (
      <div className="flex flex-col h-full monolithic-panel/50 animate-in slide-in-from-right-4 duration-300">
        {/* Header */}
        <div className="flex items-center gap-2 p-3 border-b border-foreground/10 bg-background">
          <button
            onClick={() => setActiveNotebook(null)}
            className="p-1.5 rounded-none hover:bg-primary/10 text-foreground/60 hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              arrow_back
            </span>
          </button>
          <input
            className="bg-transparent border-none outline-none font-bold text-foreground text-sm w-full placeholder:text-foreground/30"
            value={activeNotebook.titulo}
            onChange={(e) =>
              updateNotebook(activeNotebook.id, "titulo", e.target.value)
            }
            placeholder="Título de la Nota..."
          />
        </div>

        {/* Editor Area */}
        <div className="flex-1 overflow-hidden relative">
          {(() => {
            const page: HojaModel = {
              id: Number(activeNotebook.id) || 0,
              titulo: activeNotebook.titulo,
              contenido: activeNotebook.contenido || "",
              cuaderno_id: 0,
              orden: 0,
              created_at: "",
            };
            return (
              <ZenEditor
                pages={[page]}
                currentPageIndex={0}
                onUpdate={(newContent) =>
                  updateNotebook(activeNotebook.id, "contenido", newContent)
                }
                onTitleChange={() => {}}
                onCreatePage={() => {}}
                onAutoDeletePage={() => {}}
                onSnapshot={() => {}}
              />
            );
          })()}
        </div>

        {/* Footer status */}
        <div className="p-2 text-[10px] text-foreground/60 text-right border-t border-foreground/10">
          {activeNotebook.updatedAt
            ? `Guardado: ${new Date(activeNotebook.updatedAt).toLocaleTimeString()}`
            : "Sin guardar"}
        </div>
      </div>
    );
  }

  // VIEW: Notebook List
  return (
    <div className="flex flex-col h-full monolithic-panel/50">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-foreground/10 bg-background">
        <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60">
          Tus Notas Rápidas
        </h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-primary/20 text-primary hover:bg-primary/30 transition-all text-[10px] font-bold uppercase tracking-wide border border-primary/20"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          Nuevo
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
        {notebooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-foreground/60 space-y-2 opacity-60">
            <span className="material-symbols-outlined text-3xl">
              sticky_note_2
            </span>
            <p className="text-xs">No hay notas</p>
          </div>
        ) : (
          notebooks.map((nb) => (
            <div
              key={nb.id}
              onClick={() => setActiveNotebook(nb)}
              className="group relative bg-foreground/5 hover:monolithic-panel hover:border-primary/30 rounded-none p-3 cursor-pointer transition-all hover:translate-x-1"
            >
              <div className="flex justify-between items-start mb-2">
                {editingTitleId === nb.id.toString() ? (
                  <input
                    className="bg-background/50 border border-primary/50 text-foreground text-xs font-bold rounded px-1 outline-none w-full mr-6"
                    value={nb.titulo}
                    onChange={(e) =>
                      updateNotebook(nb.id, "titulo", e.target.value)
                    }
                    onBlur={() => setEditingTitleId(null)}
                    onKeyDown={(e) =>
                      e.key === "Enter" && setEditingTitleId(null)
                    }
                    autoFocus
                    onClick={(e) => e.stopPropagation()}
                  />
                ) : (
                  <h4 className="text-xs font-bold text-foreground truncate pr-6 group-hover:text-primary transition-colors">
                    {nb.titulo}
                  </h4>
                )}

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setConfirmDeleteId(nb.id.toString());
                  }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-destructive hover:bg-destructive/10 text-foreground/60 transition-all monolithic-panel rounded-none shadow-lg"
                >
                  <span className="material-symbols-outlined text-[14px]">
                    delete
                  </span>
                </button>
              </div>
              <div
                className="text-[10px] text-foreground/60 line-clamp-2"
                dangerouslySetInnerHTML={{
                  __html:
                    nb.contenido?.replace(/<[^>]+>/g, "") || "Sin contenido...",
                }}
              />
            </div>
          ))
        )}
      </div>

      <ConfirmationModal
        isOpen={!!confirmDeleteId}
        onClose={() => setConfirmDeleteId(null)}
        onConfirm={deleteNotebook}
        title="Eliminar Nota"
        message="¿Estás seguro? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        type="danger"
      />

      <InputModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateNotebook}
        title="Nueva Nota"
        message="Escribe el nombre de la nota rápida."
        placeholder="Ej: Ideas del capítulo 1"
        confirmText="Crear"
      />

      <ConfirmationModal
        isOpen={createTitleAlertOpen}
        onClose={() => setCreateTitleAlertOpen(false)}
        onConfirm={() => setCreateTitleAlertOpen(false)}
        title="Título requerido"
        message="Debes escribir un nombre para crear el cuaderno."
        confirmText="Entendido"
        cancelText="Cerrar"
        type="warning"
      />
    </div>
  );
};

export default NotebookManager;
