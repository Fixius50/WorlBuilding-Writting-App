import React from "react";
import { useLanguage } from "@context/LanguageContext";
import { Outlet, useOutletContext } from "react-router-dom";
import BibleTableView from "../components/BibleTableView";
import CreateArchetypeModal from "../components/CreateArchetypeModal";
import { ArchitectContext } from "@domain/models/ui";
import ConfirmationModal from "@organisms/ConfirmationModal";
import { useWorldBibleLayout } from "./useWorldBibleLayout";

const WorldBibleLayout: React.FC = () => {
  const { t } = useLanguage();
  const architectContext = useOutletContext<ArchitectContext>();

  const {
    viewMode,
    setViewMode,
    creationModalOpen,
    setCreationModalOpen,
    targetParent,
    localEntities,
    localFolders,
    currentFolder,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    setEntityToDelete,
    isRoot,
    isEditorView,
    dynamicTitle,
    handleOpenCreateModal,
    confirmDeleteEntity,
    handleCreateSubmit,
    handleCreateSubmitAndEdit,
    projectName,
    navigate,
    projectId,
    currentFolderId,
    setTargetParent,
    entityId,
  } = useWorldBibleLayout(architectContext);

  if (!architectContext)
    return (
      <div className="p-20 text-center animate-pulse">
        Cargando contexto raíz...
      </div>
    );

  return (
    <div className="flex h-full w-full bg-background max-w-[1920px] mx-auto overflow-hidden">
      <main className="flex-1 overflow-y-auto custom-scrollbar relative bg-gradient-to-br from-background-dark to-surface-dark/20 text-foreground flex flex-col">
        {!isEditorView && (
          <header className="pt-12 pb-8 flex flex-col items-center justify-center text-center px-8 z-[100] shrink-0 animate-in fade-in slide-in-from-top-4 duration-700">
            <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.3em] text-[hsl(var(--primary))] italic mb-4">
              <span className="material-symbols-outlined text-sm">
                auto_stories
              </span>
              {t("nav.bible")}
            </div>
            <h1 className="text-5xl font-black text-[hsl(var(--foreground))] tracking-tighter mb-6 drop-shadow-2xl">
              {dynamicTitle}
            </h1>

            <div className="w-full max-w-xl space-y-6">
              <div className="flex items-center gap-0 bg-[hsl(var(--foreground)/0.02)] border border-[hsl(var(--foreground)/0.1)] focus-within:border-[hsl(var(--primary)/0.5)] transition-all group">
                <div className="relative flex-1 flex items-center">
                  <span className="absolute left-4 material-symbols-outlined text-[hsl(var(--foreground)/0.2)] group-focus-within:text-[hsl(var(--primary))] transition-colors">
                    search
                  </span>
                  <input
                    value={architectContext.searchTerm}
                    onChange={(e) =>
                      architectContext.setSearchTerm(e.target.value)
                    }
                    className="w-full bg-transparent p-4 pl-12 outline-none text-sm placeholder:italic"
                    placeholder="Buscar en el archivo central..."
                  />
                </div>

                <div className="h-8 w-px bg-[hsl(var(--foreground)/0.1)]" />

                <div className="relative">
                  <select
                    value={architectContext.filterType || "ALL"}
                    onChange={(e) =>
                      architectContext.setFilterType?.(e.target.value)
                    }
                    className="bg-transparent pl-4 pr-10 py-4 text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.6)] hover:text-[hsl(var(--primary))] outline-none appearance-none cursor-pointer transition-colors"
                  >
                    <option value="ALL">Todo</option>
                    <option value="SPACES">Espacios</option>
                    <option value="ENTITIES">Entidades</option>
                    <option value="MAPS">Mapas</option>
                    <option value="TIMELINES">Líneas</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-xs pointer-events-none opacity-40">
                    expand_more
                  </span>
                </div>
              </div>

              {isRoot ? (
                <div className="flex items-center justify-center gap-2 bg-background  border border-[hsl(var(--foreground)/0.1)] p-1 w-fit mx-auto rounded-full shadow-2xl animate-in fade-in zoom-in-95">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setViewMode("folders");
                    }}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-500 ${
                      viewMode === "folders"
                        ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.2)]"
                        : "text-[hsl(var(--foreground)/0.4)] hover:text-[hsl(var(--foreground)/0.8)]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      folder
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Carpetas
                    </span>
                  </button>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setViewMode("table");
                    }}
                    className={`flex items-center gap-2 px-6 py-2 rounded-full transition-all duration-500 ${
                      viewMode === "table"
                        ? "bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] shadow-lg shadow-[hsl(var(--primary)/0.2)]"
                        : "text-[hsl(var(--foreground)/0.4)] hover:text-[hsl(var(--foreground)/0.8)]"
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      table_rows
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-widest">
                      Gestor
                    </span>
                  </button>
                </div>
              ) : (
                <div className="flex flex-wrap items-center justify-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                  <button
                    onClick={() => navigate(`/local/${projectName}/bible`)}
                    className="flex items-center gap-3 px-6 py-2.5 bg-[hsl(var(--foreground)/0.05)] hover:bg-[hsl(var(--foreground)/0.1)] border border-[hsl(var(--foreground)/0.1)] text-[hsl(var(--primary))] hover:text-[hsl(var(--foreground))] transition-all rounded-full group"
                  >
                    <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                      arrow_back
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Volver
                    </span>
                  </button>

                  {entityId && (
                    <button
                      onClick={() =>
                        navigate(
                          `/local/${projectName}/bible/entity/${entityId}/edit`,
                        )
                      }
                      className="flex items-center gap-3 px-6 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-500 transition-all rounded-full group"
                    >
                      <span className="material-symbols-outlined text-sm">
                        edit
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                        Editar Registro
                      </span>
                    </button>
                  )}

                  <button
                    onClick={() => handleOpenCreateModal(currentFolder, "node")}
                    className="flex items-center gap-3 px-6 py-2.5 bg-primary/10 hover:bg-primary/20 border border-primary/20 text-primary transition-all rounded-full group"
                  >
                    <span className="material-symbols-outlined text-sm">
                      add_circle
                    </span>
                    <span className="text-[10px] font-black uppercase tracking-[0.2em]">
                      Nuevo Nodo
                    </span>
                  </button>
                </div>
              )}
            </div>
          </header>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
          {!isRoot || viewMode === "folders" ? (
            <Outlet
              context={{
                ...architectContext,
                folders: localFolders,
                entities: localEntities,
                currentFolder,
                allFolders: architectContext.folders || [],
                handleOpenCreateModal: (folder?: any) =>
                  handleOpenCreateModal(folder || currentFolder),
                handleDeleteEntity: (id: number) => {
                  setEntityToDelete(id);
                  setDeleteConfirmOpen(true);
                },
                setRightOpen: (_open: boolean) => {
                  // Panel derecho eliminado: antes abría/cerraba panel contextual desde Biblia.
                },
                setRightPanelTab: (_tab: unknown) => {
                  // Panel derecho eliminado: antes sincronizaba pestaña activa del panel.
                },
                setRightPanelContent: (_content: React.ReactNode) => {
                  // Panel derecho eliminado: antes inyectaba contenido custom del panel.
                },
                setRightPanelTitle: (_title: React.ReactNode) => {
                  // Panel derecho eliminado: antes definía título del panel contextual.
                },
              }}
            />
          ) : (
            <BibleTableView
              projectId={architectContext.projectId}
              allFolders={architectContext.folders || []}
              filterType={architectContext.filterType}
              searchTerm={architectContext.searchTerm}
              handleOpenCreateModal={handleOpenCreateModal}
            />
          )}
        </div>
      </main>

      <CreateArchetypeModal
        isOpen={creationModalOpen}
        onClose={() => setCreationModalOpen(false)}
        onCreate={handleCreateSubmit}
        onCreateAndEdit={handleCreateSubmitAndEdit}
        parentFolder={targetParent}
      />

      <ConfirmationModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDeleteEntity}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer."
        confirmText="Borrar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default WorldBibleLayout;
