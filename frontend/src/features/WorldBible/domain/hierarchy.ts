/**
 * DOMAIN LAYER
 * Definiciones puras de la jerarquía del mundo.
 * Este archivo solo contiene lógica de negocio y tipos, sin dependencias de UI.
 */

export type HierarchyTypeId =
  | "universe"
  | "planet"
  | "geography"
  | "entities"
  | "magic"
  | "factions"
  | "items"
  | "folder"
  | "dimension"
  | "map"
  | "timeline"
  | "personaje"
  | "lugar"
  | "organizacion"
  | "objeto"
  | "evento"
  | "conlang";

export interface HierarchyTypeDefinition {
  id: HierarchyTypeId;
  label: string;
  description?: string;
}

export const HIERARCHY_DEFINITIONS: Record<
  HierarchyTypeId,
  HierarchyTypeDefinition
> = {
  universe: {
    id: "universe",
    label: "Universo / Proyecto",
    description: "El contenedor raíz de toda la creación.",
  },
  planet: {
    id: "planet",
    label: "Planeta / Mundo",
    description: "Cuerpo celeste o plano de existencia principal.",
  },
  geography: {
    id: "geography",
    label: "Geografía",
    description: "Accidentes geográficos, regiones y mapas.",
  },
  entities: {
    id: "entities",
    label: "Entidades",
    description: "Personajes, razas y criaturas.",
  },
  magic: {
    id: "magic",
    label: "Magia",
    description: "Sistemas de energía, hechizos y lo arcano.",
  },
  factions: {
    id: "factions",
    label: "Facciones",
    description: "Organizaciones, reinos y religiones.",
  },
  items: {
    id: "items",
    label: "Objetos",
    description: "Reliquias, armas y objetos de valor.",
  },
  folder: {
    id: "folder",
    label: "Carpeta",
    description: "Contenedor genérico para organización.",
  },
  dimension: {
    id: "dimension",
    label: "Dimensión / Plano Cósmico",
    description: "Realidades paralelas o planos superiores.",
  },
  map: {
    id: "map",
    label: "Mapa Interactivo",
    description: "Cartografía digital y puntos de interés.",
  },
  timeline: {
    id: "timeline",
    label: "Línea de Tiempo",
    description: "Cronología de eventos y eras.",
  },
  personaje: {
    id: "personaje",
    label: "Personaje",
    description: "Individuos con historia y atributos.",
  },
  lugar: {
    id: "lugar",
    label: "Lugar / Ubicación",
    description: "Puntos específicos dentro de la geografía.",
  },
  organizacion: {
    id: "organizacion",
    label: "Facción / Organización",
    description: "Grupos, reinos o instituciones.",
  },
  objeto: {
    id: "objeto",
    label: "Objeto / Reliquia",
    description: "Artefactos y objetos de importancia.",
  },
  evento: {
    id: "evento",
    label: "Evento Histórico",
    description: "Hitos importantes en la cronología.",
  },
  conlang: {
    id: "conlang",
    label: "Lengua Construida",
    description: "Sistemas lingüísticos y glifos.",
  },
};
