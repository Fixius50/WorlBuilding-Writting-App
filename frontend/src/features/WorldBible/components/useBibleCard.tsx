import { useMemo } from 'react';
import { getHierarchyVisuals } from '@presentation/utils/hierarchyVisuals';

interface BibleCardItem {
  id: number | string;
  nombre: string;
  tipo?: string;
  iconUrl?: string;
  itemCount?: number;
}

/**
 * 🧠 useBibleCard
 * Logic for the Bible node card, including visual archetype resolution.
 */
export const useBibleCard = (item: BibleCardItem, type: 'entity' | 'folder') => {
  const isFolder = type === 'folder';
  
  const visuals = useMemo(() => {
    return getHierarchyVisuals(item.tipo || (isFolder ? 'FOLDER' : 'UNIVERSE'));
  }, [item.tipo, isFolder]);

  const label = useMemo(() => {
    return isFolder 
      ? (item.tipo === 'TIMELINE' ? 'Dimensión' : 'Carpeta') 
      : (item.tipo || 'Entidad');
  }, [isFolder, item.tipo]);

  return {
    isFolder,
    visuals,
    label
  };
};
