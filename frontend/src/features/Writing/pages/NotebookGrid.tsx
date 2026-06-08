import React from "react";
import ConfirmModal from "@organisms/ConfirmModal";
import InputModal from "@organisms/InputModal";
import { Notebook } from "@domain/models/writing";
import { useNotebookGrid } from "./useNotebookGrid";

interface NotebookGridProps {
  notebooks: Notebook[];
  loading: boolean;
  onSelectNotebook: (notebook: Notebook) => void;
  onCreateNotebook: (title: string) => void;
  onDeleteNotebook: (id: string | number) => void;
  onUpdateNotebook: (
    id: string | number,
    title: string,
    description?: string,
  ) => void;
}

const NotebookGrid: React.FC<NotebookGridProps> = ({
  notebooks,
  loading,
  onSelectNotebook,
  onCreateNotebook,
  onDeleteNotebook,
  onUpdateNotebook,
}) => {
  const {
    isCreateModalOpen,
    setIsCreateModalOpen,
    notebookToDelete,
    setNotebookToDelete,
    notebookToEdit,
    setNotebookToEdit,
    handleCreateSubmit,
    handleDeleteConfirm,
    handleEditSubmit,
  } = useNotebookGrid(onCreateNotebook, onDeleteNotebook, onUpdateNotebook);

  return (
    <div className="p-8 w-full h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <header className="flex justify-center gap-12 text-center items-center mb-12">
          <div>
            <p className="text-foreground/60 font-mono text-sm">
              Select a chronicle to begin writing
            </p>
          </div>
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary/80 text-foreground rounded-none transition-all shadow-lg"
          >
            <span className="material-symbols-outlined">add</span>
            <span className="font-bold tracking-wide text-sm">
              NEW NOTEBOOK
            </span>
          </button>
        </header>

        {loading ? (
          <div className="text-foreground/60">Loading chronicles...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notebooks.map((notebook) => (
              <div
                key={notebook.id}
                onClick={() => onSelectNotebook(notebook)}
                className="group relative monolithic-panel rounded-none p-6 cursor-pointer hover:border-primary/50 hover:shadow-2xl transition-all duration-300 h-64 flex flex-col"
              >
                <div className="flex-1 relative">
                  <div className="flex justify-between items-start">
                    <div className="w-12 h-12 rounded-none bg-foreground/5 flex items-center justify-center text-foreground/60 group-hover:bg-primary/10 group-hover:text-primary transition-colors mb-6">
                      <span className="material-symbols-outlined text-2xl">
                        menu_book
                      </span>
                    </div>

                    <div className="flex items-center gap-1 transition-opacity duration-200">
                      {/* Edit Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotebookToEdit(notebook);
                        }}
                        className="p-2 text-foreground/60 hover:text-primary hover:bg-primary/10 rounded-none transition-all"
                        title="Rename Notebook"
                      >
                        <span className="material-symbols-outlined text-xl">
                          edit
                        </span>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setNotebookToDelete(notebook);
                        }}
                        className="p-2 text-foreground/60 hover:text-destructive hover:bg-red-500/10 rounded-none transition-all"
                        title="Delete Notebook"
                      >
                        <span className="material-symbols-outlined text-xl">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-serif text-foreground/60 group-hover:text-foreground mb-2 line-clamp-2">
                    {notebook.titulo}
                  </h3>
                  <p className="text-foreground/60 text-sm line-clamp-3">
                    {notebook.descripcion || "No description"}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-foreground/10 flex justify-between items-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <span className="text-xs font-mono text-foreground/60">
                    OPEN CHRONICLE
                  </span>
                  <span className="material-symbols-outlined text-foreground/60 text-sm">
                    arrow_forward
                  </span>
                </div>
              </div>
            ))}

            {/* New Notebook Card (Ghost) */}
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="border-2 border-dashed border-foreground/10 rounded-none p-6 h-64 flex flex-col items-center justify-center gap-4 text-foreground/60 hover:text-foreground/60 hover:border-foreground/40 transition-all"
            >
              <span className="material-symbols-outlined text-4xl">add</span>
              <span className="font-mono text-xs uppercase tracking-widest">
                Create New
              </span>
            </button>
          </div>
        )}
      </div>

      {/* MODALS */}
      <InputModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onConfirm={handleCreateSubmit}
        title="New Notebook"
        message="Give a title to your new chronicle."
        placeholder="Ex: The Lost Kingdom"
        confirmText="Create Notebook"
      />

      <InputModal
        isOpen={!!notebookToEdit}
        onClose={() => setNotebookToEdit(null)}
        onConfirm={handleEditSubmit}
        title="Rename Notebook"
        message={`Enter a new title for "${notebookToEdit?.titulo}".`}
        placeholder={notebookToEdit?.titulo}
        confirmText="Update"
      />

      <ConfirmModal
        isOpen={!!notebookToDelete}
        onClose={() => setNotebookToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Notebook?"
        message={`Are you sure you want to delete "${notebookToDelete?.titulo}"? This action cannot be undone and will delete all pages inside.`}
        confirmText="Delete Forever"
        isDestructive={true}
      />
    </div>
  );
};

export default NotebookGrid;
