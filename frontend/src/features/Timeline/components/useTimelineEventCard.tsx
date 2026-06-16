import { useCallback } from 'react';
import { Evento } from '@domain/database';

/**
 * 🧠 useTimelineEventCard
 * Hook to handle event card actions, providing event delegation for inspector, editing, and deleting.
 */
export const useTimelineEventCard = (
  event: Evento,
  onOpenInspector: (event: Evento) => void,
  onEditStart: (event: Evento) => void,
  onDeleteRequest: (id: number) => void,
  onLinkRequest: (eventId: number) => void
) => {
  const handleOpen = useCallback(() => {
    onOpenInspector(event);
  }, [event, onOpenInspector]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEditStart(event);
  }, [event, onEditStart]);

  const handleDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteRequest(event.id);
  }, [event.id, onDeleteRequest]);

  const handleLink = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onLinkRequest(event.id);
  }, [event.id, onLinkRequest]);

  return {
    handleOpen,
    handleEdit,
    handleDelete,
    handleLink
  };
};
