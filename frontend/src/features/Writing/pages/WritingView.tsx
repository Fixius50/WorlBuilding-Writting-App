import React, { useEffect, useState, useCallback, useMemo } from "react";
import { useLanguage } from "@context/LanguageContext";
import ZenEditor from "@features/Editor/components/ZenEditor";
import ConfirmModal from "@organisms/ConfirmModal";
import { useWritingView } from "./useWritingView";
import { useNavigate, useParams } from "react-router-dom";
import GlobalNotes from "@presentation/layout/GlobalNotes";
import { EntityUseCase } from "@application/useCases/EntityUseCase";
import { WorkspaceUseCase } from "@application/useCases/WorkspaceUseCase";
import { Entidad } from "@domain/models/database";

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
    setCustomContent,
  } = useWritingView();

  const { projectName } = useParams();
  const navigate = useNavigate();
  const [panelTab, setPanelTab] = useState<
    "index" | "notes" | "bible" | "metadata"
  >("index");
  const [entities, setEntities] = useState<Entidad[]>([]);
  const [bibleSearch, setBibleSearch] = useState<string>("");
  const [expandedEntityId, setExpandedEntityId] = useState<number | null>(null);

  // Estados de metadatos de escena
  const [povId, setPovId] = useState<string>("");
  const [locationId, setLocationId] = useState<string>("");
  const [sceneDate, setSceneDate] = useState<string>("");

  useEffect(() => {
    switch (!!notebook?.project_id) {
      case true:
        EntityUseCase.getAllByProject(notebook!.project_id).then((list) => {
          setEntities(
            list.filter((e) => e.tipo !== "Map" && e.tipo !== "Mapa"),
          );
        });
        break;
      default:
        break;
    }
  }, [notebook?.project_id]);

  const currentPage = pages[currentPageIndex];

  useEffect(() => {
    const loadMeta = async () => {
      switch (!!currentPage?.id) {
        case true: {
          const saved = await WorkspaceUseCase.getSetting(
            `page_metadata_${currentPage.id}`,
          );
          switch (!!saved) {
            case true: {
              try {
                const parsed = JSON.parse(saved!);
                setPovId(parsed.povId || "");
                setLocationId(parsed.locationId || "");
                setSceneDate(parsed.sceneDate || "");
              } catch {}
              break;
            }
            default:
              setPovId("");
              setLocationId("");
              setSceneDate("");
              break;
          }
          break;
        }
        default:
          break;
      }
    };
    loadMeta();
  }, [currentPage?.id]);

  const handleSaveMetadata = useCallback(
    async (newPov: string, newLoc: string, newDate: string) => {
      switch (!!currentPage?.id) {
        case true: {
          const meta = {
            povId: newPov,
            locationId: newLoc,
            sceneDate: newDate,
          };
          await WorkspaceUseCase.saveSetting(
            `page_metadata_${currentPage.id}`,
            JSON.stringify(meta),
          );
          break;
        }
        default:
          break;
      }
    },
    [currentPage?.id],
  );

  const filteredEntities = useMemo(() => {
    const searchLower = bibleSearch.toLowerCase();
    const result = entities.filter(
      (e) =>
        (e.nombre || "").toLowerCase().includes(searchLower) ||
        (e.tipo || "").toLowerCase().includes(searchLower),
    );
    return result;
  }, [entities, bibleSearch]);

  const characters = useMemo(() => {
    const result = entities.filter((e) => {
      const tUpper = e.tipo ? e.tipo.toUpperCase() : "";
      const isChar = tUpper === "PERSONAJE" || tUpper === "INDIVIDUAL";
      return isChar;
    });
    return result;
  }, [entities]);

  const locations = useMemo(() => {
    const result = entities.filter((e) => {
      const tUpper = e.tipo ? e.tipo.toUpperCase() : "";
      const isLoc = tUpper === "LUGAR" || tUpper === "TERRITORIO";
      return isLoc;
    });
    return result;
  }, [entities]);

  const filteredPages = pages.filter(
    (p) =>
      (p.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.contenido || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  useEffect(() => {
    const renderRightPanel = () => (
      <div className="flex flex-col h-full monolithic-panel/95 select-none">
        {/* Cabecera del Panel */}
        <div className="p-4 border-b border-foreground/10 flex items-center justify-center bg-background/60 relative">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">
            {notebook?.titulo || "Archivador"}
          </h3>
          {saving && (
            <div className="absolute right-4 animate-pulse">
              <span className="material-symbols-outlined text-xs text-amber-500 animate-spin">
                sync
              </span>
            </div>
          )}
        </div>

        {/* Pestañas del Súper Inspector */}
        <div className="flex border-b border-foreground/10 bg-background/40">
          <button
            onClick={() => setPanelTab("index")}
            className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${panelTab === "index" ? "border-primary text-primary" : "border-transparent text-foreground/40 hover:text-foreground"}`}
            title="Archivador de Hojas"
          >
            <span className="material-symbols-outlined text-base">
              list_alt
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider hidden xl:inline">
              Archivador
            </span>
          </button>

          <button
            onClick={() => setPanelTab("notes")}
            className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${panelTab === "notes" ? "border-primary text-primary" : "border-transparent text-foreground/40 hover:text-foreground"}`}
            title="Notas de la Hoja"
          >
            <span className="material-symbols-outlined text-base">
              edit_note
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider hidden xl:inline">
              Notas
            </span>
          </button>

          <button
            onClick={() => setPanelTab("bible")}
            className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${panelTab === "bible" ? "border-primary text-primary" : "border-transparent text-foreground/40 hover:text-foreground"}`}
            title="Biblia Rápida"
          >
            <span className="material-symbols-outlined text-base">
              menu_book
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider hidden xl:inline">
              Biblia
            </span>
          </button>

          <button
            onClick={() => setPanelTab("metadata")}
            className={`flex-1 py-3 text-center border-b-2 transition-all flex items-center justify-center gap-1.5 ${panelTab === "metadata" ? "border-primary text-primary" : "border-transparent text-foreground/40 hover:text-foreground"}`}
            title="Metadatos de Escena"
          >
            <span className="material-symbols-outlined text-base">
              settings
            </span>
            <span className="text-[9px] font-black uppercase tracking-wider hidden xl:inline">
              Escena
            </span>
          </button>
        </div>

        {/* Contenido Dinámico según la pestaña activa */}
        <div
          className="flex-1 overflow-hidden flex flex-col relative"
          style={{ backgroundColor: "hsl(var(--background))" }}
        >
          {(() => {
            switch (panelTab) {
              case "notes":
                return (
                  <div className="flex-1 overflow-y-auto p-4 custom-scrollbar h-full">
                    {currentPage ? (
                      <GlobalNotes
                        projectName={projectName || ""}
                        storageKey={`notes_page_${currentPage.id}`}
                      />
                    ) : (
                      <div className="p-10 text-center text-[10px] font-black uppercase tracking-widest opacity-25">
                        Crea una hoja para añadir notas
                      </div>
                    )}
                  </div>
                );

              case "bible":
                return (
                  <div className="flex-1 flex flex-col h-full overflow-hidden select-text">
                    <div className="p-4 border-b border-foreground/5">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/40 font-black">
                          search
                        </span>
                        <input
                          type="text"
                          placeholder="Buscar en la Biblia..."
                          className="w-full bg-foreground/5 border border-foreground/10 py-2.5 pl-9 pr-4 text-[10px] font-mono outline-none focus:border-primary/50 transition-all text-white placeholder:text-foreground/30"
                          value={bibleSearch}
                          onChange={(e) => setBibleSearch(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                      {filteredEntities.length === 0 ? (
                        <div className="p-8 text-center text-[10px] font-black uppercase tracking-widest opacity-20">
                          Sin coincidencias en la biblia
                        </div>
                      ) : (
                        filteredEntities.map((ent) => {
                          const isExpanded = expandedEntityId === ent.id;
                          let entImg = "";
                          let entDesc = "";
                          try {
                            const attrs =
                              typeof ent.contenido_json === "string"
                                ? JSON.parse(ent.contenido_json)
                                : ent.contenido_json || {};
                            entImg =
                              attrs.imageUrl ||
                              attrs.image ||
                              attrs.avatar ||
                              "";
                            entDesc =
                              ent.descripcion ||
                              attrs.description ||
                              "Sin descripción adicional en la biblia.";
                          } catch {}

                          return (
                            <div
                              key={ent.id}
                              className="border border-foreground/5 bg-foreground/[0.02] hover:bg-foreground/[0.04] transition-all p-3 space-y-3"
                            >
                              <div
                                className="flex items-center gap-3 cursor-pointer select-none"
                                onClick={() =>
                                  setExpandedEntityId(
                                    isExpanded ? null : ent.id,
                                  )
                                }
                              >
                                <div className="size-8 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary text-xs shrink-0">
                                  <span className="material-symbols-outlined text-sm">
                                    {ent.tipo?.toUpperCase() === "PERSONAJE" ||
                                    ent.tipo?.toUpperCase() === "INDIVIDUAL"
                                      ? "person"
                                      : ent.tipo?.toUpperCase() === "LUGAR" ||
                                          ent.tipo?.toUpperCase() ===
                                            "TERRITORIO"
                                        ? "location_on"
                                        : "category"}
                                  </span>
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-[11px] font-bold text-foreground truncate">
                                    {ent.nombre}
                                  </div>
                                  <div className="text-[8px] text-foreground/40 uppercase font-black tracking-widest">
                                    {ent.tipo}
                                  </div>
                                </div>
                                <span
                                  className="material-symbols-outlined text-sm text-foreground/20 transition-transform duration-300"
                                  style={{
                                    transform: isExpanded
                                      ? "rotate(90deg)"
                                      : "rotate(0deg)",
                                  }}
                                >
                                  chevron_right
                                </span>
                              </div>

                              {isExpanded && (
                                <div className="pt-2 border-t border-foreground/5 space-y-3 animate-in fade-in duration-300">
                                  {entImg && (
                                    <div className="aspect-video w-full overflow-hidden border border-foreground/10">
                                      <img
                                        src={entImg}
                                        alt={ent.nombre}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                  )}
                                  <p className="text-[10px] text-foreground/75 leading-relaxed font-serif">
                                    {entDesc}
                                  </p>
                                  <button
                                    onClick={() => {
                                      // Panel derecho eliminado: antes abría perfil en inspector lateral.
                                      navigate(
                                        `/local/${projectName}/bible/entity/${ent.id}`,
                                      );
                                    }}
                                    className="w-full py-1.5 bg-primary/10 hover:bg-primary/20 border border-primary/30 text-primary text-[8px] font-black uppercase tracking-widest transition-all"
                                  >
                                    Ver Perfil Completo
                                  </button>
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                );

              case "metadata":
                return (
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar animate-in fade-in duration-300 select-text">
                    {currentPage ? (
                      <>
                        <div className="space-y-1">
                          <span className="text-[8px] font-black uppercase tracking-[0.2em] text-primary">
                            Detalles Contextuales
                          </span>
                          <h4 className="text-xs font-black uppercase text-foreground">
                            Metadatos de Escena
                          </h4>
                        </div>

                        {/* POV Character */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-foreground/40 px-0.5">
                            Personaje POV (Punto de Vista)
                          </label>
                          <select
                            value={povId}
                            onChange={(e) => {
                              setPovId(e.target.value);
                              handleSaveMetadata(
                                e.target.value,
                                locationId,
                                sceneDate,
                              );
                            }}
                            className="w-full bg-[#1e1e1e] border border-foreground/10 py-2.5 px-3 text-[10px] font-mono outline-none focus:border-primary/50 transition-all text-white"
                          >
                            <option value="" className="text-foreground/40">
                              Seleccionar personaje...
                            </option>
                            {characters.map((char) => (
                              <option key={char.id} value={char.id}>
                                {char.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Location */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-foreground/40 px-0.5">
                            Escenario / Ubicación
                          </label>
                          <select
                            value={locationId}
                            onChange={(e) => {
                              setLocationId(e.target.value);
                              handleSaveMetadata(
                                povId,
                                e.target.value,
                                sceneDate,
                              );
                            }}
                            className="w-full bg-[#1e1e1e] border border-foreground/10 py-2.5 px-3 text-[10px] font-mono outline-none focus:border-primary/50 transition-all text-white"
                          >
                            <option value="" className="text-foreground/40">
                              Seleccionar ubicación...
                            </option>
                            {locations.map((loc) => (
                              <option key={loc.id} value={loc.id}>
                                {loc.nombre}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Simulated Date */}
                        <div className="space-y-2">
                          <label className="text-[9px] font-black uppercase tracking-widest text-foreground/40 px-0.5">
                            Fecha del Acontecimiento
                          </label>
                          <input
                            type="text"
                            placeholder="Ej. Año 124 de la Segunda Era..."
                            value={sceneDate}
                            onChange={(e) => {
                              setSceneDate(e.target.value);
                              handleSaveMetadata(
                                povId,
                                locationId,
                                e.target.value,
                              );
                            }}
                            className="w-full bg-[#1e1e1e] border border-foreground/10 py-2.5 px-3 text-[10px] font-mono outline-none focus:border-primary/50 transition-all text-white placeholder:text-foreground/20"
                          />
                        </div>

                        <div className="pt-4 border-t border-foreground/5">
                          <p className="text-[9px] text-foreground/30 italic leading-relaxed">
                            Tip: Estos metadatos te ayudan a organizar
                            cronológicamente tus escenas y a realizar un
                            seguimiento de dónde se encuentran tus personajes en
                            cada capítulo.
                          </p>
                        </div>
                      </>
                    ) : (
                      <div className="p-10 text-center text-[10px] font-black uppercase tracking-widest opacity-25">
                        Crea una hoja para asignar metadatos
                      </div>
                    )}
                  </div>
                );

              case "index":
              default:
                return (
                  <div className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex p-2 gap-2 border-b border-foreground/10 bg-background/20 select-none">
                      <button
                        onClick={() => setActiveTab("index")}
                        className={`flex-1 py-2 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "index" ? "bg-primary text-foreground shadow-lg" : "text-foreground/60 hover:text-foreground"}`}
                      >
                        {t("writing.index")}
                      </button>
                      <button
                        onClick={() => setActiveTab("format")}
                        className={`flex-1 py-2 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === "format" ? "bg-primary text-foreground shadow-lg" : "text-foreground/60 hover:text-foreground"}`}
                      >
                        {t("writing.format")}
                      </button>
                    </div>

                    <div className="flex-1 overflow-hidden">
                      {activeTab === "index" ? (
                        <div className="flex flex-col h-full">
                          <div className="p-4 border-b border-foreground/5 select-none">
                            <div className="relative">
                              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/40">
                                search
                              </span>
                              <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full bg-foreground/5 border border-foreground/10 py-2 pl-9 pr-4 text-[10px] font-mono outline-none focus:border-primary/50 transition-all text-white placeholder:text-foreground/30 select-text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                              />
                            </div>
                          </div>
                          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                            {filteredPages.map((page) => {
                              const globalIdx = pages.findIndex(
                                (p) => p.id === page.id,
                              );
                              const isSelected = globalIdx === currentPageIndex;
                              return (
                                <div key={page.id} className="group relative">
                                  <div
                                    onClick={() => handlePageSelect(globalIdx)}
                                    className={`w-full text-left p-4 rounded-none border transition-all cursor-pointer ${
                                      isSelected
                                        ? "bg-primary/10 border-primary/30 text-primary shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.1)]"
                                        : "bg-foreground/5 border-transparent hover:bg-foreground/10 text-foreground/60"
                                    }`}
                                  >
                                    <div className="flex justify-between items-center mb-1">
                                      {editingPageId === page.id ? (
                                        <input
                                          autoFocus
                                          onBlur={() => setEditingPageId(null)}
                                          onKeyDown={(e) => {
                                            if (e.key === "Enter")
                                              setEditingPageId(null);
                                            e.stopPropagation();
                                          }}
                                          onClick={(e) => e.stopPropagation()}
                                          className={`bg-[#1e1e1e] border-b border-primary font-serif font-bold text-sm outline-none w-full px-1 ${isSelected ? "text-primary" : "text-foreground/80"}`}
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
                                          className={`font-serif font-bold text-sm truncate w-full ${isSelected ? "text-primary" : "text-foreground/80"}`}
                                        >
                                          {page.titulo ||
                                            `Hoja ${globalIdx + 1}`}
                                        </span>
                                      )}
                                      {isSelected && !editingPageId && (
                                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 ml-2 animate-pulse"></span>
                                      )}
                                    </div>
                                    <p className="text-[10px] line-clamp-1 opacity-50 font-mono break-words leading-relaxed pointer-events-none">
                                      {page.contenido
                                        ?.replace(/<[^>]+>/g, "")
                                        .substring(0, 30) || "Sin contenido..."}
                                    </p>
                                  </div>
                                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-30">
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        setEditingPageId(page.id);
                                      }}
                                      className="p-1.5 rounded-none text-foreground/40 hover:text-primary hover:bg-primary/10 transition-all"
                                      title="Editar título"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        edit
                                      </span>
                                    </button>
                                    <button
                                      onClick={(e) =>
                                        deletePage(e, page.id, globalIdx)
                                      }
                                      className="p-1.5 rounded-none text-foreground/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                                      title="Eliminar hoja"
                                    >
                                      <span className="material-symbols-outlined text-sm">
                                        delete
                                      </span>
                                    </button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                          <div className="p-4 bg-background/20 border-t border-foreground/10 select-none">
                            <button
                              onClick={handleCreatePage}
                              className="w-full py-3 bg-primary text-foreground rounded-none text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
                            >
                              <span className="material-symbols-outlined text-base">
                                add
                              </span>
                              <span>AÑADIR HOJA</span>
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4 select-text">
                          <div className="space-y-4">
                            <h3 className="text-xs font-black uppercase text-primary mb-4 tracking-widest">
                              {t("writing.format")}
                            </h3>
                            <div className="space-y-2 text-[11px] text-foreground/60 font-mono">
                              <div className="flex justify-between items-center p-2 bg-background/20 rounded">
                                <span>Negrita</span>
                                <kbd>Ctrl+B</kbd>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-background/20 rounded">
                                <span>Cursiva</span>
                                <kbd>Ctrl+I</kbd>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-background/20 rounded">
                                <span>Mencionar Entidad</span>
                                <kbd>@</kbd>
                              </div>
                              <div className="flex justify-between items-center p-2 bg-background/20 rounded">
                                <span>Comandos / Menú</span>
                                <kbd>/</kbd>
                              </div>
                            </div>
                            <div className="pt-6 border-t border-foreground/5 space-y-3">
                              <p className="text-[10px] text-foreground/40 leading-relaxed italic">
                                Tip: Puedes invocar entidades de tu biblia
                                escribiendo @ y seleccionando el nombre. Usa /
                                para insertar separadores o dar formato
                                avanzado.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
            }
          })()}
        </div>
      </div>
    );

    setCustomContent(renderRightPanel(), notebook?.titulo || "Archivador");
  }, [
    notebook,
    pages,
    activeTab,
    searchTerm,
    editingPageId,
    saving,
    currentPageIndex,
    handlePageSelect,
    handleCreatePage,
    handleTitleChangeInternal,
    setCustomContent,
    t,
    deletePage,
    panelTab,
    entities,
    bibleSearch,
    expandedEntityId,
    povId,
    locationId,
    sceneDate,
    characters,
    locations,
    filteredEntities,
    handleSaveMetadata,
    projectName,
    currentPage,
  ]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground/60 font-serif text-2xl italic tracking-widest">
          Abriendo Archivador...
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex w-full h-full bg-[#111] relative font-sans text-foreground/60">
      <div className="flex-1 flex flex-col relative z-10">
        <main className="flex-1 flex flex-col relative bg-[#1e1e1e]">
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
            />
          )}
        </main>
      </div>
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
    </div>
  );
};

export default WritingView;
