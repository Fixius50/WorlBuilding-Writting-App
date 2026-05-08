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
  UNIVERSE: { 
    icon: 'auto_awesome', 
    color: 'text-primary', 
    bgColor: 'bg-primary/10' 
  },
  PLANET: { 
    icon: 'public', 
    color: 'text-emerald-400', 
    bgColor: 'bg-emerald-900/20' 
  },
  GEOGRAPHY: { 
    icon: 'map', 
    color: 'text-green-300', 
    bgColor: 'bg-green-900/20' 
  },
  ENTITIES: { 
    icon: 'groups', 
    color: 'text-blue-300', 
    bgColor: 'bg-blue-900/20' 
  },
  MAGIC: { 
    icon: 'auto_fix_high', 
    color: 'text-pink-300', 
    bgColor: 'bg-pink-900/20' 
  },
  FACTIONS: { 
    icon: 'security', 
    color: 'text-red-300', 
    bgColor: 'bg-red-900/20' 
  },
  ITEMS: { 
    icon: 'inventory_2', 
    color: 'text-gray-300', 
    bgColor: 'bg-gray-900/20' 
  },
  FOLDER: { 
    icon: 'folder', 
    color: 'text-gray-400', 
    bgColor: 'bg-gray-900/10' 
  },
  DIMENSION: { 
    icon: 'lan', 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-900/20' 
  },
  MAP: { 
    icon: 'map', 
    color: 'text-green-400', 
    bgColor: 'bg-green-900/20' 
  },
  TIMELINE: { 
    icon: 'timeline', 
    color: 'text-purple-400', 
    bgColor: 'bg-purple-900/20' 
  },
  PERSONAJE: { 
    icon: 'person', 
    color: 'text-blue-400', 
    bgColor: 'bg-blue-900/20' 
  },
  LUGAR: { 
    icon: 'location_on', 
    color: 'text-orange-400', 
    bgColor: 'bg-orange-900/20' 
  },
  ORGANIZACION: { 
    icon: 'diversity_3', 
    color: 'text-red-400', 
    bgColor: 'bg-red-900/20' 
  },
  OBJETO: { 
    icon: 'diamond', 
    color: 'text-yellow-400', 
    bgColor: 'bg-yellow-900/20' 
  },
  EVENTO: { 
    icon: 'history_edu', 
    color: 'text-teal-400', 
    bgColor: 'bg-teal-900/20' 
  },
  CONLANG: { 
    icon: 'translate', 
    color: 'text-indigo-400', 
    bgColor: 'bg-indigo-900/20' 
  },
  ENTIDAD: { 
    icon: 'token', 
    color: 'text-primary', 
    bgColor: 'bg-primary/10' 
  }
};

/**
 * Helper para obtener la configuración visual de un tipo de forma segura.
 */
export const getHierarchyVisuals = (typeId: string): HierarchyVisuals => {
  return HIERARCHY_VISUALS[typeId as HierarchyTypeId] || HIERARCHY_VISUALS.FOLDER;
};
