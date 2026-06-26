import { create } from "zustand";
import { Entidad } from "@domain/database";
import { MapMarker, GeoFeatureCollection, AtlasLevel, AtlasAttributes } from "../domain/maps";
import { ViewState } from "react-map-gl/maplibre";
import { MapUseCase } from "../application/MapUseCase";

interface MapState {
  activeMapId: number | null;
  mapEntity: Entidad | null;
  
  markers: MapMarker[];
  features: GeoFeatureCollection;
  levels: AtlasLevel[];
  levelBgImages: Record<string, string>;
  
  activeLevelId: string;
  levelSpacing: number;
  is3D: boolean;
  gridMode: "none" | "square" | "isometric" | "dots";
  viewState: Partial<ViewState>;
  mode: "2d" | "3d";
  
  isSaving: boolean;
  hasUnsavedChanges: boolean;

  loadMap: (idOrSlug: string | number, projectId: number) => Promise<void>;
  updateCache: (partialData: Partial<Omit<MapState, "loadMap" | "updateCache" | "saveToSql" | "clearCache" | "isSaving" | "hasUnsavedChanges">>) => void;
  saveToSql: () => Promise<void>;
  clearCache: () => void;
}

let saveTimeout: NodeJS.Timeout | null = null;

export const useMapStore = create<MapState>((set, get) => ({
  activeMapId: null,
  mapEntity: null,
  
  markers: [],
  features: { type: "FeatureCollection", features: [] },
  levels: [],
  levelBgImages: {},
  
  activeLevelId: "l0",
  levelSpacing: 100,
  is3D: false,
  gridMode: "none",
  viewState: { longitude: 0, latitude: 0, zoom: 1 },
  mode: "2d",
  
  isSaving: false,
  hasUnsavedChanges: false,

  loadMap: async (idOrSlug: string | number, projectId: number) => {
    // Siempre re-cargar desde SQL para garantizar consistencia entre vista y edición
    const entity = await MapUseCase.getMapByIdOrSlug(idOrSlug, projectId);
    if (!entity) return;

    try {
      const content = JSON.parse(entity.contenido_json || "{}");
      const markers = content.markers || [];
      const features = content.features || { type: "FeatureCollection", features: [] };
      const levels = content.levels || [{ id: "l0", name: "Nivel Principal", z_index: 0 }];
      const levelBgImages = content.levelBgImages || {};
      const attrs = (content.attributes || {}) as AtlasAttributes;

      set({
        activeMapId: entity.id,
        mapEntity: entity,
        markers,
        features,
        levels,
        levelBgImages,
        activeLevelId: (attrs.activeLevelId === "main" || !attrs.activeLevelId) ? "l0" : attrs.activeLevelId,
        levelSpacing: attrs.levelSpacing ?? 100,
        is3D: !!attrs.is3D,
        gridMode: attrs.gridMode || "none",
        viewState: attrs.mapSettings
          ? {
              longitude: attrs.mapSettings.center[0],
              latitude: attrs.mapSettings.center[1],
              zoom: attrs.mapSettings.zoom,
            }
          : { longitude: 0, latitude: 0, zoom: 1 },
        hasUnsavedChanges: false,
      });
    } catch (e) {
      console.error("Error parsing map JSON", e);
    }
  },

  updateCache: (partialData) => {
    set((state) => ({ ...state, ...partialData, hasUnsavedChanges: true }));
    
    // Auto-save debounce
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = setTimeout(() => {
        get().saveToSql();
    }, 3000);
  },

  saveToSql: async () => {
    const { mapEntity, markers, features, levels, levelBgImages, activeLevelId, levelSpacing, is3D, gridMode, viewState, hasUnsavedChanges } = get();
    if (!mapEntity || !hasUnsavedChanges) return;

    set({ isSaving: true });
    
    try {
      const updatedContent = {
        markers,
        features,
        levels,
        levelBgImages,
        attributes: {
          activeLevelId,
          levelSpacing,
          is3D,
          gridMode,
          mapSettings: {
            zoom: viewState.zoom,
            center: [viewState.longitude, viewState.latitude],
          },
        },
      };

      await MapUseCase.updateMap(mapEntity.id, {
        contenido_json: JSON.stringify(updatedContent),
      });
      set({ hasUnsavedChanges: false });
    } catch (error) {
      console.error("Failed to auto-save map to SQL", error);
    } finally {
      set({ isSaving: false });
    }
  },

  clearCache: () => {
    if (saveTimeout) clearTimeout(saveTimeout);
    saveTimeout = null;
    
    set({
      activeMapId: null,
      mapEntity: null,
      markers: [],
      features: { type: "FeatureCollection", features: [] },
      levels: [],
      levelBgImages: {},
      activeLevelId: "l0",
      levelSpacing: 100,
      is3D: false,
      gridMode: "none",
      viewState: { longitude: 0, latitude: 0, zoom: 1 },
      mode: "2d",
      hasUnsavedChanges: false,
      isSaving: false,
    });
  }
}));
