import React, { useState, useEffect, useCallback } from 'react';
import { entityService } from '@repositories/entityService';
import { relationshipService, Relacion } from '@repositories/relationshipService';
import { Entidad } from '@domain/models/database';
import Avatar from '@atoms/Avatar';
import MonolithicPanel from '@atoms/MonolithicPanel';
import { settingsService } from '@repositories/settingsService';

interface FamilyTreeAssignerProps {
  entityId: number;
  projectId: number;
}

interface RelacionExtendida extends Relacion {
  nombre_origen?: string;
  nombre_destino?: string;
}

const DEFAULT_RELATIONSHIP_TYPES = [
  "PADRE",
  "MADRE",
  "HIJO",
  "HIJA",
  "HERMANO/A",
  "PAREJA/CÓNYUGE"
];

const FamilyTreeAssigner: React.FC<FamilyTreeAssignerProps> = ({ entityId, projectId }) => {
  const [relationships, setRelationships] = useState<RelacionExtendida[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Entidad[]>([]);
  const [selectedRelative, setSelectedRelative] = useState<Entidad | null>(null);
  const [selectedType, setSelectedType] = useState(DEFAULT_RELATIONSHIP_TYPES[0]);
  const [customType, setCustomType] = useState('');
  const [availableTypes, setAvailableTypes] = useState<string[]>(DEFAULT_RELATIONSHIP_TYPES);
  const [loading, setLoading] = useState(true);
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const SETTINGS_KEY = `CUSTOM_REL_TYPES_${projectId}`;

  const loadRelationships = useCallback(async () => {
    setLoading(true);
    try {
      const data = await relationshipService.getByEntity(entityId);
      setRelationships(data as RelacionExtendida[]);
      
      // Cargar tipos personalizados del proyecto
      const storedTypes = await settingsService.get(SETTINGS_KEY);
      if (storedTypes) {
        const parsed = JSON.parse(storedTypes);
        setAvailableTypes([...DEFAULT_RELATIONSHIP_TYPES, ...parsed]);
      }
    } catch (err) {
      console.error("Error loading relationships", err);
    } finally {
      setLoading(false);
    }
  }, [entityId, projectId, SETTINGS_KEY]);

  useEffect(() => {
    loadRelationships();
  }, [loadRelationships]);

  // Configuración de alcance de búsqueda:
  // true = Busca en todo el proyecto / false = Podría limitarse a la carpeta actual en el futuro
  const GLOBAL_PROJECT_SEARCH = true;

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        // Obtenemos todas las entidades del proyecto (Búsqueda Global)
        const all = await entityService.getAllByProject(projectId);
        
        const filtered = all.filter(e => {
          const matchesQuery = e.nombre.toLowerCase().includes(searchQuery.toLowerCase());
          const isNotCurrent = e.id !== entityId;
          
          // Si GLOBAL_PROJECT_SEARCH es true, no filtramos por carpeta_id
          return matchesQuery && isNotCurrent;
        });

        setSearchResults(filtered);
      } catch (err) {
        console.error("Search error", err);
      }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, projectId, entityId, GLOBAL_PROJECT_SEARCH]);

  const handleAddRelationship = async () => {
    if (!selectedRelative) return;
    const finalType = isAddingCustom ? customType.trim().toUpperCase() : selectedType;
    if (!finalType) return;

    try {
      await relationshipService.create({
        origen_id: entityId,
        destino_id: selectedRelative.id,
        tipo: finalType,
        descripcion: '',
        project_id: projectId
      });

      // Si es un tipo nuevo, lo guardamos para el proyecto
      if (!availableTypes.includes(finalType)) {
        const customOnly = availableTypes.filter(t => !DEFAULT_RELATIONSHIP_TYPES.includes(t));
        const updatedCustom = [...customOnly, finalType];
        await settingsService.set(SETTINGS_KEY, JSON.stringify(updatedCustom));
        setAvailableTypes([...DEFAULT_RELATIONSHIP_TYPES, ...updatedCustom]);
      }

      setSelectedRelative(null);
      setSearchQuery('');
      setCustomType('');
      setIsAddingCustom(false);
      loadRelationships();
    } catch (err) {
      console.error("Error creating relationship", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este vínculo genealógico?')) return;
    try {
      await relationshipService.delete(id);
      loadRelationships();
    } catch (err) {
      console.error("Error deleting relationship", err);
    }
  };

  return (
    <div className="space-y-8">
      <MonolithicPanel className="p-8 space-y-6 bg-foreground/[0.02] border-foreground/10">
        <header className="flex items-center gap-3 text-primary border-b border-foreground/5 pb-4">
          <span className="material-symbols-outlined text-lg">account_tree</span>
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground">Asignación de Linaje</h3>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Formulario de Adición */}
          <div className="space-y-4">
            <label className="text-[9px] font-black uppercase text-foreground/40 tracking-[0.2em] block px-1">
              Buscar Familiar
            </label>
            <div className="relative">
              <input
                type="text"
                className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-none p-4 text-[11px] text-foreground outline-none focus:border-primary/50 placeholder:text-foreground/20"
                placeholder="Nombre del personaje..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full left-0 w-full bg-background border border-foreground/10 z-50 shadow-2xl max-h-60 overflow-y-auto custom-scrollbar">
                  {searchResults.map(res => (
                    <div 
                      key={res.id}
                      onClick={() => {
                        setSelectedRelative(res);
                        setSearchQuery(res.nombre);
                        setSearchResults([]);
                      }}
                      className="p-3 hover:bg-primary/10 flex items-center gap-3 cursor-pointer"
                    >
                      <Avatar name={res.nombre} size="xs" />
                      <span className="text-[10px] font-bold uppercase tracking-tight text-foreground/80">{res.nombre}</span>
                    </div>
                  ))}
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
                    onClick={() => { setIsAddingCustom(false); setCustomType(''); setSelectedType(DEFAULT_RELATIONSHIP_TYPES[0]); }}
                    className="px-3 text-foreground/40 hover:text-foreground"
                  >
                    <span className="material-symbols-outlined text-sm">cancel</span>
                  </button>
                </div>
              ) : (
                <select
                  className="flex-1 bg-foreground/[0.03] border border-foreground/10 rounded-none p-4 text-[10px] font-black text-foreground uppercase tracking-widest outline-none focus:border-primary/50 cursor-pointer appearance-none"
                  value={selectedType}
                  onChange={(e) => {
                    if (e.target.value === 'CUSTOM_NEW') {
                      setIsAddingCustom(true);
                    } else {
                      setSelectedType(e.target.value);
                    }
                  }}
                >
                  {availableTypes.map(t => (
                    <option key={t} value={t} className="bg-background">{t}</option>
                  ))}
                  <option value="CUSTOM_NEW" className="bg-background text-primary">-- PERSONALIZAR OTRO --</option>
                </select>
              )}
              <button
                onClick={handleAddRelationship}
                disabled={!selectedRelative || (isAddingCustom && !customType)}
                className={`px-6 bg-primary text-primary-foreground font-black text-[9px] uppercase tracking-widest disabled:opacity-30 disabled:grayscale`}
              >
                Vincular
              </button>
            </div>
          </div>
        </div>
      </MonolithicPanel>

      {/* Lista de Relaciones */}
      <div className="space-y-4">
        <h3 className="text-[9px] font-black uppercase tracking-[0.3em] text-foreground/30 px-2 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">groups</span>
          Familiares Registrados
        </h3>

        {loading ? (
          <div className="py-12 text-center text-[9px] font-black uppercase tracking-widest text-primary/40">
            Sincronizando registros genealógicos...
          </div>
        ) : relationships.length === 0 ? (
          <div className="py-20 border-2 border-dashed border-foreground/5 flex flex-col items-center justify-center text-foreground/20">
            <span className="material-symbols-outlined text-4xl mb-4 opacity-20">family_history</span>
            <p className="text-[10px] font-black uppercase tracking-widest">Sin linaje definido aún</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {relationships.map(rel => {
              const isOrigen = rel.origen_id === entityId;
              const familiarNombre = isOrigen ? rel.nombre_destino : rel.nombre_origen;
              
              return (
                <div 
                  key={rel.id}
                  className="group relative bg-foreground/[0.02] border border-foreground/10 p-4 flex items-center justify-between hover:border-primary/30 hover:bg-foreground/[0.04]"
                >
                  <div className="flex items-center gap-4">
                    <Avatar name={familiarNombre || '?'} size="sm" />
                    <div className="space-y-1">
                      <div className="text-[10px] font-black uppercase tracking-tight text-foreground/80">{familiarNombre}</div>
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 bg-primary/10 border border-primary/20 text-primary text-[8px] font-black uppercase tracking-widest">
                          {rel.tipo}
                        </span>
                        {!isOrigen && (
                          <span className="text-[8px] text-foreground/30 italic">(Inverso)</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(rel.id)}
                    className="size-8 flex items-center justify-center text-foreground/10 hover:text-red-400 hover:bg-red-400/5 opacity-0 group-hover:opacity-100"
                  >
                    <span className="material-symbols-outlined text-base">delete</span>
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
