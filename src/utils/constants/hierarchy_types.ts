export interface HierarchyType {
    id: string;
    label: string;
    description?: string;
    icon: string;
    color: string;
    bgColor?: string;
}

export const HIERARCHY_TYPES: Record<string, HierarchyType> = {
    UNIVERSE: {
        id: 'UNIVERSE',
        label: 'Universo / Multiverso',
        description: 'Contenedor supremo de realidades.',
        icon: 'public',
        color: 'text-purple-400',
        bgColor: 'bg-purple-900/20'
    },
    GALAXY: {
        id: 'GALAXY',
        label: 'Galaxia',
        description: 'Agrupación masiva de sistemas estelares.',
        icon: 'auto_awesome',
        color: 'text-indigo-400',
        bgColor: 'bg-indigo-900/20'
    },
    SYSTEM: {
        id: 'SYSTEM',
        label: 'Sistema Solar',
        description: 'Estrella central y sus cuerpos orbitales.',
        icon: 'wb_sunny',
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-900/20'
    },
    PLANET: {
        id: 'PLANET',
        label: 'Planeta / Mundo',
        description: 'Cuerpo celeste o plano de existencia principal.',
        icon: 'public',
        color: 'text-emerald-400',
        bgColor: 'bg-emerald-900/20'
    },
    GEOGRAPHY: { id: 'GEOGRAPHY', label: 'Geografía', icon: 'map', color: 'text-green-300', bgColor: 'bg-green-900/20' },
    ENTITIES: { id: 'ENTITIES', label: 'Entidades', icon: 'groups', color: 'text-blue-300', bgColor: 'bg-blue-900/20' },
    MAGIC: { id: 'MAGIC', label: 'Magia', icon: 'auto_fix_high', color: 'text-pink-300', bgColor: 'bg-pink-900/20' },
    TIMELINE: { id: 'TIMELINE', label: 'Cronología', icon: 'history', color: 'text-orange-300', bgColor: 'bg-orange-900/20' },
    FACTIONS: { id: 'FACTIONS', label: 'Facciones', icon: 'security', color: 'text-red-300', bgColor: 'bg-red-900/20' },
    ITEMS: { id: 'ITEMS', label: 'Objetos', icon: 'inventory_2', color: 'text-gray-300', bgColor: 'bg-gray-900/20' },
    FOLDER: { id: 'FOLDER', label: 'Carpeta', icon: 'folder', color: 'text-gray-400', bgColor: 'bg-gray-900/10' }
};

export const getHierarchyType = (typeId: string): HierarchyType => {
    return HIERARCHY_TYPES[typeId] || HIERARCHY_TYPES.FOLDER;
};
