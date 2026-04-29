import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useLanguage } from '@context/LanguageContext';
import { timelineService } from '@repositories/timelineService';
import { folderService } from '@repositories/folderService';
import { entityService } from '@repositories/entityService';
import { Evento, Carpeta, Entidad } from '@domain/models/database';
import ConfirmationModal from '@organisms/ConfirmationModal';
import EventInspector from '../components/EventInspector';

const DimensionEditor: React.FC = () => {
  const { username, projectName, folderId } = useParams<{ username: string; projectName: string; folderId: string }>();
  const baseUrl = `/${username || 'local'}/${projectName}`;
  const navigate = useNavigate();
  const { t } = useLanguage();
  
  const { 
    setRightPanelContent, 
    setRightOpen, 
    setRightPanelTitle 
  } = useOutletContext<any>();

  // Data States
  const [folder, setFolder] = useState<Carpeta | null>(null);
  const [lines, setLines] = useState<Entidad[]>([]);
  const [events, setEvents] = useState<Evento[]>([]);
  const [linkedEntities, setLinkedEntities] = useState<Record<number, Entidad[]>>({});
  const [projectEntities, setProjectEntities] = useState<Entidad[]>([]);
  const [availableDimensions, setAvailableDimensions] = useState<Entidad[]>([]);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // UI States
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editDate, setEditDate] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isEntityPickerOpen, setIsEntityPickerOpen] = useState(false);
  const [currentEventForLinking, setCurrentEventForLinking] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const loadData = useCallback(async () => {
    if (!folderId) return;
    setLoading(true);
    try {
      const id = Number(folderId);
      const fInfo = await folderService.getById(id);

      if (fInfo) {
        setFolder(fInfo);
        const [dbLines, allEvents, pEntities, allDimensions] = await Promise.all([
          timelineService.getLinesByFolder(id),
          timelineService.getByTimeline(id),
          entityService.getAllByProject(fInfo.project_id),
          entityService.getAllByProjectAndType(fInfo.project_id, 'DIMENSION')
        ]);

        setLines(dbLines);
        setEvents(allEvents || []);
        setProjectEntities(pEntities || []);
        
        const currentLineIds = new Set(dbLines.map(l => l.id));
        setAvailableDimensions(allDimensions.filter(d => !currentLineIds.has(d.id)));

        const entityMap: Record<number, Entidad[]> = {};
        if (allEvents) {
          await Promise.all(allEvents.map(async (ev) => {
            entityMap[ev.id] = await timelineService.getLinkedEntities(ev.id);
          }));
        }
        setLinkedEntities(entityMap);
      }
    } catch (err) {
      console.error("Error loading dimension data:", err);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Helper Functions
  const getYear = (dateStr: string | null): number | null => {
    if (!dateStr || dateStr === '?') return null;
    const match = dateStr.match(/-?\d+/);
    return match ? parseInt(match[0]) : null;
  };

  const timelineBounds = useMemo(() => {
    const years = events.map(ev => getYear(ev.fecha_simulada)).filter(y => y !== null) as number[];
    if (years.length === 0) return { min: 0, max: 100, range: 100 };
    const min = Math.min(...years);
    const max = Math.max(...years);
    const padding = Math.max((max - min) * 0.1, 10);
    return { min: min - padding, max: max + padding, range: (max - min) + (padding * 2) };
  }, [events]);

  const calculateX = (dateStr: string | null) => {
    const year = getYear(dateStr);
    if (year === null) return 8;
    const rawPercent = ((year - timelineBounds.min) / timelineBounds.range) * 100;
    return 8 + (rawPercent * 0.84);
  };

  const handleImportDimension = async (entity: Entidad) => {
    if (!folderId) return;
    try {
      await entityService.move(entity.id, Number(folderId));
      setIsImportModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Failed to import dimension", err);
    }
  };

  const handleOpenBibleInfo = (entity: Entidad) => {
    if (!entity) return;
    if (setRightPanelContent && setRightPanelTitle) {
      setRightPanelTitle(entity.nombre);
      navigate(`${baseUrl}/bible/folder/${entity.carpeta_id}/entity/${entity.id}?mode=sidebar`);
      setRightOpen(true);
    }
  };

  const handleOpenInspector = (event: Evento) => {
    if (setRightPanelContent && setRightPanelTitle) {
      setRightPanelTitle(
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Inspector de Hitos</span>
          <span className="text-foreground font-black text-sm truncate">{event.titulo}</span>
        </div>
      );
      setRightPanelContent(
        <EventInspector 
          eventId={event.id} 
          onUpdate={loadData} 
          onClose={() => setRightOpen(false)}
          onNavigateToEntity={(id, fId) => navigate(`${baseUrl}/bible/folder/${fId}/entity/${id}`)}
        />
      );
      setRightOpen(true);
    }
  };

  const handleRemoveDimension = async (entityId: number) => {
     if (window.confirm("¿Seguro que quieres quitar esta dimensión del visor? (No se borrará de la Biblia)")) {
        await entityService.move(entityId, null);
        await loadData();
     }
  };

  const handleAddEvent = useCallback(async (lineId: number | null) => {
    if (!folder || !folderId) return;
    try {
      const newEvent = await timelineService.create({
        titulo: t('timeline.milestone'),
        descripcion: null,
        fecha_simulada: '0',
        project_id: folder.project_id,
        timeline_id: Number(folderId),
        linea_id: lineId,
        orden: 0
      });
      
      await loadData();
      handleEditStart(newEvent);
    } catch (err) {
      console.error("Failed to add event", err);
    }
  }, [folder, folderId, loadData, t]);

  const handleDeleteConfirm = async () => {
    if (deletingId === null) return;
    try {
       await timelineService.delete(deletingId);
       await loadData();
    } catch (err) {
       console.error("Failed to delete event", err);
    } finally {
       setDeletingId(null);
    }
  };

  const handleEditStart = (event: Evento) => {
    setEditingId(event.id);
    setEditTitle(event.titulo);
    setEditDesc(event.descripcion || '');
    setEditDate(event.fecha_simulada || '');
  };

  const handleSaveEdit = async () => {
    if (editingId === null) return;
    try {
       await timelineService.update(editingId, { 
         titulo: editTitle.trim() || t('timeline.milestone'),
         descripcion: editDesc.trim(),
         fecha_simulada: editDate.trim() || '?'
       });
       await loadData();
    } catch (err) {
       console.error("Failed to update event", err);
    } finally {
       setEditingId(null);
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditTitle('');
    setEditDesc('');
    setEditDate('');
  };

  const handleToggleLinkEntity = async (eventId: number, entityId: number) => {
    try {
      const alreadyLinked = linkedEntities[eventId]?.some(e => e.id === entityId);
      if (alreadyLinked) {
        await timelineService.unlinkEntity(eventId, entityId);
      } else {
        await timelineService.linkEntity(eventId, entityId);
      }
      await loadData();
    } catch (err) {
      console.error("Link error:", err);
    }
  };

  const involvedEntities = useMemo(() => {
    const ids = new Set<number>();
    lines.forEach(l => ids.add(l.id));
    Object.values(linkedEntities).forEach(ents => ents.forEach(e => ids.add(e.id)));
    return projectEntities.filter(e => ids.has(e.id) && !lines.some(l => l.id === e.id));
  }, [lines, linkedEntities, projectEntities]);

  const renderTimelineRow = (entityId: number | null, title: string, isLast: boolean, isMain: boolean = false) => {
    const lineEvents = isMain 
      ? events.filter(ev => ev.linea_id === null)
      : events.filter(ev => linkedEntities[ev.id]?.some(ent => ent.id === entityId) || ev.linea_id === entityId);
      
    const sortedEvents = lineEvents.sort((a, b) => (getYear(a.fecha_simulada) || 0) - (getYear(b.fecha_simulada) || 0));
    
    return (
      <div key={entityId || 'main'} className="flex flex-row min-h-[450px] last:border-0 group/row bg-transparent overflow-hidden relative" id={`track-${entityId || 'main'}`}>
        <div 
          onDoubleClick={() => !isMain && handleOpenBibleInfo(lines.find(l => l.id === entityId) || projectEntities.find(e => e.id === entityId)!)}
          className="w-[300px] flex-shrink-0 p-8 border-r border-[hsl(var(--divider-border))] bg-[hsl(var(--background)/0.2)] backdrop-blur-xl sticky left-0 z-30 flex flex-col justify-between items-start cursor-pointer hover:bg-[hsl(var(--primary)/0.02)] transition-colors group/branch"
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
                        <button onClick={(e) => { e.stopPropagation(); handleRemoveDimension(entityId!); }} className="material-symbols-outlined text-xs text-[hsl(var(--foreground)/0.4)] hover:text-rose-500">logout</button>
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
               onClick={() => handleAddEvent(isMain ? null : entityId)}
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
              {sortedEvents.length > 1 && (
                <div 
                  className="absolute top-1/2 h-px border-b border-dashed border-[hsl(var(--primary)/0.6)] pointer-events-none transition-all duration-700 z-10 -translate-y-1/2"
                  style={{ 
                    left: `${calculateX(sortedEvents[0].fecha_simulada)}%`,
                    right: `${100 - calculateX(sortedEvents[sortedEvents.length - 1].fecha_simulada)}%`
                  }}
                />
              )}
              <div className="w-full h-full relative" />
           </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[hsl(var(--background))] selection:bg-[hsl(var(--primary)/0.3)]">
      <header className="relative z-40 py-8 px-10 border-b border-[hsl(var(--divider-border))] bg-[hsl(var(--background)/0.8)] flex flex-col items-center justify-center backdrop-blur-2xl">
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

      <main className="flex-1 overflow-auto custom-scrollbar relative bg-[radial-gradient(circle_at_50%_-20%,hsl(var(--primary)/0.05),transparent)]">
         <div className="relative z-10">
            {renderTimelineRow(null, t('timeline.main_line'), lines.length === 0 && involvedEntities.length === 0, true)}
            {lines.map((line, index) => renderTimelineRow(line.id, line.nombre, index === lines.length - 1 && involvedEntities.length === 0))}
            {involvedEntities.map((entity, index) => renderTimelineRow(entity.id, entity.nombre, index === involvedEntities.length - 1))}
            
            <div className="flex flex-row min-h-[150px] opacity-20 hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-transparent to-[hsl(var(--foreground)/0.02)]">
               <div className="w-[300px] flex-shrink-0 flex items-center justify-center border-r border-[hsl(var(--divider-border))]">
                  <button onClick={() => setIsImportModalOpen(true)} className="flex flex-col items-center gap-4 group">
                     <div className="size-8 border border-dashed border-[hsl(var(--foreground)/0.2)] flex items-center justify-center group-hover:border-[hsl(var(--primary)/0.5)] group-hover:text-[hsl(var(--primary))] transition-all">
                        <span className="material-symbols-outlined text-lg transition-transform group-hover:scale-125">input</span>
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-[hsl(var(--foreground))]">Importar Dimensión de la Biblia</span>
                  </button>
               </div>
            </div>
         </div>

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

                  return (
                    <line 
                      key={`conn-${event.id}`}
                      x1={`${x}%`} y1={yStart} x2={`${x}%`} y2={yEnd} 
                      stroke="hsl(var(--primary) / 0.2)" strokeWidth="2" strokeDasharray="4 4"
                    />
                  );
               })}
            </svg>
         </div>

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

                    const posX = calculateX(event.fecha_simulada);
                    const posY = (lineIndex * 450) + 225;

                    return (
                      <div 
                        key={`${event.id}-${trackId}`} 
                        className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/card pointer-events-auto"
                        style={{ left: `${posX}%`, top: `${posY}px` }}
                        onClick={() => handleOpenInspector(event)}
                      >
                        <div className="w-[350px] monolithic-panel p-5 border border-[hsl(var(--panel-border))] bg-[hsl(var(--background)/0.98)] backdrop-blur-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] group-hover/card:border-[hsl(var(--primary)/0.5)] cursor-pointer">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex flex-col">
                                <span className="text-[10px] font-black text-[hsl(var(--primary))] uppercase tracking-[0.2em] mb-1">{event.fecha_simulada || '?'}</span>
                                <span className="text-[8px] font-black text-[hsl(var(--foreground)/0.3)] uppercase tracking-widest">ID: {event.id.toString(16).toUpperCase()}</span>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); handleEditStart(event); }} className="size-6 flex items-center justify-center hover:bg-[hsl(var(--foreground)/0.05)]"><span className="material-symbols-outlined text-sm">edit</span></button>
                                <button onClick={(e) => { e.stopPropagation(); setDeletingId(event.id); }} className="size-6 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-500"><span className="material-symbols-outlined text-sm">delete</span></button>
                              </div>
                            </div>
                            <h4 className="text-sm font-black text-[hsl(var(--foreground))] uppercase mb-4 leading-tight">{event.titulo}</h4>
                            <div className="flex flex-wrap gap-2 mb-4">
                               {linkedEntities[event.id]?.map(ent => (
                                 <div key={ent.id} className="px-2 py-1 bg-[hsl(var(--foreground)/0.03)] border border-[hsl(var(--divider-border))] text-[8px] font-bold text-[hsl(var(--foreground)/0.5)] uppercase">
                                   {ent.nombre}
                                 </div>
                               ))}
                               <button 
                                 onClick={(e) => { e.stopPropagation(); setCurrentEventForLinking(event.id); setIsEntityPickerOpen(true); }}
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
                  });
               })}
            </div>
         </div>
      </main>

      <ConfirmationModal 
        isOpen={deletingId !== null}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title={t('timeline.delete_event')}
        message={t('common.are_you_sure_delete')}
        confirmText={t('common.confirm_delete')}
        type="danger"
      />

      {isEntityPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/60">
           <div className="w-full max-w-xl monolithic-panel p-10 bg-[hsl(var(--background))] border border-[hsl(var(--panel-border))] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--primary))]" />
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[hsl(var(--foreground))]">{t('timeline.link_entity')}</h2>
                    <p className="text-[10px] text-[hsl(var(--foreground)/0.3)] uppercase tracking-widest mt-2">Vincular personaje o lugar</p>
                 </div>
                 <button onClick={() => setIsEntityPickerOpen(false)} className="size-10 flex items-center justify-center bg-[hsl(var(--foreground)/0.05)] hover:bg-rose-500 hover:text-white transition-all">
                    <span className="material-symbols-outlined">close</span>
                 </button>
              </div>
              <div className="max-h-[450px] overflow-y-auto pr-4 space-y-3 custom-scrollbar">
                 {projectEntities.map(ent => (
                   <button 
                     key={ent.id}
                     onClick={() => { handleToggleLinkEntity(currentEventForLinking!, ent.id); setIsEntityPickerOpen(false); }}
                     className="w-full p-5 bg-[hsl(var(--foreground)/0.02)] border border-[hsl(var(--divider-border))] hover:border-[hsl(var(--primary)/0.5)] flex items-center justify-between group transition-all hover:bg-[hsl(var(--primary)/0.03)]"
                   >
                     <div className="flex items-center gap-5">
                        <div className="size-10 bg-[hsl(var(--foreground)/0.05)] flex items-center justify-center group-hover:text-[hsl(var(--primary))] transition-all">
                           <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="text-left">
                           <div className="text-[13px] font-black text-[hsl(var(--foreground))]">{ent.nombre}</div>
                           <div className="text-[9px] text-[hsl(var(--foreground)/0.3)] uppercase tracking-widest font-bold">{ent.tipo}</div>
                        </div>
                     </div>
                     <span className="material-symbols-outlined text-sm text-[hsl(var(--primary))] opacity-0 group-hover:opacity-100 transition-opacity">add_link</span>
                   </button>
                 ))}
              </div>
              <div className="mt-10 pt-8 border-t border-[hsl(var(--divider-border))] text-right">
                 <button onClick={() => setIsEntityPickerOpen(false)} className="px-8 py-3 bg-[hsl(var(--foreground)/0.02)] text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.3)]">{t('common.cancel')}</button>
              </div>
           </div>
        </div>
      )}

      {isImportModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80">
           <div className="w-full max-w-lg monolithic-panel p-12 bg-[hsl(var(--background))] border border-[hsl(var(--panel-border))] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent" />
              <div className="mb-10 text-center">
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-[hsl(var(--foreground))] mb-3">Importar Dimensión</h2>
              </div>
              <div className="max-h-[350px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                 {availableDimensions.map(dim => (
                    <button 
                      key={dim.id}
                      onClick={() => handleImportDimension(dim)}
                      className="w-full p-5 bg-[hsl(var(--foreground)/0.02)] border border-[hsl(var(--divider-border))] hover:border-[hsl(var(--primary)/0.5)] flex items-center justify-between group transition-all"
                    >
                      <div className="text-left">
                         <div className="text-[13px] font-black text-[hsl(var(--foreground))]">{dim.nombre}</div>
                         <div className="text-[9px] text-[hsl(var(--foreground)/0.3)] uppercase tracking-widest">Dimension</div>
                      </div>
                      <span className="material-symbols-outlined text-sm text-[hsl(var(--primary))] opacity-0 group-hover:opacity-100">add_circle</span>
                    </button>
                 ))}
              </div>
              <div className="mt-10 pt-8 border-t border-[hsl(var(--divider-border))] text-right">
                 <button onClick={() => setIsImportModalOpen(false)} className="px-8 py-3 bg-[hsl(var(--foreground)/0.02)] text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.3)]">{t('common.cancel')}</button>
              </div>
           </div>
        </div>
      )}

      {editingId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80">
           <div className="w-full max-w-2xl monolithic-panel p-12 bg-[hsl(var(--background))] border border-[hsl(var(--panel-border))] relative overflow-hidden">
              <h2 className="text-3xl font-black uppercase tracking-tighter text-[hsl(var(--foreground))] mb-8">{t('timeline.edit_event')}</h2>
              <div className="space-y-8">
                 <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.4)]">{t('timeline.title')}</label>
                       <input 
                         type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                         className="w-full bg-[hsl(var(--foreground)/0.03)] border border-[hsl(var(--panel-border))] p-4 text-sm font-bold focus:border-[hsl(var(--primary))] outline-none"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.4)]">{t('timeline.date')}</label>
                       <input 
                         type="text" value={editDate} onChange={(e) => setEditDate(e.target.value)}
                         className="w-full bg-[hsl(var(--foreground)/0.03)] border border-[hsl(var(--panel-border))] p-4 text-sm font-bold focus:border-[hsl(var(--primary))] outline-none text-center"
                       />
                    </div>
                 </div>
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.4)]">{t('timeline.description')}</label>
                    <textarea 
                      value={editDesc} onChange={(e) => setEditDesc(e.target.value)} rows={5}
                      className="w-full bg-[hsl(var(--foreground)/0.03)] border border-[hsl(var(--panel-border))] p-5 text-sm font-medium focus:border-[hsl(var(--primary))] outline-none resize-none custom-scrollbar italic"
                    />
                 </div>
                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <button onClick={handleCancelEdit} className="px-6 py-4 bg-transparent border border-[hsl(var(--panel-border))] text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.3)]">{t('common.cancel')}</button>
                    <button onClick={handleSaveEdit} className="px-6 py-4 bg-[hsl(var(--primary))] text-white text-[10px] font-black uppercase tracking-widest">{t('common.save')}</button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DimensionEditor;
