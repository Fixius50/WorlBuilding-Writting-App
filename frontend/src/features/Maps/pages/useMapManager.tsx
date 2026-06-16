import { useState, useEffect, useCallback, useMemo } from "react";
import { EntityUseCase } from "@application/EntityUseCase";
import { Entidad } from "@domain/database";

/**
 * 🧠 useMapManager
 * Handles map filtering, preview generation, and attribute updates.
 */
export const useMapManager = (maps: Entidad[]) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [spatialFilter, setSpatialFilter] = useState("ALL");
  const [selectedMapId, setSelectedMapId] = useState<number | null>(null);

  const selectedMap = useMemo(
    () => maps.find((m) => m.id === selectedMapId),
    [maps, selectedMapId],
  );

  const filteredMaps = useMemo(() => {
    return maps.filter((m) => {
      const matchesSearch = m.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const attrs =
        typeof m.contenido_json === "string"
          ? JSON.parse(m.contenido_json)
          : m.contenido_json || {};
      const matchesSpatial =
        spatialFilter === "ALL" ||
        (attrs.spatialLevel || "TERRITORY") === spatialFilter;
      return matchesSearch && matchesSpatial;
    });
  }, [maps, searchTerm, spatialFilter]);

  const getPreview = useCallback((map: Entidad) => {
    const attrs =
      typeof map.contenido_json === "string"
        ? JSON.parse(map.contenido_json)
        : map.contenido_json || {};
    let img = attrs.snapshotUrl || attrs.bgImage;
    if (!img) return null;
    const lower = img.toLowerCase();
    if (
      lower.includes("duckdns") ||
      lower.includes("nopreview") ||
      lower.includes("placeholder")
    )
      return null;
    if (lower.startsWith("data:image/png") && img.length > 512000) return null;
    return img;
  }, []);

  const handleUpdateMapAttribute = useCallback(
    async (map: Entidad, key: string, value: unknown) => {
      try {
        const attrs =
          typeof map.contenido_json === "string"
            ? JSON.parse(map.contenido_json)
            : map.contenido_json || {};
        const updated = {
          ...map,
          contenido_json: JSON.stringify({
            ...attrs,
            [key]: value,
          }),
        };
        await EntityUseCase.update(map.id, updated);
        window.dispatchEvent(new CustomEvent("map-updated"));
      } catch (err) {
        // Error handling
      }
    },
    [],
  );

  return {
    searchTerm,
    setSearchTerm,
    spatialFilter,
    setSpatialFilter,
    selectedMapId,
    setSelectedMapId,
    selectedMap,
    filteredMaps,
    getPreview,
    handleUpdateMapAttribute,
  };
};
