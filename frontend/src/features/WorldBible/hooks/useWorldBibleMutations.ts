import { useMutation, useQueryClient } from "@tanstack/react-query";
import { WorldBibleUseCase } from "@features/WorldBible/application/WorldBibleUseCase";
import { Entidad } from "@domain/database";
import { BIBLE_KEYS } from "./useWorldBibleData";

/**
 * ðŸ› ï¸ useWorldBibleMutations
 * Contiene mutaciones con Optimistic UI para la Biblia del Mundo.
 * La UI se actualiza ANTES de que SQLite confirme el cambio.
 */
export const useWorldBibleMutations = (projectId: number) => {
  const queryClient = useQueryClient();
  const queryKey = BIBLE_KEYS.root(projectId);

  // 1. MutaciÃ³n para crear entidad
  const createMutation = useMutation({
    mutationFn: (newEntity: any) => WorldBibleUseCase.createEntity(newEntity),
    onMutate: async (newEntity) => {
      // Cancelar cualquier refetch en curso para no sobrescribir nuestro optimismo
      await queryClient.cancelQueries({ queryKey });

      // Guardar el estado anterior por si hay que hacer rollback
      const previousEntities = queryClient.getQueryData<Entidad[]>(queryKey);

      // Actualizar la cachÃ© optimÃ­sticamente
      if (previousEntities) {
        queryClient.setQueryData<Entidad[]>(queryKey, [
          {
            ...newEntity,
            id: Date.now(), // ID temporal
            fecha_creacion: new Date().toISOString(),
            borrado: 0,
          } as Entidad,
          ...previousEntities,
        ]);
      }

      return { previousEntities };
    },
    onError: (err, newEntity, context) => {
      // Rollback si falla
      if (context?.previousEntities) {
        queryClient.setQueryData(queryKey, context.previousEntities);
      }
    },
    onSettled: () => {
      // Sincronizar con la DB real al terminar (Ã©xito o fallo)
      queryClient.invalidateQueries({ queryKey: BIBLE_KEYS.all(projectId) });
      // Disparar evento para que ArchitectLayout (contexto antiguo) se actualice
      window.dispatchEvent(new CustomEvent("entity-update"));
      window.dispatchEvent(new CustomEvent("folder-update"));
    },
  });

  // 2. MutaciÃ³n para borrado masivo
  const bulkDeleteMutation = useMutation({
    mutationFn: (ids: number[]) => WorldBibleUseCase.bulkDeleteEntities(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: BIBLE_KEYS.all(projectId) });
      const previousEntities = queryClient.getQueryData<Entidad[]>(queryKey);

      if (previousEntities) {
        queryClient.setQueryData<Entidad[]>(
          queryKey,
          previousEntities.filter((e) => !ids.includes(e.id)),
        );
      }

      // Limpiar optimÃ­sticamente todas las queries de World Bible (incluidas carpetas abiertas)
      queryClient.setQueriesData(
        { queryKey: BIBLE_KEYS.all(projectId) },
        (oldData: unknown) => {
          if (Array.isArray(oldData)) {
            return oldData.filter((item: unknown) => {
              if (typeof item === "object" && item !== null && "id" in item) {
                const maybeId = (item as { id: number }).id;
                return !ids.includes(maybeId);
              }
              return true;
            });
          }

          if (
            typeof oldData === "object" &&
            oldData !== null &&
            "entities" in oldData &&
            Array.isArray((oldData as { entities: unknown[] }).entities)
          ) {
            const casted = oldData as {
              entities: Array<{ id: number }>;
              folders?: unknown[];
            };
            return {
              ...casted,
              entities: casted.entities.filter(
                (entity) => !ids.includes(entity.id),
              ),
            };
          }

          return oldData;
        },
      );

      return { previousEntities };
    },
    onError: (err, ids, context) => {
      if (context?.previousEntities) {
        queryClient.setQueryData(queryKey, context.previousEntities);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: BIBLE_KEYS.all(projectId) });
      window.dispatchEvent(new CustomEvent("entity-update"));
      window.dispatchEvent(new CustomEvent("folder-update"));
    },
  });

  // 3. MutaciÃ³n para crear categorÃ­as (carpetas)
  const createCategoryMutation = useMutation({
    mutationFn: (data: { nombre: string; type: any; projectId: number }) =>
      WorldBibleUseCase.createCategory(data.nombre, data.projectId, data.type),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({
        queryKey: BIBLE_KEYS.all(variables.projectId),
      });
      window.dispatchEvent(new CustomEvent("folder-update"));
    },
  });

  return {
    createEntity: createMutation.mutateAsync,
    isCreating: createMutation.isPending || createCategoryMutation.isPending,
    createCategory: createCategoryMutation.mutateAsync,
    bulkDelete: bulkDeleteMutation.mutateAsync,
    isDeleting: bulkDeleteMutation.isPending,
  };
};

