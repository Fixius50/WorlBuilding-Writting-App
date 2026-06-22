import React, { useEffect, useRef, useState, useCallback } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@components";
import { useMapEditor, DrawMode } from "./useMapEditor";
import { useMapLibreView, GRID_SPACING } from "../../Maps/hooks/useMapLibreView";
import MapAtlasSidebar from "../../Maps/components/MapAtlasSidebar";

const DRAW_MODE_LABELS: Record<DrawMode, string> = {
  none: "Navegar",
  marker: "Punto de Interés (POI)",
  line: "Trazar Línea / Muro",
  spray: "Pintar Área",
  eraser: "Borrador de Trazos",
};

const DRAW_MODE_ICONS: Record<DrawMode, string> = {
  none: "pan_tool",
  marker: "location_on",
  line: "draw",
  spray: "brush",
  eraser: "ink_eraser",
};

const BRUSH_COLORS = [
  "#22c55e", "#ef4444", "#3b82f6", "#eab308", "#a855f7", "#ec4899", "#ffffff", "#000000"
];

const snapLngLat = (lng: number, lat: number, gridMode: string, spacing: number): { lng: number; lat: number } => {
  if (gridMode === "none") return { lng, lat };
  
  const step = spacing * Math.PI / 180;
  const mercY = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2));
  const mercX = lng * Math.PI / 180;

  const mercatorToLat = (y: number) => (Math.atan(Math.exp(y)) - Math.PI / 4) * 2 * 180 / Math.PI;
  const mercatorToLng = (x: number) => x * 180 / Math.PI;
  
  if (gridMode === "square" || gridMode === "dots") {
    const snappedX = Math.round(mercX / step) * step;
    const snappedY = Math.round(mercY / step) * step;
    return {
      lng: mercatorToLng(snappedX),
      lat: mercatorToLat(snappedY),
    };
  }

  if (gridMode === "isometric") {
    const u = mercX + mercY;
    const v = mercX - mercY;
    const snappedU = Math.round(u / (step * 2)) * (step * 2);
    const snappedV = Math.round(v / (step * 2)) * (step * 2);
    return {
      lng: mercatorToLng((snappedU + snappedV) / 2),
      lat: mercatorToLat((snappedU - snappedV) / 2),
    };
  }
  
  return { lng, lat };
};

const MapEditor: React.FC = () => {
  const navigate = useNavigate();
  const { entityId, folderId } = useParams();
  const outletCtx = (useOutletContext<{ projectId?: number } | null>() || {}) as { projectId?: number };
  const { projectId } = outletCtx;

  const mapContainerRef = useRef<HTMLDivElement>(null);

  const editorState = useMapEditor("edit", entityId, projectId, folderId);
  
  const {
    mapEntity,
    setMapEntity,
    markers,
    setMarkers,
    levels,
    setLevels,
    activeLevelId,
    setActiveLevelId,
    levelBgImages,
    setLevelBgImages,
    levelSpacing,
    setLevelSpacing,
    overlayAllLayers,
    setOverlayAllLayers,
    features,
    drawMode,
    setDrawMode,
    isDrawing,
    setIsDrawing,
    spacebarPanning,
    setSpacebarPanning,
    is3D,
    setIs3D,
    selectedMarkerId,
    setSelectedMarkerId,
    brushSize,
    setBrushSize,
    brushColor,
    mapBgColor,
    setBrushColor,
    gridMode,
    setGridMode,
    handleUndo,
    handleRedo,
    saveHistorySnapshot,
    endCurrentAction,
    handleSaveMap,
    addSprayPoint,
    addLinePoint,
    eraseFeatures,
  } = editorState;

  const [activeSidebarTab, setActiveSidebarTab] = useState<"levels" | "notes" | "info" | null>("levels");
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  
  // States required for MapAtlasSidebar (Dummy functions since we manage it in useMapEditor partially)
  const [hoveredLevelOpacityId, setHoveredLevelOpacityId] = useState<string | null>(null);
  const [levelOpacities, setLevelOpacities] = useState<Record<string, number>>({});
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [levelInputText, setLevelInputText] = useState("");
  const [newLevelName, setNewLevelName] = useState("");

  const handleUploadLevelBgImage = useCallback((levelId: string, dataUrl: string) => {
    setLevelBgImages(prev => ({ ...prev, [levelId]: dataUrl }));
  }, [setLevelBgImages]);

  // Hook 3D View integration
  const { map: mapInstanceRef } = useMapLibreView(mapContainerRef, {
    mapImage: null,
    markers,
    layers: [],
    connections: [],
    features,
    onMarkerClick: (marker: unknown) => {
      const m = marker as { id: string };
      setSelectedMarkerId(m.id);
    },
    onMapClick: (lng: number, lat: number) => {
      const canDeselect = drawMode === "none" || spacebarPanning;
      if (canDeselect) {
        setSelectedMarkerId(null);
      }
    },
    is3D,
    levels,
    levelBgImages,
    activeLevelId,
    levelSpacing,
    overlayAllLayers,
    gridMode,
    levelOpacities,
  });

  // Cursor Sync with MapLibre Canvas
  useEffect(() => {
    if (mapInstanceRef.current) {
      const canvas = mapInstanceRef.current.getCanvas();
      if (canvas) {
        canvas.style.cursor = spacebarPanning ? "grabbing" : drawMode !== "none" ? "crosshair" : "grab";
      }
    }
  }, [drawMode, spacebarPanning, mapInstanceRef]);

  // Manage map interactions (disable dragPan while drawing)
  useEffect(() => {
    const mapInstance = mapInstanceRef.current;
    if (mapInstance) {
      const canPan = spacebarPanning || drawMode === "none" || is3D;
      if (canPan) {
        mapInstance.dragPan.enable();
      } else {
        mapInstance.dragPan.disable();
      }
    }
  }, [drawMode, spacebarPanning, is3D, mapInstanceRef]);

  // Reset drawMode when entering 3D mode
  useEffect(() => {
    if (is3D) {
      setDrawMode("none");
    }
  }, [is3D, setDrawMode]);

  // Stop drawing when mouse is released globally
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsDrawing(false);
      endCurrentAction();
    };
    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [setIsDrawing, endCurrentAction]);

  /*
  // Eventos de ratón pasados al contenedor (en lugar de MapLibre React)
  const handleContainerMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (spacebarPanning) return;
    if (["spray", "line", "eraser"].includes(drawMode)) {
      setIsDrawing(true);
      saveHistorySnapshot();
      // Esto requeriría projectar pixeles a LngLat. Como MapLibre consume el evento,
      // la estrategia de "draw" la dejaremos manejada por onMapClick para lineas.
      // O bien podemos instanciar mapInstance.on("mousedown") dentro de useMapLibreView.
    }
  }, [spacebarPanning, drawMode, saveHistorySnapshot, setIsDrawing]);
  */

  // Keyboard Shortcuts
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      const isSpace = e.code === "Space" && !e.repeat && tag !== "INPUT" && tag !== "TEXTAREA";
      if (isSpace) {
        e.preventDefault();
        setSpacebarPanning(true);
        endCurrentAction();
      } else {
        const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z";
        if (isUndo) {
          e.preventDefault();
          const isRedo = e.shiftKey;
          if (isRedo) {
            handleRedo();
          } else {
            handleUndo();
          }
        }
        const isRedoKey = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y";
        if (isRedoKey) {
          e.preventDefault();
          handleRedo();
        }
        const isEscape = e.code === "Escape";
        if (isEscape) {
          setDrawMode("none");
        }
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      const isSpace = e.code === "Space";
      if (isSpace) {
        setSpacebarPanning(false);
      }
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [handleUndo, handleRedo, setDrawMode, setSpacebarPanning, endCurrentAction]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-hidden relative">
      
      {/* TOOLBAR SUPERIOR FLOTANTE */}
      <div className="absolute top-6 left-6 z-[50] flex gap-4">
        <div className="flex bg-background/90 shadow-2xl border border-foreground/10 monolithic-panel overflow-hidden">
          <button
            onClick={() => navigate(-2)}
            className="p-3 text-foreground/60 hover:text-primary hover:bg-primary/10 border-r border-foreground/10 transition-all duration-300 flex items-center justify-center"
            title="Volver a Mapas"
          >
            <span className="material-symbols-outlined text-xl font-bold">arrow_back</span>
          </button>
          
          <button
            onClick={() => navigate(`../viewer/${mapEntity?.slug || mapEntity?.id || entityId}`)}
            className="p-3 text-foreground/60 hover:text-primary hover:bg-primary/10 transition-all duration-300 flex items-center justify-center"
            title="Alternar a Modo Visor"
          >
            <span className="material-symbols-outlined text-xl font-bold">visibility</span>
          </button>
        </div>

        <div className="monolithic-panel px-2 flex gap-1 bg-background/90 shadow-2xl border border-foreground/10 items-center">
          {/* Tool Dropdown */}
          {!is3D && (
            <div className="relative">
              <button
                onClick={() => setIsToolMenuOpen(!isToolMenuOpen)}
                title={DRAW_MODE_LABELS[drawMode]}
                className="p-3 rounded transition-colors text-primary bg-primary/10 hover:bg-primary/20 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-xl">{DRAW_MODE_ICONS[drawMode]}</span>
                <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
              </button>
              {isToolMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[90]" onClick={() => setIsToolMenuOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 flex flex-col bg-background border border-foreground/10 shadow-2xl rounded p-1 z-[100]">
                    {(Object.entries(DRAW_MODE_LABELS) as [DrawMode, string][]).map(([m, label]) => (
                      <button
                        key={m}
                        onClick={() => { setDrawMode(m as DrawMode); setIsToolMenuOpen(false); }}
                        title={label}
                        className={`p-2 rounded flex items-center gap-3 whitespace-nowrap transition-colors ${drawMode === m ? "bg-primary/20 text-primary font-bold" : "text-foreground/60 hover:bg-foreground/5"}`}
                      >
                        <span className="material-symbols-outlined text-xl">{DRAW_MODE_ICONS[m as DrawMode]}</span>
                        <span className="text-sm">{label}</span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
          
          {!is3D && <div className="w-px h-6 bg-foreground/10 mx-2" />}

          {/* Color Dropdown */}
          {!is3D && (
            <div className="relative">
              <button
                onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
                title="Color de Pincel"
                className="p-2 rounded transition-colors hover:bg-foreground/5 flex items-center gap-1"
              >
                <div className="size-6 rounded-full border-2 border-foreground/20" style={{ backgroundColor: brushColor }} />
                <span className="material-symbols-outlined text-sm text-foreground/40">arrow_drop_down</span>
              </button>
              {isColorMenuOpen && (
                <>
                  <div className="fixed inset-0 z-[90]" onClick={() => setIsColorMenuOpen(false)} />
                  <div className="absolute top-full left-0 mt-1 flex flex-wrap w-32 gap-2 bg-background border border-foreground/10 shadow-2xl rounded p-2 z-[100]">
                    {BRUSH_COLORS.map(c => (
                      <button
                        key={c}
                        onClick={() => { setBrushColor(c); setIsColorMenuOpen(false); }}
                        className={`size-6 rounded-full border-2 transition-all ${brushColor === c ? 'border-primary scale-110' : 'border-transparent hover:scale-105 hover:border-foreground/20'}`}
                        style={{ backgroundColor: c }}
                      />
                    ))}
                    {/* Custom Color Picker */}
                    <label className="size-6 rounded-full border-2 border-dashed border-foreground/40 cursor-pointer flex items-center justify-center hover:border-primary transition-colors overflow-hidden relative">
                      <span className="material-symbols-outlined text-[14px] text-foreground/60 pointer-events-none absolute">add</span>
                      <input 
                        type="color" 
                        value={brushColor}
                        onChange={(e) => setBrushColor(e.target.value)}
                        className="opacity-0 w-10 h-10 absolute cursor-pointer"
                      />
                    </label>
                  </div>
                </>
              )}
            </div>
          )}

          {!is3D && <div className="w-px h-6 bg-foreground/10 mx-2" />}

          {/* Grid Mode Selector */}
          <button
            onClick={() => setGridMode(prev => prev === "none" ? "square" : prev === "square" ? "isometric" : prev === "isometric" ? "dots" : "none")}
            title={`Modo de Rejilla: ${gridMode}`}
            className={`px-2 py-1.5 flex items-center justify-center rounded transition-colors ${gridMode !== "none" ? "bg-primary/20 text-primary border border-primary/40 font-bold" : "text-foreground/40 hover:text-foreground border border-transparent"}`}
          >
            <span className="material-symbols-outlined text-lg">
              {gridMode === "none" ? "grid_off" : gridMode === "square" ? "grid_on" : gridMode === "isometric" ? "apps" : "grain"}
            </span>
          </button>

          <div className="w-px h-6 bg-foreground/10 mx-2" />

          {/* Toggle 3D */}
          <button
            onClick={() => setIs3D(!is3D)}
            title="Activar vista 3D Multinivel"
            className={`px-3 py-1.5 flex items-center gap-2 rounded transition-colors ${is3D ? "bg-primary/20 text-primary border border-primary/40 font-bold" : "text-foreground/40 hover:text-foreground border border-transparent"}`}
          >
            <span className="material-symbols-outlined text-lg">{is3D ? "view_in_ar" : "map"}</span>
            {is3D ? "3D Activo" : "Modo 2D"}
          </button>
        </div>
      </div>

      {/* MAPA CONTENEDOR */}
      <main 
        className={`flex-1 relative ${drawMode !== "none" ? "cursor-crosshair" : "cursor-grab active:cursor-grabbing"}`}
        style={{ backgroundColor: mapBgColor }}
        onMouseDownCapture={(e) => {
          if (!mapInstanceRef.current || spacebarPanning || drawMode === "none" || is3D) return;
          const rect = mapContainerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const rawLngLat = mapInstanceRef.current.unproject([x, y]);
          const snapped = snapLngLat(rawLngLat.lng, rawLngLat.lat, gridMode, GRID_SPACING);
          
          setIsDrawing(true);
          saveHistorySnapshot();

          switch (drawMode) {
            case "marker": {
              const id = `m-${Date.now()}`;
              setMarkers((prev) => [...prev, { id, lng: snapped.lng, lat: snapped.lat, label: "Nuevo POI", layerId: activeLevelId }]);
              setSelectedMarkerId(id);
              break;
            }
            case "line": {
              addLinePoint(snapped.lng, snapped.lat, true);
              break;
            }
            case "spray": {
              addSprayPoint(snapped.lng, snapped.lat, true);
              break;
            }
            case "eraser": {
              eraseFeatures(snapped.lng, snapped.lat, mapInstanceRef.current);
              break;
            }
            default:
              break;
          }
        }}
        onMouseMoveCapture={(e) => {
          if (!isDrawing || !mapInstanceRef.current || spacebarPanning || drawMode === "none" || is3D) return;
          const rect = mapContainerRef.current?.getBoundingClientRect();
          if (!rect) return;
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const rawLngLat = mapInstanceRef.current.unproject([x, y]);
          const snapped = snapLngLat(rawLngLat.lng, rawLngLat.lat, gridMode, GRID_SPACING);

          switch (drawMode) {
            case "line": {
              addLinePoint(snapped.lng, snapped.lat, false);
              break;
            }
            case "spray": {
              addSprayPoint(snapped.lng, snapped.lat);
              break;
            }
            case "eraser": {
              eraseFeatures(snapped.lng, snapped.lat, mapInstanceRef.current);
              break;
            }
            default:
              break;
          }
        }}
        onMouseUpCapture={() => {
          if (isDrawing) {
            setIsDrawing(false);
            endCurrentAction();
          }
        }}
        onMouseLeave={() => {
          if (isDrawing) {
            setIsDrawing(false);
            endCurrentAction();
          }
        }}
      >
        <div ref={mapContainerRef} className="absolute inset-0 z-10" />
      </main>

      {/* PANEL LATERAL (Niveles, Notas) */}
      <MapAtlasSidebar 
          activeSidebarTab={activeSidebarTab}
          setActiveSidebarTab={setActiveSidebarTab}
          levels={levels}
          annotations={[]}
          activeLevelId={activeLevelId}
          levelOpacities={levelOpacities}
          hoveredLevelOpacityId={hoveredLevelOpacityId}
          map={mapEntity!}
          editingLevelId={editingLevelId}
          levelInputText={levelInputText}
          newLevelName={newLevelName}
          editingAnnotationId={null}
          annotationInputText={""}
          annotationInputLevelId={""}
          newAnnotationText={""}
          newAnnotationLevelId={""}
          setHoveredLevelOpacityId={setHoveredLevelOpacityId}
          setLevelOpacities={setLevelOpacities}
          setEditingLevelId={setEditingLevelId}
          setLevelInputText={setLevelInputText}
          setNewLevelName={setNewLevelName}
          setEditingAnnotationId={() => {}}
          setAnnotationInputText={() => {}}
          setAnnotationInputLevelId={() => {}}
          setNewAnnotationText={() => {}}
          setNewAnnotationLevelId={() => {}}
          handleTeleport={(id: string) => setActiveLevelId(id)}
          handleSaveEditLevel={(id: string, name: string) => setLevels(levels.map(l => l.id === id ? { ...l, name } : l))}
          handleDeleteLevel={(id: string) => setLevels(levels.filter(l => l.id !== id))}
          handleUploadLevelBgImage={handleUploadLevelBgImage}
          handleAddLevel={(name: string, pos: string) => {
             const z = pos === "above" ? Math.max(...levels.map(l => l.z_index || 0)) + 1 : Math.min(...levels.map(l => l.z_index || 0)) - 1;
             setLevels([{ id: `l-${Date.now()}`, name: name || "Nuevo", z_index: z }, ...levels]);
          }}
          handleAddAnnotation={() => {}}
          handleSaveEditAnnotation={() => {}}
          handleDeleteAnnotation={() => {}}
          updateAtlasCache={() => {}}
          brushSize={brushSize}
          setBrushSize={setBrushSize}
          levelSpacing={levelSpacing}
          setLevelSpacing={setLevelSpacing}
          is3D={is3D}
      />
    </div>
  );
};

export default MapEditor;
