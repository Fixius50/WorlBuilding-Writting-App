import React, { useState, useEffect } from 'react';
import { useParams, Link, useOutletContext, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { entityService } from '@repositories/entityService';
import { Entidad } from '@domain/models/database';
import GlassPanel from '@atoms/GlassPanel';
import Avatar from '@atoms/Avatar';
import Button from '@atoms/Button';
import SecondaryTabs from '@molecules/SecondaryTabs';
import MiniGraph from '../components/MiniGraph';
import MiniTimeline from '../components/MiniTimeline';

interface ProfileOutletContext {
  setRightOpen: (open: boolean) => void;
  setRightPanelTab: (tab: string) => void;
  setRightPanelContent: (content: React.ReactNode) => void;
  setRightPanelTitle: (title: React.ReactNode) => void;
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
  [key: string]: unknown;
}

const EntityProfile = () => {
  const { username, projectName, folderId, entityId } = useParams();
  const navigate = useNavigate();
  const { setRightOpen, setRightPanelTab, setRightPanelContent, setRightPanelTitle } = useOutletContext<ProfileOutletContext>();
  const [entity, setEntity] = useState<EntityWithExtra | null>(null);
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setRightOpen(true);
    setRightPanelTab('CONTEXT');
    
    return () => {
      setRightPanelContent(null);
      setRightPanelTitle(null);
    };
  }, []);

  useEffect(() => {
    loadEntity();
  }, [entityId]);

  const loadEntity = async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const data = await entityService.getById(Number(entityId));
      if (data) {
        const extra = typeof data.contenido_json === 'string'
          ? JSON.parse(data.contenido_json)
          : (data.contenido_json || {});
        
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

  useEffect(() => {
    if (entity) {
      setRightPanelTitle(
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Metadatos Etéreos</span>
          <span className="text-foreground font-black text-sm truncate">{entity.nombre}</span>
        </div>
      );

      setRightPanelContent(
        <div className="p-6 space-y-8 animate-in fade-in duration-500">
           <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-4 px-2">Identidad Técnica</h3>
              <div className="bg-foreground/5 border border-foreground/10 p-4 space-y-3">
                 <div className="flex justify-between items-center pb-2 border-b border-foreground/5">
                    <span className="text-[10px] text-foreground/60 uppercase font-bold">UID</span>
                    <span className="text-[10px] font-mono text-foreground/40">{entity.id}</span>
                 </div>
                 <div className="flex justify-between items-center pb-2 border-b border-foreground/5">
                    <span className="text-[10px] text-foreground/60 uppercase font-bold">Fecha de Inicio</span>
                    <span className="text-[10px] text-foreground/40">{new Date(entity.fecha_creacion).toLocaleDateString()}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] text-foreground/60 uppercase font-bold">Última Mutación</span>
                    <span className="text-[10px] text-foreground/40">{new Date(entity.fecha_actualizacion).toLocaleDateString()}</span>
                 </div>
              </div>
           </section>

           <section>
              <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-4 px-2">Tags de Clasificación</h3>
              <div className="flex flex-wrap gap-2">
                {(entity.tags || '').split(',').filter(Boolean).map((tag, i) => (
                  <span key={i} className="text-[10px] font-bold text-foreground/60 bg-foreground/10 px-3 py-1 border border-foreground/10 uppercase tracking-tighter hover:text-primary hover:border-primary/40 transition-colors cursor-default">
                    {tag.trim()}
                  </span>
                ))}
              </div>
           </section>
        </div>
      );
    }
  }, [entity]);

  if (loading) return <div className="p-20 text-center animate-pulse text-foreground/50 h-full flex items-center justify-center font-black uppercase tracking-[0.4em] text-xs">Accediendo a la Cápsula...</div>;
  if (!entity) return <div className="p-20 text-center text-red-400">Error: Entidad no encontrada.</div>;

  const attributes = (entity.valores || []).map((val) => ({
    label: val.plantilla.nombre,
    value: val.valor || '',
    type: val.plantilla.tipo
  })).filter((a) => ['number', 'text', 'short_text'].includes(a.type));

  const tabs = [
    { id: 'GENERAL', label: 'Esencia' },
    { id: 'RELACIONES', label: 'Hilos de Causalidad' },
    { id: 'BACKLINKS', label: 'Apariciones' },
  ];

  const handleEntityNavigate = (id: number) => {
    navigate(`/${username || 'local'}/${projectName}/bible/folder/${folderId}/entity/${id}`);
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#0a0a0a] overflow-hidden animate-in fade-in duration-700">
      
      {/* --- PREMIUM HEADER --- */}
      <div className="shrink-0 p-8 lg:px-12 lg:pt-16 lg:pb-8 border-b border-foreground/5 bg-gradient-to-b from-primary/5 to-transparent relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/2" />
        
        <div className="flex flex-col lg:flex-row items-center lg:items-end gap-10 relative z-10">
          <Avatar 
            name={entity.nombre} 
            size="xl" 
            className="size-32 lg:size-48 rounded-none border-t-4 border-primary shadow-[0_40px_80px_rgba(0,0,0,0.5)] bg-card" 
          />
          
          <div className="flex-1 text-center lg:text-left space-y-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-4">
                <h1 className="text-4xl lg:text-6xl font-serif font-black text-foreground tracking-tight leading-none italic">{entity.nombre}</h1>
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border border-primary/30">
                  {entity.tipo || 'ENTIDAD'}
                </span>
                {entity.categoria && (
                  <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-purple-500/10 text-purple-400 border border-purple-500/30">
                    {entity.categoria}
                  </span>
                )}
              </div>
              <p className="text-lg text-foreground/40 font-medium italic max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                "{entity.descripcion || "Existencia sin descripción vinculada aún."}"
              </p>
            </div>

            <div className="flex items-center justify-center lg:justify-start gap-4">
               <Link to={`/${username || 'local'}/${projectName}/bible/folder/${folderId}/entity/${entityId}/edit`}>
                  <button className="px-6 py-3 bg-foreground text-background text-[10px] font-black uppercase tracking-[0.2em] shadow-2xl hover:bg-primary transition-all active:scale-95">
                    Transmutar Archivo
                  </button>
               </Link>
               <button className="size-11 border border-foreground/10 hover:border-primary/50 text-foreground/40 hover:text-primary transition-all flex items-center justify-center">
                  <span className="material-symbols-outlined text-xl">share</span>
               </button>
            </div>
          </div>
        </div>
      </div>

      {/* --- CONTENT AREA & TABS --- */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="px-8 lg:px-12 py-4 bg-background/40 backdrop-blur-md border-b border-foreground/5 sticky top-0 z-20">
          <SecondaryTabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
          />
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            
            {activeTab === 'GENERAL' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 animate-in slide-in-from-bottom-4 duration-500">
                
                {/* Visuals: Graph & Meta */}
                <div className="lg:col-span-12 space-y-12">
                   <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      <MiniGraph entityId={Number(entityId)} onNavigate={handleEntityNavigate} />
                      
                      <div className="flex flex-col gap-8">
                         <div className="grid grid-cols-2 gap-4">
                            {attributes.slice(0, 4).map((attr, i) => (
                              <div key={i} className="p-6 bg-foreground/[0.03] border border-foreground/5">
                                 <div className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-1">{attr.label}</div>
                                 <div className="text-xl font-bold text-foreground">
                                    {attr.value}
                                    {!isNaN(parseFloat(attr.value)) && <span className="text-[10px] text-foreground/20 ml-1">pts</span>}
                                 </div>
                              </div>
                            ))}
                         </div>
                         <div className="flex-1 p-8 border border-dashed border-foreground/10 flex flex-col items-center justify-center text-center opacity-40">
                            <span className="material-symbols-outlined text-4xl mb-3">auto_awesome</span>
                            <span className="text-[10px] font-black uppercase tracking-widest leading-relaxed max-w-[200px]">
                               Nivel de Presencia en el Mundo: Elevado
                            </span>
                         </div>
                      </div>
                   </div>
                </div>

                {/* Vertical Timeline */}
                <div className="lg:col-span-12">
                   <div className="pb-8 mb-8 border-b border-foreground/5">
                        <h3 className="text-xs font-black uppercase tracking-[0.3em] text-foreground/60 flex items-center gap-3">
                           <span className="material-symbols-outlined text-lg">history_edu</span>
                           Cronología Vital del Arcano
                        </h3>
                   </div>
                   <MiniTimeline entityId={Number(entityId)} />
                </div>
              </div>
            )}

            {activeTab === 'RELACIONES' && (
              <div className="animate-in fade-in duration-500 py-20 text-center flex flex-col items-center justify-center opacity-30">
                 <span className="material-symbols-outlined text-6xl mb-4">account_tree</span>
                 <p className="font-serif italic text-lg italic">"En la red de almas, ningún ser es un desierto."</p>
                 <span className="text-[10px] font-black uppercase tracking-widest mt-2">(Módulo de Relaciones Completo en Desarrollo)</span>
              </div>
            )}

            {activeTab === 'BACKLINKS' && (
              <div className="animate-in slide-in-from-right-8 duration-500 space-y-6 max-w-3xl">
                 <div className="pb-4 border-b border-primary/20">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary">Referencias en la Obra</h3>
                 </div>
                 {[1,2,3].map(i => (
                    <div key={i} className="p-4 bg-foreground/5 border border-foreground/10 hover:border-primary/40 transition-all group">
                       <div className="flex justify-between items-center mb-2">
                          <span className="text-[10px] font-bold text-foreground/40 uppercase tracking-tighter">Capítulo {i}: Los Albores</span>
                          <span className="text-[9px] text-primary font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Leer Fragmento →</span>
                       </div>
                       <p className="text-sm text-foreground/60 leading-relaxed italic">
                          "...y entre las sombras, {entity.nombre} observaba el destino plegarse sobre los hombres..."
                       </p>
                    </div>
                 ))}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  );
};

export default EntityProfile;
