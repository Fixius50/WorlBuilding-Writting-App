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
      console.error("Failed to save notes", err);
    }
  };

  const { setCustomContent } = useRightPanelStore();

  useEffect(() => {
    if (entity) {
      setCustomContent(
        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
          <div className="flex items-center justify-between border-b border-foreground/10 pb-4">
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">edit_note</span>
              Notas de Autor
            </h3>
            {!isEditingNotes ? (
              <button 
                onClick={() => setIsEditingNotes(true)}
                className="text-[9px] font-black uppercase tracking-widest text-foreground/40 hover:text-primary transition-colors"
              >
                Editar
              </button>
            ) : (
              <button 
                onClick={handleSaveNotes}
                className="text-[9px] font-black uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors"
              >
                Guardar
              </button>
            )}
          </div>

          {isEditingNotes ? (
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full h-64 bg-foreground/[0.03] border border-foreground/10 p-4 text-xs text-foreground/80 outline-none focus:border-primary/40 font-serif leading-relaxed resize-none custom-scrollbar"
              placeholder="Escribe aquí las observaciones secretas sobre este arcano..."
              autoFocus
            />
          ) : (
            <div className="prose prose-invert prose-xs">
              <p className="text-xs text-foreground/60 leading-relaxed italic whitespace-pre-wrap font-serif">
                {notes || "No hay notas del autor para esta entidad."}
              </p>
            </div>
          )}

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
        `Archivo: ${entity.nombre}`
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
                <h1 className="text-4xl lg:text-6xl font-serif font-black text-foreground tracking-tight leading-none italic">{entity.nombre}</h1>
                <span className="px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em] bg-primary/10 text-primary border border-primary/30">
                  {entity.tipo || 'ENTIDAD'}
                </span>
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
              <div className="max-w-4xl mx-auto space-y-16 animate-in slide-in-from-bottom-4 duration-500">
                {/* Artículo de Prosa */}
                <article className="space-y-8">
                  <div className="flex items-center gap-4">
                    <span className="h-px flex-1 bg-gradient-to-r from-transparent to-primary/30"></span>
                    <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">Crónica de su Esencia</h2>
                    <span className="h-px flex-1 bg-gradient-to-l from-transparent to-primary/30"></span>
                  </div>
                  <div className="prose prose-invert prose-lg max-w-none">
                    <p className="text-xl lg:text-2xl font-serif leading-[1.8] text-foreground/80 first-letter:text-5xl first-letter:font-black first-letter:mr-3 first-letter:float-left first-letter:text-primary italic">
                      {entity.descripcion || "Este arcano aún no posee una crónica detallada en los registros del mundo."}
                    </p>
                  </div>
                </article>

                {/* Galería de Imágenes */}
                {galleryImages.length > 0 && (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3">
                       <span className="material-symbols-outlined text-sm text-primary">gallery_thumbnail</span>
                       <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Fragmentos Visuales</h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {galleryImages.map((img, idx) => (
                        <div key={idx} className="aspect-square bg-foreground/5 border border-foreground/10 overflow-hidden group relative">
                          <img 
                            src={img} 
                            alt={`Fragmento ${idx}`} 
                            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </div>
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
