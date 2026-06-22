import { useState, useEffect, useCallback } from "react";
import { useParams } from "react-router-dom";
import { MapUseCase } from "@features/Maps";
import { MapMarker, AtlasLevel, AtlasAttributes, MapLayer, MapConnection } from "@domain/maps";
import { Entidad } from "@domain/database";
import { useMapStore } from "../../Maps/store/useMapStore";

const INITIAL_VIEW_STATE = { longitude: 0, latitude: 0, zoom: 1 };

export const useInteractiveMapView = (initialMap?: Entidad) => {
  const { entityId, mapId, projectId } = useParams();
  const targetId = entityId || mapId || initialMap?.id;
  
  const {
    mapEntity,
    markers,
    features,
    levels,
    activeLevelId,
    levelBgImages,
    levelSpacing,
    is3D,
    gridMode,
    viewState,
    loadMap,
    updateCache,
  } = useMapStore();
  
  const [overlayAllLayers, setOverlayAllLayers] = useState<boolean>(true);
  const [mapBgColor, setMapBgColor] = useState("hsl(var(--background))");
  
  const [selectedMarkerId, setSelectedMarkerId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  
  // Dummy setters to maintain interface compatibility with InteractiveMapView
  const setViewState = (state: any) => updateCache({ viewState: typeof state === "function" ? state(viewState) : state });
  const setActiveLevelId = (id: string) => updateCache({ activeLevelId: id });
  const setIs3D = (v: boolean) => updateCache({ is3D: v });

  useEffect(() => {
    if (targetId) {
      loadMap(targetId, Number(projectId));
    }
  }, [targetId, projectId, loadMap]);

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
    layers: [],
    connections: [],
    features,
    setFeatures: (f: any) => updateCache({ features: typeof f === "function" ? f(features) : f }),
    levels,
    setLevels: (l: any) => updateCache({ levels: typeof l === "function" ? l(levels) : l }),
    activeLevelId,
    setActiveLevelId,
    levelBgImages,
    setLevelBgImages: (bg: any) => updateCache({ levelBgImages: typeof bg === "function" ? bg(levelBgImages) : bg }),
    levelSpacing,
    setLevelSpacing: (s: any) => updateCache({ levelSpacing: typeof s === "function" ? s(levelSpacing) : s }),
    overlayAllLayers,
    setOverlayAllLayers,
    is3D,
    setIs3D,
    gridMode,
    mapBgColor,
    setMapBgColor,
    viewState,
    setViewState,
    loadMap: () => loadMap(targetId as string, Number(projectId)),
    selectedMarkerId,
    setSelectedMarkerId,
    searchQuery,
    setSearchQuery,
  };
};
