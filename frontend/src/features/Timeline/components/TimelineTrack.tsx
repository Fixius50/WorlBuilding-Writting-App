import React from 'react';
import { useLanguage } from '@context/LanguageContext';
import { useTimelineTrack } from './useTimelineTrack';

interface TimelineTrackProps {
  entityId: number | null;
  title: string;
  isMain?: boolean;
  onAddEvent: (lineId: number | null) => void;
  onRemoveDimension: (id: number) => void;
  isExpanded: boolean;
  calculateX: (date: string | null) => number;
  eventsCount: number;
  firstEventDate?: string | null;
  lastEventDate?: string | null;
}

const TimelineTrack: React.FC<TimelineTrackProps> = ({
  entityId, title, isMain, onAddEvent, onRemoveDimension, isExpanded, calculateX,
  eventsCount, firstEventDate, lastEventDate
}) => {
  const { t } = useLanguage();
  const { handleAdd, handleRemove, rangeStyle } = useTimelineTrack(
    entityId, onAddEvent, onRemoveDimension, firstEventDate, lastEventDate, calculateX, eventsCount
  );

  return (
    <div className="flex flex-row min-h-[450px] last:border-0 group/row bg-transparent overflow-hidden relative" id={`track-${entityId || 'main'}`}>
      <div 
        className="w-[300px] flex-shrink-0 p-8 border-r border-[hsl(var(--divider-border))] bg-[hsl(var(--background)/0.2)] sticky left-0 z-30 flex flex-col justify-between items-start cursor-pointer hover:bg-[hsl(var(--primary)/0.02)] transition-colors group/branch"
      >
         <div className="space-y-4 w-full">
            <div className="flex items-center justify-between group/title w-full">
               <div className="flex items-center gap-4">
                 <div className={`size-3 rounded-full ${isMain ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--foreground)/0.2)]'} shadow-[0_0_15px_hsl(var(--primary)/0.4)]`} />
                 <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[hsl(var(--foreground))] truncate max-w-[180px]">
                   {isMain ? t('timeline.main_line') : title}
                 </h2>
                 {!isMain && (
                   <div className="flex gap-2 opacity-0 group-hover/branch:opacity-100 transition-opacity">
                      <button onClick={handleRemove} className="material-symbols-outlined text-xs text-[hsl(var(--foreground)/0.4)] hover:text-rose-500">logout</button>
                   </div>
                 )}
               </div>
            </div>
            <p className="text-[9px] text-[hsl(var(--foreground)/0.3)] font-medium leading-relaxed italic pr-4">
              {isMain ? "El flujo original de la existencia." : "Hilo causal de la entidad."}
            </p>
         </div>
         
         <div className="flex-1 flex items-center w-full">
           <button 
             onClick={handleAdd}
             className="px-6 py-2 bg-[hsl(var(--primary)/0.05)] hover:bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[10px] font-black uppercase tracking-widest border border-[hsl(var(--primary)/0.2)] transition-all flex items-center justify-center gap-2 group/btn rounded-full whitespace-nowrap"
           >
             <span className="material-symbols-outlined text-sm group-hover/btn:scale-125 transition-transform">add_circle</span>
             {t('timeline.milestone')}
           </button>
         </div>
      </div>

      <div className="flex-1 flex flex-col relative overflow-x-auto custom-scrollbar-h min-w-0 bg-[hsl(var(--foreground)/0.01)]">
         <div className={`h-full relative flex items-end p-0 ${isExpanded ? 'w-[4000px]' : 'w-full'}`}>
            <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-[hsl(var(--primary)/0.4)] via-[hsl(var(--primary)/0.1)] to-transparent pointer-events-none z-10 -translate-y-1/2" />
            {rangeStyle && (
              <div 
                className="absolute top-1/2 h-px border-b border-dashed border-[hsl(var(--primary)/0.6)] pointer-events-none transition-all duration-700 z-10 -translate-y-1/2"
                style={rangeStyle}
              />
            )}
            <div className="w-full h-full relative" />
         </div>
      </div>
    </div>
  );
};

export default TimelineTrack;

