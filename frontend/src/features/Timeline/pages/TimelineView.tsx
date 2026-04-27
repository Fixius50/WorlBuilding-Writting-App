import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { useLanguage } from '@context/LanguageContext';
import { useOutletContext, useParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { timelineService } from '@repositories/timelineService';
import { folderService } from '@repositories/folderService';
import { entityService } from '@repositories/entityService';
import { Evento, Entidad, DimensionLinea } from '@domain/models/database';
import ConfirmationModal from '@organisms/ConfirmationModal';
import Button from '@atoms/Button';
import TimelineEventCard from '../components/TimelineEventCard';
import { TimelineLine, UniverseExtended } from '@domain/models/timeline';

interface TimelineOutletContext {
  setRightPanelTab?: (tab: string) => void;
  setRightOpen: (open: boolean) => void;
  setRightPanelTitle: (title: React.ReactNode) => void;
  setRightPanelMode: (mode: 'CONTEXT' | 'CUSTOM') => void;
  projectId: number;
}

interface Anexo {
  id: number;
  nombre: string;
  tipo: string;
  relId: number;
}

const TimelineView = () => {
  const { t } = useLanguage();
  const { setRightPanelTab, setRightOpen, setRightPanelTitle, projectId } = useOutletContext<TimelineOutletContext>();

  const [universes, setUniverses] = useState<UniverseExtended[]>([]);
  const [selectedUniverseId, setSelectedUniverseId] = useState<number | null>(null);
  const [selectedTimelineId, setSelectedTimelineId] = useState<number | null>(null);
  const [events, setEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  // States for creation/edit
  const [newEvent, setNewEvent] = useState({ titulo: '', descripcion: '', fecha_simulada: '', ordenAbsoluto: 0 });
  const [newLine, setNewLine] = useState({ nombre: '', descripcion: '', universoId: null as number | null });
  const [newUniverse, setNewUniverse] = useState({ nombre: '', descripcion: '' });
  
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [editingTimeline, setEditingTimeline] = useState<TimelineLine | null>(null);
  
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('universo'); // 'universo' | 'linea' | 'eventos'

  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const timelineRef = useRef<HTMLDivElement>(null);

  // --- Data Loading ---
  const loadMultiverse = useCallback(async () => {
    if (!projectId) return;
    try {
      const allFolders = await folderService.getByProject(projectId);
      const timelineFolders = allFolders.filter(f => f.tipo === 'TIMELINE');
      const rootUniverses = timelineFolders.filter(f => f.padre_id === null);
      
      const extended: UniverseExtended[] = rootUniverses.map(uni => ({
        ...uni,
        lineasTemporales: timelineFolders.filter(f => f.padre_id === uni.id) as TimelineLine[]
      }));

      setUniverses(extended);
      
      if (!selectedUniverseId && extended.length > 0) {
        setSelectedUniverseId(extended[0].id);
      }
    } catch (e) { console.error(e); }
    setLoading(false);
  }, [projectId]);

  const loadEventsByUniverse = useCallback(async (universeId: number) => {
    try {
      // Cargamos todos los eventos que pertenecen a este universo (carpeta principal)
      const data = await timelineService.getByTimeline(universeId);
      setEvents(data);
    } catch (e) { console.error(e); }
  }, []);

  useEffect(() => { loadMultiverse(); }, [loadMultiverse]);

  useEffect(() => {
    if (selectedUniverseId) loadEventsByUniverse(selectedUniverseId);
    else setEvents([]);
  }, [selectedUniverseId, loadEventsByUniverse]);

  // --- Handlers ---
  const handleCreateUniverse = async () => {
    if (!newUniverse.nombre || !projectId) return;
    await folderService.create(newUniverse.nombre, projectId, null, 'TIMELINE');
    setNewUniverse({ nombre: '', descripcion: '' });
    await loadMultiverse();
  };

  const handleUpdateUniverse = async () => {
    if (!selectedUniverseId || !projectId) return;
    await folderService.update(selectedUniverseId, newUniverse.nombre, projectId);
    await loadMultiverse();
  };

  const handleDeleteUniverse = async () => {
    if (!selectedUniverseId) return;
    setConfirmState({
      open: true,
      type: 'universe',
      id: selectedUniverseId,
      title: 'Eliminar Universo',
      message: '¿Estás seguro? Se borrarán todas las líneas y eventos asociados.'
    });
  };

  const handleCreateTimeline = async () => {
    if (!newLine.nombre || !projectId || !selectedUniverseId) return;
    await folderService.create(newLine.nombre, projectId, selectedUniverseId, 'TIMELINE');
    setNewLine({ nombre: '', descripcion: '', universoId: null });
    await loadMultiverse();
  };

  const handleSaveEvent = async () => {
    if (!selectedTimelineId || !newEvent.titulo || !projectId) return;
    if (editingEvent) {
      await timelineService.update(editingEvent.id, { ...newEvent, timeline_id: selectedTimelineId });
    } else {
      await timelineService.create({
        ...newEvent, project_id: projectId, timeline_id: selectedTimelineId,
        orden: 0
      });
    }
    setNewEvent({ titulo: '', descripcion: '', fecha_simulada: '', ordenAbsoluto: events.length + 2 });
    setEditingEvent(null);
    if (selectedUniverseId) loadEventsByUniverse(selectedUniverseId);
  };

  const startEditEvent = (event: Evento) => {
    setEditingEvent(event);
    setSelectedEventId(event.id);
    setNewEvent({
      titulo: event.titulo,
      descripcion: event.descripcion || '',
      fecha_simulada: event.fecha_simulada || '',
      ordenAbsoluto: 0 
    });
    setActiveTab('eventos');
    setRightOpen(true);
  };

  // --- Deletion Confirmation ---
  const [confirmState, setConfirmState] = useState<{ open: boolean; type: string | null; id: number | null; title: string; message: string; }>({
    open: false, type: null, id: null, title: '', message: ''
  });

  const executeDeletion = async () => {
    const { type, id } = confirmState;
    if (!type || !id) return;
    if (type === 'TIMELINE') {
        // Borrado en cascada: Eliminar carpeta y eventos asociados a esa rama
        await folderService.delete(id);
        await timelineService.deleteLine(id); // Este método ya borra eventos con esa linea_id
        if (selectedTimelineId === id) setSelectedTimelineId(selectedUniverseId);
    } else if (type === 'EVENT') {
        await timelineService.delete(id);
        if (selectedUniverseId) loadEventsByUniverse(selectedUniverseId);
    } else if (type === 'universe') {
        await folderService.delete(id);
        setSelectedUniverseId(null);
    }
    await loadMultiverse();
    setConfirmState({ ...confirmState, open: false });
  };

  // --- Portal Setup ---
  useEffect(() => {
    if (setRightPanelTab) setRightPanelTab('CONTEXT');
    const el = document.getElementById('global-right-panel-portal');
    if (el) setPortalTarget(el);
    return () => { if (setRightPanelTab) setRightPanelTab('NOTEBOOKS'); };
  }, [setRightPanelTab]);

  // --- Renderers ---
  const renderUniverseTab = () => (
    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
      <div className="space-y-2">
        <h3 className="text-[10px] font-black uppercase text-amber-500 tracking-widest mb-3 flex items-center gap-2">
          <span className="material-symbols-outlined text-sm">auto_awesome_motion</span>
          Universos Existentes
        </h3>
        <div className="grid grid-cols-1 gap-1">
          {universes.map(uni => (
            <button
              key={uni.id}
              onClick={() => {
                setSelectedUniverseId(uni.id);
                setNewUniverse({ nombre: uni.nombre, descripcion: uni.descripcion || '' });
              }}
              className={`text-left p-3 border transition-all flex items-center justify-between group ${selectedUniverseId === uni.id ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-foreground/5 border-foreground/10 text-foreground/60 hover:bg-foreground/10'}`}
            >
              <span className="text-xs font-bold uppercase">{uni.nombre}</span>
              <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 transition-opacity">
                {selectedUniverseId === uni.id ? 'check_circle' : 'chevron_right'}
              </span>
            </button>
          ))}
          {universes.length === 0 && <p className="text-[10px] italic opacity-40 text-center py-4">No hay universos creados aún.</p>}
        </div>
      </div>

      <div className="bg-background/20 p-4 border border-foreground/10 space-y-4">
        <h4 className="text-[10px] font-black uppercase text-amber-500/60 mb-2">
          {selectedUniverseId ? 'Configuración de Universo' : 'Crear Nuevo Universo'}
        </h4>
        <div className="space-y-3">
          <input
            className="w-full bg-background border border-foreground/20 p-2 text-xs text-foreground outline-none focus:border-amber-500"
            value={newUniverse.nombre}
            onChange={(e) => setNewUniverse({ ...newUniverse, nombre: e.target.value })}
            placeholder="Nombre del universo..."
          />
          <div className="flex gap-2">
            <Button variant="primary" onClick={selectedUniverseId ? handleUpdateUniverse : handleCreateUniverse} className="flex-1 justify-center !text-[9px]">
              {selectedUniverseId ? 'Guardar' : 'Crear'}
            </Button>
            {selectedUniverseId && (
              <Button variant="ghost" onClick={() => { setSelectedUniverseId(null); setNewUniverse({ nombre: '', descripcion: '' }); }} className="!px-3">
                <span className="material-symbols-outlined text-sm">close</span>
              </Button>
            )}
          </div>
          {selectedUniverseId && (
            <button onClick={handleDeleteUniverse} className="w-full text-center text-[9px] text-red-500/40 hover:text-red-500 uppercase font-black pt-2">
              Eliminar Universo
            </button>
          )}
        </div>
      </div>
    </div>
  );

  const renderTimelineTab = () => {
    const activeUniverse = universes.find(u => u.id === selectedUniverseId);
    return (
      <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
        {!selectedUniverseId ? (
          <div className="p-10 text-center space-y-4 flex flex-col items-center opacity-40">
            <span className="material-symbols-outlined text-4xl">language</span>
            <p className="text-[10px] uppercase font-black">Selecciona un universo primero.</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              <h3 className="text-[10px] font-black uppercase text-indigo-500 tracking-widest mb-3 flex items-center justify-between">
                Líneas en "{activeUniverse?.nombre}"
              </h3>
              <div className="grid grid-cols-1 gap-1">
                {/* Línea Original (Siempre presente) */}
                <button
                  onClick={() => { setSelectedTimelineId(selectedUniverseId); setEditingTimeline(null); }}
                  className={`text-left p-3 border transition-all flex items-center justify-between group ${selectedTimelineId === selectedUniverseId ? 'bg-amber-500/10 border-amber-500 text-amber-400' : 'bg-foreground/5 border-foreground/10 text-foreground/60 hover:bg-foreground/10'}`}
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-bold uppercase">Línea Original</span>
                    <span className="text-[8px] opacity-40">Eje Raíz del Universo</span>
                  </div>
                  <span className="material-symbols-outlined text-sm opacity-40">{selectedTimelineId === selectedUniverseId ? 'stars' : 'radio_button_checked'}</span>
                </button>

                <div className="h-4" /> {/* Separador */}

                {/* Ramas secundarias */}
                {activeUniverse?.lineasTemporales.map(line => (
                  <div key={line.id} className="relative group/item">
                    <button
                      onClick={() => { setSelectedTimelineId(line.id); setEditingTimeline(line); }}
                      className={`w-full text-left p-3 border transition-all flex items-center justify-between ${selectedTimelineId === line.id ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400' : 'bg-foreground/5 border-foreground/10 text-foreground/60 hover:bg-foreground/10'}`}
                    >
                      <span className="text-xs font-bold uppercase">{line.nombre}</span>
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm opacity-40 group-hover:opacity-100">{selectedTimelineId === line.id ? 'check_circle' : 'arrow_forward'}</span>
                      </div>
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmState({
                          open: true,
                          type: 'TIMELINE',
                          id: line.id,
                          title: 'Eliminar Rama',
                          message: `¿Estás seguro de eliminar "${line.nombre}"? Se borrarán todos sus eventos en cascada.`
                        });
                      }}
                      className="absolute right-10 top-1/2 -translate-y-1/2 p-2 opacity-0 group-hover/item:opacity-100 hover:text-red-500 transition-all"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                ))}
                {activeUniverse?.lineasTemporales.length === 0 && <p className="text-[10px] italic opacity-40 text-center py-4">Sin líneas secundarias.</p>}
              </div>
            </div>
            <div className="bg-background/20 p-4 border border-foreground/10 space-y-4">
              <h4 className="text-[10px] font-black uppercase text-indigo-500/60">{editingTimeline ? 'Editar Línea' : 'Nueva Línea'}</h4>
              <input
                className="w-full bg-background border border-foreground/20 p-2 text-xs outline-none focus:border-indigo-500"
                placeholder="Nombre de la línea..."
                value={editingTimeline?.nombre || newLine.nombre}
                onChange={(e) => {
                  if (editingTimeline) setEditingTimeline({ ...editingTimeline, nombre: e.target.value });
                  else setNewLine({ ...newLine, nombre: e.target.value, universoId: selectedUniverseId });
                }}
              />
              <div className="flex gap-2">
                <Button variant="primary" onClick={async () => {
                  if (editingTimeline) {
                    await folderService.update(editingTimeline.id, editingTimeline.nombre, projectId);
                    await loadMultiverse();
                  } else await handleCreateTimeline();
                }} className="flex-1 justify-center !text-[9px]">
                  {editingTimeline ? 'Guardar' : 'Crear'}
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    );
  };

  const sidebarContent = (
    <>
      <div className="p-4 border-b border-foreground/10">
        <div className="flex bg-background/40 p-1 gap-1">
          {[
            { id: 'universo', label: 'Multiverso', icon: 'language', color: 'amber' },
            { id: 'linea', label: 'Línea', icon: 'timeline', color: 'indigo' },
            { id: 'eventos', label: 'Eventos', icon: 'event', color: 'primary' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-2 text-[9px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${activeTab === tab.id ? `bg-${tab.color}-500/20 text-${tab.color}-400 border border-${tab.color}-500/40` : 'text-foreground/40 hover:text-foreground/60'}`}
            >
              <span className="material-symbols-outlined text-sm">{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
        {activeTab === 'universo' && renderUniverseTab()}
        {activeTab === 'linea' && renderTimelineTab()}
        {activeTab === 'eventos' && (
           <div className="space-y-6">
             {!selectedTimelineId ? (
                <div className="p-10 text-center opacity-30 italic text-[10px] uppercase font-black">Selecciona una línea temporal primero.</div>
             ) : (
                <div className="bg-background/20 p-4 border border-foreground/10 space-y-4">
                  <h3 className="text-[10px] font-black uppercase text-primary flex items-center justify-between">
                    {editingEvent ? 'Editar Evento' : 'Añadir Hito'}
                    {editingEvent && <button onClick={() => setEditingEvent(null)} className="text-[8px] uppercase">Cancelar</button>}
                  </h3>
                  <input className="w-full bg-background border border-foreground/20 p-2 text-xs outline-none focus:border-primary" value={newEvent.titulo} onChange={e => setNewEvent({...newEvent, titulo: e.target.value})} placeholder="Título..." />
                  <div className="grid grid-cols-2 gap-2">
                    <input className="w-full bg-background border border-foreground/20 p-2 text-xs outline-none focus:border-primary" value={newEvent.fecha_simulada} onChange={e => setNewEvent({...newEvent, fecha_simulada: e.target.value})} placeholder="Fecha..." />
                    <input type="number" className="w-full bg-background border border-foreground/20 p-2 text-xs outline-none focus:border-primary" value={newEvent.ordenAbsoluto} onChange={e => setNewEvent({...newEvent, ordenAbsoluto: parseInt(e.target.value) || 0})} />
                  </div>
                  <textarea className="w-full bg-background border border-foreground/20 p-2 text-xs outline-none focus:border-primary h-24 resize-none" value={newEvent.descripcion} onChange={e => setNewEvent({...newEvent, descripcion: e.target.value})} placeholder="Crónica..." />
                  <Button variant="primary" onClick={handleSaveEvent} className="w-full justify-center !text-[10px]">Guardar</Button>
                </div>
             )}
           </div>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-background text-foreground overflow-hidden">
      {portalTarget && createPortal(sidebarContent, portalTarget)}
      <main className="flex-1 relative flex flex-col h-full overflow-hidden bg-background">
        <div className="h-20 border-b border-foreground/10 bg-background/80 backdrop-blur-xl flex items-center justify-center px-10 z-20 shrink-0 relative">
          <div className="text-center">
            <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center justify-center gap-3">
              <span className="material-symbols-outlined text-amber-500">lan</span>
              {universes.find(u => u.id === selectedUniverseId)?.nombre || 'Multiverso'}
            </h1>
            <p className="text-[10px] uppercase font-bold opacity-30 tracking-[0.3em]">Explorador de Ramas Temporales</p>
          </div>
          <div className="absolute right-10 flex gap-4 hidden lg:flex">
             <div className="flex items-center gap-2 px-4 py-2 bg-foreground/5 border border-foreground/10">
                <div className="size-2 bg-amber-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black uppercase opacity-60">Línea Raíz</span>
             </div>
             <div className="flex items-center gap-2 px-4 py-2 bg-foreground/5 border border-foreground/10">
                <div className="size-2 bg-indigo-500 rounded-full" />
                <span className="text-[10px] font-black uppercase opacity-60">Bifurcaciones</span>
             </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,rgba(var(--primary-rgb),0.05),transparent)]">
          {(() => {
            const activeUniverse = universes.find(u => u.id === selectedUniverseId);
            const branches = activeUniverse?.lineasTemporales || [];
            
            return (
              <div className="min-h-full p-10 space-y-12">
                {/* Render Main Line (Root) */}
                <div className="relative">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-[10px] font-black uppercase text-amber-500 tracking-widest bg-amber-500/10 px-3 py-1">Línea Original</span>
                  </div>
                  <div className="visual-timeline-wrapper !p-0 !min-h-0 border-l-2 border-amber-500/20 ml-4 pl-8">
                    <div className="visual-timeline-container !overflow-visible !p-0">
                      <div className="events-track !static !flex !flex-row !gap-6 !flex-wrap">
                        {events.filter(ev => ev.linea_id === null || ev.linea_id === selectedUniverseId).length === 0 ? (
                          <p className="text-[10px] italic opacity-30 py-4">No hay eventos en la línea raíz.</p>
                        ) : (
                          events.filter(ev => ev.linea_id === null || ev.linea_id === selectedUniverseId)
                            .sort((a,b) => (a.orden || 0) - (b.orden || 0))
                            .map(event => (
                              <div key={event.id} className="w-[300px] shrink-0">
                                <TimelineEventCard
                                  event={{ title: event.titulo, date: event.fecha_simulada || '', description: event.descripcion || '', type: 'GENERAL' }}
                                  onClick={() => startEditEvent(event)}
                                />
                              </div>
                            ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Render Branches (Subfolders as Lines) */}
                {branches.map(line => (
                  <div key={line.id} className="relative group">
                    <div className="flex items-center gap-4 mb-4">
                      <span className="text-[10px] font-black uppercase text-indigo-400 tracking-widest bg-indigo-500/10 px-3 py-1 border border-indigo-500/20">
                        Rama: {line.nombre}
                      </span>
                      <div className="h-px flex-1 bg-gradient-to-r from-indigo-500/20 to-transparent" />
                    </div>
                    <div className="visual-timeline-wrapper !p-0 !min-h-0 border-l-2 border-indigo-500/20 ml-4 pl-8 group-hover:border-indigo-500/40 transition-colors">
                      <div className="visual-timeline-container !overflow-visible !p-0">
                        <div className="events-track !static !flex !flex-row !gap-6 !flex-wrap">
                          {events.filter(ev => ev.linea_id === line.id).length === 0 ? (
                            <p className="text-[10px] italic opacity-20 py-4">Esta rama aún no tiene eventos registrados.</p>
                          ) : (
                            events.filter(ev => ev.linea_id === line.id)
                              .sort((a,b) => (a.orden || 0) - (b.orden || 0))
                              .map(event => (
                                <div key={event.id} className="w-[300px] shrink-0">
                                  <TimelineEventCard
                                    event={{ title: event.titulo, date: event.fecha_simulada || '', description: event.descripcion || '', type: 'GENERAL' }}
                                    onClick={() => startEditEvent(event)}
                                  />
                                </div>
                              ))
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {branches.length === 0 && (
                  <div className="py-20 text-center border border-dashed border-foreground/10 bg-foreground/5">
                    <span className="material-symbols-outlined text-4xl opacity-10 mb-4">call_split</span>
                    <p className="text-[10px] font-black uppercase opacity-20 tracking-widest">No se han detectado bifurcaciones en este universo.</p>
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      </main>
      <ConfirmationModal
        isOpen={confirmState.open}
        onClose={() => setConfirmState({ ...confirmState, open: false })}
        onConfirm={executeDeletion}
        title={confirmState.title}
        message={confirmState.message}
        confirmText={t('common.delete')}
        type="danger"
      />
    </div>
  );
};

export default TimelineView;
