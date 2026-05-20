import { useMemo } from "react";
import { useParams } from "react-router-dom";
import { EntityUseCase } from "@application/useCases/EntityUseCase";
import { Entidad } from "@domain/models/database";
import { useQuery } from "@tanstack/react-query";

export const entityEditRouterQueryKey = (entityId: number) =>
  ["entity-edit-router", entityId] as const;

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
    const tipo = entity.tipo.trim().toUpperCase();
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
    return cosmicTypes.includes(tipo);
  }, [entity]);

  return {
    entity,
    loading,
    isCosmic,
  };
};
