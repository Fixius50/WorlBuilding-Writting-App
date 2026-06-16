import { Entidad } from "@domain/database";

export interface MapCreationConfig {
  description?: string;
  bgImage?: string;
  mapType?: string;
  parentId?: number | string | null;
  is3D?: boolean;
}

export class MapAggregateService {
  static isMapEntity = (entity: Entidad): boolean => {
    let isMap = false;
    try {
      const attrs =
        typeof entity.contenido_json === "string"
          ? JSON.parse(entity.contenido_json)
          : entity.contenido_json || {};
      isMap =
        attrs.tipoEspecial === "map" ||
        entity.tipo === "Map" ||
        entity.tipo === "Mapa";
    } catch (_error) {
      isMap = false;
    }
    return isMap;
  };

  static extractMapEntities = (entities: Entidad[]): Entidad[] => {
    return entities.filter((entity) => this.isMapEntity(entity));
  };

  static duplicateMapContent = (map: Entidad): string => {
    let content = "{}";
    try {
      const attrs =
        typeof map.contenido_json === "string"
          ? JSON.parse(map.contenido_json)
          : map.contenido_json || {};
      const duplicateAttrs = {
        ...attrs,
        layers: (attrs.layers || []).map(
          (layer: { [key: string]: unknown }) => ({
            ...layer,
            id: crypto.randomUUID(),
          }),
        ),
      };
      content = JSON.stringify(duplicateAttrs);
    } catch (_error) {
      content = JSON.stringify({
        tipoEspecial: "map",
        layers: [],
        markers: [],
        connections: [],
      });
    }
    return content;
  };

  static buildMapPayload = (
    mapName: string,
    projectId: number,
    folderId: number,
    config: MapCreationConfig,
  ): Omit<
    Entidad,
    "id" | "created_at" | "fecha_creacion" | "fecha_actualizacion" | "borrado"
  > => {
    return {
      nombre: mapName || "Nuevo Mapa",
      project_id: projectId,
      carpeta_id: folderId,
      tipo: "Map",
      descripcion: config.description || "",
      slug: "",
      folder_slug: "",
      imagen_url: "",
      contenido_json: JSON.stringify({
        tipoEspecial: "map",
        bgImage: config.bgImage || "placeholder-map.png",
        mapType: config.mapType,
        parentId: config.parentId,
        is3D: config.is3D,
        layers: [],
        markers: [],
        connections: [],
      }),
    };
  };

  static resolveMapByIdOrSlug = (
    maps: Entidad[],
    mapId?: string,
  ): Entidad | null => {
    let map: Entidad | null = null;
    if (mapId) {
      map =
        maps.find(
          (item) => item.slug === mapId || item.id.toString() === mapId,
        ) || null;
    }
    return map;
  };
}
