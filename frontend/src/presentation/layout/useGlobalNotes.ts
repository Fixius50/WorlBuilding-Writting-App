import { useState, useEffect } from 'react';
import { WorkspaceUseCase } from '@application/useCases/WorkspaceUseCase';

export interface Note {
  id: number;
  title: string;
  content: string;
}

export interface UseGlobalNotesProps {
  projectName: string;
  storageKey?: string;
}

export const useGlobalNotes = ({ projectName, storageKey }: UseGlobalNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

  const getStorageKey = (): string => {
    return storageKey || `notes_v2_${projectName}`;
  };

  useEffect(() => {
    const loadNotes = async (): Promise<void> => {
      const key = getStorageKey();
      if (key) {
        const saved = await WorkspaceUseCase.getSetting(key);
        if (saved) {
          setNotes(JSON.parse(saved));
        } else if (!storageKey) {
          // Migration from old single string if exists (ONLY for global project notes)
          // Since we are moving to SQLite, we check if there's anything in localStorage to migrate once
          const oldNotes = localStorage.getItem(`notes_${projectName}`);
          if (oldNotes) {
            const initialNote = { id: Date.now(), title: 'Nota General', content: oldNotes };
            const newNotes = [initialNote];
            setNotes(newNotes);
            await WorkspaceUseCase.saveSetting(key, JSON.stringify(newNotes));
            localStorage.removeItem(`notes_${projectName}`); // Cleanup
          }
        }
      }
    };
    loadNotes();
  }, [projectName, storageKey]);

  const saveNotes = async (newNotes: Note[]): Promise<void> => {
    setNotes(newNotes);
    const key = getStorageKey();
    if (key) {
      await WorkspaceUseCase.saveSetting(key, JSON.stringify(newNotes));
    }
  };

  const addNote = (): void => {
    const newNote = {
      id: Date.now(),
      title: 'Nueva Nota',
      content: ''
    };
    saveNotes([...notes, newNote]);
    setEditingNoteId(newNote.id);
  };

  // Modal State
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

  const deleteNote = (id: number): void => {
    setConfirmDeleteId(id);
  };

  const confirmDeleteAction = (): void => {
    if (confirmDeleteId) {
      saveNotes(notes.filter((n: Note): boolean => n.id !== confirmDeleteId));
      setConfirmDeleteId(null);
    }
  };

  const updateNote = (id: number, field: keyof Note, value: string): void => {
    saveNotes(notes.map((n: Note): Note => n.id === id ? { ...n, [field]: value } : n));
  };

  const toggleFullscreen = (): void => {
    setIsFullscreen(!isFullscreen);
  };

  return {
    notes,
    isFullscreen,
    editingNoteId,
    confirmDeleteId,
    setConfirmDeleteId,
    addNote,
    deleteNote,
    confirmDeleteAction,
    updateNote,
    toggleFullscreen
  };
};
