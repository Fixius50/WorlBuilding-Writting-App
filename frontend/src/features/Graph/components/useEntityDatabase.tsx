import { useState, useEffect, useMemo, useCallback } from "react";
import { RelationshipUseCase } from "@application/useCases/RelationshipUseCase";
import { Entidad, Carpeta } from "@domain/models/database";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export const entityDatabaseQueryKey = (projectId: number) =>
  ["entity-database", projectId] as const;

/**
 * 🧠 useEntityDatabase
 * Logic for managing the entity database in the graph feature.
 */
export const useEntityDatabase = (projectId?: number) => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [folderFilter, setFolderFilter] = useState<number | "ALL">("ALL");
  const [selectedEntity, setSelectedEntity] = useState<Entidad | null>(null);
  const numericProjectId = Number(projectId || 0);

  const {
    data,
    isLoading: loading,
    refetch,
  } = useQuery({
    queryKey: entityDatabaseQueryKey(numericProjectId),
    enabled: Number.isFinite(numericProjectId) && numericProjectId > 0,
    queryFn: async (): Promise<{
      allEntities: Entidad[];
      folders: Carpeta[];
    }> => {
      const { entities } =
        await RelationshipUseCase.getFullNetwork(numericProjectId);
      const folds =
        await RelationshipUseCase.getNetworkFolders(numericProjectId);
      return {
        allEntities: entities.filter((e) => !e.borrado),
        folders: folds,
      };
    },
  });

  const allEntities = data?.allEntities || [];
  const folders = data?.folders || [];

  const load = useCallback(async () => {
    await refetch();
  }, [refetch]);

  // Escucha actualizaciones globales
  useEffect(() => {
    const handler = () => {
      if (Number.isFinite(numericProjectId) && numericProjectId > 0) {
        queryClient.invalidateQueries({
          queryKey: entityDatabaseQueryKey(numericProjectId),
        });
      }
    };
    window.addEventListener("folder-update", handler);
    window.addEventListener("map-updated", handler);
    return () => {
      window.removeEventListener("folder-update", handler);
      window.removeEventListener("map-updated", handler);
    };
  }, [numericProjectId, queryClient]);

  const filtered = useMemo(() => {
    return allEntities.filter((e) => {
      const matchSearch =
        !searchTerm ||
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ??
          false);
      const matchType = typeFilter === "ALL" || e.tipo === typeFilter;
      const matchFolder =
        folderFilter === "ALL" || e.carpeta_id === folderFilter;
      return matchSearch && matchType && matchFolder;
    });
  }, [allEntities, searchTerm, typeFilter, folderFilter]);

  const selectedEntityAttrs = useMemo(() => {
    if (!selectedEntity) return {};
    try {
      return typeof selectedEntity.contenido_json === "string"
        ? JSON.parse(selectedEntity.contenido_json)
        : selectedEntity.contenido_json || {};
    } catch {
      return {};
    }
  }, [selectedEntity]);

  const folderName = (folderId: number | null) =>
    folders.find((f) => f.id === folderId)?.nombre ?? "—";

  return {
    allEntities,
    folders,
    searchTerm,
    setSearchTerm,
    typeFilter,
    setTypeFilter,
    folderFilter,
    setFolderFilter,
    selectedEntity,
    setSelectedEntity,
    loading,
    filtered,
    selectedEntityAttrs,
    folderName,
    load,
  };
};
