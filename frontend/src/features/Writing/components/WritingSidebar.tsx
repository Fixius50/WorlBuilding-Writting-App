import React from "react";
import { Hoja } from "@domain/database";
import PageListPanel from "./PageListPanel";
import { CommentAnchorRange } from "@utils/commentAnchors";

interface WritingSidebarProps {
  // Tabs
  activeTab: "index" | "references";
  setActiveTab: (tab: "index" | "references") => void;
  pageId: number | null;
  commentSelection: {
    text: string;
    from: number;
    to: number;
  } | null;
  commentComposeRequestKey: number;
  onCommentAnchorsChange: (anchors: CommentAnchorRange[]) => void;

  // Datos para PageListPanel
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

  // Datos para el panel de referencias
  selectedEntityDetails: {
    nombre: string;
    subInfo: string;
    descripcion: string;
    estado: string;
  } | null;
  renderProfilePreview: () => React.ReactNode;
}

/**
 * 📐 WritingSidebar
 * Panel lateral derecho del editor de escritura.
 * Contiene dos pestañas:
 * - Índice: lista de hojas (PageListPanel) + comentarios
 * - Referencias: vista previa del perfil de la entidad seleccionada
 *
 * Extraído de WritingView.tsx para separar responsabilidades.
 */
const WritingSidebar: React.FC<WritingSidebarProps> = ({
  activeTab,
  setActiveTab,
  pageId,
  commentSelection,
  commentComposeRequestKey,
  onCommentAnchorsChange,
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
  selectedEntityDetails,
  renderProfilePreview,
}) => {
  return (
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
          <PageListPanel
            pageId={pageId}
            commentSelection={commentSelection}
            commentComposeRequestKey={commentComposeRequestKey}
            onCommentAnchorsChange={onCommentAnchorsChange}
            pages={pages}
            filteredPages={filteredPages}
            currentPageIndex={currentPageIndex}
            isCorkboardMode={isCorkboardMode}
            setIsCorkboardMode={setIsCorkboardMode}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            editingPageId={editingPageId}
            setEditingPageId={setEditingPageId}
            handlePageSelect={handlePageSelect}
            handleTitleChangeInternal={handleTitleChangeInternal}
            handleCreatePage={handleCreatePage}
            deletePage={deletePage}
          />
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
  );
};

export default WritingSidebar;
