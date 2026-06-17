import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { EntityUseCase } from "@features/Entities";
import { Entidad } from "@domain/database";
import { useQuery } from "@tanstack/react-query";

export const entityRouterQueryKey = (entityId: number) =>
  ["entity-router", entityId] as const;

const normalizeType = (typeValue: string): string => {
  return typeValue
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^A-Z0-9]+/gi, " ")
    .trim()
    .toUpperCase();
};

const matchesAliases = (normalizedType: string, aliases: string[]): boolean => {
  const words = normalizedType.split(/\s+/).filter(Boolean);

  return aliases.some((alias) => {
    const normalizedAlias = normalizeType(alias);

    switch (true) {
      case normalizedType === normalizedAlias:
        return true;
      case normalizedType.includes(normalizedAlias):
        return true;
      case words.includes(normalizedAlias):
        return true;
      default:
        return false;
    }
  });
};

/**
 * ðŸ§  useEntityRouter
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
    const tipo = normalizeType(entity.tipo || "");

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
      "ENTIDADINDIVIDUAL",
      "INDIVIDUAL",
      "OBJETO",
      "RELIQUIA",
      "VEHICULO",
      "MAGIA",
      "MAGIAINDIVIDUAL",
      "HECHIZO",
      "SPELL",
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
      "ENTIDADCOLECTIVA",
      "COLECTIVO",
      "COLLECTIVE",
      "FACCION",
      "RELIGION",
      "RAZA",
      "CLASE",
      "PROFESION",
      "CLASE PROFESION",
      "CLASEPROFESION",
      "ORGANIZACION",
      "FACTION",
      "RELIGION",
      "RACE",
      "CLASS",
      "PROFESSION",
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

    if (matchesAliases(tipo, mapTypes)) return "map";
    if (matchesAliases(tipo, cosmicTypes)) return "cosmic";
    if (matchesAliases(tipo, actorTypes)) return "individual";
    if (matchesAliases(tipo, territoryTypes)) return "territory";
    if (matchesAliases(tipo, collectiveTypes)) return "collective";
    if (matchesAliases(tipo, eventTypes)) return "event";
    if (matchesAliases(tipo, ["ENTIDAD", "ENTITY"])) return "builder";

    return "individual"; // Default fallback
  }, [entity]);

  return {
    entity,
    loading,
    viewType,
  };
};

