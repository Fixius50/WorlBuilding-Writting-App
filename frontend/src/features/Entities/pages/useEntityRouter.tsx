import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { EntityUseCase } from "@application/useCases/EntityUseCase";
import { Entidad } from "@domain/models/database";
import { useQuery } from "@tanstack/react-query";

export const entityRouterQueryKey = (entityId: number) =>
  ["entity-router", entityId] as const;

/**
 * 🧠 useEntityRouter
 * Hook to handle entity routing logic, determining which profile view or specialized view to display based on entity type.
 */
export const useEntityRouter = () => {
  const { entityId } = useParams();
  const numericEntityId = Number(entityId);

  const { data: entity, isLoading: loading } = useQuery<Entidad | null>({
    queryKey: entityRouterQueryKey(numericEntityId),
    enabled: Number.isFinite(numericEntityId) && numericEntityId > 0,
    queryFn: async () => {
      return await EntityUseCase.getById(numericEntityId);
    },
  });

  const viewType = useMemo(() => {
    if (!entity) return "none";
    const tipo = entity.tipo.trim().toUpperCase();

    const cosmicTypes = [
      "UNIVERSO",
      "PLANETA",
      "SISTEMA",
      "DIMENSION",
      "ASTRO",
      "UNIVERSE",
      "PLANET",
      "SYSTEM",
      "ASTRO",
    ];
    const actorTypes = [
      "PERSONAJE",
      "OBJETO",
      "RELIQUIA",
      "VEHICULO",
      "ENTITY",
      "ENTIDAD",
      "CHARACTER",
      "OBJECT",
      "ITEM",
    ];
    const territoryTypes = [
      "REINO",
      "CIUDAD",
      "LUGAR",
      "CONTINENTE",
      "LOCATION",
      "PLACE",
      "GEOGRAPHY",
      "MAP",
      "MAPA",
    ];
    const collectiveTypes = [
      "FACCION",
      "RELIGION",
      "RAZA",
      "ORGANIZACION",
      "FACTION",
      "RELIGION",
      "RACE",
      "ORGANIZATION",
      "CONLANG",
    ];
    const eventTypes = [
      "EVENTO",
      "GUERRA",
      "ERA",
      "MARCA_TEMPORAL",
      "EVENT",
      "WAR",
      "TIMELINE",
      "LINEA_TEMPORAL",
    ];
    const mapTypes = ["MAP", "MAPA"];

    if (mapTypes.includes(tipo)) return "map";
    if (cosmicTypes.includes(tipo)) return "cosmic";
    if (actorTypes.includes(tipo)) return "individual";
    if (territoryTypes.includes(tipo)) return "territory";
    if (collectiveTypes.includes(tipo)) return "collective";
    if (eventTypes.includes(tipo)) return "event";
    if (tipo === "ENTIDAD" || tipo === "ENTITY") return "builder";

    return "individual"; // Default fallback
  }, [entity]);

  return {
    entity,
    loading,
    viewType,
  };
};
