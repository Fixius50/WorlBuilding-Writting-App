import { useState, useEffect, useCallback } from 'react';
import { TimelineUseCase } from '@features/Timeline/application/TimelineUseCase';
import { Evento, Entidad } from '@domain/database';

/**
 * ðŸ§  useEventInspector
 * Logic for inspecting and managing a timeline event, including entity linking and notes.
 */
export const useEventInspector = (
  eventId: number,
  projectId: number | undefined,
  onUpdate?: () => void
) => {
  const [event, setEvent] = useState<Evento | null>(null);
  const [linkedEntities, setLinkedEntities] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Entidad[]>([]);
  const [showResults, setShowResults] = useState(false);

  const loadEventData = useCallback(async () => {
    try {
      const [evData, entities] = await Promise.all([
        TimelineUseCase.getEventById(eventId),
        TimelineUseCase.getLinkedEntities(eventId)
      ]);
      setEvent(evData);
      setLinkedEntities(entities);
    } catch (err) { }
  }, [eventId]);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await loadEventData();
      setLoading(false);
    };
    init();
  }, [loadEventData]);

  useEffect(() => {
    const search = async () => {
      if (searchTerm.length < 2 || !projectId) {
        setSearchResults([]);
        return;
      }
      try {
        const all = await TimelineUseCase.getAllEntities(projectId);
        const filtered = all.filter(e => 
          e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
          !linkedEntities.some(le => le.id === e.id)
        );
        setSearchResults(filtered.slice(0, 5));
      } catch (err) { }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, projectId, linkedEntities]);

  const handleLinkEntity = async (entity: Entidad) => {
    try {
      await TimelineUseCase.linkEntity(eventId, entity.id);
      setSearchTerm('');
      setShowResults(false);
      await loadEventData();
      if (onUpdate) onUpdate();
    } catch (err) { }
  };

  const handleUnlinkEntity = async (entityId: number) => {
    try {
      await TimelineUseCase.unlinkEntity(eventId, entityId);
      await loadEventData();
      if (onUpdate) onUpdate();
    } catch (err) { }
  };

  const handleNotesUpdate = async (html: string) => {
    if (!event) return;
    try {
      await TimelineUseCase.updateEvent(event.id, { descripcion: html });
      if (onUpdate) onUpdate();
    } catch (err) { }
  };

  return {
    event,
    linkedEntities,
    loading,
    searchTerm, setSearchTerm,
    searchResults,
    showResults, setShowResults,
    handleLinkEntity,
    handleUnlinkEntity,
    handleNotesUpdate,
    loadEventData
  };
};

