import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { TemplateUseCase } from '@application/useCases/TemplateUseCase';
import { Entidad, Valor } from '@domain/models/database';

interface ProfileOutletContext {
  setRightOpen: (open: boolean) => void;
  setRightPanelTab: (tab: string) => void;
  setRightPanelContent: (content: React.ReactNode) => void;
  setRightPanelTitle: (title: React.ReactNode) => void;
}

interface CosmicEntityData extends Entidad {
  images?: string[];
  notes?: string[];
  [key: string]: unknown;
}

const CosmicProfileView: React.FC<{ entityId?: string | number }> = ({ entityId: propEntityId }) => {
  const { username, entityId: paramEntityId, projectName } = useParams();
  const entityId = propEntityId || paramEntityId;
  const navigate = useNavigate();
  const { setRightOpen, setRightPanelTab, setRightPanelContent, setRightPanelTitle } = useOutletContext<ProfileOutletContext>();

  const [entity, setEntity] = useState<CosmicEntityData | null>(null);
  const [attributes, setAttributes] = useState<Valor[]>([]);
  const [subNodes, setSubNodes] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);

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
      console.error("Error loading cosmic entity:", err);
    } finally {
      setLoading(false);
    }
  };

  // Panel Derecho: Sub-Nodos
  useEffect(() => {
    if (entity) {
      setRightOpen(true);
      setRightPanelTab('HIERARCHY');
      setRightPanelTitle(
        <div className="flex items-center justify-center gap-2 font-mono w-full">
          <span className="material-symbols-outlined text-primary text-sm">hub</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-center">CUERPOS CELESTES / ELEMENTOS</span>
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
      <div className="text-primary font-mono tracking-[0.5em] text-xs">
        [ ACCEDIENDO A ARCHIVOS CÓSMICOS ]
      </div>
    </div>
  );

  if (!entity) return <div className="p-20 text-center text-destructive bg-black h-full font-mono">ERROR_404: ENTIDAD_NO_ENCONTRADA</div>;

  return (
    <div className="flex-1 bg-black overflow-y-auto custom-scrollbar flex flex-col rounded-none">
      
      {/* 1. Hero Header (Panel de Telemetría Principal) */}
      <header className="bg-black border-b border-foreground/10 p-12 lg:px-16 lg:py-20 flex flex-col items-center text-center gap-8 relative overflow-hidden">
        {/* Tech Decals Background */}
        <div className="absolute top-8 left-12 font-mono text-[9px] text-foreground/20 text-left space-y-1 hidden lg:block">
          <div>SYS_ID: [{entity.id || 'NULL'}]</div>
          <div>CLASIFICACIÓN_ESTELAR: {entity.tipo || 'DESCONOCIDA'}</div>
          <div>ESTADO: NODO_ACTIVO</div>
        </div>
        <div className="absolute top-8 right-12 font-mono text-[9px] text-foreground/20 text-right space-y-1 hidden lg:block">
          <div>LATITUD_ESTELAR: 44.5N</div>
          <div>LONGITUD_ESTELAR: 12.8E</div>
          <div>REF: CHRONOS_ATLAS_CORE</div>
        </div>

        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 flex flex-col items-center">
           <div className="flex items-center gap-3 mb-6">
              <div className="w-1.5 h-1.5 bg-primary animate-pulse rounded-full" />
              <div className="px-4 py-1.5 bg-black border border-primary/50 text-primary uppercase font-mono text-[10px] font-black tracking-[0.3em] rounded-none shadow-[0_0_15px_rgba(var(--primary),0.2)]">
                ESTRUCTURA_{entity.tipo || 'ENTIDAD'}
              </div>
           </div>
           
           <h1 className="text-5xl md:text-7xl font-black text-[#f1f1f3] tracking-[0.1em] uppercase leading-none rounded-none mb-6">
             {entity.nombre}
           </h1>
           
           <div className="h-1.5 w-32 bg-primary/50 rounded-none mb-4" />
        </div>
      </header>

      {/* 2. Rejilla de Telemetría (Atributos Dinámicos) */}
      <section className="px-12 lg:px-16 py-0">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-0 border border-foreground/10 bg-[#0f0f11]">
          {attributes.length > 0 ? attributes.map((attr, idx) => (
            <div key={idx} className="bg-black border-r border-b border-foreground/10 p-8 flex flex-col items-center text-center group hover:bg-primary/[0.02] rounded-none">
              <span className="text-[9px] text-foreground/40 font-black uppercase tracking-[0.2em] mb-4 font-mono">
                {`>_ DAT_${(attr.plantilla?.nombre || 'PARAM').toUpperCase()}`}
              </span>
              <div className="text-xl md:text-3xl text-primary font-bold font-mono tracking-tighter">
                {attr.valor ? (
                  attr.valor
                ) : (
                  <span className="text-red-500/50 italic text-sm">NO_DATA_FOUND</span>
                )}
              </div>
            </div>
          )) : (
            <div className="col-span-full py-16 text-center text-red-500/40 font-mono text-[10px] uppercase tracking-[0.3em] bg-black border-b border-foreground/10">
              [ ERROR: NO SE HAN DEFINIDO PARÁMETROS DE TELEMETRÍA EN ESTE SECTOR ]
            </div>
          )}
        </div>
      </section>

      {/* 3. Registro de Observación (Pantalla de Fósforo) */}
      <main className="p-12 lg:p-16 grid grid-cols-1 lg:grid-cols-12 gap-16">
        <div className="lg:col-span-12 space-y-12">
          
          <div className="space-y-6 max-w-5xl mx-auto w-full">
            <div className="flex flex-col items-center gap-4">
              <div className="size-2 bg-primary" />
              <h3 className="text-xs font-black text-foreground uppercase tracking-[0.3em] text-center">PROTOCOLO DE DESCRIPCIÓN CÓSMICA</h3>
            </div>
            
            <div className="bg-black border border-foreground/10 relative rounded-none overflow-hidden group">
              {/* Header de la caja negra */}
              <div className="bg-[#0f0f11] border-b border-foreground/10 px-6 py-3 flex justify-between items-center">
                <span className="text-[9px] font-mono text-primary/60 font-black tracking-widest">[ LECTURA DE ARCHIVO COMPLETA ]</span>
                <span className="text-[9px] font-mono text-foreground/20">V_1.0.42</span>
              </div>

              <div className="p-10 font-mono text-lg text-primary/80 leading-relaxed relative min-h-[300px]">
                <span className="inline-block w-2.5 h-5 bg-primary/70 animate-pulse mr-3 align-middle"></span>
                <div className="inline whitespace-pre-wrap">
                  {entity.descripcion || "DATOS_NO_DISPONIBLES: El sensor no ha podido recuperar registros descriptivos para esta coordenada. Proceder con escaneo manual."}
                </div>
                
                {/* Decorative scanning line effect could be added here if needed, but let's stick to the prompt */}
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

          {/* 4. Galería de Sonda */}
          {entity.images && entity.images.length > 0 && (
            <div className="space-y-10 max-w-5xl mx-auto w-full">
              <div className="flex flex-col items-center gap-4">
                <div className="size-2 bg-foreground/20" />
                <h3 className="text-xs font-black text-foreground/40 uppercase tracking-[0.3em] text-center">CAPTURAS DE RECONOCIMIENTO VISUAL</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {entity.images.map((img, idx) => (
                  <div key={idx} className="aspect-video bg-[#0f0f11] border border-foreground/10 overflow-hidden relative group rounded-none">
                    <img src={img} alt={`Capture ${idx}`} className="w-full h-full object-cover opacity-50 group-hover:opacity-100 filter grayscale group-hover:grayscale-0" />
                    <div className="absolute top-4 left-4 px-3 py-1.5 bg-black/90 text-[9px] font-mono text-primary border border-primary/30 font-black">
                      CAM_SONDA_00{idx + 1}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Comandos de Sistema al Final */}
          <div className="max-w-xl mx-auto pt-20">
             <div className="border border-foreground/10 bg-black p-8 space-y-8 rounded-none">
                <div className="space-y-4">
                  <h4 className="text-[10px] font-black text-foreground/40 uppercase tracking-widest flex flex-col items-center gap-2">
                    <span className="material-symbols-outlined text-[14px]">terminal</span>
                    <span className="text-center">COMANDOS_DE_SISTEMA</span>
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <button 
                      onClick={() => navigate(`/${username || 'local'}/${projectName}/bible/entity/${entityId}/edit`)}
                      className="h-12 bg-foreground text-background text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-primary transition-colors"
                    >
                       <span className="material-symbols-outlined text-sm">edit</span>
                       EDITAR_REG
                    </button>
                    <button className="h-12 bg-transparent border border-red-500/20 text-red-500/50 text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-red-500/10 transition-colors">
                       <span className="material-symbols-outlined text-sm">delete_forever</span>
                       BORRADO_ESTELAR
                    </button>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default CosmicProfileView;
