import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { TemplateUseCase } from '@application/useCases/TemplateUseCase';
import { Entidad, Valor } from '@domain/models/database';
import SecondaryTabs from '@presentation/molecules/SecondaryTabs';
import DynamicAttributeForm from '@features/Entities/components/DynamicAttributeForm';
import MiniTimeline from '@features/Entities/components/MiniTimeline';

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

const EventProfileView: React.FC<{ entityId?: string | number }> = ({ entityId: propEntityId }) => {
  const { username, entityId: paramEntityId, projectName } = useParams();
  const entityId = propEntityId || paramEntityId;
  const navigate = useNavigate();
  const { setRightOpen, setRightPanelTab, setRightPanelContent, setRightPanelTitle } = useOutletContext<ProfileOutletContext>();

  const [entity, setEntity] = useState<SpecificEntityData | null>(null);
  const [attributes, setAttributes] = useState<Valor[]>([]);
  const [subNodes, setSubNodes] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const [activeTab, setActiveTab] = useState<string>('REGISTRO');

  const tabs = [
    { id: 'REGISTRO', label: 'REGISTRO', icon: 'menu_book' },
    { id: 'CRONOGRAMA', label: 'CRONOGRAMA', icon: 'history' },
    { id: 'DATOS_TÉCNICOS', label: 'DATOS TÉCNICOS', icon: 'bar_chart' }
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

  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    try {
      await EntityUseCase.delete(Number(entityId));
      navigate(`/${username || 'local'}/${projectName}/bible`);
    } catch (err) {
      console.error("Error deleting entity:", err);
    }
  };

  useEffect(() => {
    if (entity) {
      setRightOpen(true);
      setRightPanelTab('HIERARCHY');
      setRightPanelTitle(
        <div className="flex items-center justify-center gap-2 font-mono w-full">
          <span className="material-symbols-outlined text-foreground/40 text-sm">hub</span>
          <span className="text-[10px] font-black uppercase tracking-widest text-center">HITOS VINCULADOS</span>
        </div>
      );
      
      setRightPanelContent(
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 border-b border-foreground/5">
             <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Sub-eventos de {entity.nombre}</span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {subNodes.length > 0 ? (
              subNodes.map(node => (
                <div 
                  key={node.id} 
                  onClick={() => navigate(`/${username || 'local'}/${projectName}/bible/entity/${node.id}`)}
                  className="p-6 bg-background border-b border-foreground/5 hover:bg-foreground/[0.02] cursor-pointer group flex items-center justify-between transition-all"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-foreground/60 group-hover:text-foreground uppercase tracking-widest transition-colors">{node.nombre}</span>
                    <span className="text-[8px] font-bold text-foreground/20 uppercase mt-1">{node.tipo}</span>
                  </div>
                  <span className="material-symbols-outlined text-foreground/10 text-sm group-hover:text-foreground/40 transition-all">arrow_forward_ios</span>
                </div>
              ))
            ) : (
              <div className="p-16 text-center flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-foreground/5">event_repeat</span>
                <div className="text-[10px] uppercase tracking-widest font-black text-foreground/20">
                  Evento Aislado
                </div>
              </div>
            )}
          </div>
        </div>
      );
    }
  }, [entity, subNodes, username, projectName]);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-foreground/20 font-black tracking-[0.4em] text-[10px] animate-pulse">
        RECONSTRUYENDO LÍNEA TEMPORAL...
      </div>
    </div>
  );

  if (!entity) return <div className="p-20 text-center text-destructive bg-background h-full font-black uppercase tracking-widest">404: EVENTO NO ENCONTRADO</div>;

  return (
    <div className="flex-1 bg-background flex flex-col h-full w-full animate-in fade-in duration-1000">
      <header className="bg-background border-b border-foreground/5 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
           <h1 className="text-lg font-black text-foreground tracking-tighter uppercase">
             {entity.nombre}
           </h1>
           <div className="px-3 py-1 bg-foreground/[0.03] border border-foreground/5 text-[9px] font-black uppercase tracking-widest text-foreground/20">
             {entity.tipo}
           </div>
        </div>

        <div className="flex items-center gap-3">
            <button 
              onClick={handleDelete}
              className={`px-4 py-2 border transition-all text-[9px] font-black uppercase tracking-widest ${
                confirmDelete 
                ? 'bg-destructive text-white border-destructive animate-pulse' 
                : 'border-destructive/20 text-destructive/40 hover:bg-destructive hover:text-white'
              }`}
            >
               {confirmDelete ? '¿CONFIRMAR?' : 'ELIMINAR'}
            </button>

            <button 
              onClick={() => navigate(`/${username || 'local'}/${projectName}/bible/entity/${entityId}/edit`)} 
              className="px-4 py-2 border border-foreground/10 text-foreground/60 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-background transition-all"
            >
               EDITAR
            </button>

            <button 
              onClick={() => navigate(`/${username || 'local'}/${projectName}/bible`)}
              className="px-4 py-2 bg-foreground text-background text-[9px] font-black uppercase tracking-widest hover:bg-primary transition-all"
            >
               GUARDAR
            </button>

            <div className="h-4 w-px bg-foreground/10 mx-1" />

            <button 
              onClick={() => navigate(-1)}
              className="px-4 py-2 border border-foreground/10 text-foreground/40 text-[9px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
            >
               VOLVER / CANCELAR
            </button>
        </div>
      </header>

      <SecondaryTabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} className="bg-foreground/[0.01] border-b border-foreground/5 shrink-0" />

      <div className={`flex-1 relative ${activeTab === 'CRONOGRAMA' ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'}`}>
        {activeTab === 'REGISTRO' && (
          <main className="p-12 lg:p-24 space-y-24 max-w-6xl mx-auto w-full">
            <section className="space-y-12">
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] border-b border-primary/40 pb-2">CRÓNICA DEL EVENTO</h3>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Identificador</label>
                    <div className="text-xs font-bold text-foreground/60 tabular-nums">#{entity.id}</div>
                  </div>
                </div>
                <div className="text-lg text-foreground/80 leading-relaxed font-light italic">
                  {entity.descripcion || "Sin descripción."}
                </div>
              </div>
            </section>


          </main>
        )}

        {activeTab === 'CRONOGRAMA' && (
          <div className="w-full h-full p-12 lg:p-24 relative bg-background">
            <MiniTimeline entityId={Number(entityId)} />
          </div>
        )}

        {activeTab === 'DATOS_TÉCNICOS' && (
          <div className="p-12 lg:p-24 max-w-5xl mx-auto">
            <DynamicAttributeForm entity={entity} />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventProfileView;
