import React, { useState, useMemo, useCallback } from "react";
import { useLocation, useParams, useNavigate } from "react-router-dom";
import { WorldBibleUseCase } from "@application/WorldBibleUseCase";
import { Carpeta } from "@domain/database";
import { ArchitectContext } from "@domain/ui";
import {
  useWorldBibleData,
  useWorldBibleFolderData,
  useWorldBibleFolderDetails,
} from "../hooks/useWorldBibleData";
import { useWorldBibleMutations } from "../hooks/useWorldBibleMutations";

type CreateModalTargetParent = {
  id: number;
  nombre: string;
  type: "node" | "folder";
};

export const useWorldBibleLayout = (architectContext: ArchitectContext) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectName, folderId: folderIdParam, entityId } = useParams();
  const projectId = architectContext?.projectId;

  const [viewMode, setViewMode] = useState<"folders" | "table">("folders");
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [targetParent, setTargetParent] =
    useState<CreateModalTargetParent | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<number | null>(null);

  const isRoot = useMemo(() => {
    // Regex para detectar si estamos exactamente en la raíz de la biblia
    return /\/bible\/?$/.test(location.pathname);
  }, [location.pathname]);

  const currentFolderId = useMemo(() => {
    return folderIdParam ? Number(folderIdParam) : null;
  }, [folderIdParam]);

  // Queries
  const { data: rootEntities = [] } = useWorldBibleData(projectId || 0);
  const { data: folderContent } = useWorldBibleFolderData(
    projectId || 0,
    currentFolderId,
  );
  const { createEntity, createCategory, bulkDelete } = useWorldBibleMutations(
    projectId || 0,
  );
  const { data: folderDetails } = useWorldBibleFolderDetails(currentFolderId);

  const localEntities = useMemo(() => {
    const safeEntities = Array.isArray(rootEntities) ? rootEntities : [];
    if (isRoot) {
      // En la raíz, mostramos las entidades que NO tienen carpeta_id
      return safeEntities.filter((e) => !e.carpeta_id);
    }
    return folderContent?.entities || [];
  }, [isRoot, rootEntities, folderContent]);

  const localFolders = useMemo(() => {
    if (isRoot) {
      return (architectContext.folders || []).filter((f) => !f.padre_id);
    }
    return folderContent?.folders || [];
  }, [isRoot, architectContext.folders, folderContent]);

  const currentFolder = useMemo(() => {
    if (isRoot) return null;
    // Prioridad: 1. Detalles cargados por ID, 2. Búsqueda en el contexto global, 3. Fallback
    return (
      folderDetails ||
      (architectContext.folders || []).find((f) => f.id === currentFolderId) ||
      null
    );
  }, [isRoot, folderDetails, architectContext.folders, currentFolderId]);

  const isEditorView = useMemo(() => {
    return (
      location.pathname.includes("/entity/") ||
      location.pathname.includes("/timeline")
    );
  }, [location.pathname]);

  const dynamicTitle = useMemo(() => {
    if (isRoot) return "Biblia del Mundo";

    if (location.pathname.includes("/timeline")) {
      return currentFolder
        ? `Timeline: ${currentFolder.nombre}`
        : "Visor de Timelines";
    }

    if (location.pathname.includes("/entity/")) {
      return "Ficha de Entidad";
    }

    return currentFolder ? currentFolder.nombre : "Explorador de Archivos";
  }, [isRoot, location.pathname, currentFolder]);

  const handleOpenCreateModal = useCallback(
    (folder: Carpeta | null = null, type: "node" | "folder" = "node") => {
      const effectiveParentId = folder?.id || currentFolderId;

      if (effectiveParentId) {
        setTargetParent({
          id: Number(effectiveParentId),
          nombre: folder?.nombre || folderDetails?.nombre || "...",
          type,
        });
      } else {
        setTargetParent(null);
      }
      setCreationModalOpen(true);
    },
    [currentFolderId, folderDetails],
  );

  const confirmDeleteEntity = useCallback(async () => {
    if (entityToDelete) {
      try {
        await bulkDelete([entityToDelete]);
        setEntityToDelete(null);
        setDeleteConfirmOpen(false);
      } catch (err) {
        console.error(err);
      }
    }
  }, [entityToDelete, bulkDelete]);

  const handleCreateSubmit = useCallback(
    async (
      formData: {
        nombre: string;
        tipo: string;
        descripcion?: string;
      },
      shouldOpenEditor = false,
    ) => {
      let createdEntityId: number | null = null;

      if (!projectId) {
        console.warn("No se puede crear: Project ID no encontrado");
      } else {
        try {
          if (isRoot) {
            await createCategory({
              nombre: formData.nombre,
              type: "folder",
              projectId: projectId,
            });
          } else if (currentFolderId) {
            const createdEntity = await createEntity({
              nombre: formData.nombre,
              descripcion: formData.descripcion || "",
              tipo: formData.tipo || "personaje",
              carpeta_id: currentFolderId,
              project_id: projectId,
            });

            createdEntityId = createdEntity?.id || null;
          }
        } catch (err) {
          console.error(err);
        }
      }

      setCreationModalOpen(false);

      if (
        shouldOpenEditor &&
        createdEntityId &&
        currentFolderId &&
        projectName
      ) {
        navigate(
          `/local/${projectName}/bible/folder/${currentFolderId}/entity/${createdEntityId}/edit`,
        );
      }
    },
    [
      projectId,
      isRoot,
      currentFolderId,
      createCategory,
      createEntity,
      navigate,
      projectName,
    ],
  );

  const handleCreateSubmitAndEdit = useCallback(
    async (formData: {
      nombre: string;
      tipo: string;
      descripcion?: string;
    }) => {
      await handleCreateSubmit(formData, true);
    },
    [handleCreateSubmit],
  );

  return {
    viewMode,
    setViewMode,
    creationModalOpen,
    setCreationModalOpen,
    targetParent,
    localEntities,
    localFolders,
    currentFolder,
    deleteConfirmOpen,
    setDeleteConfirmOpen,
    setEntityToDelete,
    isRoot,
    isEditorView,
    dynamicTitle,
    handleOpenCreateModal,
    confirmDeleteEntity,
    handleCreateSubmit,
    handleCreateSubmitAndEdit,
    projectName,
    projectId,
    navigate,
    currentFolderId,
    setTargetParent,
    entityId,
  };
};
