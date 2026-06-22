import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { PickingInfo } from "@deck.gl/core";
import {
  ScatterplotLayer,
  TextLayer,
  PathLayer,
  GeoJsonLayer,
  BitmapLayer,
} from "@deck.gl/layers";
import { MapLayer, MapMarker, MapConnection, AtlasLevel } from "@domain/maps";
import { getThemePrimaryRgb } from "@infrastructure/utils/themeColor";

type ConnectionPath = {
  path: [number, number, number][];
  color: [number, number, number];
  width: number;
};

interface GeoFeatureCollection {
  type: string;
  features: Array<{
    properties?: Record<string, unknown>;
    geometry: { type: string; coordinates: unknown };
  }>;
}

/**
 * 🧠 useMapLibreView
 * Encapsulates the complex MapLibre + Deck.gl integration logic for Multilevel 3D Stack maps.
 */
export const useMapLibreView = (
  mapContainer: React.RefObject<HTMLDivElement | null>,
  {
    mapImage,
    markers,
    layers,
    connections,
    features,
    onMarkerClick,
    onMapClick,
    onMapMouseDown,
    onMapMouseMove,
    onMapMouseUp,
    is3D = false,
    levels = [],
    levelBgImages = {},
    activeLevelId = "",
    levelSpacing = 100,
    overlayAllLayers = false,
    gridMode = "none",
  }: {
    mapImage: string | null;
    markers: MapMarker[];
    layers: MapLayer[];
    connections: MapConnection[];
    features?: GeoFeatureCollection;
    onMarkerClick: (marker: MapMarker) => void;
    onMapClick?: (lng: number, lat: number) => void;
    onMapMouseDown?: (lng: number, lat: number) => void;
    onMapMouseMove?: (lng: number, lat: number) => void;
    onMapMouseUp?: () => void;
    is3D?: boolean;
    levels?: AtlasLevel[];
    levelBgImages?: Record<string, string | null>;
    activeLevelId?: string;
    levelSpacing?: number;
    overlayAllLayers?: boolean;
    gridMode?: "none" | "square" | "isometric" | "dots";
  },
) => {
  const map = useRef<maplibregl.Map | null>(null);
  const deckOverlay = useRef<MapboxOverlay | null>(null);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;
  const onMapClickRef = useRef(onMapClick);
  onMapClickRef.current = onMapClick;
  const onMapMouseDownRef = useRef(onMapMouseDown);
  onMapMouseDownRef.current = onMapMouseDown;
  const onMapMouseMoveRef = useRef(onMapMouseMove);
  onMapMouseMoveRef.current = onMapMouseMove;
  const onMapMouseUpRef = useRef(onMapMouseUp);
  onMapMouseUpRef.current = onMapMouseUp;

  const hexToRgb = (hex: string): [number, number, number] => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16),
        ]
      : getThemePrimaryRgb();
  };

  const buildDeckLayers = useCallback(
    (
      currentMarkers: MapMarker[],
      currentConnections: MapConnection[],
      currentFeatures: GeoFeatureCollection | undefined,
      currentLayers: MapLayer[],
      currentLevels: AtlasLevel[],
      currentActiveLevelId: string,
      currentBgImages: Record<string, string | null>,
      currentIs3D: boolean,
      currentSpacing: number,
      currentOverlayAllLayers: boolean,
      currentGridMode: "none" | "square" | "isometric" | "dots",
    ) => {
      const primaryRgb = getThemePrimaryRgb();
      const deckLayers: unknown[] = [];

      const getLevelZ = (levelId?: string | null): number => {
        if (!currentIs3D) return 0;
        if (!levelId) return 0;
        const level = currentLevels.find((l) => l.id === levelId);
        const zIndex = level?.z_index ?? currentLevels.findIndex((l) => l.id === levelId);
        const validZIndex = zIndex === -1 ? 0 : zIndex;
        return validZIndex * currentSpacing;
      };

      const isLevelVisible = (levelId?: string | null): boolean => {
        if (currentIs3D) return true;
        if (!levelId) return true;
        return levelId === currentActiveLevelId || currentOverlayAllLayers;
      };

      const getLevelOpacity = (levelId?: string | null): number => {
        if (currentIs3D) return 1;
        if (!levelId) return 1;
        return levelId === currentActiveLevelId ? 1 : (currentOverlayAllLayers ? 0.3 : 0);
      };

      // 1. Fondos de Nivel (BitmapLayers)
      const renderLevels = currentLevels.length > 0 ? currentLevels : [{ id: currentActiveLevelId || "l0", name: "Default" }];
      
      renderLevels.forEach((level) => {
        if (!isLevelVisible(level.id)) return;
        const imgUrl = currentBgImages[level.id] || (level.id === (currentActiveLevelId || "l0") ? mapImage : null);
        if (!imgUrl) return;

        const z = getLevelZ(level.id);
        const opacity = getLevelOpacity(level.id);

        deckLayers.push(
          new BitmapLayer({
            id: `deck-bitmap-${level.id}`,
            image: imgUrl,
            bounds: [
              [-180, -85.0511, z],
              [-180, 85.0511, z],
              [180, 85.0511, z],
              [180, -85.0511, z]
            ],
            opacity: opacity,
            pickable: false,
          })
        );
      });

      // 1.5 Rejilla de Referencia (Grid Overlay)
      if (currentGridMode !== "none") {
        const gridZ = getLevelZ(currentActiveLevelId) + 1; // Just above background
        const gridOpacity = 0.15;
        const gridColor: [number, number, number, number] = [255, 255, 255, Math.round(gridOpacity * 255)];
        const spacing = 2; // Degrees spacing

        if (currentGridMode === "square" || currentGridMode === "isometric") {
          const gridLines: { path: [number, number, number][]; color: [number, number, number, number] }[] = [];
          
          if (currentGridMode === "square") {
             for(let x = -180; x <= 180; x += spacing) {
                gridLines.push({ path: [[x, -85, gridZ], [x, 85, gridZ]], color: gridColor });
             }
             for(let y = -85; y <= 85; y += spacing) {
                gridLines.push({ path: [[-180, y, gridZ], [180, y, gridZ]], color: gridColor });
             }
          } else if (currentGridMode === "isometric") {
             for(let x = -360; x <= 360; x += spacing * 2) {
                gridLines.push({ path: [[x, -85, gridZ], [x + 170, 85, gridZ]], color: gridColor });
                gridLines.push({ path: [[x, -85, gridZ], [x - 170, 85, gridZ]], color: gridColor });
             }
          }
          
          deckLayers.push(
            new PathLayer({
              id: "deck-grid-lines",
              data: gridLines,
              getPath: (d) => d.path,
              getColor: (d) => d.color,
              getWidth: 1,
              widthUnits: "pixels",
              pickable: false,
            })
          );
        } else if (currentGridMode === "dots") {
          const dots: { pos: [number, number, number] }[] = [];
          for(let x = -180; x <= 180; x += spacing) {
             for(let y = -85; y <= 85; y += spacing) {
                dots.push({ pos: [x, y, gridZ] });
             }
          }
          deckLayers.push(
            new (ScatterplotLayer as any)({
              id: "deck-grid-dots",
              data: dots,
              getPosition: (d: any) => d.pos,
              getRadius: 2,
              radiusUnits: "pixels",
              getFillColor: gridColor,
              pickable: false,
            })
          );
        }
      }

      // 2. Conexiones Interdimensionales / Portales (PathLayer)
      const connPaths: ConnectionPath[] = currentConnections
        .map((conn) => {
          const src = currentMarkers.find((m) => m.id === conn.sourceId);
          const tgt = currentMarkers.find((m) => m.id === conn.targetId);
          if (!src || !tgt) return null;
          return {
            path: [
              [src.lng || 0, src.lat || 0, getLevelZ(src.layerId)] as [number, number, number],
              [tgt.lng || 0, tgt.lat || 0, getLevelZ(tgt.layerId)] as [number, number, number],
            ],
            color: hexToRgb(conn.color || "") as [number, number, number],
            width: conn.weight || 2,
          };
        })
        .filter((path): path is ConnectionPath => path !== null);

      // Conexiones automáticas de portales
      currentMarkers.filter((m) => m.type === "portal" && m.targetLevelId).forEach((portal) => {
        connPaths.push({
          path: [
            [portal.lng || 0, portal.lat || 0, getLevelZ(portal.layerId)] as [number, number, number],
            [portal.lng || 0, portal.lat || 0, getLevelZ(portal.targetLevelId)] as [number, number, number],
          ],
          color: [255, 150, 0], // Naranja para portales
          width: 4,
        });
      });

      if (connPaths.length > 0) {
        deckLayers.push(
          new PathLayer({
            id: "deck-connections",
            data: connPaths,
            getPath: (d) => d.path,
            getColor: (d) => d.color,
            getWidth: (d) => d.width,
            widthUnits: "pixels",
            rounded: true,
            pickable: false,
          })
        );
      }

      // 3. Dibujos Vectoriales GeoJSON
      if (currentFeatures?.features?.length) {
        const visibleFeatures = currentFeatures.features.filter(f => {
          const levelId = (f.properties?.levelId || f.properties?.layerId) as string | undefined;
          return isLevelVisible(levelId);
        });

        const projectedFeatures = visibleFeatures.map(f => {
          const levelId = (f.properties?.levelId || f.properties?.layerId) as string | undefined;
          const z = getLevelZ(levelId);
          
          const injectZ = (coords: unknown): unknown => {
            if (Array.isArray(coords) && typeof coords[0] === 'number') {
              return [coords[0], coords[1], z];
            }
            if (Array.isArray(coords)) {
              return coords.map(injectZ);
            }
            return coords;
          };

          return {
            ...f,
            geometry: {
              ...f.geometry,
              coordinates: injectZ(f.geometry.coordinates)
            }
          };
        });

        if (projectedFeatures.length > 0) {
          const geojsonData: GeoFeatureCollection = {
            type: "FeatureCollection",
            features: projectedFeatures,
          };

          deckLayers.push(
            new GeoJsonLayer({
              id: `deck-geojson-drawings`,
              data: geojsonData as any,
              getLineColor: (f: unknown) => {
                const feat = f as { properties?: Record<string, unknown> };
                const c = typeof feat.properties?.color === 'string' ? hexToRgb(feat.properties.color) : primaryRgb;
                const lId = (feat.properties?.levelId || feat.properties?.layerId) as string | undefined;
                return [c[0], c[1], c[2], Math.round(getLevelOpacity(lId) * 255)] as [number, number, number, number];
              },
              getFillColor: (f: unknown) => {
                const feat = f as { properties?: Record<string, unknown> };
                const c = typeof feat.properties?.color === 'string' ? hexToRgb(feat.properties.color) : primaryRgb;
                const lId = (feat.properties?.levelId || feat.properties?.layerId) as string | undefined;
                return [c[0], c[1], c[2], Math.round(getLevelOpacity(lId) * 180)] as [number, number, number, number];
              },
              getPointRadius: (f: unknown) => {
                const feat = f as { properties?: Record<string, unknown> };
                return feat.properties?.type === 'spray' ? (typeof feat.properties?.width === 'number' ? feat.properties.width / 2 : 6) : 3;
              },
              pointRadiusUnits: "pixels",
              getLineWidth: (f: unknown) => {
                const feat = f as { properties?: Record<string, unknown> };
                return typeof feat.properties?.width === 'number' ? feat.properties.width : 3;
              },
              lineWidthUnits: "pixels",
              lineJointRounded: true,
              lineCapRounded: true,
              pickable: false,
            })
          );
        }
      }

      // 4. Marcadores / POIs
      const visibleMarkers = currentMarkers.filter((m) => isLevelVisible(m.layerId));
      if (visibleMarkers.length > 0) {
        deckLayers.push(
          new ScatterplotLayer({
            id: "deck-markers-bg",
            data: visibleMarkers,
            getPosition: (d: MapMarker) => [d.lng || 0, d.lat || 0, getLevelZ(d.layerId)],
            getRadius: 12,
            radiusUnits: "pixels",
            getFillColor: (d: MapMarker) => [15, 15, 20, Math.round(160 * getLevelOpacity(d.layerId))],
            getLineColor: (d: MapMarker) => {
              const color = d.type === 'portal' ? [255, 150, 0] : primaryRgb;
              return [color[0], color[1], color[2], Math.round(220 * getLevelOpacity(d.layerId))] as [number, number, number, number];
            },
            lineWidthMinPixels: 2,
            stroked: true,
            filled: true,
            pickable: false,
          })
        );

        deckLayers.push(
          new (ScatterplotLayer as any)({
            id: "deck-markers-dot",
            data: visibleMarkers,
            getPosition: (d: MapMarker) => [d.lng || 0, d.lat || 0, getLevelZ(d.layerId)],
            getRadius: 4,
            radiusUnits: "pixels",
            getFillColor: (d: MapMarker) => [255, 255, 255, Math.round(240 * getLevelOpacity(d.layerId))],
            pickable: true,
            autoHighlight: true,
            highlightColor: [...primaryRgb, 255],
            onClick: (info: any) => {
              if (info.object) onMarkerClickRef.current(info.object);
            },
          })
        );

        deckLayers.push(
          new (TextLayer as any)({
            id: "deck-marker-labels",
            data: visibleMarkers.filter((m) => m.label),
            getPosition: (d: MapMarker) => [d.lng || 0, d.lat || 0, getLevelZ(d.layerId)],
            getText: (d: MapMarker) => d.label || "",
            getSize: 11,
            getColor: (d: MapMarker) => [240, 240, 255, Math.round(220 * getLevelOpacity(d.layerId))],
            getPixelOffset: [0, -20],
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            background: true,
            getBackgroundColor: (d: MapMarker) => [15, 15, 25, Math.round(180 * getLevelOpacity(d.layerId))],
            backgroundPadding: [4, 2, 4, 2],
            pickable: false,
          })
        );
      }

      return deckLayers;
    },
    [],
  );

  useEffect(() => {
    if (!mapContainer.current) return;

    const mapInstance = new maplibregl.Map({
      container: mapContainer.current!,
      style: {
        version: 8,
        sources: {},
        layers: [], // Delegamos todo el dibujado a Deck.gl
      },
      center: [0, 0],
      zoom: 1,
      maxZoom: 7,
      minZoom: -2,
      maxBounds: [[-179.9, -85], [179.9, 85]],
      renderWorldCopies: false,
      pitchWithRotate: is3D,
      dragRotate: is3D,
      touchPitch: is3D,
      
      attributionControl: false,
    });

    map.current = mapInstance;

    const overlay = new (MapboxOverlay as any)({
      interleaved: false,
      layers: [],
    });
    deckOverlay.current = overlay;
    mapInstance.addControl(overlay as unknown as maplibregl.IControl);
    mapInstance.addControl(new maplibregl.NavigationControl({
        visualizePitch: is3D,
        showZoom: true,
        showCompass: is3D
    }), "bottom-right");

    mapInstance.on("click", (e) => {
      const handler = onMapClickRef.current;
      if (handler) {
        handler(e.lngLat.lng, e.lngLat.lat);
      }
    });

    mapInstance.on("mousedown", (e) => {
      const handler = onMapMouseDownRef.current;
      if (handler) {
        handler(e.lngLat.lng, e.lngLat.lat);
      }
    });

    mapInstance.on("mousemove", (e) => {
      const handler = onMapMouseMoveRef.current;
      if (handler) {
        handler(e.lngLat.lng, e.lngLat.lat);
      }
    });

    mapInstance.on("mouseup", () => {
      const handler = onMapMouseUpRef.current;
      if (handler) {
        handler();
      }
    });

    return () => {
      overlay.finalize();
      mapInstance.remove();
    };
  }, [is3D]);

  useEffect(() => {
    if (!deckOverlay.current) return;
    const newLayers = buildDeckLayers(
      markers,
      connections,
      features,
      layers,
      levels,
      activeLevelId,
      levelBgImages,
      is3D,
      levelSpacing,
      overlayAllLayers,
      gridMode
    );
    deckOverlay.current.setProps({ layers: newLayers as Parameters<typeof deckOverlay.current.setProps>[0]["layers"] });
  }, [
    markers,
    connections,
    features,
    layers,
    levels,
    activeLevelId,
    levelBgImages,
    is3D,
    levelSpacing,
    overlayAllLayers,
    gridMode,
    buildDeckLayers,
  ]);

  return {
    map,
  };
};

