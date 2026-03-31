import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import MapLibreView from '../components/MapLibreView';
import Button from '../../../components/common/Button';
import { entityService } from '../../../database/entityService';
import { Entidad } from '../../../database/types';
import { MapMarker, MapLayer, MapConnection, MapAttributes } from '../../../types/maps';

interface ArchitectContext {
  setRightPanelContent: (content: React.ReactNode) => void;
  setRightOpen: (isOpen: boolean) => void;
  setRightPanelTitle: (title: React.ReactNode) => void;
  setRightPanelTab: (tab: string) => void;
}

const InteractiveMapView: React.FC<{ map: Entidad; onBack?: () => void }> = ({ map, onBack }) => {
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const { setRightPanelContent, setRightOpen, setRightPanelTitle, setRightPanelTab } = useOutletContext<ArchitectContext>();

  const [localMap, setLocalMap] = useState<Entidad>(map);
  const [availableEntities, setAvailableEntities] = useState<Entidad[]>([]);

  useEffect(() => {
    entityService.getAllByProject(map.project_id).then(entities => {
      setAvailableEntities(entities.filter(e => e.tipo !== 'Map' && e.tipo !== 'Mapa'));
    });
  }, [map.project_id]);

  useEffect(() => { setLocalMap(map); }, [map]);

  // Limpiar el panel al desmontar
  useEffect(() => {
    return () => {
      setRightPanelContent(null);
    };
  }, [setRightPanelContent]);

  const mapAttributes: MapAttributes = typeof localMap?.contenido_json === 'string'
    ? JSON.parse(localMap.contenido_json)
    : (localMap?.contenido_json || {});

  let mapImage = (mapAttributes.bgImage || mapAttributes.snapshotUrl || null) as string | null;
  if (mapImage && (
    mapImage.toLowerCase().includes('duckdns') ||
    mapImage.toLowerCase().includes('nopreview') ||
    mapImage === 'placeholder-map.png'
  )) { mapImage = null; }

  const markers: MapMarker[] = mapAttributes.markers || [];
  const layers: MapLayer[] = mapAttributes.layers || [];
  const connections: MapConnection[] = mapAttributes.connections || [];
  const features = mapAttributes.features || { type: 'FeatureCollection', features: [] };
  const imageWidth = (mapAttributes.imageWidth as number) || 1920;
  const imageHeight = (mapAttributes.imageHeight as number) || 1080;

  const handleMarkerClick = (marker: MapMarker) => {
    setSelectedMarker(marker);
    setRightOpen(true);
  };

  // ── Panel Derecho ─────────────────────────────────────────────────────
  useEffect(() => {
    if (setRightPanelTab) setRightPanelTab('CONTEXT');
    setRightPanelTitle(
      <div className="flex flex-col">
        <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none mb-1">Visionador</span>
        <span className="text-foreground font-serif font-black text-lg truncate">{localMap.nombre}</span>
      </div>
    );

    if (selectedMarker) {
      // Panel de marcador seleccionado
      const linkedEntity = selectedMarker.entityId
        ? availableEntities.find(e => e.id === Number(selectedMarker.entityId))
        : null;

      setRightPanelContent(
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

          {/* Imagen de entidad vinculada */}
          {linkedEntity && (() => {
            const attrs = typeof linkedEntity.contenido_json === 'string' ? JSON.parse(linkedEntity.contenido_json) : (linkedEntity.contenido_json || {});
            const imgUrl = attrs.imageUrl || attrs.image || attrs.avatar;
            return imgUrl ? (
              <div className="aspect-video rounded-none overflow-hidden border border-foreground/10">
                <img src={imgUrl} alt={linkedEntity.nombre} className="w-full h-full object-cover" />
              </div>
            ) : null;
          })()}

          {/* Descripción */}
          {selectedMarker.description && (
            <p className="text-xs text-foreground/60 leading-relaxed">{selectedMarker.description}</p>
          )}

          {/* Entidad vinculada */}
          {linkedEntity && (
            <div className="p-4 bg-foreground/5 border border-foreground/10">
              <div className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mb-2">Entidad vinculada</div>
              <div className="font-bold text-foreground">{linkedEntity.nombre}</div>
              <div className="text-[10px] text-foreground/40 uppercase">{linkedEntity.tipo}</div>
            </div>
          )}

          {/* Coordenadas */}
          <div className="text-[9px] font-mono text-foreground/30">
            Lat: {selectedMarker.lat?.toFixed(4)} · Lng: {selectedMarker.lng?.toFixed(4)}
          </div>
        </div>
      );
    } else {
      // Panel por defecto del visionador
      const visibleLayers = layers.filter((l: MapLayer) => l.visible !== false);

      setRightPanelContent(
        <div className="p-6 h-full flex flex-col gap-6 overflow-y-auto custom-scrollbar animate-in fade-in duration-300">
          {/* Resumen */}
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

          {/* Lista de marcadores */}
          {markers.length > 0 && (
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-3">Puntos de Interés</h4>
              <div className="space-y-2">
                {markers.map((m: MapMarker) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMarker(m)}
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

          {/* Sin marcadores */}
          {markers.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-40 py-12">
              <span className="material-symbols-outlined text-4xl mb-3">explore</span>
              <p className="text-xs font-bold uppercase tracking-widest">Sin puntos de interés</p>
              <p className="text-[10px] mt-1 opacity-60">Añade marcadores desde el editor</p>
            </div>
          )}

          {/* Volver */}
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
  }, [selectedMarker, localMap, layers, markers, availableEntities]);

  return (
    <div className="flex-1 flex overflow-hidden bg-background relative">
      <main className="flex-1 overflow-hidden relative">
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
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-foreground/60">
            <div className="text-center space-y-4">
              <span className="material-symbols-outlined text-6xl opacity-20 text-primary">cloud_off</span>
              <h3 className="text-xl font-black uppercase text-foreground">Sin Cartografía Base</h3>
              <p className="text-xs text-foreground/60 max-w-xs mx-auto">
                Carga una imagen base desde el editor para habilitar la visualización.
              </p>
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
