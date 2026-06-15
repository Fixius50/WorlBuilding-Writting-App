import React, { useEffect, useCallback } from "react";
import { useLanguage } from "@context/LanguageContext";
import MonolithicPanel from "@atoms/MonolithicPanel";
import Button from "@atoms/Button";
import { Entidad } from "@domain/models/database";
import { useMapManager } from "./useMapManager";

interface MapManagerProps {
  maps: Entidad[];
  onSelectMap: (map: Entidad) => void;
  onCreateMap: () => void;
  onDeleteMap: (map: Entidad) => void;
  onDuplicateMap: (map: Entidad) => void;
  onEditMap: (map: Entidad) => void;
}

const MapManager: React.FC<MapManagerProps> = ({
  maps,
  onSelectMap,
  onCreateMap,
  onDeleteMap,
  onDuplicateMap,
  onEditMap,
}) => {
  const { t } = useLanguage();
  const {
    searchTerm,
    setSearchTerm,
    spatialFilter,
    setSpatialFilter,
    selectedMapId,
    setSelectedMapId,
    selectedMap,
    filteredMaps,
    getPreview,
    handleUpdateMapAttribute,
    openPanel,
    setCustomContent,
  } = useMapManager(maps);

  const renderRightPanel = useCallback(() => {
    if (!selectedMap) return null;
    const attrs =
      typeof selectedMap.contenido_json === "string"
        ? JSON.parse(selectedMap.contenido_json)
        : selectedMap.contenido_json || {};

    return (
      <div className="flex flex-col h-full monolithic-panel animate-in slide-in-from-right duration-500">
        <div className="p-6 border-b border-foreground/10 bg-gradient-to-br from-primary/10 to-transparent">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">info</span>{" "}
              Detalles del Atlas
            </h3>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setSelectedMapId(null);
              }}
              className="text-foreground/60 hover:text-foreground transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
          <h4 className="text-lg font-serif font-black text-foreground truncate">
            {selectedMap.nombre}
          </h4>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
          <div className="aspect-[16/9] rounded-none monolithic-panel overflow-hidden group">
            {getPreview(selectedMap) ? (
              <img
                src={getPreview(selectedMap) || ""}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                alt="Preview"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center opacity-20">
                <span className="material-symbols-outlined text-4xl">
                  public
                </span>
              </div>
            )}
          </div>

          <MonolithicPanel title="JERARQUÍA ESPACIAL" icon="layers">
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-text-muted mb-2 block tracking-widest">
                  Nivel de Escala
                </label>
                <div className="relative">
                  <select
                    value={attrs.spatialLevel || "TERRITORY"}
                    onChange={(e) =>
                      handleUpdateMapAttribute(
                        selectedMap,
                        "spatialLevel",
                        e.target.value,
                      )
                    }
                    className="w-full appearance-none monolithic-panel rounded-none px-4 py-3 text-xs font-bold text-foreground transition-all hover:bg-foreground/5 focus:border-primary outline-none bg-transparent"
                  >
                    <option value="UNIVERSE">💫 UNIVERSO</option>
                    <option value="GALAXY">🌀 GALAXIA</option>
                    <option value="PLANET">🌍 CUERPO CELESTE</option>
                    <option value="TERRITORY">🗺️ TERRITORIO</option>
                    <option value="ZONE">ZONA</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>
            </div>
          </MonolithicPanel>

          <div className="space-y-3 pt-4 border-t border-foreground/10">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/60 px-1 font-mono">
              Acciones
            </h4>
            <Button
              variant="primary"
              className="w-full justify-center py-4 shadow-xl shadow-primary/20 font-black tracking-widest uppercase transition-all hover:scale-[1.02]"
              icon="visibility"
              onClick={() => onSelectMap(selectedMap)}
            >
              Abrir Visionador
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-center py-3 font-black tracking-widest uppercase"
              icon="edit"
              onClick={() => onEditMap(selectedMap)}
            >
              Editar en Editor
            </Button>
            <Button
              variant="ghost"
              className="w-full justify-center py-3 font-black tracking-widest uppercase text-red-400 hover:bg-red-500/10"
              icon="delete"
              onClick={() => {
                onDeleteMap(selectedMap);
                setSelectedMapId(null);
              }}
            >
              Eliminar Mapa
            </Button>
          </div>
        </div>
      </div>
    );
  }, [
    selectedMap,
    onSelectMap,
    onEditMap,
    getPreview,
    handleUpdateMapAttribute,
    onDeleteMap,
    setSelectedMapId,
  ]);

  useEffect(() => {
    if (selectedMapId) {
      openPanel("bulk", selectedMapId, selectedMap?.nombre || "Mapa");
      setCustomContent(renderRightPanel());
    }
  }, [
    selectedMapId,
    selectedMap,
    openPanel,
    setCustomContent,
    renderRightPanel,
  ]);

  return (
    <div className="flex-1 flex overflow-hidden bg-background">
      <div className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <div className="flex flex-col md:flex-row justify-between items-end gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
            <div>
              <p className="text-sm text-foreground/60 mt-2 max-w-xl">
                Explora los territorios cartografiados de tu mundo. Gestiona
                mapas regionales y planos astrales desde este centro de comando.
              </p>
            </div>
            <div className="flex items-center gap-4 w-full md:w-auto">
              <div className="relative">
                <select
                  value={spatialFilter}
                  onChange={(e) => setSpatialFilter(e.target.value)}
                  className="appearance-none monolithic-panel border border-foreground/10 rounded-none px-4 py-3 pr-10 text-xs font-bold text-foreground transition-all hover:bg-foreground/5 focus:border-primary outline-none bg-transparent"
                >
                  <option value="ALL">TODA LA ESCALA</option>
                  <option value="UNIVERSE">UNIVERSO</option>
                  <option value="GALAXY">GALAXIA</option>
                  <option value="PLANET">CUERPO CELESTE</option>
                  <option value="TERRITORY">TERRITORIO</option>
                  <option value="ZONE">ZONA</option>
                </select>
                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">
                  expand_more
                </span>
              </div>

              <div className="relative flex-1 md:w-64">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60">
                  search
                </span>
                <input
                  type="text"
                  placeholder="Buscar mapas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full monolithic-panel rounded-none pl-10 pr-4 py-3 text-sm text-foreground focus:border-primary outline-none transition-all bg-transparent"
                />
              </div>
              <Button variant="primary" icon="add" onClick={onCreateMap}>
                Nuevo Mapa
              </Button>
            </div>
          </div>

          {filteredMaps.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-foreground/10 rounded-none bg-background animate-in zoom-in-95 duration-500">
              <h3 className="text-xl font-bold text-foreground mb-2">
                No hay mapas visibles
              </h3>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-700 pt-12 pb-20">
              {filteredMaps.map((map) => {
                const preview = getPreview(map);
                const attrs =
                  typeof map.contenido_json === "string"
                    ? JSON.parse(map.contenido_json)
                    : map.contenido_json || {};
                const layersCount = attrs.layers?.length || 0;
                const markersCount = attrs.markers?.length || 0;

                return (
                  <MonolithicPanel
                    key={map.id}
                    className={`group relative overflow-hidden border-foreground/10 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${selectedMapId === map.id ? "ring-2 ring-primary bg-primary/5 shadow-2xl shadow-primary/10" : ""}`}
                    onClick={() => onSelectMap(map)}
                  >
                    <div className="aspect-[16/9] w-full bg-background/50 relative overflow-hidden border-b border-foreground/10">
                      {preview ? (
                        <img
                          src={preview}
                          alt={map.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center sunken-panel">
                          <span className="material-symbols-outlined text-4xl text-foreground/10 group-hover:text-primary/50 transition-colors">
                            public
                          </span>
                        </div>
                      )}

                      <div className="absolute bottom-2 right-2 flex items-center gap-1 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        {/* 
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectMap(map);
                          }}
                          className="p-2 bg-background/90 hover:bg-primary/20 text-foreground rounded-none border border-foreground/10 shadow-xl"
                          title="Abrir Visionador"
                        >
                          <span className="material-symbols-outlined text-sm">
                            visibility
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onEditMap(map);
                          }}
                          className="p-2 bg-background/90 hover:bg-primary/20 text-foreground rounded-none border border-foreground/10 shadow-xl"
                          title="Editar en Editor"
                        >
                          <span className="material-symbols-outlined text-sm">
                            edit
                          </span>
                        </button>
                        */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDuplicateMap(map);
                          }}
                          className="p-2 bg-background/90 hover:bg-primary/20 text-foreground rounded-none border border-foreground/10 shadow-xl"
                          title="Duplicar Mapa"
                        >
                          <span className="material-symbols-outlined text-sm">
                            content_copy
                          </span>
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDeleteMap(map);
                          }}
                          className="p-2 bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-primary-foreground rounded-none border border-red-500/20 shadow-xl transition-all"
                          title="Eliminar Mapa"
                        >
                          <span className="material-symbols-outlined text-sm">
                            delete
                          </span>
                        </button>
                      </div>
                    </div>

                    <div className="p-5">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-foreground text-lg truncate pr-2 group-hover:text-primary transition-colors">
                          {map.nombre}
                        </h3>
                        <span className="shrink-0 text-[10px] font-black uppercase tracking-widest bg-foreground/5 text-foreground/60 px-2 py-1 rounded border border-foreground/10">
                          {attrs.spatialLevel || "Territorio"}
                        </span>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-foreground/60 font-medium mt-4">
                        <div
                          className="flex items-center gap-1.5"
                          title="Capas"
                        >
                          <span className="material-symbols-outlined text-sm">
                            layers
                          </span>
                          {layersCount}
                        </div>
                        <div
                          className="flex items-center gap-1.5"
                          title="Marcadores"
                        >
                          <span className="material-symbols-outlined text-sm">
                            location_on
                          </span>
                          {markersCount}
                        </div>
                        <div className="flex-1 text-right text-[10px] uppercase tracking-wider opacity-50 font-mono">
                          ID: {map.id}
                        </div>
                      </div>
                    </div>
                  </MonolithicPanel>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapManager;
