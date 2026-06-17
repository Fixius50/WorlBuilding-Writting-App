import { useState, useEffect, useCallback } from 'react';
import { CalendarUseCase } from '@features/Calendars';
import { Calendario } from '@domain/database';

/**
 * ðŸ§  useCalendarManager
 * Logic for managing custom calendars, months, and weekdays.
 */
export const useCalendarManager = (projectId: number) => {
  const [calendars, setCalendars] = useState<Calendario[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingCalendar, setEditingCalendar] = useState<Partial<Calendario> | null>(null);

  const loadCalendars = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const data = await CalendarUseCase.getByProject(projectId);
      setCalendars(data);
    } catch (err) {
      console.error("Error loading calendars:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadCalendars();
  }, [loadCalendars]);

  const handleCreate = useCallback(() => {
    setEditingCalendar({
      nombre: 'Nuevo Calendario',
      meses_json: JSON.stringify([{ nombre: 'Mes 1', dias: 30 }]),
      dias_semana_json: JSON.stringify(['DÃ­a 1', 'DÃ­a 2', 'DÃ­a 3']),
      fecha_inicio_json: JSON.stringify({ anio: 1, mes: 1, dia: 1 })
    });
  }, []);

  const handleSave = useCallback(async () => {
    if (!editingCalendar || !projectId) return;

    try {
      if (editingCalendar.id) {
          await CalendarUseCase.update(editingCalendar.id, editingCalendar);
      } else {
          await CalendarUseCase.create({
              nombre: editingCalendar.nombre!,
              project_id: projectId,
              meses_json: editingCalendar.meses_json!,
              dias_semana_json: editingCalendar.dias_semana_json!,
              fecha_inicio_json: editingCalendar.fecha_inicio_json!
          });
      }
      setEditingCalendar(null);
      await loadCalendars();
    } catch (err) {
      console.error("Error saving calendar:", err);
    }
  }, [editingCalendar, projectId, loadCalendars]);

  const updateEditingCalendar = useCallback((updates: Partial<Calendario>) => {
    setEditingCalendar(prev => prev ? { ...prev, ...updates } : null);
  }, []);

  const handleAddMonth = useCallback(() => {
    if (!editingCalendar) return;
    const months = JSON.parse(editingCalendar.meses_json || '[]');
    months.push({ nombre: `Mes ${months.length + 1}`, dias: 30 });
    updateEditingCalendar({ meses_json: JSON.stringify(months) });
  }, [editingCalendar, updateEditingCalendar]);

  const handleRemoveMonth = useCallback((idx: number) => {
    if (!editingCalendar) return;
    const months = JSON.parse(editingCalendar.meses_json || '[]');
    months.splice(idx, 1);
    updateEditingCalendar({ meses_json: JSON.stringify(months) });
  }, [editingCalendar, updateEditingCalendar]);

  const handleUpdateMonth = useCallback((idx: number, updates: { nombre?: string; dias?: number }) => {
    if (!editingCalendar) return;
    const months = JSON.parse(editingCalendar.meses_json || '[]');
    months[idx] = { ...months[idx], ...updates };
    updateEditingCalendar({ meses_json: JSON.stringify(months) });
  }, [editingCalendar, updateEditingCalendar]);

  const handleAddDay = useCallback(() => {
    if (!editingCalendar) return;
    const days = JSON.parse(editingCalendar.dias_semana_json || '[]');
    days.push(`DÃ­a ${days.length + 1}`);
    updateEditingCalendar({ dias_semana_json: JSON.stringify(days) });
  }, [editingCalendar, updateEditingCalendar]);

  const handleRemoveDay = useCallback((idx: number) => {
    if (!editingCalendar) return;
    const days = JSON.parse(editingCalendar.dias_semana_json || '[]');
    days.splice(idx, 1);
    updateEditingCalendar({ dias_semana_json: JSON.stringify(days) });
  }, [editingCalendar, updateEditingCalendar]);

  const handleUpdateDay = useCallback((idx: number, name: string) => {
    if (!editingCalendar) return;
    const days = JSON.parse(editingCalendar.dias_semana_json || '[]');
    days[idx] = name;
    updateEditingCalendar({ dias_semana_json: JSON.stringify(days) });
  }, [editingCalendar, updateEditingCalendar]);

  return {
    calendars,
    loading,
    editingCalendar,
    setEditingCalendar,
    handleCreate,
    handleSave,
    handleAddMonth,
    handleRemoveMonth,
    handleUpdateMonth,
    handleAddDay,
    handleRemoveDay,
    handleUpdateDay,
    updateEditingCalendar
  };
};

