import { useState, useEffect, useCallback } from 'react';
import { TrashUseCase, TrashItem } from '@application/useCases/TrashUseCase';
import { useLanguage } from '@context/LanguageContext';

/**
 * 🧠 useTrashManager
 * Logic for managing deleted items, restoration, and permanent purging.
 */
export const useTrashManager = (projectId: number | null) => {
  const { t } = useLanguage();
  const [items, setItems] = useState<TrashItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadItems = useCallback(async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const data = await TrashUseCase.getDeletedItems(projectId);
      setItems(data);
      setError(null);
    } catch (err) {
      console.error("Error loading trash items:", err);
      setError(t("trash.error_loading"));
    } finally {
      setLoading(false);
    }
  }, [projectId, t]);

  useEffect(() => {
    loadItems();
  }, [loadItems]);

  const handleRestore = useCallback(async (tipo: string, itemId: number) => {
    try {
      await TrashUseCase.restoreItem(tipo, itemId);
      await loadItems(); 
    } catch (err) {
      console.error("Error restoring item:", err);
    }
  }, [loadItems]);

  const handleDelete = useCallback(async (tipo: string, itemId: number) => {
    if (!confirm(t("trash.confirm_purge") || "¿Estás seguro de purgar este elemento?")) return;
    try {
      await TrashUseCase.purgeItem(tipo, itemId);
      await loadItems();
    } catch (err) {
      console.error("Error purging item:", err);
    }
  }, [loadItems, t]);

  return {
    items,
    loading,
    error,
    handleRestore,
    handleDelete,
    reload: loadItems
  };
};
