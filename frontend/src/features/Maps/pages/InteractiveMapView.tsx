import React, { useEffect } from 'react';
import MapLibreView from '../components/MapLibreView';
import MapSearchBox from '../components/MapSearchBox';
import Button from '@atoms/Button';
import { Entidad } from '@domain/models/database';
import { MapMarker, MapLayer } from '@domain/models/maps';
import { useInteractiveMapView } from './useInteractiveMapView';

const InteractiveMapView: React.FC<{
  map: Entidad;
  onBack?: () => void;
}> = ({ map, onBack }) => {
  const {
    projectName,
    navigate,
    selectedMarker,
    setSelectedMarker,
    availableEntities,
    markerCharacters,
    atlasFilters,
    setAtlasFilters,
    setSearchQuery,
    markers,
    layers,
    connections,
    features,
    imageWidth,
    imageHeight,
    is3D,
    mapImage,
    handleMarkerClick,
    setCustomContent
  } = useInteractiveMapView(map);

  useEffect(() => {
    const renderSidebarContent = () => {
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

        return (
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
              <div 
                className="p-4 bg-foreground/5 border border-foreground/10 cursor-pointer hover:border-primary/30 transition-all"
                onClick={() => navigate(`/local/${projectName}/bible/folder/${linkedEntity.carpeta_id}/entity/${linkedEntity.id}`)}
              >
                <div className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mb-2">Entidad vinculada</div>
                <div className="font-bold text-foreground">{linkedEntity.nombre}</div>
                <div className="text-[10px] text-foreground/40 uppercase">{linkedEntity.tipo}</div>
              </div>
            )}

            {markerCharacters.length > 0 && (
              <div className="space-y-3">
                <div className="text-[9px] font-black uppercase tracking-widest text-foreground/40 px-1">Personajes Presentes</div>
                <div className="space-y-2">
                  {markerCharacters.map(char => {
                    let charImg = '';
                    try {
                      const cAttrs = typeof char.contenido_json === 'string'
                        ? JSON.parse(char.contenido_json)
                        : (char.contenido_json || {});
                      charImg = cAttrs.imageUrl || cAttrs.image || cAttrs.avatar || '';
                    } catch {}

                    return (
                      <div 
                        key={char.id}
                        className="flex items-center gap-3 p-3 bg-foreground/5 border border-foreground/10 hover:border-primary/20 cursor-pointer transition-all"
                        onClick={() => navigate(`/local/${projectName}/bible/folder/${char.carpeta_id}/entity/${char.id}`)}
                      >
                        {charImg ? (
                          <img src={charImg} alt={char.nombre} className="size-8 object-cover rounded-none border border-foreground/10" />
                        ) : (
                          <div className="size-8 bg-primary/10 border border-primary/20 flex items-center justify-center">
                            <span className="material-symbols-outlined text-sm text-primary">person</span>
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[11px] font-bold text-foreground truncate">{char.nombre}</div>
                          <div className="text-[9px] text-foreground/40 uppercase font-bold tracking-widest">{char.tipo}</div>
                        </div>
                        <span className="material-symbols-outlined text-xs text-foreground/30">chevron_right</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="text-[9px] font-mono text-foreground/30">
              Lat: {selectedMarker.lat?.toFixed(4)} · Lng: {selectedMarker.lng?.toFixed(4)}
            </div>
          </div>
        );
      } else {
        const visibleLayers = layers.filter((l: MapLayer) => l.visible !== false);

        return (
          <div className="flex flex-col h-full bg-background/50 animate-in fade-in duration-300">
            <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
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
                        onClick={() => handleMarkerClick(m)}
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
            </div>
            {onBack && (
              <div className="p-4 border-t border-foreground/10 bg-background/80 sticky bottom-0 z-10 backdrop-blur-md">
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
    };

    setCustomContent(renderSidebarContent());
  }, [selectedMarker, markers, layers, availableEntities, markerCharacters, onBack, setCustomContent, handleMarkerClick, navigate, projectName, setSelectedMarker]);

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

