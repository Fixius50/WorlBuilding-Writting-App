import { useState, useEffect, useCallback } from 'react';
import { TimelineUseCase } from '@features/Timeline';
import { Evento } from '@domain/database';

/**
 * ðŸ§  useMiniTimeline
 * Hook to handle event loading for a specific entity, managing chronological sequencing and creation triggers.
 */
export const useMiniTimeline = (entityId: number) => {
  const [events, setEvents] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);

  const loadEvents = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const data = await TimelineUseCase.getEventsByEntity(id);
      setEvents(data);
    } catch (err) {
      console.error('Failed to load mini-timeline:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (entityId) {
      loadEvents(entityId);
    }
  }, [entityId, loadEvents]);

  const handleAddEvent = useCallback(() => {
    window.alert('Abrir modal de creaciÃ³n rÃ¡pida en desarrollo');
  }, []);

  return {
    events,
    loading,
    handleAddEvent
  };
};

