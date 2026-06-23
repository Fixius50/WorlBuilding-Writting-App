import React, { useEffect, useRef, useState, useCallback, useMemo } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import "maplibre-gl/dist/maplibre-gl.css";
import { Button } from "@components";
import { useMapEditor } from "./useMapEditor";
import { DrawMode } from "../domain/types";
import { MapEditorToolbar } from "../components/MapEditorToolbar";
import { snapLngLat } from "../application/geometryUtils";
import { useMapLibreView, GRID_SPACING } from "../../Maps/hooks/useMapLibreView";
import MapAtlasSidebar from "../../Maps/components/MapAtlasSidebar";

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
    addGeometricFeature,
    consolidateGeometricFeature,
    removeFeature,
    handleFloodFill,
  } = editorState;

  const dragStartRef = useRef<{ lng: number; lat: number } | null>(null);
  const tempFeatureIdRef = useRef<string | null>(null);
  const [activeGeomType, setActiveGeomType] = useState<"line" | "rectangle" | "circle">("line");
  const [isGeomMenuOpen, setIsGeomMenuOpen] = useState(false);

  const eraserCursor = useMemo(() => {
    const size = Math.max(16, brushSize);
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}"><circle cx="${size/2}" cy="${size/2}" r="${size/2 - 1}" fill="rgba(255,255,255,0.2)" stroke="%23ef4444" stroke-width="1.5"/></svg>`;
    return `url('data:image/svg+xml;utf8,${svg}') ${size/2} ${size/2}, auto`;
  }, [brushSize]);

  const [activeSidebarTab, setActiveSidebarTab] = useState<"levels" | "notes" | "info" | null>("levels");
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
    const mapInstance = mapInstanceRef.current;
    if (mapInstance) {
      const canvas = mapInstance.getCanvas();
      if (canvas) {
        canvas.style.cursor = spacebarPanning
          ? "grabbing"
          : drawMode === "eraser"
            ? eraserCursor
            : drawMode !== "none"
              ? "crosshair"
              : "grab";
      }
    }
  }, [drawMode, spacebarPanning, mapInstanceRef, eraserCursor]);

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
      <MapEditorToolbar
        mapEntityId={mapEntity?.slug || mapEntity?.id?.toString() || entityId}
        drawMode={drawMode}
        setDrawMode={setDrawMode}
        activeGeomType={activeGeomType}
        setActiveGeomType={setActiveGeomType}
        brushColor={brushColor}
        setBrushColor={setBrushColor}
        gridMode={gridMode}
        setGridMode={setGridMode}
        is3D={is3D}
        setIs3D={setIs3D}
      />
      {/* MAPA CONTENEDOR */}
      <main 
        className="flex-1 relative"
        style={{ 
          backgroundColor: mapBgColor,
          cursor: spacebarPanning
            ? "grabbing"
            : drawMode === "eraser"
              ? eraserCursor
              : drawMode !== "none"
                ? "crosshair"
                : "grab"
        }}
        onMouseDownCapture={(e) => {
          const canInteract = mapInstanceRef.current && !spacebarPanning && drawMode !== "none" && !is3D;
          canInteract
            ? (() => {
                const rect = mapContainerRef.current?.getBoundingClientRect();
                rect
                  ? (() => {
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const rawLngLat = mapInstanceRef.current!.unproject([x, y]);
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
                        case "rectangle":
                        case "circle": {
                          dragStartRef.current = { lng: snapped.lng, lat: snapped.lat };
                          const id = `temp-${Date.now()}`;
                          tempFeatureIdRef.current = id;
                          addGeometricFeature(id, drawMode, dragStartRef.current, dragStartRef.current, true);
                          break;
                        }
                        case "spray": {
                          addSprayPoint(snapped.lng, snapped.lat, true);
                          break;
                        }
                        case "fill": {
                          handleFloodFill(rawLngLat.lng, rawLngLat.lat, mapInstanceRef.current);
                          break;
                        }
                        case "eraser": {
                          eraseFeatures(rawLngLat.lng, rawLngLat.lat, mapInstanceRef.current);
                          break;
                        }
                        default:
                          break;
                      }
                    })()
                  : undefined;
              })()
            : undefined;
        }}
        onMouseMoveCapture={(e) => {
          const canInteract = isDrawing && mapInstanceRef.current && !spacebarPanning && drawMode !== "none" && !is3D;
          canInteract
            ? (() => {
                const rect = mapContainerRef.current?.getBoundingClientRect();
                rect
                  ? (() => {
                      const x = e.clientX - rect.left;
                      const y = e.clientY - rect.top;
                      const rawLngLat = mapInstanceRef.current!.unproject([x, y]);
                      const snapped = snapLngLat(rawLngLat.lng, rawLngLat.lat, gridMode, GRID_SPACING);

                      switch (drawMode) {
                        case "line": {
                          addLinePoint(snapped.lng, snapped.lat, false);
                          break;
                        }
                        case "rectangle":
                        case "circle": {
                          const hasStart = dragStartRef.current && tempFeatureIdRef.current;
                          hasStart
                            ? addGeometricFeature(tempFeatureIdRef.current!, drawMode, dragStartRef.current!, snapped, true)
                            : undefined;
                          break;
                        }
                        case "spray": {
                          addSprayPoint(snapped.lng, snapped.lat);
                          break;
                        }
                        case "eraser": {
                          eraseFeatures(rawLngLat.lng, rawLngLat.lat, mapInstanceRef.current);
                          break;
                        }
                        default:
                          break;
                      }
                    })()
                  : undefined;
              })()
            : undefined;
        }}
        onMouseUpCapture={() => {
          isDrawing
            ? (() => {
                const isGeometric = (drawMode === "rectangle" || drawMode === "circle") && tempFeatureIdRef.current;
                isGeometric
                  ? consolidateGeometricFeature(tempFeatureIdRef.current!)
                  : undefined;
                
                dragStartRef.current = null;
                tempFeatureIdRef.current = null;
                setIsDrawing(false);
                endCurrentAction();
              })()
            : undefined;
        }}
        onMouseLeave={() => {
          isDrawing
            ? (() => {
                const isGeometric = (drawMode === "rectangle" || drawMode === "circle") && tempFeatureIdRef.current;
                isGeometric
                  ? consolidateGeometricFeature(tempFeatureIdRef.current!)
                  : undefined;
                
                dragStartRef.current = null;
                tempFeatureIdRef.current = null;
                setIsDrawing(false);
                endCurrentAction();
              })()
            : undefined;
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
