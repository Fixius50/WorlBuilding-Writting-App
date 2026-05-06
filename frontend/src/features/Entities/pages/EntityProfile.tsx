import { useState, useEffect, ReactNode } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { entityService } from '@repositories/entityService';
import { Entidad, Valor } from '@domain/models/database';
import Avatar from '@atoms/Avatar';
import SecondaryTabs from '@molecules/SecondaryTabs';
import MiniGraph from '../components/MiniGraph';
import MiniTimeline from '../components/MiniTimeline';
import DynamicAttributeForm from '../components/DynamicAttributeForm';
import { notebookService } from '@repositories/notebookService';
import { useSettingsStore } from '@store/useSettingsStore';

import { useRightPanelStore } from '@store/useRightPanelStore';

interface EntityWithExtra extends Entidad {
  valores?: Valor[];
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
  const { openPanel, closePanel, reset } = useRightPanelStore();
  const [entity, setEntity] = useState<EntityWithExtra | null>(null);
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [loading, setLoading] = useState(true);
  const [mentions, setMentions] = useState<{
    snippet: ReactNode; hoja_id: number; hoja_titulo: string; cuaderno_titulo: string; cuaderno_id: number 
}[]>([]);

  const [notes, setNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);

  useEffect(() => {
    if (entityId) {
      openPanel('entity', entityId);
    }
    return () => reset();
  }, [entityId, openPanel, reset]);

  useEffect(() => {
    loadEntity();
  }, [entityId]);

  useEffect(() => {
    if (entity?.notes) {
      setNotes(entity.notes as string);
    }
  }, [entity]);

  const handleSaveNotes = async () => {
    if (!entity || !entityId) return;
    try {
      const currentExtra = typeof entity.contenido_json === 'string'
        ? JSON.parse(entity.contenido_json)
        : (entity.contenido_json || {});
      
      const updatedExtra = { ...currentExtra, notes };
      await entityService.update(Number(entityId), {
        contenido_json: JSON.stringify(updatedExtra)
      });
      setIsEditingNotes(false);
      // Opcional: recargar entidad para sincronizar
      // loadEntity(); 
    } catch (err) {
      useSettingsStore.getState().addNotification("Error en el proceso", "error");
    }
  };

  const { setCustomContent } = useRightPanelStore();

  useEffect(() => {
    if (entity) {
      setCustomContent(
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <section>
            <div className="flex items-center justify-between mb-4 px-2">
              <h3 className="text-[10px] font-black uppercase tracking-widest text-primary">Notas de Autor</h3>
              <span className="material-symbols-outlined text-[14px] text-primary/50">edit_note</span>
            </div>
            <div className="bg-foreground/[0.02] border border-foreground/10 p-5 min-h-[200px] text-xs text-foreground/70 italic leading-relaxed whitespace-pre-wrap">
              {(entity.notes as string) || "No hay notas secretas para esta entidad..."}
            </div>
          </section>

          <div className="pt-8 opacity-20 hover:opacity-100 transition-opacity">
            <div className="text-[8px] font-black uppercase tracking-[0.4em] mb-4 text-center">Protocolos de Seguridad</div>
            <button 
              className="w-full py-3 border border-red-500/20 text-red-500/40 hover:text-red-500 hover:bg-red-500/5 text-[9px] font-black uppercase tracking-widest transition-all"
              onClick={() => { if(window.confirm('¿Destruir rastro de este arcano?')) navigate(-1); }}
            >
              Solicitar Amnesia (Eliminar)
            </button>
          </div>
        </div>,
        `Archivo: ${entity.nombre as string}`
      );
    }
  }, [entity, notes, isEditingNotes, setCustomContent]);

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
      useSettingsStore.getState().addNotification("Error al cargar entidad", "error");
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
      useSettingsStore.getState().addNotification("Error en el proceso", "error");
    }
  };

  // El Inspector ahora se gestiona vía Store centralizado en UniversalInspector

  if (loading) return <div className="p-20 text-center animate-pulse text-foreground/50 h-full flex items-center justify-center font-black uppercase tracking-[0.4em] text-xs bg-background">Accediendo a la Cápsula...</div>;
  if (!entity) return <div className="p-20 text-center text-red-500 bg-background h-full flex items-center justify-center uppercase font-black tracking-widest">Error: Entidad no encontrada.</div>;

  const tabs = [
    { id: 'GENERAL', label: 'Esencia' },
    { id: 'INTELLIGENCE', label: 'Inteligencia de Campo' },
    { id: 'METADATA', label: 'Arquetipo' },
    { id: 'BACKLINKS', label: 'Apariciones' },
  ];

  const handleEntityNavigate = (id: number) => {
    navigate(`/${username || 'local'}/${projectName}/bible/folder/${folderId}/entity/${id}`);
  };

  // Parsear imágenes de la galería
  const galleryImages = (entity.images as string[]) || [];

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden animate-in fade-in duration-700">
      
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
                <h1 className="text-4xl lg:text-6xl font-serif font-black text-foreground tracking-tight leading-none italic">{entity.nombre as string}</h1>
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border border-primary/30">
                  {(entity.tipo as string) || 'ENTIDAD'}
                </span>
              </div>
              <p className="text-lg text-foreground/40 font-medium italic max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                "{(entity.descripcion as string) || "Existencia sin descripción vinculada aún."}"
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
        <div className="px-8 lg:px-12 py-4 bg-background/40  border-b border-foreground/5 sticky top-0 z-20">
          <SecondaryTabs 
            tabs={tabs} 
            activeTab={activeTab} 
            onChange={setActiveTab} 
          />
        </div>

        <main className="flex-1 overflow-y-auto custom-scrollbar p-8 lg:p-12">
          <div className="max-w-7xl mx-auto">
            {activeTab === 'GENERAL' && (
              <div className="max-w-4xl mx-auto animate-in slide-in-from-bottom-4 duration-500 space-y-16">
                {/* Biografía principal */}
                <div className="space-y-6">
                  <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-3 border-b border-foreground/10 pb-4">
                    <span className="material-symbols-outlined text-lg">history_edu</span>
                    Biografía y Registro Histórico
                  </h3>
                  <div className="text-foreground/80 text-lg leading-relaxed font-serif whitespace-pre-wrap">
                    {(entity.descripcion as string) || "Esta entidad aún no tiene registros en la historia..."}
                  </div>
                </div>

                {/* Apariencia / Detalles Visuales */}
                {!!entity.appearance && (
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 flex items-center gap-3 border-b border-foreground/10 pb-4">
                      <span className="material-symbols-outlined text-lg">visibility</span>
                      Apariencia y Rasgos
                    </h3>
                    <div className="text-foreground/60 text-md leading-relaxed whitespace-pre-wrap italic">
                      {entity.appearance as string}
                    </div>
                  </div>
                )}

                {/* Galería de imágenes */}
                {!!entity.images && (entity.images as string[]).length > 0 && (
                  <div className="space-y-6">
                    <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/40 flex items-center gap-3 border-b border-foreground/10 pb-4">
                      <span className="material-symbols-outlined text-lg">photo_library</span>
                      Archivos Visuales
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(entity.images as string[]).map((img: string, i: number) => (
                        <img key={i} src={img} alt="Referencia" className="w-full aspect-square object-cover border border-foreground/10 opacity-70 hover:opacity-100 transition-opacity" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'INTELLIGENCE' && (
              <div className="flex flex-col lg:flex-row gap-8 h-[calc(100vh-350px)] animate-in fade-in zoom-in-95 duration-500">
                <div className="flex-1 min-h-[400px] border border-foreground/5 bg-foreground/[0.01] overflow-hidden relative group">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-primary/10 border border-primary/20 text-[9px] font-black uppercase tracking-widest text-primary">Mapa de Relaciones</div>
                  <MiniGraph entityId={Number(entityId)} onNavigate={handleEntityNavigate} />
                </div>
                <div className="w-full lg:w-[450px] border border-foreground/5 bg-foreground/[0.01] flex flex-col overflow-hidden relative">
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 bg-purple-500/10 border border-purple-500/20 text-[9px] font-black uppercase tracking-widest text-purple-400">Secuencia Temporal</div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pt-16">
                    <MiniTimeline entityId={Number(entityId)} />
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'METADATA' && (
              <div className="max-w-4xl animate-in fade-in duration-500">
                 <DynamicAttributeForm entity={entity} onUpdate={loadEntity} />
              </div>
            )}

            {activeTab === 'BACKLINKS' && (
              <div className="animate-in slide-in-from-right-8 duration-500 space-y-6 max-w-3xl">
                 <div className="pb-4 border-b border-primary/20">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary">Referencias en la Obra</h3>
                 </div>
                 {mentions.length > 0 ? (
                    mentions.map((mention, i) => (
                      <div 
                        key={i} 
                        className="p-4 bg-foreground/5 border border-foreground/10 hover:border-primary/40 transition-all group cursor-pointer"
                        onClick={() => navigate(`/local/${projectName}/writing/${mention.cuaderno_id}?page=${mention.hoja_id}`)}
                      >
                         <div className="flex justify-between items-center mb-2">
                            <span className="text-[10px] font-bold text-primary uppercase tracking-tighter">
                              {mention.cuaderno_titulo} — {mention.hoja_titulo}
                            </span>
                         </div>
                         <p className="text-sm text-foreground/80 leading-relaxed font-mono bg-foreground/[0.03] p-3 border-l-2 border-primary/40">
                            {mention.snippet}
                         </p>
                      </div>
                    ))
                 ) : (
                    <div className="py-20 text-center opacity-30 border border-dashed border-foreground/10">
                       <span className="material-symbols-outlined text-4xl mb-2">find_in_page</span>
                       <p className="text-[10px] font-black uppercase tracking-widest">Sin apariciones registradas aún.</p>
                    </div>
                 )}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default EntityProfile;
