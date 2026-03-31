import React, { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapLayer, MapMarker, MapConnection } from '../../../types/maps';

interface MapLibreViewProps {
  mapImage: string;
  markers: MapMarker[];
  layers: MapLayer[];
  connections: MapConnection[];
  features?: any; // GeoJSON FeatureCollection de dibujos (spray, trayectos)
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
  features,
  onMarkerClick,
  onMapClick,
  imageWidth,
  imageHeight
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const mapMarkers = useRef<maplibregl.Marker[]>([]);

  // 1. Inicializar mapa
  useEffect(() => {
    if (!mapContainer.current) return;

    map.current = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'base-map': {
            type: 'image',
            url: mapImage,
            coordinates: [[-180, 85.0511], [180, 85.0511], [180, -85.0511], [-180, -85.0511]]
          }
        },
        layers: [
          {
            id: 'base-map-layer',
            type: 'raster',
            source: 'base-map',
            paint: { 'raster-fade-duration': 0 }
          }
        ]
      },
      center: [0, 0],
      zoom: 1,
      maxZoom: 7,
      minZoom: 0,
      attributionControl: false
    });

    map.current.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    map.current.on('click', (e) => {
      if (onMapClick) onMapClick(e.lngLat.lng, e.lngLat.lat);
    });

    map.current.on('load', () => {
      if (!map.current) return;

      // ── Capas de imagen superpuestas (clima, fronteras bitmap) ──
      const imageLayers = (layers || []).filter(l => (l.type === 'image' || l.type === 'base') && l.url && l.id !== 'base' && l.visible);
      imageLayers.forEach(layer => {
        const srcId = `overlay-${layer.id}`;
        if (!map.current!.getSource(srcId)) {
          map.current!.addSource(srcId, {
            type: 'image',
            url: layer.url!,
            coordinates: [[-180, 85.0511], [180, 85.0511], [180, -85.0511], [-180, -85.0511]]
          });
          map.current!.addLayer({
            id: `overlay-lay-${layer.id}`,
            type: 'raster',
            source: srcId,
            paint: { 'raster-opacity': layer.opacity ?? 1 }
          });
        }
      });

      // ── Source para dibujos (spray + trayectos GeoJSON) ──
      map.current.addSource('draw-features', {
        type: 'geojson',
        data: features || { type: 'FeatureCollection', features: [] }
      });

      // Renderizar líneas por capa
      (layers || []).filter(l => l.type !== 'base' && l.type !== 'image' && l.visible).forEach(layer => {
        map.current!.addLayer({
          id: `draw-line-${layer.id}`,
          type: 'line',
          source: 'draw-features',
          filter: ['all', ['==', '$type', 'LineString'], ['==', ['get', 'layerId'], layer.id]],
          layout: { 'line-join': 'round', 'line-cap': 'round' },
          paint: {
            'line-color': layer.color || '#ef4444',
            'line-width': 3,
            'line-opacity': layer.opacity ?? 1
          }
        });
        map.current!.addLayer({
          id: `draw-point-${layer.id}`,
          type: 'circle',
          source: 'draw-features',
          filter: ['all', ['==', '$type', 'Point'], ['==', ['get', 'layerId'], layer.id]],
          paint: {
            'circle-color': layer.color || '#10b981',
            'circle-radius': layer.type === 'spray' ? 7 : 3,
            'circle-blur': layer.type === 'spray' ? 0.5 : 0,
            'circle-opacity': (layer.opacity ?? 1) * 0.85
          }
        });
      });

      // ── Source conexiones entre marcadores ──
      map.current.addSource('connections-source', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      });
      map.current.addLayer({
        id: 'connections-layer',
        type: 'line',
        source: 'connections-source',
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': ['get', 'color'],
          'line-width': ['get', 'weight'],
          'line-opacity': 0.8,
          'line-dasharray': ['case', ['==', ['get', 'dashed'], true], ['literal', [2, 2]], ['literal', [1]]]
        }
      });
    });

    return () => { map.current?.remove(); };
  }, [mapImage]); // Solo reiniciar si cambia la imagen base

  // 2. Sincronizar features de dibujo
  useEffect(() => {
    if (!map.current?.loaded()) return;
    const src = map.current.getSource('draw-features') as maplibregl.GeoJSONSource;
    if (src) src.setData(features || { type: 'FeatureCollection', features: [] });
  }, [features]);

  // 3. Sincronizar marcadores y conexiones
  useEffect(() => {
    if (!map.current) return;

    mapMarkers.current.forEach(m => m.remove());
    mapMarkers.current = [];

    markers.forEach(marker => {
      const el = document.createElement('div');
      el.style.cssText = `
        width:24px; height:24px; background:rgba(99,102,241,0.2);
        border:2px solid #6366f1; border-radius:50%; cursor:pointer;
        box-shadow:0 0 15px rgba(99,102,241,0.5);
        display:flex; align-items:center; justify-content:center;
        transition: transform 0.2s, background 0.2s;
      `;
      el.onmouseenter = () => { el.style.transform = 'scale(1.2)'; el.style.background = 'rgba(99,102,241,0.4)'; };
      el.onmouseleave = () => { el.style.transform = 'scale(1)'; el.style.background = 'rgba(99,102,241,0.2)'; };

      const dot = document.createElement('div');
      dot.style.cssText = 'width:6px;height:6px;background:#fff;border-radius:50%;';
      el.appendChild(dot);

      el.addEventListener('click', (e) => {
        e.stopPropagation();
        onMarkerClick(marker);
      });

      const m = new maplibregl.Marker(el)
        .setLngLat([marker.lng || 0, marker.lat || 0])
        .addTo(map.current!);
      mapMarkers.current.push(m);
    });

    // Conexiones
    const updateConnections = () => {
      if (!map.current?.getSource('connections-source')) return;
      const connFeatures = connections.map(conn => {
        const src = markers.find(m => m.id === conn.sourceId);
        const tgt = markers.find(m => m.id === conn.targetId);
        if (!src || !tgt) return null;
        return {
          type: 'Feature' as const,
          properties: { color: conn.color || '#6366f1', weight: conn.weight || 2, dashed: conn.dashed || false, label: conn.label || '' },
          geometry: { type: 'LineString' as const, coordinates: [[src.lng || 0, src.lat || 0], [tgt.lng || 0, tgt.lat || 0]] }
        };
      }).filter(Boolean) as GeoJSON.Feature[];

      (map.current.getSource('connections-source') as maplibregl.GeoJSONSource).setData({ type: 'FeatureCollection', features: connFeatures });
    };

    if (map.current.loaded()) updateConnections();
    else map.current.on('load', updateConnections);
  }, [markers, connections]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapLibreView;
