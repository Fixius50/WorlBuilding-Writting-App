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
  onMapClick?: (lng: number, lat: number) => void;
  imageWidth: number;
  imageHeight: number;
}


const MapLibreView: React.FC<MapLibreViewProps> = ({
 mapImage,
 markers,
 layers,
  connections,
  onMarkerClick,
  onMapClick,
  imageWidth,
  imageHeight
}) => {

  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const mapMarkers = useRef<maplibregl.Marker[]>([]);

  // 1. Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'fantasy-map': {
            type: 'image',
            url: mapImage,
            coordinates: [
              [-180, 85],   // top-left
              [180, 85],    // top-right
              [180, -85],   // bottom-right
              [-180, -85]   // bottom-left
            ]
          }
        },
        layers: [
          {
            id: 'map-layer',
            type: 'raster',
            source: 'fantasy-map',
            paint: { 'raster-fade-duration': 0 }
          }
        ]
      },
      center: [0, 0],
      zoom: 1,
      maxZoom: 5,
      minZoom: 0,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    map.current.on('click', (e) => {
      if (onMapClick) {
        onMapClick(e.lngLat.lng, e.lngLat.lat);
      }
    });

    map.current.on('load', () => {
      // Initialize sources for connections
      if (map.current) {
        map.current.addSource('connections-source', {
          type: 'geojson',
          data: {
            type: 'FeatureCollection',
            features: []
          }
        });

        // Add layer for the lines
        map.current.addLayer({
          id: 'connections-layer',
          type: 'line',
          source: 'connections-source',
          layout: {
            'line-join': 'round',
            'line-cap': 'round'
          },
          paint: {
            'line-color': ['get', 'color'],
            'line-width': ['get', 'weight'],
            'line-opacity': 0.8,
            'line-dasharray': ['case', ['==', ['get', 'dashed'], true], ['literal', [2, 2]], ['literal', [1]]]
          }
        });
        
        // Add layer for connection labels
        map.current.addLayer({
          id: 'connections-label-layer',
          type: 'symbol',
          source: 'connections-source',
          layout: {
            'text-field': ['get', 'label'],
            'symbol-placement': 'line',
            'text-offset': [0, -1],
            'text-size': 10,
            'text-letter-spacing': 0.1
          },
          paint: {
            'text-color': '#ffffff',
            'text-halo-color': '#000000',
            'text-halo-width': 1
          }
        });
      }
    });

    return () => {
      map.current?.remove();
    };
  }, [mapImage]); // Only re-instantiate if image changes entirely

  // 2. Sync Markers and Connections
  useEffect(() => {
    if (!map.current) return;

    // Clear old markers
    mapMarkers.current.forEach(m => m.remove());
    mapMarkers.current = [];

    // Draw new markers
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

      // We add an event listener. Since this is React, we must ensure it doesn't get stale closures
      el.addEventListener('click', (e) => {
        e.stopPropagation(); // prevent map click
        onMarkerClick(marker);
      });

      const m = new maplibregl.Marker(el)
        .setLngLat([marker.lng || 0, marker.lat || 0])
        .addTo(map.current!);
      
      mapMarkers.current.push(m);
    });

    // Update GeoJSON for Connections
    const updateConnections = () => {
      if (!map.current?.getSource('connections-source')) return;

      const features = connections.map(conn => {
        const source = markers.find(m => m.id === conn.sourceId);
        const target = markers.find(m => m.id === conn.targetId);
        if (!source || !target) return null;

        const feature: GeoJSON.Feature<GeoJSON.LineString> = {
          type: 'Feature' as const,
          properties: {
            color: conn.color || '#6366f1',
            weight: conn.weight || 2,
            dashed: conn.dashed || false,
            label: conn.label || ''
          },
          geometry: {
            type: 'LineString' as const,
            coordinates: [
              [source.lng || 0, source.lat || 0],
              [target.lng || 0, target.lat || 0]
            ]
          }
        };
        return feature;
      }).filter((f): f is GeoJSON.Feature<GeoJSON.LineString> => f !== null);

      (map.current.getSource('connections-source') as maplibregl.GeoJSONSource).setData({
        type: 'FeatureCollection',
        features
      });
    };

    if (map.current.loaded()) {
      updateConnections();
    } else {
      map.current.on('load', updateConnections);
    }

  }, [markers, connections]);


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
