import { HierarchyTypeId, HIERARCHY_DEFINITIONS } from '@domain/hierarchy';
import { HIERARCHY_VISUALS } from '@presentation/utils/hierarchyVisuals';

/**
 * LEGACY / INFRASTRUCTURE BRIDGE
 * Este archivo actúa como un puente para mantener la compatibilidad con el código existente
 * mientras se realiza la transición a la arquitectura DDD separada.
 */

export interface HierarchyType {
    id: string;
    label: string;
    description?: string;
    icon: string;
    color: string;
    bgColor: string;
}

// Reconstruimos el objeto HIERARCHY_TYPES combinando Dominio y Presentación
export const HIERARCHY_TYPES: Record<string, HierarchyType> = Object.keys(HIERARCHY_DEFINITIONS).reduce((acc, key) => {
    const typeId = key as HierarchyTypeId;
    acc[typeId] = {
        ...HIERARCHY_DEFINITIONS[typeId],
        ...HIERARCHY_VISUALS[typeId]
    };
    return acc;
}, {} as Record<string, HierarchyType>);

export const getHierarchyType = (typeId: string): HierarchyType => {
    const normalizedId = (typeId || 'folder').toLowerCase();
    return HIERARCHY_TYPES[normalizedId] || HIERARCHY_TYPES.folder;
};
