/**
 * DOMAIN LAYER
 * Definiciones puras de la jerarquía del mundo.
 * Este archivo solo contiene lógica de negocio y tipos, sin dependencias de UI.
 */

export type HierarchyTypeId = 
  | 'UNIVERSE' 
  | 'PLANET' 
  | 'GEOGRAPHY' 
  | 'ENTITIES' 
  | 'MAGIC' 
  | 'FACTIONS' 
  | 'ITEMS' 
  | 'FOLDER' 
  | 'DIMENSION'
  | 'MAP'
  | 'TIMELINE'
  | 'PERSONAJE'
  | 'LUGAR'
  | 'ORGANIZACION'
  | 'OBJETO'
  | 'EVENTO'
  | 'CONLANG';

export interface HierarchyTypeDefinition {
  id: HierarchyTypeId;
  label: string;
  description?: string;
}

export const HIERARCHY_DEFINITIONS: Record<HierarchyTypeId, HierarchyTypeDefinition> = {
  UNIVERSE: {
    id: 'UNIVERSE',
    label: 'Universo / Proyecto',
    description: 'El contenedor raíz de toda la creación.',
  },
  PLANET: {
    id: 'PLANET',
    label: 'Planeta / Mundo',
    description: 'Cuerpo celeste o plano de existencia principal.',
  },
  GEOGRAPHY: { 
    id: 'GEOGRAPHY', 
    label: 'Geografía', 
    description: 'Accidentes geográficos, regiones y mapas.' 
  },
  ENTITIES: { 
    id: 'ENTITIES', 
    label: 'Entidades', 
    description: 'Personajes, razas y criaturas.' 
  },
  MAGIC: { 
    id: 'MAGIC', 
    label: 'Magia', 
    description: 'Sistemas de energía, hechizos y lo arcano.' 
  },
  FACTIONS: { 
    id: 'FACTIONS', 
    label: 'Facciones', 
    description: 'Organizaciones, reinos y religiones.' 
  },
  ITEMS: { 
    id: 'ITEMS', 
    label: 'Objetos', 
    description: 'Reliquias, armas y objetos de valor.' 
  },
  FOLDER: { 
    id: 'FOLDER', 
    label: 'Carpeta', 
    description: 'Contenedor genérico para organización.' 
  },
  DIMENSION: { 
    id: 'DIMENSION', 
    label: 'Dimensión / Plano Cósmico', 
    description: 'Realidades paralelas o planos superiores.' 
  },
  MAP: {
    id: 'MAP',
    label: 'Mapa Interactivo',
    description: 'Cartografía digital y puntos de interés.'
  },
  TIMELINE: {
    id: 'TIMELINE',
    label: 'Línea de Tiempo',
    description: 'Cronología de eventos y eras.'
  },
  PERSONAJE: {
    id: 'PERSONAJE',
    label: 'Personaje',
    description: 'Individuos con historia y atributos.'
  },
  LUGAR: {
    id: 'LUGAR',
    label: 'Lugar / Ubicación',
    description: 'Puntos específicos dentro de la geografía.'
  },
  ORGANIZACION: {
    id: 'ORGANIZACION',
    label: 'Facción / Organización',
    description: 'Grupos, reinos o instituciones.'
  },
  OBJETO: {
    id: 'OBJETO',
    label: 'Objeto / Reliquia',
    description: 'Artefactos y objetos de importancia.'
  },
  EVENTO: {
    id: 'EVENTO',
    label: 'Evento Histórico',
    description: 'Hitos importantes en la cronología.'
  },
  CONLANG: {
    id: 'CONLANG',
    label: 'Lengua Construida',
    description: 'Sistemas lingüísticos y glifos.'
  }
};
