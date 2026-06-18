import React from "react";
import { Hoja } from "@domain/database";
import { Switch } from "@components";
import WritingCommentsPanel from "./WritingCommentsPanel";

interface PageListPanelProps {
  pages: Hoja[];
  filteredPages: Hoja[];
  currentPageIndex: number;
  isCorkboardMode: boolean;
  setIsCorkboardMode: (value: boolean) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  editingPageId: number | null;
  setEditingPageId: (id: number | null) => void;
  handlePageSelect: (index: number) => void;
  handleTitleChangeInternal: (index: number, newTitle: string) => void;
  handleCreatePage: () => void;
  deletePage: (e: React.MouseEvent, id: number, index: number) => void;
}

/**
 * 📋 PageListPanel
 * Panel del índice lateral: buscador, toggle de vista de corcho,
 * lista/corcho de hojas con sub-índice de headings H1–H6 por hoja activa,
 * y botón de añadir hoja.
 *
 * Incluye WritingCommentsPanel en la parte inferior.
 *
 * Extraído de WritingView.tsx para separar responsabilidades.
 */
const PageListPanel: React.FC<PageListPanelProps> = ({
  pages,
  filteredPages,
  currentPageIndex,
  isCorkboardMode,
  setIsCorkboardMode,
  searchTerm,
  setSearchTerm,
  editingPageId,
  setEditingPageId,
  handlePageSelect,
  handleTitleChangeInternal,
  handleCreatePage,
  deletePage,
}) => {
  return (
    <div className="flex flex-col h-full justify-between flex-grow">
      <div className="flex-grow flex flex-col overflow-hidden">
        {/* Buscador plano de Hojas */}
        <div className="p-3 border-b border-foreground/5 flex flex-col gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/35">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar en el índice..."
              className="w-full bg-foreground/[0.03] border border-foreground/10 py-2 pl-9 pr-4 text-[10px] font-sans rounded-md outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-foreground/30 select-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between px-1">
            <Switch
              checked={isCorkboardMode}
              onChange={setIsCorkboardMode}
              label="Vista de Corcho"
            />
          </div>
        </div>

        {/* Lista o Corcho de páginas con anidamiento dinámico */}
        <div
          className={`flex-grow overflow-y-auto p-3 custom-scrollbar ${isCorkboardMode ? "grid grid-cols-2 gap-2 content-start" : "flex flex-col space-y-1"}`}
        >
          {filteredPages.map((page) => {
            const globalIdx = pages.findIndex((p) => p.id === page.id);
            const isSelected = globalIdx === currentPageIndex;

            // Anidamiento dinámico: si no empieza por "Capítulo", se indenta sutilmente a la derecha
            const isChapter =
              (page.titulo || "").toLowerCase().startsWith("capítulo") ||
              (page.titulo || "").toLowerCase().startsWith("capitulo");

            // --- MODO CORCHO ---
            if (isCorkboardMode) {
              return (
                <div key={page.id} className="group relative aspect-square">
                  <button
                    onClick={() => handlePageSelect(globalIdx)}
                    className={`w-full h-full text-left p-3 rounded-md transition-all flex flex-col justify-start border overflow-hidden ${
                      isSelected
                        ? "bg-primary/10 border-primary/30 shadow-[inset_0_0_10px_rgba(var(--primary-rgb),0.05)]"
                        : "bg-foreground/[0.02] border-foreground/10 hover:border-primary/20 hover:bg-foreground/[0.04]"
                    }`}
                  >
                    <span
                      className={`font-sans text-[11px] font-bold mb-2 truncate w-full ${isSelected ? "text-primary" : "text-foreground/80"}`}
                    >
                      {page.titulo || `Hoja ${globalIdx + 1}`}
                    </span>
                    <div
                      className="text-[9px] text-foreground/50 font-serif leading-relaxed line-clamp-5 whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{
                        __html:
                          page.contenido?.replace(/<[^>]*>?/gm, "") ||
                          "Sin contenido...",
                      }}
                    />
                  </button>
                  {/* Opciones de borrado rápidas */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-background/80 backdrop-blur-sm rounded">
                    <button
                      onClick={(e) => deletePage(e, page.id, globalIdx)}
                      className="p-1 rounded-sm text-foreground/35 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-sm">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              );
            }

            // --- MODO LISTA ---
            return (
              <div key={page.id} className="group relative">
                <button
                  onClick={() => handlePageSelect(globalIdx)}
                  className={`w-full text-left px-4 py-3 rounded-md transition-all flex flex-col justify-center border ${
                    isChapter ? "" : "ml-4 max-w-[calc(100%-1rem)]"
                  } ${
                    isSelected
                      ? "bg-primary/15 border-primary/20 text-primary font-bold shadow-[inset_0_0_10px_rgba(var(--primary-rgb),0.05)]"
                      : "bg-transparent border-transparent hover:bg-foreground/[0.03] text-foreground/75"
                  }`}
                >
                  {editingPageId === page.id ? (
                    <input
                      autoFocus
                      onBlur={() => setEditingPageId(null)}
                      onKeyDown={(e) => {
                        e.key === "Enter" ? setEditingPageId(null) : null;
                        e.stopPropagation();
                      }}
                      onClick={(e) => e.stopPropagation()}
                      className="bg-background border-b border-primary font-sans font-bold text-xs outline-none w-full px-1 text-foreground"
                      value={page.titulo || ""}
                      onChange={(e) =>
                        handleTitleChangeInternal(globalIdx, e.target.value)
                      }
                      placeholder={`Hoja ${globalIdx + 1}`}
                    />
                  ) : (
                    <span
                      className={`font-sans text-[12px] truncate w-full ${
                        isChapter
                          ? "font-bold text-foreground/90"
                          : "font-medium text-foreground/60"
                      }`}
                    >
                      {page.titulo || `Hoja ${globalIdx + 1}`}
                    </span>
                  )}
                </button>

                {/* Opciones de edición y borrado rápidas */}
                {!editingPageId && (
                  <div className="absolute top-1/2 -translate-y-1/2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditingPageId(page.id);
                      }}
                      className="p-1 rounded-sm text-foreground/35 hover:text-primary hover:bg-primary/10 transition-colors"
                      title="Renombrar"
                    >
                      <span className="material-symbols-outlined text-sm">
                        edit
                      </span>
                    </button>
                    <button
                      onClick={(e) => deletePage(e, page.id, globalIdx)}
                      className="p-1 rounded-sm text-foreground/35 hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-sm">
                        delete
                      </span>
                    </button>
                  </div>
                )}

                {/* Sub-índice de Headings (Solo si está seleccionada y no es corcho) */}
                {isSelected && !isCorkboardMode && (
                  <div className="pl-6 pr-2 py-1 space-y-1">
                    {(() => {
                      const html = page.contenido || "";
                      const matches = [
                        ...html.matchAll(/<h([1-6])[^>]*>(.*?)<\/h\1>/g),
                      ];
                      const hasMatches = matches.length > 0;

                      const result = hasMatches
                        ? matches.map((match, i) => {
                            const level = parseInt(match[1], 10);
                            const text = match[2]
                              .replace(/<[^>]+>/g, "")
                              .trim();
                            const hasText = text.length > 0;
                            const paddingLeft = `${(level - 1) * 8}px`;
                            const isH1 = level === 1;

                            const element = hasText ? (
                              <div
                                key={i}
                                className={`text-[10px] truncate text-foreground/50 hover:text-primary cursor-pointer transition-colors ${isH1 ? "font-bold" : ""}`}
                                style={{ paddingLeft }}
                              >
                                {text}
                              </div>
                            ) : null;
                            return element;
                          })
                        : null;
                      return result;
                    })()}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón de añadir hoja en la parte inferior */}
      <div className="p-3 bg-background border-t border-foreground/5 shrink-0">
        <button
          onClick={handleCreatePage}
          className="w-full py-3 bg-primary hover:bg-primary/95 text-foreground rounded-md text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.98] shadow-md shadow-primary/10"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          <span>AÑADIR HOJA</span>
        </button>
      </div>

      {/* Mitad inferior: Comentarios (Estilo VSCode Git) */}
      <WritingCommentsPanel />
    </div>
  );
};

export default PageListPanel;
