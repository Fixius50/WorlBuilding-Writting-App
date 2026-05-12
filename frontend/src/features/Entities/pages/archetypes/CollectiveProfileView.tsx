import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { TemplateUseCase } from '@application/useCases/TemplateUseCase';
import { Entidad, Valor } from '@domain/models/database';
import SecondaryTabs from '@presentation/molecules/SecondaryTabs';
import DynamicAttributeForm from '@features/Entities/components/DynamicAttributeForm';

interface ProfileOutletContext {
  setRightOpen: (open: boolean) => void;
  setRightPanelTab: (tab: string) => void;
  setRightPanelContent: (content: React.ReactNode) => void;
  setRightPanelTitle: (title: React.ReactNode) => void;
}

interface SpecificEntityData extends Entidad {
  images?: string[];
  notes?: string[];
  [key: string]: unknown;
}

const CollectiveProfileView: React.FC<{ entityId?: string | number }> = ({ entityId: propEntityId }) => {
  const { username, entityId: paramEntityId, projectName } = useParams();
  const entityId = propEntityId || paramEntityId;
  const navigate = useNavigate();
  const { setRightOpen, setRightPanelTab, setRightPanelContent, setRightPanelTitle } = useOutletContext<ProfileOutletContext>();

  const [entity, setEntity] = useState<SpecificEntityData | null>(null);
  const [attributes, setAttributes] = useState<Valor[]>([]);
  const [subNodes, setSubNodes] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState<string>('REGISTRO');

  const tabs = [
    { id: 'REGISTRO', label: 'REGISTRO', icon: 'menu_book' },
    { id: 'DIPLOMACIA_Y_DOGMA', label: 'DIPLOMACIA_Y_DOGMA', icon: 'handshake' },
    { id: 'TELEMETRÍA', label: 'TELEMETRÍA', icon: 'bar_chart' }
  ];

  useEffect(() => {
    loadEntityData();
  }, [entityId]);

  const loadEntityData = async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const data = await EntityUseCase.getById(Number(entityId));
      if (data) {
        const extra = typeof data.contenido_json === 'string'
          ? JSON.parse(data.contenido_json)
          : (data.contenido_json || {});
        
        const vals = await TemplateUseCase.getEntityValues(data.id);
        
        setEntity({ ...data, ...extra });
        setAttributes(vals);

        const allEntities = await EntityUseCase.getAllByProject(data.project_id);
        const children = allEntities.filter(e => {
            const eExtra = typeof e.contenido_json === 'string' ? JSON.parse(e.contenido_json) : (e.contenido_json || {});
            return e.carpeta_id === data.id || eExtra.padre_id === data.id || eExtra.parent_id === data.id;
        });
        setSubNodes(children);
      }
    } catch (err) {
      console.error("Error loading entity:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (entity) {
      setRightOpen(true);
      setRightPanelTab('HIERARCHY');
      setRightPanelTitle(
        <div className="flex items-center justify-center gap-2 font-mono w-full">
          <span className="material-symbols-outlined text-primary text-sm">hub</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-center">ELEMENTOS VINCULADOS</span>
        </div>
      );
      
      setRightPanelContent(
        <div className="flex flex-col h-full bg-black">
          <div className="p-4 border-b border-foreground/10 bg-[#0f0f11]">
             <span className="text-[9px] font-mono text-foreground/40 uppercase tracking-tighter">Exploración de Sector: {entity.nombre}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {subNodes.length > 0 ? (
              subNodes.map(node => (
                <div 
                  key={node.id} 
                  onClick={() => navigate(`/${username || 'local'}/${projectName}/bible/entity/${node.id}`)}
                  className="p-4 bg-black border-b border-foreground/10 hover:bg-primary/5 cursor-pointer group flex items-center justify-between"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground group-hover:text-primary uppercase tracking-wider">{node.nombre}</span>
                    <span className="text-[8px] font-mono text-foreground/30 uppercase mt-1">{node.tipo}</span>
                  </div>
                  <span className="material-symbols-outlined text-foreground/20 text-sm group-hover:text-primary">arrow_forward</span>
                </div>
              ))
            ) : (
              <div className="p-12 text-center text-foreground/10 flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl opacity-10">radar</span>
                <div className="text-[9px] uppercase tracking-[0.2em] font-mono leading-relaxed max-w-[200px]">
                  [ ESCANEO COMPLETADO: 0 ANOMALÍAS / CUERPOS DETECTADOS ]
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  }, [entity, subNodes, username, projectName]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-black">
      <div className="text-primary font-mono tracking-[0.5em] text-xs animate-pulse">
        [ ACCEDIENDO A ARCHIVOS CLASIFICADOS ]
      </div>
    </div>
  );

  if (!entity) return <div className="p-20 text-center text-destructive bg-black h-full font-mono">ERROR_404: ENTIDAD_NO_ENCONTRADA</div>;

  return (
    <div className="flex-1 bg-black flex flex-col rounded-none overflow-hidden h-full w-full">
      <header className="bg-black border-b border-foreground/10 p-8 lg:px-16 lg:py-12 flex flex-col items-center text-center gap-6 relative overflow-hidden shrink-0">
        <div className="absolute top-8 left-12 font-mono text-[9px] text-foreground/20 text-left space-y-1 hidden lg:block">
          <div>SYS_ID: [{entity.id || 'NULL'}]</div>
          <div>TIPO_ENTIDAD: {entity.tipo || 'DESCONOCIDA'}</div>
          <div>ESTADO: ACTIVO</div>
        </div>
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        <div className="relative z-10 flex flex-col items-center">
           <div className="flex items-center gap-3 mb-4">
              <div className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full" />
              <div className="px-4 py-1.5 bg-black border border-primary/50 text-primary uppercase font-mono text-[10px] font-black tracking-[0.3em] rounded-none shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                ESTRUCTURA_{entity.tipo || 'ENTIDAD'}
              </div>
           </div>
           <h1 className="text-4xl md:text-6xl font-black text-[#f1f1f3] tracking-[0.1em] uppercase leading-none rounded-none mb-4">
             {entity.nombre}
           </h1>
           <div className="h-1.5 w-32 bg-primary/50 rounded-none mb-2" />
        </div>
      </header>

      <SecondaryTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="bg-[#0f0f11] shrink-0" />

      <div className={`flex-1 relative ${activeTab === 'DIPLOMACIA_Y_DOGMA' ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'}`}>
        {activeTab === 'REGISTRO' && (
          <main className="p-8 lg:p-12 space-y-12">
            <div className="space-y-6 max-w-5xl mx-auto w-full">
              <div className="flex flex-col items-center gap-4">
                <div className="size-2 bg-primary" />
                <h3 className="text-xs font-black text-foreground uppercase tracking-[0.3em] text-center">HISTORIAL ARCHIVADO</h3>
              </div>
              <div className="bg-black border border-foreground/10 relative rounded-none overflow-hidden group">
                <div className="bg-[#0f0f11] border-b border-foreground/10 px-6 py-3 flex justify-between items-center">
                  <span className="text-[9px] font-mono text-primary/60 font-black tracking-widest">[ LECTURA DE ARCHIVO COMPLETA ]</span>
                  <span className="text-[9px] font-mono text-foreground/20">V_1.0.42</span>
                </div>
                <div className="p-10 font-mono text-lg text-primary/80 leading-relaxed relative min-h-[300px]">
                  <span className="inline-block w-2.5 h-5 bg-primary/70 animate-pulse mr-3 align-middle"></span>
                  <div className="inline whitespace-pre-wrap">
                    {entity.descripcion || "DATOS_NO_DISPONIBLES: El registro descriptivo está encriptado o vacío."}
                  </div>
                  <div className="mt-12 pt-8 border-t border-foreground/5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="size-1.5 rounded-full bg-primary" />
                      <span className="text-[10px] text-primary/50 font-bold tracking-widest uppercase">Transmisión finalizada</span>
                    </div>
                    <div className="text-[10px] text-foreground/20 font-mono">EOF_BIT_CHECKED</div>
                  </div>
                </div>
              </div>
            </div>
            {entity.images && entity.images.length > 0 && (
              <div className="space-y-10 max-w-5xl mx-auto w-full">
                <div className="flex flex-col items-center gap-4">
                  <div className="size-2 bg-foreground/20" />
                  <h3 className="text-xs font-black text-foreground/40 uppercase tracking-[0.3em] text-center">GALERÍA</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {entity.images.map((img, idx) => (
                    <div key={idx} className="aspect-video bg-[#0f0f11] border border-foreground/10 overflow-hidden relative group rounded-none">
                      <img src={img} alt={`Capture ${idx}`} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 filter grayscale group-hover:grayscale-0 transition-all" />
                      <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/90 text-[9px] font-mono text-primary border border-primary/30 font-black">
                        CAM_SONDA_00{idx + 1}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="max-w-xl mx-auto pt-10 pb-10">
               <div className="border border-foreground/10 bg-black p-8 space-y-8 rounded-none">
                  <div className="space-y-4">
                    <h4 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex flex-col items-center gap-2">
                      <span className="material-symbols-outlined text-[14px]">terminal</span>
                      <span className="text-center">COMANDOS_DE_SISTEMA</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      <button onClick={() => navigate(`/${username || 'local'}/${projectName}/bible/entity/${entityId}/edit`)} className="h-12 bg-foreground text-background text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-colors">
                         <span className="material-symbols-outlined text-sm">edit</span>
                         EDITAR_REG
                      </button>
                      <button className="h-12 bg-transparent border border-red-500/20 text-red-500/50 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors">
                         <span className="material-symbols-outlined text-sm">delete_forever</span>
                         BORRADO
                      </button>
                    </div>
                  </div>
               </div>
            </div>
          </main>
        )}

        {activeTab === 'DIPLOMACIA_Y_DOGMA' && (
          <div className="w-full h-full p-8 lg:p-12 relative bg-[#0f0f11]">
            <div className="grid grid-cols-2 gap-8 h-full max-w-5xl mx-auto">
               <div className="border border-primary/20 bg-black p-6 flex flex-col">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-6 border-b border-primary/20 pb-4">
                     {'>_'} ALIADOS / MIEMBROS
                  </h3>
                  <div className="flex-1 flex items-center justify-center text-foreground/20 font-mono text-[9px] uppercase tracking-widest text-center">
                     [ DATOS NO DISPONIBLES EN EL SECTOR ]
                  </div>
               </div>
               <div className="border border-red-500/20 bg-black p-6 flex flex-col">
                  <h3 className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-6 border-b border-red-500/20 pb-4">
                     {'>_'} ENEMIGOS / HEREJES
                  </h3>
                  <div className="flex-1 flex items-center justify-center text-foreground/20 font-mono text-[9px] uppercase tracking-widest text-center">
                     [ DATOS NO DISPONIBLES EN EL SECTOR ]
                  </div>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'TELEMETRÍA' && (
          <div className="p-8 lg:p-12 max-w-5xl mx-auto">
            <DynamicAttributeForm entity={entity} />
          </div>
        )}
      </div>
    </div>
  );
};

export default CollectiveProfileView;
