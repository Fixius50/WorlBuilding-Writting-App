import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EntityUseCase } from "@application/EntityUseCase";
import { Entidad } from "@domain/database";
import {
  MapMarker,
  MapLayer,
  MapConnection,
  MapAttributes,
} from "@domain/maps";
import { RelationshipUseCase } from "@application/RelationshipUseCase";

export interface AtlasLevel {
  id: string;
  name: string;
}

export interface AtlasAnnotation {
  id: string;
  levelId: string;
  text: string;
}

export interface AtlasAttributes extends MapAttributes {
  levels?: AtlasLevel[];
  levelOpacities?: Record<string, number>;
  canvasStates?: Record<string, string | null>;
  levelBgImages?: Record<string, string | null>;
  annotations?: AtlasAnnotation[];
  backdropOpacity?: number;
  brushColor?: string;
  brushSize?: number;
  drawTool?: "brush" | "eraser";
  activeLevelId?: string;
}

/**
 * 🧠 useInteractiveMapView
 * Handles marker selection, filtering, drawing canvas cache, level hierarchy, and SQLite persistence.
 */
export const useInteractiveMapView = (map: Entidad, onBack?: () => void) => {
  const { projectName } = useParams();
  const navigate = useNavigate();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [availableEntities, setAvailableEntities] = useState<Entidad[]>([]);
  const [markerCharacters, setMarkerCharacters] = useState<Entidad[]>([]);
  
  // --- Estados del Atlas ---
  const [levels, setLevels] = useState<AtlasLevel[]>([]);
  const [activeLevelId, setActiveLevelId] = useState<string>("");
  const [levelOpacities, setLevelOpacities] = useState<Record<string, number>>({});
  const [canvasStates, setCanvasStates] = useState<Record<string, string | null>>({});
  const [levelBgImages, setLevelBgImages] = useState<Record<string, string | null>>({});
  const [eraserCursor, setEraserCursor] = useState<{ x: number; y: number } | null>(null);
  const [annotations, setAnnotations] = useState<AtlasAnnotation[]>([]);
  const [activeSidebarTab, setActiveSidebarTab] = useState<'levels' | 'notes' | 'info' | null>('levels');
  
  // Ajustes de pincel y calco
  const [backdropOpacity, setBackdropOpacity] = useState<number>(0.4);
  const [brushColor, setBrushColor] = useState<string>("#6e78fa");
  const [brushSize, setBrushSize] = useState<number>(3);
  const [drawTool, setDrawTool] = useState<"brush" | "eraser">("brush");

  // --- Estados de Paneo y Zoom del Canvas Infinito ---
  const initialZoom = useMemo(() => {
    const w = (window.innerWidth || 1024) * 0.96;
    const h = (window.innerHeight || 768) * 0.94;
    return Math.max(0.1, Math.min(1.0, Math.min(w / 1920, h / 1080)));
  }, []);
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [pan, setPan] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const panStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const panOffsetRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const lastSavedDataUrlRef = useRef<string | null>(null);
  const latestContenidoJsonRef = useRef<string>("");

  // Tecla de espacio pulsada para paneo
  const [spacebarPanning, setSpacebarPanning] = useState<boolean>(false);

  // UI States
  const isMap3DDefault = useMemo(() => {
    let baseAttrs: AtlasAttributes = {};
    try {
      baseAttrs = typeof map?.contenido_json === "string"
        ? JSON.parse(map.contenido_json)
        : (map?.contenido_json as unknown as AtlasAttributes) || {};
    } catch {
      baseAttrs = {};
    }
    return !!baseAttrs.is3D;
  }, [map.contenido_json]);

  const [viewMode, setViewMode] = useState<'2D' | '3D'>(isMap3DDefault ? '3D' : '2D');
  const [appMode, setAppMode] = useState<'EDIT' | 'VIEW'>('EDIT');
  const [activeMenu, setActiveMenu] = useState<'brush' | 'upload' | null>(null);
  const [hoveredLevelOpacityId, setHoveredLevelOpacityId] = useState<string | null>(null);

  // CRUD Temp States
  const [editingLevelId, setEditingLevelId] = useState<string | null>(null);
  const [levelInputText, setLevelInputText] = useState<string>('');
  const [newLevelName, setNewLevelName] = useState<string>('');

  const [editingAnnotationId, setEditingAnnotationId] = useState<string | null>(null);
  const [annotationInputText, setAnnotationInputText] = useState<string>('');
  const [annotationInputLevelId, setAnnotationInputLevelId] = useState<string>('');
  const [newAnnotationText, setNewAnnotationText] = useState<string>('');
  const [newAnnotationLevelId, setNewAnnotationLevelId] = useState<string>('l2');

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isDrawingRef = useRef<boolean>(false);

  const [atlasFilters, setAtlasFilters] = useState({
    cities: true,
    ruins: true,
    events: true,
  });
  const [searchQuery, setSearchQuery] = useState("");

  // Carga de Entidades
  useEffect(() => {
    if (map.project_id) {
      EntityUseCase.getAllByProject(map.project_id).then((entities) => {
        setAvailableEntities(
          entities.filter((e) => e.tipo !== "Map" && e.tipo !== "Mapa"),
        );
      });
    }
  }, [map.project_id]);

  // Carga de Personajes vinculados al Marcador
  const loadMarkerCharacters = useCallback(
    async (entityId: number) => {
      try {
        const rels = await RelationshipUseCase.getRelationshipsByEntity(entityId);
        const characterIds = rels.map((r) =>
          r.origen_id === entityId ? r.destino_id : r.origen_id,
        );
        const chars = availableEntities.filter((e) => {
          const isMatched = characterIds.includes(e.id);
          const tipoUpper = e.tipo ? e.tipo.toUpperCase() : "";
          const isChar =
            tipoUpper === "PERSONAJE" ||
            tipoUpper === "INDIVIDUAL" ||
            tipoUpper === "COLECTIVO";
          return isMatched && isChar;
        });
        setMarkerCharacters(chars);
      } catch (e) {
        console.error(e);
      }
    },
    [availableEntities],
  );

  useEffect(() => {
    const isMarkerSelected = !!selectedMarker && !!selectedMarker.entityId;
    switch (isMarkerSelected) {
      case true:
        loadMarkerCharacters(Number(selectedMarker!.entityId));
        break;
      default:
        setMarkerCharacters([]);
        break;
    }
  }, [selectedMarker, loadMarkerCharacters]);

  // --- Parsear Atributos del Mapa desde contenido_json ---
  const mapAttributes = useMemo<AtlasAttributes>(() => {
    let attrs: AtlasAttributes = {};
    try {
      attrs = typeof map?.contenido_json === "string"
        ? JSON.parse(map.contenido_json)
        : (map?.contenido_json as unknown as AtlasAttributes) || {};
    } catch {
      attrs = {};
    }
    return attrs;
  }, [map.contenido_json]);

  const mapImage = useMemo(() => {
    const img = (mapAttributes.bgImage || mapAttributes.snapshotUrl || null) as
      | string
      | null;
    const isMock =
      img &&
      (img.toLowerCase().includes("duckdns") ||
        img.toLowerCase().includes("nopreview") ||
        img === "placeholder-map.png");
    return isMock ? null : img;
  }, [mapAttributes]);

  const [activeImageWidth, setActiveImageWidth] = useState<number>(1920);
  const [activeImageHeight, setActiveImageHeight] = useState<number>(1080);

  const currentImageUrl = useMemo(() => {
    return levelBgImages[activeLevelId] || mapImage || null;
  }, [levelBgImages, activeLevelId, mapImage]);

  useEffect(() => {
    const url = currentImageUrl;
    const hasUrl = !!url;
    switch (hasUrl) {
      case true:
        const img = new Image();
        img.onload = () => {
          setActiveImageWidth(img.naturalWidth || 1920);
          setActiveImageHeight(img.naturalHeight || 1080);
        };
        img.src = url!;
        break;
      default:
        setActiveImageWidth(1920);
        setActiveImageHeight(1080);
        break;
    }
  }, [currentImageUrl]);

  const imageWidth = activeImageWidth;
  const imageHeight = activeImageHeight;

  // --- Sincronizar referencia del contenido JSON ---
  useEffect(() => {
    if (map?.contenido_json) {
      latestContenidoJsonRef.current = typeof map.contenido_json === "string"
        ? map.contenido_json
        : JSON.stringify(map.contenido_json);
    }
  }, [map?.contenido_json]);

  // --- Carga Inicial de Datos de Atlas en los Estados de React ---
  useEffect(() => {
    let baseAttrs: AtlasAttributes = {};
    try {
      baseAttrs = typeof map?.contenido_json === "string"
        ? JSON.parse(map.contenido_json)
        : (map?.contenido_json as unknown as AtlasAttributes) || {};
    } catch {
      baseAttrs = {};
    }

    const initialLevels: AtlasLevel[] = baseAttrs.levels || [
      { id: "l0", name: "Nivel 0: Planta Principal" }
    ];
    const initialActiveLevelId = baseAttrs.activeLevelId || "l0";
    const initialOpacities = baseAttrs.levelOpacities || {
      l0: 1.0
    };
    const initialCanvasStates = baseAttrs.canvasStates || {};
    const initialLevelBgImages = baseAttrs.levelBgImages || {};
    const initialAnnotations = baseAttrs.annotations || [];

    setLevels(initialLevels);
    setActiveLevelId(initialActiveLevelId);
    setLevelOpacities(initialOpacities);
    setCanvasStates(initialCanvasStates);
    setLevelBgImages(initialLevelBgImages);
    setAnnotations(initialAnnotations);

    if (baseAttrs.backdropOpacity !== undefined) {
      setBackdropOpacity(baseAttrs.backdropOpacity);
    }
    if (baseAttrs.brushColor !== undefined) {
      setBrushColor(baseAttrs.brushColor);
    }
    if (baseAttrs.brushSize !== undefined) {
      setBrushSize(baseAttrs.brushSize);
    }
    if (baseAttrs.drawTool !== undefined) {
      setDrawTool(baseAttrs.drawTool);
    }
  }, [map.id]);

  const hasPendingChangesRef = useRef<boolean>(false);

  const updateAtlasCache = useCallback((updates: Partial<AtlasAttributes>) => {
    let baseAttrs: AtlasAttributes = {};
    try {
      baseAttrs = typeof latestContenidoJsonRef.current === "string"
        ? JSON.parse(latestContenidoJsonRef.current)
        : (latestContenidoJsonRef.current as unknown as AtlasAttributes) || {};
    } catch {
      baseAttrs = {};
    }

    const updatedContenido: AtlasAttributes = {
      ...baseAttrs,
      ...updates
    };

    latestContenidoJsonRef.current = JSON.stringify(updatedContenido);
    hasPendingChangesRef.current = true;
  }, []);

  const persistPendingChanges = useCallback(async () => {
    const hasChanges = hasPendingChangesRef.current;
    switch (hasChanges) {
      case true:
        const jsonStr = latestContenidoJsonRef.current;
        hasPendingChangesRef.current = false;
        await EntityUseCase.update(map.id, {
          contenido_json: jsonStr
        });
        break;
      default:
        break;
    }
  }, [map.id]);

  // --- Persistencia Persistente en SQLite ---
  const saveAtlasState = useCallback(async (updates: Partial<AtlasAttributes>) => {
    updateAtlasCache(updates);
    await persistPendingChanges();
  }, [updateAtlasCache, persistPendingChanges]);

  const handleBack = useCallback(async () => {
    await persistPendingChanges();
    const hasBack = !!onBack;
    switch (hasBack) {
      case true:
        onBack!();
        break;
      default:
        navigate(-1);
        break;
    }
  }, [onBack, navigate, persistPendingChanges]);

  // --- Guardar cambios al desmontar o cerrar ---
  useEffect(() => {
    return () => {
      persistPendingChanges();
    };
  }, [persistPendingChanges]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      persistPendingChanges();
    };
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [persistPendingChanges]);

  // --- Eventos de teclado para la barra espaciadora ---
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      const isInput = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.isContentEditable);
      const isSpace = e.code === 'Space' && !e.repeat && !isInput;
      if (isSpace) {
        e.preventDefault();
        setSpacebarPanning(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const isSpace = e.code === 'Space';
      if (isSpace) {
        setSpacebarPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // --- Convertir Coordenadas de Pantalla a Locales del Canvas ---
  const getCanvasCoords = useCallback((clientX: number, clientY: number, rect: DOMRect) => {
    const x = (clientX - rect.left) / zoom;
    const y = (clientY - rect.top) / zoom;
    return { x, y };
  }, [zoom]);

  // --- DIBUJO EN CANVAS 2D (Inicialización y carga del nivel) ---
  useEffect(() => {
    const isEdit2D = viewMode === '2D' && appMode === 'EDIT' && canvasRef.current;
    if (isEdit2D) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;

      const savedState = canvasStates[activeLevelId];
      if (savedState) {
        if (savedState !== lastSavedDataUrlRef.current) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          const img = new Image();
          img.onload = () => {
            ctx.drawImage(img, 0, 0);
          };
          img.src = savedState;
          lastSavedDataUrlRef.current = savedState;
        }
      } else {
        if (lastSavedDataUrlRef.current !== null) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          lastSavedDataUrlRef.current = null;
        }
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }
  }, [viewMode, appMode, activeLevelId, canvasStates]);

  // --- Lógica del Mouse en Dibujo 2D ---
  const handleStartDrawing = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const isLeftClick = e.button === 0;
    const isMiddleClick = e.button === 1;

    if (spacebarPanning || isMiddleClick) {
      setIsPanning(true);
      panStartRef.current = { x: e.clientX, y: e.clientY };
      panOffsetRef.current = { ...pan };
    } else if (appMode === 'EDIT' && isLeftClick) {
      isDrawingRef.current = true;
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const coords = getCanvasCoords(e.clientX, e.clientY, rect);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.beginPath();
          ctx.moveTo(coords.x, coords.y);
        }
      }
    }
  }, [spacebarPanning, pan, appMode, getCanvasCoords]);

  const handleDrawing = useCallback((e: React.MouseEvent<HTMLElement>) => {
    if (isPanning) {
      const dx = e.clientX - panStartRef.current.x;
      const dy = e.clientY - panStartRef.current.y;
      setPan({
        x: panOffsetRef.current.x + dx,
        y: panOffsetRef.current.y + dy
      });
    } else if (isDrawingRef.current && appMode === 'EDIT') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const coords = getCanvasCoords(e.clientX, e.clientY, rect);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineWidth = brushSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          if (drawTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
          } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = brushColor;
          }

          ctx.lineTo(coords.x, coords.y);
          ctx.stroke();
        }
      }
    }

    if (appMode === 'EDIT' && drawTool === 'eraser') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const coords = getCanvasCoords(e.clientX, e.clientY, rect);
        setEraserCursor(coords);
      }
    } else {
      if (eraserCursor !== null) {
        setEraserCursor(null);
      }
    }
  }, [isPanning, appMode, getCanvasCoords, brushSize, drawTool, brushColor, eraserCursor]);

  const handleStopDrawing = useCallback(() => {
    setIsPanning(false);
    setEraserCursor(null);
    if (isDrawingRef.current && canvasRef.current) {
      isDrawingRef.current = false;
      const canvas = canvasRef.current!;
      const dataUrl = canvas.toDataURL();
      
      lastSavedDataUrlRef.current = dataUrl;
      const updatedStates = { ...canvasStates, [activeLevelId]: dataUrl };
      setCanvasStates(updatedStates);
      updateAtlasCache({ canvasStates: updatedStates });
    }
  }, [canvasStates, activeLevelId, updateAtlasCache]);

  // --- Lógica de Toque (Soporte Táctil Completo) ---
  const handleTouchStart = useCallback((e: React.TouchEvent<HTMLElement>) => {
    const isSingleTouch = e.touches.length === 1;
    const isMultiTouch = e.touches.length > 1;

    if (spacebarPanning || isMultiTouch) {
      setIsPanning(true);
      panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      panOffsetRef.current = { ...pan };
    } else if (appMode === 'EDIT' && isSingleTouch) {
      isDrawingRef.current = true;
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const coords = getCanvasCoords(touch.clientX, touch.clientY, rect);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.beginPath();
          ctx.moveTo(coords.x, coords.y);
        }
      }
    }
  }, [spacebarPanning, pan, appMode, getCanvasCoords]);

  const handleTouchMove = useCallback((e: React.TouchEvent<HTMLElement>) => {
    if (isPanning) {
      const touch = e.touches[0];
      const dx = touch.clientX - panStartRef.current.x;
      const dy = touch.clientY - panStartRef.current.y;
      setPan({
        x: panOffsetRef.current.x + dx,
        y: panOffsetRef.current.y + dy
      });
    } else if (isDrawingRef.current && appMode === 'EDIT') {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const coords = getCanvasCoords(touch.clientX, touch.clientY, rect);
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.lineWidth = brushSize;
          ctx.lineCap = 'round';
          ctx.lineJoin = 'round';
          
          if (drawTool === 'eraser') {
            ctx.globalCompositeOperation = 'destination-out';
          } else {
            ctx.globalCompositeOperation = 'source-over';
            ctx.strokeStyle = brushColor;
          }

          ctx.lineTo(coords.x, coords.y);
          ctx.stroke();
        }
      }
    }
  }, [isPanning, appMode, getCanvasCoords, brushSize, drawTool, brushColor]);

  // --- Lógica del Zoom con Rueda del Ratón ---
  const handleWheel = useCallback((e: React.WheelEvent<HTMLDivElement>) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    const isZoomIn = e.deltaY < 0;

    const container = e.currentTarget;
    const containerWidth = container.clientWidth || 800;
    const containerHeight = container.clientHeight || 600;

    const fitZoom = Math.min(containerWidth / imageWidth, containerHeight / imageHeight);
    const minZoom = Math.max(0.1, fitZoom);

    const nextZoom = isZoomIn ? zoom * zoomFactor : zoom / zoomFactor;
    const clampedZoom = Math.max(minZoom, Math.min(5.0, nextZoom));
    setZoom(clampedZoom);
  }, [zoom, imageWidth, imageHeight]);

  // Limpiar lienzo
  const handleClearCanvas = useCallback(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const updatedStates = { ...canvasStates, [activeLevelId]: null };
      setCanvasStates(updatedStates);
      updateAtlasCache({ canvasStates: updatedStates });
    }
  }, [canvasStates, activeLevelId, updateAtlasCache]);

  // Teletransporte
  const handleTeleport = useCallback((levelId: string) => {
    setActiveLevelId(levelId);
    updateAtlasCache({ activeLevelId: levelId });
    persistPendingChanges();
  }, [updateAtlasCache, persistPendingChanges]);

  // --- CRUD NIVELES ---
  const handleAddLevel = useCallback((name: string, position: 'above' | 'below' = 'above') => {
    const trimmed = name.trim();
    if (trimmed) {
      const newId = `l_${Date.now()}`;
      const newLvl: AtlasLevel = { id: newId, name: trimmed };
      
      const nextLevels = position === 'above' 
        ? [newLvl, ...levels] 
        : [...levels, newLvl];
        
      const nextOpacities = { ...levelOpacities, [newId]: 1.0 };
      
      setLevels(nextLevels);
      setLevelOpacities(nextOpacities);
      setActiveLevelId(newId);
      
      updateAtlasCache({
        levels: nextLevels,
        levelOpacities: nextOpacities,
        activeLevelId: newId
      });
      persistPendingChanges();
    }
  }, [levels, levelOpacities, updateAtlasCache, persistPendingChanges]);

  const handleUploadLevelBgImage = useCallback((levelId: string, fileDataUrl: string) => {
    const nextBgImages = { ...levelBgImages, [levelId]: fileDataUrl };
    setLevelBgImages(nextBgImages);
    updateAtlasCache({ levelBgImages: nextBgImages });
    persistPendingChanges();
  }, [levelBgImages, updateAtlasCache, persistPendingChanges]);

  const handleSaveEditLevel = useCallback((id: string, newName: string) => {
    const trimmed = newName.trim();
    if (trimmed) {
      const nextLevels = levels.map((l) =>
        l.id === id ? { ...l, name: trimmed } : l
      );
      setLevels(nextLevels);
      updateAtlasCache({ levels: nextLevels });
      persistPendingChanges();
    }
  }, [levels, updateAtlasCache, persistPendingChanges]);

  const handleDeleteLevel = useCallback((id: string) => {
    const nextLevels = levels.filter((l) => l.id !== id);
    const nextAnnotations = annotations.filter((ann) => ann.levelId !== id);
    setLevels(nextLevels);
    setAnnotations(nextAnnotations);

    let nextActiveLevel = activeLevelId;
    if (activeLevelId === id && nextLevels.length > 0) {
      nextActiveLevel = nextLevels[0].id;
      setActiveLevelId(nextActiveLevel);
    }

    updateAtlasCache({
      levels: nextLevels,
      annotations: nextAnnotations,
      activeLevelId: nextActiveLevel
    });
    persistPendingChanges();
  }, [levels, annotations, activeLevelId, updateAtlasCache, persistPendingChanges]);

  // --- CRUD ANOTACIONES ---
  const handleAddAnnotation = useCallback((text: string, levelId: string) => {
    const trimmed = text.trim();
    if (trimmed) {
      const newAnn: AtlasAnnotation = {
        id: `ann_${Date.now()}`,
        levelId,
        text: trimmed
      };
      const nextAnnotations = [...annotations, newAnn];
      setAnnotations(nextAnnotations);
      updateAtlasCache({ annotations: nextAnnotations });
      persistPendingChanges();
    }
  }, [annotations, updateAtlasCache, persistPendingChanges]);

  const handleSaveEditAnnotation = useCallback((id: string, newText: string, levelId: string) => {
    const trimmed = newText.trim();
    if (trimmed) {
      const nextAnnotations = annotations.map((a) =>
        a.id === id ? { ...a, text: trimmed, levelId } : a
      );
      setAnnotations(nextAnnotations);
      updateAtlasCache({ annotations: nextAnnotations });
      persistPendingChanges();
    }
  }, [annotations, updateAtlasCache, persistPendingChanges]);

  const handleDeleteAnnotation = useCallback((id: string) => {
    const nextAnnotations = annotations.filter((a) => a.id !== id);
    setAnnotations(nextAnnotations);
    updateAtlasCache({ annotations: nextAnnotations });
    persistPendingChanges();
  }, [annotations, updateAtlasCache, persistPendingChanges]);

  // --- Lógica del Canvas Original (Deck.gl / MapLibre) ---
  const markers = useMemo<MapMarker[]>(() => {
    const rawMarkers = mapAttributes.markers || [];
    return rawMarkers.filter((m) => {
      const isFiltered =
        (!atlasFilters.cities && (m.label?.includes("Ciudad") || Number(m.id) % 3 === 0)) ||
        (!atlasFilters.ruins && (m.label?.includes("Ruinas") || Number(m.id) % 5 === 0));
      return !isFiltered;
    });
  }, [mapAttributes.markers, atlasFilters]);

  const layers = useMemo<MapLayer[]>(
    () => mapAttributes.layers || [],
    [mapAttributes],
  );
  const connections = useMemo<MapConnection[]>(
    () => mapAttributes.connections || [],
    [mapAttributes],
  );
  const features = useMemo<unknown>(
    () => mapAttributes.features,
    [mapAttributes],
  );
  const is3D = useMemo(() => !!mapAttributes.is3D, [mapAttributes]);

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedMarker(marker);
  }, []);

  return {
    projectName,
    navigate,
    selectedMarker,
    setSelectedMarker,
    availableEntities,
    markerCharacters,
    atlasFilters,
    setAtlasFilters,
    searchQuery,
    setSearchQuery,
    mapAttributes,
    markers,
    layers,
    connections,
    features,
    imageWidth,
    imageHeight,
    is3D,
    mapImage,
    handleMarkerClick,

    // --- Nuevas propiedades de Atlas ---
    levels,
    setLevels,
    activeLevelId,
    setActiveLevelId,
    levelOpacities,
    setLevelOpacities,
    canvasStates,
    setCanvasStates,
    levelBgImages,
    setLevelBgImages,
    eraserCursor,
    handleUploadLevelBgImage,
    annotations,
    setAnnotations,
    backdropOpacity,
    setBackdropOpacity,
    brushColor,
    setBrushColor,
    brushSize,
    setBrushSize,
    drawTool,
    setDrawTool,
    saveAtlasState,
    updateAtlasCache,
    handleBack,
    handleAddLevel,
    handleSaveEditLevel,
    handleDeleteLevel,
    handleAddAnnotation,
    handleSaveEditAnnotation,
    handleDeleteAnnotation,

    // --- Estados y manejadores de interacción movidos al hook ---
    zoom,
    setZoom,
    pan,
    setPan,
    isPanning,
    setIsPanning,
    spacebarPanning,
    setSpacebarPanning,
    viewMode: viewMode as '2D' | '3D',
    setViewMode,
    appMode: appMode as 'EDIT' | 'VIEW',
    setAppMode,
    activeMenu,
    setActiveMenu,
    hoveredLevelOpacityId,
    setHoveredLevelOpacityId,

    // CRUD Temp States
    editingLevelId,
    setEditingLevelId,
    levelInputText,
    setLevelInputText,
    newLevelName,
    setNewLevelName,
    editingAnnotationId,
    setEditingAnnotationId,
    annotationInputText,
    setAnnotationInputText,
    annotationInputLevelId,
    setAnnotationInputLevelId,
    newAnnotationText,
    setNewAnnotationText,
    newAnnotationLevelId,
    setNewAnnotationLevelId,

    // Canvas Refs & Handlers
    canvasRef,
    isDrawingRef,
    handleStartDrawing,
    handleDrawing,
    handleStopDrawing,
    handleTouchStart,
    handleTouchMove,
    handleWheel,
    handleClearCanvas,
    handleTeleport,
    activeSidebarTab,
    setActiveSidebarTab,
  };
};
