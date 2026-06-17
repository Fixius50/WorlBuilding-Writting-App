import React, { useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import {
  Map,
  NavigationControl,
  Source,
  Layer,
  Marker,
  Popup,
  MapMouseEvent,
} from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { MonolithicPanel } from "@components";
import { Button } from "@components";
import { useMapEditor, DrawMode } from "./useMapEditor";

const DRAW_MODE_LABELS: Record<DrawMode, string> = {
  none: "Navegar",
  marker: "Marcador",
  line: "Trayecto",
  spray: "Spray",
  eraser: "Borrador",
};

const DRAW_MODE_ICONS: Record<DrawMode, string> = {
  none: "pan_tool",
  marker: "location_on",
  line: "draw",
  spray: "brush",
  eraser: "ink_eraser",
};

const MapEditor: React.FC = () => {
  const navigate = useNavigate();
  const { entityId, folderId } = useParams();
  const outletCtx = (useOutletContext<{ projectId?: number } | null>() ||
    {}) as { projectId?: number };
  const { projectId } = outletCtx;

  const {
    mapEntity,
    setMapEntity,
    markers,
    setMarkers,
    layers,
    setLayers,
    selectedLayerId,
    setSelectedLayerId,
    features,
    viewState,
    setViewState,
    drawMode,
    setDrawMode,
    isDrawing,
    spacebarPanning,
    setSpacebarPanning,
    mapBgColor,
    setMapBgColor,
    is3D,
    setIs3D,
    selectedMarkerId,
    setSelectedMarkerId,
    brushSize,
    setBrushSize,
    lineContinuous,
    eraserPoint,
    setEraserPoint,
    allEntities,
    showEntityPicker,
    setShowEntityPicker,
    searchQuery,
    setSearchQuery,
    linkingMarkerId,
    setLinkingMarkerId,
    showConfirmDelete,
    setShowConfirmDelete,
    history,
    future,
    handleUndo,
    handleRedo,
    saveHistorySnapshot,
    endCurrentAction,
    handleSaveMap,
    addSprayPoint,
    addLinePoint,
    eraseFeatures,
    resolvedUrls,
    setResolvedUrls,
    mapRef,
    setCustomContent,
  } = useMapEditor("edit", entityId, projectId, folderId);

  const resolveImageUrl = async (
    url: string,
    layerId: string,
  ): Promise<string> => {
    if (!url) return "";
    const cleanUrl = url.toLowerCase().split("?")[0];
    const isSvg =
      cleanUrl.endsWith(".svg") || url.startsWith("data:image/svg+xml");
    if (!isSvg) return url;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const width = img.naturalWidth || 2000;
        const height = img.naturalHeight || 1000;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            resolve(canvas.toDataURL("image/png"));
          } catch (e) {
            resolve(url);
          }
        } else {
          resolve(url);
        }
      };
      img.onerror = () => resolve(url);
      img.src = url;
    });
  };

  useEffect(() => {
    const processImageLayers = async () => {
      const imageLayers = layers.filter(
        (l) => (l.type === "base" || l.type === "image") && l.url,
      );
      for (const layer of imageLayers) {
        const isSvg =
          layer.url?.toLowerCase().endsWith(".svg") ||
          layer.url?.startsWith("data:image/svg+xml");
        const currentResolved = resolvedUrls[layer.id];
        if (
          isSvg &&
          (!currentResolved ||
            (layer.url !== currentResolved &&
              !currentResolved.startsWith("data:image/png")))
        ) {
          const resolved = await resolveImageUrl(layer.url!, layer.id);
          setResolvedUrls((prev) => ({ ...prev, [layer.id]: resolved }));
        }
      }
    };
    processImageLayers();
  }, [layers, resolvedUrls, setResolvedUrls]);

  useEffect(() => {
    const updateBg = () => {
      const bgVar = getComputedStyle(document.body)
        .getPropertyValue("--background")
        .trim();
      if (bgVar) setMapBgColor(`hsl(${bgVar})`);
    };
    updateBg();
    const observer = new MutationObserver(updateBg);
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (
        e.code === "Space" &&
        !e.repeat &&
        tag !== "INPUT" &&
        tag !== "TEXTAREA"
      ) {
        e.preventDefault();
        setSpacebarPanning(true);
        endCurrentAction();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "z") {
        e.preventDefault();
        e.shiftKey ? handleRedo() : handleUndo();
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "y") {
        e.preventDefault();
        handleRedo();
      }
      if (e.code === "Escape") setDrawMode("none");
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === "Space") setSpacebarPanning(false);
    };
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener("keyup", onKeyUp);
    return () => {
      observer.disconnect();
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("keyup", onKeyUp);
    };
  }, [
    handleUndo,
    handleRedo,
    setDrawMode,
    setSpacebarPanning,
    endCurrentAction,
    setMapBgColor,
  ]);

  const mapStyle = useMemo(
    () => ({
      version: 8 as const,
      sources: {},
      layers: [
        {
          id: "bg",
          type: "background" as const,
          paint: { "background-color": mapBgColor },
        },
      ],
    }),
    [mapBgColor],
  );

  const renderImageLayers = useMemo(
    () =>
      layers
        .filter((l) => (l.type === "base" || l.type === "image") && l.visible)
        .map((layer) => (
          <Source
            key={`src-${layer.id}`}
            id={`src-${layer.id}`}
            type="image"
            url={resolvedUrls[layer.id] || layer.url || ""}
            coordinates={[
              [-180, 85.0511],
              [180, 85.0511],
              [180, -85.0511],
              [-180, -85.0511],
            ]}
          >
            <Layer
              id={`lay-${layer.id}`}
              type="raster"
              paint={{ "raster-opacity": layer.opacity }}
            />
          </Source>
        )),
    [layers, resolvedUrls],
  );

  const featuresByLayer = useMemo(() => {
    const map: Record<string, any[]> = {};
    (features.features || []).forEach((f: any) => {
      const lid = f.properties?.layerId;
      if (lid) {
        if (!map[lid]) map[lid] = [];
        map[lid].push(f);
      }
    });
    return map;
  }, [features]);

  const renderDrawLayers = layers
    .filter((l) => l.type !== "base" && l.type !== "image" && l.visible)
    .map((layer) => {
      const layerFeats = featuresByLayer[layer.id] || [];
      return (
        <Source
          key={`draw-src-${layer.id}`}
          id={`draw-src-${layer.id}`}
          type="geojson"
          data={{ type: "FeatureCollection", features: layerFeats }}
        >
          <Layer
            id={`line-${layer.id}`}
            type="line"
            paint={{
              "line-color": layer.color || "hsl(var(--color-red))",
              "line-width": 3,
              "line-opacity": layer.opacity ?? 1,
            }}
            layout={{ "line-join": "round", "line-cap": "round" }}
            filter={["==", "$type", "LineString"]}
          />
          <Layer
            id={`point-${layer.id}`}
            type="circle"
            paint={{
              "circle-color": layer.color || "hsl(var(--color-emerald))",
              "circle-radius": layer.type === "spray" ? brushSize / 2 : 4,
              "circle-blur": layer.type === "spray" ? 0.7 : 0,
              "circle-opacity": (layer.opacity ?? 1) * 0.85,
            }}
            filter={["==", "$type", "Point"]}
          />
        </Source>
      );
    });

  const onMapClick = useCallback(
    (e: MapMouseEvent) => {
      if (spacebarPanning || drawMode === "none") {
        setSelectedMarkerId(null);
        return;
      }
      const { lng, lat } = e.lngLat;
      if (drawMode === "marker") {
        saveHistorySnapshot();
        const id = `m-${Date.now()}`;
        setMarkers((prev) => [...prev, { id, lng, lat, label: "Punto" }]);
        setSelectedMarkerId(id);
      } else if (drawMode === "line") {
        saveHistorySnapshot();
        addLinePoint(
          lng,
          lat,
          !lineContinuous || (e.originalEvent?.shiftKey ?? false),
        );
      }
    },
    [
      drawMode,
      addLinePoint,
      saveHistorySnapshot,
      spacebarPanning,
      lineContinuous,
      setSelectedMarkerId,
      setMarkers,
    ],
  );

  const onMouseDown = useCallback(
    (e: MapMouseEvent) => {
      if (spacebarPanning) return;
      if (["spray", "line", "eraser"].includes(drawMode)) {
        saveHistorySnapshot();
        const { lng, lat } = e.lngLat;
        if (drawMode === "spray") addSprayPoint(lng, lat);
        else if (drawMode === "line") addLinePoint(lng, lat, true);
        else if (drawMode === "eraser") eraseFeatures(lng, lat);
      }
    },
    [
      drawMode,
      addSprayPoint,
      addLinePoint,
      eraseFeatures,
      saveHistorySnapshot,
      spacebarPanning,
    ],
  );

  const onMouseMove = useCallback(
    (e: MapMouseEvent) => {
      if (drawMode === "eraser") setEraserPoint(e.lngLat);
      if (!isDrawing) return;
      const { lng, lat } = e.lngLat;
      if (drawMode === "spray") addSprayPoint(lng, lat);
      else if (drawMode === "line") addLinePoint(lng, lat, false);
      else if (drawMode === "eraser") eraseFeatures(lng, lat);
    },
    [
      isDrawing,
      drawMode,
      addSprayPoint,
      addLinePoint,
      eraseFeatures,
      setEraserPoint,
    ],
  );

  const renderSidebar = useCallback(
    () => (
      <div className="flex flex-col h-full bg-background text-foreground animate-in slide-in-from-right duration-500 border-l border-foreground/10">
        <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                settings
              </span>{" "}
              Configuración del Atlas
            </h3>
            <input
              type="text"
              value={mapEntity?.nombre || ""}
              onChange={(e) =>
                setMapEntity((prev) =>
                  prev ? { ...prev, nombre: e.target.value } : null,
                )
              }
              className="w-full border border-foreground/10 bg-foreground/5 p-4 font-serif text-lg font-black text-foreground outline-none"
            />
          </div>
          <MonolithicPanel title="Capas de Información" icon="layers">
            <div className="space-y-2">
              {layers.map((layer) => (
                <div
                  key={layer.id}
                  className={`p-3 monolithic-panel ${selectedLayerId === layer.id ? "border-primary/40 bg-primary/5" : ""}`}
                  onClick={() => setSelectedLayerId(layer.id)}
                >
                  <div className="flex items-center gap-3">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setLayers((prev) =>
                          prev.map((l) =>
                            l.id === layer.id
                              ? { ...l, visible: !l.visible }
                              : l,
                          ),
                        );
                      }}
                      className="material-symbols-outlined text-sm"
                    >
                      {layer.visible ? "visibility" : "visibility_off"}
                    </button>
                    <span className="text-[11px] font-black uppercase flex-1">
                      {layer.name}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </MonolithicPanel>
        </div>
        <div className="p-6 border-t border-foreground/10 bg-background sticky bottom-0">
          <Button
            variant="primary"
            className="w-full py-4"
            icon="save"
            onClick={handleSaveMap}
          >
            Guardar Atlas
          </Button>
        </div>
      </div>
    ),
    [
      layers,
      selectedLayerId,
      mapEntity,
      handleSaveMap,
      setLayers,
      setSelectedLayerId,
      setMapEntity,
    ],
  );

  useEffect(() => {
    setCustomContent(renderSidebar());
  }, [renderSidebar, setCustomContent]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background text-foreground overflow-hidden relative">
      <div className="absolute top-6 left-6 z-[50] flex flex-col gap-4">
        <button
          onClick={() => navigate(-2)}
          className="p-3 bg-background/90 shadow-2xl border border-foreground/10 text-foreground/60 hover:text-primary hover:border-primary transition-all duration-300 flex items-center justify-center monolithic-panel"
          title="Volver a Mapas"
        >
          <span className="material-symbols-outlined text-xl font-bold">arrow_back</span>
        </button>
        <div className="monolithic-panel p-2 flex flex-col gap-1 bg-background/90 shadow-2xl border border-foreground/10">
          {(Object.entries(DRAW_MODE_LABELS) as [DrawMode, string][]).map(
            ([m, label]) => (
              <button
                key={m}
                onClick={() => setDrawMode(m)}
                className={`p-3 ${drawMode === m ? "bg-primary text-primary-foreground" : "text-foreground/40"}`}
              >
                <span className="material-symbols-outlined text-xl">
                  {DRAW_MODE_ICONS[m]}
                </span>
              </button>
            ),
          )}
        </div>
      </div>
      <main className="flex-1 relative cursor-crosshair">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={(e) => setViewState(e.viewState)}
          mapStyle={mapStyle}
          onClick={onMapClick}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={endCurrentAction}
          dragPan={!isDrawing || spacebarPanning}
          pitch={is3D ? 45 : 0}
        >
          <NavigationControl position="bottom-right" />
          {renderImageLayers}
          {renderDrawLayers}
          {markers.map((marker) => (
            <Marker
              key={marker.id}
              longitude={marker.lng ?? 0}
              latitude={marker.lat ?? 0}
              anchor="bottom"
              onClick={(e) => {
                e.originalEvent.stopPropagation();
                setSelectedMarkerId(marker.id);
              }}
            >
              <div className="size-6 flex items-center justify-center rounded-full bg-background border-2 border-primary/40">
                <span className="material-symbols-outlined text-sm text-primary">
                  location_on
                </span>
              </div>
            </Marker>
          ))}
          {selectedMarkerId && (
            <Popup
              className="canvas-map-popup"
              longitude={
                markers.find((m) => m.id === selectedMarkerId)?.lng ?? 0
              }
              latitude={
                markers.find((m) => m.id === selectedMarkerId)?.lat ?? 0
              }
              onClose={() => setSelectedMarkerId(null)}
            >
              <div className="p-2 text-xs">Punto seleccionado</div>
            </Popup>
          )}
        </Map>
      </main>
    </div>
  );
};

export default MapEditor;


