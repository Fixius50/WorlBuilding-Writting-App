import { useState, useEffect, useCallback } from 'react';
import { Notebook } from '@domain/models/writing';
import { WorkspaceUseCase } from '@application/useCases/WorkspaceUseCase';

/**
 * 🧠 useNotebookManager
 * Logic for managing quick notes (notebooks) in the sidebar.
 */
export const useNotebookManager = (projectId: number | string | null) => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const key = `notebooks_v2_${projectId || 'global'}`;

  const loadNotebooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const saved = await WorkspaceUseCase.getSetting(key);
      if (saved) {
        setNotebooks(JSON.parse(saved));
      } else {
        const old = localStorage.getItem(key);
        if (old) {
          const parsed = JSON.parse(old);
          setNotebooks(parsed);
          await WorkspaceUseCase.saveSetting(key, old);
          localStorage.removeItem(key);
        }
      }
    } catch (err) {
      console.error("Error loading quick notes:", err);
    } finally {
      setIsLoading(false);
    }
  }, [key]);

  useEffect(() => {
    loadNotebooks();
  }, [loadNotebooks]);

  const saveNotebooks = useCallback(async (newNotebooks: Notebook[]) => {
    setNotebooks(newNotebooks);
    await WorkspaceUseCase.saveSetting(key, JSON.stringify(newNotebooks));
  }, [key]);

  const createNotebook = useCallback(() => {
    const newNotebook: Notebook = {
      id: Date.now().toString(),
      titulo: 'Nueva Nota',
      contenido: '',
      updatedAt: new Date().toISOString()
    };
    const updated = [newNotebook, ...notebooks];
    saveNotebooks(updated);
    setEditingTitleId(newNotebook.id.toString());
  }, [notebooks, saveNotebooks]);

  const updateNotebook = useCallback((id: string | number, field: keyof Notebook, value: string) => {
    const updated = notebooks.map(nb =>
      nb.id === id ? { ...nb, [field]: value, updatedAt: new Date().toISOString() } : nb
    );
    saveNotebooks(updated);

    if (activeNotebook && activeNotebook.id === id) {
      setActiveNotebook(prev => prev ? { ...prev, [field]: value } : null);
    }
  }, [notebooks, activeNotebook, saveNotebooks]);

  const deleteNotebook = useCallback(async () => {
    if (!confirmDeleteId) return;
    const updated = notebooks.filter(nb => nb.id !== confirmDeleteId);
    await saveNotebooks(updated);
    
    if (activeNotebook && activeNotebook.id === confirmDeleteId) {
      setActiveNotebook(null);
    }
    setConfirmDeleteId(null);
  }, [confirmDeleteId, notebooks, activeNotebook, saveNotebooks]);

  return {
    notebooks,
    isLoading,
    activeNotebook,
    setActiveNotebook,
    editingTitleId,
    setEditingTitleId,
    confirmDeleteId,
    setConfirmDeleteId,
    createNotebook,
    updateNotebook,
    deleteNotebook
  };
};
