import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { entityService } from '@repositories/entityService';
import { folderService } from '@repositories/folderService';
import { Entidad, Carpeta } from '@domain/models/database';

interface EntityDatabaseProps {
  projectId?: number;
}

const TYPE_OPTIONS = [
  { value: 'ALL', label: '✦ Todo', icon: 'apps' },
  { value: 'individual', label: 'Personajes', icon: 'person' },
  { value: 'location', label: 'Lugares', icon: 'location_on' },
  { value: 'culture', label: 'Culturas', icon: 'groups' },
  { value: 'Map', label: 'Mapas', icon: 'map' },
  { value: 'TIMELINE', label: 'Timelines', icon: 'calendar_month' },
];

const TYPE_ICON_MAP: Record<string, string> = {
  individual: 'person',
  Individual: 'person',
  location: 'location_on',
  Location: 'location_on',
  culture: 'groups',
  Culture: 'groups',
  Map: 'map',
  Mapa: 'map',
  TIMELINE: 'calendar_month',
  Timeline: 'calendar_month',
};

const getEntityIcon = (tipo: string) => TYPE_ICON_MAP[tipo] ?? 'article';

const EntityDatabase: React.FC<EntityDatabaseProps> = ({ projectId }) => {
  const [allEntities, setAllEntities] = useState<Entidad[]>([]);
  const [folders, setFolders] = useState<Carpeta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [folderFilter, setFolderFilter] = useState<number | 'ALL'>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<Entidad | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [entities, folds] = await Promise.all([
        entityService.getAllByProject(projectId),
        folderService.getByProject(projectId),
      ]);
      setAllEntities(entities.filter(e => !e.borrado));
      setFolders(folds);
    } catch { /* silencioso */ }
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  // Escucha actualizaciones globales
  useEffect(() => {
    const handler = () => load();
    window.addEventListener('folder-update', handler);
    window.addEventListener('map-updated', handler);
    return () => {
      window.removeEventListener('folder-update', handler);
      window.removeEventListener('map-updated', handler);
    };
  }, [load]);

  const filtered = useMemo(() => {
    return allEntities.filter(e => {
      const matchSearch = !searchTerm ||
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchType = typeFilter === 'ALL' || e.tipo === typeFilter;
      const matchFolder = folderFilter === 'ALL' || e.carpeta_id === folderFilter;
      return matchSearch && matchType && matchFolder;
    });
  }, [allEntities, searchTerm, typeFilter, folderFilter]);

  const selectedEntityAttrs = useMemo(() => {
    if (!selectedEntity) return {};
    try {
      return typeof selectedEntity.contenido_json === 'string'
        ? JSON.parse(selectedEntity.contenido_json)
        : (selectedEntity.contenido_json || {});
    } catch { return {}; }
  }, [selectedEntity]);

  const folderName = (folderId: number | null) =>
    folders.find(f => f.id === folderId)?.nombre ?? '—';

  if (loading) return (
    <div className="flex-1 flex items-center justify-center opacity-30">
      <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
    </div>
  );

  // ── Vista detalle ────────────────────────────────────────────────────────
  if (selectedEntity) {
    const img = selectedEntityAttrs.imageUrl || selectedEntityAttrs.image || selectedEntityAttrs.avatar || '';
    const tags: string[] = selectedEntityAttrs.tags || [];

    return (
      <div className="flex flex-col h-full overflow-hidden animate-in slide-in-from-right-4 duration-300">
        {/* Header detalle */}
        <div className="flex items-center gap-3 px-6 py-4 border-b border-foreground/10 bg-foreground/[0.02] shrink-0">
          <button
            onClick={() => setSelectedEntity(null)}
            className="size-8 flex items-center justify-center text-foreground/50 hover:text-primary hover:bg-primary/10 transition-all rounded-none border border-foreground/10"
          >
            <span className="material-symbols-outlined text-sm">arrow_back</span>
          </button>
          <div className="flex-1 min-w-0">
            <div className="text-[9px] font-black uppercase tracking-widest text-foreground/40 mb-0.5">{selectedEntity.tipo}</div>
            <div className="text-sm font-black text-foreground truncate">{selectedEntity.nombre}</div>
          </div>
          <div className="size-8 flex items-center justify-center bg-primary/10 text-primary rounded-none border border-primary/20">
            <span className="material-symbols-outlined text-sm">{getEntityIcon(selectedEntity.tipo)}</span>
          </div>
        </div>

        {/* Contenido detalle */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
          {/* Imagen */}
          {img && (
            <div className="aspect-video rounded-none overflow-hidden border border-foreground/10 bg-foreground/5">
              <img src={img} alt={selectedEntity.nombre} className="w-full h-full object-cover" />
            </div>
          )}

          {/* Descripción */}
          {selectedEntity.descripcion && (
            <div className="space-y-1.5">
              <div className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Descripción</div>
              <p className="text-xs text-foreground/70 leading-relaxed">{selectedEntity.descripcion}</p>
            </div>
          )}

          {/* Meta */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 bg-foreground/[0.03] border border-foreground/5 space-y-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Carpeta</div>
              <div className="text-xs font-bold text-foreground/80 truncate">{folderName(selectedEntity.carpeta_id)}</div>
            </div>
            <div className="p-3 bg-foreground/[0.03] border border-foreground/5 space-y-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Tipo</div>
              <div className="text-xs font-bold text-foreground/80">{selectedEntity.tipo}</div>
            </div>
            <div className="col-span-2 p-3 bg-foreground/[0.03] border border-foreground/5 space-y-1">
              <div className="text-[9px] font-black uppercase tracking-widest text-foreground/30">Última edición</div>
              <div className="text-xs font-mono text-foreground/60">
                {new Date(selectedEntity.fecha_actualizacion).toLocaleString('es-ES')}
              </div>
            </div>
          </div>

          {/* Tags */}
          {tags.length > 0 && (
            <div className="space-y-2">
              <div className="text-[9px] font-black uppercase tracking-widest text-foreground/40">Etiquetas</div>
              <div className="flex flex-wrap gap-1.5">
                {tags.map((tag, i) => (
                  <span key={i} className="px-2 py-0.5 text-[9px] font-bold bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Atributos extra del JSON */}
          {selectedEntityAttrs.color && (
            <div className="flex items-center gap-3">
              <div
                className="size-5 rounded-full border-2 border-foreground/20"
                style={{ backgroundColor: selectedEntityAttrs.color }}
              />
              <span className="text-[10px] font-mono text-foreground/50">{selectedEntityAttrs.color}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Vista lista ──────────────────────────────────────────────────────────
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Barra de herramientas */}
      <div className="shrink-0 p-4 space-y-3 border-b border-foreground/10 bg-foreground/[0.01]">
        {/* Búsqueda */}
        <div className="relative">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/40">search</span>
          <input
            type="text"
            placeholder="Buscar entidades..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-background border border-foreground/10 rounded-none pl-9 pr-4 py-2 text-xs text-foreground placeholder:text-foreground/30 outline-none focus:border-primary/50 transition-colors"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-foreground/30 hover:text-foreground transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          )}
        </div>

        {/* Filtros */}
        <div className="flex gap-2">
          {/* Tipo */}
          <div className="relative flex-1">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="w-full appearance-none bg-background border border-foreground/10 rounded-none px-3 py-1.5 pr-7 text-[10px] font-bold text-foreground outline-none focus:border-primary/50 transition-colors"
            >
              {TYPE_OPTIONS.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-foreground/40 pointer-events-none">expand_more</span>
          </div>

          {/* Carpeta */}
          <div className="relative flex-1">
            <select
              value={folderFilter === 'ALL' ? 'ALL' : String(folderFilter)}
              onChange={e => setFolderFilter(e.target.value === 'ALL' ? 'ALL' : Number(e.target.value))}
              className="w-full appearance-none bg-background border border-foreground/10 rounded-none px-3 py-1.5 pr-7 text-[10px] font-bold text-foreground outline-none focus:border-primary/50 transition-colors"
            >
              <option value="ALL">📁 Todas</option>
              {folders.map(f => (
                <option key={f.id} value={String(f.id)}>{f.nombre}</option>
              ))}
            </select>
            <span className="material-symbols-outlined absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-foreground/40 pointer-events-none">expand_more</span>
          </div>
        </div>

        {/* Contador */}
        <div className="text-[9px] font-black uppercase tracking-widest text-foreground/30">
          {filtered.length} {filtered.length === 1 ? 'entidad' : 'entidades'}
          {filtered.length !== allEntities.length && ` de ${allEntities.length}`}
        </div>
      </div>

      {/* Lista */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full opacity-20 gap-3">
            <span className="material-symbols-outlined text-4xl">search_off</span>
            <p className="text-[10px] font-black uppercase tracking-widest">Sin resultados</p>
          </div>
        ) : (
          <div className="divide-y divide-foreground/[0.05]">
            {filtered.map(entity => {
              const attrs = (() => {
                try { return typeof entity.contenido_json === 'string' ? JSON.parse(entity.contenido_json) : {}; }
                catch { return {}; }
              })();
              const img = attrs.imageUrl || attrs.image || attrs.avatar || '';

              return (
                <button
                  key={entity.id}
                  onClick={() => setSelectedEntity(entity)}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-primary/5 hover:border-l-2 hover:border-primary transition-all text-left group"
                >
                  {/* Thumbnail o icono */}
                  <div className="size-9 shrink-0 overflow-hidden border border-foreground/10 bg-foreground/5 flex items-center justify-center">
                    {img ? (
                      <img src={img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    ) : (
                      <span className="material-symbols-outlined text-sm text-foreground/30">{getEntityIcon(entity.tipo)}</span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-foreground truncate group-hover:text-primary transition-colors">
                      {entity.nombre}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[9px] uppercase tracking-wider text-foreground/40 font-bold">{entity.tipo}</span>
                      {entity.carpeta_id && (
                        <>
                          <span className="text-foreground/20 text-[9px]">·</span>
                          <span className="text-[9px] text-foreground/30 truncate">{folderName(entity.carpeta_id)}</span>
                        </>
                      )}
                    </div>
                  </div>

                  <span className="material-symbols-outlined text-sm text-foreground/20 group-hover:text-primary transition-colors shrink-0">
                    chevron_right
                  </span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityDatabase;
