import { useState, useEffect, useCallback } from 'react';
import { TimelineUseCase } from '@application/useCases/TimelineUseCase';
import { Evento } from '@domain/models/database';

/**
 * 🧠 useMiniTimeline
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
    window.alert('Abrir modal de creación rápida en desarrollo');
  }, []);

  return {
    events,
    loading,
    handleAddEvent
  };
};
