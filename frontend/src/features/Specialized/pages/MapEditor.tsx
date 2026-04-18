import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import Map, { NavigationControl, Source, Layer, Marker, Popup } from 'react-map-gl/maplibre';
// @ts-ignore
import 'maplibre-gl/dist/maplibre-gl.css';
import { entityService } from '@repositories/entityService';
import { Entidad } from '@domain/models/database';
import { MapMarker, MapLayer, MapAttributes } from '@domain/models/maps';
import GlassPanel from '@atoms/GlassPanel';
import Button from '@atoms/Button';

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
  const [features, setFeatures] = useState<any>({ type: 'FeatureCollection', features: [] });
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  const [targetFolderId, setTargetFolderId] = useState<number | null>(initialFolderId ? Number(initialFolderId) : null);
  const [drawMode, setDrawMode] = useState<DrawMode>('none');
  const [isDrawing, setIsDrawing] = useState(false);
  const [spacebarPanning, setSpacebarPanning] = useState(false); // Spacebar temporal pan
  const [mapBgColor, setMapBgColor] = useState('#0f0f12');
  const [is3D, setIs3D] = useState(false); // Flag para renderizado 3D vs 2D
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [brushSize, setBrushSize] = useState(20);
  const [lineContinuous, setLineContinuous] = useState(true);
  const [eraserPoint, setEraserPoint] = useState<{ lng: number; lat: number } | null>(null);
  const [allEntities, setAllEntities] = useState<Entidad[]>([]);
  const [showEntityPicker, setShowEntityPicker] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [linkingMarkerId, setLinkingMarkerId] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState<string | null>(null);

  const [history, setHistory] = useState<{ markers: MapMarker[]; features: any }[]>([]);
  const [future, setFuture] = useState<{ markers: MapMarker[]; features: any }[]>([]);
  const historyRef = useRef<{ markers: MapMarker[]; features: any }[]>([]);
  const futureRef = useRef<{ markers: MapMarker[]; features: any }[]>([]);
  const actionSavedRef = useRef(false);

  const [resolvedUrls, setResolvedUrls] = useState<Record<string, string>>({});
  const [processingLayers, setProcessingLayers] = useState<Set<string>>(new Set());
  const [errorLayers, setErrorLayers] = useState<Set<string>>(new Set());

  const outletCtx = (useOutletContext<any>() || {}) as any;
  const { projectId } = outletCtx;

  // ── Refs para funciones del panel (evitan bucles infinitos de re-render) ──
  const setRightOpenRef = useRef<(o: boolean) => void>(() => {});
  const setRightPanelTabRef = useRef<(t: string) => void>(() => {});
  const setRightPanelContentRef = useRef<(c: React.ReactNode) => void>(() => {});
  setRightOpenRef.current = outletCtx.setRightOpen ?? (() => {});
  setRightPanelTabRef.current = outletCtx.setRightPanelTab ?? (() => {});
  setRightPanelContentRef.current = outletCtx.setRightPanelContent ?? (() => {});

  // Alias para compat con el código existente
  const setRightOpen = useCallback((o: boolean) => setRightOpenRef.current(o), []);
  const setRightPanelTab = useCallback((t: string) => setRightPanelTabRef.current(t), []);
  const setRightPanelContent = useCallback((c: React.ReactNode) => setRightPanelContentRef.current(c), []);

  const mapRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const portalRef = document.getElementById('global-right-panel-portal');

  const getHistorySnapshot = useCallback(() => ({
    markers: JSON.parse(JSON.stringify(markers)),
    features: JSON.parse(JSON.stringify(features)),
  }), [markers, features]);

  const pushHistory = useCallback((snapshot: { markers: MapMarker[]; features: any }) => {
    setHistory(prev => {
      const next = [...prev, snapshot];
      historyRef.current = next;
      return next;
    });
    setFuture([]);
    futureRef.current = [];
  }, []);

  const restoreSnapshot = useCallback((snapshot: { markers: MapMarker[]; features: any }) => {
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

  // ── Cuando cambia el modo de línea, finaliza y descarta la línea actual ─
  useEffect(() => {
    endCurrentAction();
    // Elimina la última línea incompleta si existe
    setFeatures((prev: any) => {
      if (!prev.features || prev.features.length === 0) return prev;
      const lastIdx = prev.features.length - 1;
      const last = prev.features[lastIdx];
      // Si la última es un LineString con menos de 2 puntos, eliminarla
      if (last && last.geometry.type === 'LineString' && last.geometry.coordinates.length < 2) {
        return { ...prev, features: prev.features.slice(0, -1) };
      }
      return prev;
    });
  }, [lineContinuous, endCurrentAction]);

  // ── Utilidad para convertir SVG a PNG (DataURL) ───────────────────────
  const resolveImageUrl = async (url: string, layerId: string): Promise<string> => {
    if (!url) return '';
    const isSvg = url.toLowerCase().includes('.svg') || url.startsWith('data:image/svg+xml');
    
    if (!isSvg) return url;

    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        // Usamos un tamaño base generoso para SVGs, o el tamaño natural
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
            resolve(url); // Fallback al original si hay error de seguridad/CORS
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

  // ── Procesamiento de URLs (SVG → PNG para MapLibre) ───────────────────
  useEffect(() => {
    const processImageLayers = async () => {
      const imageLayers = layers.filter(l => (l.type === 'base' || l.type === 'image') && l.url);
      
      for (const layer of imageLayers) {
        // Solo procesar si es un SVG y no ha sido resuelto aún para esta URL exacta
        const isSvg = layer.url?.toLowerCase().includes('.svg') || layer.url?.startsWith('data:image/svg+xml');
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
  }, [layers, resolvedUrls]); // Escuchamos cambios en capas y el cache

  // ── Detección del color de fondo (tema) ───────────────────────────────
  useEffect(() => {
    // Usar la ref para evitar bucles si el layout se renderiza por el setContent
    setRightPanelContentRef.current(null);
    setRightOpenRef.current(true);
    
    const updateBg = () => {
      const style = getComputedStyle(document.body);
      const bgVar = style.getPropertyValue('--background').trim();
      if (bgVar) setMapBgColor(`hsl(${bgVar})`);
    };
    updateBg();
    const observer = new MutationObserver(updateBg);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    // ── Teclado: espacio para mover y Ctrl+Z / Ctrl+Y para historial ──
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
        if (isUndo) {
          handleUndo();
        } else {
          handleRedo();
        }
        return;
      }

      if (e.code === 'Escape') {
        setDrawMode('none');
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        setSpacebarPanning(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      observer.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, []); // Sin dependencias de funciones ya que usamos refs internas

  const loadAllEntities = useCallback(async () => {
    try {
      const entities = await entityService.getAllByProject(Number(projectId));
      setAllEntities(entities);
    } catch { /* silencioso */ }
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
        if (attrs.layers?.length > 0) setLayers(attrs.layers);
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
    } catch { /* silencioso */ }
  }, []);

  // ── Carga inicial ─────────────────────────────────────────────────────
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
  }, [entityId, mode, projectId, loadMap, loadAllEntities, targetFolderId]);

  // ── Guardar ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!mapEntity) return;
    try {
      const currentContent = typeof mapEntity.contenido_json === 'string'
        ? JSON.parse(mapEntity.contenido_json)
        : (mapEntity.contenido_json || {});

      // Extraer la URL de la imagen base para usarla como preview en el MapManager
      // Se prefiere la URL original (no el DataURL enorme del SVG convertido) para el preview
      const baseImageLayer = layers.find(l => (l.type === 'base' || l.type === 'image') && l.url && l.visible);
      const snapshotUrl = baseImageLayer?.url || currentContent.snapshotUrl || '';

      const updatedContent: MapAttributes = {
        ...currentContent, markers, layers, features, is3D,
        snapshotUrl, // Para la previsualización en MapManager
        bgImage: snapshotUrl, // Campo legado
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
        window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: 'Atlas creado.', type: 'success' } }));
        if (onSave) await onSave(); else navigate(-1);
      } else {
        await entityService.update(Number(entityId), {
          nombre: mapEntity.nombre, carpeta_id: targetFolderId, contenido_json: JSON.stringify(updatedContent)
        });
        window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: 'Atlas guardado.', type: 'success' } }));
        if (onSave) await onSave(); else navigate(-1);
      }
    } catch {
      window.dispatchEvent(new CustomEvent('app-notification', { detail: { message: 'Error al guardar.', type: 'error' } }));
    }
  };

  const handleNavigateToEntity = async (linkedEntityId: number) => {
    // Auto-save antes de irse
    await handleSave();
    navigate(`/biblia/entity/${linkedEntityId}`);
  };

  // ── Modal de Selección de Entidades (Biblia) ────────────────────────
  const renderEntityPickerModal = () => {
    if (!showEntityPicker) return null;

    const filtered = allEntities.filter(e => 
      e.nombre.toLowerCase().includes(searchQuery.toLowerCase()) || 
      e.tipo.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 8);

    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
        <div className="w-full max-w-lg bg-background border border-foreground/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
          <div className="p-6 border-b border-foreground/5 bg-gradient-to-br from-primary/10 to-transparent">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary mb-1">Vincular Entidad</h3>
            <p className="text-xs text-foreground/50">Selecciona un elemento de tu Biblia para este marcador</p>
          </div>

          <div className="p-4 bg-foreground/[0.03]">
            <div className="relative flex items-center">
              <span className="material-symbols-outlined absolute left-3 text-lg text-foreground/30">search</span>
              <input
                autoFocus
                type="text"
                placeholder="Buscar por nombre o tipo..."
                className="w-full bg-background border border-foreground/10 py-3 pl-10 pr-4 text-sm outline-none focus:border-primary/50 transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto p-2 space-y-1 custom-scrollbar">
            {filtered.length > 0 ? filtered.map(entity => (
              <button
                key={entity.id}
                onClick={async () => {
                  if (linkingMarkerId) {
                    const newMarkers = markers.map(m => m.id === linkingMarkerId ? { ...m, label: entity.nombre, entityId: entity.id } : m);
                    setMarkers(newMarkers);
                    setShowEntityPicker(false);
                    setLinkingMarkerId(null);
                    setSearchQuery('');
                    // Auto-guardar tras vincular
                    const updateWithNewMarkers = async () => {
                        if (!mapEntity) return;
                        const currentContent = typeof mapEntity.contenido_json === 'string' ? JSON.parse(mapEntity.contenido_json) : (mapEntity.contenido_json || {});
                        const updatedContent = { ...currentContent, markers: newMarkers, layers, features, lastEdited: new Date().toISOString() };
                        await entityService.update(Number(entityId), { contenido_json: JSON.stringify(updatedContent) });
                    };
                    await updateWithNewMarkers();
                  }
                }}
                className="w-full flex items-center gap-4 p-3 hover:bg-primary/10 border border-transparent hover:border-primary/20 transition-all text-left group"
              >
                <div className="size-10 bg-foreground/5 flex items-center justify-center border border-foreground/5 group-hover:bg-primary/20">
                  <span className="material-symbols-outlined text-foreground/40 group-hover:text-primary transition-colors">
                    {entity.tipo === 'Personaje' ? 'person' : entity.tipo === 'Lugar' ? 'location_on' : 'auto_awesome'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold truncate">{entity.nombre}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-foreground/30">{entity.tipo}</div>
                </div>
                <span className="material-symbols-outlined text-primary opacity-0 group-hover:opacity-100 transition-opacity">add_link</span>
              </button>
            )) : (
              <div className="p-12 text-center text-foreground/30 italic text-xs">
                No se han encontrado entidades con ese nombre...
              </div>
            )}
          </div>

          <div className="p-4 border-t border-foreground/5 flex justify-end">
            <button 
              className="text-[10px] font-bold uppercase tracking-widest px-4 py-2 hover:bg-foreground/5 transition-colors"
              onClick={() => {
                setShowEntityPicker(false);
                setLinkingMarkerId(null);
                setSearchQuery('');
              }}
            >
              Cancelar
            </button>
          </div>
        </div>
      </div>
    );
  };

  const renderConfirmDelete = () => {
    if (!showConfirmDelete) return null;
    return (
      <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-background/60 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="w-80 bg-background border border-red-500/30 p-6 shadow-2xl animate-in zoom-in-95 duration-200">
          <span className="material-symbols-outlined text-4xl text-red-400 mb-4 block text-center">warning</span>
          <h4 className="text-center font-black uppercase tracking-widest text-xs mb-2">¿Eliminar marcador?</h4>
          <p className="text-[10px] text-center text-foreground/50 mb-6 leading-relaxed">Esta acción es irreversible. Se desvinculará cualquier entidad asociada.</p>
          <div className="flex gap-2">
            <button 
              onClick={() => setShowConfirmDelete(null)}
              className="flex-1 py-2 bg-foreground/5 hover:bg-foreground/10 text-[10px] font-black uppercase tracking-widest transition-colors"
            >
              Cancelar
            </button>
            <button 
              onClick={() => {
                saveHistorySnapshot();
                setMarkers(markers.filter(m => m.id !== showConfirmDelete));
                setSelectedMarkerId(null);
                setShowConfirmDelete(null);
              }}
              className="flex-1 py-2 bg-red-400 hover:bg-red-500 text-white text-[10px] font-black uppercase tracking-widest transition-colors shadow-lg shadow-red-500/20"
            >
              Confirmar
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ── Subida de archivo local → Base64 ─────────────────────────────────
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

  // ── Eventos de dibujo ─────────────────────────────────────────────────
  const addSprayPoint = useCallback((lng: number, lat: number) => {
    setFeatures((prev: any) => ({
      ...prev,
      features: [
        ...prev.features,
        {
          type: 'Feature',
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

    setFeatures((prev: any) => {
      const newFeatures = (prev.features || []).filter((f: any) => {
        // Only erase features from the currently selected layer
        if (f.properties?.layerId !== selectedLayerId) return true;

        if (f.geometry.type === 'Point') {
          const featPx = map.project(f.geometry.coordinates);
          const dist = Math.hypot(cursorPx.x - featPx.x, cursorPx.y - featPx.y);
          return dist > radius;
        }

        if (f.geometry.type === 'LineString') {
          // Check if any vertex is within the radius. 
          // (More complex: check distance to segment, but for drawing, vertex-check is often enough if sampling is high)
          const isNear = f.geometry.coordinates.some((coord: [number, number]) => {
            const featPx = map.project(coord);
            const dist = Math.hypot(cursorPx.x - featPx.x, cursorPx.y - featPx.y);
            return dist < radius;
          });
          return !isNear;
        }
        return true;
      });
      return { ...prev, features: newFeatures };
    });
  }, [brushSize, selectedLayerId]);

  const addLinePoint = useCallback((lng: number, lat: number, forceNew: boolean = false) => {
    setFeatures((prev: any) => {
      const fts = [...prev.features];
      const lastIdx = fts.length - 1;
      const last = lastIdx >= 0 ? fts[lastIdx] : null;

      // En separado: click crea nueva (forceNew=true), drag continúa (forceNew=false)
      // En continuo: click y drag continúan con anterior si existe
      const hasCurrentLine = last && last.geometry.type === 'LineString' && last.properties?.layerId === selectedLayerId;
      const shouldAppend = !forceNew && hasCurrentLine;

      if (shouldAppend) {
        // Añadir punto a línea existente
        fts[lastIdx] = {
          ...last,
          geometry: {
            ...last.geometry,
            coordinates: [...last.geometry.coordinates, [lng, lat]]
          }
        };
      } else {
        // Crear nueva línea
        fts.push({
          type: 'Feature',
          geometry: {
            type: 'LineString',
            coordinates: [[lng, lat]]
          },
          properties: { layerId: selectedLayerId, timestamp: Date.now() }
        });
      }
      return { ...prev, features: fts };
    });
  }, [selectedLayerId, lineContinuous]);

  // ── Estabilización de props para el Mapa ───────────────────────────────
  const mapStyle = React.useMemo(() => ({
    version: 8 as const,
    sources: {},
    layers: [{ id: 'bg', type: 'background' as const, paint: { 'background-color': mapBgColor } }]
  }), [mapBgColor]);

  // ── Estabilización de Capas de Imagen ──────────────────────────────────
  const renderImageLayers = React.useMemo(() => {
    return layers.filter(l => (l.type === 'base' || l.type === 'image') && l.visible).map(layer => {
      const sourceId = `src-${layer.id}-${layer.type}`;
      const displayUrl = resolvedUrls[layer.id] || layer.url;
      const sourceKey = `${sourceId}-${(layer as any)._typeVersion || 0}`;

      if (!displayUrl) return null;
      return (
        <Source
          key={sourceKey}
          id={sourceId}
          type="image"
          url={displayUrl}
          coordinates={[[-180, 85.0511], [180, 85.0511], [180, -85.0511], [-180, -85.0511]]}
        >
          <Layer
            id={`lay-${layer.id}`}
            type="raster"
            paint={{ 'raster-opacity': layer.opacity }}
          />
        </Source>
      );
    });
  }, [layers, resolvedUrls]); // Dependencia estable en layers

  // ── Capas de Dibujo con Sources estables (sin recrear en cada punto) ──
  const drawableLayers = React.useMemo(() =>
    layers.filter(l => l.type !== 'base' && l.type !== 'image' && l.visible),
  [layers]);

  const featuresByLayer = React.useMemo(() => {
    const map: Record<string, any[]> = {};
    (features.features || []).forEach((f: any) => {
      const lid = f.properties?.layerId;
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
          paint={{
            'circle-radius': brushSize,
            'circle-color': 'rgba(255,255,255,0)',
            'circle-stroke-color': 'rgba(255,255,255,0.9)',
            'circle-stroke-width': 1,
            'circle-stroke-opacity': 0.9,
          }}
        />
      </Source>
    );
  }, [drawMode, eraserPoint, brushSize]);

  const renderDrawLayers = drawableLayers.map(layer => {
    const layerFeats = featuresByLayer[layer.id] || [];
    const sourceId = `draw-src-${layer.id}`;
    return (
      <Source
        key={sourceId}
        id={sourceId}
        type="geojson"
        data={{ type: 'FeatureCollection' as const, features: layerFeats }}
      >
        <Layer
          id={`draw-line-${layer.id}`}
          type="line"
          paint={{
            'line-color': layer.color || '#ef4444',
            'line-width': 3,
            'line-opacity': layer.opacity ?? 1,
          }}
          layout={{ 'line-join': 'round', 'line-cap': 'round' }}
          filter={['==', '$type', 'LineString']}
        />
        <Layer
          id={`draw-point-${layer.id}`}
          type="circle"
          paint={{
            'circle-color': layer.color || '#10b981',
            'circle-radius': layer.type === 'spray' ? (brushSize / 2) : 4,
            'circle-blur': layer.type === 'spray' ? 0.7 : 0,
            'circle-opacity': (layer.opacity ?? 1) * 0.85,
          }}
          filter={['==', '$type', 'Point']}
        />
      </Source>
    );
  });


  const onMapClick = useCallback((e: any) => {
    if (spacebarPanning) return;
    if (e.originalEvent?.button === 2) return;
    if (drawMode === 'none') {
      setSelectedMarkerId(null);
      return;
    }
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

  const onMouseDown = useCallback((e: any) => {
    if (spacebarPanning) return;
    if (e.originalEvent?.button === 2) return;
    if (drawMode === 'spray' || drawMode === 'line' || drawMode === 'eraser') {
      saveHistorySnapshot();
      setIsDrawing(true);
      e.originalEvent?.preventDefault?.();
      e.originalEvent?.stopPropagation?.();
      const { lng, lat } = e.lngLat;
      if (drawMode === 'spray') {
        addSprayPoint(lng, lat);
      } else if (drawMode === 'line') {
        // Iniciar nueva línea en drag (separado siempre, continuo depende)
        addLinePoint(lng, lat, !lineContinuous);
      } else if (drawMode === 'eraser') {
        eraseFeatures(lng, lat);
      }
      if (drawMode === 'eraser') {
        setEraserPoint({ lng, lat });
      }
    }
  }, [drawMode, addSprayPoint, addLinePoint, eraseFeatures, saveHistorySnapshot, spacebarPanning, lineContinuous]);

  const onMouseUp = useCallback(() => {
    endCurrentAction();
    if (drawMode === 'eraser') setEraserPoint(null);
  }, [drawMode, endCurrentAction]);

  const onMouseMove = useCallback((e: any) => {
    if (spacebarPanning) return;
    if (e.originalEvent?.buttons === 2) return;
    const { lng, lat } = e.lngLat;
    if (drawMode === 'eraser') {
      setEraserPoint({ lng, lat });
    }
    if (!isDrawing) return;
    if (drawMode === 'spray') {
      addSprayPoint(lng, lat);
    } else if (drawMode === 'line') {
      // Durante arrastre, continúa la línea iniciada
      addLinePoint(lng, lat, false);
    } else if (drawMode === 'eraser') {
      eraseFeatures(lng, lat);
    }
  }, [isDrawing, drawMode, addSprayPoint, addLinePoint, eraseFeatures, spacebarPanning]);

  // ── Panel de capas (portal) ───────────────────────────────────────────
  const renderLayerPanel = () => (
    <div className="flex flex-col h-full animate-in slide-in-from-right duration-500">
      {/* Cabecera + herramientas */}
      <div className="p-6 border-b border-foreground/10 bg-gradient-to-br from-primary/10 to-transparent">
        <h2 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-4">
          <span className="material-symbols-outlined text-sm">layers</span> Multicapas
        </h2>
        <div className="flex items-center gap-1 bg-foreground/5 p-1 flex-wrap">
          {(['marker', 'line', 'spray', 'eraser'] as const).map(m => (
            <button
              key={m}
              onClick={() => setDrawMode(m)}
              title={DRAW_MODE_LABELS[m]}
              className={`flex-1 px-2 py-1.5 text-[9px] transition-all font-bold uppercase tracking-widest flex items-center justify-center gap-1 ${
                drawMode === m
                  ? 'bg-primary text-white shadow'
                  : 'text-foreground/60 hover:text-foreground hover:bg-foreground/10'
              }`}
            >
              <span className="material-symbols-outlined text-xs">{DRAW_MODE_ICONS[m]}</span>
              {DRAW_MODE_LABELS[m]}
            </button>
          ))}
        </div>
        {drawMode !== 'none' && (
          <div className="space-y-3">
            <p className="text-[9px] text-foreground/40 mt-2 text-center">
              {drawMode === 'spray' ? 'Mantén pulsado y arrastra para pintar' : 
               drawMode === 'eraser' ? 'Arrastra para borrar trazos y puntos' :
               drawMode === 'line' ? 'Haz clic para añadir puntos. Shift+clic para nueva línea' : 
               'Haz clic en el mapa para colocar'}
            </p>
          </div>
        )}
        
        {/* Brush Size Slider */}
        {(drawMode === 'spray' || drawMode === 'eraser') && (
          <div className="mt-4 p-3 bg-foreground/[0.03] border border-foreground/5 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Tamaño del Pincel</span>
              <span className="text-[9px] font-mono text-primary font-bold">{brushSize}px</span>
            </div>
            <input 
              type="range" min="2" max="100" 
              value={brushSize}
              onChange={(e) => setBrushSize(Number(e.target.value))}
              className="w-full accent-primary h-1"
            />
          </div>
        )}
      </div>

      {/* Lista de capas */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-foreground/50">Capas</span>
          <button
            onClick={() => {
              const newLayer: MapLayer = { id: `l-${Date.now()}`, name: 'Nueva Capa', visible: true, opacity: 0.8, type: 'spray', color: '#ffb020' };
              setLayers(prev => [...prev, newLayer]);
              setSelectedLayerId(newLayer.id);
            }}
            className="size-6 flex items-center justify-center border border-primary/30 text-primary hover:bg-primary/20 transition-colors"
          >
            <span className="material-symbols-outlined text-xs">add</span>
          </button>
        </div>

        {layers.map(layer => (
          <div
            key={layer.id}
            onClick={() => setSelectedLayerId(layer.id)}
            className={`p-4 border space-y-3 transition-all cursor-pointer ${
              selectedLayerId === layer.id
                ? 'bg-primary/10 border-primary/50 shadow-sm shadow-primary/20'
                : 'bg-background hover:bg-foreground/5 border-foreground/10'
            }`}
          >
            {/* Fila 1: visible + nombre + eliminar */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={layer.visible}
                onChange={(e) => { e.stopPropagation(); setLayers(layers.map(l => l.id === layer.id ? { ...l, visible: e.target.checked } : l)); }}
                className="accent-primary size-4"
              />
              <input
                type="text"
                className="text-sm font-bold bg-transparent border-none text-foreground outline-none flex-1 truncate"
                value={layer.name}
                onChange={(e) => setLayers(layers.map(l => l.id === layer.id ? { ...l, name: e.target.value } : l))}
                onClick={(e) => e.stopPropagation()}
              />
              <button
                onClick={(e) => { e.stopPropagation(); setLayers(layers.filter(l => l.id !== layer.id)); }}
                className="text-foreground/30 hover:text-red-400 transition-colors"
              >
                <span className="material-symbols-outlined text-xs">close</span>
              </button>
            </div>

            {/* Fila 2: opacidad */}
            <div className="flex items-center gap-2 bg-foreground/5 px-2 py-1.5 border border-foreground/5" onClick={() => setSelectedLayerId(layer.id)}>
              <span className="material-symbols-outlined text-[10px] text-foreground/40">opacity</span>
              <input
                type="range" min="0" max="1" step="0.05"
                value={layer.opacity}
                onChange={(e) => setLayers(layers.map(l => l.id === layer.id ? { ...l, opacity: parseFloat(e.target.value) } : l))}
                className="flex-1 accent-primary h-1"
                onClick={(e) => e.stopPropagation()}
              />
              <span className="text-[9px] text-foreground/40 w-8 text-right">{Math.round(layer.opacity * 100)}%</span>
            </div>

            {/* Fila 3: tipo + color */}
            <div className="flex gap-2" onClick={() => setSelectedLayerId(layer.id)}>
              <select
                value={layer.type}
                onChange={(e) => {
                  const newType = e.target.value;
                  setLayers(layers.map(l => l.id === layer.id ? { ...l, type: newType, _typeVersion: Date.now() } : l));
                  setSelectedLayerId(layer.id);
                }}
                className="flex-1 bg-background text-foreground border border-foreground/10 text-[10px] font-bold uppercase tracking-widest px-2 py-2 outline-none appearance-none hover:bg-foreground/5 transition-colors"
              >
                <option value="image">Base IMG</option>
                <option value="spray">Spray / Relieve</option>
                <option value="vector">Líneas / Rutas</option>
              </select>
              {layer.type !== 'image' && (
                <input
                  type="color"
                  value={layer.color || '#ffffff'}
                  onChange={(e) => {
                    setLayers(layers.map(l => l.id === layer.id ? { ...l, color: e.target.value } : l));
                    setSelectedLayerId(layer.id);
                  }}
                  className="h-8 w-10 p-0.5 border border-foreground/10 rounded-none bg-background cursor-pointer"
                />
              )}
            </div>

            {/* Fila 3b: Modo línea (solo para vector) */}
            {layer.type === 'vector' && drawMode === 'line' && selectedLayerId === layer.id && (
              <div className="flex items-center justify-center gap-2 text-[9px] p-2 border border-foreground/5 bg-foreground/[0.02]">
                <span className="uppercase tracking-[0.2em] text-foreground/40">Línea</span>
                <button
                  onClick={() => setLineContinuous(prev => !prev)}
                  className={`rounded-full px-2 py-1 border text-[9px] font-black uppercase tracking-[0.15em] transition-all ${lineContinuous ? 'border-primary bg-primary text-white' : 'border-foreground/20 bg-background text-foreground'}`}
                >
                  {lineContinuous ? 'Continuo' : 'Separado'}
                </button>
              </div>
            )}

            {/* Fila 4: imagen (URL + subida local) */}
            {layer.type === 'image' && (
              <div className="space-y-1.5" onClick={() => setSelectedLayerId(layer.id)}>
                <div className="flex gap-1.5">
                  <input
                    type="text"
                    placeholder="https://… URL de imagen"
                    className="flex-1 border border-foreground/10 px-2 py-1.5 text-[10px] text-foreground font-mono focus:border-primary/50 outline-none transition-colors bg-background"
                    value={layer.url?.startsWith('data:') ? '' : (layer.url || '')}
                    onChange={(e) => setLayers(layers.map(l =>
                      l.id === layer.id ? { ...l, url: e.target.value, _typeVersion: Date.now() } : l
                    ))}
                  />
                  {/* Botón subida local */}
                  <button
                    onClick={() => {
                      if (fileInputRef.current) {
                        fileInputRef.current.dataset.layerid = layer.id;
                        fileInputRef.current.click();
                      }
                    }}
                    className="px-2 py-1.5 border border-foreground/10 text-foreground/60 hover:text-primary hover:border-primary/50 transition-colors"
                    title="Subir desde dispositivo"
                  >
                    <span className="material-symbols-outlined text-sm">upload_file</span>
                  </button>
                </div>
                {processingLayers.has(layer.id) && (
                  <p className="text-[9px] text-primary animate-pulse flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[10px] animate-spin">sync</span>
                    Procesando imagen...
                  </p>
                )}
                {errorLayers.has(layer.id) && (
                  <p className="text-[9px] text-red-400 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[10px]">warning</span>
                    Error al cargar imagen (CORS o URL inválida)
                  </p>
                )}
                {layer.url?.startsWith('data:') && !processingLayers.has(layer.id) && (
                  <p className="text-[9px] text-primary/70 flex items-center gap-1 mt-1">
                    <span className="material-symbols-outlined text-[10px]">check_circle</span>
                    Imagen local/procesada lista
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pie: acciones */}
      <div className="p-4 border-t border-foreground/10 space-y-2 bg-foreground/[0.02]">
        <Button
          variant="primary"
          className="w-full justify-center py-3 shadow-lg shadow-primary/20 font-black tracking-widest text-[10px] uppercase"
          onClick={handleSave}
        >
          <span className="material-symbols-outlined text-sm mr-2">save</span>
          Guardar Atlas
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-center py-2 text-foreground/50 hover:text-red-400 hover:bg-red-400/10 text-[10px] font-bold uppercase tracking-widest"
          onClick={() => setFeatures({ type: 'FeatureCollection', features: [] })}
        >
          <span className="material-symbols-outlined text-sm mr-1">delete_sweep</span>
          Limpiar Dibujo
        </Button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full w-full bg-background text-foreground overflow-hidden">
      {/* Input de archivo oculto (global) */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const layerId = fileInputRef.current?.dataset.layerid;
          if (file && layerId) handleFileUpload(layerId, file);
          // Reset para permitir subir el mismo archivo dos veces
          if (fileInputRef.current) fileInputRef.current.value = '';
        }}
      />

      <main className="flex-1 relative flex overflow-hidden">
        <div className="flex-1 relative">
          <Map
            ref={mapRef}
            {...viewState}
            onMove={(evt: any) => setViewState(evt.viewState)}
            mapStyle={mapStyle}
            projection={is3D ? { name: 'globe' } as any : undefined}
            renderWorldCopies={is3D}
            onClick={onMapClick}
            onMouseDown={onMouseDown}
            onMouseUp={onMouseUp}
            onMouseMove={onMouseMove}
            onMouseLeave={onMouseUp}
            onContextMenu={(e: any) => {
              e.originalEvent?.preventDefault?.();
              e.originalEvent?.stopPropagation?.();
            }}
            dragPan={drawMode === 'none' || drawMode === 'marker' || spacebarPanning}
            cursor={
              spacebarPanning ? 'grab' :
              drawMode === 'line' ? 'crosshair' :
              drawMode === 'spray' ? 'cell' :
              drawMode === 'eraser' ? 'crosshair' :
              drawMode === 'marker' ? 'copy' :
              'grab'
            }
          >
            <NavigationControl showCompass={false} />

            {renderImageLayers}
            {renderDrawLayers}
            {renderEraserCursor}

            {markers.map(m => (
              <Marker key={m.id} longitude={m.lng || 0} latitude={m.lat || 0}>
                <div
                  className={`size-6 border-2 border-white rounded-full shadow-lg hover:scale-125 transition-all cursor-pointer flex items-center justify-center ${
                    selectedMarkerId === m.id ? 'bg-white text-primary ring-4 ring-primary/30' : 'bg-primary text-white'
                  }`}
                  title={m.label || 'Marcador'}
                  onClick={(e) => { 
                    e.stopPropagation(); 
                    if (e.shiftKey) {
                      saveHistorySnapshot();
                      setMarkers(markers.filter(mx => mx.id !== m.id));
                      setSelectedMarkerId(null);
                    } else {
                      setSelectedMarkerId(m.id);
                    }
                  }}
                >
                  <span className="material-symbols-outlined text-[14px]">
                    {m.label === 'Ciudad' ? 'location_city' : m.label === 'Punto' ? 'push_pin' : 'location_on'}
                  </span>
                </div>
              </Marker>
            ))}

            {/* Popup del marcador seleccionado */}
            {selectedMarkerId && (
              (() => {
                const marker = markers.find(m => m.id === selectedMarkerId);
                if (!marker) return null;
                const linkedEntity = allEntities.find(e => e.id === Number((marker as any).entityId) || e.nombre === marker.label);
                
                // Extraer imagen del contenido_json de la entidad si existe
                let entityImage = '';
                if (linkedEntity?.contenido_json) {
                  try {
                    const ctx = JSON.parse(linkedEntity.contenido_json);
                    entityImage = ctx.image_url || ctx.imageUrl || '';
                  } catch { /* ignored */ }
                }

                return (
                  <Popup
                    longitude={marker.lng}
                    latitude={marker.lat}
                    anchor="bottom"
                    closeButton={false}
                    closeOnClick={true}
                    onClose={() => setSelectedMarkerId(null)}
                    className="map-zen-popup"
                    maxWidth="280px"
                    offset={15}
                  >
                    <div className="p-0 overflow-hidden bg-background/95 backdrop-blur-md border border-foreground/10 shadow-2xl animate-in zoom-in-95 duration-200">
                      {/* Fondo decorativo (imagen o gradiente) */}
                      <div className="h-20 bg-gradient-to-br from-primary/30 to-background/50 relative flex items-center justify-center overflow-hidden">
                        <span className="material-symbols-outlined text-4xl text-primary/20 scale-150 rotate-12 absolute">
                          {linkedEntity ? 'auto_awesome' : 'map'}
                        </span>
                        {entityImage && (
                          <img src={entityImage} className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
                        )}
                        <h3 className="relative z-10 text-xs font-black uppercase tracking-[0.2em] text-foreground drop-shadow-md px-6 text-center">
                          {marker.label || 'Punto de Interés'}
                        </h3>
                      </div>

                      <div className="p-4 space-y-3">
                        <p className="text-[10px] text-foreground/50 leading-tight italic">
                          {linkedEntity?.descripcion ? (linkedEntity.descripcion.slice(0, 80) + '...') : 'Coordenadas: ' + marker.lng.toFixed(2) + ', ' + marker.lat.toFixed(2)}
                        </p>
                        
                        <div className="flex gap-2">
                          {linkedEntity && (
                            <button
                              onClick={() => handleNavigateToEntity(linkedEntity.id)}
                              className="flex-1 bg-primary hover:bg-primary-hover text-white text-[9px] font-black uppercase py-2 px-3 flex items-center justify-center gap-2 transition-all"
                            >
                              Ver en Biblia <span className="material-symbols-outlined text-xs">arrow_forward</span>
                            </button>
                          )}
                          {!linkedEntity && (
                            <button
                              onClick={() => {
                                setLinkingMarkerId(marker.id);
                                setShowEntityPicker(true);
                              }}
                              className="flex-1 bg-foreground/10 hover:bg-foreground/20 text-foreground text-[9px] font-black uppercase py-2 px-3 transition-all flex items-center justify-center gap-1"
                            >
                              <span className="material-symbols-outlined text-xs">link</span>
                              Vincular Entidad...
                            </button>
                          )}
                        </div>
                      </div>
                      
                      {/* Footer de acciones */}
                      <div className="border-t border-foreground/5 bg-foreground/[0.02] px-4 py-3 flex gap-2 justify-between items-center">
                        <button
                          onClick={() => setShowConfirmDelete(marker.id)}
                          className="bg-red-500/10 hover:bg-red-500/20 text-red-400 text-[8px] font-black uppercase py-1.5 px-3 transition-all flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-[10px]">delete</span>
                          Borrar
                        </button>
                        
                        <div className="flex items-center gap-2">
                          <span className="text-[8px] font-mono text-foreground/20 italic">{marker.lng.toFixed(2)}, {marker.lat.toFixed(2)}</span>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              setLinkingMarkerId(marker.id);
                              setShowEntityPicker(true);
                            }}
                            className="bg-foreground/5 hover:bg-foreground/10 text-[8px] font-black uppercase text-foreground/60 py-1.5 px-3 transition-colors flex items-center gap-1"
                          >
                            <span className="material-symbols-outlined text-[10px]">edit</span>
                            Cambiar
                          </button>
                        </div>
                      </div>
                    </div>
                  </Popup>
                );
              })()
            )}
            
            {/* Empty State */}
            {!layers.some(l => l.type === 'image' && l.url && !l.url.startsWith('error')) && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center space-y-4 opacity-20">
                  <span className="material-symbols-outlined text-8xl">map</span>
                  <p className="text-sm font-black uppercase tracking-[0.5em]">El Atlas está vacío</p>
                </div>
              </div>
            )}
          </Map>
        </div>

        {/* Panel de capas (Portal) */}
        {portalRef && createPortal(renderLayerPanel(), portalRef)}
      </main>

      {/* Modales fuera del Map para evitar conflictos con eventos del canvas */}
      {renderEntityPickerModal()}
      {renderConfirmDelete()}
    </div>
  );
};

export default MapEditor;
