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
    (clickLng: number, clickLat: number, mapInstance?: maplibregl.Map | null) => {
      // Límites de pantalla por defecto o del viewport activo
      let minLng = -180;
      let maxLng = 180;
      let minLat = -85;
      let maxLat = 85;

      mapInstance
        ? (() => {
            const bounds = mapInstance.getBounds();
            minLng = bounds.getWest();
            maxLng = bounds.getEast();
            minLat = bounds.getSouth();
            maxLat = bounds.getNorth();
          })()
        : undefined;

      const currentLevelObstacles = features.features.filter((f) => {
        const isSameLevel = f.properties?.levelId === activeLevelId;
        const isLineOrPoly = f.geometry.type === "LineString" || f.geometry.type === "Polygon";
        return isSameLevel && isLineOrPoly;
      });

      // RASTERIZACIÓN VIRTUAL EN MEMORIA DE LOS MUROS
      let width = 800;
      let height = 600;
      let pixelData = new Uint8ClampedArray(width * height * 4);
      
      mapInstance
        ? (() => {
            const canvasElement = mapInstance.getCanvas();
            width = canvasElement.clientWidth || 800;
            height = canvasElement.clientHeight || 600;

            const canvas = document.createElement("canvas");
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext("2d")!;
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, width, height);

            ctx.strokeStyle = "#000000";
            // Aumentamos ligeramente el grosor del obstáculo virtual para evitar fugas entre uniones
            ctx.lineWidth = Math.max(3, brushSize);
            ctx.lineCap = "round";
            ctx.lineJoin = "round";

            currentLevelObstacles.forEach((obs) => {
              const isLine = obs.geometry.type === "LineString";
              isLine
                ? (() => {
                    const coords = obs.geometry.coordinates as [number, number][];
                    ctx.beginPath();
                    coords.forEach((coord, index) => {
                      const pt = mapInstance.project(coord);
                      index === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
                    });
                    ctx.stroke();
                  })()
                : (() => {
                    const rings = obs.geometry.coordinates as [number, number][][];
                    rings.forEach((ring) => {
                      ctx.fillStyle = "#000000";
                      ctx.beginPath();
                      ring.forEach((coord, index) => {
                        const pt = mapInstance.project(coord);
                        index === 0 ? ctx.moveTo(pt.x, pt.y) : ctx.lineTo(pt.x, pt.y);
                      });
                      ctx.closePath();
                      ctx.fill();
                      ctx.stroke();
                    });
                  })();
            });

            const imgData = ctx.getImageData(0, 0, width, height);
            pixelData = imgData.data;
          })()
        : undefined;

      const isBlockedPixel = (lng: number, lat: number): boolean => {
        const hasInstance = !!mapInstance;
        return hasInstance
          ? (() => {
              const pt = mapInstance!.project([lng, lat]);
              const px = Math.round(pt.x);
              const py = Math.round(pt.y);
              const inside = px >= 0 && px < width && py >= 0 && py < height;
              return inside
                ? pixelData[(py * width + px) * 4] < 128
                : false;
            })()
          : false;
      };

      // Inundación sobre una rejilla ortogonal adaptada a la pantalla visible
      const cols = 250;
      const rows = 250;
      const spacingLng = (maxLng - minLng) / cols;
      const spacingLat = (maxLat - minLat) / rows;

      const startI = Math.floor((clickLng - minLng) / spacingLng);
      const startJ = Math.floor((clickLat - minLat) / spacingLat);

      const insideStart = startI >= 0 && startI < cols && startJ >= 0 && startJ < rows;

      if (insideStart) {
        const queue: [number, number][] = [[startI, startJ]];
        const visited = new Set<string>();
        visited.add(`${startI},${startJ}`);
        const filledCells: [number, number][] = [[startI, startJ]];

        const checkBlocked = (i: number, j: number, ni: number, nj: number): boolean => {
          const pMid = [
            minLng + ((i + ni) / 2 + 0.5) * spacingLng,
            minLat + ((j + nj) / 2 + 0.5) * spacingLat
          ] as [number, number];
          const pDest = [
            minLng + (ni + 0.5) * spacingLng,
            minLat + (nj + 0.5) * spacingLat
          ] as [number, number];
          return isBlockedPixel(pMid[0], pMid[1]) || isBlockedPixel(pDest[0], pDest[1]);
        };

        while (queue.length > 0) {
          const curr = queue.shift()!;
          const [ci, cj] = curr;

          const directions: [number, number][] = [
            [ci + 1, cj],
            [ci - 1, cj],
            [ci, cj + 1],
            [ci, cj - 1]
          ];

          directions.forEach(([ni, nj]) => {
            const key = `${ni},${nj}`;
            if (ni >= 0 && ni < cols && nj >= 0 && nj < rows && !visited.has(key)) {
              if (!checkBlocked(ci, cj, ni, nj)) {
                visited.add(key);
                queue.push([ni, nj]);
                filledCells.push([ni, nj]);
              }
            }
          });
        }

        // EXTRAER SÓLO LAS ARISTAS FRONTERA EXTERIORES utilizando índices enteros de esquinas
        const boundaryEdges: { p1: [number, number]; p2: [number, number] }[] = [];

        filledCells.forEach(([i, j]) => {
          const c0: [number, number] = [i, j];
          const c1: [number, number] = [i + 1, j];
          const c2: [number, number] = [i + 1, j + 1];
          const c3: [number, number] = [i, j + 1];

          const edges = [
            { p1: c0, p2: c1, neighborKey: `${i},${j - 1}` },
            { p1: c1, p2: c2, neighborKey: `${i + 1},${j}` },
            { p1: c2, p2: c3, neighborKey: `${i},${j + 1}` },
            { p1: c3, p2: c0, neighborKey: `${i - 1},${j}` }
          ];

          edges.forEach((edge) => {
            const isNeighborFilled = visited.has(edge.neighborKey);
            if (!isNeighborFilled) {
              boundaryEdges.push({ p1: edge.p1, p2: edge.p2 });
            }
          });
        });

        // CONECTAR LAS ARISTAS EN UNO O MÁS CAMINOS CERRADOS en tiempo O(E) usando mapa de adyacencia
        const adjMap = new Map<string, { to: [number, number]; edgeId: number }[]>();
        boundaryEdges.forEach((edge, index) => {
          const k1 = `${edge.p1[0]},${edge.p1[1]}`;
          const k2 = `${edge.p2[0]},${edge.p2[1]}`;
          
          if (!adjMap.has(k1)) {
            adjMap.set(k1, []);
          }
          if (!adjMap.has(k2)) {
            adjMap.set(k2, []);
          }
          adjMap.get(k1)!.push({ to: edge.p2, edgeId: index });
          adjMap.get(k2)!.push({ to: edge.p1, edgeId: index });
        });

        const usedEdges = new Set<number>();
        const polygons: [number, number][][] = [];

        boundaryEdges.forEach((startEdge, index) => {
          const isUsed = usedEdges.has(index);
          if (!isUsed) {
            usedEdges.add(index);
            const currentPath: [number, number][] = [startEdge.p1, startEdge.p2];
            let lastPt = startEdge.p2;
            let foundNext = true;

            while (foundNext) {
              foundNext = false;
              const lastKey = `${lastPt[0]},${lastPt[1]}`;
              const neighbors = adjMap.get(lastKey) || [];
              
              let nextNeighbor: { to: [number, number]; edgeId: number } | null = null;
              for (let k = 0; k < neighbors.length; k++) {
                const n = neighbors[k];
                if (!usedEdges.has(n.edgeId)) {
                  nextNeighbor = n;
                  break;
                }
              }

              if (nextNeighbor) {
                usedEdges.add(nextNeighbor.edgeId);
                currentPath.push(nextNeighbor.to);
                lastPt = nextNeighbor.to;
                foundNext = true;
              }
            }

            if (currentPath.length >= 3) {
              polygons.push(currentPath);
            }
          }
        });

        // Convertir esquinas de rejilla a coordenadas geográficas
        const polyCoords = polygons.map((poly) => {
          const coords = poly.map(([x, y]) => {
            const lng = minLng + x * spacingLng;
            const lat = minLat + y * spacingLat;
            return [lng, lat] as [number, number];
          });
          return [coords];
        });

        const fillFeature: GeoFeature = {
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
      }
    },
    [features, activeLevelId, brushColor, brushSize, setFeatures]
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
