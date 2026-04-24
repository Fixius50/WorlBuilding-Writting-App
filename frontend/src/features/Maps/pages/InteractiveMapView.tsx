import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import MapLibreView from '../components/MapLibreView';
import MapSearchBox from '../components/MapSearchBox';
import Button from '@atoms/Button';
import { entityService } from '@repositories/entityService';
import { Entidad } from '@domain/models/database';
import { MapMarker, MapLayer, MapConnection, MapAttributes } from '@domain/models/maps';

interface ArchitectContext {
  setRightPanelContent: (content: React.ReactNode) => void;
  setRightOpen: (isOpen: boolean) => void;
  setRightPanelTitle: (title: React.ReactNode) => void;
  setRightPanelTab: (tab: string) => void;
}

const InteractiveMapView: React.FC<{
  map: Entidad;
  onBack?: () => void;
  setRightOpen?: (isOpen: boolean) => void;
  setRightPanelContent?: (content: React.ReactNode) => void;
  setRightPanelTitle?: (title: React.ReactNode) => void;
  setRightPanelTab?: (tab: string) => void;
}> = ({ map, onBack, setRightOpen: propSetRightOpen, setRightPanelContent: propSetContent, setRightPanelTitle: propSetTitle, setRightPanelTab: propSetTab }) => {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [availableEntities, setAvailableEntities] = useState<Entidad[]>([]);
  
  // Lógica de filtros del Atlas
  const [atlasFilters, setAtlasFilters] = useState({
    cities: true,
    ruins: true,
    events: true
  });
  const [searchQuery, setSearchQuery] = useState('');

  // Intentar outlet context como fallback
  let outletCtx: any = {};
  try { outletCtx = useOutletContext<ArchitectContext>() || {}; } catch {}

  const setRightPanelContentRef = useRef<(c: React.ReactNode) => void>(() => {});
  const setRightOpenRef = useRef<(o: boolean) => void>(() => {});
  const setRightPanelTitleRef = useRef<(t: React.ReactNode) => void>(() => {});
  const setRightPanelTabRef = useRef<(t: string) => void>(() => {});

  setRightPanelContentRef.current = propSetContent ?? outletCtx.setRightPanelContent ?? (() => {});
  setRightOpenRef.current = propSetRightOpen ?? outletCtx.setRightOpen ?? (() => {});
  setRightPanelTitleRef.current = propSetTitle ?? outletCtx.setRightPanelTitle ?? (() => {});
  setRightPanelTabRef.current = propSetTab ?? outletCtx.setRightPanelTab ?? (() => {});

  useEffect(() => {
    if (!map.project_id) return;
    entityService.getAllByProject(map.project_id).then(entities => {
      setAvailableEntities(entities.filter(e => e.tipo !== 'Map' && e.tipo !== 'Mapa'));
    });
  }, [map.project_id]);

  useEffect(() => {
    return () => {
      setRightPanelContentRef.current(null);
    };
  }, []);

  const mapAttributes = useMemo<MapAttributes>(() => {
    try {
      return typeof map?.contenido_json === 'string'
        ? JSON.parse(map.contenido_json)
        : (map?.contenido_json as unknown as MapAttributes) || {};
    } catch {
      return {} as MapAttributes;
    }
  }, [map.contenido_json]);

  // Filtrado de marcadores basado en atlasFilters
  const markers = useMemo<MapMarker[]>(() => {
    const rawMarkers = mapAttributes.markers || [];
    return rawMarkers.filter(m => {
        // Lógica de filtrado por categoría (simulada por ahora con lat/lng pares/impares si no hay tags)
        if (!atlasFilters.cities && (m.label?.includes('Ciudad') || Number(m.id) % 3 === 0)) return false;
        if (!atlasFilters.ruins && (m.label?.includes('Ruinas') || Number(m.id) % 5 === 0)) return false;
        return true;
    });
  }, [mapAttributes.markers, atlasFilters]);

  const layers = useMemo<MapLayer[]>(() => mapAttributes.layers || [], [mapAttributes]);
  const connections = useMemo<MapConnection[]>(() => mapAttributes.connections || [], [mapAttributes]);
  const features = useMemo(() => mapAttributes.features || { type: 'FeatureCollection', features: [] }, [mapAttributes]);
  const imageWidth = useMemo(() => (mapAttributes.imageWidth as number) || 1920, [mapAttributes]);
  const imageHeight = useMemo(() => (mapAttributes.imageHeight as number) || 1080, [mapAttributes]);
  const is3D = useMemo(() => !!mapAttributes.is3D, [mapAttributes]);

  const mapImage = useMemo(() => {
    const img = (mapAttributes.bgImage || mapAttributes.snapshotUrl || null) as string | null;
    if (img && (
      img.toLowerCase().includes('duckdns') ||
      img.toLowerCase().includes('nopreview') ||
      img === 'placeholder-map.png'
    )) return null;
    return img;
  }, [mapAttributes]);

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedMarker(marker);
    setRightOpenRef.current(true);
    setRightPanelTabRef.current('CONTEXT');
  }, []);

  useEffect(() => {
    setRightPanelTitleRef.current(
      <div className="flex flex-col">
        <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none mb-1">Visionador</span>
        <span className="text-foreground font-serif font-black text-lg truncate">{map.nombre}</span>
      </div>
    );

    if (selectedMarker) {
      const linkedEntity = selectedMarker.entityId
        ? availableEntities.find(e => e.id === Number(selectedMarker.entityId))
        : null;

      let entityImgUrl = '';
      if (linkedEntity) {
        try {
          const attrs = typeof linkedEntity.contenido_json === 'string'
            ? JSON.parse(linkedEntity.contenido_json)
            : (linkedEntity.contenido_json || {});
          entityImgUrl = attrs.imageUrl || attrs.image || attrs.avatar || '';
        } catch {}
      }

      setRightPanelContentRef.current(
        <div className="flex flex-col h-full p-6 gap-6 overflow-y-auto custom-scrollbar animate-in slide-in-from-right-4 duration-300">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-foreground">{selectedMarker.label || 'Marcador'}</h3>
            <button
              onClick={() => setSelectedMarker(null)}
              className="size-8 flex items-center justify-center text-foreground/40 hover:text-foreground transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>

          {entityImgUrl && (
            <div className="aspect-video rounded-none overflow-hidden border border-foreground/10">
              <img src={entityImgUrl} alt={linkedEntity?.nombre} className="w-full h-full object-cover" />
            </div>
          )}

          {selectedMarker.description && (
            <p className="text-xs text-foreground/60 leading-relaxed">{selectedMarker.description}</p>
          )}

          {linkedEntity && (
            <div className="p-4 bg-foreground/5 border border-foreground/10">
              <div className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mb-2">Entidad vinculada</div>
              <div className="font-bold text-foreground">{linkedEntity.nombre}</div>
              <div className="text-[10px] text-foreground/40 uppercase">{linkedEntity.tipo}</div>
            </div>
          )}

          <div className="text-[9px] font-mono text-foreground/30">
            Lat: {selectedMarker.lat?.toFixed(4)} · Lng: {selectedMarker.lng?.toFixed(4)}
          </div>
        </div>
      );
    } else {
      const visibleLayers = layers.filter((l: MapLayer) => l.visible !== false);

      setRightPanelContentRef.current(
        <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 bg-foreground/5 border border-foreground/10 text-center">
              <div className="text-2xl font-black text-foreground">{markers.length}</div>
              <div className="text-[9px] text-foreground/40 uppercase font-black tracking-widest">Marcadores</div>
            </div>
            <div className="p-4 bg-foreground/5 border border-foreground/10 text-center">
              <div className="text-2xl font-black text-foreground">{visibleLayers.length}</div>
              <div className="text-[9px] text-foreground/40 uppercase font-black tracking-widest">Capas activas</div>
            </div>
          </div>

          {markers.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-3">Puntos de Interés</h4>
              <div className="space-y-2">
                {markers.map((m: MapMarker) => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMarker(m);
                      setRightOpenRef.current(true);
                      setRightPanelTabRef.current('CONTEXT');
                    }}
                    className="w-full flex items-center gap-3 p-3 bg-foreground/5 hover:bg-primary/10 border border-foreground/5 hover:border-primary/20 transition-all text-left"
                  >
                    <span className="size-2 bg-primary rounded-full flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-foreground truncate">{m.label || 'Sin nombre'}</div>
                      {m.description && <div className="text-[9px] text-foreground/40 truncate">{m.description}</div>}
                    </div>
                    <span className="material-symbols-outlined text-sm text-foreground/20">chevron_right</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {onBack && (
            <div className="pt-4 border-t border-foreground/10 mt-auto">
              <Button
                variant="ghost"
                className="w-full justify-center py-3 text-[10px] font-black uppercase tracking-widest"
                icon="arrow_back"
                onClick={onBack}
              >
                Volver al Atlas
              </Button>
            </div>
          )}
        </div>
      );
    }
  }, [selectedMarker, map.nombre, markers, layers, availableEntities, onBack]);

  return (
    <div className="flex-1 flex overflow-hidden bg-background relative">
      <main className="flex-1 overflow-hidden relative">
        <MapSearchBox 
            onSearch={setSearchQuery}
            onFilterChange={setAtlasFilters}
            filters={atlasFilters}
            availableMarkers={markers.map(m => ({ label: m.label || '?', lat: m.lat || 0, lng: m.lng || 0 }))}
        />

        {mapImage ? (
          <MapLibreView
            mapImage={mapImage}
            markers={markers}
            layers={layers}
            connections={connections}
            features={features}
            onMarkerClick={handleMarkerClick}
            onMapClick={() => {}}
            imageWidth={imageWidth}
            imageHeight={imageHeight}
            is3D={is3D}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/60">
            <div className="text-center space-y-4">
              <span className="material-symbols-outlined text-6xl opacity-20 text-primary">cloud_off</span>
              <h3 className="text-xl font-black uppercase text-foreground">Sin Cartografía Base</h3>
               {onBack && (
                <button onClick={onBack} className="mt-6 px-6 py-3 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-[10px] font-black uppercase tracking-widest transition-colors">
                  ← Volver al Atlas
                </button>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default InteractiveMapView;
