import React, { useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Entidad } from "@domain/database";
import { useInteractiveMapView } from "../hooks/useInteractiveMapView";
import { useMapLibreView } from "../hooks/useMapLibreView";
import MapSearchBox from "../components/MapSearchBox";

const InteractiveMapView: React.FC<{
  map: Entidad;
  onBack?: () => void;
}> = ({ map, onBack }) => {
  const hook = useInteractiveMapView(map);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  // Integración de Deck.gl / MapLibre en modo Solo Lectura
  useMapLibreView(mapContainerRef, {
    mapImage: null, // Si hubiese background de mapLibre no raster, sino, se maneja por layers
    markers: hook.markers,
    layers: hook.layers,
    connections: hook.connections,
    features: hook.features as any,
    onMarkerClick: (m) => hook.setSelectedMarkerId(m.id),
    onMapClick: () => hook.setSelectedMarkerId(null),
    is3D: hook.is3D,
    levels: hook.levels,
    levelBgImages: hook.levelBgImages,
    activeLevelId: hook.activeLevelId,
    levelSpacing: hook.levelSpacing,
    overlayAllLayers: hook.overlayAllLayers,
    gridMode: hook.gridMode,
  });

  return (
    <div className="relative w-full h-full bg-background text-foreground overflow-hidden select-none">
      
      {/* BARRA SUPERIOR E INFO */}
      <div className="absolute top-6 left-6 z-[50] flex flex-col gap-4">
        <div className="flex gap-4">
          {onBack && (
            <button
              onClick={onBack}
              className="p-3 bg-background/90 shadow-2xl border border-foreground/10 text-foreground/60 hover:text-primary transition-all duration-300 flex items-center justify-center rounded"
              title="Volver"
            >
              <span className="material-symbols-outlined text-xl font-bold">arrow_back</span>
            </button>
          )}
          
          <div className="bg-background/90 shadow-2xl border border-foreground/10 px-4 py-2 flex items-center gap-4 rounded">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase text-primary tracking-widest">
                {hook.levels.find(l => l.id === hook.activeLevelId)?.name || 'Nivel Principal'}
              </span>
              <span className="text-xs text-foreground/60">
                {hook.mapEntity?.nombre || map.nombre || "Atlas"}
              </span>
            </div>
            
            <div className="w-px h-6 bg-foreground/10" />
            
            <button
              onClick={() => hook.setIs3D(!hook.is3D)}
              title={hook.is3D ? "Cambiar a vista 2D" : "Activar modo Multinivel 3D"}
              className={`p-2 flex items-center justify-center rounded transition-colors ${hook.is3D ? 'bg-primary/20 text-primary border border-primary/20' : 'text-foreground/40 hover:text-foreground border border-transparent'}`}
            >
              <span className="material-symbols-outlined text-xl">{hook.is3D ? "view_in_ar" : "map"}</span>
            </button>

            <div className="w-px h-6 bg-foreground/10" />

            <button
              onClick={() => navigate(`../editor/${map.slug || map.id}`)}
              title="Alternar a Modo Edición"
              className="p-2 flex items-center justify-center rounded transition-colors text-foreground/40 hover:text-primary hover:bg-primary/10 border border-transparent"
            >
              <span className="material-symbols-outlined text-xl">edit</span>
            </button>
          </div>
        </div>

        {/* SELECTOR RÁPIDO DE NIVEL */}
        {hook.levels.length > 1 && (
          <div className="bg-background/90 shadow-2xl border border-foreground/10 rounded flex flex-col p-1 w-48">
             <span className="text-[9px] uppercase font-bold text-foreground/40 tracking-wider px-3 pt-2 pb-1">
               Selector de Piso
             </span>
             {hook.levels.map((lvl) => (
               <button
                 key={lvl.id}
                 onClick={() => hook.setActiveLevelId(lvl.id)}
                 className={`px-3 py-2 text-xs text-left rounded transition-colors ${hook.activeLevelId === lvl.id ? 'bg-primary/10 text-primary font-bold' : 'text-foreground/70 hover:bg-foreground/5'}`}
               >
                 {lvl.name}
               </button>
             ))}
          </div>
        )}
      </div>

      {/* BUSCADOR */}
      <div className="absolute top-6 right-6 z-[50]">
        <MapSearchBox 
          onSearch={hook.setSearchQuery} 
          onFilterChange={() => {}} 
          availableMarkers={hook.markers.map(m => ({ label: m.label || "Sin nombre", lat: m.lat || 0, lng: m.lng || 0 }))} 
          filters={{ cities: true, ruins: true, events: true }} 
        />
      </div>

      {/* MAP CONTENEDOR */}
      <div ref={mapContainerRef} className="absolute inset-0 z-0" />

      {/* OVERLAY DE CARGA */}
      {!hook.mapEntity && (
        <div className="absolute inset-0 z-[100] flex items-center justify-center bg-background/50 backdrop-blur-sm">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
};

export default InteractiveMapView;
