import React, { useRef } from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import { MapLayer, MapMarker, MapConnection } from '@domain/models/maps';
import { useMapLibreView } from './useMapLibreView';

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

const MapLibreView: React.FC<MapLibreViewProps> = (props) => {
  const mapContainer = useRef<HTMLDivElement>(null);
  useMapLibreView(mapContainer, props);

  return (
    <div className="w-full h-full relative">
      <div ref={mapContainer} className="absolute inset-0" />
    </div>
  );
};

export default MapLibreView;

