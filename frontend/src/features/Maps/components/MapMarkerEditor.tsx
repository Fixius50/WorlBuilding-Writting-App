import React from "react";
import { MonolithicPanel } from "@components";
import { Button } from "@components";
import { MapMarker } from "@domain/maps";
import { useMapMarkerEditor } from "../hooks/useMapMarkerEditor";

interface MapMarkerEditorProps {
  markers: MapMarker[];
  onAddMarker?: (type?: string) => void;
  onDeleteMarker: (id: string) => void;
  onSelectMarker: (marker: MapMarker) => void;
  onClose: () => void;
}

const MapMarkerEditor: React.FC<MapMarkerEditorProps> = ({
  markers = [],
  onAddMarker,
  onDeleteMarker,
  onSelectMarker,
  onClose,
}) => {
  const {
    selectedMarkerId,
    setSelectedMarkerId,
    isAdding,
    setIsAdding,
    searchTerm,
    setSearchTerm,
    markerTypes,
    filteredMarkers,
    handleStartAdding,
    handleSelectType,
  } = useMapMarkerEditor(markers, onAddMarker);

  return (
    <div className="h-full flex flex-col monolithic-panel border-l border-foreground/40">
      {/* Header */}
      <div className="p-6 border-b border-foreground/40">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">
              location_on
            </span>
            Map Markers
          </h2>
          <button
            onClick={onClose}
            className="size-8 rounded-none bg-foreground/5 hover:monolithic-panel flex items-center justify-center text-foreground/60 hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-sm">close</span>
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-foreground/60 text-sm">
            search
          </span>
          <input
            type="text"
            placeholder="Search markers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full monolithic-panel rounded-none pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-foreground/30 focus:border-primary/50 focus:bg-foreground/10 transition-all outline-none"
          />
        </div>
      </div>

      {/* Marker List */}
      <div className="flex-1 overflow-y-auto p-6 space-y-3">
        {filteredMarkers.length === 0 ? (
          <div className="text-center py-12 text-foreground/60">
            <span className="material-symbols-outlined text-4xl opacity-20 mb-2">
              location_off
            </span>
            <p className="text-sm">No markers yet</p>
            <p className="text-xs mt-1">Click on the map to add markers</p>
          </div>
        ) : (
          filteredMarkers.map((marker, index) => (
            <MonolithicPanel
              key={marker.id || index}
              className={`p-4 cursor-pointer transition-all ${selectedMarkerId === marker.id ? "border-primary bg-primary/10" : "border-foreground/10 hover:border-foreground/40"}`}
              onClick={() => {
                setSelectedMarkerId(marker.id);
                onSelectMarker(marker);
              }}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`size-10 rounded-none flex items-center justify-center bg-${marker.type || "primary"}/10 border border-${marker.type || "primary"}/20`}
                >
                  <span className="material-symbols-outlined text-lg text-primary">
                    {markerTypes.find((t) => t.id === marker.type)?.icon ||
                      "location_on"}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-foreground truncate">
                    {marker.label || "Unnamed"}
                  </h3>
                  <p className="text-xs text-foreground/60 truncate">
                    {marker.description || "No description"}
                  </p>
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-[10px] text-foreground/60">
                      {marker.type || "location"}
                    </span>
                    {marker.entityId && (
                      <span className="text-[10px] text-primary">• Linked</span>
                    )}
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteMarker(marker.id);
                    }}
                    className="size-6 rounded-none bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 flex items-center justify-center text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-xs">
                      delete
                    </span>
                  </button>
                </div>
              </div>
            </MonolithicPanel>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-foreground/40">
        <Button
          variant="primary"
          icon="add_location"
          className="w-full py-3 rounded-none"
          onClick={handleStartAdding}
        >
          Add Marker
        </Button>
        <p className="text-xs text-foreground/60 text-center mt-3">
          Click on the map to place a new marker
        </p>
      </div>

      {/* Marker Type Selector */}
      {isAdding && (
        <div className="absolute inset-0 bg-background/95 z-50 flex items-center justify-center p-6">
          <div className="max-w-md w-full space-y-6">
            <div className="text-center">
              <h3 className="text-xl font-bold text-foreground mb-2">
                Select Marker Type
              </h3>
              <p className="text-sm text-foreground/60">
                Choose the type of location
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {markerTypes.map((type) => (
                <button
                  key={type.id}
                  onClick={() => handleSelectType(type.id)}
                  className="p-4 rounded-none monolithic-panel hover:border-primary hover:bg-primary/10 transition-all group"
                >
                  <span className="material-symbols-outlined text-3xl text-foreground/60 group-hover:text-primary transition-colors mb-2">
                    {type.icon}
                  </span>
                  <p className="text-sm font-bold text-foreground">
                    {type.label}
                  </p>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsAdding(false)}
              className="w-full py-3 rounded-none monolithic-panel text-foreground hover:bg-foreground/10 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapMarkerEditor;



