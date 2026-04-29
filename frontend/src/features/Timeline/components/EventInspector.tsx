import React, { useEffect, useState } from 'react';
import { timelineService } from '@repositories/timelineService';
import { Evento, Entidad } from '@domain/models/database';
import { useLanguage } from '@context/LanguageContext';
import ZenEditor from '@features/Editor/components/ZenEditor';
import Avatar from '@atoms/Avatar';

interface EventInspectorProps {
  eventId: number;
  onUpdate?: () => void;
  onClose?: () => void;
  onNavigateToEntity?: (entityId: number, folderId: number) => void;
}

const EventInspector: React.FC<EventInspectorProps> = ({ 
  eventId, 
  onUpdate, 
  onClose,
  onNavigateToEntity 
}) => {
  const { t } = useLanguage();
  const [event, setEvent] = useState<Evento | null>(null);
  const [linkedEntities, setLinkedEntities] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadEventData = async () => {
      setLoading(true);
      try {
        const [evData, entities] = await Promise.all([
          timelineService.getById(eventId),
          timelineService.getLinkedEntities(eventId)
        ]);
        setEvent(evData);
        setLinkedEntities(entities);
      } catch (err) {
        console.error("Error loading event inspector data:", err);
      } finally {
        setLoading(false);
      }
    };
    loadEventData();
  }, [eventId]);

  const handleNotesUpdate = async (html: string) => {
    if (!event) return;
    try {
      await timelineService.update(event.id, { descripcion: html });
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error("Failed to update event notes:", err);
    }
  };

  if (loading) return (
    <div className="flex-1 flex items-center justify-center p-10">
      <div className="animate-pulse text-[10px] font-black uppercase tracking-[0.3em] text-foreground/30">
        Invocando Registro...
      </div>
    </div>
  );

  if (!event) return (
    <div className="p-10 text-center text-rose-500 text-xs font-bold uppercase tracking-widest">
      Error: Hito no encontrado en el tejido temporal.
    </div>
  );

  return (
    <div className="flex flex-col h-full bg-background animate-in fade-in duration-500">
      {/* Header Visual */}
      <div className="p-6 border-b border-foreground/5 bg-gradient-to-b from-primary/5 to-transparent">
        <div className="flex items-center gap-4 mb-4">
          <div className="size-10 bg-primary/10 border border-primary/20 flex items-center justify-center text-primary">
            <span className="material-symbols-outlined text-xl">event_note</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black uppercase tracking-widest text-primary leading-none mb-1">
              {event.fecha_simulada || 'Fecha Desconocida'}
            </span>
            <h2 className="text-sm font-black text-foreground uppercase tracking-tight truncate max-w-[180px]">
              {event.titulo}
            </h2>
          </div>
        </div>

        {/* Action Quickbar */}
        <div className="flex gap-2">
           <button 
             onClick={onClose}
             className="flex-1 py-2 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 text-[9px] font-black uppercase tracking-widest transition-all"
           >
             Cerrar
           </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-8">
        {/* Entidades Vinculadas */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2">
              Actores y Escenarios
            </h3>
            <span className="text-[9px] font-bold text-primary/60">{linkedEntities.length} Vinculados</span>
          </div>
          
          <div className="grid grid-cols-1 gap-2">
            {linkedEntities.map(ent => (
              <div 
                key={ent.id}
                onClick={() => onNavigateToEntity?.(ent.id, ent.carpeta_id!)}
                className="flex items-center gap-3 p-3 bg-foreground/5 border border-foreground/5 hover:border-primary/30 transition-all cursor-pointer group"
              >
                <Avatar name={ent.nombre} size="sm" className="rounded-none border border-foreground/10" />
                <div className="flex flex-col">
                  <span className="text-[11px] font-bold text-foreground group-hover:text-primary transition-colors">{ent.nombre}</span>
                  <span className="text-[9px] font-black uppercase text-foreground/30 tracking-widest">{ent.tipo}</span>
                </div>
              </div>
            ))}
            {linkedEntities.length === 0 && (
              <div className="p-6 text-center border border-dashed border-foreground/10 rounded-sm">
                <p className="text-[10px] text-foreground/30 uppercase tracking-widest italic">Sin vínculos registrados</p>
              </div>
            )}
          </div>
        </section>

        {/* GM Notes / Private Blog */}
        <section className="flex flex-col h-[400px]">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 mb-4 px-2">
            Crónica Privada (Notas del GM)
          </h3>
          <div className="flex-1 border border-foreground/10 bg-foreground/[0.02] overflow-hidden">
            <ZenEditor 
              content={event.descripcion || ''}
              title={event.titulo}
              onUpdate={handleNotesUpdate}
              onTitleChange={() => {}}
              onSnapshot={() => {}}
              editable={true}
            />
          </div>
        </section>
      </div>
    </div>
  );
};

export default EventInspector;
