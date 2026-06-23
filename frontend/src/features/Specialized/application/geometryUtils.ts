export const snapLngLat = (lng: number, lat: number, gridMode: string, spacing: number): { lng: number; lat: number } => {
  if (gridMode === "none") return { lng, lat };
  
  const step = spacing * Math.PI / 180;
  const mercY = Math.log(Math.tan(Math.PI / 4 + (lat * Math.PI / 180) / 2));
  const mercX = lng * Math.PI / 180;

  const mercatorToLat = (y: number) => (Math.atan(Math.exp(y)) - Math.PI / 4) * 2 * 180 / Math.PI;
  const mercatorToLng = (x: number) => x * 180 / Math.PI;
  
  if (gridMode === "square" || gridMode === "dots") {
    const snappedX = Math.round(mercX / step) * step;
    const snappedY = Math.round(mercY / step) * step;
    return {
      lng: mercatorToLng(snappedX),
      lat: mercatorToLat(snappedY),
    };
  }

  if (gridMode === "isometric") {
    const u = mercX + mercY;
    const v = mercX - mercY;
    const snappedU = Math.round(u / (step * 2)) * (step * 2);
    const snappedV = Math.round(v / (step * 2)) * (step * 2);
    return {
      lng: mercatorToLng((snappedU + snappedV) / 2),
      lat: mercatorToLat((snappedU - snappedV) / 2),
    };
  }
  
  return { lng, lat };
};
