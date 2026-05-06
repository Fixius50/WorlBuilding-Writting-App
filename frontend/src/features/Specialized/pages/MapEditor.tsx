import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Map, NavigationControl, Source, Layer, Marker, Popup, MapRef, MapMouseEvent } from 'react-map-gl/maplibre';
// @ts-ignore
import 'maplibre-gl/dist/maplibre-gl.css';
import { entityService } from '@repositories/entityService';
import { Entidad } from '@domain/models/database';
import { MapMarker, MapLayer, MapAttributes } from '@domain/models/maps';
import MonolithicPanel from '@atoms/MonolithicPanel';
import Button from '@atoms/Button';
import { useRightPanelStore } from '@store/useRightPanelStore';

type GeoFeatureCollection = {
  type: 'FeatureCollection';
  features: GeoFeature[];
};

type GeoFeature = {
  id?: string | number;
  type: 'Feature';
  geometry: { type: string; coordinates: unknown };
  properties?: Record<string, unknown>;
};

const DEFAULT_LAYERS: MapLayer[] = [
  { id: 'base', name: 'Mapa Base', visible: true, opacity: 1, type: 'image', url: '' },
  { id: 'clima', name: 'Clima', visible: true, opacity: 0.8, type: 'spray', color: '#10b981' },
  { id: 'fronteras', name: 'Fronteras', visible: true, opacity: 1.0, type: 'vector', color: '#ef4444' },
];

const INITIAL_VIEW_STATE = { longitude: 0, latitude: 0, zoom: 1 };

interface MapEditorProps {
  mode?: 'create' | 'edit';
  entityId?: string;
  folderId?: string;
  onBack?: () => void;
  onSave?: () => Promise<void>;
}

type DrawMode = 'none' | 'spray' | 'line' | 'marker' | 'eraser';

const DRAW_MODE_LABELS: Record<DrawMode, string> = {
  none: 'Navegar',
  marker: 'Marcador',
  line: 'Trayecto',
  spray: 'Spray',
  eraser: 'Borrador',
};
const DRAW_MODE_ICONS: Record<DrawMode, string> = {
  none: 'pan_tool',
  marker: 'location_on',
  line: 'draw',
  spray: 'brush',
  eraser: 'ink_eraser',
};

const MapEditor: React.FC<MapEditorProps> = ({ mode = 'edit', entityId: propEntityId, folderId: propFolderId, onSave }) => {
  const navigate = useNavigate();
  const { entityId: urlEntityId, folderId: urlFolderId } = useParams();
  const entityId = propEntityId || urlEntityId;
  const initialFolderId = propFolderId || urlFolderId;

  const [mapEntity, setMapEntity] = useState<Entidad | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [layers, setLayers] = useState<MapLayer[]>(DEFAULT_LAYERS);
  const [selectedLayerId, setSelectedLayerId] = useState<string>(DEFAULT_LAYERS[1].id);
  const [features, setFeatures] = useState<GeoFeatureCollection>({ type: 'FeatureCollection', features: [] });
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [targetFolderId, setTargetFolderId] = useState<number | null>(initialFolderId ? Number(initialFolderId) : null);
  const [drawMode, setDrawMode] = useState<DrawMode>('none');
  const [isDrawing, setIsDrawing] = useState(false);
  const [spacebarPanning, setSpacebarPanning] = useState(false); 
  const [mapBgColor, setMapBgColor] = useState('#0f0f12');
  const [is3D, setIs3D] = useState(false); 
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [lineContinuous, setLineContinuous] = useState(true);
  const [eraserPoint, setEraserPoint] = useState<{ lng: number; lat: number } | null>(null);
  const [allEntities, setAllEntities] = useState<Entidad[]>([]);
  const [showEntityPicker, setShowEntityPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkingMarkerId, setLinkingMarkerId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const [history, setHistory] = useState<{ markers: MapMarker[]; features: GeoFeatureCollection }[]>([]);
  const [future, setFuture] = useState<{ markers: MapMarker[]; features: GeoFeatureCollection }[]>([]);
  const historyRef = useRef<{ markers: MapMarker[]; features: GeoFeatureCollection }[]>([]);
  const futureRef = useRef<{ markers: MapMarker[]; features: GeoFeatureCollection }[]>([]);
  const actionSavedRef = useRef(false);

  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  const [processingLayers, setProcessingLayers] = useState<Set<string>>(new Set());
  const [errorLayers, setErrorLayers] = useState<Set<string>>(new Set());

  const { openPanel, setCustomContent, closePanel } = useRightPanelStore();
  const outletCtx = (useOutletContext<{ projectId?: number } | null>() || {}) as { projectId?: number };
  const { projectId } = outletCtx;

  const mapRef = useRef<MapRef>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const getHistorySnapshot = useCallback(() => ({
    markers: JSON.parse(JSON.stringify(markers)),
    features: JSON.parse(JSON.stringify(features)),
  }), [markers, features]);

  const pushHistory = useCallback((snapshot: { markers: MapMarker[]; features: GeoFeatureCollection }) => {
    setHistory(prev => {
      const next = [...prev, snapshot];
      historyRef.current = next;
      return next;
    });
    setFuture([]);
    futureRef.current = [];
  }, []);

  const restoreSnapshot = useCallback((snapshot: { markers: MapMarker[]; features: GeoFeatureCollection }) => {
    setMarkers(snapshot.markers);
    setFeatures(snapshot.features);
  }, []);

  const handleUndo = useCallback(() => {
    const currentHistory = historyRef.current;
    if (currentHistory.length === 0) return;
    const lastSnapshot = currentHistory[currentHistory.length - 1];
    const currentSnapshot = getHistorySnapshot();

    setHistory(prev => {
      const next = prev.slice(0, -1);
      historyRef.current = next;
      return next;
    });
    setFuture(prev => {
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

    setFuture(prev => {
      const next = prev.slice(1);
      futureRef.current = next;
      return next;
    });
    setHistory(prev => {
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

  useEffect(() => {
    endCurrentAction();
    setFeatures((prev: GeoFeatureCollection) => {
      if (!prev.features || prev.features.length === 0) return prev;
      const lastIdx = prev.features.length - 1;
      const last = prev.features[lastIdx];
      const coords = (last?.geometry?.coordinates as unknown[]) || [];
      if (last && last.geometry.type === 'LineString' && coords.length < 2) {
        return { ...prev, features: prev.features.slice(0, -1) };
      }
      return prev;
    });
  }, [lineContinuous, endCurrentAction]);

  const resolveImageUrl = async (url: string, layerId: string): Promise<string> => {
    if (!url) return '';
    const cleanUrl = url.toLowerCase().split('?')[0];
    const isSvg = cleanUrl.endsWith('.svg') || url.startsWith('data:image/svg+xml');
    
    if (!isSvg) return url;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const width = img.naturalWidth || 2000;
        const height = img.naturalHeight || 1000;
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          try {
            const dataUrl = canvas.toDataURL('image/png');
            resolve(dataUrl);
          } catch (e) {
            resolve(url); 
          }
        } else {
          resolve(url);
        }
      };
      img.onerror = () => {
        setErrorLayers(prev => new Set(prev).add(layerId));
        resolve(url);
      };
      img.src = url;
    });
  };

  useEffect(() => {
    const processImageLayers = async () => {
      const imageLayers = layers.filter(l => (l.type === 'base' || l.type === 'image') && l.url);
      
      for (const layer of imageLayers) {
        const cleanUrl = layer.url?.toLowerCase().split('?')[0] || '';
        const isSvg = cleanUrl.endsWith('.svg') || layer.url?.startsWith('data:image/svg+xml');
        const currentResolved = resolvedUrls[layer.id];
        const needsProcess = isSvg && (!currentResolved || (layer.url !== currentResolved && !currentResolved.startsWith('data:image/png')));
        
        if (needsProcess && !processingLayers.has(layer.id)) {
          setProcessingLayers(prev => new Set(prev).add(layer.id));
          try {
            const resolved = await resolveImageUrl(layer.url!, layer.id);
            setResolvedUrls(prev => ({ ...prev, [layer.id]: resolved }));
          } catch (e) {
            setErrorLayers(prev => new Set(prev).add(layer.id));
          } finally {
            setProcessingLayers(prev => {
              const next = new Set(prev);
              next.delete(layer.id);
              return next;
            });
          }
        }
      }
    };

    processImageLayers();
  }, [layers]); // Eliminado resolvedUrls de las dependencias para evitar bucle

  useEffect(() => {
    openPanel('bulk', 0, mapEntity?.nombre || 'Editor de Atlas');
    
    const updateBg = () => {
      const style = getComputedStyle(document.body);
      const bgVar = style.getPropertyValue('--background').trim();
      if (bgVar) setMapBgColor(`hsl(${bgVar})`);
    };
    updateBg();
    const observer = new MutationObserver(updateBg);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    const onKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (e.code === 'Space' && !e.repeat && tag !== 'INPUT' && tag !== 'TEXTAREA') {
        e.preventDefault();
        setSpacebarPanning(true);
        endCurrentAction();
        return;
      }

      const isUndo = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z';
      const isRedo = (e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey));
      if (isUndo || isRedo) {
        e.preventDefault();
        if (isUndo) handleUndo(); else handleRedo();
        return;
      }

      if (e.code === 'Escape') setDrawMode('none');
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setSpacebarPanning(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [mapEntity?.nombre]); 

  const loadAllEntities = useCallback(async () => {
    try {
      const entities = await entityService.getAllByProject(Number(projectId));
      setAllEntities(entities);
    } catch { }
  }, [projectId]);

  const loadMap = useCallback(async (id: number) => {
    try {
      const entity = await entityService.getById(id);
      if (entity) {
        setMapEntity(entity);
        setTargetFolderId(entity.carpeta_id);
        const attrs: MapAttributes = typeof entity.contenido_json === 'string'
          ? JSON.parse(entity.contenido_json)
          : (entity.contenido_json || {});
        setMarkers(attrs.markers || []);
        if (attrs.layers && attrs.layers.length > 0) setLayers(attrs.layers);
        if (attrs.features) setFeatures(attrs.features);
        setIs3D(!!attrs.is3D);
        if (attrs.mapSettings) {
          setViewState(prev => ({
            ...prev,
            zoom: attrs.mapSettings?.zoom ?? 1,
            longitude: attrs.mapSettings?.center?.[0] ?? 0,
            latitude: attrs.mapSettings?.center?.[1] ?? 0,
          }));
        }
      }
    } catch { }
  }, []);

  useEffect(() => {
    if (entityId && mode === 'edit') {
      loadMap(Number(entityId));
    } else if (mode === 'create') {
      setMapEntity({
        id: 0, nombre: 'Nuevo Atlas', tipo: 'Map', descripcion: '',
        slug: 'nuevo-atlas', folder_slug: '', imagen_url: '',
        contenido_json: JSON.stringify({ layers: DEFAULT_LAYERS, markers: [], features: { type: 'FeatureCollection', features: [] }, mapSettings: INITIAL_VIEW_STATE, is3D: false }),
        project_id: Number(projectId) || 0, carpeta_id: targetFolderId,
        fecha_creacion: new Date().toISOString(),
        fecha_actualizacion: new Date().toISOString(),
        borrado: 0
      } as Entidad);
      setIs3D(false);
    }
    loadAllEntities();
  }, [entityId, mode, projectId, loadMap, loadAllEntities]);

  const handleSave = useCallback(async () => {
    if (!mapEntity) return;
    try {
      const currentContent = typeof mapEntity.contenido_json === 'string'
        ? JSON.parse(mapEntity.contenido_json)
        : (mapEntity.contenido_json || {});

      const baseImageLayer = layers.find(l => (l.type === 'base' || l.type === 'image') && l.url && l.visible);
      const snapshotUrl = baseImageLayer?.url || currentContent.snapshotUrl || '';

      const updatedContent: MapAttributes = {
        ...currentContent, markers, layers, features, is3D,
        snapshotUrl,
        bgImage: snapshotUrl,
        mapSettings: { zoom: viewState.zoom, center: [viewState.longitude, viewState.latitude] },
        lastEdited: new Date().toISOString()
      };
      if (mode === 'create' || !entityId) {
        await entityService.create({
          nombre: mapEntity.nombre, tipo: 'Map', descripcion: mapEntity.descripcion,
          slug: mapEntity.nombre.toLowerCase().replace(/ /g, '-'),
          folder_slug: '', imagen_url: '',
          project_id: projectId, carpeta_id: targetFolderId, contenido_json: JSON.stringify(updatedContent)
        });
        if (onSave) await onSave(); else navigate(-1);
      } else {
        await entityService.update(Number(entityId), {
          nombre: mapEntity.nombre, carpeta_id: targetFolderId, contenido_json: JSON.stringify(updatedContent)
        });
        if (onSave) await onSave(); else navigate(-1);
      }
    } catch { }
  }, [mapEntity, layers, markers, features, is3D, viewState, mode, entityId, projectId, targetFolderId, onSave, navigate]);

  const handleFileUpload = (layerId: string, file: File) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string;
      setLayers(prev => prev.map(l =>
        l.id === layerId ? { ...l, url: dataUrl, _typeVersion: Date.now() } : l
      ));
    };
    reader.readAsDataURL(file);
  };

  const addSprayPoint = useCallback((lng: number, lat: number) => {
    setFeatures((prev: GeoFeatureCollection) => ({
      ...prev,
      features: [
        ...prev.features,
        {
          type: 'Feature' as const,
          geometry: { type: 'Point', coordinates: [lng, lat] },
          properties: { layerId: selectedLayerId }
        }
      ]
    }));
  }, [selectedLayerId]);

  const eraseFeatures = useCallback((lng: number, lat: number) => {
    if (!mapRef.current) return;
    const map = mapRef.current.getMap();
    const cursorPx = map.project([lng, lat]);
    const radius = brushSize;

    setFeatures((prev: GeoFeatureCollection) => {
      const newFeatures = (prev.features || []).flatMap((f: GeoFeature) => {
        if (f.properties?.layerId !== selectedLayerId) return [f];
        if (f.geometry.type === 'Point') {
          const coords = f.geometry.coordinates as [number, number];
          const featPx = map.project(coords);
          const dist = Math.hypot(cursorPx.x - featPx.x, cursorPx.y - featPx.y);
          return dist > radius ? [f] : [];
        }
        if (f.geometry.type === 'LineString') {
          const segments: GeoFeature[][] = [];
          let currentPart: [number, number][] = [];
          (f.geometry.coordinates as [number, number][]).forEach((coord) => {
            const ptPx = map.project(coord);
            const dist = Math.hypot(cursorPx.x - ptPx.x, cursorPx.y - ptPx.y);
            if (dist > radius) currentPart.push(coord);
            else {
              if (currentPart.length >= 2) segments.push(currentPart.map(c => ({ ...f, id: `${f.id}-seg`, geometry: { ...f.geometry, coordinates: [c] } })));
              currentPart = [];
            }
          });
          if (currentPart.length >= 2) segments.push(currentPart.map(c => ({ ...f, id: `${f.id}-seg2`, geometry: { ...f.geometry, coordinates: [c] } })));
          return segments.flatMap(s => s);
        }
        return [f];
      });
      return { ...prev, features: newFeatures };
    });
  }, [brushSize, selectedLayerId]);

  const addLinePoint = useCallback((lng: number, lat: number, forceNew: boolean = false) => {
    setFeatures((prev: GeoFeatureCollection) => {
      const fts = [...prev.features];
      const lastIdx = fts.length - 1;
      const last = lastIdx >= 0 ? fts[lastIdx] : null;
      const hasCurrentLine = last && last.geometry.type === 'LineString' && last.properties?.layerId === selectedLayerId;
      const shouldAppend = !forceNew && hasCurrentLine;

      if (shouldAppend && last) {
        fts[lastIdx] = {
          ...last,
          geometry: { ...last.geometry, coordinates: [...(last.geometry.coordinates as unknown[]), [lng, lat]] }
        };
      } else {
        fts.push({
          type: 'Feature',
          geometry: { type: 'LineString', coordinates: [[lng, lat]] },
          properties: { layerId: selectedLayerId, timestamp: Date.now() }
        });
      }
      return { ...prev, features: fts };
    });
  }, [selectedLayerId]);

  const mapStyle = React.useMemo(() => ({
    version: 8 as const,
    sources: {},
    layers: [{ id: 'bg', type: 'background' as const, paint: { 'background-color': mapBgColor } }]
  }), [mapBgColor]);

  const renderImageLayers = React.useMemo(() => {
    return layers.filter(l => (l.type === 'base' || l.type === 'image') && l.visible).map(layer => {
      const sourceId = `src-${layer.id}-${layer.type}`;
      const displayUrl = resolvedUrls[layer.id] || layer.url;
      const sourceKey = `${sourceId}-${(layer as unknown)._typeVersion || 0}`;
      if (!displayUrl) return null;
      return (
        <Source
          key={sourceKey}
          id={sourceId}
          type="image"
          url={displayUrl}
          coordinates={[[-180, 85.0511], [180, 85.0511], [180, -85.0511], [-180, -85.0511]]}
        >
          <Layer id={`lay-${layer.id}`} type="raster" paint={{ 'raster-opacity': layer.opacity }} />
        </Source>
      );
    });
  }, [layers, resolvedUrls]);

  const drawableLayers = React.useMemo(() => layers.filter(l => l.type !== 'base' && l.type !== 'image' && l.visible), [layers]);
  const featuresByLayer = React.useMemo(() => {
    const map: Record<string, GeoFeature[]> = {};
    (features.features || []).forEach((f: GeoFeature) => {
      const lid = f.properties?.layerId as string | undefined;
      if (lid) { if (!map[lid]) map[lid] = []; map[lid].push(f); }
    });
    return map;
  }, [features]);

  const renderEraserCursor = React.useMemo(() => {
    if (drawMode !== 'eraser' || !eraserPoint) return null;
    return (
      <Source
        key="eraser-cursor-src"
        id="eraser-cursor-src"
        type="geojson"
        data={{
          type: 'FeatureCollection' as const,
          features: [{ type: 'Feature' as const, geometry: { type: 'Point' as const, coordinates: [eraserPoint.lng, eraserPoint.lat] }, properties: {} }]
        }}
      >
        <Layer
          id="eraser-cursor-layer"
          type="circle"
          paint={{ 'circle-radius': brushSize, 'circle-color': 'rgba(255,255,255,0)', 'circle-stroke-color': 'rgba(255,255,255,0.9)', 'circle-stroke-width': 1, 'circle-stroke-opacity': 0.9 }}
        />
      </Source>
    );
  }, [drawMode, eraserPoint, brushSize]);

  const renderDrawLayers = drawableLayers.map(layer => {
    const layerFeats = featuresByLayer[layer.id] || [];
    const sourceId = `draw-src-${layer.id}`;
    return (
      <Source key={sourceId} id={sourceId} type="geojson" data={{ type: 'FeatureCollection' as const, features: layerFeats as import('geojson').Feature[] }}>
        <Layer id={`draw-line-${layer.id}`} type="line" paint={{ 'line-color': layer.color || '#ef4444', 'line-width': 3, 'line-opacity': layer.opacity ?? 1 }} layout={{ 'line-join': 'round', 'line-cap': 'round' }} filter={['==', '$type', 'LineString']} />
        <Layer id={`draw-point-${layer.id}`} type="circle" paint={{ 'circle-color': layer.color || '#10b981', 'circle-radius': layer.type === 'spray' ? (brushSize / 2) : 4, 'circle-blur': layer.type === 'spray' ? 0.7 : 0, 'circle-opacity': (layer.opacity ?? 1) * 0.85 }} filter={['==', '$type', 'Point']} />
      </Source>
    );
  });

  const onMapClick = useCallback((e: MapMouseEvent) => {
    if (spacebarPanning) return;
    if (e.originalEvent?.button === 2) return;
    if (drawMode === 'none') { setSelectedMarkerId(null); return; }
    e.originalEvent?.preventDefault?.();
    e.originalEvent?.stopPropagation?.();
    const { lng, lat } = e.lngLat;
    if (drawMode === 'marker') {
      saveHistorySnapshot();
      const newId = `m-${Date.now()}`;
      setMarkers(prev => [...prev, { id: newId, lng, lat, label: 'Punto' }]);
      setSelectedMarkerId(newId);
    } else if (drawMode === 'line') {
      saveHistorySnapshot();
      const forceNew = !lineContinuous || (e.originalEvent?.shiftKey ?? false);
      addLinePoint(lng, lat, forceNew);
    }
  }, [drawMode, addLinePoint, saveHistorySnapshot, spacebarPanning, lineContinuous]);

  const onMouseDown = useCallback((e: MapMouseEvent) => {
    if (spacebarPanning) return;
    if (e.originalEvent?.button === 2) return;
    if (drawMode === 'spray' || drawMode === 'line' || drawMode === 'eraser') {
      saveHistorySnapshot();
      setIsDrawing(true);
      e.originalEvent?.preventDefault?.();
      e.originalEvent?.stopPropagation?.();
      const { lng, lat } = e.lngLat;
      if (drawMode === 'spray') addSprayPoint(lng, lat);
      else if (drawMode === 'line') addLinePoint(lng, lat, true);
      else if (drawMode === 'eraser') eraseFeatures(lng, lat);
    }
  }, [drawMode, addSprayPoint, addLinePoint, eraseFeatures, saveHistorySnapshot, spacebarPanning]);

  const onMouseMove = useCallback((e: MapMouseEvent) => {
    if (drawMode === 'eraser') setEraserPoint(e.lngLat);
    if (!isDrawing) return;
    const { lng, lat } = e.lngLat;
    if (drawMode === 'spray') addSprayPoint(lng, lat);
    else if (drawMode === 'line') addLinePoint(lng, lat, false);
    else if (drawMode === 'eraser') eraseFeatures(lng, lat);
  }, [isDrawing, drawMode, addSprayPoint, addLinePoint, eraseFeatures]);

  const onMouseUp = useCallback(() => endCurrentAction(), [endCurrentAction]);

  const renderEntityPickerModal = () => {
    if (!showEntityPicker) return null;
    const filtered = allEntities.filter(e => e.nombre.toLowerCase().includes(searchQuery.toLowerCase()));

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
        <div className="w-full max-w-md monolithic-panel bg-background shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-4 border-b border-foreground/10 bg-background/50 flex justify-between items-center">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
               <span className="material-symbols-outlined text-sm">link</span> Vincular Entidad
            </h3>
            <button onClick={() => setShowEntityPicker(false)} className="material-symbols-outlined text-sm text-foreground/40 hover:text-foreground">close</button>
          </div>
          <div className="p-4 border-b border-foreground/10">
             <input
               type="text"
               placeholder="Buscar entidad..."
               className="w-full bg-foreground/5 border border-foreground/10 p-3 text-xs outline-none focus:border-primary/50 transition-all"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
          </div>
          <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2">
             {filtered.map(ent => (
               <div
                 key={ent.id}
                 onClick={() => {
                   setMarkers(prev => prev.map(m => m.id === linkingMarkerId ? { ...m, entityId: ent.id, label: ent.nombre } : m));
                   setShowEntityPicker(false);
                   setLinkingMarkerId(null);
                 }}
                 className="p-3 hover:bg-primary/10 cursor-pointer transition-all border border-transparent hover:border-primary/20 group flex items-center gap-3"
               >
                 <div className="size-8 bg-foreground/5 flex items-center justify-center text-xs text-foreground/40 group-hover:text-primary">
                    <span className="material-symbols-outlined">description</span>
                 </div>
                 <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground/80">{ent.nombre}</span>
                    <span className="text-[10px] text-foreground/40 uppercase">{ent.tipo}</span>
                 </div>
               </div>
             ))}
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmDelete = () => {
    if (!showConfirmDelete) return null;
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-6 animate-in fade-in duration-300">
        <div className="w-full max-w-xs monolithic-panel bg-background p-6 space-y-6 text-center animate-in zoom-in-95 duration-300">
          <div className="size-12 bg-red-400/10 text-red-400 rounded-full flex items-center justify-center mx-auto">
             <span className="material-symbols-outlined">delete_forever</span>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-black uppercase tracking-widest">¿Eliminar Marcador?</h4>
            <p className="text-[10px] text-foreground/40 leading-relaxed">Esta acción borrará el punto y sus referencias permanentemente.</p>
          </div>
          <div className="flex gap-2">
             <Button variant="ghost" className="flex-1" onClick={() => setShowConfirmDelete(null)}>Cancelar</Button>
             <Button variant="primary" className="flex-1 bg-red-500 hover:bg-red-600 border-red-500/50 shadow-red-500/20" onClick={() => {
               setMarkers(prev => prev.filter(m => m.id !== showConfirmDelete));
               setShowConfirmDelete(null);
               setSelectedMarkerId(null);
             }}>Eliminar</Button>
          </div>
        </div>
      </div>
    );
  };

  const renderSidebar = useCallback(() => {
    return (
      <div className="flex flex-col h-full bg-background/50  p-6 space-y-8 overflow-y-auto custom-scrollbar animate-in slide-in-from-right duration-500">
        <div className="space-y-2">
           <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
             <span className="material-symbols-outlined text-sm">settings</span> Configuración del Atlas
           </h3>
           <input 
             type="text" 
             value={mapEntity?.nombre || ''} 
             onChange={(e) => setMapEntity(prev => prev ? { ...prev, nombre: e.target.value } : null)}
             className="w-full monolithic-panel bg-background/40 p-4 font-serif text-lg font-black text-foreground outline-none focus:border-primary/50"
             placeholder="Nombre del Mapa..."
           />
        </div>

        <MonolithicPanel title="Capas de Información" icon="layers">
          <div className="space-y-2">
            {layers.map(layer => (
              <div key={layer.id} className={`p-3 monolithic-panel flex flex-col gap-3 transition-all ${selectedLayerId === layer.id ? 'border-primary/40 bg-primary/5' : 'bg-background/20 hover:bg-background/40'}`} onClick={() => setSelectedLayerId(layer.id)}>
                <div className="flex items-center gap-3">
                  <button onClick={(e) => { e.stopPropagation(); setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, visible: !l.visible } : l)); }} className={`material-symbols-outlined text-sm ${layer.visible ? 'text-primary' : 'text-foreground/20'}`}>
                    {layer.visible ? 'visibility' : 'visibility_off'}
                  </button>
                  <span className="text-[11px] font-black uppercase tracking-widest flex-1 truncate">{layer.name}</span>
                  {layer.type !== 'base' && (
                    <button onClick={(e) => { e.stopPropagation(); setLayers(prev => prev.filter(l => l.id !== layer.id)); if (selectedLayerId === layer.id) setSelectedLayerId(layers[0].id); }} className="material-symbols-outlined text-xs text-foreground/20 hover:text-red-400">delete</button>
                  )}
                </div>
                {layer.type === 'image' && !layer.url && (
                  <div className="flex flex-col gap-2">
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files?.[0] && handleFileUpload(layer.id, e.target.files[0])} />
                    <Button variant="ghost" icon="upload" className="w-full text-[9px] py-2" onClick={() => fileInputRef.current?.click()}>Subir Cartografía</Button>
                  </div>
                )}
                {selectedLayerId === layer.id && (
                  <div className="pt-2 border-t border-foreground/5 space-y-3 animate-in fade-in slide-in-from-top-1">
                    <div className="flex items-center justify-between">
                       <span className="text-[9px] font-black uppercase text-foreground/40">Opacidad</span>
                       <span className="text-[9px] font-mono text-primary">{Math.round((layer.opacity || 0) * 100)}%</span>
                    </div>
                    <input type="range" min="0" max="1" step="0.01" value={layer.opacity || 0} onChange={(e) => setLayers(prev => prev.map(l => l.id === layer.id ? { ...l, opacity: parseFloat(e.target.value) } : l))} className="w-full accent-primary h-1 bg-foreground/10 rounded-none" />
                  </div>
                )}
              </div>
            ))}
            <Button variant="ghost" icon="add" className="w-full text-[9px] py-2 border-dashed" onClick={() => {
              const newId = `layer-${Date.now()}`;
              setLayers([...layers, { id: newId, name: 'Nueva Capa', visible: true, opacity: 0.8, type: 'vector', color: '#3b82f6' }]);
              setSelectedLayerId(newId);
            }}>Añadir Capa Vectorial</Button>
          </div>
        </MonolithicPanel>

        <div className="space-y-3 pt-6 border-t border-foreground/10">
          <Button variant="primary" className="w-full py-4 font-black tracking-widest" icon="save" onClick={handleSave}>Guardar Atlas</Button>
          <Button variant="ghost" className="w-full py-3" icon="arrow_back" onClick={() => navigate(-1)}>Descartar Cambios</Button>
        </div>
      </div>
    );
  }, [layers, selectedLayerId, mapEntity, handleSave, navigate]);

  useEffect(() => {
    setCustomContent(renderSidebar());
  }, [renderSidebar, setCustomContent]);

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <div className="absolute top-6 left-6 z-[50] flex flex-col gap-4">
        <div className="monolithic-panel p-2 flex flex-col gap-1 bg-background/90 shadow-2xl">
          {(Object.entries(DRAW_MODE_LABELS) as [DrawMode, string][]).map(([m, label]) => (
            <button key={m} onClick={() => setDrawMode(m)} className={`group relative flex items-center gap-3 p-3 transition-all ${drawMode === m ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-foreground/40 hover:bg-foreground/5 hover:text-foreground'}`} title={label}>
              <span className="material-symbols-outlined text-xl">{DRAW_MODE_ICONS[m]}</span>
              {drawMode === m && <span className="text-[10px] font-black uppercase tracking-widest pr-2">{label}</span>}
            </button>
          ))}
        </div>

        <div className="monolithic-panel p-2 flex flex-col gap-1 bg-background/90 shadow-2xl">
           <button onClick={() => setIs3D(!is3D)} className={`p-3 transition-all ${is3D ? 'text-primary' : 'text-foreground/40 hover:text-foreground'}`} title="Modo 3D/Inclinación">
             <span className="material-symbols-outlined text-xl">3d_rotation</span>
           </button>
           <button onClick={handleUndo} disabled={history.length === 0} className="p-3 text-foreground/40 hover:text-foreground disabled:opacity-10 transition-all" title="Deshacer (Ctrl+Z)">
             <span className="material-symbols-outlined text-xl">undo</span>
           </button>
           <button onClick={handleRedo} disabled={future.length === 0} className="p-3 text-foreground/40 hover:text-foreground disabled:opacity-10 transition-all" title="Rehacer (Ctrl+Y)">
             <span className="material-symbols-outlined text-xl">redo</span>
           </button>
        </div>

        {(drawMode === 'spray' || drawMode === 'eraser') && (
           <div className="monolithic-panel p-4 bg-background/90 shadow-2xl w-48 space-y-3 animate-in slide-in-from-left-4">
             <div className="flex justify-between text-[9px] font-black uppercase tracking-widest opacity-40">Tamaño Pincel</div>
             <input type="range" min="2" max="100" value={brushSize} onChange={(e) => setBrushSize(parseInt(e.target.value))} className="w-full h-1 accent-primary bg-foreground/10" />
           </div>
        )}
      </div>

      <main className="flex-1 relative cursor-crosshair">
        <Map
          ref={mapRef}
          {...viewState}
          onMove={e => setViewState(e.viewState)}
          mapStyle={mapStyle}
          onClick={onMapClick}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          dragPan={!isDrawing || spacebarPanning}
          pitch={is3D ? 45 : 0}
          // @ts-ignore - antialias is a valid MapLibre option but missing in some react-map-gl type versions
          antialias={true}
        >
          <NavigationControl position="bottom-right" />
          {renderImageLayers}
          {renderDrawLayers}
          {renderEraserCursor}

          {markers.map(marker => (
            <Marker key={marker.id} longitude={marker.lng ?? 0} latitude={marker.lat ?? 0} anchor="bottom" onClick={(e) => { e.originalEvent.stopPropagation(); setSelectedMarkerId(marker.id); }}>
              <div className={`relative flex flex-col items-center group cursor-pointer transition-transform ${selectedMarkerId === marker.id ? 'scale-125 z-50' : 'hover:scale-110'}`}>
                <div className={`size-6 flex items-center justify-center rounded-full border-2 shadow-2xl transition-all ${selectedMarkerId === marker.id ? 'bg-primary border-white scale-110 shadow-primary/40' : 'bg-background border-primary/40'}`}>
                  <span className={`material-symbols-outlined text-sm ${selectedMarkerId === marker.id ? 'text-white' : 'text-primary'}`}>location_on</span>
                </div>
                <div className={`absolute top-full mt-2 whitespace-nowrap px-2 py-1 monolithic-panel text-[9px] font-black uppercase tracking-widest transition-all ${selectedMarkerId === marker.id ? 'bg-primary text-white border-primary' : 'bg-background/90 text-foreground/60 border-foreground/10 opacity-0 group-hover:opacity-100'}`}>
                  {marker.label}
                </div>
              </div>
            </Marker>
          ))}

          {selectedMarkerId && markers.find(m => m.id === selectedMarkerId) && (
            <Popup longitude={markers.find(m => m.id === selectedMarkerId)?.lng ?? 0} latitude={markers.find(m => m.id === selectedMarkerId)?.lat ?? 0} anchor="top" onClose={() => setSelectedMarkerId(null)} className="monolithic-popup" closeButton={false}>
              <div className="p-4 w-64 bg-background border border-foreground/10 shadow-2xl monolithic-panel">
                <input type="text" value={markers.find(m => m.id === selectedMarkerId)?.label || ''} onChange={(e) => setMarkers(prev => prev.map(m => m.id === selectedMarkerId ? { ...m, label: e.target.value } : m))} className="w-full bg-transparent text-xs font-bold text-foreground outline-none border-b border-foreground/5 mb-3 pb-1" placeholder="Nombre..." />
                <textarea value={markers.find(m => m.id === selectedMarkerId)?.description || ''} onChange={(e) => setMarkers(prev => prev.map(m => m.id === selectedMarkerId ? { ...m, description: e.target.value } : m))} className="w-full bg-transparent text-[10px] text-foreground/60 outline-none h-16 resize-none custom-scrollbar" placeholder="Descripción del lugar..." />
                <div className="flex gap-2 mt-4 pt-3 border-t border-foreground/5">
                   <button onClick={() => { setLinkingMarkerId(selectedMarkerId); setShowEntityPicker(true); }} className="flex-1 flex items-center justify-center gap-2 py-2 bg-primary/10 hover:bg-primary/20 text-primary text-[9px] font-black uppercase tracking-widest transition-all"><span className="material-symbols-outlined text-xs">link</span> Vincular</button>
                   <button onClick={() => setShowConfirmDelete(selectedMarkerId)} className="size-8 flex items-center justify-center bg-red-400/10 hover:bg-red-500/20 text-red-400 transition-all"><span className="material-symbols-outlined text-xs">delete</span></button>
                </div>
              </div>
            </Popup>
          )}
        </Map>
      </main>

      {renderEntityPickerModal()}
      {renderConfirmDelete()}
    </div>
  );
};

export default MapEditor;
