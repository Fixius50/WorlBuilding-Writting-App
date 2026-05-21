import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { EntityUseCase } from "@application/useCases/EntityUseCase";
import { Entidad } from "@domain/models/database";
import { useQuery } from "@tanstack/react-query";

export const entityEditRouterQueryKey = (entityId: number) =>
  ["entity-edit-router", entityId] as const;

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
 * 🧠 useEntityEditRouter
 * Hook to handle entity loading and routing logic for the editor, determining which specialized editor to display.
 */
export const useEntityEditRouter = () => {
  const { entityId } = useParams();
  const numericEntityId = Number(entityId);

  const { data: entity, isLoading: loading } = useQuery<Entidad | null>({
    queryKey: entityEditRouterQueryKey(numericEntityId),
    enabled: Number.isFinite(numericEntityId) && numericEntityId > 0,
    queryFn: async () => {
      return await EntityUseCase.getById(numericEntityId);
    },
  });

  const isCosmic = useMemo(() => {
    if (!entity) return false;
    const tipo = normalizeType(entity.tipo || "");
    const cosmicTypes = [
      "UNIVERSO",
      "UNIVERSE",
      "UNIVERSES",
      "GALAXIA",
      "GALAXY",
      "GALAXIES",
      "SISTEMA",
      "SYSTEM",
      "SYSTEMS",
      "PLANETA",
      "PLANET",
      "PLANETS",
      "DIMENSION",
      "DIMENSIÓN",
      "DIMENSIONS",
    ];
    return matchesAliases(tipo, cosmicTypes);
  }, [entity]);

  return {
    entity,
    loading,
    isCosmic,
  };
};
