'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { useCosmosStore } from '@/lib/stores/useCosmosStore';

interface WorldMapProps {
    className?: string;
}

type DrawMode = 'select' | 'polygon' | 'marker';

interface Zone {
    id: string;
    name: string;
    coordinates: [number, number][];
    color: string;
    planetId: string;
}

interface Marker {
    id: string;
    name: string;
    coordinates: [number, number];
    type: 'city' | 'landmark' | 'event';
    planetId: string;
}

// Mock zones for demonstration
const mockZones: Zone[] = [
    {
        id: 'z1',
        name: 'Kingdom of Camelot',
        coordinates: [[-10, 50], [10, 50], [10, 40], [-10, 40], [-10, 50]],
        color: '#22c55e',
        planetId: 'earth',
    },
    {
        id: 'z2',
        name: 'Mordor',
        coordinates: [[30, 35], [50, 35], [50, 25], [30, 25], [30, 35]],
        color: '#ef4444',
        planetId: 'earth',
    },
];

// Mock markers
const mockMarkers: Marker[] = [
    { id: 'm1', name: 'Camelot Castle', coordinates: [0, 45], type: 'city', planetId: 'earth' },
    { id: 'm2', name: 'Mount Doom', coordinates: [40, 30], type: 'landmark', planetId: 'earth' },
];

export function WorldMap({ className = '' }: WorldMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const markersRef = useRef<maplibregl.Marker[]>([]);

    const [mapReady, setMapReady] = useState(false);
    const [coordinates, setCoordinates] = useState({ lng: 0, lat: 0 });
    const [zoom, setZoom] = useState(2);
    const [drawMode, setDrawMode] = useState<DrawMode>('select');
    const [selectedZone, setSelectedZone] = useState<string | null>(null);

    const { currentPlanetId, currentSpacetimeId } = useCosmosStore();

    // Filter data by current planet context
    const filteredZones = mockZones.filter(z => !currentPlanetId || z.planetId === currentPlanetId);
    const filteredMarkers = mockMarkers.filter(m => !currentPlanetId || m.planetId === currentPlanetId);

    const addZonesToMap = useCallback(() => {
        if (!map.current || !mapReady) return;

        // Remove existing zone layers
        filteredZones.forEach((_, i) => {
            if (map.current?.getLayer(`zone-fill-${i}`)) {
                map.current.removeLayer(`zone-fill-${i}`);
            }
            if (map.current?.getLayer(`zone-outline-${i}`)) {
                map.current.removeLayer(`zone-outline-${i}`);
            }
            if (map.current?.getSource(`zone-${i}`)) {
                map.current.removeSource(`zone-${i}`);
            }
        });

        // Add zones as GeoJSON layers
        filteredZones.forEach((zone, i) => {
            if (!map.current) return;

            map.current.addSource(`zone-${i}`, {
                type: 'geojson',
                data: {
                    type: 'Feature',
                    properties: { name: zone.name, id: zone.id },
                    geometry: {
                        type: 'Polygon',
                        coordinates: [zone.coordinates],
                    },
                },
            });

            // Fill layer
            map.current.addLayer({
                id: `zone-fill-${i}`,
                type: 'fill',
                source: `zone-${i}`,
                paint: {
                    'fill-color': zone.color,
                    'fill-opacity': selectedZone === zone.id ? 0.5 : 0.3,
                },
            });

            // Outline layer
            map.current.addLayer({
                id: `zone-outline-${i}`,
                type: 'line',
                source: `zone-${i}`,
                paint: {
                    'line-color': zone.color,
                    'line-width': selectedZone === zone.id ? 3 : 1.5,
                },
            });

            // Click handler for selection
            map.current.on('click', `zone-fill-${i}`, () => {
                setSelectedZone(zone.id);
            });

            map.current.on('mouseenter', `zone-fill-${i}`, () => {
                if (map.current) map.current.getCanvas().style.cursor = 'pointer';
            });

            map.current.on('mouseleave', `zone-fill-${i}`, () => {
                if (map.current) map.current.getCanvas().style.cursor = '';
            });
        });
    }, [filteredZones, mapReady, selectedZone]);

    const addMarkersToMap = useCallback(() => {
        if (!map.current) return;

        // Remove existing markers
        markersRef.current.forEach(m => m.remove());
        markersRef.current = [];

        // Add markers
        filteredMarkers.forEach(marker => {
            const el = document.createElement('div');
            el.className = 'w-6 h-6 rounded-full bg-primary border-2 border-primary-foreground shadow-lg cursor-pointer transform -translate-x-1/2 -translate-y-1/2 hover:scale-110 transition-transform';

            if (marker.type === 'city') {
                el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full p-1 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L2 7v15h20V7L12 2zm0 2.18l8 4v11.82H4V8.18l8-4z"/></svg>`;
            } else if (marker.type === 'landmark') {
                el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full p-1 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>`;
            } else {
                el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" class="h-full w-full p-1 text-primary-foreground" viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="10" r="3"/><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/></svg>`;
            }

            const popup = new maplibregl.Popup({ offset: 25 })
                .setHTML(`<div class="text-sm font-medium text-black">${marker.name}</div>`);

            const m = new maplibregl.Marker({ element: el })
                .setLngLat(marker.coordinates)
                .setPopup(popup)
                .addTo(map.current!);

            markersRef.current.push(m);
        });
    }, [filteredMarkers]);

    // Initialize map
    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        // Generate grid lines as GeoJSON
        const gridLines: GeoJSON.FeatureCollection = {
            type: 'FeatureCollection',
            features: [
                // Longitude lines every 30 degrees
                ...[-180, -150, -120, -90, -60, -30, 0, 30, 60, 90, 120, 150, 180].map(lng => ({
                    type: 'Feature' as const,
                    properties: {},
                    geometry: {
                        type: 'LineString' as const,
                        coordinates: [[-lng, -85], [-lng, 85]]
                    }
                })),
                // Latitude lines every 30 degrees
                ...[-60, -30, 0, 30, 60].map(lat => ({
                    type: 'Feature' as const,
                    properties: {},
                    geometry: {
                        type: 'LineString' as const,
                        coordinates: [[-180, lat], [180, lat]]
                    }
                }))
            ]
        };

        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                name: 'Chronos Atlas Dark',
                sources: {
                    'grid-lines': {
                        type: 'geojson',
                        data: gridLines
                    }
                },
                layers: [
                    {
                        id: 'background',
                        type: 'background',
                        paint: { 'background-color': '#0a0f1a' }
                    },
                    // Visible grid lines
                    {
                        id: 'grid',
                        type: 'line',
                        source: 'grid-lines',
                        paint: {
                            'line-color': '#1e3a5f',
                            'line-width': 0.5,
                            'line-opacity': 0.6
                        }
                    }
                ],
                glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf'
            },
            center: [0, 0],
            zoom: 2,
            maxZoom: 20,
            minZoom: 0,
            attributionControl: false
        });

        map.current.on('load', () => {
            setMapReady(true);
        });

        map.current.on('move', () => {
            if (map.current) {
                const center = map.current.getCenter();
                setCoordinates({ lng: center.lng, lat: center.lat });
                setZoom(map.current.getZoom());
            }
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    // Update layers when data or selection changes
    useEffect(() => {
        addZonesToMap();
        addMarkersToMap();
    }, [mapReady, filteredZones, filteredMarkers, selectedZone, addZonesToMap, addMarkersToMap]);

    const handleModeChange = (mode: DrawMode) => {
        setDrawMode(mode);
        if (map.current) {
            map.current.getCanvas().style.cursor = mode === 'select' ? '' : 'crosshair';
        }
    };

    return (
        <div className={`relative h-full w-full ${className}`}>
            {/* Map Container */}
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Toolbar */}
            <div className="absolute top-3 left-3 flex gap-2">
                <button
                    onClick={() => handleModeChange('select')}
                    className={`px-3 py-1.5 backdrop-blur border rounded-md text-sm transition-colors ${drawMode === 'select'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card/90 border-border hover:bg-secondary'
                        }`}
                    title="Select Tool"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                    </svg>
                </button>
                <button
                    onClick={() => handleModeChange('polygon')}
                    className={`px-3 py-1.5 backdrop-blur border rounded-md text-sm transition-colors ${drawMode === 'polygon'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card/90 border-border hover:bg-secondary'
                        }`}
                    title="Draw Polygon"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                    </svg>
                </button>
                <button
                    onClick={() => handleModeChange('marker')}
                    className={`px-3 py-1.5 backdrop-blur border rounded-md text-sm transition-colors ${drawMode === 'marker'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-card/90 border-border hover:bg-secondary'
                        }`}
                    title="Add Marker"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                </button>

                {/* Spacetime Context Indicator */}
                <div className="px-3 py-1.5 bg-card/90 backdrop-blur border border-border rounded-md text-xs text-muted-foreground">
                    📍 {currentSpacetimeId || 'No context'}
                </div>
            </div>

            {/* Zone Info */}
            {selectedZone && (
                <div className="absolute top-3 right-16 px-4 py-2 bg-card/95 backdrop-blur border border-border rounded-lg">
                    <div className="text-sm font-medium">{mockZones.find(z => z.id === selectedZone)?.name}</div>
                    <div className="text-xs text-muted-foreground">Click elsewhere to deselect</div>
                </div>
            )}

            {/* Coordinates Display */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-card/90 backdrop-blur border border-border rounded-md text-xs text-muted-foreground font-mono">
                <span>Lng: {coordinates.lng.toFixed(4)}</span>
                <span className="mx-2">|</span>
                <span>Lat: {coordinates.lat.toFixed(4)}</span>
                <span className="mx-2">|</span>
                <span>Zoom: {zoom.toFixed(2)}</span>
            </div>

            {/* Legend */}
            <div className="absolute bottom-3 right-3 px-3 py-2 bg-card/90 backdrop-blur border border-border rounded-md text-xs">
                <div className="font-medium mb-1">Zones</div>
                {filteredZones.map(zone => (
                    <div key={zone.id} className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded" style={{ backgroundColor: zone.color }} />
                        <span>{zone.name}</span>
                    </div>
                ))}
            </div>

            {/* Loading State */}
            {!mapReady && (
                <div className="absolute inset-0 flex items-center justify-center bg-background/80">
                    <div className="flex flex-col items-center gap-3">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm text-muted-foreground">Loading Map...</span>
                    </div>
                </div>
            )}
        </div>
    );
}
