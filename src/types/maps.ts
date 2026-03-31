// Extracted from InteractiveMapView and MapLibreView

export interface MapLayer {
 id: string;
 name: string;
 visible: boolean;
 opacity: number;
 type: 'base' | 'overlay' | 'markers' | string;
 url?: string;
 attribution?: string;
}

export interface MapMarker {
 id: string;
 x?: number; // For Konva
 y?: number; // For Konva
 lng?: number; // For MapLibre
 lat?: number; // For MapLibre
 label?: string;
 description?: string;
 type?: string;
 entityId?: number | string | null;
 layerId?: string;
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
 [key: string]: unknown; // Allow map-specific extra attributes
}
