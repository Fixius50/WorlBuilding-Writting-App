import { useState, useEffect, useCallback } from 'react';
import { TimelineUseCase } from '@application/useCases/TimelineUseCase';
import { Evento } from '@domain/models/database';
import { TimelineLine, UniverseExtended } from '@domain/models/timeline';
import { useRightPanelStore } from '@store/useRightPanelStore';

/**
 * 🧠 useTimelineView
 * Manages multiverses, timeline branches, and event orchestration.
 */
export const useTimelineView = (projectId: number) => {
  const { openPanel } = useRightPanelStore();
  
  const [universes, setUniverses] = useState<UniverseExtended[]>([]);
  const [selectedUniverseId, setSelectedUniverseId] = useState<number | null>(null);
  const [selectedTimelineId, setSelectedTimelineId] = useState<number | null>(null);
  const [events, setEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  const [newEvent, setNewEvent] = useState({ titulo: '', descripcion: '', fecha_simulada: '', ordenAbsoluto: 0 });
  const [newLine, setNewLine] = useState({ nombre: '', descripcion: '', universoId: null as number | null });
  const [newUniverse, setNewUniverse] = useState({ nombre: '', descripcion: '' });
  
  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [editingTimeline, setEditingTimeline] = useState<TimelineLine | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState('universo');

  const [confirmState, setConfirmState] = useState<{ 
    open: boolean; 
    type: string | null; 
    id: number | null; 
    title: string; 
    message: string; 
  }>({
    open: false, type: null, id: null, title: '', message: ''
  });

  const loadMultiverse = useCallback(async () => {
    if (projectId) {
      try {
        const allFolders = await TimelineUseCase.getUniverses(projectId);
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
      } catch (e) {
        // Error
      }
      setLoading(false);
    }
  }, [projectId, selectedUniverseId]);

  const loadEventsByUniverse = useCallback(async (universeId: number) => {
    try {
      const data = await TimelineUseCase.getEventsByUniverse(universeId);
      setEvents(data);
    } catch (e) {
      // Error
    }
  }, []);

  useEffect(() => { loadMultiverse(); }, [loadMultiverse]);

  useEffect(() => {
    if (selectedUniverseId) loadEventsByUniverse(selectedUniverseId);
    else setEvents([]);
  }, [selectedUniverseId, loadEventsByUniverse]);

  const handleCreateUniverse = useCallback(async () => {
    if (newUniverse.nombre && projectId) {
      await TimelineUseCase.createUniverse(newUniverse.nombre, projectId);
      setNewUniverse({ nombre: '', descripcion: '' });
      await loadMultiverse();
    }
  }, [newUniverse.nombre, projectId, loadMultiverse]);

  const handleUpdateUniverse = useCallback(async () => {
    if (selectedUniverseId && projectId) {
      await TimelineUseCase.updateTimelineFolder(selectedUniverseId, newUniverse.nombre, projectId);
      await loadMultiverse();
    }
  }, [selectedUniverseId, projectId, newUniverse.nombre, loadMultiverse]);

  const handleDeleteUniverse = useCallback(async () => {
    if (selectedUniverseId) {
      setConfirmState({
        open: true,
        type: 'universe',
        id: selectedUniverseId,
        title: 'Eliminar Universo',
        message: '¿Estás seguro? Se borrarán todas las líneas y eventos asociados.'
      });
    }
  }, [selectedUniverseId]);

  const handleCreateTimeline = useCallback(async () => {
    if (newLine.nombre && projectId && selectedUniverseId) {
      await TimelineUseCase.createTimeline(newLine.nombre, projectId, selectedUniverseId);
      setNewLine({ nombre: '', descripcion: '', universoId: null });
      await loadMultiverse();
    }
  }, [newLine.nombre, projectId, selectedUniverseId, loadMultiverse]);

  const handleSaveEvent = useCallback(async () => {
    if (selectedTimelineId && newEvent.titulo && projectId) {
      if (editingEvent) {
        await TimelineUseCase.updateEvent(editingEvent.id, { ...newEvent, timeline_id: selectedTimelineId });
      } else {
        await TimelineUseCase.createEvent({
          ...newEvent, project_id: projectId, timeline_id: selectedTimelineId,
          orden: 0
        });
      }
      setNewEvent({ titulo: '', descripcion: '', fecha_simulada: '', ordenAbsoluto: events.length + 2 });
      setEditingEvent(null);
      if (selectedUniverseId) loadEventsByUniverse(selectedUniverseId);
    }
  }, [selectedTimelineId, newEvent, projectId, editingEvent, events.length, selectedUniverseId, loadEventsByUniverse]);

  const startEditEvent = useCallback((event: Evento) => {
    setEditingEvent(event);
    setSelectedEventId(event.id);
    setNewEvent({
      titulo: event.titulo,
      descripcion: event.descripcion || '',
      fecha_simulada: event.fecha_simulada || '',
      ordenAbsoluto: 0 
    });
    setActiveTab('eventos');
    openPanel('event', event.id, event.titulo);
  }, [openPanel]);

  const executeDeletion = useCallback(async () => {
    const { type, id } = confirmState;
    if (type && id) {
      if (type === 'TIMELINE') {
          await TimelineUseCase.deleteTimeline(id);
          if (selectedTimelineId === id) setSelectedTimelineId(selectedUniverseId);
      } else if (type === 'EVENT') {
          await TimelineUseCase.deleteEvent(id);
          if (selectedUniverseId) loadEventsByUniverse(selectedUniverseId);
      } else if (type === 'universe') {
          await TimelineUseCase.deleteUniverse(id);
          setSelectedUniverseId(null);
      }
      await loadMultiverse();
      setConfirmState(prev => ({ ...prev, open: false }));
    }
  }, [confirmState, selectedTimelineId, selectedUniverseId, loadEventsByUniverse, loadMultiverse]);

  return {
    universes,
    selectedUniverseId,
    setSelectedUniverseId,
    selectedTimelineId,
    setSelectedTimelineId,
    events,
    loading,
    newEvent,
    setNewEvent,
    newLine,
    setNewLine,
    newUniverse,
    setNewUniverse,
    editingEvent,
    setEditingEvent,
    editingTimeline,
    setEditingTimeline,
    selectedEventId,
    activeTab,
    setActiveTab,
    confirmState,
    setConfirmState,
    handleCreateUniverse,
    handleUpdateUniverse,
    handleDeleteUniverse,
    handleCreateTimeline,
    handleSaveEvent,
    startEditEvent,
    executeDeletion,
    projectId,
    loadMultiverse
  };
};
