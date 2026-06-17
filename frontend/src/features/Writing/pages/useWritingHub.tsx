import { useState, useEffect, useCallback } from "react";
import { Cuaderno } from "@domain/database";
import { WritingUseCase } from "@features/Writing/application/WritingUseCase";

/**
 * ðŸ§  useWritingHub
 * Logic for managing the library of notebooks, including creation, editing, and searching.
 */
export const useWritingHub = (
  projectId: number,
  setRightPanelTab?: (tab: string) => void,
) => {
  const [notebooks, setNotebooks] = useState<Cuaderno[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [notebookToEdit, setNotebookToEdit] = useState<Cuaderno | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("");

  const loadNotebooks = useCallback(async () => {
    try {
      setLoading(true);
      const data = await WritingUseCase.getNotebooks(projectId);
      setNotebooks(data || []);
    } catch (err) {
      console.error("Error loading notebooks:", err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (setRightPanelTab) setRightPanelTab("NOTEBOOKS");
    loadNotebooks();
  }, [setRightPanelTab, loadNotebooks]);

  const openCreateModal = useCallback(() => {
    setTitle("");
    setGenre("");
    setSubmitError(null);
    setNotebookToEdit(null);
    setIsCreating(true);
  }, []);

  const openEditModal = useCallback((nb: Cuaderno) => {
    setNotebookToEdit(nb);
    setTitle(nb.titulo);
    setGenre(nb.genero || "");
    setSubmitError(null);
    setIsCreating(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsCreating(false);
    setNotebookToEdit(null);
    setTitle("");
    setGenre("");
    setSubmitError(null);
    setSaving(false);
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!title.trim()) {
      setSubmitError("Debes escribir un nombre para guardar el cuaderno.");
      return;
    }

    setSaving(true);
    try {
      if (notebookToEdit) {
        await WritingUseCase.updateNotebook(notebookToEdit.id, title, genre);
        setNotebooks((prev) =>
          prev.map((n) =>
            n.id === notebookToEdit.id
              ? { ...n, titulo: title.trim(), genero: genre }
              : n,
          ),
        );
      } else {
        const nuevo = await WritingUseCase.createNotebook(
          projectId,
          title,
          genre,
        );
        setNotebooks((prev) => [nuevo, ...prev]);
      }
      closeModal();
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Error al guardar. Revisa la consola.";
      setSubmitError(errorMessage);
    } finally {
      setSaving(false);
    }
  }, [projectId, title, genre, notebookToEdit, closeModal]);

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm("Â¿Eliminar este archivador?")) return;
    try {
      await WritingUseCase.deleteNotebook(id);
      setNotebooks((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Error deleting notebook:", err);
    }
  }, []);

  const filteredNotebooks = notebooks.filter(
    (nb) =>
      nb.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (nb.genero || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  return {
    notebooks: filteredNotebooks,
    loading,
    isCreating,
    notebookToEdit,
    searchTerm,
    setSearchTerm,
    submitError,
    saving,
    title,
    setTitle,
    genre,
    setGenre,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  };
};

