import { useState, useCallback, useMemo } from "react";
import { Evento, Entidad } from "@domain/database";

/**
 * 🧠 useTimelineEditor
 * Handles UI state for the timeline dimension editor, including modals and inline editing.
 */
export const useTimelineEditor = ({
  t,
  events,
  linkedEntities,
  lines,
  involvedEntities,
  handleSaveEvent,
  handleDeleteEvent,
  handleAddEvent,
}: {
  t: (key: string) => string;
  events: Evento[];
  linkedEntities: Record<number, Entidad[]>;
  lines: any[];
  involvedEntities: Entidad[];
  handleSaveEvent: (id: number, data: any) => Promise<void>;
  handleDeleteEvent: (id: number) => Promise<void>;
  handleAddEvent: (lineId: number | null) => Promise<Evento | null>;
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editDate, setEditDate] = useState("");
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [isEntityPickerOpen, setIsEntityPickerOpen] = useState(false);
  const [currentEventForLinking, setCurrentEventForLinking] = useState<
    number | null
  >(null);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  const onEditStart = useCallback((event: Evento) => {
    setEditingId(event.id);
    setEditTitle(event.titulo);
    setEditDesc(event.descripcion || "");
    setEditDate(event.fecha_simulada || "");
  }, []);

  const handleSaveEdit = useCallback(async () => {
    if (editingId === null) return;
    await handleSaveEvent(editingId, {
      titulo: editTitle.trim() || t("timeline.milestone"),
      descripcion: editDesc.trim(),
      fecha_simulada: editDate.trim() || "?",
    });
    setEditingId(null);
  }, [editingId, editTitle, editDesc, editDate, handleSaveEvent, t]);

  const handleConfirmDelete = useCallback(async () => {
    if (deletingId === null) return;
    await handleDeleteEvent(deletingId);
    setDeletingId(null);
  }, [deletingId, handleDeleteEvent]);

  const handleAddEventAndEdit = useCallback(
    async (lineId: number | null) => {
      const newEvent = await handleAddEvent(lineId);
      if (newEvent) onEditStart(newEvent);
    },
    [handleAddEvent, onEditStart],
  );

  const getConnections = useMemo(() => {
    return events
      .map((event) => {
        const linkedIds = linkedEntities[event.id]?.map((e) => e.id) || [];
        const involvedInTracks = [
          ...(event.linea_id !== undefined && event.linea_id !== null
            ? [event.linea_id]
            : [null]),
          ...linkedIds,
        ].filter((id, index, self) => self.indexOf(id) === index);

        if (involvedInTracks.length < 2) return null;

        const trackIndices = involvedInTracks
          .map((id) => {
            if (id === null) return 0;
            const lineIdx = lines.findIndex((l) => l.id === id);
            if (lineIdx !== -1) return lineIdx + 1;
            const invIdx = involvedEntities.findIndex((e) => e.id === id);
            if (invIdx !== -1) return lines.length + invIdx + 1;
            return -1;
          })
          .filter((idx) => idx !== -1);

        if (trackIndices.length < 2) return null;
        return {
          eventId: event.id,
          date: event.fecha_simulada,
          minIdx: Math.min(...trackIndices),
          maxIdx: Math.max(...trackIndices),
        };
      })
      .filter(Boolean);
  }, [events, linkedEntities, lines, involvedEntities]);

  return {
    editingId,
    setEditingId,
    editTitle,
    setEditTitle,
    editDesc,
    setEditDesc,
    editDate,
    setEditDate,
    deletingId,
    setDeletingId,
    isEntityPickerOpen,
    setIsEntityPickerOpen,
    currentEventForLinking,
    setCurrentEventForLinking,
    isImportModalOpen,
    setIsImportModalOpen,
    isExpanded,
    setIsExpanded,
    onEditStart,
    handleSaveEdit,
    handleConfirmDelete,
    handleAddEventAndEdit,
    getConnections,
  };
};
