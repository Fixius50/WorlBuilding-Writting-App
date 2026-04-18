import React, { useState } from 'react';
import { entityService } from '@repositories/entityService';
import Switch from '@atoms/Switch';

interface MapSearchBoxProps {
  onSearch: (term: string) => void;
  onFilterChange: (filters: any) => void;
  availableMarkers: { label: string; lat: number; lng: number }[];
  filters: {
    cities: boolean;
    ruins: boolean;
    events: boolean;
  };
}

const MapSearchBox: React.FC<MapSearchBoxProps> = ({ 
  onSearch, 
  onFilterChange, 
  availableMarkers,
  filters 
}) => {
  const [query, setQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const filteredResults = query.length > 1 
    ? availableMarkers.filter(m => m.label.toLowerCase().includes(query.toLowerCase())).slice(0, 5)
    : [];

  return (
    <div className="absolute top-8 left-8 z-[1000] flex flex-col gap-2 w-80">
      <div className="flex items-center bg-background border border-foreground/10 shadow-2xl overflow-hidden backdrop-blur-md">
        <div className="flex-1 flex items-center px-4 py-3 gap-3">
          <span className="material-symbols-outlined text-foreground/40 text-lg">search</span>
          <input
            type="text"
            placeholder="Buscar ubicación o personaje..."
            className="bg-transparent border-none outline-none text-xs text-foreground font-serif font-bold w-full placeholder:text-foreground/20"
            value={query}
            onChange={(e) => {
                setQuery(e.target.value);
                onSearch(e.target.value);
            }}
          />
        </div>
        
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className={`px-4 py-3 border-l border-foreground/10 transition-colors flex items-center gap-2 ${showFilters ? 'bg-primary/20 text-primary' : 'text-foreground/60 hover:bg-foreground/5'}`}
        >
          <span className="material-symbols-outlined text-sm">tune</span>
          <span className="text-[9px] font-black uppercase tracking-widest leading-none">Filtros</span>
        </button>
      </div>

      {/* RESULTADOS DE BÚSQUEDA */}
      {filteredResults.length > 0 && (
        <div className="bg-background border border-foreground/10 shadow-2xl p-1 animate-in fade-in slide-in-from-top-2 duration-200">
           {filteredResults.map((res, i) => (
             <button
               key={i}
               className="w-full text-left p-3 hover:bg-primary/10 transition-colors flex items-center gap-3 group"
               onClick={() => {
                  setQuery('');
                  // Aquí iría la lógica de centrado en mapa si tuviéramos acceso directo
               }}
             >
               <span className="material-symbols-outlined text-foreground/30 text-base group-hover:text-primary transition-colors">location_on</span>
               <span className="text-[11px] font-bold text-foreground/80 group-hover:text-foreground transition-colors">{res.label}</span>
             </button>
           ))}
        </div>
      )}

      {/* PANEL DE FILTROS (POPOVER) */}
      {showFilters && (
        <div className="bg-background border border-foreground/10 shadow-2xl p-4 animate-in fade-in zoom-in-95 duration-200 space-y-4">
          <div className="pb-2 border-b border-foreground/5">
             <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">Visibilidad de Capas</span>
          </div>
          <div className="space-y-4">
            <Switch 
              label="Mostrar Ciudades" 
              checked={filters.cities} 
              onChange={(v) => onFilterChange({ ...filters, cities: v })} 
            />
            <Switch 
              label="Mostrar Ruinas" 
              checked={filters.ruins} 
              onChange={(v) => onFilterChange({ ...filters, ruins: v })} 
            />
            <Switch 
              label="Eventos Históricos" 
              checked={filters.events} 
              onChange={(v) => onFilterChange({ ...filters, events: v })} 
            />
          </div>
          <p className="text-[9px] text-foreground/20 italic leading-relaxed pt-2 border-t border-foreground/5">
            Los cambios se aplican instantáneamente al motor de renderizado.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapSearchBox;
