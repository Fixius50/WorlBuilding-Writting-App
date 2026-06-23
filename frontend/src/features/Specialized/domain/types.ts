export type DrawMode = "none" | "spray" | "line" | "rectangle" | "circle" | "fill" | "marker" | "eraser";

export type GeoFeature = {
  id?: string | number;
  type: "Feature";
  geometry: { type: string; coordinates: unknown };
  properties?: Record<string, unknown>;
};

export type GeoFeatureCollection = {
  type: "FeatureCollection";
  features: GeoFeature[];
};
