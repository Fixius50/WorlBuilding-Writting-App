import { useState, useEffect, useCallback, useRef } from "react";
import { WorkspaceUseCase } from "@application/useCases/WorkspaceUseCase";
import { getModuleCache, setModuleCache } from "@utils/moduleCache";

export interface Note {
  id: number;
  title: string;
  content: string;
}

export interface UseGlobalNotesProps {
  projectName: string;
  storageKey?: string;
}

export const useGlobalNotes = ({
  projectName,
  storageKey,
}: UseGlobalNotesProps) => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const dirtyRef = useRef<boolean>(false);

  const getStorageKey = (): string => {
    return storageKey || `notes_v2_${projectName}`;
  };

  const flushNotes = useCallback(async (): Promise<void> => {
    const key = getStorageKey();
    if (key && dirtyRef.current) {
      await WorkspaceUseCase.saveSetting(key, JSON.stringify(notes));
      dirtyRef.current = false;
    }
  }, [notes, projectName, storageKey]);

  useEffect(() => {
    const loadNotes = async (): Promise<void> => {
      const key = getStorageKey();
      if (key) {
        const cachedNotes = getModuleCache<Note[]>(key);
        switch (!!cachedNotes) {
          case true:
            if (cachedNotes) {
              setNotes(cachedNotes);
            }
            break;
          default: {
            const saved = await WorkspaceUseCase.getSetting(key);
            if (saved) {
              const parsedNotes = JSON.parse(saved) as Note[];
              setNotes(parsedNotes);
              setModuleCache(key, parsedNotes);
            }
            break;
          }
        }
      }
    };
    loadNotes();
  }, [projectName, storageKey]);

  useEffect(() => {
    const key = getStorageKey();
    if (key) {
      setModuleCache(key, notes);
      dirtyRef.current = true;
    }
  }, [notes, projectName, storageKey]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      flushNotes().catch(() => {
        // [LOG REMOVED]
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      flushNotes().catch(() => {
        // [LOG REMOVED]
      });
    };
  }, [flushNotes]);

  const saveNotes = async (newNotes: Note[]): Promise<void> => {
    setNotes(newNotes);
    const key = getStorageKey();
    if (key) {
      setModuleCache(key, newNotes);
      dirtyRef.current = true;
    }
  };

  const addNote = (): void => {
    const newNote = {
      id: Date.now(),
      title: "Nueva Nota",
      content: "",
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
    saveNotes(
      notes.map(
        (n: Note): Note => (n.id === id ? { ...n, [field]: value } : n),
      ),
    );
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
    toggleFullscreen,
  };
};
