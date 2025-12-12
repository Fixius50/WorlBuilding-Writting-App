'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

interface WorldMapProps {
    className?: string;
}

export function WorldMap({ className = '' }: WorldMapProps) {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);
    const [mapReady, setMapReady] = useState(false);
    const [coordinates, setCoordinates] = useState({ lng: 0, lat: 0 });
    const [zoom, setZoom] = useState(2);

    useEffect(() => {
        if (map.current || !mapContainer.current) return;

        // Initialize MapLibre with a dark style
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                name: 'Chronos Atlas Dark',
                sources: {
                    // Empty source for custom world maps
                    'blank': {
                        type: 'geojson',
                        data: {
                            type: 'FeatureCollection',
                            features: []
                        }
                    }
                },
                layers: [
                    {
                        id: 'background',
                        type: 'background',
                        paint: {
                            'background-color': '#0a0f1a' // Dark blue background
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

        // Add zoom controls
        map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

        return () => {
            if (map.current) {
                map.current.remove();
                map.current = null;
            }
        };
    }, []);

    return (
        <div className={`relative h-full w-full ${className}`}>
            {/* Map Container */}
            <div ref={mapContainer} className="absolute inset-0" />

            {/* Toolbar */}
            <div className="absolute top-3 left-3 flex gap-2">
                <button
                    className="px-3 py-1.5 bg-card/90 backdrop-blur border border-border rounded-md text-sm hover:bg-secondary transition-colors"
                    title="Select Tool"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 3l7.07 16.97 2.51-7.39 7.39-2.51L3 3z" />
                    </svg>
                </button>
                <button
                    className="px-3 py-1.5 bg-card/90 backdrop-blur border border-border rounded-md text-sm hover:bg-secondary transition-colors"
                    title="Draw Polygon"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
                    </svg>
                </button>
                <button
                    className="px-3 py-1.5 bg-card/90 backdrop-blur border border-border rounded-md text-sm hover:bg-secondary transition-colors"
                    title="Add Marker"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                    </svg>
                </button>
            </div>

            {/* Coordinates Display */}
            <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-card/90 backdrop-blur border border-border rounded-md text-xs text-muted-foreground font-mono">
                <span>Lng: {coordinates.lng.toFixed(4)}</span>
                <span className="mx-2">|</span>
                <span>Lat: {coordinates.lat.toFixed(4)}</span>
                <span className="mx-2">|</span>
                <span>Zoom: {zoom.toFixed(2)}</span>
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
