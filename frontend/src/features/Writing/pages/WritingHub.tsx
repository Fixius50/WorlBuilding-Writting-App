import React from "react";
import { useNavigate, useOutletContext } from "react-router-dom";
import { MonolithicPanel } from "@components";
import { ConfirmationModal } from "@components";
import { useWritingHub } from "./useWritingHub";

interface WritingOutletContext {
  projectId: number;
  setRightPanelTab: (tab: string) => void;
  baseUrl: string;
}

interface NotebookCardMetadata {
  status: "idea" | "draft" | "review" | "done";
  priority: "low" | "medium" | "high";
  audience: string;
}

const parseCardMetadata = (
  raw: string | null | undefined,
): NotebookCardMetadata => {
  try {
    const parsedUnknown: unknown = raw ? JSON.parse(raw) : {};
    const parsed = parsedUnknown as Partial<NotebookCardMetadata>;
    return {
      status: parsed.status || "idea",
      priority: parsed.priority || "medium",
      audience: parsed.audience || "",
    };
  } catch {
    return {
      status: "idea",
      priority: "medium",
      audience: "",
    };
  }
};

const statusLabelMap: Record<NotebookCardMetadata["status"], string> = {
  idea: "Idea",
  draft: "Borrador",
  review: "Revisión",
  done: "Finalizado",
};

const statusClassMap: Record<NotebookCardMetadata["status"], string> = {
  idea: "bg-[hsl(var(--color-blue)/0.12)] text-[hsl(var(--color-blue))] border-[hsl(var(--color-blue)/0.35)]",
  draft: "bg-[hsl(var(--color-amber)/0.12)] text-[hsl(var(--color-amber))] border-[hsl(var(--color-amber)/0.35)]",
  review: "bg-[hsl(var(--color-purple)/0.12)] text-[hsl(var(--color-purple))] border-[hsl(var(--color-purple)/0.35)]",
  done: "bg-[hsl(var(--color-emerald)/0.12)] text-[hsl(var(--color-emerald))] border-[hsl(var(--color-emerald)/0.35)]",
};

const priorityLabelMap: Record<NotebookCardMetadata["priority"], string> = {
  low: "Prioridad baja",
  medium: "Prioridad media",
  high: "Prioridad alta",
};

const priorityClassMap: Record<NotebookCardMetadata["priority"], string> = {
  low: "bg-foreground/10 text-foreground/70 border-foreground/10",
  medium: "bg-[hsl(var(--color-amber)/0.12)] text-[hsl(var(--color-amber))] border-[hsl(var(--color-amber)/0.35)]",
  high: "bg-[hsl(var(--color-destructive)/0.12)] text-[hsl(var(--color-destructive))] border-[hsl(var(--color-destructive)/0.35)]",
};

const WritingHub = () => {
  const navigate = useNavigate();
  const [titleAlertOpen, setTitleAlertOpen] = React.useState<boolean>(false);
  const outlet = useOutletContext<WritingOutletContext>();
  const { setRightPanelTab, baseUrl, projectId } = outlet || {
    projectId: 1,
    baseUrl: "",
  };

  const {
    notebooks,
    loading,
    isCreating,
    notebookToEdit,
    searchTerm,
    setSearchTerm,
    submitError,
    saving,
    title,
    setTitle,
    genre,
    setGenre,
    metadata,
    setMetadata,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  } = useWritingHub(Number(projectId), setRightPanelTab);

  const handleSubmitWithValidation = (): void => {
    switch (!!title.trim()) {
      case true:
        handleSubmit();
        break;
      default:
        setTitleAlertOpen(true);
        break;
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor-base">
        <div className="animate-spin text-primary material-symbols-outlined text-4xl">
          sync
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col bg-editor-base px-[clamp(1rem,2.2vw,2rem)] py-[clamp(0.75rem,1.6vw,1.5rem)]">
      <header className="mb-[clamp(0.75rem,1.8vw,1.5rem)] flex flex-col items-center text-center animate-in fade-in slide-in-from-top-4 duration-700 shrink-0">
        <div className="mb-[clamp(0.5rem,1.4vw,1rem)]">
          <p className="text-foreground/40 font-serif italic text-[clamp(0.95rem,1.4vw,1.2rem)] opacity-80 uppercase tracking-[0.1em]">
            Crónicas y Archivadores
          </p>
        </div>

        {/* Buscador Dinámico Centrado */}
        <div className="w-full max-w-[min(100%,38rem)] relative group">
          <div className="relative flex items-center bg-background border border-foreground/10 group-focus-within:border-primary/40 transition-all">
            <span className="material-symbols-outlined ml-[clamp(0.6rem,1.2vw,1rem)] text-foreground/20 group-focus-within:text-primary transition-colors">
              search
            </span>
            <input
              type="text"
              placeholder="BUSCAR EN LA BIBLIOTECA..."
              className="w-full bg-transparent border-none px-[clamp(0.5rem,1.2vw,1rem)] py-[clamp(0.65rem,1.4vw,0.95rem)] text-[clamp(0.55rem,0.75vw,0.68rem)] font-black uppercase tracking-[0.24em] text-foreground outline-none placeholder:text-foreground/20"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="mr-[clamp(0.5rem,1.2vw,1rem)] text-foreground/20 hover:text-foreground transition-colors"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar pr-1">
        <div className="grid grid-cols-[repeat(auto-fill,minmax(15rem,1fr))] gap-[clamp(0.65rem,1.4vw,1rem)] content-start pb-2">
          {/* Siempre mostramos la tarjeta de creación al principio */}
          <div
            onClick={openCreateModal}
            className="group relative h-[clamp(12.5rem,28vh,15rem)] border-[0.14rem] border-dashed border-foreground/10 flex flex-col items-center justify-center gap-[clamp(0.45rem,1.2vw,0.8rem)] text-foreground/20 hover:text-primary/60 hover:border-primary/40 cursor-pointer transition-all bg-background"
          >
            <div className="size-[clamp(2.5rem,5.8vw,3.6rem)] rounded-none bg-primary/5 border border-primary/10 flex items-center justify-center text-primary/40 group-hover:text-primary group-hover:scale-110 group-hover:border-primary/30 transition-all duration-500">
              <span className="material-symbols-outlined text-[clamp(1.35rem,3.6vw,2.1rem)]">
                add_circle
              </span>
            </div>
            <span className="text-[clamp(0.55rem,0.75vw,0.68rem)] font-black uppercase tracking-[0.24em] group-hover:text-foreground transition-colors">
              Nueva Crónica
            </span>
          </div>

          {notebooks.map((nb) => (
            <MonolithicPanel
              key={nb.id}
              onClick={() => navigate(`${baseUrl}/writing/${nb.id}`)}
              className="group relative h-[clamp(12.5rem,28vh,15rem)] p-[clamp(0.9rem,1.9vw,1.3rem)] cursor-pointer flex flex-col justify-between overflow-hidden hover:border-primary/40 transition-all hover:-translate-y-1"
            >
              {(() => {
                const cardMetadata = parseCardMetadata(nb.metadata_json);
                return (
                  <>
                    {/* Indicador lateral Zen */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/20 group-hover:bg-primary transition-all duration-500"></div>

                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="size-[clamp(2.1rem,4.2vw,2.7rem)] bg-background border border-foreground/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-xl">
                          <span className="material-symbols-outlined text-[clamp(1rem,2.1vw,1.35rem)]">
                            auto_stories
                          </span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openEditModal(nb);
                            }}
                            className="p-1.5 bg-background border border-foreground/10 text-foreground/40 hover:text-primary hover:border-primary/30 transition-all opacity-0 group-hover:opacity-100"
                          >
                            <span className="material-symbols-outlined text-sm">
                              edit
                            </span>
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(nb.id);
                            }}
                            className="p-1.5 bg-background border border-foreground/10 text-foreground/40 hover:text-[hsl(var(--color-destructive))] hover:border-[hsl(var(--color-destructive)/0.35)] transition-all opacity-0 group-hover:opacity-100"
                          >
                            <span className="material-symbols-outlined text-sm">
                              delete
                            </span>
                          </button>
                        </div>
                      </div>

                      <div>
                        <h3 className="text-[clamp(1rem,1.6vw,1.2rem)] font-bold text-foreground/80 group-hover:text-foreground transition-colors line-clamp-2 leading-tight uppercase tracking-tight">
                          {nb.titulo || "Sin Título"}
                        </h3>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          <span
                            className={`text-[0.58rem] font-black uppercase tracking-[0.1em] px-1.5 py-[0.15rem] border ${statusClassMap[cardMetadata.status]}`}
                          >
                            {statusLabelMap[cardMetadata.status]}
                          </span>
                          <span
                            className={`text-[0.58rem] font-black uppercase tracking-[0.1em] px-1.5 py-[0.15rem] border ${priorityClassMap[cardMetadata.priority]}`}
                          >
                            {priorityLabelMap[cardMetadata.priority]}
                          </span>
                          {cardMetadata.audience.trim() ? (
                            <span className="text-[0.58rem] font-black uppercase tracking-[0.1em] px-1.5 py-[0.15rem] border bg-primary/10 text-primary border-primary/20">
                              {cardMetadata.audience.trim()}
                            </span>
                          ) : null}
                        </div>
                        {nb.genero && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {nb.genero.split(",").map((tag, i) => (
                              <span
                                key={i}
                                className="text-[0.58rem] font-black uppercase tracking-[0.1em] px-1.5 py-[0.15rem] bg-primary/10 text-primary border border-primary/20"
                              >
                                {tag.trim()}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-4 border-t border-foreground/10 opacity-40 group-hover:opacity-100 transition-all duration-500">
                      <span className="material-symbols-outlined text-sm text-primary animate-pulse">
                        menu_book
                      </span>
                      <span className="text-[0.58rem] font-black uppercase tracking-[0.2em] text-foreground/60 group-hover:text-primary transition-colors">
                        Abrir Crónica
                      </span>
                    </div>
                  </>
                );
              })()}
            </MonolithicPanel>
          ))}
        </div>
      </div>

      {/* Creation/Edit Modal Zen */}
      {isCreating && (
        <div
          className="fixed inset-0 z-[100] bg-background/90 flex items-center justify-center p-4 "
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <MonolithicPanel className="p-[clamp(1rem,2.6vw,2.25rem)] w-full max-w-[min(96vw,42rem)] max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl animate-in zoom-in-95 duration-500 border-foreground/10">
            <div className="flex items-center gap-[clamp(0.8rem,1.8vw,1.35rem)] mb-[clamp(1rem,2vw,1.75rem)]">
              <div className="size-14 bg-primary flex items-center justify-center text-foreground shadow-2xl">
                <span className="material-symbols-outlined text-3xl">
                  {notebookToEdit ? "edit" : "auto_stories"}
                </span>
              </div>
              <div>
                <h2 className="text-3xl font-black text-foreground uppercase tracking-tight">
                  {notebookToEdit ? "Refinar Archivador" : "Nueva Crónica"}
                </h2>
                <p className="text-[10px] text-primary uppercase font-black tracking-[0.4em] mt-1">
                  {notebookToEdit
                    ? "Actualizando registros"
                    : "Expandiendo la biblioteca"}
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-foreground/40 tracking-[0.3em] ml-1">
                  Título del Registro
                </label>
                <input
                  autoFocus
                  className="w-full bg-background border border-foreground/10 px-[clamp(0.8rem,1.6vw,1.25rem)] py-[clamp(0.75rem,1.4vw,1rem)] text-foreground text-[clamp(1rem,1.5vw,1.15rem)] outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 font-serif"
                  placeholder="Ej: Crónicas de Aethelgard"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  onKeyDown={(e) => {
                    switch (e.key === "Enter") {
                      case true:
                        handleSubmitWithValidation();
                        break;
                      default:
                        break;
                    }
                  }}
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-foreground/40 tracking-[0.3em] ml-1">
                  Etiquetas (separadas por coma)
                </label>
                <input
                  className="w-full bg-background border border-foreground/10 px-[clamp(0.8rem,1.6vw,1.25rem)] py-[clamp(0.65rem,1.2vw,0.9rem)] text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 text-sm font-mono"
                  placeholder="Fantasía, Oscuro, Épico..."
                  value={genre}
                  onChange={(e) => setGenre(e.target.value)}
                />
                <p className="text-[9px] text-foreground/40 italic px-1">
                  Usa etiquetas libres para organizar mejor tu biblioteca.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-foreground/40 tracking-[0.2em] ml-1">
                    Estado
                  </label>
                  <select
                    value={metadata.status}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        status: e.target.value as
                          | "idea"
                          | "draft"
                          | "review"
                          | "done",
                      }))
                    }
                    className="w-full bg-background border border-foreground/10 px-4 py-3 text-foreground outline-none focus:border-primary/50 transition-all text-sm"
                  >
                    <option value="idea">Idea</option>
                    <option value="draft">Borrador</option>
                    <option value="review">Revisión</option>
                    <option value="done">Finalizado</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] uppercase font-black text-foreground/40 tracking-[0.2em] ml-1">
                    Prioridad
                  </label>
                  <select
                    value={metadata.priority}
                    onChange={(e) =>
                      setMetadata((prev) => ({
                        ...prev,
                        priority: e.target.value as "low" | "medium" | "high",
                      }))
                    }
                    className="w-full bg-background border border-foreground/10 px-4 py-3 text-foreground outline-none focus:border-primary/50 transition-all text-sm"
                  >
                    <option value="low">Baja</option>
                    <option value="medium">Media</option>
                    <option value="high">Alta</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-foreground/40 tracking-[0.3em] ml-1">
                  Audiencia
                </label>
                <input
                  className="w-full bg-background border border-foreground/10 px-[clamp(0.8rem,1.6vw,1.25rem)] py-[clamp(0.65rem,1.2vw,0.9rem)] text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 text-sm font-mono"
                  placeholder="Ej: lector beta, editor, publicación"
                  value={metadata.audience}
                  onChange={(e) =>
                    setMetadata((prev) => ({
                      ...prev,
                      audience: e.target.value,
                    }))
                  }
                />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase font-black text-foreground/40 tracking-[0.3em] ml-1">
                  Sinopsis de trabajo
                </label>
                <textarea
                  rows={3}
                  className="w-full bg-background border border-foreground/10 px-[clamp(0.8rem,1.6vw,1.25rem)] py-[clamp(0.65rem,1.2vw,0.9rem)] text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 text-sm"
                  placeholder="Resumen corto para contexto editorial"
                  value={metadata.summary}
                  onChange={(e) =>
                    setMetadata((prev) => ({
                      ...prev,
                      summary: e.target.value,
                    }))
                  }
                />
              </div>

              {/* Error state visible */}
              {submitError && (
                <div className="px-4 py-3 bg-[hsl(var(--color-destructive)/0.12)] border border-[hsl(var(--color-destructive)/0.35)] text-[hsl(var(--color-destructive))] text-[10px] font-bold uppercase tracking-widest">
                  ⚠ {submitError}
                </div>
              )}

              <div className="flex gap-4 pt-1">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 py-5 text-foreground/40 hover:text-foreground font-black uppercase text-[10px] tracking-[0.2em] transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleSubmitWithValidation}
                  className={`flex-[2] py-5 text-foreground font-black uppercase text-[10px] tracking-[0.3em] shadow-2xl transition-all ${saving ? "bg-primary/40 cursor-wait" : "bg-primary hover:bg-primary/80 hover:scale-[1.02] active:scale-95"}`}
                >
                  {saving
                    ? "Guardando..."
                    : notebookToEdit
                      ? "Confirmar Cambios"
                      : "Crear Archivador"}
                </button>
              </div>
            </div>
          </MonolithicPanel>
        </div>
      )}

      <ConfirmationModal
        isOpen={titleAlertOpen}
        onClose={() => setTitleAlertOpen(false)}
        onConfirm={() => setTitleAlertOpen(false)}
        title="Título requerido"
        message="Debes escribir un nombre para guardar el cuaderno."
        confirmText="Entendido"
        cancelText="Cerrar"
        type="warning"
      />
    </div>
  );
};

export default WritingHub;
