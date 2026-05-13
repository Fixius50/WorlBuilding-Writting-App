import { useCallback } from 'react';
import { Entidad } from '@domain/models/database';

/**
 * 🧠 useDimensionImportModal
 * Hook to handle dimension import logic, providing a bridge between the picker and the timeline manager.
 */
export const useDimensionImportModal = (
  onImport: (entity: Entidad) => void,
  onClose: () => void
) => {
  const handleImportSelect = useCallback((dim: Entidad) => {
    onImport(dim);
    onClose();
  }, [onImport, onClose]);

  return {
    handleImportSelect
  };
};
