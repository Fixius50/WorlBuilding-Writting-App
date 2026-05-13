import { useState, useCallback } from 'react';
import { Notebook } from '@domain/models/writing';

/**
 * 🧠 useNotebookGrid
 * Logic for managing notebook modals (create, edit, delete).
 */
export const useNotebookGrid = (
  onCreateNotebook: (title: string) => void,
  onDeleteNotebook: (id: string | number) => void,
  onUpdateNotebook: (id: string | number, title: string, description?: string) => void
) => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [notebookToDelete, setNotebookToDelete] = useState<Notebook | null>(null);
  const [notebookToEdit, setNotebookToEdit] = useState<Notebook | null>(null);

  const handleCreateSubmit = useCallback((title: string) => {
    onCreateNotebook(title);
    setIsCreateModalOpen(false);
  }, [onCreateNotebook]);

  const handleDeleteConfirm = useCallback(() => {
    if (notebookToDelete) {
      onDeleteNotebook(notebookToDelete.id);
      setNotebookToDelete(null);
    }
  }, [notebookToDelete, onDeleteNotebook]);

  const handleEditSubmit = useCallback((title: string) => {
    if (notebookToEdit) {
      onUpdateNotebook(notebookToEdit.id, title, notebookToEdit.descripcion);
      setNotebookToEdit(null);
    }
  }, [notebookToEdit, onUpdateNotebook]);

  return {
    isCreateModalOpen, setIsCreateModalOpen,
    notebookToDelete, setNotebookToDelete,
    notebookToEdit, setNotebookToEdit,
    handleCreateSubmit,
    handleDeleteConfirm,
    handleEditSubmit
  };
};
