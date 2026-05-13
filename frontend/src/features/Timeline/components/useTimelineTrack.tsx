import { useCallback, useMemo } from 'react';

/**
 * 🧠 useTimelineTrack
 * Hook to handle timeline track logic, managing interactions and dynamic styles for the time axis.
 */
export const useTimelineTrack = (
  entityId: number | null,
  onAddEvent: (lineId: number | null) => void,
  onRemoveDimension: (id: number) => void,
  firstEventDate: string | null | undefined,
  lastEventDate: string | null | undefined,
  calculateX: (date: string | null) => number,
  eventsCount: number
) => {
  const handleAdd = useCallback(() => {
    onAddEvent(entityId);
  }, [entityId, onAddEvent]);

  const handleRemove = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (entityId) onRemoveDimension(entityId);
  }, [entityId, onRemoveDimension]);

  const rangeStyle = useMemo(() => {
    if (eventsCount > 1 && firstEventDate && lastEventDate) {
      return {
        left: `${calculateX(firstEventDate)}%`,
        right: `${100 - calculateX(lastEventDate)}%`
      };
    }
    return null;
  }, [eventsCount, firstEventDate, lastEventDate, calculateX]);

  return {
    handleAdd,
    handleRemove,
    rangeStyle
  };
};
