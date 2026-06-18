import React, { useState, useMemo, useEffect, useCallback } from "react";
import { useLanguage } from "@context/LanguageContext";
import { ZenEditor } from "@features/Editor";
import { ConfirmModal } from "@components";
import { useWritingView } from "./useWritingView";
import {
  IndividualProfileView,
  TerritoryProfileView,
  CosmicProfileView,
  CollectiveProfileView,
  EventProfileView,
} from "@features/Entities";

const WritingView = () => {
  const { t } = useLanguage();
  const {
    notebook,
    pages,
    currentPageIndex,
    saving,
    loading,
    deleteModalOpen,
    setDeleteModalOpen,
    pageToDelete,
    setPageToDelete,
    searchTerm,
    setSearchTerm,
    snapshots,
    activeTab,
    setActiveTab,
    editingPageId,
    setEditingPageId,
    handleContentChange,
    handleSnapshot,
    handleMentionClick,
    handleRestoreSnapshot,
    handleTitleChangeInternal,
    handleCreatePage,
    handleAutoDeletePage,
    handlePageSelect,
    confirmDeletePage,
    sidebarOpen,
    setSidebarOpen,
    selectedEntity,
  } = useWritingView();

  const [isCorkboardMode, setIsCorkboardMode] = useState(false);

  const renderProfilePreview = useCallback(() => {
    const type = selectedEntity
      ? (selectedEntity.tipo || "")
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "")
          .toUpperCase()
      : "";

    const isChar =
      type.includes("PERSONAJE") ||
      type.includes("INDIVIDUAL") ||
      type.includes("CHARACTER");
    const isLoc =
      type.includes("LUGAR") ||
      type.includes("TERRITORIO") ||
      type.includes("LOCATION");
    const isCosmic =
      type.includes("COSMO") ||
      type.includes("COSMIC") ||
      type.includes("COSMICOS");
    const isColl =
      type.includes("COLECTIVO") ||
      type.includes("CULTURA") ||
      type.includes("FACCION") ||
      type.includes("COLLECTIVE") ||
      type.includes("ORGANIZACION");
    const isEvent = type.includes("EVENTO") || type.includes("EVENT");

    const component = !selectedEntity
      ? null
      : isChar
        ? React.createElement(IndividualProfileView, {
            entityId: selectedEntity.id,
          })
        : isLoc
          ? React.createElement(TerritoryProfileView, {
              entityId: selectedEntity.id,
            })
          : isCosmic
            ? React.createElement(CosmicProfileView, {
                entityId: selectedEntity.id,
              })
            : isColl
              ? React.createElement(CollectiveProfileView, {
                  entityId: selectedEntity.id,
                })
              : isEvent
                ? React.createElement(EventProfileView, {
                    entityId: selectedEntity.id,
                  })
                : React.createElement(IndividualProfileView, {
                    entityId: selectedEntity.id,
                  });

    return component;
  }, [selectedEntity]);

  const currentPage = pages[currentPageIndex];

  // Filtramos páginas según el término de búsqueda
  const filteredPages = useMemo(() => {
    return pages.filter(
      (p) =>
        (p.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.contenido || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [pages, searchTerm]);

  // Manejador del borrado
  const deletePage = React.useCallback(
    (e: React.MouseEvent, id: number, index: number) => {
      e.stopPropagation();
      if (pages.length <= 1) {
        setPageToDelete({ id, index, error: "one_page" });
        setDeleteModalOpen(true);
        return;
      }
      setPageToDelete({ id, index });
      setDeleteModalOpen(true);
    },
    [pages.length, setPageToDelete, setDeleteModalOpen],
  );

  // Parsear metadatos de la referencia seleccionada
  const selectedEntityDetails = useMemo(() => {
    if (!selectedEntity) return null;
    try {
      const attrs =
        typeof selectedEntity.contenido_json === "string"
          ? JSON.parse(selectedEntity.contenido_json)
          : selectedEntity.contenido_json || {};

      const isChar =
        selectedEntity.tipo?.toUpperCase() === "PERSONAJE" ||
        selectedEntity.tipo?.toUpperCase() === "INDIVIDUAL";
      const isLoc =
        selectedEntity.tipo?.toUpperCase() === "LUGAR" ||
        selectedEntity.tipo?.toUpperCase() === "TERRITORIO";

      let subInfo = selectedEntity.tipo || "Referencia";
      if (isChar) subInfo = "Personaje • Protagonista";
      else if (isLoc) subInfo = `${selectedEntity.tipo} • Escenario Principal`;

      return {
        nombre: selectedEntity.nombre,
        subInfo,
        descripcion:
          selectedEntity.descripcion ||
          attrs.description ||
          "Sin descripción disponible.",
        estado: attrs.estado || attrs.status || "Estable",
      };
    } catch {
      return {
        nombre: selectedEntity.nombre,
        subInfo: selectedEntity.tipo || "Referencia",
        descripcion:
          selectedEntity.descripcion || "Sin descripción disponible.",
        estado: "Desconocido",
      };
    }
  }, [selectedEntity]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background select-none">
        <div className="animate-pulse text-foreground/40 font-serif text-xl italic tracking-widest font-black uppercase">
          Abriendo Archivador...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex w-full h-full bg-editor-base relative select-text overflow-hidden">
      {/* SECCIÓN CENTRAL: Lienzo del Editor */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <main className="flex-1 flex flex-col relative bg-editor-elevated overflow-hidden">
          {currentPage && (
            <ZenEditor
              pages={pages}
              currentPageIndex={currentPageIndex}
              onUpdate={handleContentChange}
              onTitleChange={handleTitleChangeInternal}
              onCreatePage={handleCreatePage}
              onAutoDeletePage={handleAutoDeletePage}
              onSnapshot={handleSnapshot}
              snapshots={snapshots}
              onRestoreSnapshot={handleRestoreSnapshot}
              onMentionClick={handleMentionClick}
              notebookTitle={notebook?.titulo}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            />
          )}
        </main>
      </div>

      {/* SECCIÓN LATERAL: Panel Contextual local de dos pestañas */}
      {sidebarOpen && (
        <aside
          className={`border-l border-foreground/5 bg-background flex flex-col h-full shrink-0 relative animate-in slide-in-from-right-3 duration-300 select-none transition-all ${
            activeTab === "references" ? "w-[600px]" : "w-80"
          }`}
        >
          {/* Cabecera del Panel (Pestañas Índice y Referencias) */}
          <div className="flex border-b border-foreground/5 bg-background/50 sticky top-0 z-20">
            <button
              onClick={() => setActiveTab("index")}
              className={`flex-1 py-4 text-center border-b font-sans text-[11px] font-bold uppercase tracking-wider transition-all ${
                activeTab === "index"
                  ? "border-primary text-primary bg-primary/[0.02]"
                  : "border-transparent text-foreground/40 hover:text-foreground"
              }`}
            >
              Índice
            </button>
            <button
              onClick={() => setActiveTab("references")}
              className={`flex-1 py-4 text-center border-b font-sans text-[11px] font-bold uppercase tracking-wider transition-all ${
                activeTab === "references"
                  ? "border-primary text-primary bg-primary/[0.02]"
                  : "border-transparent text-foreground/40 hover:text-foreground"
              }`}
            >
              Referencias
            </button>
          </div>

          {/* Contenido de las Pestañas */}
          <div className="flex-grow overflow-y-auto custom-scrollbar flex flex-col justify-between">
            {activeTab === "index" ? (
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
                      <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground/40">
                        Vista de Corcho
                      </span>
                      <button
                        onClick={() => setIsCorkboardMode(!isCorkboardMode)}
                        className={`w-8 h-4 rounded-full relative transition-colors ${isCorkboardMode ? "bg-primary" : "bg-foreground/20"}`}
                      >
                        <div className={`w-3 h-3 rounded-full bg-background absolute top-0.5 transition-all ${isCorkboardMode ? "left-4.5 translate-x-[14px]" : "left-0.5"}`} />
                      </button>
                    </div>
                  </div>

                  {/* Lista o Corcho de páginas con anidamiento dinámico */}
                  <div className={`flex-grow overflow-y-auto p-3 custom-scrollbar ${isCorkboardMode ? "grid grid-cols-2 gap-2 content-start" : "flex flex-col space-y-1"}`}>
                    {filteredPages.map((page) => {
                      const globalIdx = pages.findIndex(
                        (p) => p.id === page.id,
                      );
                      const isSelected = globalIdx === currentPageIndex;

                      // Anidamiento dinámico: si no empieza por "Capítulo", se indenta sutilmente a la derecha
                      const isChapter =
                        (page.titulo || "")
                          .toLowerCase()
                          .startsWith("capítulo") ||
                        (page.titulo || "")
                          .toLowerCase()
                          .startsWith("capitulo");

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
                              <span className={`font-sans text-[11px] font-bold mb-2 truncate w-full ${isSelected ? "text-primary" : "text-foreground/80"}`}>
                                {page.titulo || `Hoja ${globalIdx + 1}`}
                              </span>
                              <div className="text-[9px] text-foreground/50 font-serif leading-relaxed line-clamp-5 whitespace-pre-wrap break-words" dangerouslySetInnerHTML={{ __html: page.contenido?.replace(/<[^>]*>?/gm, '') || 'Sin contenido...' }} />
                            </button>
                            {/* Opciones de borrado rápidas */}
                            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-background/80 backdrop-blur-sm rounded">
                              <button
                                onClick={(e) =>
                                  deletePage(e, page.id, globalIdx)
                                }
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
                                  if (e.key === "Enter") setEditingPageId(null);
                                  e.stopPropagation();
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="bg-background border-b border-primary font-sans font-bold text-xs outline-none w-full px-1 text-foreground"
                                value={page.titulo || ""}
                                onChange={(e) =>
                                  handleTitleChangeInternal(
                                    globalIdx,
                                    e.target.value,
                                  )
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
                                onClick={(e) =>
                                  deletePage(e, page.id, globalIdx)
                                }
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
                              const html = page.contenido || '';
                              const matches = html.match(/<h[12][^>]*>(.*?)<\/h[12]>/g);
                              if (!matches) return null;
                              return matches.map((m, i) => {
                                const isH1 = m.startsWith('<h1');
                                const text = m.replace(/<[^>]+>/g, '').trim();
                                if (!text) return null;
                                return (
                                  <div key={i} className={`text-[10px] truncate text-foreground/50 hover:text-primary cursor-pointer transition-colors ${isH1 ? 'font-bold' : 'ml-2'}`}>
                                    {text}
                                  </div>
                                );
                              });
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
                    <span className="material-symbols-outlined text-sm">
                      add
                    </span>
                    <span>AÑADIR HOJA</span>
                  </button>
                </div>

                {/* Mitad inferior: Comentarios (Estilo VSCode Git) */}
                <div className="h-1/3 min-h-[200px] border-t-2 border-foreground/10 bg-background/50 flex flex-col shrink-0">
                  <div className="p-2 border-b border-foreground/5 flex items-center gap-2 bg-background sticky top-0">
                    <span className="material-symbols-outlined text-sm text-foreground/40">
                      forum
                    </span>
                    <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground/60">
                      Comentarios del Documento
                    </span>
                  </div>
                  <div className="flex-grow overflow-y-auto p-3 custom-scrollbar flex flex-col gap-2">
                    {/* Placeholder para los comentarios */}
                    <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
                      <span className="material-symbols-outlined text-2xl mb-2">speaker_notes_off</span>
                      <span className="text-[10px] font-sans">No hay comentarios en esta hoja.</span>
                      <span className="text-[9px] font-sans mt-1">Selecciona texto para añadir una anotación.</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* Pestaña Referencias */
              <div className="flex-grow flex flex-col justify-start h-full overflow-hidden references-preview relative">
                {!selectedEntityDetails ? (
                  /* Estado vacío literario */
                  <div className="flex-grow flex flex-col items-center justify-center text-center p-6 gap-4 min-h-[400px]">
                    <span className="material-symbols-outlined text-4xl text-foreground/15">
                      menu_book
                    </span>
                    <p className="text-[12px] font-serif italic text-foreground/35 leading-relaxed max-w-[180px]">
                      Selecciona una mención en el texto para revisar sus notas.
                    </p>
                  </div>
                ) : (
                  /* Vista previa completa tipo iframe */
                  <div className="w-full h-full overflow-y-auto custom-scrollbar select-text bg-background">
                    {renderProfilePreview()}
                  </div>
                )}
              </div>
            )}
          </div>
        </aside>
      )}

      {/* Diálogo de Confirmación de Borrado */}
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={
          pageToDelete?.error === "one_page"
            ? () => setDeleteModalOpen(false)
            : confirmDeletePage
        }
        title={pageToDelete?.error === "one_page" ? "Aviso" : "Eliminar Hoja"}
        message={
          pageToDelete?.error === "one_page"
            ? "Debe haber al menos una hoja en el archivador."
            : "¿Estás seguro de que quieres eliminar esta hoja? Se borrará permanentemente."
        }
        confirmText={
          pageToDelete?.error === "one_page" ? "Entendido" : "Confirmar"
        }
        isDestructive={pageToDelete?.error !== "one_page"}
      />

      <style
        dangerouslySetInnerHTML={{
          __html: `
            .references-preview header {
               padding-left: 1.5rem !important;
               padding-right: 1.5rem !important;
               padding-top: 1rem !important;
               padding-bottom: 1rem !important;
            }
            .references-preview header h1 {
               font-size: 1.35rem !important;
            }
            .references-preview header button,
            .references-preview header .h-4.w-px {
               display: none !important;
            }
          `,
        }}
      />
    </div>
  );
};

export default WritingView;
