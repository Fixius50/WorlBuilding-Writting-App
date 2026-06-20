import { useState, useEffect, useCallback } from "react";
import { Cuaderno } from "@domain/database";
import { WritingUseCase } from "@features/Writing";

interface NotebookMetadataForm {
  status: "idea" | "draft" | "review" | "done";
  priority: "low" | "medium" | "high";
  audience: string;
  summary: string;
}

const DEFAULT_METADATA: NotebookMetadataForm = {
  status: "idea",
  priority: "medium",
  audience: "",
  summary: "",
};

const parseNotebookMetadata = (
  raw: string | null | undefined,
): NotebookMetadataForm => {
  try {
    const parsed = raw
      ? (JSON.parse(raw) as Partial<NotebookMetadataForm>)
      : {};
    return {
      status: parsed.status || "idea",
      priority: parsed.priority || "medium",
      audience: parsed.audience || "",
      summary: parsed.summary || "",
    };
  } catch {
    return { ...DEFAULT_METADATA };
  }
};

/**
 * Hook useWritingHub
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
  const [metadata, setMetadata] =
    useState<NotebookMetadataForm>(DEFAULT_METADATA);

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
    setMetadata({ ...DEFAULT_METADATA });
    setSubmitError(null);
    setNotebookToEdit(null);
    setIsCreating(true);
  }, []);

  const openEditModal = useCallback((nb: Cuaderno) => {
    setNotebookToEdit(nb);
    setTitle(nb.titulo);
    setGenre(nb.genero || "");
    setMetadata(parseNotebookMetadata(nb.metadata_json));
    setSubmitError(null);
    setIsCreating(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsCreating(false);
    setNotebookToEdit(null);
    setTitle("");
    setGenre("");
    setMetadata({ ...DEFAULT_METADATA });
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
        await WritingUseCase.updateNotebook(
          notebookToEdit.id,
          title,
          genre,
          metadata,
        );
        setNotebooks((prev) =>
          prev.map((n) =>
            n.id === notebookToEdit.id
              ? {
                  ...n,
                  titulo: title.trim(),
                  genero: genre,
                  metadata_json: JSON.stringify(metadata),
                }
              : n,
          ),
        );
      } else {
        const nuevo = await WritingUseCase.createNotebook(
          projectId,
          title,
          genre,
          metadata,
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
  }, [projectId, title, genre, metadata, notebookToEdit, closeModal]);

  const handleDelete = useCallback(async (id: number) => {
    if (!window.confirm("¿Eliminar este archivador?")) return;
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
    metadata,
    setMetadata,
    openCreateModal,
    openEditModal,
    closeModal,
    handleSubmit,
    handleDelete,
  };
};
