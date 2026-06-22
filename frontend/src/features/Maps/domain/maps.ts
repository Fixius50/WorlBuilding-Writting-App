// Extracted from InteractiveMapView and MapLibreView

export interface MapLayer {
  id: string;
  name: string;
  visible: boolean;
  opacity: number;
  type: "base" | "image" | "vector" | "spray" | "markers" | string;
  url?: string;
  color?: string;
  featureType?: "line" | "polygon" | "point";
  attribution?: string;
}

export interface MapMarker {
  id: string;
  x?: number;
  y?: number;
  lng?: number;
  lat?: number;
  label?: string;
  description?: string;
  type?: string;
  entityId?: number | string | null;
  layerId?: string;
  targetLevelId?: string | null;
}

export interface MapConnection {
  id: string;
  sourceId: string;
  targetId: string;
  label?: string;
  type?: string;
  weight?: number;
  layerId?: string;
  color?: string;
  dashed?: boolean;
}

export interface MapAttributes {
  layers?: MapLayer[];
  markers?: MapMarker[];
  connections?: MapConnection[];
  features?: unknown;
  is3D?: boolean;
  mapSettings?: {
    zoom: number;
    center: [number, number];
  };
  [key: string]: unknown;
}

// --- Tipos del Atlas (capas de dibujo) ---

export interface AtlasLevel {
  id: string;
  name: string;
  z_index?: number;
}

export interface AtlasAnnotation {
  id: string;
  levelId: string;
  text: string;
}

export interface AtlasAttributes extends MapAttributes {
  levels?: AtlasLevel[];
  levelOpacities?: Record<string, number>;
  canvasStates?: Record<string, string | null>;
  levelBgImages?: Record<string, string | null>;
  annotations?: AtlasAnnotation[];
  backdropOpacity?: number;
  brushColor?: string;
  brushSize?: number;
  drawTool?: "brush" | "eraser";
  activeLevelId?: string;
  levelSpacing?: number;
}

