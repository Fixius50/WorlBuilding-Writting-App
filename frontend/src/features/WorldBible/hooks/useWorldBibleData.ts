import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WorldBibleUseCase } from "@features/WorldBible";
import { Entidad } from "@domain/database";

export const BIBLE_KEYS = {
  all: (projectId: number) => ["world-bible", projectId] as const,
  root: (projectId: number) => [...BIBLE_KEYS.all(projectId), "root"] as const,
  folder: (projectId: number, folderId: number) =>
    [...BIBLE_KEYS.all(projectId), "folder", folderId] as const,
};

/**
 * Hook useWorldBibleData
 * Gestiona la carga de entidades de la Biblia del Mundo con TanStack Query.
 */
export const useWorldBibleData = (projectId: number) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!projectId) {
      return;
    }

    const handleDataChange = () => {
      queryClient.invalidateQueries({ queryKey: BIBLE_KEYS.all(projectId) });
    };

    const events = ["app-data-changed", "entity-update", "folder-update"];
    events.forEach((eventName) => {
      window.addEventListener(eventName, handleDataChange);
    });

    return () => {
      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleDataChange);
      });
    };
  }, [projectId, queryClient]);

  return useQuery<Entidad[]>({
    queryKey: BIBLE_KEYS.root(projectId),
    queryFn: () => WorldBibleUseCase.getRootEntities(projectId),
    select: (data: Entidad[] | unknown) => {
      return Array.isArray(data) ? data : [];
    },
    enabled: projectId !== undefined && projectId !== null && projectId !== 0,
  });
};

/**
 * Hook useWorldBibleFolderData
 * Carga el contenido de una carpeta específica (entidades y subcarpetas).
 */
export const useWorldBibleFolderData = (
  projectId: number,
  folderId: number | null,
) => {
  return useQuery({
    queryKey:
      folderId !== null
        ? BIBLE_KEYS.folder(projectId, folderId)
        : BIBLE_KEYS.root(projectId),
    queryFn: async () => {
      if (folderId === null) return { entities: [], folders: [] };
      return WorldBibleUseCase.getFolderContent(folderId);
    },
    enabled:
      projectId !== undefined &&
      projectId !== null &&
      projectId !== 0 &&
      folderId !== null,
  });
};

/**
 * Hook useWorldBibleFolderDetails
 * Carga los detalles (nombre, etc) de una carpeta específica.
 */
export const useWorldBibleFolderDetails = (folderId: number | null) => {
  return useQuery({
    queryKey: ["world-bible", "folder-details", folderId],
    queryFn: () =>
      folderId ? WorldBibleUseCase.getFolderById(folderId) : null,
    enabled: !!folderId,
  });
};
