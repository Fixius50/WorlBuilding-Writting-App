import { useEffect, useRef, useCallback } from "react";
import maplibregl from "maplibre-gl";
import { MapboxOverlay } from "@deck.gl/mapbox";
import type { PickingInfo } from "@deck.gl/core";
import {
  ScatterplotLayer,
  TextLayer,
  PathLayer,
  GeoJsonLayer,
} from "@deck.gl/layers";
import { MapLayer, MapMarker, MapConnection } from "@domain/maps";
import { getThemePrimaryRgb } from "@infrastructure/utils/themeColor";

type ConnectionPath = {
  path: [number, number][];
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
 * Encapsulates the complex MapLibre + Deck.gl integration logic.
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
    is3D = false,
  }: {
    mapImage: string;
    markers: MapMarker[];
    layers: MapLayer[];
    connections: MapConnection[];
    features?: GeoFeatureCollection;
    onMarkerClick: (marker: MapMarker) => void;
    onMapClick?: (lng: number, lat: number) => void;
    is3D?: boolean;
  },
) => {
  const map = useRef<maplibregl.Map | null>(null);
  const deckOverlay = useRef<MapboxOverlay | null>(null);
  const onMarkerClickRef = useRef(onMarkerClick);
  onMarkerClickRef.current = onMarkerClick;

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
    ) => {
      const primaryRgb = getThemePrimaryRgb();
      const deckLayers: Array<
        | PathLayer<ConnectionPath>
        | GeoJsonLayer<GeoFeatureCollection>
        | ScatterplotLayer<MapMarker>
        | TextLayer<MapMarker>
      > = [];

      const connPaths: ConnectionPath[] = currentConnections
        .map((conn) => {
          const src = currentMarkers.find((m) => m.id === conn.sourceId);
          const tgt = currentMarkers.find((m) => m.id === conn.targetId);
          if (!src || !tgt) return null;
          return {
            path: [
              [src.lng || 0, src.lat || 0] as [number, number],
              [tgt.lng || 0, tgt.lat || 0] as [number, number],
            ],
            color: hexToRgb(conn.color || "") as [number, number, number],
            width: conn.weight || 2,
          };
        })
        .filter((path): path is ConnectionPath => path !== null);

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
          }),
        );
      }

      if (currentFeatures?.features?.length) {
        currentLayers
          .filter((l) => l.type !== "base" && l.type !== "image" && l.visible)
          .forEach((layer) => {
            const layerFeatures = currentFeatures.features.filter(
              (f) => f.properties?.layerId === layer.id,
            );
            if (!layerFeatures.length) return;
            const rgb = hexToRgb(layer.color || "");
            const geojsonData: GeoFeatureCollection = {
              type: "FeatureCollection",
              features: layerFeatures,
            };
            deckLayers.push(
              new GeoJsonLayer({
                id: `deck-geojson-${layer.id}`,
                data: geojsonData,
                getLineColor: [...rgb, Math.round((layer.opacity ?? 1) * 255)],
                getFillColor: [
                  ...rgb,
                  Math.round((layer.opacity ?? 0.8) * 200),
                ],
                getPointRadius: layer.type === "spray" ? 6 : 3,
                pointRadiusUnits: "pixels",
                getLineWidth: 3,
                lineWidthUnits: "pixels",
                lineJointRounded: true,
                lineCapRounded: true,
                pickable: false,
              }),
            );
          });
      }

      if (currentMarkers.length > 0) {
        deckLayers.push(
          new ScatterplotLayer({
            id: "deck-markers-bg",
            data: currentMarkers,
            getPosition: (d: MapMarker) => [d.lng || 0, d.lat || 0],
            getRadius: 12,
            radiusUnits: "pixels",
            getFillColor: [15, 15, 20, 160],
            getLineColor: [...primaryRgb, 220],
            lineWidthMinPixels: 2,
            stroked: true,
            filled: true,
            pickable: false,
          }),
        );

        deckLayers.push(
          new ScatterplotLayer({
            id: "deck-markers-dot",
            data: currentMarkers,
            getPosition: (d: MapMarker) => [d.lng || 0, d.lat || 0],
            getRadius: 4,
            radiusUnits: "pixels",
            getFillColor: [255, 255, 255, 240],
            pickable: true,
            autoHighlight: true,
            highlightColor: [...primaryRgb, 255],
            onClick: (info: PickingInfo<MapMarker>) => {
              if (info.object) onMarkerClickRef.current(info.object);
            },
          }),
        );

        deckLayers.push(
          new TextLayer({
            id: "deck-marker-labels",
            data: currentMarkers.filter((m) => m.label),
            getPosition: (d: MapMarker) => [d.lng || 0, d.lat || 0],
            getText: (d: MapMarker) => d.label || "",
            getSize: 11,
            getColor: [240, 240, 255, 220],
            getPixelOffset: [0, -20],
            fontFamily: "Inter, system-ui, sans-serif",
            fontWeight: 700,
            background: true,
            getBackgroundColor: [15, 15, 25, 180],
            backgroundPadding: [4, 2, 4, 2],
            pickable: false,
          }),
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
        sources: {
          "base-map": {
            type: "image",
            url: mapImage,
            coordinates: [
              [-180, 85.0511],
              [180, 85.0511],
              [180, -85.0511],
              [-180, -85.0511],
            ],
          },
        },
        layers: [
          {
            id: "base-map-layer",
            type: "raster",
            source: "base-map",
            paint: { "raster-fade-duration": 0 },
          },
        ],
      },
      center: [0, 0],
      zoom: 1,
      maxZoom: 7,
      minZoom: 0,
      renderWorldCopies: is3D,
      // @ts-ignore - 'projection' is supported in newer MapLibre GL JS but types might be outdated
      projection: is3D
        ? ({ type: "globe" } as unknown as { type: "globe" })
        : undefined,
      attributionControl: false,
    });

    map.current = mapInstance;

    const overlay = new MapboxOverlay({
      interleaved: false,
      layers: [],
    });
    deckOverlay.current = overlay;
    mapInstance.addControl(overlay as unknown as maplibregl.IControl);
    mapInstance.addControl(new maplibregl.NavigationControl(), "bottom-right");

    mapInstance.on("click", (e) => {
      if (onMapClick) onMapClick(e.lngLat.lng, e.lngLat.lat);
    });

    mapInstance.on("load", () => {
      const imageLayers = (layers || []).filter(
        (l) =>
          (l.type === "image" || l.type === "base") &&
          l.url &&
          l.id !== "base" &&
          l.visible,
      );
      imageLayers.forEach((layer) => {
        const srcId = `overlay-${layer.id}`;
        if (!mapInstance.getSource(srcId)) {
          mapInstance.addSource(srcId, {
            type: "image",
            url: layer.url!,
            coordinates: [
              [-180, 85.0511],
              [180, 85.0511],
              [180, -85.0511],
              [-180, -85.0511],
            ],
          });
          mapInstance.addLayer({
            id: `overlay-lay-${layer.id}`,
            type: "raster",
            source: srcId,
            paint: { "raster-opacity": layer.opacity ?? 1 },
          });
        }
      });
    });

    return () => {
      overlay.finalize();
      mapInstance.remove();
    };
  }, [mapImage, is3D, layers, onMapClick]);

  useEffect(() => {
    if (!deckOverlay.current) return;
    const newLayers = buildDeckLayers(markers, connections, features, layers);
    deckOverlay.current.setProps({ layers: newLayers });
  }, [markers, connections, features, layers, buildDeckLayers]);

  return {
    map,
  };
};
