import { useState, useEffect, useCallback, useMemo } from 'react';
import { timelineService } from '@repositories/timelineService';
import { folderService } from '@repositories/folderService';
import { entityService } from '@repositories/entityService';
import { Evento, Carpeta, Entidad } from '@domain/models/database';
import { useLanguage } from '@context/LanguageContext';

export const useTimelineManager = (folderId: string | undefined) => {
  const { t } = useLanguage();
  
  // Data States
  const [folder, setFolder] = useState<Carpeta | null>(null);
  const [lines, setLines] = useState<Entidad[]>([]);
  const [events, setEvents] = useState<Evento[]>([]);
  const [linkedEntities, setLinkedEntities] = useState<Record<number, Entidad[]>>({});
  const [projectEntities, setProjectEntities] = useState<Entidad[]>([]);
  const [availableDimensions, setAvailableDimensions] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);

  const getYear = (dateStr: string | null): number | null => {
    if (!dateStr || dateStr === '?') return null;
    const match = dateStr.match(/-?\d+/);
    return match ? parseInt(match[0]) : null;
  };

  const loadData = useCallback(async () => {
    if (!folderId) return;
    setLoading(true);
    try {
      const id = Number(folderId);
      const fInfo = await folderService.getById(id);

      if (fInfo) {
        setFolder(fInfo);
        const [dbLines, allEvents, pEntities, allDimensions] = await Promise.all([
          timelineService.getLinesByFolder(id),
          timelineService.getByTimeline(id),
          entityService.getAllByProject(fInfo.project_id),
          entityService.getAllByProjectAndType(fInfo.project_id, 'DIMENSION')
        ]);

        setLines(dbLines);
        setEvents(allEvents || []);
        setProjectEntities(pEntities || []);
        
        const currentLineIds = new Set(dbLines.map(l => l.id));
        setAvailableDimensions(allDimensions.filter(d => !currentLineIds.has(d.id)));

        const entityMap: Record<number, Entidad[]> = {};
        if (allEvents) {
          await Promise.all(allEvents.map(async (ev) => {
            entityMap[ev.id] = await timelineService.getLinkedEntities(ev.id);
          }));
        }
        setLinkedEntities(entityMap);
      }
    } catch (err) {
      // [LOG REMOVED]
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const timelineBounds = useMemo(() => {
    const years = events.map(ev => getYear(ev.fecha_simulada)).filter(y => y !== null) as number[];
    if (years.length === 0) return { min: 0, max: 100, range: 100 };
    const min = Math.min(...years);
    const max = Math.max(...years);
    const padding = Math.max((max - min) * 0.1, 10);
    return { min: min - padding, max: max + padding, range: (max - min) + (padding * 2) };
  }, [events]);

  const calculateX = useCallback((dateStr: string | null) => {
    const year = getYear(dateStr);
    if (year === null) return 8;
    const rawPercent = ((year - timelineBounds.min) / timelineBounds.range) * 100;
    return 8 + (rawPercent * 0.84);
  }, [timelineBounds]);

  const handleAddEvent = async (lineId: number | null) => {
    if (!folder || !folderId) return;
    try {
      const newEvent = await timelineService.create({
        titulo: t('timeline.milestone'),
        descripcion: null,
        fecha_simulada: '0',
        project_id: folder.project_id,
        timeline_id: Number(folderId),
        linea_id: lineId,
        orden: 0
      });
      await loadData();
      return newEvent;
    } catch (err) {
      // [LOG REMOVED]
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      await timelineService.delete(id);
      await loadData();
    } catch (err) {
      // [LOG REMOVED]
    }
  };

  const handleSaveEvent = async (id: number, data: { titulo: string, descripcion: string, fecha_simulada: string }) => {
    try {
      await timelineService.update(id, data);
      await loadData();
    } catch (err) {
      // [LOG REMOVED]
    }
  };

  const handleToggleLinkEntity = async (eventId: number, entityId: number) => {
    try {
      const alreadyLinked = linkedEntities[eventId]?.some(e => e.id === entityId);
      if (alreadyLinked) {
        await timelineService.unlinkEntity(eventId, entityId);
      } else {
        await timelineService.linkEntity(eventId, entityId);
      }
      await loadData();
    } catch (err) {
      // [LOG REMOVED]
    }
  };

  const handleImportDimension = async (entityId: number) => {
    if (!folderId) return;
    try {
      await entityService.move(entityId, Number(folderId));
      await loadData();
    } catch (err) {
      // [LOG REMOVED]
    }
  };

  const handleRemoveDimension = async (entityId: number) => {
    await entityService.move(entityId, null);
    await loadData();
  };

  const involvedEntities = useMemo(() => {
    const ids = new Set<number>();
    lines.forEach(l => ids.add(l.id));
    Object.values(linkedEntities).forEach(ents => ents.forEach(e => ids.add(e.id)));
    return projectEntities.filter(e => ids.has(e.id) && !lines.some(l => l.id === e.id));
  }, [lines, linkedEntities, projectEntities]);

  return {
    folder, lines, events, linkedEntities, projectEntities, availableDimensions, loading,
    calculateX, getYear,
    handleAddEvent, handleDeleteEvent, handleSaveEvent,
    handleToggleLinkEntity, handleImportDimension, handleRemoveDimension,
    involvedEntities, loadData
  };
};
