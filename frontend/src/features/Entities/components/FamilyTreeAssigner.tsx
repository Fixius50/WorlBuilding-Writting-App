import React from "react";
import Avatar from "@atoms/Avatar";
import MonolithicPanel from "@atoms/MonolithicPanel";
import { useFamilyTreeAssigner } from "./useFamilyTreeAssigner";

interface FamilyTreeAssignerProps {
  entityId: number;
  projectId: number;
}

const FamilyTreeAssigner: React.FC<FamilyTreeAssignerProps> = ({
  entityId,
  projectId,
}) => {
  const searchContainerRef = React.useRef<HTMLDivElement | null>(null);

  const {
    relationships,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchOpen,
    setIsSearchOpen,
    selectedRelative,
    setSelectedRelative,
    selectedType,
    setSelectedType,
    customType,
    setCustomType,
    availableTypes,
    loading,
    isAddingCustom,
    setIsAddingCustom,
    handleAddRelationship,
    handleDelete,
  } = useFamilyTreeAssigner(entityId, projectId);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target;
      if (!searchContainerRef.current || !(target instanceof Node)) {
        return;
      }

      if (!searchContainerRef.current.contains(target)) {
        setIsSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [setIsSearchOpen]);

  return (
    <div className="space-y-8">
      <MonolithicPanel className="p-8 space-y-6 bg-foreground/[0.02] border-foreground/10">
        <header className="flex items-center gap-3 text-primary border-b border-foreground/5 pb-4">
          <span className="material-symbols-outlined text-lg">
            account_tree
          </span>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
            Asignación de Linaje
          </h3>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] block px-1">
              Buscar Familiar
            </label>
            <div ref={searchContainerRef} className="relative">
              <input
                type="text"
                className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-none p-4 text-[11px] text-foreground outline-none focus:border-primary/50 placeholder:text-foreground/20"
                placeholder="Nombre del personaje..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchOpen(true)}
                onClick={() => setIsSearchOpen(true)}
              />
              {isSearchOpen && (
                <div className="absolute top-full left-0 w-full bg-background border border-foreground/10 z-50 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                  {searchResults.length > 0 ? (
                    searchResults.map((res) => (
                      <div
                        key={res.id}
                        onClick={() => {
                          setSelectedRelative(res);
                          setSearchQuery(res.nombre);
                          setIsSearchOpen(false);
                        }}
                        className="p-3 hover:bg-primary/10 flex items-center gap-3 cursor-pointer"
                      >
                        <Avatar name={res.nombre} size="xs" />
                        <span className="text-[10px] font-bold uppercase tracking-tight text-foreground/80">
                          {res.nombre}
                        </span>
                      </div>
                    ))
                  ) : (
                    <div className="p-3 text-[10px] font-bold uppercase tracking-tight text-foreground/40">
                      Sin familiares disponibles
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] block">
                Tipo de Vínculo
              </label>
            </div>
            <div className="flex gap-2">
              {isAddingCustom ? (
                <div className="flex-1 flex gap-2">
                  <input
                    type="text"
                    autoFocus
                    className="flex-1 bg-foreground/[0.03] border border-primary/30 rounded-none p-4 text-[10px] font-black text-foreground uppercase tracking-widest outline-none focus:border-primary/50"
                    placeholder="Escribir vínculo..."
                    value={customType}
                    onChange={(e) => setCustomType(e.target.value)}
                  />
                  <button
                    onClick={() => {
                      setIsAddingCustom(false);
                      setCustomType("");
                      setSelectedType("");
                    }}
                    className="px-3 text-foreground/40 hover:text-foreground"
                  >
                    <span className="material-symbols-outlined text-sm">
                      cancel
                    </span>
                  </button>
                </div>
              ) : (
                <select
                  className="flex-1 bg-foreground/[0.03] border border-foreground/10 rounded-none p-4 text-[10px] font-black text-foreground uppercase tracking-widest outline-none focus:border-primary/50 cursor-pointer appearance-none"
                  value={selectedType}
                  onChange={(e) => {
                    if (e.target.value === "CUSTOM_NEW") {
                      setIsAddingCustom(true);
                    } else {
                      setSelectedType(e.target.value);
                    }
                  }}
                >
                  <option value="" className="bg-background text-foreground/40">
                    -- SELECCIONAR VÍNCULO --
                  </option>
                  {availableTypes.map((t) => (
                    <option key={t} value={t} className="bg-background">
                      {t}
                    </option>
                  ))}
                  <option
                    value="CUSTOM_NEW"
                    className="bg-background text-primary"
                  >
                    CREAR NUEVO
                  </option>
                </select>
              )}
              <button
                onClick={handleAddRelationship}
                disabled={
                  !selectedRelative ||
                  (isAddingCustom ? !customType.trim() : !selectedType)
                }
                className="px-6 bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest disabled:opacity-30 disabled:grayscale"
              >
                Vincular
              </button>
            </div>
          </div>
        </div>
      </MonolithicPanel>

      <div className="space-y-4">
        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 px-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">groups</span>{" "}
          Familiares Registrados
        </h3>

        {loading ? (
          <div className="py-12 text-center text-[9px] font-black uppercase tracking-widest text-primary/40">
            Sincronizando registros genealógicos...
          </div>
        ) : relationships.length === 0 ? (
          <div className="py-20 border-2 border-dashed border-foreground/5 flex flex-col items-center justify-center text-foreground/20">
            <span className="material-symbols-outlined text-4xl mb-4 opacity-20">
              family_history
            </span>
            <p className="text-[10px] font-black uppercase tracking-widest">
              Sin linaje definido aún
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relationships.map((rel) => {
              const isOrigen = rel.origen_id === entityId;
              const familiarNombre = isOrigen
                ? rel.nombre_destino
                : rel.nombre_origen;
              return (
                <div
                  key={rel.id}
                  className="group relative bg-foreground/[0.02] border border-foreground/10 p-4 flex items-center justify-between hover:border-primary/30 hover:bg-foreground/[0.04]"
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={familiarNombre || "?"} size="sm" />
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-tight text-foreground/80">
                        {familiarNombre}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">
                          {rel.tipo}
                        </span>
                        {!isOrigen && (
                          <span className="text-[8px] text-foreground/30 italic">
                            (Inverso)
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDelete(rel.id)}
                    className="size-8 flex items-center justify-center text-foreground/10 hover:text-red-400 hover:bg-red-400/5 opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-base">
                      delete
                    </span>
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default FamilyTreeAssigner;
