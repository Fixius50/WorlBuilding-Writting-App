import React from 'react';
import { Button } from "@components";
import { useRelationshipManager } from '../hooks/useRelationshipManager';

const ENTITY_TYPES = [
  { value: 'All', label: 'Todo' },
  { value: 'Individual', label: 'Personaje' },
  { value: 'Group', label: 'Grupo/Facción' },
  { value: 'Location', label: 'Lugar' },
  { value: 'Item', label: 'Objeto' },
  { value: 'Event', label: 'Evento' },
  { value: 'Timeline', label: 'Línea de Tiempo' },
  { value: 'Map', label: 'Mapa' },
  { value: 'Structure', label: 'Construcción' },
  { value: 'Creature', label: 'Criatura' },
  { value: 'Plant', label: 'Flora' }
];

const RelationshipManager = ({ entityId, entityType }: { entityId: number | string; entityType?: string }) => {
  const {
    relationships,
    loading,
    isAdding,
    setIsAdding,
    targetType,
    setTargetType,
    targetItems,
    targetSearch,
    setTargetSearch,
    selectedTargetId,
    setSelectedTargetId,
    relType,
    setRelType,
    description,
    setDescription,
    handleSave,
    handleDelete
  } = useRelationshipManager(entityId, entityType);

  return (
    <div className="p-6 space-y-6">
      <header className="flex justify-center gap-12 text-center items-center">
        <h3 className="text-lg font-bold text-foreground uppercase tracking-widest">Relationships</h3>
        <Button variant="secondary" icon="add_link" onClick={() => setIsAdding(!isAdding)}>
          {isAdding ? 'Cancel' : 'Connect'}
        </Button>
      </header>

      {isAdding && (
        <div className="p-4 rounded-none monolithic-panel space-y-4 animate-in fade-in slide-in-from-top-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Target Type</label>
              <select
                className="w-full monolithic-panel rounded-none p-2 text-sm text-foreground outline-none focus:border-primary"
                value={targetType}
                onChange={e => {
                  setTargetType(e.target.value);
                  setTargetSearch('');
                  setSelectedTargetId(null);
                }}
              >
                {ENTITY_TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#1a1a20] text-foreground">{t.label}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Search & Select Target</label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full monolithic-panel rounded-none p-2 pl-8 text-sm text-foreground outline-none focus:border-primary"
                  placeholder="Type to search..."
                  value={targetSearch}
                  onChange={e => setTargetSearch(e.target.value)}
                />
                <span className="material-symbols-outlined absolute left-2 top-2 text-foreground/60 text-sm">search</span>

                {targetSearch && !selectedTargetId && (
                  <div className="absolute top-full left-0 right-0 mt-1 monolithic-panel border border-foreground/40 rounded-none shadow-2xl z-50 max-h-40 overflow-y-auto custom-scrollbar">
                    {targetItems.filter(item => item.nombre.toLowerCase().includes(targetSearch.toLowerCase())).length === 0 ? (
                      <div className="p-3 text-[10px] text-foreground/60 text-center italic">No results found</div>
                    ) : (
                      targetItems.filter(item => item.nombre.toLowerCase().includes(targetSearch.toLowerCase())).map(item => (
                        <div
                          key={item.id}
                          onClick={() => {
                            setSelectedTargetId(item.id);
                            setTargetSearch(item.nombre);
                          }}
                          className="p-2 hover:bg-primary/10 hover:text-primary cursor-pointer text-xs text-foreground/60 border-b border-foreground/10 last:border-0"
                        >
                          {item.nombre}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {selectedTargetId && (
                  <button
                    onClick={() => { setSelectedTargetId(null); setTargetSearch(''); }}
                    className="absolute right-2 top-2 text-foreground/60 hover:text-primary transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">close</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Relationship Type</label>
            <input
              type="text"
              placeholder="e.g. Father of, Located in, Enemy of..."
              className="w-full monolithic-panel rounded-none p-2 text-sm text-foreground outline-none focus:border-primary"
              value={relType}
              onChange={e => setRelType(e.target.value)}
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/60">Description (The Why)</label>
            <textarea
              placeholder="Explain the nature of this connection..."
              className="w-full monolithic-panel rounded-none p-2 text-sm text-foreground outline-none focus:border-primary h-20 resize-none"
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="primary" icon="save" onClick={handleSave} disabled={!selectedTargetId || !relType}>Save Connection</Button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {loading ? (
          <div className="text-center text-foreground/60 py-8">Scanning connections...</div>
        ) : relationships.length === 0 ? (
          <div className="text-center text-foreground/60 py-8 italic border border-dashed border-foreground/40 rounded-none">No connections established</div>
        ) : (
          relationships.map((rel, i) => (
            <div key={rel.id || i} className="group relative p-4 rounded-none monolithic-panel border border-foreground/10 hover:border-primary/50 transition-all flex items-start gap-4">
              <div className="mt-1">
                <span className="material-symbols-outlined text-foreground/60">
                  {rel.isOutgoing ? 'arrow_outward' : 'arrow_inward'}
                </span>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-bold text-foreground/60 uppercase tracking-wider">{rel.isOutgoing ? 'To:' : 'From:'}</span>
                  <span className="text-sm font-bold text-foreground">{rel.otherName}</span>
                  <span className="text-[9px] px-1.5 py-0.5 rounded bg-foreground/10 text-foreground/60 font-bold uppercase tracking-wider">{rel.otherType}</span>
                </div>
                <div className="text-primary text-xs font-black uppercase tracking-widest mb-2">{rel.tipo}</div>
                {rel.descripcion && (
                  <p className="text-xs text-foreground/60 leading-relaxed bg-background/20 p-2 rounded-none border border-foreground/10">
                    "{rel.descripcion}"
                  </p>
                )}
              </div>
              <button
                onClick={() => handleDelete(rel.id)}
                className="opacity-0 group-hover:opacity-100 p-2 text-foreground/60 hover:text-red-400 transition-all"
              >
                <span className="material-symbols-outlined text-sm">delete</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default RelationshipManager;




