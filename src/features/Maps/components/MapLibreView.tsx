import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

import { MapLayer, MapMarker, MapConnection } from '../../../types/maps';

interface MapLibreViewProps {
    mapImage: string;
    markers: MapMarker[];
    layers: MapLayer[];
    connections: MapConnection[];
    onMarkerClick: (marker: MapMarker) => void;
    imageWidth: number;
    imageHeight: number;
}

const MapLibreView: React.FC<MapLibreViewProps> = ({
    mapImage,
    markers,
    layers,
    connections,
    onMarkerClick,
    imageWidth,
    imageHeight
}) => {
    const mapContainer = useRef<HTMLDivElement>(null);
    const map = useRef<maplibregl.Map | null>(null);

    useEffect(() => {
        if (!mapContainer.current) return;

        // Fantasy maps are usually coordinate-less (pixels)
        // We use a simple CRS (Coordinate Reference System) or just transform pixels to lat/lng
        // For MapLibre, we can use a "neutral" style and overlays
        
        map.current = new maplibregl.Map({
            container: mapContainer.current,
            style: {
                version: 8,
                sources: {
                    'raster-tiles': {
                        type: 'raster',
                        tiles: [mapImage],
                        tileSize: 256,
                    }
                },
                layers: [
                    {
                        id: 'simple-tiles',
                        type: 'raster',
                        source: 'raster-tiles',
                        minzoom: 0,
                        maxzoom: 22
                    }
                ]
            },
            center: [0, 0],
            zoom: 2,
            attributionControl: false
        });

        map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

        // Add Markers
        markers.forEach(marker => {
            const el = document.createElement('div');
            el.className = 'custom-marker';
            el.style.width = '24px';
            el.style.height = '24px';
            el.style.background = 'rgba(99, 102, 241, 0.2)';
            el.style.border = '2px solid #6366f1';
            el.style.borderRadius = '50%';
            el.style.cursor = 'pointer';
            el.style.boxShadow = '0 0 15px rgba(99, 102, 241, 0.5)';
            el.style.display = 'flex';
            el.style.alignItems = 'center';
            el.style.justifyContent = 'center';

            const dot = document.createElement('div');
            dot.style.width = '6px';
            dot.style.height = '6px';
            dot.style.background = '#fff';
            dot.style.borderRadius = '50%';
            el.appendChild(dot);

            el.addEventListener('click', () => onMarkerClick(marker));

            new maplibregl.Marker(el)
                .setLngLat([marker.lng || 0, marker.lat || 0])
                .addTo(map.current!);
        });

        return () => {
            map.current?.remove();
        };
    }, [mapImage]);

    return (
        <div className="w-full h-full relative group">
            <div ref={mapContainer} className="absolute inset-0" />
            
            {/* Overlay for connections (SVG or Canvas) could go here if managed externally */}
            {/* But for now, let's stick to base MapLibre functionality */}
            
            <style>{`
                .maplibregl-canvas {
                    outline: none;
                }
                .custom-marker:hover {
                    transform: scale(1.2);
                    background: rgba(99, 102, 241, 0.4) !important;
                    transition: all 0.2s ease-out;
                }
            `}</style>
        </div>
    );
};

export default MapLibreView;
