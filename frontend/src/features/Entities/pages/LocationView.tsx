import React from "react";
import { MonolithicPanel } from "@components";
import { Button } from "@components";
import { useLocationView } from "./useLocationView";

const LocationView = ({ id }: { id: string | number }) => {
  const {
    location,
    loading,
    isEditing,
    setIsEditing,
    handleSave,
    handleChange,
  } = useLocationView(id);

  if (loading)
    return (
      <div className="p-20 text-center text-foreground/60 animate-pulse">
        Scanning terrain...
      </div>
    );
  if (!location)
    return (
      <div className="p-20 text-center text-destructive">
        Location not found in the maps.
      </div>
    );

  return (
    <div className="flex h-full overflow-y-auto custom-scrollbar p-8 flex-col gap-8">
      {/* Header */}
      <header className="flex justify-center gap-12 text-center items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
              LOCATION
            </span>
            <span className="text-xs font-bold text-foreground/60 sunken-panel px-2 py-0.5 rounded border border-foreground/10">
              {location.tipo || "Wilderness"}
            </span>
          </div>
          <p className="text-foreground/60 mt-2">
            {location.apellidos || "Uncharted territory"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            icon={isEditing ? "close" : "edit"}
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? "Cancel" : "Edit Location"}
          </Button>
          {isEditing && (
            <Button variant="primary" icon="save" onClick={handleSave}>
              Update Records
            </Button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-3 gap-8">
        <div className="col-span-1 space-y-6">
          <MonolithicPanel className="p-6">
            <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                straighten
              </span>{" "}
              Geography & Scale
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-foreground/60 block mb-1">
                  Size / Scale
                </label>
                <input
                  type="text"
                  value={location.tamanno || ""}
                  onChange={(e) => handleChange("tamanno", e.target.value)}
                  className="w-full sunken-panel border border-foreground/40 rounded px-3 py-2 text-foreground text-sm"
                  readOnly={!isEditing}
                />
              </div>
              <div>
                <label className="text-xs text-foreground/60 block mb-1">
                  Development Level
                </label>
                <input
                  type="text"
                  value={location.desarrollo || ""}
                  onChange={(e) => handleChange("desarrollo", e.target.value)}
                  className="w-full sunken-panel border border-foreground/40 rounded px-3 py-2 text-foreground text-sm"
                  readOnly={!isEditing}
                />
              </div>
            </div>
          </MonolithicPanel>

          <MonolithicPanel className="p-6">
            <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-4">
              Quick Stats
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-foreground/5 p-3 rounded-none border border-foreground/10">
                <span className="text-[10px] text-foreground/60 block">
                  Density
                </span>
                <span className="text-foreground font-bold">Medium</span>
              </div>
              <div className="bg-foreground/5 p-3 rounded-none border border-foreground/10">
                <span className="text-[10px] text-foreground/60 block">
                  Security
                </span>
                <span className="text-emerald-400 font-bold">Stable</span>
              </div>
            </div>
          </MonolithicPanel>
        </div>

        <div className="col-span-2 space-y-6">
          <MonolithicPanel className="p-8">
            <h3 className="text-xs font-bold text-foreground/60 uppercase tracking-widest mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">
                description
              </span>{" "}
              Topographic Records & Lore
            </h3>
            <textarea
              value={location.descripcion || ""}
              onChange={(e) => handleChange("descripcion", e.target.value)}
              readOnly={!isEditing}
              className="w-full bg-transparent border-none outline-none text-foreground/60 text-lg leading-relaxed min-h-[400px] resize-none"
              placeholder="Describe the vistas, the smells, and the secrets of this place..."
            />
          </MonolithicPanel>
        </div>
      </div>
    </div>
  );
};

export default LocationView;


