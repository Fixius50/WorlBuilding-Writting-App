import React, { useMemo, useCallback } from "react";
import { ZenEditor } from "@features/Editor";
import { ConfirmModal } from "@components";
import { useWritingView } from "./useWritingView";
import { usePageList } from "../hooks/usePageList";
import WritingSidebar from "../components/WritingSidebar";
import {
  IndividualProfileView,
  TerritoryProfileView,
  CosmicProfileView,
  CollectiveProfileView,
  EventProfileView,
} from "@features/Entities";

const WritingView = () => {
  const {
    notebook,
    pages,
    currentPageIndex,
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
    projectEntities,
    commentSelection,
    setCommentSelection,
    commentComposeRequestKey,
    handleRequestCommentFromSelection,
    commentAnchors,
    handleCommentAnchorsChange,
  } = useWritingView();

  const { isCorkboardMode, setIsCorkboardMode, filteredPages, deletePage } =
    usePageList({
      pages,
      searchTerm,
      setPageToDelete,
      setDeleteModalOpen,
    });

  const currentPage = pages[currentPageIndex];

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
      subInfo = isChar
        ? "Personaje • Protagonista"
        : isLoc
          ? `${selectedEntity.tipo} • Escenario Principal`
          : subInfo;

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

  // Renderiza el perfil de entidad según su tipo
  const renderProfilePreview = useCallback(() => {
    if (!selectedEntity) return null;

    const type = (selectedEntity.tipo || "")
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toUpperCase();

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

    // Selección del componente por tipo (más de 2 valores → switch)
    switch (true) {
      case isChar:
        return React.createElement(IndividualProfileView, {
          entityId: selectedEntity.id,
        });
      case isLoc:
        return React.createElement(TerritoryProfileView, {
          entityId: selectedEntity.id,
        });
      case isCosmic:
        return React.createElement(CosmicProfileView, {
          entityId: selectedEntity.id,
        });
      case isColl:
        return React.createElement(CollectiveProfileView, {
          entityId: selectedEntity.id,
        });
      case isEvent:
        return React.createElement(EventProfileView, {
          entityId: selectedEntity.id,
        });
      default:
        return React.createElement(IndividualProfileView, {
          entityId: selectedEntity.id,
        });
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
              onSelectionChange={setCommentSelection}
              onRequestComment={handleRequestCommentFromSelection}
              commentAnchors={commentAnchors}
              notebookTitle={notebook?.titulo}
              sidebarOpen={sidebarOpen}
              onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
              projectEntities={projectEntities}
            />
          )}
        </main>
      </div>

      {/* SECCIÓN LATERAL: Panel Contextual de dos pestañas */}
      {sidebarOpen && (
        <WritingSidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          pageId={currentPage ? currentPage.id : null}
          commentSelection={commentSelection}
          commentComposeRequestKey={commentComposeRequestKey}
          onCommentAnchorsChange={handleCommentAnchorsChange}
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
          selectedEntityDetails={selectedEntityDetails}
          renderProfilePreview={renderProfilePreview}
        />
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
