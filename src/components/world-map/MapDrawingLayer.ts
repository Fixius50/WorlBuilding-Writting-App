/**
 * MapDrawingLayer - Capa de dibujo con Nebula.gl
 * 
 * Permite dibujar polígonos y puntos a mano alzada en el mapa
 * usando EditableGeoJsonLayer de nebula.gl
 */

import { useState, useCallback, useMemo } from 'react';
import { EditableGeoJsonLayer } from '@nebula.gl/layers';
import {
    DrawPolygonMode,
    DrawPointMode,
    ModifyMode,
    ViewMode
} from '@nebula.gl/edit-modes';
import { useCosmosStore } from '@/lib/stores/useCosmosStore';
import { useSyncStore } from '@/lib/stores/useSyncStore';

export type DrawingMode = 'view' | 'draw_polygon' | 'draw_point' | 'modify';

// GeoJSON FeatureCollection type
export interface GeoJSONFeature {
    type: 'Feature';
    id?: string;
    properties: Record<string, unknown>;
    geometry: {
        type: string;
        coordinates: number[] | number[][] | number[][][];
    };
}

export interface GeoJSONFeatureCollection {
    type: 'FeatureCollection';
    features: GeoJSONFeature[];
}

interface MapDrawingLayerProps {
    onSave?: (feature: GeoJSONFeature) => void;
}

// Mode classes
const MODES = {
    view: ViewMode,
    draw_polygon: DrawPolygonMode,
    draw_point: DrawPointMode,
    modify: ModifyMode,
} as const;

// Simple polygon simplifier (Douglas-Peucker algorithm)
function simplifyPolygon(coords: number[][], tolerance: number): number[][] {
    if (coords.length <= 3) return coords;

    function perpendicularDistance(point: number[], lineStart: number[], lineEnd: number[]): number {
        const dx = lineEnd[0] - lineStart[0];
        const dy = lineEnd[1] - lineStart[1];
        const mag = Math.sqrt(dx * dx + dy * dy);
        if (mag === 0) return Math.sqrt((point[0] - lineStart[0]) ** 2 + (point[1] - lineStart[1]) ** 2);
        const u = ((point[0] - lineStart[0]) * dx + (point[1] - lineStart[1]) * dy) / (mag * mag);
        const closestX = lineStart[0] + u * dx;
        const closestY = lineStart[1] + u * dy;
        return Math.sqrt((point[0] - closestX) ** 2 + (point[1] - closestY) ** 2);
    }

    function douglasPeucker(points: number[][], epsilon: number): number[][] {
        if (points.length <= 2) return points;

        let maxDist = 0;
        let index = 0;
        const end = points.length - 1;

        for (let i = 1; i < end; i++) {
            const d = perpendicularDistance(points[i], points[0], points[end]);
            if (d > maxDist) {
                index = i;
                maxDist = d;
            }
        }

        if (maxDist > epsilon) {
            const left = douglasPeucker(points.slice(0, index + 1), epsilon);
            const right = douglasPeucker(points.slice(index), epsilon);
            return [...left.slice(0, -1), ...right];
        }

        return [points[0], points[end]];
    }

    return douglasPeucker(coords, tolerance);
}

export function useMapDrawingLayer({ onSave }: MapDrawingLayerProps = {}) {
    const [mode, setMode] = useState<DrawingMode>('view');
    const [features, setFeatures] = useState<GeoJSONFeatureCollection>({
        type: 'FeatureCollection',
        features: [],
    });
    const [selectedFeatureIndexes, setSelectedFeatureIndexes] = useState<number[]>([]);

    const { currentSpacetimeId } = useCosmosStore();
    const { setSyncing, setSynced } = useSyncStore();

    // Simplify polygon to reduce points
    const simplifyFeature = useCallback((feature: GeoJSONFeature): GeoJSONFeature => {
        if (feature.geometry.type === 'Polygon') {
            const coords = feature.geometry.coordinates as number[][][];
            const simplifiedCoords = coords.map(ring => simplifyPolygon(ring as number[][], 0.01));
            return {
                ...feature,
                geometry: {
                    ...feature.geometry,
                    coordinates: simplifiedCoords
                }
            };
        }
        return feature;
    }, []);

    // Handle edit event from Nebula.gl
    const handleEdit = useCallback((editInfo: {
        updatedData: GeoJSONFeatureCollection;
        editType: string;
        featureIndexes: number[];
    }) => {
        const { updatedData, editType, featureIndexes } = editInfo;

        // When a new feature is added
        if (editType === 'addFeature') {
            const newFeatureIndex = featureIndexes[0];
            const newFeature = updatedData.features[newFeatureIndex];

            // Simplify the feature
            const simplifiedFeature = simplifyFeature(newFeature);

            // Add metadata
            simplifiedFeature.id = crypto.randomUUID();
            simplifiedFeature.properties = {
                ...simplifiedFeature.properties,
                root_spacetime_id: currentSpacetimeId,
                created_at: new Date().toISOString(),
                style: {
                    fillColor: [100, 150, 255, 100],
                    lineColor: [100, 150, 255, 255],
                    lineWidth: 2,
                }
            };

            // Update features with simplified version
            const newFeatures = [...updatedData.features];
            newFeatures[newFeatureIndex] = simplifiedFeature;

            setFeatures({
                type: 'FeatureCollection',
                features: newFeatures,
            });

            // Save to DB
            setSyncing();
            if (onSave) {
                onSave(simplifiedFeature);
            }
            setSynced();

            // Switch back to view mode after drawing
            setMode('view');
            setSelectedFeatureIndexes([newFeatureIndex]);
        } else {
            setFeatures(updatedData);
        }
    }, [currentSpacetimeId, onSave, setSyncing, setSynced, simplifyFeature]);

    // Create the editable layer
    const drawingLayer = useMemo(() => {
        const ModeClass = MODES[mode];

        return new EditableGeoJsonLayer({
            id: 'drawing-layer',
            data: features,
            mode: new ModeClass(),
            selectedFeatureIndexes,
            onEdit: handleEdit,

            // Styling props - use simple defaults
            filled: true,
            stroked: true,
            lineWidthMinPixels: 2,
            pointRadiusMinPixels: 8,

            // Use default colors
            getFillColor: [100, 150, 255, 100],
            getLineColor: [100, 150, 255, 255],
            getLineWidth: 2,
        });
    }, [mode, features, selectedFeatureIndexes, handleEdit]);

    return {
        mode,
        setMode,
        features,
        setFeatures,
        selectedFeatureIndexes,
        setSelectedFeatureIndexes,
        drawingLayer,
    };
}

// Helper to convert Zone to GeoJSON Feature
export function zoneToFeature(zone: {
    id: string;
    name: string;
    coordinates: [number, number][];
    color: string;
    planetId: string;
}): GeoJSONFeature {
    // Convert hex color to RGBA array
    const hexToRgba = (hex: string, alpha = 100): number[] => {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b, alpha];
    };

    return {
        type: 'Feature',
        id: zone.id,
        properties: {
            name: zone.name,
            planetId: zone.planetId,
            style: {
                fillColor: hexToRgba(zone.color, 100),
                lineColor: hexToRgba(zone.color, 255),
            }
        },
        geometry: {
            type: 'Polygon',
            coordinates: [zone.coordinates],
        }
    };
}
