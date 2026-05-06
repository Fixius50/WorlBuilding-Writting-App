import React, { useState, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext, useLocation } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import { Evento, Entidad } from '@domain/models/database';
import ConfirmationModal from '@organisms/ConfirmationModal';
import EventInspector from '../components/EventInspector';
import { useRightPanelStore } from '@store/useRightPanelStore';

// Custom Hooks & Components
import { useTimelineManager } from '../hooks/useTimelineManager';
import TimelineTrack from '../components/TimelineTrack';
import TimelineEventCard from '../components/TimelineEventCard';
import DimensionImportModal from '../components/DimensionImportModal';
import EntityPickerModal from '../components/EntityPickerModal';

const DimensionEditor: React.FC = () => {
  const { projectName, folderId } = useParams<{ username: string; projectName: string; folderId: string }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const { openPanel, setCustomContent, closePanel } = useRightPanelStore();
  const location = useLocation();
  const isInBible = location.pathname.includes('/bible');

  // Business Logic Hook
  const {
    folder, lines, events, linkedEntities, projectEntities, availableDimensions, loading,
    calculateX, getYear,
    handleAddEvent, handleDeleteEvent, handleSaveEvent,
    handleToggleLinkEntity, handleImportDimension, handleRemoveDimension,
    involvedEntities, loadData
  } = useTimelineManager(folderId);

  // UI States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isEntityPickerOpen, setIsEntityPickerOpen] = useState(false);
  const [currentEventForLinking, setCurrentEventForLinking] = useState<number | null>(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  // Handlers
  const handleOpenInspector = (event: Evento) => {
    openPanel('bulk', event.id, event.titulo);
    setCustomContent(
      <EventInspector 
        eventId={event.id} 
        projectId={folder?.project_id}
        onUpdate={loadData} 
        onClose={closePanel}
        onNavigateToEntity={(id, fId) => navigate(`/local/${projectName}/bible/folder/${fId}/entity/${id}`)}
      />
    );
  };

  const onEditStart = (event: Evento) => {
    setEditingId(event.id);
    setEditTitle(event.titulo);
    setEditDesc(event.descripcion || '');
    setEditDate(event.fecha_simulada || '');
  };

  const handleSaveEdit = async () => {
    if (editingId === null) return;
    await handleSaveEvent(editingId, {
      titulo: editTitle.trim() || t('timeline.milestone'),
      descripcion: editDesc.trim(),
      fecha_simulada: editDate.trim() || '?'
    });
    setEditingId(null);
  };

  const handleConfirmDelete = async () => {
    if (deletingId === null) return;
    await handleDeleteEvent(deletingId);
    setDeletingId(null);
  };

  const handleAddEventAndEdit = async (lineId: number | null) => {
    const newEvent = await handleAddEvent(lineId);
    if (newEvent) onEditStart(newEvent);
  };

  // Render Helpers
  const renderTrack = (entityId: number | null, title: string, isMain: boolean = false) => {
    const lineEvents = isMain 
      ? events.filter(ev => ev.linea_id === null)
      : events.filter(ev => linkedEntities[ev.id]?.some(ent => ent.id === entityId) || ev.linea_id === entityId);
      
    const sortedEvents = lineEvents.sort((a, b) => (getYear(a.fecha_simulada) || 0) - (getYear(b.fecha_simulada) || 0));

    return (
      <TimelineTrack
        key={entityId || 'main'}
        entityId={entityId}
        title={title}
        isMain={isMain}
        isExpanded={isExpanded}
        calculateX={calculateX}
        onAddEvent={handleAddEventAndEdit}
        onRemoveDimension={handleRemoveDimension}
        eventsCount={sortedEvents.length}
        firstEventDate={sortedEvents[0]?.fecha_simulada}
        lastEventDate={sortedEvents[sortedEvents.length - 1]?.fecha_simulada}
      />
    );
  };

  if (loading) return <div className="flex-1 flex items-center justify-center text-[10px] font-black uppercase tracking-[0.5em] opacity-20">Iniciando Motor Temporal...</div>;

  return (
    <div className="flex-1 flex flex-col h-full bg-[hsl(var(--background))] selection:bg-[hsl(var(--primary)/0.3)] overflow-hidden">
      {!isInBible && (
        <header className="relative z-40 py-8 px-10 border-b border-[hsl(var(--divider-border))] bg-[hsl(var(--background)/0.8)] flex flex-col items-center justify-center ">
          <div className="flex flex-col items-center gap-4">
            <div className="size-12 bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)] flex items-center justify-center text-[hsl(var(--primary))] shadow-[0_0_20px_hsl(var(--primary)/0.2)] mb-2">
              <span className="material-symbols-outlined text-2xl">lan</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-4 mb-2">
                <h1 className="text-3xl font-black tracking-[-0.04em] text-[hsl(var(--foreground))] uppercase">{folder?.nombre}</h1>
                <div className="px-4 py-1 bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.3)] text-[hsl(var(--primary))] text-[10px] font-black uppercase tracking-widest rounded-full">{t('timeline.multiverse_tag')}</div>
              </div>
              <p className="text-[11px] font-black text-[hsl(var(--foreground)/0.3)] uppercase tracking-[0.4em] translate-x-[0.2em]">{t('timeline.multiverse')}</p>
            </div>
          </div>
        </header>
      )}

      <main className="flex-1 overflow-auto custom-scrollbar relative bg-[radial-gradient(circle_at_50%_-20%,hsl(var(--primary)/0.05),transparent)]">
         {/* Tracks Layer */}
         <div className="relative z-10">
            {renderTrack(null, t('timeline.main_line'), true)}
            {lines.map((line) => renderTrack(line.id, line.nombre))}
            {involvedEntities.map((entity) => renderTrack(entity.id, entity.nombre))}
            
            {/* Import Dimension Trigger */}
            <div className="flex flex-row min-h-[150px] opacity-20 hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-transparent to-[hsl(var(--foreground)/0.02)]">
               <div className="w-[300px] flex-shrink-0 flex items-center justify-center border-r border-[hsl(var(--divider-border))]">
                  <button onClick={() => setIsImportModalOpen(true)} className="flex flex-col items-center gap-4 group">
                     <div className="size-8 border border-dashed border-[hsl(var(--foreground)/0.2)] flex items-center justify-center group-hover:border-[hsl(var(--primary)/0.5)] group-hover:text-[hsl(var(--primary))] transition-all">
                        <span className="material-symbols-outlined text-lg transition-transform group-hover:scale-125">input</span>
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-[hsl(var(--foreground))]">Importar Dimensión</span>
                  </button>
               </div>
            </div>
         </div>

         {/* Connections Layer (SVG) */}
         <div className={`absolute top-0 left-0 right-0 pointer-events-none z-15 ${isExpanded ? 'w-[4000px]' : 'w-full'}`} style={{ minHeight: '100%' }}>
            <svg className="w-full h-full absolute inset-0">
               {events.map(event => {
                  const linkedIds = linkedEntities[event.id]?.map(e => e.id) || [];
                  const involvedInTracks = [
                    ...(event.linea_id !== undefined && event.linea_id !== null ? [event.linea_id] : [null]),
                    ...linkedIds
                  ].filter((id, index, self) => self.indexOf(id) === index);

                  if (involvedInTracks.length < 2) return null;

                  const trackIndices = involvedInTracks.map(id => {
                     if (id === null) return 0;
                     const lineIdx = lines.findIndex(l => l.id === id);
                     if (lineIdx !== -1) return lineIdx + 1;
                     const invIdx = involvedEntities.findIndex(e => e.id === id);
                     if (invIdx !== -1) return lines.length + invIdx + 1;
                     return -1;
                  }).filter(idx => idx !== -1);

                  if (trackIndices.length < 2) return null;
                  const minIdx = Math.min(...trackIndices);
                  const maxIdx = Math.max(...trackIndices);
                  
                  const x = calculateX(event.fecha_simulada);
                  const yStart = (minIdx * 450) + 225;
                  const yEnd = (maxIdx * 450) + 225;

                  return <line key={`conn-${event.id}`} x1={`${x}%`} y1={yStart} x2={`${x}%`} y2={yEnd} stroke="hsl(var(--primary) / 0.2)" strokeWidth="2" strokeDasharray="4 4" />;
               })}
            </svg>
         </div>

         {/* Events Layer (Cards) */}
         <div className={`absolute top-0 left-0 right-0 pointer-events-none z-20 ${isExpanded ? 'w-[4000px]' : 'w-full'}`} style={{ minHeight: '100%' }}>
            <div className="ml-[300px] relative h-full">
               {events.map((event) => {
                  const linkedIds = (linkedEntities[event.id]?.map(e => e.id) || []);
                  const involvedInTracks = [
                    ...(event.linea_id !== undefined && event.linea_id !== null ? [event.linea_id] : [null]),
                    ...linkedIds
                  ].filter((id, index, self) => self.indexOf(id) === index);

                  return involvedInTracks.map(trackId => {
                    let lineIndex = -1;
                    if (trackId === null) lineIndex = 0;
                    else {
                      const lIdx = lines.findIndex(l => l.id === trackId);
                      if (lIdx !== -1) lineIndex = lIdx + 1;
                      else {
                        const iIdx = involvedEntities.findIndex(e => e.id === trackId);
                        if (iIdx !== -1) lineIndex = lines.length + iIdx + 1;
                      }
                    }

                    if (lineIndex === -1) return null;

                    return (
                      <TimelineEventCard
                        key={`${event.id}-${trackId}`}
                        event={event}
                        trackId={trackId}
                        posX={calculateX(event.fecha_simulada)}
                        posY={(lineIndex * 450) + 225}
                        linkedEntities={linkedEntities[event.id] || []}
                        onOpenInspector={handleOpenInspector}
                        onEditStart={onEditStart}
                        onDeleteRequest={(id) => setDeletingId(id)}
                        onLinkRequest={(id) => { setCurrentEventForLinking(id); setIsEntityPickerOpen(true); }}
                      />
                    );
                  });
               })}
            </div>
         </div>
      </main>

      {/* Modals */}
      <ConfirmationModal 
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleConfirmDelete}
        title={t('timeline.delete_event')}
        message={t('common.are_you_sure_delete')}
        confirmText={t('common.confirm_delete')}
        type="danger"
      />

      <DimensionImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        availableDimensions={availableDimensions}
        onImport={(dim) => { handleImportDimension(dim.id); setIsImportModalOpen(false); }}
      />

      <EntityPickerModal
        isOpen={isEntityPickerOpen}
        onClose={() => setIsEntityPickerOpen(false)}
        projectEntities={projectEntities}
        onToggleLink={(entId) => { handleToggleLinkEntity(currentEventForLinking!, entId); setIsEntityPickerOpen(false); }}
      />

      {/* Inline Editor Overlay (Simple for now, can be moved to component if needed) */}
      {editingId !== null && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="w-full max-w-md monolithic-panel p-8 bg-[hsl(var(--background))] border border-[hsl(var(--primary)/0.3)] shadow-2xl">
            <h3 className="text-xl font-black mb-6 uppercase italic">Editar Hito</h3>
            <div className="space-y-4">
              <input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Título" className="w-full monolithic-panel p-4" />
              <input value={editDate} onChange={e => setEditDate(e.target.value)} placeholder="Fecha (Año)" className="w-full monolithic-panel p-4" />
              <textarea value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descripción" className="w-full monolithic-panel p-4 h-32 resize-none" />
              <div className="flex gap-4 pt-4">
                <button onClick={() => setEditingId(null)} className="flex-1 py-3 text-[10px] font-black uppercase tracking-widest opacity-60">Cancelar</button>
                <button onClick={handleSaveEdit} className="flex-1 py-3 bg-[hsl(var(--primary))] text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20">Guardar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DimensionEditor;
