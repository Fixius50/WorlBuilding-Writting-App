import { HierarchyTypeId, HIERARCHY_DEFINITIONS } from '@domain/hierarchy';
export { type HierarchyTypeId, HIERARCHY_DEFINITIONS };
import { getHierarchyVisuals } from '@components/ui/hierarchyVisuals';

/**
 * 🛠️ World Bible Local Types
 * Restaurando las rutas de importación originales para la UI.
 */

export interface HierarchyType {
  id: HierarchyTypeId;
  label: string;
  description?: string;
  icon: string;
  color: string;
  bgColor: string;
}

export const HIERARCHY_TYPES: Record<string, HierarchyType> = Object.keys(HIERARCHY_DEFINITIONS).reduce((acc, key) => {
  const typeId = key as HierarchyTypeId;
  acc[typeId] = {
    ...HIERARCHY_DEFINITIONS[typeId],
    ...getHierarchyVisuals(typeId)
  };
  return acc;
}, {} as Record<string, HierarchyType>);
