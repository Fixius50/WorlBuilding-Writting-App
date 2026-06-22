import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapRef, MapMouseEvent } from "react-map-gl/maplibre";
import { MapUseCase } from "@features/Maps";
import { Entidad } from "@domain/database";
import { MapMarker, AtlasLevel, AtlasAttributes } from "@domain/maps";

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

const INITIAL_VIEW_STATE = { longitude: 0, latitude: 0, zoom: 1 };

const DEFAULT_LEVELS: AtlasLevel[] = [
  { id: "l_2", name: "Nivel 2", z_index: 2 },
  { id: "l_1", name: "Nivel 1", z_index: 1 },
  { id: "l0", name: "Nivel 0: Principal", z_index: 0 },
  { id: "l_-1", name: "Nivel -1", z_index: -1 },
  { id: "l_-2", name: "Nivel -2", z_index: -2 },
];

/**
 * Hook useMapEditor
 * Logic for managing atlas/map editing, drawing, and persistence with Multilevel 3D support.
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
  const [features, setFeatures] = useState<GeoFeatureCollection>({
    type: "FeatureCollection",
    features: [],
  });
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [targetFolderId, setTargetFolderId] = useState<number | null>(
    folderId ? Number(folderId) : null,
  );
  
  // Tool Modes
  const [drawMode, setDrawMode] = useState<DrawMode>("none");
  const [isDrawing, setIsDrawing] = useState(false);
  const [spacebarPanning, setSpacebarPanning] = useState(false);
  const [mapBgColor, setMapBgColor] = useState("hsl(var(--background))");
  const [is3D, setIs3D] = useState(false);
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [gridMode, setGridMode] = useState<"none" | "square" | "isometric" | "dots">("none");
  
  // Brush Options
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState("#22c55e");
  const [lineContinuous, setLineContinuous] = useState(true);
  const [eraserPoint, setEraserPoint] = useState<{ lng: number; lat: number } | null>(null);
  
  // Multilevel 3D Stack Options
  const [levels, setLevels] = useState<AtlasLevel[]>(DEFAULT_LEVELS);
  const [activeLevelId, setActiveLevelId] = useState<string>("l0");
  const [levelBgImages, setLevelBgImages] = useState<Record<string, string | null>>({});
  const [levelSpacing, setLevelSpacing] = useState<number>(100);
  const [overlayAllLayers, setOverlayAllLayers] = useState<boolean>(true);

  // Entities & UI
  const [allEntities, setAllEntities] = useState<Entidad[]>([]);
  const [showEntityPicker, setShowEntityPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  // History Undo/Redo
  const [history, setHistory] = useState<{ markers: MapMarker[]; features: GeoFeatureCollection }[]>([]);
  const [future, setFuture] = useState<{ markers: MapMarker[]; features: GeoFeatureCollection }[]>([]);
  const historyRef = useRef<{ markers: MapMarker[]; features: GeoFeatureCollection }[]>([]);
  const futureRef = useRef<{ markers: MapMarker[]; features: GeoFeatureCollection }[]>([]);
  const actionSavedRef = useRef(false);

  const mapRef = useRef<MapRef>(null);

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

  const loadMap = useCallback(
    async (idOrSlug: string | number) => {
      try {
        const entity = await MapUseCase.getMapByIdOrSlug(idOrSlug, Number(projectId));
        if (entity) {
          setMapEntity(entity);
          setTargetFolderId(entity.carpeta_id);
          const attrs: AtlasAttributes =
            typeof entity.contenido_json === "string"
              ? JSON.parse(entity.contenido_json)
              : entity.contenido_json || {};
              
          setMarkers(attrs.markers || []);
          if (attrs.features) setFeatures((attrs.features as GeoFeatureCollection) || { type: "FeatureCollection", features: [] });
          
          setLevels((attrs.levels as AtlasLevel[]) || [{ id: 'l0', name: 'Nivel Principal', z_index: 0 }]);
          setActiveLevelId((attrs.activeLevelId as string) || "l0");
          setLevelBgImages((attrs.levelBgImages as Record<string, string | null>) || (attrs.bgImage ? { "l0": attrs.bgImage as string } : {}));
          setLevelSpacing(attrs.levelSpacing ?? 100);
          setIs3D(!!attrs.is3D);
          setGridMode(attrs.gridMode || "none");
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
    },
    [projectId],
  );

  useEffect(() => {
    if (entityId && mode === "edit") {
      loadMap(entityId);
    } else if (mode === "create") {
      setMapEntity({
        id: 0,
        nombre: "Nuevo Atlas Multinivel",
        tipo: "Map",
        descripcion: "",
        slug: "nuevo-atlas-multinivel",
        folder_slug: "",
        imagen_url: "",
        contenido_json: JSON.stringify({
          levels: DEFAULT_LEVELS,
          activeLevelId: "l0",
          markers: [],
          features: { type: "FeatureCollection", features: [] },
          mapSettings: INITIAL_VIEW_STATE,
          is3D: false,
          levelSpacing: 100,
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
  }, [entityId, mode, projectId, loadMap, loadAllEntities, targetFolderId]);

  const handleSaveMap = useCallback(async () => {
    if (!mapEntity) return;
    try {
      const currentContent =
        typeof mapEntity.contenido_json === "string"
          ? JSON.parse(mapEntity.contenido_json)
          : mapEntity.contenido_json || {};

      const updatedContent: AtlasAttributes = {
        ...currentContent,
        markers,
        features,
        levels,
        activeLevelId,
        levelBgImages,
        levelSpacing,
        is3D,
        gridMode,
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
        await MapUseCase.updateMap(mapEntity.id, {
          nombre: mapEntity.nombre,
          carpeta_id: targetFolderId,
          contenido_json: JSON.stringify(updatedContent),
        });
        if (onSave) await onSave();
        else navigate(-1);
      }
    } catch {}
  }, [
    mapEntity, markers, features, levels, activeLevelId, levelBgImages, levelSpacing, is3D, viewState, mode, entityId, projectId, targetFolderId, onSave, navigate,
  ]);

  const addLinePoint = useCallback(
    (lng: number, lat: number, forceNew: boolean = false, type: string = "line") => {
      setFeatures((prev: GeoFeatureCollection) => {
        const fts = [...prev.features];
        const lastIdx = fts.length - 1;
        const last = lastIdx >= 0 ? fts[lastIdx] : null;
        
        const hasCurrentLine = last &&
          last.geometry.type === "LineString" &&
          last.properties?.levelId === activeLevelId &&
          last.properties?.color === brushColor &&
          last.properties?.width === brushSize &&
          last.properties?.type === type;
          
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
            properties: { levelId: activeLevelId, color: brushColor, width: brushSize, type, timestamp: Date.now() },
          });
        }
        return { ...prev, features: fts };
      });
    },
    [activeLevelId, brushColor, brushSize],
  );

  const addSprayPoint = useCallback(
    (lng: number, lat: number, forceNew: boolean = false) => {
      addLinePoint(lng, lat, forceNew, "spray");
    },
    [addLinePoint],
  );

  const eraseFeatures = useCallback(
    (lng: number, lat: number, mapInstance?: maplibregl.Map | null) => {
      if (!mapInstance) return;
      const cursorPx = mapInstance.project([lng, lat]);
      const radius = brushSize;

      setFeatures((prev: GeoFeatureCollection) => {
        const newFeatures = (prev.features || []).flatMap((f: GeoFeature) => {
          if (f.properties?.levelId !== activeLevelId) return [f];
          
          if (f.geometry.type === "Point") {
            const coords = f.geometry.coordinates as [number, number];
            const featPx = mapInstance.project(coords);
            const dist = Math.hypot(cursorPx.x - featPx.x, cursorPx.y - featPx.y);
            return dist > radius ? [f] : [];
          }
          if (f.geometry.type === "LineString") {
            const segments: GeoFeature[][] = [];
            let currentPart: [number, number][] = [];
            (f.geometry.coordinates as [number, number][]).forEach((coord) => {
              const ptPx = mapInstance.project(coord);
              const dist = Math.hypot(cursorPx.x - ptPx.x, cursorPx.y - ptPx.y);
              if (dist > radius) currentPart.push(coord);
              else {
                if (currentPart.length >= 2)
                  segments.push(currentPart.map((c) => ({
                      ...f,
                      id: `${f.id}-seg`,
                      geometry: { ...f.geometry, coordinates: [c] },
                    })));
                currentPart = [];
              }
            });
            if (currentPart.length >= 2)
              segments.push(currentPart.map((c) => ({
                  ...f,
                  id: `${f.id}-seg2`,
                  geometry: { ...f.geometry, coordinates: [c] },
                })));
            return segments.flatMap((s) => s);
          }
          return [f];
        });
        return { ...prev, features: newFeatures };
      });
    },
    [brushSize, activeLevelId],
  );

  return {
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
    brushColor,
    setBrushColor,
    gridMode,
    setGridMode,
    lineContinuous,
    setLineContinuous,
    eraserPoint,
    setEraserPoint,
    allEntities,
    showEntityPicker,
    setShowEntityPicker,
    searchQuery,
    setSearchQuery,
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
    mapRef,
  };
};
