import { useEffect, useRef, useCallback, useState, useMemo } from "react";
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

type GeoFeature = {
  id?: string | number;
  type: "Feature";
  geometry: { type: string; coordinates: unknown };
  properties?: Record<string, unknown>;
};

interface GeoFeatureCollection {
  type: string;
  features: GeoFeature[];
}

export const GRID_SPACING = 1; // Degrees spacing
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
    levelOpacities = {},
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
    levelOpacities?: Record<string, number>;
  },
) => {
  const [zoom, setZoom] = useState(1);
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

  const getLevelZ = useCallback(
    (levelId?: string | null): number =>
      is3D
        ? (() => {
            const normId = !levelId || levelId === "main" ? "l0" : levelId;
            const level = levels.find((l) => l.id === normId);
            const zIndex = level?.z_index ?? levels.findIndex((l) => l.id === normId);
            const validZIndex = zIndex === -1 ? 0 : zIndex;
            return validZIndex * levelSpacing;
          })()
        : 0,
    [is3D, levels, levelSpacing]
  );

  const projectedFeatures = useMemo(
    (): GeoFeature[] =>
      features?.features?.length
        ? features.features.map((f: GeoFeature) => {
            const levelId = (f.properties?.levelId || f.properties?.layerId) as string | undefined;
            const z = getLevelZ(levelId);

            const injectZ = (coords: unknown): unknown =>
              Array.isArray(coords)
                ? typeof coords[0] === "number"
                  ? [coords[0], coords[1], z]
                  : coords.map(injectZ)
                : coords;

            return {
              ...f,
              geometry: {
                ...f.geometry,
                coordinates: injectZ(f.geometry.coordinates),
              },
            };
          })
        : [],
    [features, getLevelZ]
  );

  const visibleFeatures = useMemo(
    (): GeoFeature[] => {
      const isLevelVisible = (levelId?: string | null): boolean =>
        is3D
          ? true
          : (() => {
              const normId = !levelId || levelId === "main" ? "l0" : levelId;
              return normId === activeLevelId || overlayAllLayers;
            })();

      return projectedFeatures.filter((f: GeoFeature) => {
        const levelId = (f.properties?.levelId || f.properties?.layerId) as string | undefined;
        return isLevelVisible(levelId);
      });
    },
    [projectedFeatures, is3D, activeLevelId, overlayAllLayers]
  );

  const buildDeckLayers = useCallback(
    (
      currentMarkers: MapMarker[],
      currentConnections: MapConnection[],
      currentVisibleFeatures: GeoFeature[],
      currentLayers: MapLayer[],
      currentLevels: AtlasLevel[],
      currentActiveLevelId: string,
      currentBgImages: Record<string, string | null>,
      currentIs3D: boolean,
      currentSpacing: number,
      currentOverlayAllLayers: boolean,
      currentGridMode: "none" | "square" | "isometric" | "dots",
      currentLevelOpacities: Record<string, number>,
      currentZoom: number,
    ) => {
      const primaryRgb = getThemePrimaryRgb();
      const deckLayers: unknown[] = [];

      const getLevelZ = (levelId?: string | null): number =>
        currentIs3D
          ? (() => {
              const normId = !levelId || levelId === "main" ? "l0" : levelId;
              const level = currentLevels.find((l) => l.id === normId);
              const zIndex = level?.z_index ?? currentLevels.findIndex((l) => l.id === normId);
              const validZIndex = zIndex === -1 ? 0 : zIndex;
              return validZIndex * currentSpacing;
            })()
          : 0;

      const isLevelVisible = (levelId?: string | null): boolean =>
        currentIs3D
          ? true
          : (() => {
              const normId = !levelId || levelId === "main" ? "l0" : levelId;
              return normId === currentActiveLevelId || currentOverlayAllLayers;
            })();

      const getLevelOpacity = (levelId?: string | null): number =>
        currentIs3D
          ? 1
          : (() => {
              const normId = !levelId || levelId === "main" ? "l0" : levelId;
              const baseOpacity = currentLevelOpacities[normId] !== undefined
                ? currentLevelOpacities[normId]
                : 1;
              return normId === currentActiveLevelId ? baseOpacity : (currentOverlayAllLayers ? baseOpacity * 0.3 : 0);
            })();

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
        const gridOpacity = 0.6;
        const gridColor: [number, number, number, number] = [0, 255, 255, Math.round(gridOpacity * 255)];

        const step = GRID_SPACING * Math.PI / 180;
        const mercatorToLat = (mercY: number) => (Math.atan(Math.exp(mercY)) - Math.PI / 4) * 2 * 180 / Math.PI;
        const mercatorToLng = (mercX: number) => mercX * 180 / Math.PI;

        if (currentGridMode === "square" || currentGridMode === "isometric") {
          const gridLines: { path: [number, number, number][]; color: [number, number, number, number] }[] = [];
          
          if (currentGridMode === "square") {
             for(let x = -Math.PI; x <= Math.PI; x += step) {
                const lng = mercatorToLng(x);
                gridLines.push({ path: [[lng, -85.0511, gridZ], [lng, 85.0511, gridZ]], color: gridColor });
             }
             for(let y = -Math.PI; y <= Math.PI; y += step) {
                const lat = mercatorToLat(y);
                gridLines.push({ path: [[-180, lat, gridZ], [180, lat, gridZ]], color: gridColor });
             }
          } else if (currentGridMode === "isometric") {
             for (let x0 = -2 * Math.PI; x0 <= 2 * Math.PI; x0 += step * 2) {
                // Line 1: slope 1
                let x1 = x0 - Math.PI, y1 = -Math.PI, x2 = x0 + Math.PI, y2 = Math.PI;
                if (x1 < -Math.PI) { y1 += (-Math.PI - x1); x1 = -Math.PI; }
                if (x2 > Math.PI) { y2 += (Math.PI - x2); x2 = Math.PI; }
                if (x1 <= Math.PI && x2 >= -Math.PI) {
                  gridLines.push({ path: [[mercatorToLng(x1), mercatorToLat(y1), gridZ], [mercatorToLng(x2), mercatorToLat(y2), gridZ]], color: gridColor });
                }

                // Line 2: slope -1
                x1 = x0 + Math.PI; y1 = -Math.PI; x2 = x0 - Math.PI; y2 = Math.PI;
                if (x1 > Math.PI) { y1 -= (Math.PI - x1); x1 = Math.PI; }
                if (x2 < -Math.PI) { y2 -= (-Math.PI - x2); x2 = -Math.PI; }
                if (x1 >= -Math.PI && x2 <= Math.PI) {
                  gridLines.push({ path: [[mercatorToLng(x1), mercatorToLat(y1), gridZ], [mercatorToLng(x2), mercatorToLat(y2), gridZ]], color: gridColor });
                }
             }
          }
          
          deckLayers.push(
            new PathLayer({
              id: "deck-grid-lines",
              data: gridLines,
              getPath: (d) => d.path,
              getColor: (d) => d.color,
              getWidth: 2,
              widthUnits: "pixels",
              pickable: false,
              parameters: { depthTest: false },
            })
          );
        } else if (currentGridMode === "dots") {
          const dots: { pos: [number, number, number] }[] = [];
          for(let x = -Math.PI; x <= Math.PI; x += step) {
             for(let y = -Math.PI; y <= Math.PI; y += step) {
                dots.push({ pos: [mercatorToLng(x), mercatorToLat(y), gridZ] });
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
              parameters: { depthTest: false },
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
      if (currentVisibleFeatures.length > 0) {
        deckLayers.push(
          new GeoJsonLayer({
            id: `deck-geojson-drawings`,
            data: currentVisibleFeatures as any,
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
              const isFill = feat.properties?.type === 'fill';
              const opacityFactor = isFill ? 90 : 120;
              return [c[0], c[1], c[2], Math.round(getLevelOpacity(lId) * opacityFactor)] as [number, number, number, number];
            },
            getPointRadius: (f: unknown) => {
              const feat = f as { properties?: Record<string, unknown> };
              const baseRadius = feat.properties?.type === 'spray' ? (typeof feat.properties?.width === 'number' ? feat.properties.width / 2 : 6) : 3;
              const scaleFactor = currentZoom < 1 ? Math.pow(2, currentZoom - 1) : 1;
              return Math.max(1, baseRadius * scaleFactor);
            },
            pointRadiusUnits: "pixels",
            getLineWidth: (f: unknown) => {
              const feat = f as { properties?: Record<string, unknown> };
              const baseWidth = typeof feat.properties?.width === 'number' ? feat.properties.width : 3;
              const isFill = feat.properties?.type === 'fill';
              const width = isFill ? 0 : baseWidth;
              const scaleFactor = currentZoom < 1 ? Math.pow(2, currentZoom - 1) : 1;
              return Math.max(0.5, width * scaleFactor);
            },
            lineWidthUnits: "pixels",
            lineJointRounded: true,
            lineCapRounded: true,
            pickable: false,
            updateTriggers: {
              getLineColor: [currentActiveLevelId, currentOverlayAllLayers, currentLevelOpacities],
              getFillColor: [currentActiveLevelId, currentOverlayAllLayers, currentLevelOpacities],
              getPointRadius: [currentZoom],
              getLineWidth: [currentZoom]
            },
          })
        );
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
            updateTriggers: {
              getFillColor: [currentActiveLevelId, currentOverlayAllLayers, currentLevelOpacities],
              getLineColor: [currentActiveLevelId, currentOverlayAllLayers, currentLevelOpacities],
            },
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
            updateTriggers: {
              getFillColor: [currentActiveLevelId, currentOverlayAllLayers, currentLevelOpacities],
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
            updateTriggers: {
              getColor: [currentActiveLevelId, currentOverlayAllLayers, currentLevelOpacities],
              getBackgroundColor: [currentActiveLevelId, currentOverlayAllLayers, currentLevelOpacities],
            },
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
      minZoom: 0,
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

    mapInstance.on("zoom", () => {
      setZoom(mapInstance.getZoom());
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
      visibleFeatures,
      layers,
      levels,
      activeLevelId,
      levelBgImages,
      is3D,
      levelSpacing,
      overlayAllLayers,
      gridMode,
      levelOpacities,
      zoom
    );
    deckOverlay.current.setProps({ layers: newLayers as Parameters<typeof deckOverlay.current.setProps>[0]["layers"] });
  }, [
    markers,
    connections,
    visibleFeatures,
    layers,
    levels,
    activeLevelId,
    levelBgImages,
    is3D,
    levelSpacing,
    overlayAllLayers,
    gridMode,
    levelOpacities,
    zoom,
    buildDeckLayers,
  ]);

  return {
    map,
  };
};
