import { useState, useEffect, useCallback } from "react";
import { TimelineUseCase } from "@features/Timeline";
import { Evento } from "@domain/database";
import { TimelineLine, UniverseExtended } from "@domain/timeline";
import { useQuery } from "@tanstack/react-query";

export const timelineUniversesQueryKey = (projectId: number) =>
  ["timeline", "universes", projectId] as const;

export const timelineEventsQueryKey = (universeId: number) =>
  ["timeline", "events", universeId] as const;

/**
 * Hook useTimelineView
 * Manages multiverses, timeline branches, and event orchestration.
 */
export const useTimelineView = (projectId: number) => {
  const [selectedUniverseId, setSelectedUniverseId] = useState<number | null>(
    null,
  );
  const [selectedTimelineId, setSelectedTimelineId] = useState<number | null>(
    null,
  );

  const [newEvent, setNewEvent] = useState({
    titulo: "",
    descripcion: "",
    fecha_simulada: "",
    ordenAbsoluto: 0,
  });
  const [newLine, setNewLine] = useState({
    nombre: "",
    descripcion: "",
    universoId: null as number | null,
  });
  const [newUniverse, setNewUniverse] = useState({
    nombre: "",
    descripcion: "",
  });

  const [editingEvent, setEditingEvent] = useState<Evento | null>(null);
  const [editingTimeline, setEditingTimeline] = useState<TimelineLine | null>(
    null,
  );
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("universo");

  const [confirmState, setConfirmState] = useState<{
    open: boolean;
    type: string | null;
    id: number | null;
    title: string;
    message: string;
  }>({
    open: false,
    type: null,
    id: null,
    title: "",
    message: "",
  });

  const {
    data: universes = [],
    isLoading: universesLoading,
    refetch: refetchMultiverse,
  } = useQuery<UniverseExtended[]>({
    queryKey: timelineUniversesQueryKey(projectId),
    enabled: Number.isFinite(projectId) && projectId > 0,
    queryFn: async () => {
      const allFolders = await TimelineUseCase.getUniverses(projectId);
      const timelineFolders = allFolders.filter((f) => f.tipo === "TIMELINE");
      const rootUniverses = timelineFolders.filter((f) => f.padre_id === null);

      return rootUniverses.map((uni) => ({
        ...uni,
        lineasTemporales: timelineFolders.filter(
          (f) => f.padre_id === uni.id,
        ) as TimelineLine[],
      }));
    },
  });

  const {
    data: events = [],
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = useQuery<Evento[]>({
    queryKey: timelineEventsQueryKey(Number(selectedUniverseId || 0)),
    enabled:
      Number.isFinite(Number(selectedUniverseId || 0)) &&
      Number(selectedUniverseId || 0) > 0,
    queryFn: async () => {
      return await TimelineUseCase.getEventsByUniverse(
        Number(selectedUniverseId),
      );
    },
  });

  const loading = universesLoading || eventsLoading;

  useEffect(() => {
    if (!selectedUniverseId && universes.length > 0) {
      setSelectedUniverseId(universes[0].id);
    }
  }, [selectedUniverseId, universes]);

  const loadMultiverse = useCallback(async () => {
    await refetchMultiverse();
  }, [refetchMultiverse]);

  const loadEventsByUniverse = useCallback(async () => {
    await refetchEvents();
  }, [refetchEvents]);

  const handleCreateUniverse = useCallback(async () => {
    if (newUniverse.nombre && projectId) {
      await TimelineUseCase.createUniverse(newUniverse.nombre, projectId);
      setNewUniverse({ nombre: "", descripcion: "" });
      await loadMultiverse();
    }
  }, [newUniverse.nombre, projectId, loadMultiverse]);

  const handleUpdateUniverse = useCallback(async () => {
    if (selectedUniverseId && projectId) {
      await TimelineUseCase.updateTimelineFolder(
        selectedUniverseId,
        newUniverse.nombre,
        projectId,
      );
      await loadMultiverse();
    }
  }, [selectedUniverseId, projectId, newUniverse.nombre, loadMultiverse]);

  const handleDeleteUniverse = useCallback(async () => {
    if (selectedUniverseId) {
      setConfirmState({
        open: true,
        type: "universe",
        id: selectedUniverseId,
        title: "Eliminar Universo",
        message:
          "¿Estás seguro? Se borrarán todas las líneas y eventos asociados.",
      });
    }
  }, [selectedUniverseId]);

  const handleCreateTimeline = useCallback(async () => {
    if (newLine.nombre && projectId && selectedUniverseId) {
      await TimelineUseCase.createTimeline(
        newLine.nombre,
        projectId,
        selectedUniverseId,
      );
      setNewLine({ nombre: "", descripcion: "", universoId: null });
      await loadMultiverse();
    }
  }, [newLine.nombre, projectId, selectedUniverseId, loadMultiverse]);

  const handleSaveEvent = useCallback(async () => {
    if (selectedTimelineId && newEvent.titulo && projectId) {
      if (editingEvent) {
        await TimelineUseCase.updateEvent(editingEvent.id, {
          ...newEvent,
          timeline_id: selectedTimelineId,
        });
      } else {
        await TimelineUseCase.createEvent({
          ...newEvent,
          project_id: projectId,
          timeline_id: selectedTimelineId,
          orden: 0,
        });
      }
      setNewEvent({
        titulo: "",
        descripcion: "",
        fecha_simulada: "",
        ordenAbsoluto: events.length + 2,
      });
      setEditingEvent(null);
      if (selectedUniverseId) loadEventsByUniverse();
    }
  }, [
    selectedTimelineId,
    newEvent,
    projectId,
    editingEvent,
    events.length,
    selectedUniverseId,
    loadEventsByUniverse,
  ]);

  const startEditEvent = useCallback((event: Evento) => {
    setEditingEvent(event);
    setSelectedEventId(event.id);
    setNewEvent({
      titulo: event.titulo,
      descripcion: event.descripcion || "",
      fecha_simulada: event.fecha_simulada || "",
      ordenAbsoluto: 0,
    });
    setActiveTab("eventos");
    // Panel derecho eliminado: antes abría inspector de evento.
  }, []);

  const executeDeletion = useCallback(async () => {
    const { type, id } = confirmState;
    if (type && id) {
      if (type === "TIMELINE") {
        await TimelineUseCase.deleteTimeline(id);
        if (selectedTimelineId === id)
          setSelectedTimelineId(selectedUniverseId);
      } else if (type === "EVENT") {
        await TimelineUseCase.deleteEvent(id);
        if (selectedUniverseId) loadEventsByUniverse();
      } else if (type === "universe") {
        await TimelineUseCase.deleteUniverse(id);
        setSelectedUniverseId(null);
      }
      await loadMultiverse();
      setConfirmState((prev) => ({ ...prev, open: false }));
    }
  }, [
    confirmState,
    selectedTimelineId,
    selectedUniverseId,
    loadEventsByUniverse,
    loadMultiverse,
  ]);

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
    loadMultiverse,
  };
};
