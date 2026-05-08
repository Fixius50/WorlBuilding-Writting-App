import React, { useEffect, useRef, useCallback } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ScatterplotLayer, TextLayer, PathLayer, GeoJsonLayer } from '@deck.gl/layers';
import { MapLayer, MapMarker, MapConnection } from '@domain/models/maps';

interface GeoFeatureCollection {
  type: string;
  features: Array<{ properties?: Record<string, unknown>; geometry: { type: string; coordinates: unknown } }>;
}

interface MapLibreViewProps {
  mapImage: string;
  markers: MapMarker[];
  layers: MapLayer[];
  connections: MapConnection[];
  features?: GeoFeatureCollection;
  onMarkerClick: (marker: MapMarker) => void;
  onMapClick?: (lng: number, lat: number) => void;
  imageWidth: number;
  imageHeight: number;
  is3D?: boolean;
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
  imageHeight,
  is3D = false
}) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  const map = useRef<maplibregl.Map | null>(null);
  const deckOverlay = useRef<MapboxOverlay | null>(null);

  // Ref estable para onMarkerClick para evitar re-renders al actualizar capas
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

  // ── Construir capas de deck.gl ─────────────────────────────────────────
  const buildDeckLayers = useCallback((
    currentMarkers: MapMarker[],
    currentConnections: MapConnection[],
    currentFeatures: GeoFeatureCollection | undefined,
    currentLayers: MapLayer[]
  ) => {
    const deckLayers: import('@deck.gl/core').Layer[] = [];

    // ── Capa de conexiones entre marcadores (PathLayer) ────────
    const connPaths = currentConnections
      .map(conn => {
        const src = currentMarkers.find(m => m.id === conn.sourceId);
        const tgt = currentMarkers.find(m => m.id === conn.targetId);
        if (!src || !tgt) return null;
        return {
          path: [[src.lng || 0, src.lat || 0], [tgt.lng || 0, tgt.lat || 0]],
          color: hexToRgb(conn.color || '#6366f1'),
          width: conn.weight || 2,
          dashed: conn.dashed || false,
        };
      })
      .filter(Boolean) as { path: number[][]; color: [number, number, number]; width: number; dashed: boolean }[];

    if (connPaths.length > 0) {
      deckLayers.push(
        new PathLayer({
          id: 'deck-connections',
          data: connPaths,
          getPath: (d) => d.path,
          getColor: (d) => d.color,
          getWidth: (d) => d.width,
          widthUnits: 'pixels',
          rounded: true,
          pickable: false,
        })
      );
    }

    // ── Capa de dibujos GeoJSON (spray + trayectos) ────────────
    if ((currentFeatures?.features?.length ?? 0) > 0) {
      currentLayers
        .filter(l => l.type !== 'base' && l.type !== 'image' && l.visible)
        .forEach(layer => {
          const layerFeatures = (currentFeatures!.features || []).filter(
            (f) => f.properties?.layerId === layer.id
          );
          if (layerFeatures.length === 0) return;

          const rgb = hexToRgb(layer.color || '#6366f1');

          deckLayers.push(
            new GeoJsonLayer({
              id: `deck-geojson-${layer.id}`,
              data: { type: 'FeatureCollection', features: layerFeatures } as import('geojson').FeatureCollection,
              getLineColor: [...rgb, Math.round((layer.opacity ?? 1) * 255)],
              getFillColor: [...rgb, Math.round((layer.opacity ?? 0.8) * 200)],
              getPointRadius: layer.type === 'spray' ? 6 : 3,
              pointRadiusUnits: 'pixels',
              getLineWidth: 3,
              lineWidthUnits: 'pixels',
              lineJointRounded: true,
              lineCapRounded: true,
              pickable: false,
            })
          );
        });
    }

    // ── Marcadores: círculo base (ScatterplotLayer) ────────────
    if (currentMarkers.length > 0) {
      deckLayers.push(
        new ScatterplotLayer({
          id: 'deck-markers-bg',
          data: currentMarkers,
          getPosition: (d: MapMarker) => [d.lng || 0, d.lat || 0],
          getRadius: 12,
          radiusUnits: 'pixels',
          getFillColor: [15, 15, 20, 160],
          getLineColor: [99, 102, 241, 220],
          lineWidthMinPixels: 2,
          stroked: true,
          filled: true,
          pickable: false,
        })
      );

      // Punto inner (más pequeño, blanco)
      deckLayers.push(
        new ScatterplotLayer({
          id: 'deck-markers-dot',
          data: currentMarkers,
          getPosition: (d: MapMarker) => [d.lng || 0, d.lat || 0],
          getRadius: 4,
          radiusUnits: 'pixels',
          getFillColor: [255, 255, 255, 240],
          pickable: true,
          autoHighlight: true,
          highlightColor: [99, 102, 241, 255],
          onClick: (info: { object?: MapMarker }) => {
            if (info.object) onMarkerClickRef.current(info.object);
          },
        })
      );

      // Etiquetas de texto (TextLayer)
      deckLayers.push(
        new TextLayer({
          id: 'deck-marker-labels',
          data: currentMarkers.filter(m => m.label),
          getPosition: (d: MapMarker) => [d.lng || 0, d.lat || 0],
          getText: (d: MapMarker) => d.label || '',
          getSize: 11,
          getColor: [240, 240, 255, 220],
          getPixelOffset: [0, -20],
          fontFamily: 'Inter, system-ui, sans-serif',
          fontWeight: 700,
          background: true,
          getBackgroundColor: [15, 15, 25, 180],
          backgroundPadding: [4, 2, 4, 2],
          pickable: false,
        })
      );
    }

    return deckLayers;
  }, []);

  // ── Inicializar mapa MapLibre + overlay deck.gl ────────────────────────
  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current!,
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
      renderWorldCopies: is3D,
      projection: is3D ? { type: 'globe' } as unknown : undefined,
      attributionControl: false,
    } as maplibregl.MapOptions);

    map.current = mapInstance;

    // Crear y añadir overlay de deck.gl
    const overlay = new MapboxOverlay({
      interleaved: false, // Renderiza encima del mapa base
      layers: [],
    });
    deckOverlay.current = overlay;
    mapInstance.addControl(overlay as unknown as maplibregl.IControl);
    mapInstance.addControl(new maplibregl.NavigationControl(), 'bottom-right');

    mapInstance.on('click', (e) => {
      if (onMapClick) onMapClick(e.lngLat.lng, e.lngLat.lat);
    });

    mapInstance.on('load', () => {
      if (!mapInstance) return;

      // Capas de imagen superpuestas (climate, borders bitmap)
      const imageLayers = (layers || []).filter(
        l => (l.type === 'image' || l.type === 'base') && l.url && l.id !== 'base' && l.visible
      );
      imageLayers.forEach(layer => {
        const srcId = `overlay-${layer.id}`;
        if (!mapInstance.getSource(srcId)) {
          mapInstance.addSource(srcId, {
            type: 'image',
            url: layer.url!,
            coordinates: [[-180, 85.0511], [180, 85.0511], [180, -85.0511], [-180, -85.0511]]
          });
          mapInstance.addLayer({
            id: `overlay-lay-${layer.id}`,
            type: 'raster',
            source: srcId,
            paint: { 'raster-opacity': layer.opacity ?? 1 }
          });
        }
      });
    });

    return () => {
      deckOverlay.current?.finalize();
      deckOverlay.current = null;
      mapInstance.remove();
      map.current = null;
    };
  }, [mapImage]); // Solo re-inicializa si cambia la imagen base

  // ── Sincronizar capas deck.gl cuando cambian datos ─────────────────────
  useEffect(() => {
    if (!deckOverlay.current) return;
    const newLayers = buildDeckLayers(markers, connections, features, layers);
    deckOverlay.current.setProps({ layers: newLayers as import('@deck.gl/core').Layer[] });
  }, [markers, connections, features, layers, buildDeckLayers]);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

// ── Utilidad: hex a RGB array para deck.gl ────────────────────────────────
function hexToRgb(hex: string): [number, number, number] {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : [99, 102, 241];
}

export default MapLibreView;
