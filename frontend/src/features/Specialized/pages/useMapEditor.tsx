import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapRef, MapMouseEvent } from "react-map-gl/maplibre";
import { MapUseCase } from "@features/Maps";
import { Entidad } from "@domain/database";
import { MapMarker, AtlasLevel, AtlasAttributes } from "@domain/maps";
import { useMapStore } from "../../Maps/store/useMapStore";

export type DrawMode = "none" | "spray" | "line" | "rectangle" | "circle" | "fill" | "marker" | "eraser";

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
  const {
    mapEntity,
    markers,
    features,
    levels,
    activeLevelId,
    levelBgImages,
    levelSpacing,
    is3D,
    gridMode,
    viewState,
    loadMap,
    updateCache,
    saveToSql,
  } = useMapStore();

  const setMapEntity = (mapEntity: Entidad | null) => updateCache({ mapEntity });
  
  const setMarkers = useCallback((action: React.SetStateAction<MapMarker[]>) => {
    updateCache({ markers: typeof action === "function" ? action(useMapStore.getState().markers) : action });
  }, [updateCache]);

  const setFeatures = useCallback((action: React.SetStateAction<GeoFeatureCollection>) => {
    updateCache({ features: typeof action === "function" ? action(useMapStore.getState().features as GeoFeatureCollection) : action });
  }, [updateCache]);

  const setLevels = useCallback((action: React.SetStateAction<AtlasLevel[]>) => {
    updateCache({ levels: typeof action === "function" ? action(useMapStore.getState().levels as AtlasLevel[]) : action });
  }, [updateCache]);

  const setActiveLevelId = (id: string) => updateCache({ activeLevelId: id });
  
  const setLevelBgImages = useCallback((action: React.SetStateAction<Record<string, string | null>>) => {
    updateCache({ levelBgImages: typeof action === "function" ? action(useMapStore.getState().levelBgImages) as Record<string, string> : action as Record<string, string> });
  }, [updateCache]);

  const setLevelSpacing = (s: number) => updateCache({ levelSpacing: s });
  const setIs3D = (v: boolean) => updateCache({ is3D: v });
  const setGridMode = useCallback((action: React.SetStateAction<"none" | "square" | "isometric" | "dots">) => {
    updateCache({ gridMode: typeof action === "function" ? action(useMapStore.getState().gridMode) : action });
  }, [updateCache]);
  
  const setViewState = useCallback((action: React.SetStateAction<typeof INITIAL_VIEW_STATE>) => {
    updateCache({ viewState: typeof action === "function" ? action(useMapStore.getState().viewState as typeof INITIAL_VIEW_STATE) : action });
  }, [updateCache]);

  const [targetFolderId, setTargetFolderId] = useState<number | null>(
    folderId ? Number(folderId) : null,
  );
  
  // Tool Modes
  const [drawMode, setDrawMode] = useState<DrawMode>("none");
  const [isDrawing, setIsDrawing] = useState(false);
  const [spacebarPanning, setSpacebarPanning] = useState(false);
  const [mapBgColor, setMapBgColor] = useState("hsl(var(--background))");
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  
  // Brush Options
  const [brushSize, setBrushSize] = useState(10);
  const [brushColor, setBrushColor] = useState("#22c55e");
  const [lineContinuous, setLineContinuous] = useState(true);
  const [eraserPoint, setEraserPoint] = useState<{ lng: number; lat: number } | null>(null);
  
  // Multilevel Options (Overlay only, rest is in store)
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

  useEffect(() => {
    if (entityId && mode === "edit") {
      loadMap(entityId, Number(projectId));
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
    await saveToSql();
    if (onSave) await onSave();
    else navigate(-1);
  }, [saveToSql, onSave, navigate]);

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

  const addGeometricFeature = useCallback(
    (
      id: string,
      type: "rectangle" | "circle",
      startCoords: { lng: number; lat: number },
      currentCoords: { lng: number; lat: number },
      isTemp: boolean = false
    ) => {
      setFeatures((prev: GeoFeatureCollection) => {
        const fts = [...prev.features];
        const existingIdx = fts.findIndex((f) => f.id === id);
        
        let coords: [number, number][][] = [[]];
        const x1 = startCoords.lng;
        const y1 = startCoords.lat;
        const x2 = currentCoords.lng;
        const y2 = currentCoords.lat;

        const buildRectangle = (): [number, number][][] => [[
          [x1, y1],
          [x2, y1],
          [x2, y2],
          [x1, y2],
          [x1, y1]
        ]];

        const buildCircle = (): [number, number][][] => {
          const radius = Math.hypot(x2 - x1, y2 - y1);
          const circlePoints: [number, number][] = [];
          for (let i = 0; i <= 64; i++) {
            const angle = (i / 64) * 2 * Math.PI;
            circlePoints.push([
              x1 + radius * Math.cos(angle),
              y1 + radius * Math.sin(angle)
            ]);
          }
          return [circlePoints];
        };

        coords = type === "rectangle" ? buildRectangle() : buildCircle();

        const newFeature: GeoFeature = {
          id,
          type: "Feature",
          geometry: { type: "Polygon", coordinates: coords },
          properties: {
            levelId: activeLevelId,
            color: brushColor,
            width: brushSize,
            type,
            isTemp,
            timestamp: Date.now()
          }
        };

        const hasExisting = existingIdx >= 0;
        hasExisting
          ? (fts[existingIdx] = newFeature)
          : fts.push(newFeature);

        return { ...prev, features: fts };
      });
    },
    [activeLevelId, brushColor, brushSize, setFeatures]
  );

  const consolidateGeometricFeature = useCallback(
    (id: string) => {
      setFeatures((prev: GeoFeatureCollection) => {
        const fts = prev.features.map((f) => {
          const isTarget = f.id === id;
          return isTarget
            ? {
                ...f,
                properties: {
                  ...f.properties,
                  isTemp: false
                }
              }
            : f;
        });
        return { ...prev, features: fts };
      });
    },
    [setFeatures]
  );

  const removeFeature = useCallback(
    (id: string) => {
      setFeatures((prev: GeoFeatureCollection) => ({
        ...prev,
        features: prev.features.filter((f) => f.id !== id)
      }));
    },
    [setFeatures]
  );

  const handleFloodFill = useCallback(
    (clickLng: number, clickLat: number) => {
      const GRID_SPACING = 1;
      const spacing = gridMode !== "none" ? GRID_SPACING : 0.05;

      const currentLevelMuros = features.features.filter((f) => {
        const isLine = f.geometry.type === "LineString";
        const isSameLevel = f.properties?.levelId === activeLevelId;
        return isLine && isSameLevel;
      });

      const segments: { p1: [number, number]; p2: [number, number] }[] = [];
      currentLevelMuros.forEach((muro) => {
        const coords = muro.geometry.coordinates as [number, number][];
        coords.forEach((c, i) => {
          const hasNext = i < coords.length - 1;
          hasNext
            ? segments.push({ p1: c, p2: coords[i + 1] })
            : undefined;
        });
      });

      const ccw = (p1: [number, number], p2: [number, number], p3: [number, number]): boolean => {
        return (p3[1] - p1[1]) * (p2[0] - p1[0]) > (p2[1] - p1[1]) * (p3[0] - p1[0]);
      };

      const intersect = (
        p1: [number, number], p2: [number, number],
        p3: [number, number], p4: [number, number]
      ): boolean => {
        const isCcw1 = ccw(p1, p3, p4) !== ccw(p2, p3, p4);
        const isCcw2 = ccw(p1, p2, p3) !== ccw(p1, p2, p4);
        return isCcw1 && isCcw2;
      };

      const cx0 = Math.round(clickLng / spacing) * spacing;
      const cy0 = Math.round(clickLat / spacing) * spacing;

      const queue: [number, number][] = [[cx0, cy0]];
      const visited = new Set<string>();
      visited.add(`${cx0},${cy0}`);
      const filledCells: [number, number][] = [[cx0, cy0]];

      const maxCells = 800;
      let cellCount = 0;

      while (queue.length > 0 && cellCount < maxCells) {
        const curr = queue.shift()!;
        cellCount++;
        const [cx, cy] = curr;

        const directions: [number, number][] = [
          [cx + spacing, cy],
          [cx - spacing, cy],
          [cx, cy + spacing],
          [cx, cy - spacing]
        ];

        directions.forEach(([nx, ny]) => {
          const key = `${nx},${ny}`;
          const isVisited = visited.has(key);
          
          isVisited
            ? undefined
            : (() => {
                let blocked = false;
                segments.forEach((seg) => {
                  const isBlocked = intersect([cx, cy], [nx, ny], seg.p1, seg.p2);
                  isBlocked ? (blocked = true) : undefined;
                });

                blocked
                  ? undefined
                  : (() => {
                      visited.add(key);
                      queue.push([nx, ny]);
                      filledCells.push([nx, ny]);
                    })();
              })();
        });
      }

      const half = spacing / 2;
      const polyCoords = filledCells.map(([cx, cy]) => [
        [
          [cx - half, cy - half],
          [cx + half, cy - half],
          [cx + half, cy + half],
          [cx - half, cy + half],
          [cx - half, cy - half]
        ]
      ]);

      const fillFeature = {
        type: "Feature" as const,
        geometry: {
          type: "MultiPolygon" as const,
          coordinates: polyCoords
        },
        properties: {
          levelId: activeLevelId,
          color: brushColor,
          width: brushSize,
          type: "fill",
          timestamp: Date.now()
        }
      };

      setFeatures((prev: GeoFeatureCollection) => ({
        ...prev,
        features: [...prev.features, fillFeature]
      }));
    },
    [features, activeLevelId, brushColor, brushSize, gridMode, setFeatures]
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
    addGeometricFeature,
    consolidateGeometricFeature,
    removeFeature,
    handleFloodFill,
    mapRef
  };
};
