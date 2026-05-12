import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { TemplateUseCase } from '@application/useCases/TemplateUseCase';
import { Entidad, Valor } from '@domain/models/database';
import SecondaryTabs from '@presentation/molecules/SecondaryTabs';
import UniversalCanvas, { CanvasNode, CanvasEdge } from '@presentation/organisms/editor/UniversalCanvas';
import DynamicAttributeForm from '@features/Entities/components/DynamicAttributeForm';

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

  const [activeTab, setActiveTab] = useState<string>('REGISTRO');
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const tabs = [
    { id: 'REGISTRO', label: 'REGISTRO', icon: 'menu_book' },
    { id: 'CARTOGRAFÍA', label: 'CARTOGRAFÍA', icon: 'map' },
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

        const newNodes: CanvasNode[] = children.map((c, i) => {
          const radius = 250;
          const angle = (i / (children.length || 1)) * 2 * Math.PI;
          return {
            id: String(c.id),
            x: 600 + radius * Math.cos(angle),
            y: 400 + radius * Math.sin(angle),
            label: c.nombre,
            tipo: c.tipo || 'DESCONOCIDO'
          };
        });
        
        newNodes.push({
          id: String(data.id),
          x: 600,
          y: 400,
          label: data.nombre,
          tipo: data.tipo || 'DESCONOCIDO'
        });

        const newEdges: CanvasEdge[] = children.map(c => ({
          id: `e-${data.id}-${c.id}`,
          from: String(data.id),
          to: String(c.id)
        }));

        setNodes(newNodes);
        setEdges(newEdges);
      }
    } catch (err) {
      console.error("Error loading cosmic entity:", err);
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
          <span className="text-[10px] font-black uppercase tracking-widest text-center">CUERPOS VINCULADOS</span>
        </div>
      );
      
      setRightPanelContent(
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 border-b border-foreground/5">
             <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">Órbitas de {entity.nombre}</span>
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
                <span className="material-symbols-outlined text-4xl text-foreground/5">public</span>
                <div className="text-[10px] uppercase tracking-widest font-black text-foreground/20">
                  Sector VacÃ­o
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
        CALIBRANDO CARTOGRAFÃ A...
      </div>
    </div>
  );

  if (!entity) return <div className="p-20 text-center text-destructive bg-background h-full font-black uppercase tracking-widest">404: ENTIDAD NO ENCONTRADA</div>;

  return (
    <div className="flex-1 bg-background flex flex-col h-full w-full animate-in fade-in duration-1000">
      
      {/* Hero Header MonolÃ­tico Zen */}
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

      <div className={`flex-1 relative ${activeTab === 'CARTOGRAFÍA' ? 'overflow-hidden' : 'overflow-y-auto no-scrollbar'}`}>
        
        {activeTab === 'REGISTRO' && (
          <main className="p-12 lg:p-24 space-y-24 max-w-6xl mx-auto w-full">
            
            <section className="space-y-12">
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] border-b border-primary/40 pb-2">CRÓNICA ESTELAR</h3>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-[1fr_2fr] gap-16">
                <div className="space-y-8">
                  <div className="space-y-2">
                    <label className="text-[9px] font-black text-foreground/20 uppercase tracking-widest">Identificador</label>
                    <div className="text-xs font-bold text-foreground/60 tabular-nums">#{entity.id}</div>
                  </div>
                </div>

                <div className="text-lg text-foreground/80 leading-relaxed font-light italic first-letter:text-4xl first-letter:font-black first-letter:text-primary first-letter:mr-1 first-letter:float-left">
                  {entity.descripcion || "Sin descripción."}
                </div>
              </div>
            </section>

            {entity.images && entity.images.length > 0 && (
              <section className="space-y-12 pt-12 border-t border-foreground/5">
                <div className="flex flex-col items-center gap-4">
                  <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">AVISTAMIENTOS VISUALES</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {entity.images.map((img, idx) => (
                    <div key={idx} className="aspect-video bg-foreground/[0.02] border border-foreground/5 overflow-hidden group transition-all">
                      <img src={img} alt={`Cosmic View ${idx}`} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-700" />
                    </div>
                  ))}
                </div>
              </section>
            )}


          </main>
        )}

        {activeTab === 'CARTOGRAFÍA' && (
          <div className="w-full h-full relative bg-background">
            <UniversalCanvas 
              initialNodes={nodes} 
              initialEdges={edges} 
              onNodeClick={(id) => navigate(`/${username || 'local'}/${projectName}/bible/entity/${id}`)} 
            />
          </div>
        )}

        {activeTab === 'TELEMETRÍA' && (
          <div className="p-12 lg:p-24 max-w-5xl mx-auto space-y-16">
            <div className="pt-0">
              <DynamicAttributeForm entity={entity} />
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

export default CosmicProfileView;

