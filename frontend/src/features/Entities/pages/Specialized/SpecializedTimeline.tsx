import React from 'react';
import MonolithicPanel from '@atoms/MonolithicPanel';
import { useSpecializedTimeline } from './useSpecializedTimeline';

type SpecializedEvent = { id: number; nombre?: string; descripcion?: string };

const SpecializedTimeline = ({ entities = [], onAddEvent }: { entities?: SpecializedEvent[], onAddEvent?: () => void }) => {
  const { sortedEvents, handleEventClick } = useSpecializedTimeline(entities);

  return (
    <div className="w-full max-w-3xl mx-auto p-4 animate-slide-up">
      <div className="relative border-l-2 border-foreground/40 ml-6 space-y-12 py-8">
        {sortedEvents.length === 0 && (
          <div className="pl-12 opacity-50">
            <p className="text-foreground text-sm">No events recorded in this timeline yet.</p>
          </div>
        )}

        {sortedEvents.map((evt) => (
          <div key={evt.id} className="relative pl-12 group" onClick={() => handleEventClick(evt.id)}>
            {/* Dot */}
            <div className="absolute left-[-9px] top-0 size-4 rounded-full bg-background border-2 border-primary group-hover:scale-125 group-hover:bg-primary transition-all shadow-[0_0_10px_rgba(99,102,241,0.3)]"></div>

            <MonolithicPanel className="p-6 border-foreground/10 hover:border-primary/30 transition-all hover:-translate-y-1 cursor-pointer">
              <h3 className="text-xl font-bold text-foreground mb-2">{evt.nombre}</h3>
              <p className="text-sm text-text-muted leading-relaxed line-clamp-3">{evt.descripcion || 'No description provided.'}</p>
            </MonolithicPanel>
          </div>
        ))}

        {/* Add Event Button */}
        <div
          onClick={onAddEvent}
          className="relative pl-12 group cursor-pointer opacity-50 hover:opacity-100 transition-opacity"
        >
          <div className="absolute left-[-9px] top-2 size-4 rounded-full bg-background border-2 border-dashed border-foreground/40"></div>
          <div className="p-4 border-2 border-dashed border-foreground/40 rounded-none flex items-center justify-center text-text-muted hover:border-primary/50 hover:text-foreground transition-all">
            <span className="material-symbols-outlined mr-2">add_circle</span>
            <span className="text-xs font-black uppercase tracking-widest">Add Historical Event</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SpecializedTimeline;

