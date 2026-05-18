import React from 'react';
import { useRightPanelStore } from '@store/useRightPanelStore';
import EventInspector from '@features/Timeline/components/EventInspector';
import EntityInspector from '@features/Entities/components/EntityInspector';
import RelationshipInspector from '@features/Relationships/components/RelationshipInspector';

const UniversalInspector: React.FC = () => {
  const { mode, activeId, content } = useRightPanelStore();

  switch (mode) {
    case 'entity':
      return activeId ? <EntityInspector entityId={activeId} /> : (
        <div className="h-full flex items-center justify-center p-12 text-center opacity-20">
          <div className="text-[10px] font-black uppercase tracking-widest">Selecciona una entidad</div>
        </div>
      );

    case 'event':
      return activeId ? <EventInspector eventId={Number(activeId)} /> : null;

    case 'relationship':
      return activeId ? <RelationshipInspector relationshipId={Number(activeId)} /> : null;

    case 'bulk':
      return (
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-amber-500 mb-6">
            <span className="material-symbols-outlined">edit_square</span>
            <h2 className="text-xs font-black uppercase tracking-widest">Edición en Masa</h2>
          </div>
          {/* Aquí se inyectarían las acciones masivas de la tabla */}
          <div id="bulk-actions-portal" />
        </div>
      );

    case 'custom':
      return <div className="h-full w-full flex flex-col overflow-hidden">{content}</div>;


    default:
      return (
        <div className="h-full flex flex-col items-center justify-center p-12 text-center opacity-20 select-none">
          <span className="material-symbols-outlined text-6xl mb-4">explore</span>
          <div className="text-[10px] font-black uppercase tracking-[0.3em]">Inspector Contextual</div>
          <div className="text-xs mt-2 italic">Selecciona algo para ver sus detalles</div>
        </div>
      );
  }
};

export default UniversalInspector;
