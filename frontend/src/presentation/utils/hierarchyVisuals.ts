import { HierarchyTypeId } from '@domain/models/hierarchy';

/**
 * PRESENTATION LAYER (Atomic Design Integration)
 * Mapeo de tipos de dominio a elementos visuales (iconos y colores).
 * Aquí es donde reside la dependencia de Tailwind CSS y Material Symbols.
 */

export interface HierarchyVisuals {
  icon: string;
  color: string;
  bgColor: string;
}

export const HIERARCHY_VISUALS: Record<HierarchyTypeId, HierarchyVisuals> = {
  universe: { 
    icon: 'auto_awesome', 
    color: 'text-primary', 
    bgColor: 'bg-primary/10' 
  },
  planet: { 
    icon: 'public', 
    color: 'text-emerald-400', 
    bgColor: 'bg-emerald-900/20' 
  },
  geography: { 
    icon: 'map', 
    color: 'text-green-300', 
    bgColor: 'bg-green-900/20' 
  },
  entities: { 
    icon: 'groups', 
    color: 'text-blue-300', 
    bgColor: 'bg-blue-900/20' 
  },
  magic: { 
    icon: 'auto_fix_high', 
    color: 'text-pink-300', 
    bgColor: 'bg-pink-900/20' 
  },
  factions: { 
    icon: 'security', 
    color: 'text-red-300', 
    bgColor: 'bg-red-900/20' 
  },
  items: { 
    icon: 'inventory_2', 
    color: 'text-gray-300', 
    bgColor: 'bg-gray-900/20' 
  },
  folder: { 
    icon: 'folder', 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-900/10' 
  },
  dimension: { 
    icon: 'lan', 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-900/20' 
  },
  map: { 
    icon: 'map', 
    color: 'text-green-400', 
    bgColor: 'bg-green-900/20' 
  },
  timeline: { 
    icon: 'timeline', 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-900/20' 
  },
  personaje: { 
    icon: 'person', 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-900/20' 
  },
  lugar: { 
    icon: 'location_on', 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-900/20' 
  },
  organizacion: { 
    icon: 'diversity_3', 
    color: 'text-red-400', 
    bgColor: 'bg-red-900/20' 
  },
  objeto: { 
    icon: 'diamond', 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-900/20' 
  },
  evento: { 
    icon: 'history_edu', 
    color: 'text-teal-400', 
    bgColor: 'bg-teal-900/20' 
  },
  conlang: { 
    icon: 'translate', 
    color: 'text-indigo-400', 
    bgColor: 'bg-indigo-900/20' 
  },
  entidad: { 
    icon: 'token', 
    color: 'text-primary', 
    bgColor: 'bg-primary/10' 
  }
};

/**
 * Helper para obtener la configuración visual de un tipo de forma segura.
 */
export const getHierarchyVisuals = (typeId: string): HierarchyVisuals => {
  const normalizedId = (typeId || 'folder').toLowerCase() as HierarchyTypeId;
  return HIERARCHY_VISUALS[normalizedId] || HIERARCHY_VISUALS.folder;
};
