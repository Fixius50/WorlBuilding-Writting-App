import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapRef, MapMouseEvent } from "react-map-gl/maplibre";
import { MapUseCase } from "@application/MapUseCase";
import { Entidad } from "@domain/database";
import { MapMarker, MapLayer, MapAttributes } from "@domain/maps";

export type DrawMode = "none" | "spray" | "line" | "marker" | "eraser";

type GeoFeature = {
  id?: string | number;
  type: "Feature";
  geometry: { type: string; coordinates: unknown };
  properties?: Record<string, unknown>;
};

type GeoFeatureCollection = {
  type: "FeatureCollection";
  features: GeoFeature[];
};

const DEFAULT_LAYERS: MapLayer[] = [
  {
    id: "base",
    name: "Mapa Base",
    visible: true,
    opacity: 1,
    type: "image",
    url: "",
  },
  {
    id: "clima",
    name: "Clima",
    visible: true,
    opacity: 0.8,
    type: "spray",
    color: "hsl(var(--color-emerald))",
  },
  {
    id: "fronteras",
    name: "Fronteras",
    visible: true,
    opacity: 1.0,
    type: "vector",
    color: "hsl(var(--color-red))",
  },
];

const INITIAL_VIEW_STATE = { longitude: 0, latitude: 0, zoom: 1 };

/**
 * 🧠 useMapEditor
 * Logic for managing atlas/map editing, drawing, and persistence.
 */
export const useMapEditor = (
  mode: "create" | "edit",
  entityId?: string,
  projectId?: number,
  folderId?: string,
  onSave?: () => Promise<void>,
) => {
  const navigate = useNavigate();
  const [mapEntity, setMapEntity] = useState<Entidad | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [layers, setLayers] = useState<MapLayer[]>(DEFAULT_LAYERS);
  const [selectedLayerId, setSelectedLayerId] = useState<string>(
    DEFAULT_LAYERS[1].id,
  );
  const [features, setFeatures] = useState<GeoFeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [targetFolderId, setTargetFolderId] = useState<number | null>(
    folderId ? Number(folderId) : null,
  );
  const [drawMode, setDrawMode] = useState<DrawMode>("none");
  const [isDrawing, setIsDrawing] = useState(false);
  const [spacebarPanning, setSpacebarPanning] = useState(false);
  const [mapBgColor, setMapBgColor] = useState("hsl(var(--background))");
  const [is3D, setIs3D] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [lineContinuous, setLineContinuous] = useState(true);
  const [eraserPoint, setEraserPoint] = useState<{
    lng: number;
    lat: number;
  } | null>(null);
  const [allEntities, setAllEntities] = useState<Entidad[]>([]);
  const [showEntityPicker, setShowEntityPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [linkingMarkerId, setLinkingMarkerId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(
    null,
  );

  const [history, setHistory] = useState<
    { markers: MapMarker[]; features: GeoFeatureCollection }[]
  >([]);
  const [future, setFuture] = useState<
    { markers: MapMarker[]; features: GeoFeatureCollection }[]
  >([]);
  const historyRef = useRef<
    { markers: MapMarker[]; features: GeoFeatureCollection }[]
  >([]);
  const futureRef = useRef<
    { markers: MapMarker[]; features: GeoFeatureCollection }[]
  >([]);
  const actionSavedRef = useRef(false);

  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  const [processingLayers, setProcessingLayers] = useState<Set<string>>(
    new Set(),
  );
  const [errorLayers, setErrorLayers] = useState<Set<string>>(new Set());

  const openPanel = (_mode: string, _id?: number, _title?: string) => {
    // Panel derecho eliminado: antes abría inspector contextual del mapa.
  };
  const setCustomContent = (_content: unknown, _title?: unknown) => {
    // Panel derecho eliminado: antes inyectaba herramientas contextuales.
  };
  const closePanel = () => {
    // Panel derecho eliminado: antes cerraba herramientas contextuales.
  };
  const mapRef = useRef<MapRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getHistorySnapshot = useCallback(
    () => ({
      markers: JSON.parse(JSON.stringify(markers)),
      features: JSON.parse(JSON.stringify(features)),
    }),
    [markers, features],
  );

  const pushHistory = useCallback(
    (snapshot: { markers: MapMarker[]; features: GeoFeatureCollection }) => {
      setHistory((prev) => {
        const next = [...prev, snapshot];
        historyRef.current = next;
        return next;
      });
      setFuture([]);
      futureRef.current = [];
    },
    [],
  );

  const restoreSnapshot = useCallback(
    (snapshot: { markers: MapMarker[]; features: GeoFeatureCollection }) => {
      setMarkers(snapshot.markers);
      setFeatures(snapshot.features);
    },
    [],
  );

  const handleUndo = useCallback(() => {
    const currentHistory = historyRef.current;
    if (currentHistory.length === 0) return;
    const lastSnapshot = currentHistory[currentHistory.length - 1];
    const currentSnapshot = getHistorySnapshot();

    setHistory((prev) => {
      const next = prev.slice(0, -1);
      historyRef.current = next;
      return next;
    });
    setFuture((prev) => {
      const next = [currentSnapshot, ...prev];
      futureRef.current = next;
      return next;
    });
    restoreSnapshot(lastSnapshot);
  }, [getHistorySnapshot, restoreSnapshot]);

  const handleRedo = useCallback(() => {
    const currentFuture = futureRef.current;
    if (currentFuture.length === 0) return;
    const nextSnapshot = currentFuture[0];
    const currentSnapshot = getHistorySnapshot();

    setFuture((prev) => {
      const next = prev.slice(1);
      futureRef.current = next;
      return next;
    });
    setHistory((prev) => {
      const next = [...prev, currentSnapshot];
      historyRef.current = next;
      return next;
    });
    restoreSnapshot(nextSnapshot);
  }, [getHistorySnapshot, restoreSnapshot]);

  const saveHistorySnapshot = useCallback(() => {
    if (actionSavedRef.current) return;
    pushHistory(getHistorySnapshot());
    actionSavedRef.current = true;
  }, [getHistorySnapshot, pushHistory]);

  const endCurrentAction = useCallback(() => {
    setIsDrawing(false);
    actionSavedRef.current = false;
  }, []);

  const loadAllEntities = useCallback(async () => {
    try {
      const entities = await MapUseCase.getAllEntities(Number(projectId));
      setAllEntities(entities);
    } catch {}
  }, [projectId]);

  const loadMap = useCallback(async (idOrSlug: string | number) => {
    try {
      const entity = await MapUseCase.getMapByIdOrSlug(idOrSlug, Number(projectId));
      if (entity) {
        setMapEntity(entity);
        setTargetFolderId(entity.carpeta_id);
        const attrs: MapAttributes =
          typeof entity.contenido_json === "string"
            ? JSON.parse(entity.contenido_json)
            : entity.contenido_json || {};
        setMarkers(attrs.markers || []);
        
        let loadedLayers = attrs.layers && attrs.layers.length > 0 ? attrs.layers : DEFAULT_LAYERS;
        const bgImg = typeof attrs.bgImage === "string" ? attrs.bgImage : (typeof attrs.snapshotUrl === "string" ? attrs.snapshotUrl : undefined);
        if (bgImg) {
          loadedLayers = loadedLayers.map((l): MapLayer =>
            l.id === "base" && !l.url ? { ...l, url: bgImg } : l,
          );
        }
        setLayers(loadedLayers);
        
        if (attrs.features) setFeatures(attrs.features as GeoFeatureCollection);
        setIs3D(!!attrs.is3D);
        if (attrs.mapSettings) {
          setViewState((prev) => ({
            ...prev,
            zoom: attrs.mapSettings?.zoom ?? 1,
            longitude: attrs.mapSettings?.center?.[0] ?? 0,
            latitude: attrs.mapSettings?.center?.[1] ?? 0,
          }));
        }
      }
    } catch {}
  }, [projectId]);

  useEffect(() => {
    if (entityId && mode === "edit") {
      loadMap(entityId);
    } else if (mode === "create") {
      setMapEntity({
        id: 0,
        nombre: "Nuevo Atlas",
        tipo: "Map",
        descripcion: "",
        slug: "nuevo-atlas",
        folder_slug: "",
        imagen_url: "",
        contenido_json: JSON.stringify({
          layers: DEFAULT_LAYERS,
          markers: [],
          features: { type: "FeatureCollection", features: [] },
          mapSettings: INITIAL_VIEW_STATE,
          is3D: false,
        }),
        project_id: Number(projectId) || 0,
        carpeta_id: targetFolderId,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        borrado: 0,
      } as Entidad);
      setIs3D(false);
    }
    loadAllEntities();
  }, [entityId, mode, projectId, loadMap, loadAllEntities]);

  useEffect(() => {
    const validateImageLayers = (): void => {
      layers.forEach((layer) => {
        const isImgLayer = (layer.type === "base" || layer.type === "image") && !!layer.url;
        
        isImgLayer ? (() => {
          const img = new Image();
          img.src = layer.url!;
          img.onload = () => {
            setErrorLayers((prev) => {
              const hasId = prev.has(layer.id);
              let next: Set<string> = prev;
              
              hasId ? (() => {
                next = new Set(prev);
                next.delete(layer.id);
              })() : null;
              
              return next;
            });
          };
          img.onerror = () => {
            setErrorLayers((prev) => {
              const hasId = prev.has(layer.id);
              let next: Set<string> = prev;
              
              !hasId ? (() => {
                next = new Set(prev);
                next.add(layer.id);
              })() : null;
              
              return next;
            });
          };
        })() : null;
      });
    };
    validateImageLayers();
  }, [layers]);

  const handleSaveMap = useCallback(async () => {
    if (!mapEntity) return;
    try {
      const currentContent =
        typeof mapEntity.contenido_json === "string"
          ? JSON.parse(mapEntity.contenido_json)
          : mapEntity.contenido_json || {};

      const baseImageLayer = layers.find(
        (l) => (l.type === "base" || l.type === "image") && l.url && l.visible,
      );
      const snapshotUrl =
        baseImageLayer?.url || currentContent.snapshotUrl || "";

      const updatedContent: MapAttributes = {
        ...currentContent,
        markers,
        layers,
        features,
        is3D,
        snapshotUrl,
        bgImage: snapshotUrl,
        mapSettings: {
          zoom: viewState.zoom,
          center: [viewState.longitude, viewState.latitude],
        },
        lastEdited: new Date().toISOString(),
      };
      if (mode === "create" || !entityId) {
        await MapUseCase.createMap({
          nombre: mapEntity.nombre,
          project_id: projectId || 0,
          carpeta_id: targetFolderId,
          contenido_json: JSON.stringify(updatedContent),
          imagen_url: "",
        });
        if (onSave) await onSave();
        else navigate(-1);
      } else {
        await MapUseCase.updateMap(Number(entityId), {
          nombre: mapEntity.nombre,
          carpeta_id: targetFolderId,
          contenido_json: JSON.stringify(updatedContent),
        });
        if (onSave) await onSave();
        else navigate(-1);
      }
    } catch {}
  }, [
    mapEntity,
    layers,
    markers,
    features,
    is3D,
    viewState,
    mode,
    entityId,
    projectId,
    targetFolderId,
    onSave,
    navigate,
  ]);

  const addSprayPoint = useCallback(
    (lng: number, lat: number) => {
      setFeatures((prev: GeoFeatureCollection) => ({
        ...prev,
        features: [
          ...prev.features,
          {
            type: "Feature" as const,
            geometry: { type: "Point", coordinates: [lng, lat] },
            properties: { layerId: selectedLayerId },
          },
        ],
      }));
    },
    [selectedLayerId],
  );

  const addLinePoint = useCallback(
    (lng: number, lat: number, forceNew: boolean = false) => {
      setFeatures((prev: GeoFeatureCollection) => {
        const fts = [...prev.features];
        const lastIdx = fts.length - 1;
        const last = lastIdx >= 0 ? fts[lastIdx] : null;
        const hasCurrentLine =
          last &&
          last.geometry.type === "LineString" &&
          last.properties?.layerId === selectedLayerId;
        const shouldAppend = !forceNew && hasCurrentLine;

        if (shouldAppend && last) {
          fts[lastIdx] = {
            ...last,
            geometry: {
              ...last.geometry,
              coordinates: [
                ...(last.geometry.coordinates as unknown[]),
                [lng, lat],
              ],
            },
          };
        } else {
          fts.push({
            type: "Feature",
            geometry: { type: "LineString", coordinates: [[lng, lat]] },
            properties: { layerId: selectedLayerId, timestamp: Date.now() },
          });
        }
        return { ...prev, features: fts };
      });
    },
    [selectedLayerId],
  );

  const eraseFeatures = useCallback(
    (lng: number, lat: number) => {
      if (!mapRef.current) return;
      const map = mapRef.current.getMap();
      const cursorPx = map.project([lng, lat]);
      const radius = brushSize;

      setFeatures((prev: GeoFeatureCollection) => {
        const newFeatures = (prev.features || []).flatMap((f: GeoFeature) => {
          if (f.properties?.layerId !== selectedLayerId) return [f];
          if (f.geometry.type === "Point") {
            const coords = f.geometry.coordinates as [number, number];
            const featPx = map.project(coords);
            const dist = Math.hypot(
              cursorPx.x - featPx.x,
              cursorPx.y - featPx.y,
            );
            return dist > radius ? [f] : [];
          }
          if (f.geometry.type === "LineString") {
            const segments: GeoFeature[][] = [];
            let currentPart: [number, number][] = [];
            (f.geometry.coordinates as [number, number][]).forEach((coord) => {
              const ptPx = map.project(coord);
              const dist = Math.hypot(cursorPx.x - ptPx.x, cursorPx.y - ptPx.y);
              if (dist > radius) currentPart.push(coord);
              else {
                if (currentPart.length >= 2)
                  segments.push(
                    currentPart.map((c) => ({
                      ...f,
                      id: `${f.id}-seg`,
                      geometry: { ...f.geometry, coordinates: [c] },
                    })),
                  );
                currentPart = [];
              }
            });
            if (currentPart.length >= 2)
              segments.push(
                currentPart.map((c) => ({
                  ...f,
                  id: `${f.id}-seg2`,
                  geometry: { ...f.geometry, coordinates: [c] },
                })),
              );
            return segments.flatMap((s) => s);
          }
          return [f];
        });
        return { ...prev, features: newFeatures };
      });
    },
    [brushSize, selectedLayerId],
  );

  return {
    mapEntity,
    setMapEntity,
    markers,
    setMarkers,
    layers,
    setLayers,
    selectedLayerId,
    setSelectedLayerId,
    features,
    setFeatures,
    viewState,
    setViewState,
    drawMode,
    setDrawMode,
    isDrawing,
    setIsDrawing,
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
    setLineContinuous,
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
    processingLayers,
    errorLayers,
    mapRef,
    fileInputRef,
    openPanel,
    setCustomContent,
    closePanel,
  };
};
