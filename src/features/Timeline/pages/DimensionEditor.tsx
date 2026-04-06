import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { useLanguage } from '../../../context/LanguageContext';
import { timelineService } from '../../../database/timelineService';
import { folderService } from '../../../database/folderService';
import { entityService } from '../../../database/entityService';
import { Evento, Carpeta, DimensionLinea, Entidad } from '../../../database/types';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

const DimensionEditor: React.FC = () => {
  const { username, projectName, folderId } = useParams<{ username: string; projectName: string; folderId: string }>();
  const navigate = useNavigate();
  const [isLineModalOpen, setIsLineModalOpen] = useState(false);
  const [newLineName, setNewLineName] = useState('');
  const { t } = useLanguage();
  
  const { 
    setRightPanelContent, 
    setRightOpen, 
    setRightPanelTitle 
  } = useOutletContext<any>();

  // Data States
  const [folder, setFolder] = useState<Carpeta | null>(null);
  const [lines, setLines] = useState<DimensionLinea[]>([]);
  const [events, setEvents] = useState<Evento[]>([]);
  const [linkedEntities, setLinkedEntities] = useState<Record<number, Entidad[]>>({});
  const [projectEntities, setProjectEntities] = useState<Entidad[]>([]);
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
  const [editingLineId, setEditingLineId] = useState<number | null>(-1);
  const [editLineName, setEditLineName] = useState('');

  const loadData = useCallback(async () => {
    if (!folderId) return;
    setLoading(true);
    try {
      const id = Number(folderId);
      const [fInfo, dbLines, allEvents] = await Promise.all([
        folderService.getById(id),
        timelineService.getLinesByFolder(id),
        timelineService.getByTimeline(id)
      ]);

      if (fInfo) {
        setFolder(fInfo);
        setLines(dbLines);
        setEvents(allEvents);

        const entityMap: Record<number, Entidad[]> = {};
        await Promise.all(allEvents.map(async (ev) => {
          entityMap[ev.id] = await timelineService.getLinkedEntities(ev.id);
        }));
        setLinkedEntities(entityMap);

        const pEntities = await entityService.getAllByProject(fInfo.project_id);
        setProjectEntities(pEntities);
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

  useEffect(() => {
    // Clear right panel on this view as requested by user to avoid interaction issues
    if (setRightPanelContent) {
      setRightPanelContent(null);
      setRightOpen(false);
    }
  }, [setRightPanelContent, setRightOpen]);

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
    if (year === null) return 8; // Aumentamos margen base
    const rawPercent = ((year - timelineBounds.min) / timelineBounds.range) * 100;
    // Margen de seguridad del 8% al inicio para evitar que pegue al borde izquierdo
    return 8 + (rawPercent * 0.84);
  };

  const handleAddLine = () => {
    setNewLineName('');
    setIsLineModalOpen(true);
  };

  const handleConfirmAddLine = async () => {
    if (!folderId || !newLineName.trim()) return;
    try {
      await timelineService.createLine({
        nombre: newLineName.trim(),
        carpeta_id: Number(folderId)
      });
      setIsLineModalOpen(false);
      await loadData();
    } catch (err) {
      console.error("Failed to create branch", err);
    }
  };

  const handleRenameLine = async (lineId: number) => {
    if (!editLineName.trim()) return;
    await timelineService.updateLine(lineId, { nombre: editLineName.trim() });
    setEditingLineId(null);
    await loadData();
  };

  const handleDeleteLine = async (lineId: number) => {
     if (window.confirm(t('timeline.delete_branch_confirm'))) {
        await timelineService.deleteLine(lineId);
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
        linea_id: lineId
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


  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-[hsl(var(--background))]">
      <div className="animate-pulse font-black uppercase tracking-widest text-xs text-[hsl(var(--foreground)/0.4)]">
        {t('timeline.multiverse_desc')}
      </div>
    </div>
  );

  const renderTimelineRow = (lineId: number | null, title: string, isLast: boolean) => {
    const lineEvents = events
      .filter(ev => ev.linea_id === lineId)
      .sort((a, b) => (getYear(a.fecha_simulada) || 0) - (getYear(b.fecha_simulada) || 0));
    
    const isMain = lineId === null;
    
    return (
      <div className="flex flex-row min-h-[450px] last:border-0 group/row bg-transparent overflow-hidden relative">
        {/* Subtle row separation via a very faint glow instead of a hard border - Removing to fix visual artifacts */}
        <div className="absolute inset-x-0 bottom-0 border-b border-transparent pointer-events-none" />
        {/* Branch Identity Panel (Left Sidebar) */}
        <div className="w-[300px] flex-shrink-0 p-8 border-r border-[hsl(var(--divider-border))] bg-[hsl(var(--background)/0.2)] backdrop-blur-xl sticky left-0 z-30 flex flex-col justify-between items-start">
           <div className="space-y-4 w-full">
             <div className="flex items-center justify-between group/title w-full">
               {editingLineId === lineId ? (
                 <div className="flex items-center gap-2 w-full">
                    <input 
                      autoFocus
                      value={editLineName}
                      onChange={(e) => setEditLineName(e.target.value)}
                      onBlur={() => handleRenameLine(lineId!)}
                      onKeyDown={(e) => e.key === 'Enter' && handleRenameLine(lineId!)}
                      className="bg-[hsl(var(--foreground)/0.05)] border border-[hsl(var(--primary)/0.5)] text-[11px] font-black uppercase tracking-widest p-3 w-full outline-none animate-in fade-in zoom-in-95"
                    />
                 </div>
               ) : (
                 <div className="flex items-center gap-4">
                   <div className={`size-3 rounded-full ${isMain ? 'bg-[hsl(var(--primary))]' : 'bg-[hsl(var(--foreground)/0.2)]'} shadow-[0_0_15px_hsl(var(--primary)/0.4)]`} />
                   <h2 className="text-xs font-black uppercase tracking-[0.2em] text-[hsl(var(--foreground))]">
                     {isMain ? t('timeline.main_line') : title}
                   </h2>
                   {!isMain && (
                     <div className="flex gap-2 opacity-0 group-hover/title:opacity-100 transition-opacity">
                        <button onClick={() => { setEditingLineId(lineId); setEditLineName(title); }} className="material-symbols-outlined text-xs text-[hsl(var(--foreground)/0.4)] hover:text-[hsl(var(--primary))]">edit</button>
                        <button onClick={() => handleDeleteLine(lineId!)} className="material-symbols-outlined text-xs text-[hsl(var(--foreground)/0.4)] hover:text-rose-500">delete</button>
                     </div>
                   )}
                 </div>
               )}
             </div>
             <p className="text-[9px] text-[hsl(var(--foreground)/0.3)] font-medium leading-relaxed italic pr-4">
               {isMain ? "El flujo original de la existencia." : "Una bifurcación en el destino."}
             </p>
           </div>
           
           {/* El botón hito ahora está centrado verticalmente respecto al eje que moveremos al centro */}
           <div className="flex-1 flex items-center w-full">
             <button 
               onClick={() => handleAddEvent(lineId)}
               className="px-6 py-2 bg-[hsl(var(--primary)/0.05)] hover:bg-[hsl(var(--primary)/0.1)] text-[hsl(var(--primary))] text-[10px] font-black uppercase tracking-widest border border-[hsl(var(--primary)/0.2)] transition-all flex items-center justify-center gap-2 group/btn rounded-full whitespace-nowrap"
             >
               <span className="material-symbols-outlined text-sm group-hover/btn:scale-125 transition-transform">add_circle</span>
               {t('timeline.milestone')}
             </button>
           </div>
        </div>

        {/* Timeline Path (Horizontal Scroll Area) */}
        <div className="flex-1 flex flex-col relative overflow-x-auto custom-scrollbar-h min-w-0 bg-[hsl(var(--foreground)/0.01)]">
           {/* Inner Draw Area (Where 4000px width lives) */}
           <div className={`h-full relative flex items-end p-0 ${isExpanded ? 'w-[4000px]' : 'w-full'}`}>
              
              {/* Permanent horizontal baseline (The Actual Timeline Path) - Centrada ahora */}
              <div className="absolute top-1/2 left-0 right-0 h-px bg-gradient-to-r from-[hsl(var(--primary)/0.6)] via-[hsl(var(--primary)/0.2)] to-transparent pointer-events-none z-10 shadow-[0_0_10px_hsl(var(--primary)/0.2)] -translate-y-1/2" />

              {/* Connecting Line (Dashed) between events */}
              {lineEvents.length > 1 && !isLast && (
                <div 
                  className="absolute top-1/2 h-px border-b border-dashed border-[hsl(var(--primary)/0.6)] pointer-events-none transition-all duration-700 z-10 -translate-y-1/2"
                  style={{ 
                    left: `${calculateX(lineEvents[0].fecha_simulada)}%`,
                    right: `${100 - calculateX(lineEvents[lineEvents.length - 1].fecha_simulada)}%`
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
         {/* The Rows Layer (Lanes) */}
         <div className="relative z-10">
            {renderTimelineRow(null, t('timeline.main_line'), lines.length === 0)}
            {lines.map((line, index) => renderTimelineRow(line.id, line.nombre, index === lines.length - 1))}
            
            {/* Add Branch Row Placeholder */}
            <div className="flex flex-row min-h-[150px] opacity-10 hover:opacity-100 transition-opacity duration-700 bg-gradient-to-b from-transparent to-[hsl(var(--foreground)/0.02)]">
               <div className="w-[300px] flex-shrink-0 flex items-center justify-center border-r border-[hsl(var(--divider-border))]">
                  <button onClick={handleAddLine} className="flex flex-col items-center gap-4 group">
                     <div className="size-8 border border-dashed border-[hsl(var(--foreground)/0.2)] flex items-center justify-center group-hover:border-[hsl(var(--primary)/0.5)] group-hover:text-[hsl(var(--primary))] transition-all">
                        <span className="material-symbols-outlined text-lg transition-transform group-hover:scale-125">add</span>
                     </div>
                     <span className="text-[9px] font-black uppercase tracking-[0.2em] group-hover:text-[hsl(var(--foreground))]">{t('timeline.add_branch')}</span>
                  </button>
               </div>
            </div>
         </div>

         {/* The Global Events Overlay (Nodos orbitantes) */}
         <div className={`absolute top-0 left-0 right-0 pointer-events-none z-20 ${isExpanded ? 'w-[4000px]' : 'w-full'}`} style={{ minHeight: '100%' }}>
            {/* Horizontal padding for alignment with the Timeline Area (300px is the Sidebar Width) */}
            <div className="ml-[300px] relative h-full">
               {(events as Evento[]).map((event) => {
                 const posX = calculateX(event.fecha_simulada);
                 const lineIndex = event.linea_id === null ? 0 : (lines.findIndex(l => l.id === event.linea_id) + 1);
                 const posY = (lineIndex * 450) + 225;

                 return (
                   <div 
                     key={event.id} 
                     className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group/card pointer-events-auto"
                     style={{ left: `${posX}%`, top: `${posY}px` }}
                   >
                     {/* Event Details Card (Always visible) */}
                     <div className="w-[350px] monolithic-panel p-5 border border-[hsl(var(--panel-border))] bg-[hsl(var(--background)/0.98)] backdrop-blur-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.5)] opacity-100 translate-y-0 transition-all duration-300 z-50 group-hover/card:border-[hsl(var(--primary)/0.5)] group-hover/card:shadow-[0_0_30px_hsl(var(--primary)/0.15)]">
                         <div className="flex items-center justify-between mb-4">
                           <div className="flex flex-col">
                             <span className="text-[10px] font-black text-[hsl(var(--primary))] uppercase tracking-[0.2em] leading-none mb-1">{event.fecha_simulada || '?'}</span>
                             <span className="text-[8px] font-black text-[hsl(var(--foreground)/0.3)] uppercase tracking-widest">{t('timeline.node_id')}: {event.id.toString(16).toUpperCase()}</span>
                           </div>
                           <div className="flex gap-2">
                             <button onClick={() => handleEditStart(event)} className="size-6 flex items-center justify-center hover:bg-[hsl(var(--foreground)/0.05)] transition-colors"><span className="material-symbols-outlined text-sm">edit</span></button>
                             <button onClick={() => setDeletingId(event.id)} className="size-6 flex items-center justify-center hover:bg-rose-500/20 hover:text-rose-500 transition-colors"><span className="material-symbols-outlined text-sm">delete</span></button>
                           </div>
                         </div>
                         <h4 className="text-sm font-black text-[hsl(var(--foreground))] uppercase tracking-tight mb-4 group-hover/card:text-[hsl(var(--primary))] transition-colors leading-tight">{event.titulo}</h4>
                         <div className="h-px w-full bg-gradient-to-r from-[hsl(var(--divider-border))] to-transparent mb-4" />
                         <div className="flex flex-wrap gap-2 mb-4">
                            {linkedEntities[event.id]?.map(ent => (
                              <div key={ent.id} className="px-2 py-1 bg-[hsl(var(--foreground)/0.03)] border border-[hsl(var(--divider-border))] text-[8px] font-bold text-[hsl(var(--foreground)/0.5)] uppercase tracking-widest">
                                {ent.nombre}
                              </div>
                            ))}
                            <button 
                              onClick={() => { setCurrentEventForLinking(event.id); setIsEntityPickerOpen(true); }}
                              className="size-6 bg-[hsl(var(--primary)/0.1)] border border-dashed border-[hsl(var(--primary)/0.3)] flex items-center justify-center text-[hsl(var(--primary))] hover:bg-[hsl(var(--primary)/0.2)] transition-colors"
                            >
                              <span className="material-symbols-outlined text-xs">add</span>
                            </button>
                         </div>
                         <p className="text-[10px] text-[hsl(var(--foreground)/0.5)] leading-relaxed line-clamp-3 italic">
                           {event.descripcion || 'Sin descripción'}
                         </p>
                     </div>
                   </div>
                 );
               })}
            </div>
         </div>
      </main>

      {/* Confirmation & Picker Modals */}
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 backdrop-blur-xl bg-black/60 animate-in fade-in duration-300">
           <div className="w-full max-w-xl monolithic-panel p-10 shadow-2xl animate-in zoom-in-95 bg-[hsl(var(--background))] border border-[hsl(var(--panel-border))] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-[hsl(var(--primary))]" />
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter text-[hsl(var(--foreground))] leading-none">{t('timeline.link_entity')}</h2>
                    <p className="text-[10px] text-[hsl(var(--foreground)/0.3)] uppercase tracking-widest mt-2">Vincular personaje o lugar al hito</p>
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
                        <div className="size-10 bg-[hsl(var(--foreground)/0.05)] flex items-center justify-center text-[hsl(var(--foreground)/0.4)] group-hover:text-[hsl(var(--primary))] group-hover:bg-[hsl(var(--primary)/0.1)] transition-all">
                           <span className="material-symbols-outlined">person</span>
                        </div>
                        <div className="text-left">
                           <div className="text-[13px] font-black text-[hsl(var(--foreground))] tracking-wide">{ent.nombre}</div>
                           <div className="text-[9px] text-[hsl(var(--foreground)/0.3)] uppercase tracking-widest font-bold">{ent.tipo}</div>
                        </div>
                     </div>
                     <div className="size-8 rounded-full border border-[hsl(var(--divider-border))] flex items-center justify-center group-hover:border-[hsl(var(--primary)/0.5)] transition-all">
                        <span className="material-symbols-outlined text-sm text-[hsl(var(--primary))] opacity-0 group-hover:opacity-100 transition-opacity">add_link</span>
                     </div>
                   </button>
                 ))}
                 {projectEntities.length === 0 && (
                   <div className="p-10 text-center border border-dashed border-[hsl(var(--divider-border))] opacity-30">
                      <p className="text-xs font-bold uppercase tracking-widest">Sin entidades para vincular</p>
                   </div>
                 )}
              </div>
              <div className="mt-10 pt-8 border-t border-[hsl(var(--divider-border))] text-right">
                 <button onClick={() => setIsEntityPickerOpen(false)} className="px-8 py-3 bg-[hsl(var(--foreground)/0.02)] hover:bg-[hsl(var(--foreground)/0.05)] text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.3)] hover:text-[hsl(var(--foreground))] transition-all">{t('common.cancel')}</button>
              </div>
           </div>
        </div>
      )}
      {/* New Branch Modal (CRUD Professional) */}
      {isLineModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-500">
           <div className="w-full max-w-lg monolithic-panel p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 bg-[hsl(var(--background))] border border-[hsl(var(--panel-border))] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent" />
              
              <div className="mb-10 text-center">
                 <div className="size-16 bg-[hsl(var(--primary)/0.1)] border border-[hsl(var(--primary)/0.2)] flex items-center justify-center text-[hsl(var(--primary))] mx-auto mb-6">
                    <span className="material-symbols-outlined text-4xl">fork_right</span>
                 </div>
                 <h2 className="text-3xl font-black uppercase tracking-tighter text-[hsl(var(--foreground))] leading-none mb-3">{t('timeline.add_branch')}</h2>
                 <p className="text-[10px] text-[hsl(var(--foreground)/0.3)] uppercase tracking-[0.3em] font-black">{t('timeline.multiverse_bifurcation')}</p>
              </div>

              <div className="space-y-8">
                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.4)] ml-1">{t('timeline.branch_name_prompt')}</label>
                    <input 
                      autoFocus
                      type="text"
                      value={newLineName}
                      onChange={(e) => setNewLineName(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleConfirmAddLine()}
                      placeholder="Ej: Línea Temporal Delta..."
                      className="w-full bg-[hsl(var(--foreground)/0.03)] border border-[hsl(var(--panel-border))] p-5 text-sm font-bold focus:border-[hsl(var(--primary))] focus:bg-[hsl(var(--primary)/0.05)] transition-all outline-none text-center"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <button 
                      onClick={() => setIsLineModalOpen(false)}
                      className="px-6 py-4 bg-transparent border border-[hsl(var(--panel-border))] hover:border-[hsl(var(--foreground)/0.2)] text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.3)] hover:text-[hsl(var(--foreground))] transition-all"
                    >
                      {t('common.cancel')}
                    </button>
                    <button 
                      onClick={handleConfirmAddLine}
                      disabled={!newLineName.trim()}
                      className="px-6 py-4 bg-[hsl(var(--primary))] text-white text-[10px] font-black uppercase tracking-widest shadow-[0_10px_20px_hsl(var(--primary)/0.3)] hover:scale-105 transition-all disabled:opacity-30 disabled:scale-100"
                    >
                      {t('common.confirm')}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}

      {/* Editing Milestone Modal (CRUD Professional) */}
      {editingId !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 backdrop-blur-2xl bg-black/80 animate-in fade-in duration-500">
           <div className="w-full max-w-2xl monolithic-panel p-12 shadow-[0_0_100px_rgba(0,0,0,0.8)] animate-in zoom-in-95 bg-[hsl(var(--background))] border border-[hsl(var(--panel-border))] relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[hsl(var(--primary))] to-transparent" />
              
              <div className="mb-10 flex items-center justify-between">
                 <div>
                    <h2 className="text-3xl font-black uppercase tracking-tighter text-[hsl(var(--foreground))] leading-none mb-3">{t('timeline.edit_event')}</h2>
                    <p className="text-[10px] text-[hsl(var(--foreground)/0.3)] uppercase tracking-[0.3em] font-black">Refinar el registro histórico</p>
                 </div>
                 <div className="size-16 bg-[hsl(var(--primary)/0.05)] border border-[hsl(var(--primary)/0.1)] flex items-center justify-center text-[hsl(var(--primary))]">
                    <span className="material-symbols-outlined text-3xl">edit_note</span>
                 </div>
              </div>

              <div className="space-y-8">
                 <div className="grid grid-cols-3 gap-6">
                    <div className="col-span-2 space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.4)] ml-1">{t('timeline.title')}</label>
                       <input 
                         type="text"
                         value={editTitle}
                         onChange={(e) => setEditTitle(e.target.value)}
                         className="w-full bg-[hsl(var(--foreground)/0.03)] border border-[hsl(var(--panel-border))] p-4 text-sm font-bold focus:border-[hsl(var(--primary))] focus:bg-[hsl(var(--primary)/0.05)] transition-all outline-none"
                       />
                    </div>
                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.4)] ml-1">{t('timeline.date')}</label>
                       <input 
                         type="text"
                         value={editDate}
                         onChange={(e) => setEditDate(e.target.value)}
                         className="w-full bg-[hsl(var(--foreground)/0.03)] border border-[hsl(var(--panel-border))] p-4 text-sm font-bold focus:border-[hsl(var(--primary))] focus:bg-[hsl(var(--primary)/0.05)] transition-all outline-none text-center"
                       />
                    </div>
                 </div>

                 <div className="space-y-3">
                    <label className="text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.4)] ml-1">{t('timeline.description')}</label>
                    <textarea 
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      rows={5}
                      className="w-full bg-[hsl(var(--foreground)/0.03)] border border-[hsl(var(--panel-border))] p-5 text-sm font-medium focus:border-[hsl(var(--primary))] focus:bg-[hsl(var(--primary)/0.05)] transition-all outline-none resize-none custom-scrollbar italic"
                    />
                 </div>

                 <div className="grid grid-cols-2 gap-4 pt-4">
                    <button 
                      onClick={handleCancelEdit}
                      className="px-6 py-4 bg-transparent border border-[hsl(var(--panel-border))] hover:border-[hsl(var(--foreground)/0.2)] text-[10px] font-black uppercase tracking-widest text-[hsl(var(--foreground)/0.3)] hover:text-[hsl(var(--foreground))] transition-all"
                    >
                      {t('common.cancel')}
                    </button>
                    <button 
                      onClick={handleSaveEdit}
                      className="px-6 py-4 bg-[hsl(var(--primary))] text-white text-[10px] font-black uppercase tracking-widest shadow-[0_10px_20px_hsl(var(--primary)/0.3)] hover:scale-105 transition-all"
                    >
                      {t('common.save')}
                    </button>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default DimensionEditor;
