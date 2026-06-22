import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { MapUseCase } from "@features/Maps";
import { MapMarker, AtlasLevel, AtlasAttributes, MapLayer, MapConnection } from "@domain/maps";
import { Entidad } from "@domain/database";

const INITIAL_VIEW_STATE = { longitude: 0, latitude: 0, zoom: 1 };

export const useInteractiveMapView = (initialMap?: Entidad) => {
  const { entityId, mapId, projectId } = useParams();
  const targetId = entityId || mapId || initialMap?.id;
  
  const [mapEntity, setMapEntity] = useState<Entidad | null>(initialMap || null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [layers, setLayers] = useState<MapLayer[]>([]);
  const [connections, setConnections] = useState<MapConnection[]>([]);
  const [features, setFeatures] = useState<{ type: string; features: any[] }>({ type: "FeatureCollection", features: [] });
  
  // Multilevel States
  const [levels, setLevels] = useState<AtlasLevel[]>([]);
  const [activeLevelId, setActiveLevelId] = useState<string>("l0");
  const [levelBgImages, setLevelBgImages] = useState<Record<string, string | null>>({});
  const [levelSpacing, setLevelSpacing] = useState<number>(100);
  const [overlayAllLayers, setOverlayAllLayers] = useState<boolean>(true);
  
  const [is3D, setIs3D] = useState(false);
  const [mapBgColor, setMapBgColor] = useState("hsl(var(--background))");
  const [viewState, setViewState] = useState(INITIAL_VIEW_STATE);
  
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const loadMap = useCallback(async () => {
    let entity = initialMap;
    if (!entity && targetId) {
      try {
        const fetched = await MapUseCase.getMapByIdOrSlug(targetId, Number(projectId));
        if (fetched) entity = fetched;
      } catch {}
    }
    if (!entity) return;
    setMapEntity(entity);
      
      const attrs: AtlasAttributes = typeof entity.contenido_json === "string" 
        ? JSON.parse(entity.contenido_json) 
        : entity.contenido_json || {};
        
      setMarkers(attrs.markers || []);
      setFeatures((attrs.features as { type: string; features: any[] }) || { type: "FeatureCollection", features: [] });
      setLayers((attrs.layers as MapLayer[]) || []);
      setConnections((attrs.connections as MapConnection[]) || []);
      
      setLevels((attrs.levels as AtlasLevel[]) || [{ id: 'l0', name: 'Nivel Principal', z_index: 0 }]);
      setActiveLevelId((attrs.activeLevelId as string) || "l0");
      setLevelBgImages((attrs.levelBgImages as Record<string, string | null>) || (attrs.bgImage ? { "l0": attrs.bgImage as string } : {}));
      setLevelSpacing(attrs.levelSpacing ?? 100);
      setIs3D(!!attrs.is3D);
      
      if (attrs.mapSettings) {
        setViewState((prev) => ({
          ...prev,
          zoom: attrs.mapSettings?.zoom ?? 1,
          longitude: attrs.mapSettings?.center?.[0] ?? 0,
          latitude: attrs.mapSettings?.center?.[1] ?? 0,
        }));
      }
  }, [targetId, projectId, initialMap]);

  useEffect(() => {
    loadMap();
  }, [loadMap]);

  useEffect(() => {
    const updateBg = () => {
      const bgVar = getComputedStyle(document.body).getPropertyValue("--background").trim();
      if (bgVar) setMapBgColor(`hsl(${bgVar})`);
    };
    updateBg();
    const observer = new MutationObserver(updateBg);
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return {
    mapEntity,
    markers,
    layers,
    connections,
    features,
    levels,
    activeLevelId,
    setActiveLevelId,
    levelBgImages,
    levelSpacing,
    overlayAllLayers,
    setOverlayAllLayers,
    is3D,
    setIs3D,
    mapBgColor,
    viewState,
    setViewState,
    selectedMarkerId,
    setSelectedMarkerId,
    searchQuery,
    setSearchQuery
  };
};
