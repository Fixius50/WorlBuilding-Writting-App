import { useCallback } from 'react';

/**
 * 🧠 useEntityPickerModal
 * Hook to handle entity selection logic, managing the linking trigger and modal closure.
 */
export const useEntityPickerModal = (
  onToggleLink: (entityId: number) => void,
  onClose: () => void
) => {
  const handleToggleSelect = useCallback((entityId: number) => {
    onToggleLink(entityId);
    onClose();
  }, [onToggleLink, onClose]);

  return {
    handleToggleSelect
  };
};
