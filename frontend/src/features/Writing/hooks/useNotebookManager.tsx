import { useState, useEffect, useCallback, useRef } from "react";
import { Notebook } from "@domain/writing";
import { WorkspaceUseCase } from "@features/Workspaces";
import { getModuleCache, setModuleCache } from "@utils/moduleCache";

/**
 * ðŸ§  useNotebookManager
 * Logic for managing quick notes (notebooks) in the sidebar.
 */
export const useNotebookManager = (projectId: number | string | null) => {
  const [notebooks, setNotebooks] = useState<Notebook[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null);
  const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const dirtyRef = useRef<boolean>(false);

  const key = `notebooks_v2_${projectId || "global"}`;

  const flushNotebooks = useCallback(async () => {
    if (dirtyRef.current) {
      await WorkspaceUseCase.saveSetting(key, JSON.stringify(notebooks));
      dirtyRef.current = false;
    }
  }, [key, notebooks]);

  const loadNotebooks = useCallback(async () => {
    setIsLoading(true);
    try {
      const cached = getModuleCache<Notebook[]>(key);
      if (cached) {
        setNotebooks(cached);
      } else {
        const saved = await WorkspaceUseCase.getSetting(key);
        if (saved) {
          const parsed = JSON.parse(saved) as Notebook[];
          setNotebooks(parsed);
          setModuleCache(key, parsed);
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

  useEffect(() => {
    setModuleCache(key, notebooks);
    dirtyRef.current = true;
  }, [key, notebooks]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      flushNotebooks().catch(() => {
        // [LOG REMOVED]
      });
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      flushNotebooks().catch(() => {
        // [LOG REMOVED]
      });
    };
  }, [flushNotebooks]);

  const saveNotebooks = useCallback(
    async (newNotebooks: Notebook[]) => {
      setNotebooks(newNotebooks);
      setModuleCache(key, newNotebooks);
      dirtyRef.current = true;
    },
    [key],
  );

  const createNotebook = useCallback(
    (title?: string) => {
      const cleanTitle = title?.trim() || "";
      const notebookTitle = cleanTitle || "Nueva Nota";

      const newNotebook: Notebook = {
        id: Date.now().toString(),
        titulo: notebookTitle,
        contenido: "",
        updatedAt: new Date().toISOString(),
      };
      const updated = [newNotebook, ...notebooks];
      saveNotebooks(updated);
      setEditingTitleId(newNotebook.id.toString());
    },
    [notebooks, saveNotebooks],
  );

  const updateNotebook = useCallback(
    (id: string | number, field: keyof Notebook, value: string) => {
      const updated = notebooks.map((nb) =>
        nb.id === id
          ? { ...nb, [field]: value, updatedAt: new Date().toISOString() }
          : nb,
      );
      saveNotebooks(updated);

      if (activeNotebook && activeNotebook.id === id) {
        setActiveNotebook((prev) =>
          prev ? { ...prev, [field]: value } : null,
        );
      }
    },
    [notebooks, activeNotebook, saveNotebooks],
  );

  const deleteNotebook = useCallback(async () => {
    if (!confirmDeleteId) return;
    const updated = notebooks.filter((nb) => nb.id !== confirmDeleteId);
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
    deleteNotebook,
  };
};

