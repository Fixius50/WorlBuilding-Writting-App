import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { MapRef, MapMouseEvent } from "react-map-gl/maplibre";
import { MapUseCase } from "@features/Maps";
import { Entidad, Carpeta } from "@domain/database";
import { folderService } from "@repositories/folderService";
import { MapMarker, AtlasLevel, AtlasAttributes } from "@domain/maps";
import { useMapStore } from "../../Maps/store/useMapStore";

import { DrawMode, GeoFeature, GeoFeatureCollection } from "../domain/types";
import { useMapHistory } from "./useMapHistory";
import { useMapDrawing } from "./useMapDrawing";

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
  const [allFolders, setAllFolders] = useState<Carpeta[]>([]);
  const [showEntityPicker, setShowEntityPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  // History Undo/Redo
  const {
    history,
    future,
    handleUndo,
    handleRedo,
    saveHistorySnapshot,
    endCurrentAction
  } = useMapHistory(markers, features as unknown as GeoFeatureCollection, setMarkers, setFeatures as unknown as React.Dispatch<React.SetStateAction<GeoFeatureCollection>>, setIsDrawing);
  const mapRef = useRef<MapRef>(null);

  const loadAllEntities = useCallback(async () => {
    try {
      const [entities, folders] = await Promise.all([
        MapUseCase.getAllEntities(Number(projectId)),
        folderService.getByProject(Number(projectId)),
      ]);
      setAllEntities(entities);
      setAllFolders(folders);
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

  const {
    addLinePoint,
    addSprayPoint,
    eraseFeatures,
    addGeometricFeature,
    consolidateGeometricFeature,
    removeFeature,
    handleFloodFill,
  } = useMapDrawing(features as unknown as GeoFeatureCollection, setFeatures as unknown as React.Dispatch<React.SetStateAction<GeoFeatureCollection>>, activeLevelId, brushColor, brushSize);
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
    allFolders,
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
