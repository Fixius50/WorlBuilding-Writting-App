import React from "react";
import MonolithicPanel from "@atoms/MonolithicPanel";
import Button from "@atoms/Button";
import AttributeField from "./AttributeField";
import Avatar from "@atoms/Avatar";
import EntityBuilderSidebar from "../components/EntityBuilderSidebar";
import ConfirmationModal from "@organisms/ConfirmationModal";
import FamilyTreeAssigner from "../components/FamilyTreeAssigner";
import TemplateSettingsModal from "@organisms/TemplateSettingsModal";
import { useEntityBuilder } from "./useEntityBuilder";
import { getPresetTabsByEntityType } from "@features/Entities/utils/entityPresetTabs";
import { getThemePrimaryHex } from "@infrastructure/utils/themeColor";

interface EntityBuilderProps {
  mode: "creation" | "edit";
}

const EntityBuilder: React.FC<EntityBuilderProps> = ({ mode }) => {
  const {
    entity,
    setEntity,
    fields,
    setFields,
    setRemovedFieldIds,
    loading,
    saving,
    deleteModalOpen,
    setDeleteModalOpen,
    availableTemplates,
    activeEntityTab,
    setActiveEntityTab,
    zoomImage,
    setZoomImage,
    showLibrary,
    setShowLibrary,
    editingTemplate,
    setEditingTemplate,
    editingFieldId,
    setEditingFieldId,
    isDraggingOver,

    // UI migrados
    defaultEntityColor,
    extras,
    galleryImages,
    editorTabs,
    isPresetEditorTab,
    primaryImage,
    secondaryImages,
    secondaryStart,
    hasMoreImages,
    secondaryPage,
    setSecondaryPage,
    secondaryPageCount,
    appearanceTextareaRef,
    narrativeTextareaRef,
    handleAppearanceUndo,
    handleAppearanceRedo,
    handleAppearanceKeyDown,
    handleNarrativeUndo,
    handleNarrativeRedo,
    handleNarrativeKeyDown,
    setAppearanceValue,
    setNarrativeValue,
    applyWrapFormatting,
    applyTabIndent,
    applyNarrativeWrapFormatting,
    applyNarrativeTabIndent,

    projectId,
    handleSave,
    handleFieldChange,
    handleRemoveField,
    handleImageUpload,
    removeImage,
    handleDragOverArea,
    handleDragLeaveArea,
    handleDropArea,
    handleDeleteEntity,
    updateExtra,
    refreshTemplates,
    navigate,
  } = useEntityBuilder(mode);

  const narrativeLength = (entity.descripcion || "").length;
  const narrativeGrowth = Math.min(560, Math.floor(narrativeLength / 3));
  const narrativeMinHeight = 360 + narrativeGrowth;

  if (loading)
    return (
      <div className="flex items-center justify-center h-full bg-background animate-pulse">
        <div className="text-[0.75rem] font-black uppercase tracking-[0.2em] text-primary">
          Iniciando Constructor Local...
        </div>
      </div>
    );

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteEntity}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer."
        confirmText="Borrar"
        cancelText="Cancelar"
      />
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        {/* CABECERA UNIFICADA MONOLÍTICA */}
        <div className="sticky top-0 z-40 bg-background border-b border-foreground/10 animate-in slide-in-from-top-4 duration-700">
          <div className="px-8 lg:px-12 py-4 flex items-center justify-between w-full max-w-7xl mx-auto gap-8">
            <div className="flex items-center gap-6 min-w-0">
              <Avatar
                url={extras.iconUrl}
                name={entity.nombre || "Nuevo Ente"}
                size="sm"
                className="ring-1 ring-primary/20 shadow-xl shadow-primary/5 shrink-0"
              />
              <div className="space-y-0.5 min-w-0">
                <div className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/40 italic truncate">
                  Constructor Central
                </div>
                <h2 className="text-xl font-black text-foreground tracking-tighter uppercase leading-none truncate">
                  {entity.nombre || "Nuevo Ente"}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setDeleteModalOpen(true)}
                className="size-10 flex items-center justify-center text-foreground/20 hover:text-red-400 hover:bg-red-400/5 transition-all border border-foreground/5"
                title="Eliminar Entidad"
              >
                <span className="material-symbols-outlined text-base">
                  delete
                </span>
              </button>

              <div className="w-px h-6 bg-foreground/10 mx-1" />

              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all group border border-foreground/5 bg-foreground/[0.02]"
              >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">
                  arrow_back
                </span>
                Volver
              </button>

              <button
                onClick={() => handleSave(true)}
                disabled={saving}
                className={`flex items-center gap-3 px-8 py-2.5 rounded-none font-black text-[9px] uppercase tracking-[0.2em] transition-all shadow-lg ${saving ? "bg-primary/20 text-primary cursor-wait" : "bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] active:scale-[0.98] shadow-primary/20"}`}
              >
                <span className="material-symbols-outlined text-sm">
                  {saving ? "sync" : "save"}
                </span>
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>

          <div className="border-t border-foreground/5 bg-foreground/[0.02]">
            <div className="max-w-7xl mx-auto overflow-x-auto overflow-y-hidden custom-scrollbar">
              <div className="flex items-center justify-start gap-8 min-w-max px-4">
                {editorTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveEntityTab(tab.id)}
                    className={`shrink-0 py-4 text-[9px] font-black uppercase tracking-[0.3em] border-b-2 transition-all duration-500 ${
                      activeEntityTab === tab.id
                        ? "border-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                        : "border-transparent text-foreground/30 hover:text-foreground"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-8 lg:p-16 pb-32 max-w-[90rem] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {activeEntityTab === "identity" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-12">
                {/* NÚCLEO DE IDENTIDAD */}
                <div className="monolithic-panel border border-foreground/10 bg-foreground/[0.02] p-8 space-y-8">
                  <header className="flex items-center gap-3 text-[hsl(var(--primary))] border-b border-[hsl(var(--foreground)/0.05)] pb-4">
                    <span className="material-symbols-outlined text-lg">
                      fingerprint
                    </span>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--foreground))]">
                      Núcleo de Identidad
                    </h3>
                  </header>

                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase text-[hsl(var(--foreground)/0.4)] tracking-[0.2em] block px-1">
                        Nombre de la Entidad
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[hsl(var(--foreground)/0.02)] border border-[hsl(var(--foreground)/0.1)] rounded-none p-6 text-4xl font-black text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary)/0.5)] outline-none transition-all placeholder:text-[hsl(var(--foreground)/0.05)] shadow-inner"
                        placeholder="Nombre..."
                        value={entity.nombre}
                        onChange={(e) =>
                          setEntity({ ...entity, nombre: e.target.value })
                        }
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] block px-1">
                          Categoría de Sistema
                        </label>
                        <div className="relative group">
                          <select
                            className="w-full bg-[hsl(var(--foreground)/0.02)] border border-[hsl(var(--foreground)/0.1)] rounded-none p-4 text-[11px] text-[hsl(var(--foreground))] font-black uppercase tracking-[0.2em] outline-none focus:border-[hsl(var(--primary)/0.5)] transition-all cursor-pointer appearance-none"
                            value={entity.tipo}
                            onChange={(e) =>
                              setEntity({ ...entity, tipo: e.target.value })
                            }
                          >
                            <option value="PERSONAJE">👤 Personaje</option>
                            <option value="MAGIA">✨ Magia</option>
                            <option value="LUGAR">📍 Ubicación</option>
                            <option value="OBJETO">⚔️ Artefacto</option>
                            <option value="CONCEPTO">💡 Filosofía</option>
                            <option value="CRIATURA">🐉 Especie</option>
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-foreground/20 group-hover:text-primary transition-colors pointer-events-none">
                            expand_more
                          </span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] block px-1">
                          Color de Identificación
                        </label>
                        <div className="flex items-center gap-4 bg-[hsl(var(--foreground)/0.02)] border border-[hsl(var(--foreground)/0.1)] p-3">
                          <input
                            type="color"
                            className="size-10 bg-transparent border-none cursor-pointer"
                            value={extras.color || defaultEntityColor}
                            onChange={(e) =>
                              updateExtra({ color: e.target.value })
                            }
                          />
                          <span className="text-[10px] font-mono text-foreground/40 uppercase">
                            {extras.color || defaultEntityColor}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] block px-1">
                        Etiquetas (Tags)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-foreground/[0.03] border border-foreground/20 rounded-none p-4 text-[11px] text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 shadow-inner"
                        placeholder="Importante, Secreto, Fase 1..."
                        value={extras.tags || ""}
                        onChange={(e) => updateExtra({ tags: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                <div className="monolithic-panel border border-foreground/10 bg-background/20 p-8 space-y-6">
                  <header className="flex items-center gap-3 text-[hsl(var(--primary))] border-b border-[hsl(var(--foreground)/0.05)] pb-4">
                    <span className="material-symbols-outlined text-lg">
                      auto_awesome
                    </span>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--foreground))]">
                      Apariencia y Rasgos
                    </h3>
                  </header>

                  <div className="flex items-center gap-2 border border-foreground/10 bg-foreground/[0.02] p-2">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleAppearanceUndo}
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border border-foreground/10 hover:border-primary/40 hover:text-primary transition-all"
                      title="Deshacer (Ctrl+Z)"
                    >
                      ↶
                    </button>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleAppearanceRedo}
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border border-foreground/10 hover:border-primary/40 hover:text-primary transition-all"
                      title="Rehacer (Ctrl+Y / Ctrl+Shift+Z)"
                    >
                      ↷
                    </button>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applyWrapFormatting("**")}
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border border-foreground/10 hover:border-primary/40 hover:text-primary transition-all"
                      title="Negrita (Ctrl+B)"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applyWrapFormatting("*")}
                      className="px-3 py-1 text-[10px] italic font-black uppercase tracking-[0.2em] border border-foreground/10 hover:border-primary/40 hover:text-primary transition-all"
                      title="Cursiva (Ctrl+I)"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={applyTabIndent}
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border border-foreground/10 hover:border-primary/40 hover:text-primary transition-all"
                      title="Tabulación"
                    >
                      TAB
                    </button>
                  </div>

                  <textarea
                    ref={appearanceTextareaRef}
                    className="w-full bg-foreground/[0.03] border border-foreground/20 rounded-none p-6 text-[13px] text-foreground/90 leading-relaxed min-h-[20rem] outline-none focus:border-primary/50 transition-all resize-none custom-scrollbar shadow-inner placeholder:italic placeholder:text-foreground/20"
                    placeholder="Describe visualmente esta entidad..."
                    value={extras.appearance}
                    onKeyDown={handleAppearanceKeyDown}
                    onChange={(e) => setAppearanceValue(e.target.value)}
                    onDrop={(e) => {
                      const droppedText = e.dataTransfer.getData("text/plain");
                      const hasText = !!droppedText;
                      switch (hasText) {
                        case true: {
                          e.preventDefault();
                          const textarea = e.currentTarget;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after  = text.substring(end, text.length);
                          
                          const isImageUri = droppedText.startsWith("data:image/");
                          const formattedText = isImageUri
                            ? `![imagen](${droppedText})`
                            : droppedText;

                          const newValue = before + formattedText + after;
                          setAppearanceValue(newValue);
                          
                          const newCursorPos = start + formattedText.length;
                          requestAnimationFrame(() => {
                            textarea.focus();
                            textarea.setSelectionRange(newCursorPos, newCursorPos);
                          });
                          break;
                        }
                        default:
                          break;
                      }
                    }}
                  />
                </div>
              </div>

              <div className="space-y-12">
                <div className="monolithic-panel border border-foreground/10 bg-background/20 p-8 space-y-6">
                  <header className="flex items-center gap-3 text-[hsl(var(--primary))] border-b border-[hsl(var(--foreground)/0.05)] pb-4">
                    <span className="material-symbols-outlined text-lg">
                      photo_library
                    </span>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--foreground))]">
                      Archivos Visuales
                    </h3>
                  </header>

                  <div className="grid grid-cols-[2fr_auto_1fr] gap-4 items-center">
                    <div>
                      {primaryImage ? (
                        <div
                          className="aspect-[16/10] bg-background border border-foreground/10 overflow-hidden relative group cursor-zoom-in"
                          onClick={() => setZoomImage(primaryImage)}
                        >
                          <img
                            src={primaryImage}
                            draggable
                            onDragStart={(e) => {
                              e.dataTransfer.setData("text/plain", `![imagen](gallery:0)`);
                            }}
                            className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-all duration-700 cursor-grab active:cursor-grabbing"
                            alt="Imagen principal"
                          />
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              removeImage(0);
                            }}
                            className="absolute top-2 right-2 size-8 bg-destructive text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-2xl"
                          >
                            <span className="material-symbols-outlined text-xs">
                              close
                            </span>
                          </button>
                        </div>
                      ) : (
                        <label className="aspect-[16/10] border-2 border-dashed border-foreground/5 flex flex-col items-center justify-center gap-4 hover:bg-background hover:border-primary/30 transition-all cursor-pointer group">
                          <div className="size-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                            <span className="material-symbols-outlined text-primary/40 group-hover:text-primary text-xl">
                              add_a_photo
                            </span>
                          </div>
                          <span className="text-[8px] font-black uppercase text-foreground/20 group-hover:text-primary tracking-[0.3em]">
                            Upload Fragment
                          </span>
                          <input
                            type="file"
                            multiple
                            className="hidden"
                            onChange={handleImageUpload}
                            accept="image/*"
                          />
                        </label>
                      )}
                    </div>

                    <div className="flex flex-col items-center justify-center gap-2 px-1">
                      {hasMoreImages && (
                        <>
                          <button
                            type="button"
                            onClick={() =>
                              setSecondaryPage((prev) =>
                                prev + 1 >= secondaryPageCount ? 0 : prev + 1,
                              )
                            }
                            className="size-9 flex items-center justify-center border border-primary/30 text-primary/80 hover:text-primary hover:bg-primary/10 transition-all"
                            title="Siguiente bloque"
                          >
                            <span className="material-symbols-outlined text-xl">
                              arrow_forward
                            </span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setSecondaryPage((prev) =>
                                prev - 1 < 0
                                  ? secondaryPageCount - 1
                                  : prev - 1,
                              )
                            }
                            className="size-9 flex items-center justify-center border border-primary/30 text-primary/80 hover:text-primary hover:bg-primary/10 transition-all"
                            title="Bloque anterior"
                          >
                            <span className="material-symbols-outlined text-xl">
                              arrow_back
                            </span>
                          </button>
                        </>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 p-1">
                      {secondaryImages.map((img: string, i: number) => {
                        const originalIndex = secondaryStart + i + 1;
                        return (
                          <div
                            key={originalIndex}
                            className="aspect-[16/10] bg-background border border-foreground/10 overflow-hidden relative group cursor-zoom-in"
                            onClick={() => setZoomImage(img)}
                          >
                            <img
                              src={img}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", `![imagen](gallery:${originalIndex})`);
                              }}
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-all duration-500 cursor-grab active:cursor-grabbing"
                              alt={`Miniatura ${originalIndex}`}
                            />
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                removeImage(originalIndex);
                              }}
                              className="absolute top-1 right-1 size-6 bg-destructive text-primary-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"
                            >
                              <span className="material-symbols-outlined text-[10px]">
                                close
                              </span>
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <label className="border-2 border-dashed border-foreground/5 flex items-center justify-center gap-3 py-4 hover:bg-background hover:border-primary/30 transition-all cursor-pointer group">
                    <span className="material-symbols-outlined text-primary/40 group-hover:text-primary text-xl">
                      add_a_photo
                    </span>
                    <span className="text-[8px] font-black uppercase text-foreground/20 group-hover:text-primary tracking-[0.3em]">
                      Upload Fragment
                    </span>
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={handleImageUpload}
                      accept="image/*"
                    />
                  </label>
                </div>
              </div>
            </div>
          )}

          {activeEntityTab === "narrative" && (
            <div className="space-y-12">
              <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 items-start">
                <div
                  className="monolithic-panel border border-foreground/10 bg-background/20 p-12 flex flex-col"
                  style={{ minHeight: `${narrativeMinHeight}px` }}
                >
                  <header className="flex items-center justify-between mb-8 border-b border-white/5 pb-6">
                    <div className="flex items-center gap-4">
                      <span className="material-symbols-outlined text-primary/60">
                        history_edu
                      </span>
                      <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[hsl(var(--foreground))]">
                        Cronología
                      </h3>
                    </div>
                    <div className="flex items-center gap-2 text-primary/20">
                      <span className="material-symbols-outlined text-xs">
                        markdown
                      </span>
                      <span className="text-[8px] font-black uppercase tracking-widest">
                        System Ready
                      </span>
                    </div>
                  </header>

                  <div className="flex items-center gap-2 border border-foreground/10 bg-foreground/[0.02] p-2 mb-6">
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleNarrativeUndo}
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border border-foreground/10 hover:border-primary/40 hover:text-primary transition-all"
                      title="Deshacer (Ctrl+Z)"
                    >
                      ↶
                    </button>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={handleNarrativeRedo}
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border border-foreground/10 hover:border-primary/40 hover:text-primary transition-all"
                      title="Rehacer (Ctrl+Y / Ctrl+Shift+Z)"
                    >
                      ↷
                    </button>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applyNarrativeWrapFormatting("**")}
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border border-foreground/10 hover:border-primary/40 hover:text-primary transition-all"
                      title="Negrita (Ctrl+B)"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => applyNarrativeWrapFormatting("*")}
                      className="px-3 py-1 text-[10px] italic font-black uppercase tracking-[0.2em] border border-foreground/10 hover:border-primary/40 hover:text-primary transition-all"
                      title="Cursiva (Ctrl+I)"
                    >
                      I
                    </button>
                    <button
                      type="button"
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={applyNarrativeTabIndent}
                      className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] border border-foreground/10 hover:border-primary/40 hover:text-primary transition-all"
                      title="Tabulación"
                    >
                      TAB
                    </button>
                  </div>

                  <textarea
                    ref={narrativeTextareaRef}
                    className="flex-1 w-full bg-transparent border-none outline-none text-xl text-foreground font-medium leading-relaxed resize-none custom-scrollbar placeholder:text-foreground/20 italic"
                    placeholder="Escribe la historia, leyendas y mitos corporativos..."
                    value={entity.descripcion || ""}
                    onKeyDown={handleNarrativeKeyDown}
                    onChange={(e) => setNarrativeValue(e.target.value)}
                    onDrop={(e) => {
                      const droppedText = e.dataTransfer.getData("text/plain");
                      const hasText = !!droppedText;
                      switch (hasText) {
                        case true: {
                          e.preventDefault();
                          const textarea = e.currentTarget;
                          const start = textarea.selectionStart;
                          const end = textarea.selectionEnd;
                          const text = textarea.value;
                          const before = text.substring(0, start);
                          const after  = text.substring(end, text.length);
                          
                          const isImageUri = droppedText.startsWith("data:image/");
                          const formattedText = isImageUri
                            ? `![imagen](${droppedText})`
                            : droppedText;

                          const newValue = before + formattedText + after;
                          setNarrativeValue(newValue);
                          
                          const newCursorPos = start + formattedText.length;
                          requestAnimationFrame(() => {
                            textarea.focus();
                            textarea.setSelectionRange(newCursorPos, newCursorPos);
                          });
                          break;
                        }
                        default:
                          break;
                      }
                    }}
                  />
                </div>

                <div
                  className="monolithic-panel border border-foreground/10 bg-background/20 p-8 flex flex-col"
                  style={{ minHeight: `${narrativeMinHeight}px` }}
                >
                  <header className="flex items-center gap-3 mb-6 border-b border-foreground/5 pb-4">
                    <span className="material-symbols-outlined text-primary/60 text-lg">
                      photo_library
                    </span>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[hsl(var(--foreground))]">
                      Galería
                    </h3>
                  </header>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {galleryImages.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {galleryImages.map((img: string, i: number) => (
                          <div
                            key={i}
                            className="aspect-[16/10] bg-background border border-foreground/10 overflow-hidden relative group cursor-zoom-in"
                            onClick={() => setZoomImage(img)}
                          >
                            <img
                              src={img}
                              draggable
                              onDragStart={(e) => {
                                e.dataTransfer.setData("text/plain", `![imagen](gallery:${i})`);
                              }}
                              className="w-full h-full object-cover opacity-70 group-hover:opacity-100 transition-all duration-500 cursor-grab active:cursor-grabbing"
                              alt={`Galería narrativa ${i + 1}`}
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full min-h-[12rem] flex items-center justify-center border border-dashed border-foreground/10 text-foreground/30 text-[10px] font-black uppercase tracking-[0.2em]">
                        Sin imágenes en galería
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {(activeEntityTab === "attributes" || isPresetEditorTab) && (
            <div className="space-y-12 min-h-[60vh]">
              <header className="flex items-center justify-between border-b border-foreground/10 pb-8">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary/60">
                    layers
                  </span>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[hsl(var(--foreground))]">
                    Atributos Modulares
                  </h3>
                </div>

                <div className="relative">
                  <button
                    onClick={() => setShowLibrary(!showLibrary)}
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-none font-black text-[9px] uppercase tracking-[0.2em] transition-all border ${showLibrary ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-primary/5 text-primary border-primary/20 hover:bg-primary/10"}`}
                  >
                    <span className="material-symbols-outlined text-sm">
                      {showLibrary ? "close" : "add_box"}
                    </span>
                    {showLibrary ? "Cerrar Biblioteca" : "Añadir Módulo"}
                  </button>

                  {showLibrary && (
                    <div className="absolute top-full right-0 mt-4 w-[22rem] h-[32rem] z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                      <div className="h-full border border-foreground/10 bg-background overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <EntityBuilderSidebar
                          templates={availableTemplates}
                          onAddTemplate={(tpl) => {
                            handleDropArea({
                              preventDefault: () => {},
                              stopPropagation: () => {},
                              dataTransfer: {
                                getData: () => JSON.stringify(tpl),
                              },
                            } as any);
                          }}
                          onRefresh={refreshTemplates}
                          projectId={projectId}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </header>

              <div
                className={`flex flex-wrap gap-8 p-4 transition-all duration-500 border-2 border-transparent ${isDraggingOver ? "bg-primary/5 border-dashed border-primary/40 shadow-2xl shadow-primary/5" : ""}`}
                onDragOver={handleDragOverArea}
                onDragLeave={handleDragLeaveArea}
                onDrop={handleDropArea}
              >
                {/* --- PRESERVATION ORIGINAL EMPTY PLACEHOLDER --- */}
                {/* {fields.length === 0 && !isDraggingOver && (
                  <div className="col-span-full py-32 border border-dashed border-white/5 flex flex-col items-center justify-center text-foreground/20 bg-background w-full">
                    <span className="material-symbols-outlined text-5xl mb-6 font-light">
                      inventory_2
                    </span>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">
                      Área de Atributos Vacía
                    </p>
                    <p className="text-[9px] mt-4 opacity-50 italic">
                      Arrastra aquí tus módulos desde el lateral derecho
                    </p>
                  </div>
                )} */}
                {fields.length === 0 && (
                  <div className={`col-span-full py-32 border border-dashed flex flex-col items-center justify-center bg-background w-full transition-all duration-300 ${
                    isDraggingOver 
                      ? "border-primary/40 text-primary bg-primary/5 shadow-2xl shadow-primary/5" 
                      : "border-white/5 text-foreground/20"
                  }`}>
                    <span className="material-symbols-outlined text-5xl mb-6 font-light">
                      {isDraggingOver ? "download" : "inventory_2"}
                    </span>
                    <p className="text-[10px] font-mono font-bold uppercase tracking-[0.25em]">
                      {isDraggingOver ? "¡Suelta el Módulo Aquí!" : "Área de Atributos Vacía"}
                    </p>
                    <p className="text-[9px] mt-4 opacity-50 italic">
                      {isDraggingOver ? "Libera el atributo para añadirlo a esta entidad" : "Arrastra aquí tus módulos desde el lateral derecho"}
                    </p>
                  </div>
                )}
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="animate-in fade-in slide-in-from-bottom-2 duration-500"
                  >
                    <AttributeField
                      attribute={field.attribute}
                      value={field.value}
                      onChange={(val) => handleFieldChange(field.id, val)}
                      onRemove={() => handleRemoveField(field.id)}
                      onEditTemplate={(tpl) => {
                        setEditingTemplate(tpl);
                        setEditingFieldId(field.id);
                      }}
                    />
                  </div>
                ))}
              </div>

              {/* --- PRESERVATION ORIGINAL TEMPLATE SETTINGS MODAL --- */}
              {/* {editingTemplate && (
                <TemplateSettingsModal
                  template={editingTemplate}
                  onClose={() => setEditingTemplate(null)}
                  onSave={async () => {
                    await refreshTemplates();
                    setEditingTemplate(null);
                  }}
                />
              )} */}
              {editingTemplate && (
                <TemplateSettingsModal
                  template={editingTemplate}
                  isIndividual={true}
                  projectId={projectId}
                  onClose={() => {
                    setEditingTemplate(null);
                    setEditingFieldId(null);
                  }}
                  onSave={async (newTpl) => {
                    // --- PRESERVATION ORIGINAL IN-MEMORY DISCONNECT ---
                    // await refreshTemplates();
                    // if (newTpl) {
                    //   // Al ser una edición local, desvinculamos el campo de la plantilla global original
                    //   const fieldToUpdate = fields.find((f) => f.attribute.id === editingTemplate.id);
                    //   if (fieldToUpdate && !fieldToUpdate.isTemp) {
                    //     // Enviamos el valor asociado a la plantilla global antigua a la pila de eliminación en DB
                    //     setRemovedFieldIds((prev) => [...prev, fieldToUpdate.id as number]);
                    //   }
                    //   setFields((prev) =>
                    //     prev.map((f) =>
                    //       f.attribute.id === editingTemplate.id
                    //         ? {
                    //             ...f,
                    //             id: `temp-${newTpl.id}-${Date.now()}`,
                    //             attribute: newTpl,
                    //             isTemp: true,
                    //           }
                    //         : f
                    //     )
                    //   );
                    // }

                    if (newTpl) {
                      const fieldToUpdate = fields.find((f) => f.id === editingFieldId);
                      fieldToUpdate && !fieldToUpdate.isTemp
                        ? setRemovedFieldIds((prev) => [...prev, fieldToUpdate.id as number])
                        : undefined;

                      setFields((prev) =>
                        prev.map((f) =>
                          f.id === editingFieldId
                            ? {
                                ...f,
                                id: `temp-${newTpl.id}-${Date.now()}`,
                                attribute: newTpl,
                                isTemp: true,
                              }
                            : f
                        )
                      );
                    }
                    setEditingTemplate(null);
                    setEditingFieldId(null);
                  }}
                />
              )}
            </div>
          )}

          {activeEntityTab === "relationships" && entity.id && (
            <FamilyTreeAssigner entityId={entity.id} projectId={projectId} />
          )}
        </div>

        {zoomImage && (
          <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-300"
            onClick={() => setZoomImage(null)}
          >
            <button
              className="absolute top-10 right-10 text-foreground/40 hover:text-foreground transition-colors"
              onClick={() => setZoomImage(null)}
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>
            <img
              src={zoomImage}
              className="max-w-[90vw] max-h-[85vh] object-contain border border-foreground/10 shadow-2xl"
              alt="Zoom"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityBuilder;
