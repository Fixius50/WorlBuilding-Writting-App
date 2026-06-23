import React from "react";
import { AtlasLevel, AtlasAnnotation, MapMarker } from "@domain/maps";
import { Entidad, Carpeta } from "@domain/database";

type SidebarTab = "levels" | "notes" | "info" | "marker" | null;

interface MapAtlasSidebarProps {
  activeSidebarTab: SidebarTab;
  setActiveSidebarTab: (tab: SidebarTab) => void;
  // Datos del Atlas
  levels: AtlasLevel[];
  annotations: AtlasAnnotation[];
  activeLevelId: string;
  levelOpacities: Record<string, number>;
  hoveredLevelOpacityId: string | null;
  map: Entidad;
  // CRUD Temp States
  editingLevelId: string | null;
  levelInputText: string;
  newLevelName: string;
  editingAnnotationId: string | null;
  annotationInputText: string;
  annotationInputLevelId: string;
  newAnnotationText: string;
  newAnnotationLevelId: string;
  // Setters
  setHoveredLevelOpacityId: (id: string | null) => void;
  setLevelOpacities: (opacities: Record<string, number>) => void;
  setEditingLevelId: (id: string | null) => void;
  setLevelInputText: (text: string) => void;
  setNewLevelName: (name: string) => void;
  setEditingAnnotationId: (id: string | null) => void;
  setAnnotationInputText: (text: string) => void;
  setAnnotationInputLevelId: (id: string) => void;
  setNewAnnotationText: (text: string) => void;
  setNewAnnotationLevelId: (id: string) => void;
  // Handlers
  handleTeleport: (levelId: string) => void;
  handleSaveEditLevel: (id: string, name: string) => void;
  handleDeleteLevel: (id: string) => void;
  handleUploadLevelBgImage: (levelId: string, dataUrl: string) => void;
  handleAddLevel: (name: string, position: "above" | "below") => void;
  handleAddAnnotation: (text: string, levelId: string) => void;
  handleSaveEditAnnotation: (id: string, text: string, levelId: string) => void;
  handleDeleteAnnotation: (id: string) => void;
  updateAtlasCache: (updates: Record<string, unknown>) => void;
  brushSize?: number;
  setBrushSize?: (size: number) => void;
  levelSpacing?: number;
  setLevelSpacing?: (spacing: number) => void;
  is3D?: boolean;
  // Marker Details Props
  selectedMarkerId?: string | null;
  setSelectedMarkerId?: (id: string | null) => void;
  markers?: MapMarker[];
  setMarkers?: React.Dispatch<React.SetStateAction<MapMarker[]>>;
  allEntities?: Entidad[];
  allFolders?: Carpeta[];
}

// Panel lateral colapsable estilo VS Code con las pestañas Niveles, Notas e Info
const MapAtlasSidebar: React.FC<MapAtlasSidebarProps> = ({
  activeSidebarTab,
  setActiveSidebarTab,
  levels,
  annotations,
  activeLevelId,
  levelOpacities,
  hoveredLevelOpacityId,
  map,
  editingLevelId,
  levelInputText,
  newLevelName,
  editingAnnotationId,
  annotationInputText,
  annotationInputLevelId,
  newAnnotationText,
  newAnnotationLevelId,
  setHoveredLevelOpacityId,
  setLevelOpacities,
  setEditingLevelId,
  setLevelInputText,
  setNewLevelName,
  setEditingAnnotationId,
  setAnnotationInputText,
  setAnnotationInputLevelId,
  setNewAnnotationText,
  setNewAnnotationLevelId,
  handleTeleport,
  handleSaveEditLevel,
  handleDeleteLevel,
  handleUploadLevelBgImage,
  handleAddLevel,
  handleAddAnnotation,
  handleSaveEditAnnotation,
  handleDeleteAnnotation,
  updateAtlasCache,
  brushSize = 10,
  setBrushSize,
  levelSpacing = 100,
  setLevelSpacing,
  is3D = false,
  selectedMarkerId = null,
  setSelectedMarkerId,
  markers = [],
  setMarkers,
  allEntities = [],
  allFolders = [],
}) => {
  const [newLevelPosition, setNewLevelPosition] = React.useState<"above" | "below">("above");
  const [bibleSearch, setBibleSearch] = React.useState("");
  const [expandedFolders, setExpandedFolders] = React.useState<Record<number, boolean>>({});

  const toggleFolder = (folderId: number) => {
    setExpandedFolders(prev => ({ ...prev, [folderId]: !prev[folderId] }));
  };

  const getIconForType = (type?: string) => {
    switch (type?.toLowerCase()) {
      case "character":
      case "entidadindividual":
        return "person";
      case "magia":
      case "hechizo":
        return "auto_awesome";
      case "location":
      case "zona":
      case "construccion":
        return "location_on";
      case "culture":
      case "entidadcolectiva":
      case "claseprofesion":
        return "groups";
      case "universe":
      case "galaxy":
      case "system":
      case "planet":
        return "public";
      default:
        return "description";
    }
  };

  return (
    <div className="absolute top-3 right-4 h-[calc(100%-24px)] z-20 flex items-stretch gap-2.5 pointer-events-none select-none">
      {/* Panel de Contenido Desplegable */}
      {activeSidebarTab && (
        <div className="w-[20vw] min-w-[260px] bg-background border border-foreground/15 shadow-2xl rounded-xl flex flex-col pointer-events-auto overflow-hidden animate-in fade-in slide-in-from-right-3 duration-250">
          {/* Cabecera del Subpanel */}
          <div className="px-5 py-4 border-b border-foreground/10 flex items-center justify-between flex-shrink-0 bg-foreground/[0.01]">
            <h3 className="font-sans text-[11px] font-bold uppercase tracking-wider text-primary">
              {activeSidebarTab === "levels" && "Niveles del Atlas"}
              {activeSidebarTab === "notes" && "Anotaciones de Lore"}
              {activeSidebarTab === "info" && "Detalles del Atlas"}
              {activeSidebarTab === "marker" && "Detalle del Marcador"}
            </h3>
            <button
              onClick={() => setActiveSidebarTab(null)}
              className="size-6 rounded-md hover:bg-foreground/5 text-foreground/40 hover:text-foreground flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          </div>

          {/* Contenido Dinámico */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
            {/* --- TAB: NIVELES --- */}
            {activeSidebarTab === "levels" && (
              <>
                <div className="space-y-1 overflow-visible">
                  {levels.map((lvl) => {
                    const isLevelActive = activeLevelId === lvl.id;
                    const levelNameClass = isLevelActive
                      ? "bg-primary/10 text-primary border-primary/20 font-bold"
                      : "text-foreground/70 hover:text-foreground hover:bg-foreground/5 border-transparent";

                    return (
                      <div
                        key={lvl.id}
                        className={`group relative w-full border rounded text-[12px] flex flex-col transition-all overflow-visible ${levelNameClass}`}
                        onMouseEnter={() => setHoveredLevelOpacityId(lvl.id)}
                        onMouseLeave={() => setHoveredLevelOpacityId(null)}
                      >
                        <div className="flex items-center justify-between w-full py-2 px-3">
                          {/* Icono de Opacidad (Hover lateral) */}
                        <div
                          className="relative mr-2 flex items-center justify-center cursor-pointer text-foreground/45 hover:text-primary z-20 py-1"
                        >
                          <span className="material-symbols-outlined text-[16px]">opacity</span>
                        </div>

                        {editingLevelId === lvl.id ? (
                          <input
                            type="text"
                            value={levelInputText}
                            onChange={(e) => setLevelInputText(e.target.value)}
                            onBlur={() => { handleSaveEditLevel(lvl.id, levelInputText); setEditingLevelId(null); }}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") { handleSaveEditLevel(lvl.id, levelInputText); setEditingLevelId(null); }
                            }}
                            className="bg-foreground/[0.03] text-foreground border border-foreground/15 rounded px-2 py-0.5 outline-none font-sans text-xs w-[110px] z-10"
                            autoFocus
                          />
                        ) : (
                          <span className="cursor-pointer flex-1 select-none text-left" onClick={() => handleTeleport(lvl.id)}>
                            {lvl.name}
                          </span>
                        )}

                        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity z-10">
                          <button
                            onClick={() => {
                              const input = document.createElement("input");
                              input.type = "file";
                              input.accept = "image/*";
                              input.onchange = (e: Event) => {
                                const target = e.target as HTMLInputElement | null;
                                const file = target?.files?.[0];
                                if (file) {
                                  const reader = new FileReader();
                                  reader.onload = (event) => {
                                    const dataUrl = event.target?.result as string;
                                    handleUploadLevelBgImage(lvl.id, dataUrl);
                                  };
                                  reader.readAsDataURL(file);
                                }
                              };
                              input.click();
                            }}
                            className="text-foreground/45 hover:text-primary transition-colors flex items-center justify-center"
                            title="Subir plano/calco para esta capa"
                          >
                            <span className="material-symbols-outlined text-[14px]">upload_file</span>
                          </button>
                          <button onClick={() => { setEditingLevelId(lvl.id); setLevelInputText(lvl.name); }} className="text-foreground/40 hover:text-foreground">
                            <span className="material-symbols-outlined text-[14px]">edit</span>
                          </button>
                          <button onClick={() => handleDeleteLevel(lvl.id)} className="text-foreground/30 hover:text-red-400">
                            <span className="material-symbols-outlined text-[14px]">delete</span>
                          </button>
                        </div>
                      </div>
                      
                      {/* INLINE OPACITY SLIDER (Aparece debajo al hacer hover en el icono de opacidad) */}
                      {hoveredLevelOpacityId === lvl.id && (
                        <div
                          className="px-3 pb-3 pt-1 flex items-center gap-3 w-full bg-foreground/[0.02] border-t border-foreground/5"
                        >
                          <span className="material-symbols-outlined text-[14px] text-primary">opacity</span>
                          <input
                            type="range"
                            min="0"
                            max="100"
                            value={Math.round((levelOpacities[lvl.id] ?? 1) * 100)}
                            onChange={(e) => {
                              const val = parseFloat(e.target.value) / 100;
                              const nextOpacities = { ...levelOpacities, [lvl.id]: val };
                              setLevelOpacities(nextOpacities);
                              updateAtlasCache({ levelOpacities: nextOpacities });
                            }}
                            className="flex-1 accent-primary bg-foreground/10 h-1.5 rounded cursor-pointer appearance-none outline-none"
                          />
                          <span className="font-mono text-[10px] text-foreground/70 min-w-[24px]">
                            {Math.round((levelOpacities[lvl.id] ?? 1) * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

                <div className="flex flex-col gap-2 pt-2 border-t border-foreground/5 bg-transparent">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="Nuevo nivel..."
                      value={newLevelName}
                      onChange={(e) => setNewLevelName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") { handleAddLevel(newLevelName, newLevelPosition); setNewLevelName(""); }
                      }}
                      className="flex-1 bg-foreground/[0.03] text-foreground border border-foreground/10 rounded px-3 py-1.5 font-sans text-xs outline-none focus:border-foreground/20 placeholder:text-foreground/30"
                    />
                    <button
                      onClick={() => { handleAddLevel(newLevelName, newLevelPosition); setNewLevelName(""); }}
                      className="size-8 rounded bg-primary/15 border border-primary/20 text-primary hover:bg-primary hover:text-primary-foreground flex items-center justify-center transition-colors flex-shrink-0"
                      title="Añadir Nivel"
                    >
                      <span className="material-symbols-outlined text-[16px] font-bold">add</span>
                    </button>
                  </div>
                  <div className="flex items-center justify-between text-[10px] px-1 text-foreground/45">
                    <span>Alinear en el Atlas:</span>
                    <div className="flex border border-foreground/10 p-[1px] rounded bg-foreground/[0.02]">
                      <button type="button" onClick={() => setNewLevelPosition("above")}
                        className={`px-2 py-0.5 rounded-sm transition-all text-[9px] uppercase tracking-wider ${newLevelPosition === "above" ? "bg-primary/25 text-primary font-bold" : "text-foreground/40 hover:text-foreground"}`}>
                        Superior
                      </button>
                      <button type="button" onClick={() => setNewLevelPosition("below")}
                        className={`px-2 py-0.5 rounded-sm transition-all text-[9px] uppercase tracking-wider ${newLevelPosition === "below" ? "bg-primary/25 text-primary font-bold" : "text-foreground/40 hover:text-foreground"}`}>
                        Inferior
                      </button>
                    </div>
                  </div>

                  {!is3D && setBrushSize && (
                    <div className="flex items-center gap-3 mt-3 pt-3 border-t border-foreground/5 text-xs text-foreground/60 px-1">
                      <span className="material-symbols-outlined text-sm">line_weight</span>
                      <input type="range" min="2" max="40" value={brushSize} onChange={e => setBrushSize(parseInt(e.target.value))} className="flex-1 accent-primary" title="Tamaño de Pincel/Borrador" />
                      <span className="w-5 font-mono text-right">{brushSize}</span>
                    </div>
                  )}
                  {setLevelSpacing && (
                    <div className="flex items-center gap-3 mt-1 text-xs text-foreground/60 px-1">
                      <span className="material-symbols-outlined text-sm">layers</span>
                      <input type="range" min="10" max="300" value={levelSpacing} onChange={e => setLevelSpacing(parseInt(e.target.value))} className="flex-1 accent-primary" title="Separación 3D entre niveles" />
                      <span className="w-5 font-mono text-right">{levelSpacing}</span>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* --- TAB: NOTAS --- */}
            {activeSidebarTab === "notes" && (
              <>
                <div className="space-y-3">
                  {annotations.length === 0 ? (
                    <p className="font-serif text-[12px] italic text-foreground/30 text-center py-4">Sin anotaciones en el Atlas.</p>
                  ) : (
                    annotations.map((ann) => {
                      const linkedLevel = levels.find((l) => l.id === ann.levelId);
                      const isCurrentLevel = activeLevelId === ann.levelId;
                      const cardClass = isCurrentLevel ? "bg-foreground/[0.03] border-primary/20" : "bg-foreground/[0.01] border-foreground/5";

                      return (
                        <div key={ann.id} className={`group border p-3 rounded relative ${cardClass}`}>
                          {editingAnnotationId === ann.id ? (
                            <div className="space-y-2">
                              <textarea
                                value={annotationInputText}
                                onChange={(e) => setAnnotationInputText(e.target.value)}
                                className="w-full bg-background text-foreground border border-foreground/15 rounded p-2 outline-none font-serif text-[12px] leading-relaxed resize-none h-16"
                                autoFocus
                              />
                              <div className="flex items-center gap-2">
                                <span className="font-sans text-[10px] text-foreground/40">Referencia:</span>
                                <select
                                  value={annotationInputLevelId}
                                  onChange={(e) => setAnnotationInputLevelId(e.target.value)}
                                  className="bg-background text-foreground border border-foreground/10 text-[10px] rounded p-1 outline-none cursor-pointer"
                                >
                                  {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                                </select>
                              </div>
                              <button
                                onClick={() => { handleSaveEditAnnotation(ann.id, annotationInputText, annotationInputLevelId); setEditingAnnotationId(null); }}
                                className="px-3 py-1 bg-primary text-primary-foreground text-[10px] rounded"
                              >Guardar</button>
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {linkedLevel && (
                                <span
                                  onClick={() => handleTeleport(linkedLevel.id)}
                                  className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-mono text-[9px] uppercase tracking-wider cursor-pointer transition-all border ${isCurrentLevel ? "bg-primary/20 text-primary border-primary/30" : "bg-foreground/5 text-foreground/40 border-foreground/10 hover:bg-foreground/10"}`}
                                  title="Sincronizar Atlas con este nivel"
                                >
                                  <span className="material-symbols-outlined text-[10px]">link</span>
                                  {linkedLevel.name.split(":")[0]}
                                </span>
                              )}
                              <p className="font-serif text-[13px] italic text-foreground/75 leading-relaxed pr-8">"{ann.text}"</p>
                            </div>
                          )}

                          <div className="absolute top-2 right-2 flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => { setEditingAnnotationId(ann.id); setAnnotationInputText(ann.text); setAnnotationInputLevelId(ann.levelId); }}
                              className="text-foreground/40 hover:text-foreground"
                            >
                              <span className="material-symbols-outlined text-[14px]">edit</span>
                            </button>
                            <button onClick={() => handleDeleteAnnotation(ann.id)} className="text-foreground/30 hover:text-red-400">
                              <span className="material-symbols-outlined text-[14px]">delete</span>
                            </button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="flex flex-col gap-2 pt-2">
                  <textarea
                    placeholder="Nueva anotación de lore..."
                    value={newAnnotationText}
                    onChange={(e) => setNewAnnotationText(e.target.value)}
                    className="w-full bg-foreground/[0.03] text-foreground border border-foreground/10 rounded px-2.5 py-1.5 font-serif text-[12px] outline-none focus:border-foreground/20 placeholder:text-foreground/30 resize-none h-16 leading-relaxed"
                  />
                  <div className="flex items-center justify-between text-xs px-1">
                    <span className="font-sans text-[11px] text-foreground/45">Vincular nivel:</span>
                    <select
                      value={newAnnotationLevelId}
                      onChange={(e) => setNewAnnotationLevelId(e.target.value)}
                      className="bg-background text-foreground border border-foreground/10 rounded p-1 outline-none cursor-pointer text-xs"
                    >
                      {levels.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                    </select>
                  </div>
                  <button
                    onClick={() => { handleAddAnnotation(newAnnotationText, newAnnotationLevelId); setNewAnnotationText(""); }}
                    className="w-full py-2 bg-primary/10 border border-primary/20 hover:bg-primary hover:text-primary-foreground text-primary font-sans text-xs rounded transition-all flex items-center justify-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[14px]">add</span>{" "}Agregar Nota
                  </button>
                </div>
              </>
            )}

            {/* --- TAB: INFO --- */}
            {activeSidebarTab === "info" && (
              <div className="space-y-4">
                <div>
                  <span className="font-mono text-[9px] tracking-[0.25em] text-foreground/45 uppercase block mb-1">Atlas Activo</span>
                  <h2 className="font-serif text-[1.4rem] text-foreground font-semibold leading-tight">{map.nombre || "Supermapa"}</h2>
                  <p className="font-sans text-[11px] text-foreground/45 mt-1">{map.descripcion || "Visor de cotas de altitud"}</p>
                </div>
                <div className="pt-4 border-t border-foreground/10 space-y-3 bg-transparent">
                  <span className="font-sans text-[11px] font-bold text-foreground/45 block">Estadísticas Rápidas</span>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-lg text-center">
                      <span className="font-mono text-lg font-bold text-primary">{levels.length}</span>
                      <span className="text-[9px] uppercase tracking-wider text-foreground/40 block mt-0.5">Niveles</span>
                    </div>
                    <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-lg text-center">
                      <span className="font-mono text-lg font-bold text-primary">{annotations.length}</span>
                      <span className="text-[9px] uppercase tracking-wider text-foreground/40 block mt-0.5">Notas</span>
                    </div>
                    <div className="bg-foreground/[0.02] border border-foreground/5 p-3 rounded-lg text-center">
                      <span className="font-mono text-lg font-bold text-primary">{markers.length}</span>
                      <span className="text-[9px] uppercase tracking-wider text-foreground/40 block mt-0.5">Indicadores</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* --- TAB: MARCADOR (DETAIL) --- */}
            {activeSidebarTab === "marker" && (() => {
              const selectedMarker = markers.find((m) => m.id === selectedMarkerId);
              return selectedMarker ? (
                <div className="space-y-4">
                  <div>
                    <label className="font-mono text-[9px] tracking-[0.25em] text-foreground/45 uppercase block mb-1">
                      Etiqueta del Marcador
                    </label>
                    <input
                      type="text"
                      value={selectedMarker.label || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMarkers ? setMarkers((prev) => prev.map((m) => m.id === selectedMarker.id ? { ...m, label: val } : m)) : undefined;
                      }}
                      className="w-full bg-foreground/[0.03] text-foreground border border-foreground/10 rounded px-3 py-2 font-sans text-xs outline-none focus:border-primary/50 transition-colors"
                      placeholder="Nombre del punto de interés..."
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[9px] tracking-[0.25em] text-foreground/45 uppercase block mb-1">
                      Descripción / Lore
                    </label>
                    <textarea
                      value={selectedMarker.description || ""}
                      onChange={(e) => {
                        const val = e.target.value;
                        setMarkers ? setMarkers((prev) => prev.map((m) => m.id === selectedMarker.id ? { ...m, description: val } : m)) : undefined;
                      }}
                      className="w-full bg-foreground/[0.03] text-foreground border border-foreground/10 rounded px-3 py-2 font-sans text-xs outline-none focus:border-primary/50 transition-colors h-24 resize-none leading-relaxed"
                      placeholder="Información relevante o historia de este lugar..."
                    />
                  </div>

                  <div>
                    <label className="font-mono text-[9px] tracking-[0.25em] text-foreground/45 uppercase block mb-1.5">
                      Vincular a la Biblia (Codex)
                    </label>
                    
                    {/* Caja de Búsqueda de Biblia */}
                    <div className="relative mb-2">
                      <input
                        type="text"
                        value={bibleSearch}
                        onChange={(e) => setBibleSearch(e.target.value)}
                        placeholder="Buscar en el Codex..."
                        className="w-full bg-foreground/[0.03] text-foreground border border-foreground/10 rounded pl-8 pr-3 py-1.5 font-sans text-xs outline-none focus:border-primary/50 transition-colors"
                      />
                      <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-xs text-foreground/30">
                        search
                      </span>
                      {bibleSearch && (
                        <button
                          type="button"
                          onClick={() => setBibleSearch("")}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-foreground/40 hover:text-foreground flex items-center justify-center cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      )}
                    </div>

                    {/* Previsualización del Árbol de Carpetas/Entidades */}
                    <div className="border border-foreground/10 rounded-lg bg-foreground/[0.01] max-h-48 overflow-y-auto p-2 space-y-1 text-xs custom-scrollbar">
                      {/* Mostrar Entidad actualmente vinculada */}
                      {selectedMarker.entityId ? (() => {
                        const linkedEnt = allEntities.find((e) => e.id === selectedMarker.entityId);
                        return linkedEnt ? (
                          <div className="flex items-center justify-between bg-primary/10 border border-primary/20 rounded p-1.5 mb-2 font-bold text-primary">
                            <div className="flex items-center gap-1.5 min-w-0">
                              <span className="material-symbols-outlined text-[14px] shrink-0">
                                {getIconForType(linkedEnt.tipo)}
                              </span>
                              <span className="truncate">{linkedEnt.nombre}</span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                setMarkers ? setMarkers((prev) => prev.map((m) => m.id === selectedMarker.id ? { ...m, entityId: null } : m)) : undefined;
                              }}
                              className="text-[10px] text-red-400 hover:text-red-500 font-sans cursor-pointer uppercase font-black"
                            >
                              Desvincular
                            </button>
                          </div>
                        ) : null;
                      })() : (
                        <div className="text-[10px] text-foreground/40 italic mb-2">Ninguna entidad vinculada.</div>
                      )}

                      {/* Renderizado de Búsqueda Flat o Árbol Jerárquico */}
                      {bibleSearch ? (() => {
                        const filtered = allEntities.filter((e) => e.nombre.toLowerCase().includes(bibleSearch.toLowerCase()));
                        return filtered.length > 0 ? (
                          <div className="space-y-0.5">
                            {filtered.map((ent) => (
                              <button
                                key={ent.id}
                                type="button"
                                onClick={() => {
                                  setMarkers ? setMarkers((prev) => prev.map((m) => m.id === selectedMarker.id ? { ...m, label: ent.nombre, entityId: ent.id } : m)) : undefined;
                                }}
                                className="w-full text-left flex items-center gap-2 p-1 rounded hover:bg-primary/5 transition-colors cursor-pointer text-foreground/80 hover:text-foreground"
                              >
                                <span className="material-symbols-outlined text-[14px] opacity-60">
                                  {getIconForType(ent.tipo)}
                                </span>
                                <span className="truncate flex-1 font-medium">{ent.nombre}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-[10px] text-foreground/35 uppercase font-black italic">Sin coincidencias</div>
                        );
                      })() : (() => {
                        // Renderizado de árbol jerárquico recursivo
                        const renderNode = (parentFolderId: number | null, depth = 0): React.ReactNode => {
                          const levelFolders = allFolders.filter((f) => f.padre_id === parentFolderId);
                          const levelEntities = allEntities.filter((e) => e.carpeta_id === parentFolderId);

                          const hasItems = levelFolders.length > 0 || levelEntities.length > 0;
                          return hasItems ? (
                            <div className="space-y-1">
                              {/* Carpetas */}
                              {levelFolders.map((folder) => {
                                const isExpanded = !!expandedFolders[folder.id];
                                return (
                                  <div key={folder.id} style={{ marginLeft: `${depth * 6}px` }}>
                                    <button
                                      type="button"
                                      onClick={() => toggleFolder(folder.id)}
                                      style={{ position: "sticky", top: `${depth * 24}px`, zIndex: 10 - depth, backgroundColor: "hsl(var(--background))" }}
                                      className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-foreground/5 transition-colors cursor-pointer text-foreground/70"
                                    >
                                      <span className={`material-symbols-outlined text-[14px] transition-transform ${isExpanded ? "rotate-90 text-primary" : "opacity-40"}`}>
                                        chevron_right
                                      </span>
                                      <span className="material-symbols-outlined text-[14px] text-yellow-500/80">
                                        folder
                                      </span>
                                      <span className="truncate flex-1 font-bold">{folder.nombre}</span>
                                    </button>
                                    {isExpanded && renderNode(folder.id, depth + 1)}
                                  </div>
                                );
                              })}
                              {/* Entidades directas del nivel */}
                              {levelEntities.map((ent) => (
                                <button
                                  key={ent.id}
                                  type="button"
                                  onClick={() => {
                                    setMarkers ? setMarkers((prev) => prev.map((m) => m.id === selectedMarker.id ? { ...m, label: ent.nombre, entityId: ent.id } : m)) : undefined;
                                  }}
                                  style={{ marginLeft: `${(depth + 1) * 8}px` }}
                                  className="w-full text-left flex items-center gap-2 p-1 rounded hover:bg-primary/5 transition-colors cursor-pointer text-foreground/80 hover:text-foreground"
                                >
                                  <span className="material-symbols-outlined text-[14px] opacity-60">
                                    {getIconForType(ent.tipo)}
                                  </span>
                                  <span className="truncate flex-1 font-medium">{ent.nombre}</span>
                                </button>
                              ))}
                            </div>
                          ) : null;
                        };

                        // Iniciar con las carpetas raíz (padre_id es null o indefinido) y entidades raíz (carpeta_id es null o indefinido)
                        const rootFolders = allFolders.filter((f) => !f.padre_id);
                        const rootEntities = allEntities.filter((e) => !e.carpeta_id);
                        const hasRootItems = rootFolders.length > 0 || rootEntities.length > 0;

                        return hasRootItems ? (
                          <div className="space-y-1">
                            {/* Carpetas Raíz */}
                            {rootFolders.map((folder) => {
                              const isExpanded = !!expandedFolders[folder.id];
                              return (
                                <div key={folder.id}>
                                  <button
                                    type="button"
                                    onClick={() => toggleFolder(folder.id)}
                                    style={{ position: "sticky", top: "0px", zIndex: 10, backgroundColor: "hsl(var(--background))" }}
                                    className="w-full text-left flex items-center gap-1.5 p-1 rounded hover:bg-foreground/5 transition-colors cursor-pointer text-foreground/70"
                                  >
                                    <span className={`material-symbols-outlined text-[14px] transition-transform ${isExpanded ? "rotate-90 text-primary" : "opacity-40"}`}>
                                      chevron_right
                                    </span>
                                    <span className="material-symbols-outlined text-[14px] text-yellow-500/80">
                                      folder
                                    </span>
                                    <span className="truncate flex-1 font-bold">{folder.nombre}</span>
                                  </button>
                                  {isExpanded && renderNode(folder.id, 1)}
                                </div>
                              );
                            })}
                            {/* Entidades Raíz */}
                            {rootEntities.map((ent) => (
                              <button
                                key={ent.id}
                                type="button"
                                onClick={() => {
                                  setMarkers ? setMarkers((prev) => prev.map((m) => m.id === selectedMarker.id ? { ...m, label: ent.nombre, entityId: ent.id } : m)) : undefined;
                                }}
                                className="w-full text-left flex items-center gap-2 p-1 rounded hover:bg-primary/5 transition-colors cursor-pointer text-foreground/80 hover:text-foreground pl-4"
                              >
                                <span className="material-symbols-outlined text-[14px] opacity-60">
                                  {getIconForType(ent.tipo)}
                                </span>
                                <span className="truncate flex-1 font-medium">{ent.nombre}</span>
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="text-center py-4 text-[10px] text-foreground/35 uppercase font-black italic">Vacío</div>
                        );
                      })()}
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => {
                        setMarkers ? setMarkers((prev) => prev.filter((m) => m.id !== selectedMarker.id)) : undefined;
                        setSelectedMarkerId ? setSelectedMarkerId(null) : undefined;
                        setActiveSidebarTab("levels");
                      }}
                      className="w-full py-2 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white text-red-400 font-sans text-xs rounded transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                      Eliminar Marcador
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 px-4 text-center border border-dashed border-foreground/10 rounded-xl bg-foreground/[0.01]">
                  <span className="material-symbols-outlined text-[32px] text-foreground/20 mb-2">
                    pin_drop
                  </span>
                  <p className="font-serif text-[12px] italic text-foreground/40 leading-relaxed">
                    Selecciona un marcador en el mapa para editar sus detalles y vincularlo a elementos de la Biblia de lore.
                  </p>
                </div>
              );
            })()}
          </div>
        </div>
      )}

      {/* Barra de Actividad (Iconos Estilo VS Code) */}
      <div className="w-[48px] bg-background border border-foreground/15 shadow-2xl rounded-xl flex flex-col items-center py-4 gap-4 pointer-events-auto text-foreground">
        {[
          { tab: "levels" as SidebarTab, icon: "layers", label: "Niveles del Atlas" },
          { tab: "notes"  as SidebarTab, icon: "description", label: "Anotaciones de Lore" },
          { tab: "marker" as SidebarTab, icon: "pin_drop", label: "Detalle del Marcador" },
        ].map(({ tab, icon, label }) => (
          <div key={tab} className="relative group flex items-center justify-center">
            <button
              onClick={() => setActiveSidebarTab(activeSidebarTab === tab ? null : tab)}
              className={`size-9 rounded-lg flex items-center justify-center transition-all ${activeSidebarTab === tab ? "bg-primary/20 text-primary border border-primary/30" : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"}`}
            >
              <span className="material-symbols-outlined text-[18px]">{icon}</span>
            </button>
            <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block bg-background border border-foreground/15 px-2.5 py-1.5 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider text-foreground whitespace-nowrap shadow-2xl z-50">
              {label}
            </div>
          </div>
        ))}

        <div className="w-6 h-px bg-foreground/10 my-1" />

        <div className="relative group flex items-center justify-center">
          <button
            onClick={() => setActiveSidebarTab(activeSidebarTab === "info" ? null : "info")}
            className={`size-9 rounded-lg flex items-center justify-center transition-all ${activeSidebarTab === "info" ? "bg-primary/20 text-primary border border-primary/30" : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"}`}
          >
            <span className="material-symbols-outlined text-[18px]">info</span>
          </button>
          <div className="absolute right-full top-1/2 -translate-y-1/2 mr-2 hidden group-hover:block bg-background border border-foreground/15 px-2.5 py-1.5 rounded-md text-[10px] font-sans font-bold uppercase tracking-wider text-foreground whitespace-nowrap shadow-2xl z-50">
            Detalles del Atlas
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapAtlasSidebar;
