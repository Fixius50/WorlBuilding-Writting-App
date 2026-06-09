import React from "react";
import Avatar from "@atoms/Avatar";
import MonolithicPanel from "@atoms/MonolithicPanel";
import ConfirmationModal from "@organisms/ConfirmationModal";
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
  const [deletingRelIds, setDeletingRelIds] = React.useState<number[]>([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = React.useState(false);

  const {
    relationships,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchOpen,
    setIsSearchOpen,
    selectedRelatives,
    setSelectedRelatives,
    selectedTypes,
    setSelectedTypes,
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
      <div className="monolithic-panel rounded-none flex flex-col transition-all duration-300 hover:border-primary/30 group p-8 space-y-6 bg-foreground/[0.02] border-foreground/10 overflow-visible">
        <header className="flex items-center gap-3 text-primary border-b border-foreground/5 pb-4">
          <span className="material-symbols-outlined text-lg">
            account_tree
          </span>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">
            Asignación de Relaciones
          </h3>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] block px-1">
              Buscar Personaje
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
                          if (!selectedRelatives.some((sr) => sr.id === res.id)) {
                            setSelectedRelatives([...selectedRelatives, res]);
                          }
                          setSearchQuery("");
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
                      Sin personajes disponibles
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Chips de personajes seleccionados */}
            {selectedRelatives.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 px-1">
                {selectedRelatives.map((rel) => (
                  <div key={rel.id} className="flex items-center gap-1.5 px-3 py-1.5 bg-foreground/5 border border-foreground/10 text-foreground text-[10px] font-black uppercase tracking-wider">
                    <span>{rel.nombre}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedRelatives(selectedRelatives.filter((sr) => sr.id !== rel.id))}
                      className="text-foreground/45 hover:text-red-400 bg-transparent border-none p-0 cursor-pointer flex items-center"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
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
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        const val = customType.trim().toUpperCase();
                        if (val) {
                          if (!selectedTypes.includes(val)) {
                            setSelectedTypes([...selectedTypes, val]);
                          }
                          setCustomType("");
                          setIsAddingCustom(false);
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const val = customType.trim().toUpperCase();
                      if (val) {
                        if (!selectedTypes.includes(val)) {
                          setSelectedTypes([...selectedTypes, val]);
                        }
                        setCustomType("");
                        setIsAddingCustom(false);
                      }
                    }}
                    className="px-3 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20"
                  >
                    Añadir
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsAddingCustom(false);
                      setCustomType("");
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
                    const val = e.target.value;
                    if (val === "CUSTOM_NEW") {
                      setIsAddingCustom(true);
                    } else if (val) {
                      if (!selectedTypes.includes(val)) {
                        setSelectedTypes([...selectedTypes, val]);
                      }
                      setSelectedType("");
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
                  selectedRelatives.length === 0 ||
                  (selectedTypes.length === 0 && (isAddingCustom ? !customType.trim() : true))
                }
                className="px-6 bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest disabled:opacity-30 disabled:grayscale"
              >
                Vincular
              </button>
            </div>

            {/* Chips de vínculos seleccionados */}
            {selectedTypes.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2 px-1">
                {selectedTypes.map((t) => (
                  <div key={t} className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase tracking-wider">
                    <span>{t}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedTypes(selectedTypes.filter((st) => st !== t))}
                      className="text-primary/45 hover:text-red-400 bg-transparent border-none p-0 cursor-pointer flex items-center"
                    >
                      <span className="material-symbols-outlined text-xs">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 px-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">groups</span>{" "}
          Relaciones Registradas
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
              Sin relaciones definidas aún
            </p>
          </div>
        ) : (() => {
          const grouped = relationships.reduce((acc, rel) => {
            const isOrigen = rel.origen_id === entityId;
            const relatedEntityName = isOrigen
              ? rel.nombre_destino
              : rel.nombre_origen;
            const relatedEntityId = isOrigen
              ? rel.destino_id
              : rel.origen_id;
            const key = relatedEntityName || "?";
            if (!acc[key]) {
              acc[key] = {
                relatedEntityName: key,
                relatedEntityId,
                rels: [],
              };
            }

            const existingRel = acc[key].rels.find(
              (r) => r.tipo === rel.tipo && r.isOrigen === isOrigen
            );

            if (existingRel) {
              existingRel.ids.push(rel.id);
            } else {
              acc[key].rels.push({
                ids: [rel.id],
                tipo: rel.tipo,
                isOrigen,
              });
            }

            return acc;
          }, {} as Record<string, { relatedEntityName: string; relatedEntityId: number; rels: Array<{ ids: number[]; tipo: string; isOrigen: boolean }> }>);

          const groupedList = Object.values(grouped);

          return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {groupedList.map((group) => {
                return (
                  <div
                    key={group.relatedEntityName}
                    className="group relative bg-foreground/[0.02] border border-foreground/10 p-4 flex items-center justify-between hover:border-primary/30 hover:bg-foreground/[0.04]"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar name={group.relatedEntityName} size="sm" />
                      <div className="space-y-1.5">
                        <div className="text-[10px] font-black uppercase tracking-tight text-foreground/80">
                          {group.relatedEntityName}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {group.rels.map((r) => (
                            <div
                              key={r.ids[0]}
                              className="flex items-center gap-1 px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest"
                            >
                              <span>{r.tipo}</span>
                              {!r.isOrigen && (
                                <span className="text-[7px] text-foreground/40 italic font-normal">
                                  (Inv)
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => {
                                  setDeletingRelIds(r.ids);
                                  setIsDeleteModalOpen(true);
                                }}
                                className="text-primary/45 hover:text-red-400 bg-transparent border-none p-0 cursor-pointer flex items-center"
                                title="Eliminar este vínculo"
                              >
                                <span className="material-symbols-outlined text-[10px]">close</span>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRelIds([]);
        }}
        onConfirm={async () => {
          if (deletingRelIds.length > 0) {
            const promises = deletingRelIds.map((id) => handleDelete(id));
            await Promise.all(promises);
          }
          setIsDeleteModalOpen(false);
          setDeletingRelIds([]);
        }}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que deseas eliminar este vínculo genealógico? Esta acción no se puede deshacer."
        confirmText="Eliminar"
        cancelText="Cancelar"
      />
    </div>
  );
};

export default FamilyTreeAssigner;
