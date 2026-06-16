import React from 'react';
import { Evento, Entidad } from '@domain/database';
import { useTimelineEventCard } from './useTimelineEventCard';

interface TimelineEventCardProps {
  event: Evento;
  trackId: number | null;
  posX: number;
  posY: number;
  linkedEntities: Entidad[];
  onOpenInspector: (event: Evento) => void;
  onEditStart: (event: Evento) => void;
  onDeleteRequest: (id: number) => void;
  onLinkRequest: (eventId: number) => void;
}

const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event, trackId, posX, posY, linkedEntities, onOpenInspector, onEditStart, onDeleteRequest, onLinkRequest
}) => {
  const { handleOpen, handleEdit, handleDelete, handleLink } = useTimelineEventCard(
    event, onOpenInspector, onEditStart, onDeleteRequest, onLinkRequest
  );

  return (
    <div 
      className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/card pointer-events-auto"
      style={{ left: `${posX}%`, top: `${posY}px` }}
      onClick={handleOpen}
    >
      <div className="w-[350px] monolithic-panel p-5 border border-[hsl(var(--panel-border))] bg-[hsl(var(--background)/0.98)] shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] group-hover/card:border-[hsl(var(--primary)/0.5)] cursor-pointer">
          <div className="flex items-center justify-between mb-4">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-[hsl(var(--primary))] uppercase tracking-[0.2em] mb-1">{event.fecha_simulada || '?'}</span>
              <span className="text-[8px] font-black text-[hsl(var(--foreground)/0.3)] uppercase tracking-widest">ID: {event.id.toString(16).toUpperCase()}</span>
            </div>
            <div className="flex gap-2">
              <button onClick={handleEdit} className="size-6 flex items-center justify-center hover:bg-[hsl(var(--foreground)/0.05)]"><span className="material-symbols-outlined text-sm">edit</span></button>
              <button onClick={handleDelete} className="size-6 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-500"><span className="material-symbols-outlined text-sm">delete</span></button>
            </div>
          </div>
          <h4 className="text-sm font-black text-[hsl(var(--foreground))] uppercase mb-4 leading-tight">{event.titulo}</h4>
          <div className="flex flex-wrap gap-2 mb-4">
             {linkedEntities.map(ent => (
                <div key={ent.id} className="px-2 py-1 bg-[hsl(var(--foreground)/0.03)] border border-[hsl(var(--divider-border))] text-[8px] font-bold text-[hsl(var(--foreground)/0.5)] uppercase">
                  {ent.nombre}
                </div>
             ))}
             <button 
               onClick={handleLink}
               className="size-6 bg-[hsl(var(--primary)/0.1)] border border-dashed border-[hsl(var(--primary)/0.3)] flex items-center justify-center text-[hsl(var(--primary))]"
             >
               <span className="material-symbols-outlined text-xs">add</span>
             </button>
          </div>
          <p className="text-[10px] text-[hsl(var(--foreground)/0.5)] leading-relaxed line-clamp-3 italic">
            {event.descripcion ? event.descripcion.replace(/<[^>]*>/g, '') : 'Sin descripción'}
          </p>
      </div>
    </div>
  );
};

export default TimelineEventCard;

