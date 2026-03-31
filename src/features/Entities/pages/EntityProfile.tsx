import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { entityService } from '../../../database/entityService';
import { Entidad } from '../../../database/types';
import GlassPanel from '../../../components/common/GlassPanel';
import Avatar from '../../../components/common/Avatar';
import Button from '../../../components/common/Button';

interface ProfileOutletContext {
  setRightOpen: (open: boolean) => void;
  setRightPanelTab: (tab: string) => void;
}

interface EntityWithExtra extends Omit<Entidad, 'valores'> {
  valores?: {
    valor: string | null;
    plantilla: {
      nombre: string;
      tipo: string;
    }
  }[];
  tags?: string;
  categoria?: string;
  carpeta?: {
    nombre: string;
  };
  [key: string]: unknown; // Extended fields from contenido_json
}

const EntityProfile = () => {
  const { username, projectName, folderSlug, entitySlug } = useParams();
  const { setRightOpen, setRightPanelTab } = useOutletContext<ProfileOutletContext>();
  const [entity, setEntity] = useState<EntityWithExtra | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

  useEffect(() => {
    setRightOpen(true);
    setRightPanelTab('CONTEXT');

    const interval = setInterval(() => {
      const el = document.getElementById('global-right-panel-portal');
      if (el) {
        setPortalTarget(el);
        clearInterval(interval);
      }
    }, 100);

    return () => {
      clearInterval(interval);
      setRightPanelTab('NOTEBOOKS');
    };
  }, []);

  useEffect(() => {
    loadEntity();
  }, [entitySlug]);

  const loadEntity = async () => {
    if (!entitySlug) return;
    setLoading(true);
    try {
      const data = await entityService.getById(Number(entitySlug));
      if (data) {
        const extra = typeof data.contenido_json === 'string'
          ? JSON.parse(data.contenido_json)
          : (data.contenido_json || {});
        
        // Fetch values for attributes
        const vals = await entityService.getValues(data.id);
        
        setEntity({
          ...data,
          ...extra,
          valores: vals.map(v => ({
            valor: v.valor,
            plantilla: v.plantilla || { nombre: 'Atributo', tipo: 'text' }
          }))
        });
      }
    } catch (err) {
      console.error("Failed to load entity", err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-20 text-center animate-pulse text-foreground/50">Accessing Archives...</div>;
  if (!entity) return <div className="p-20 text-center text-red-400">Entity not found.</div>;

  // Derived Data
  const attributes = (entity.valores || []).map((val) => ({
    label: val.plantilla.nombre,
    value: val.valor || '',
    type: val.plantilla.tipo
  })).filter((a) => ['number', 'text', 'short_text'].includes(a.type));

  // Simple Relation Mock until backend relation graph is fully wired
  const relationships = (entity.valores || [])
    .filter((v) => v.plantilla.tipo === 'entity_link' && v.valor)
    .map((v) => ({
      name: "Linked Entity (ID: " + v.valor + ")",
      role: v.plantilla.nombre,
      type: "Link"
    }));

  return (
    <div className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">

      {/* --- HEADER --- */}
      <header className="flex flex-col lg:flex-row items-start gap-8 mb-12">
        <div className="relative group">
          <Avatar name={entity.nombre} size="xl" className="size-32 lg:size-40 rounded-none border-2 border-primary/30 ring-4 ring-primary/10 shadow-2xl" />
          <div className="absolute -bottom-2 -right-2 size-8 rounded-none bg-primary flex items-center justify-center text-foreground border-4 border-background-dark shadow-lg">
            <span className="material-symbols-outlined text-sm">verified</span>
          </div>
        </div>

        <div className="flex-1 space-y-4 pt-2">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl lg:text-5xl font-manrope font-black text-foreground tracking-tight leading-none">{entity.nombre}</h1>
                {entity.carpeta && (
                  <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                    {entity.carpeta.nombre}
                  </span>
                )}
                {entity.categoria && (
                  <span className="px-3 py-1 rounded-full bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest border border-purple-500/20">
                    {entity.categoria}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {(entity.tags || '').split(',').filter(Boolean).map((tag: string, i: number) => (
                  <span key={i} className="text-xs font-bold text-foreground/60 bg-foreground/5 px-2 py-1 rounded-none">
                    #{tag.trim()}
                  </span>
                ))}
              </div>
            </div>

            <Link to={`/${username || 'local'}/${projectName}/bible/folder/${folderSlug}/entity/${entitySlug}/edit`}>
              <Button variant="primary" icon="edit" size="sm">Edit Mode</Button>
            </Link>
          </div>

          <p className="text-lg text-foreground/60 leading-relaxed max-w-3xl line-clamp-3">
            {entity.descripcion || "No description provided."}
          </p>
        </div>
      </header>

      {/* --- TABS --- */}
      <div className="flex items-center gap-8 border-b border-foreground/10 mb-8">
        {['overview', 'chronology'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-4 text-xs font-black uppercase tracking-[0.2em] transition-all relative ${activeTab === tab ? 'text-foreground' : 'text-foreground/60 hover:text-foreground/60'
              }`}
          >
            {tab}
            {activeTab === tab && (
              <div className="absolute bottom-0 left-0 w-full h-0.5 bg-primary shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]"></div>
            )}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* --- MAIN CONTENT --- */}
        <div className="lg:col-span-2 space-y-8">

          {activeTab === 'overview' && (
            <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
              {/* Core Stats */}
              <GlassPanel className="p-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/60 mb-6">Core Statistics</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                  {attributes.map((attr, idx: number) => (
                    <div key={idx} className="space-y-2">
                      <div className="flex justify-between items-end">
                        <span className="text-sm font-bold text-foreground capitalize">{attr.label}</span>
                        <span className="text-xs font-black text-foreground/60">{String(attr.value).substring(0, 20)}</span>
                      </div>
                      {/* Render bar only if numeric enough */}
                      {!isNaN(parseFloat(attr.value)) && (
                        <div className="h-2 w-full bg-foreground/5 rounded-full overflow-hidden">
                          <div
                            className={`h-full bg-gradient-to-r from-primary to-indigo-400 rounded-full`}
                            style={{ width: `${Math.min(parseFloat(attr.value), 100)}%` }}
                          ></div>
                        </div>
                      )}
                    </div>
                  ))}
                  {attributes.length === 0 && <div className="text-sm text-foreground/60 italic col-span-2">No numeric attributes defined.</div>}
                </div>
              </GlassPanel>

              {/* Full Bio */}
              <GlassPanel className="p-8">
                <h3 className="text-xs font-black uppercase tracking-[0.2em] text-foreground/60 mb-8 flex items-center gap-2">
                  <span className="material-symbols-outlined text-lg">auto_stories</span>
                  Narrative & Connections
                </h3>

                <div className="space-y-8 divide-y divide-white/5">
                  <section className="pb-8">
                    {entity.descripcion && entity.descripcion.startsWith('{"') ? (
                      <div className="p-6 rounded-none border border-amber-500/30 bg-amber-500/5 flex flex-col items-center text-center">
                        <span className="material-symbols-outlined text-4xl text-amber-500 mb-3">map</span>
                        <h4 className="text-lg font-bold text-amber-500 mb-1">Interactive Map Data</h4>
                        <p className="text-sm text-foreground/60 max-w-md">
                          This entity contains spatial configuration data. Access the
                          <strong className="text-foreground ml-1">Map Editor</strong> to visualize and modify this content.
                        </p>
                      </div>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none text-foreground/60 leading-relaxed">
                        {(entity.descripcion || "No description provided.").split('\n').map((p: string, i: number) => (
                          <p key={i} className="mb-4 last:mb-0">{p}</p>
                        ))}
                      </div>
                    )}
                  </section>

                  <section className="pt-8">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2 opacity-80">
                      <span className="w-1 h-1 rounded-full bg-primary"></span>
                      Established Connections
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {relationships.map((rel, i: number) => (
                        <div key={i} className="group flex items-center gap-3 p-3 bg-foreground/5 rounded-none border border-foreground/10 hover:border-primary/30 hover:bg-foreground/10 transition-all cursor-pointer">
                          <div className="size-10 rounded-full bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center text-sm font-bold text-foreground group-hover:scale-110 transition-transform shadow-inner border border-foreground/40">
                            {String(rel.name || '').charAt(0)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-bold text-foreground group-hover:text-primary transition-colors truncate">{rel.name}</div>
                            <div className="flex items-center gap-1.5 text-xs text-foreground/60">
                              <span className="material-symbols-outlined text-[10px]">link</span>
                              <span className="truncate">{rel.role}</span>
                            </div>
                          </div>
                          <span className="material-symbols-outlined text-foreground/60 group-hover:text-primary text-sm -ml-2 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">arrow_forward</span>
                        </div>
                      ))}
                      {relationships.length === 0 && (
                        <div className="col-span-2 py-8 text-center bg-foreground/5 rounded-none border border-dashed border-foreground/40">
                          <span className="material-symbols-outlined text-foreground/60 mb-2">link_off</span>
                          <p className="text-sm text-foreground/60 italic">No established relationships found.</p>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </GlassPanel>
            </div>
          )}

          {activeTab === 'chronology' && (
            <div className="p-12 text-center border-2 border-dashed border-foreground/10 rounded-none opacity-50">
              <span className="material-symbols-outlined text-4xl mb-4">history_edu</span>
              <p className="text-sm text-foreground/60">Timeline events will appear here.</p>
            </div>
          )}

        </div>
      </div>

      {portalTarget && createPortal(
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
          <div>
            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-4">Quick Details</h3>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-foreground/5">
                <span className="text-[10px] text-foreground/40 uppercase font-bold">ID</span>
                <span className="text-[10px] font-mono text-foreground/30">{entity.id}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-foreground/5">
                <span className="text-[10px] text-foreground/40 uppercase font-bold">Sector</span>
                <Link to={`/${username || 'local'}/${projectName}/bible/folder/${folderSlug}`} className="text-[10px] font-bold text-indigo-400 hover:underline truncate max-w-[120px]">
                  {entity.carpeta?.nombre}
                </Link>
              </div>
              <div className="flex justify-between py-2 border-b border-foreground/5">
                <span className="text-[10px] text-foreground/40 uppercase font-bold">Last Edited</span>
                <span className="text-[10px] text-foreground/60">Just now</span>
              </div>
            </div>
          </div>

          {relationships.length > 0 && (
            <div className="pt-6 border-t border-foreground/10">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-4">Linked Beings</h3>
              <div className="space-y-2">
                {relationships.map((rel, i: number) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-foreground/5 border border-foreground/5 hover:border-indigo-500/30 rounded-none transition-colors cursor-pointer group">
                    <div className="size-8 rounded-none bg-indigo-500/10 flex items-center justify-center text-[10px] font-black text-indigo-400 group-hover:bg-indigo-500/20">L</div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[11px] font-bold text-foreground truncate">{rel.name}</div>
                      <div className="text-[9px] text-foreground/40 uppercase tracking-tighter">{rel.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>,
        portalTarget
      )}
    </div>
  );
};

export default EntityProfile;
