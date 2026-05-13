import React from 'react';
import { useMiniTimeline } from './useMiniTimeline';

interface MiniTimelineProps {
  entityId: number;
}

const MiniTimeline: React.FC<MiniTimelineProps> = ({ entityId }) => {
  const { events, loading, handleAddEvent } = useMiniTimeline(entityId);

  return (
    <div className="flex flex-col gap-6 relative">
      <div className="flex items-center justify-between mb-2">
         <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-xs text-primary">event_note</span>
            <span className="text-[10px] font-black uppercase tracking-widest text-foreground/40">Sucesos Vinculados</span>
         </div>
         <button 
           onClick={handleAddEvent}
           className="text-[9px] font-black uppercase tracking-widest text-primary hover:text-foreground transition-colors px-2 py-1 border border-primary/20 hover:bg-primary/10"
         >
           + Añadir
         </button>
      </div>
      <div className="absolute left-[3px] top-12 bottom-4 w-px bg-foreground/10" />
      
      {loading ? (
        <div className="p-8 text-center bg-foreground/5 border border-foreground/5 italic text-[10px] text-foreground/40 animate-pulse">
          Consultando los registros del tiempo...
        </div>
      ) : events.length === 0 ? (
        <div className="p-8 text-center bg-foreground/5 border border-foreground/5 italic text-[10px] text-foreground/40">
          Esta entidad no ha sido partícipe de eventos registrados aún en la gran crónica.
        </div>
      ) : (
        events.map((event, idx) => (
          <div key={event.id} className="relative pl-8 animate-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
            <div className="absolute left-0 top-1.5 size-2 rounded-full border-2 border-primary bg-background" />
            
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

