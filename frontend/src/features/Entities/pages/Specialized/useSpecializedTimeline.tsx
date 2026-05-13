import { useMemo, useCallback } from 'react';

type SpecializedEvent = { id: number; nombre?: string; descripcion?: string };

/**
 * 🧠 useSpecializedTimeline
 * Hook to handle specialized timeline logic, including chronological sorting and event addition.
 */
export const useSpecializedTimeline = (entities: SpecializedEvent[] = []) => {
  const sortedEvents = useMemo(() => {
    return [...entities].sort((a, b) => a.id - b.id);
  }, [entities]);

  const handleEventClick = useCallback((id: number) => {
    // Logic to open event details
  }, []);

  return {
    sortedEvents,
    handleEventClick
  };
};
