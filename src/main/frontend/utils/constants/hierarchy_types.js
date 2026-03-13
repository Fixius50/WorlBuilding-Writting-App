export const HIERARCHY_TYPES = {
    UNIVERSE: {
        id: 'UNIVERSE',
        label: 'Universo / Multiverso',
        description: 'Contenedor supremo de realidades.',
        icon: 'public', // Material Icon name
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
    // System Auto-Folders
    GEOGRAPHY: { id: 'GEOGRAPHY', label: 'Geografía', icon: 'map', color: 'text-green-300' },
    ENTITIES: { id: 'ENTITIES', label: 'Entidades', icon: 'groups', color: 'text-blue-300' },
    MAGIC: { id: 'MAGIC', label: 'Magia', icon: 'auto_fix_high', color: 'text-pink-300' },
    TIMELINE: { id: 'TIMELINE', label: 'Cronología', icon: 'history', color: 'text-orange-300' },
    FACTIONS: { id: 'FACTIONS', label: 'Facciones', icon: 'security', color: 'text-red-300' },
    ITEMS: { id: 'ITEMS', label: 'Objetos', icon: 'inventory_2', color: 'text-gray-300' },

    // Default
    FOLDER: { id: 'FOLDER', label: 'Carpeta', icon: 'folder', color: 'text-gray-400' }
};

export const getHierarchyType = (typeId) => {
    return HIERARCHY_TYPES[typeId] || HIERARCHY_TYPES.FOLDER;
};
