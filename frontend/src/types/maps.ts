// Extracted from InteractiveMapView and MapLibreView

export interface MapLayer {
 id: string;
 name: string;
 visible: boolean;
 opacity: number;
 type: 'base' | 'image' | 'vector' | 'spray' | 'markers' | string;
 url?: string; // For images
 color?: string; // Base color for features
 featureType?: 'line' | 'polygon' | 'point'; 
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
 features?: any; // GeoJSON.FeatureCollection stored as any to avoid tight coupling in types if `@types/geojson` is not everywhere
 is3D?: boolean;
 mapSettings?: {
   zoom: number;
   center: [number, number];
 };
 [key: string]: unknown; // Allow map-specific extra attributes
}
