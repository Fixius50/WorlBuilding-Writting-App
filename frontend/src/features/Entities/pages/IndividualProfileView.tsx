import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { entityService } from '@repositories/entityService';
import { Entidad, Valor } from '@domain/models/database';
import Avatar from '@atoms/Avatar';
import SecondaryTabs from '@molecules/SecondaryTabs';
import MiniGraph from '../components/MiniGraph';
import MiniTimeline from '../components/MiniTimeline';
import DynamicAttributeForm from '../components/DynamicAttributeForm';
import { notebookService } from '@repositories/notebookService';

interface ProfileOutletContext {
  setRightOpen: (open: boolean) => void;
  setRightPanelTab: (tab: string) => void;
  setRightPanelContent: (content: React.ReactNode) => void;
  setRightPanelTitle: (title: React.ReactNode) => void;
}

interface EntityWithExtra extends Entidad {
  valores?: Valor[];
  tags?: string;
  categoria?: string;
  notes?: string;
  appearance?: string;
  images?: string[];
  iconUrl?: string | null;
  carpeta?: {
    nombre: string;
  };
  [key: string]: unknown;
}

const IndividualProfileView = () => {
  const { username, projectName, entityId } = useParams();
  const navigate = useNavigate();
  const { setRightOpen, setRightPanelTab, setRightPanelContent, setRightPanelTitle } = useOutletContext<ProfileOutletContext>();
  const [entity, setEntity] = useState<EntityWithExtra | null>(null);
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [loading, setLoading] = useState(true);
  const [mentions, setMentions] = useState<{ hoja_id: number; hoja_titulo: string; cuaderno_titulo: string; cuaderno_id: number }[]>([]);

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
    if (entity && projectName) {
      loadMentions();
    }
  }, [entity, projectName]);

  const loadMentions = async () => {
    if (!entity || !projectName) return;
    try {
      const mentionsData = await notebookService.getMentions(entity.project_id, entity.nombre);
      setMentions(mentionsData);
    } catch (err) {
      console.error("Failed to load mentions", err);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-black">
      <div className="text-primary font-mono tracking-[0.5em] text-xs">
        [ RECUPERANDO ARCHIVO INDIVIDUAL ]
      </div>
    </div>
  );

  if (!entity) return <div className="p-20 text-center text-destructive bg-black h-full font-mono">ERROR_404: ARCHIVO_NO_EXISTE</div>;

  const tabs = [
    { id: 'GENERAL', label: 'REGISTRO', icon: 'description' },
    { id: 'TELEMETRY', label: 'ATRIBUTOS', icon: 'settings_input_component' },
    { id: 'HISTORY', label: 'CRÓNICA', icon: 'history' },
    { id: 'RELATIONS', label: 'VÍNCULOS', icon: 'account_tree' },
    { id: 'MENTIONS', label: 'CITAS', icon: 'menu_book' }
  ];

  return (
    <div className="flex-1 flex flex-col h-full bg-black overflow-hidden font-mono">
      
      {/* --- INDUSTRIAL HEADER (Individual) --- */}
      <header className="shrink-0 p-12 lg:px-16 lg:py-16 border-b border-foreground/10 bg-black relative flex flex-col items-center text-center gap-6">
        <div className="absolute inset-0 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 space-y-4 flex flex-col items-center">
          <div className="px-3 py-1 bg-primary/10 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
            {entity.tipo || 'ENTIDAD_GENÉRICA'}
          </div>
          
          <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-[0.05em] uppercase leading-none">
            {entity.nombre}
          </h1>
          
          <div className="h-1 w-24 bg-primary/50" />

          <div className="flex items-center gap-2 mt-4">
             <button 
               onClick={() => navigate(`/${username || 'local'}/${projectName}/bible/entity/${entityId}/edit`)}
               className="h-10 px-6 bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-primary transition-colors flex items-center gap-2"
             >
               <span className="material-symbols-outlined text-sm">edit</span>
               EDITAR_REGISTRO
             </button>
             <button className="size-10 border border-foreground/10 flex items-center justify-center text-foreground/40 hover:text-primary transition-colors">
                <span className="material-symbols-outlined text-sm">share</span>
             </button>
          </div>
        </div>
      </header>

      {/* --- CONTENT AREA --- */}
      <div className="flex-1 flex flex-col min-h-0 bg-[#050505]">
        <div className="bg-black border-b border-foreground/10 flex justify-center">
          <SecondaryTabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
          />
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
          <div className="max-w-5xl mx-auto space-y-12">
            
            {activeTab === 'GENERAL' && (
              <div className="space-y-10 animate-in fade-in duration-500">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="size-2 bg-primary" />
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">RESUMEN_DESCRIPTIVO</h3>
                  </div>
                  <div className="bg-black border border-foreground/10 p-8 text-foreground/70 text-lg leading-relaxed whitespace-pre-wrap font-sans">
                    {entity.descripcion || "Sin registros descriptivos disponibles."}
                  </div>
                </div>

                {entity.appearance && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="size-2 bg-foreground/20" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">ANÁLISIS_VISUAL</h3>
                    </div>
                    <div className="bg-black border border-foreground/10 p-8 text-foreground/50 text-sm leading-relaxed whitespace-pre-wrap italic">
                      {entity.appearance}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'TELEMETRY' && (
              <div className="animate-in fade-in duration-500">
                <DynamicAttributeForm entity={entity} onUpdate={loadEntity} />
              </div>
            )}

            {activeTab === 'RELATIONS' && (
              <div className="space-y-8 animate-in fade-in duration-500 h-[600px] border border-foreground/10 bg-black">
                <MiniGraph entityId={entity.id} onNavigate={(id) => navigate(`/${username}/${projectName}/bible/entity/${id}`)} />
              </div>
            )}

            {activeTab === 'HISTORY' && (
              <div className="animate-in fade-in duration-500 min-h-[500px]">
                <MiniTimeline entityId={entity.id} />
              </div>
            )}

            {activeTab === 'MENTIONS' && (
              <div className="space-y-6 animate-in fade-in duration-500">
                <div className="flex items-center gap-4">
                  <div className="size-2 bg-primary" />
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40">REFERENCIAS_EN_CUADERNOS</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {mentions.length > 0 ? mentions.map((m, idx) => (
                    <div 
                      key={idx} 
                      onClick={() => navigate(`/${username}/${projectName}/writing/${m.cuaderno_id}`)}
                      className="p-4 bg-black border border-foreground/10 hover:border-primary/30 cursor-pointer group flex items-center justify-between"
                    >
                      <div className="flex flex-col">
                        <span className="text-[10px] font-black text-foreground group-hover:text-primary transition-colors uppercase tracking-widest">{m.hoja_titulo}</span>
                        <span className="text-[8px] text-foreground/30 uppercase mt-1">CUADERNO: {m.cuaderno_titulo}</span>
                      </div>
                      <span className="material-symbols-outlined text-foreground/20 group-hover:text-primary text-sm">open_in_new</span>
                    </div>
                  )) : (
                    <div className="col-span-full p-12 text-center border border-dashed border-foreground/10 text-foreground/20 text-[10px] uppercase tracking-widest">
                      Sin referencias detectadas en los archivos de escritura.
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* --- SYSTEM FOOTER --- */}
      <footer className="p-4 bg-black border-t border-foreground/10 flex justify-between items-center opacity-40">
         <div className="text-[8px] uppercase tracking-[0.2em]">FILE_VERSION: 1.0.42_STABLE</div>
         <div className="text-[8px] uppercase tracking-[0.2em]">ACCESS_TIMESTAMP: {new Date().toISOString()}</div>
      </footer>
    </div>
  );
};

export default IndividualProfileView;
