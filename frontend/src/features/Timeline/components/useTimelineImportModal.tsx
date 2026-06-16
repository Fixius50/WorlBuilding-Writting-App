import { useCallback } from "react";
import { Entidad } from "@domain/database";

/**
 * 🧠 useTimelineImportModal
 * Hook to handle dimension import logic, providing a bridge between the picker and the timeline manager.
 */
export const useTimelineImportModal = (
  onImport: (entity: Entidad) => void,
  onClose: () => void,
) => {
  const handleImportSelect = useCallback(
    (dim: Entidad) => {
      onImport(dim);
      onClose();
    },
    [onImport, onClose],
  );

  return {
    handleImportSelect,
  };
};
