import { useCallback, useMemo } from 'react';
import { Plantilla } from '@domain/database';

/**
 * 🧠 useAttributeField
 * Hook to handle attribute field logic, including metadata parsing, layout calculation, and option management.
 */
export const useAttributeField = (
  attribute: Plantilla | { plantilla: Plantilla },
  value: string | null,
  onChange: (value: string) => void
) => {
  const plantilla = useMemo(() => {
    return 'plantilla' in attribute ? attribute.plantilla : attribute;
  }, [attribute]);

  const metadata = useMemo(() => {
    try {
      return typeof plantilla.metadata === 'string'
        ? JSON.parse(plantilla.metadata || '{}')
        : (plantilla.metadata || {});
    } catch (e) {
      return {};
    }
  }, [plantilla.metadata]);

  const multiSelectValues = useMemo(() => {
    try {
      const parsed = value ? JSON.parse(value) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }, [value]);

  const toggleMultiSelectOption = useCallback((opt: string) => {
    const newValues = multiSelectValues.includes(opt)
      ? multiSelectValues.filter(v => v !== opt)
      : [...multiSelectValues, opt];
    onChange(JSON.stringify(newValues));
  }, [multiSelectValues, onChange]);

  const layoutClass = useMemo(() => {
    switch (plantilla.tipo) {
      case 'text':
      case 'table':
      case 'image':
        return 'attr-full';
      default:
        return 'attr-compact';
    }
  }, [plantilla.tipo]);

  return {
    plantilla,
    metadata,
    multiSelectValues,
    toggleMultiSelectOption,
    layoutClass
  };
};
