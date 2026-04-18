import React, { useEffect, useState } from 'react';
import { timelineService } from '@repositories/timelineService';
import { entityService } from '@repositories/entityService';
import { Evento } from '@domain/models/database';

interface MiniTimelineProps {
  entityId: number;
}

const MiniTimeline: React.FC<MiniTimelineProps> = ({ entityId }) => {
  const [events, setEvents] = useState<Evento[]>([]);

  useEffect(() => {
    timelineService.getByEntity(entityId).then(setEvents);
  }, [entityId]);

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="absolute left-[3px] top-4 bottom-4 w-px bg-foreground/10" />
      
      {events.length === 0 ? (
        <div className="p-8 text-center bg-foreground/5 border border-foreground/5 italic text-[10px] text-foreground/40">
          Esta entidad no ha sido partícipe de eventos registrados aún en la gran crónica.
        </div>
      ) : (
        events.map((event, idx) => (
          <div key={event.id} className="relative pl-8 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="absolute left-0 top-1.5 size-2 rounded-full border-2 border-primary bg-background shadow-[0_0_8px_rgba(var(--primary-rgb),0.5)]" />
            
            <div className="flex flex-col">
              <span className="text-[9px] font-black uppercase tracking-widest text-primary leading-none mb-1">
                {event.fecha_simulada || 'Fecha desconocida'}
              </span>
              <h4 className="text-[12px] font-black text-foreground mb-2 leading-tight">
                {event.titulo}
              </h4>
              <p className="text-[10px] text-foreground/60 leading-relaxed font-medium">
                {event.descripcion}
              </p>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default MiniTimeline;
