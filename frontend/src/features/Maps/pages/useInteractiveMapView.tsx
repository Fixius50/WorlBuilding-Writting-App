import { useState, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { Entidad } from '@domain/models/database';
import { MapMarker, MapLayer, MapConnection, MapAttributes } from '@domain/models/maps';
import { useRightPanelStore } from '@store/useRightPanelStore';

/**
 * 🧠 useInteractiveMapView
 * Handles marker selection, filtering, and data processing for the interactive map.
 */
export const useInteractiveMapView = (map: Entidad) => {
  const { projectName } = useParams();
  const navigate = useNavigate();
  const [selectedMarker, setSelectedMarker] = useState<MapMarker | null>(null);
  const [availableEntities, setAvailableEntities] = useState<Entidad[]>([]);
  const { openPanel, setCustomContent } = useRightPanelStore();
  
  const [atlasFilters, setAtlasFilters] = useState({
    cities: true,
    ruins: true,
    events: true
  });
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (!map.project_id) return;
    EntityUseCase.getAllByProject(map.project_id).then(entities => {
      setAvailableEntities(entities.filter(e => e.tipo !== 'Map' && e.tipo !== 'Mapa'));
    });
  }, [map.project_id]);

  const mapAttributes = useMemo<MapAttributes>(() => {
    try {
      return typeof map?.contenido_json === 'string'
        ? JSON.parse(map.contenido_json)
        : (map?.contenido_json as unknown as MapAttributes) || {};
    } catch {
      return {} as MapAttributes;
    }
  }, [map.contenido_json]);

  const markers = useMemo<MapMarker[]>(() => {
    const rawMarkers = mapAttributes.markers || [];
    return rawMarkers.filter(m => {
        if (!atlasFilters.cities && (m.label?.includes('Ciudad') || Number(m.id) % 3 === 0)) return false;
        if (!atlasFilters.ruins && (m.label?.includes('Ruinas') || Number(m.id) % 5 === 0)) return false;
        return true;
    });
  }, [mapAttributes.markers, atlasFilters]);

  const layers = useMemo<MapLayer[]>(() => mapAttributes.layers || [], [mapAttributes]);
  const connections = useMemo<MapConnection[]>(() => mapAttributes.connections || [], [mapAttributes]);
  const features = useMemo(() => mapAttributes.features as any, [mapAttributes]);
  const imageWidth = useMemo(() => (mapAttributes.imageWidth as number) || 1920, [mapAttributes]);
  const imageHeight = useMemo(() => (mapAttributes.imageHeight as number) || 1080, [mapAttributes]);
  const is3D = useMemo(() => !!mapAttributes.is3D, [mapAttributes]);

  const mapImage = useMemo(() => {
    const img = (mapAttributes.bgImage || mapAttributes.snapshotUrl || null) as string | null;
    if (img && (
      img.toLowerCase().includes('duckdns') ||
      img.toLowerCase().includes('nopreview') ||
      img === 'placeholder-map.png'
    )) return null;
    return img;
  }, [mapAttributes]);

  const handleMarkerClick = useCallback((marker: MapMarker) => {
    setSelectedMarker(marker);
    openPanel('bulk', Number(marker.id), marker.label || 'Marcador');
  }, [openPanel]);

  return {
    projectName,
    navigate,
    selectedMarker,
    setSelectedMarker,
    availableEntities,
    atlasFilters,
    setAtlasFilters,
    searchQuery,
    setSearchQuery,
    mapAttributes,
    markers,
    layers,
    connections,
    features,
    imageWidth,
    imageHeight,
    is3D,
    mapImage,
    handleMarkerClick,
    setCustomContent
  };
};
