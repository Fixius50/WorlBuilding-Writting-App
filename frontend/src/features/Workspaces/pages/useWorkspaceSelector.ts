import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkspaceUseCase } from "@features/Workspaces";
import { Proyecto } from "@domain/database";
import { useAppStore } from "@features/App";
import { syncService, type SyncRealtimePayload } from "@network/syncService";

type SnapshotEntry = {
  payload: SyncRealtimePayload;
  backupName: string;
  backupIndex: number;
  progressKey: string;
};

type ProjectProgressItem = {
  key: string;
  label: string;
  status: "pending" | "running" | "completed" | "updated" | "error";
  progress: number;
};

export const useWorkspaceSelector = () => {
  const MAX_PARALLEL_TASKS = 3;
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);
  const setLastProjectId = useAppStore((state) => state.setLastProjectId);
  const [actionLoading, setActionLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingMessage, setLoadingMessage] = useState(
    "Preparando operación...",
  );
  const [projectProgress, setProjectProgress] = useState<ProjectProgressItem[]>(
    [],
  );
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Proyecto | null>(null);
  const [projectToDelete, setProjectToDelete] = useState<number | null>(null);
  const [importConfirmOpen, setImportConfirmOpen] = useState(false);
  const [statusModal, setStatusModal] = useState<{
    title: string;
    message: string;
  } | null>(null);

  const remapSnapshotIds = (
    payload: SyncRealtimePayload,
    offset: number,
    projectNameOverride?: string,
  ): SyncRealtimePayload => {
    const newProjectId = payload.project.id + offset;

    const folderIdMap = new Map<number, number>();
    payload.folders.forEach((folder) => {
      folderIdMap.set(folder.id, folder.id + offset);
    });

    const entityIdMap = new Map<number, number>();
    payload.entities.forEach((entity) => {
      entityIdMap.set(entity.id, entity.id + offset);
    });

    const remappedFolders = payload.folders.map((folder) => ({
      ...folder,
      id: folder.id + offset,
      project_id: newProjectId,
      padre_id:
        folder.padre_id !== null
          ? (folderIdMap.get(folder.padre_id) ?? folder.padre_id + offset)
          : null,
    }));

    const remappedEntities = payload.entities.map((entity) => ({
      ...entity,
      id: entity.id + offset,
      project_id: newProjectId,
      carpeta_id:
        entity.carpeta_id !== null
          ? (folderIdMap.get(entity.carpeta_id) ?? entity.carpeta_id + offset)
          : null,
    }));

    const remappedRelationships = payload.relationships.map((relationship) => ({
      ...relationship,
      id: relationship.id + offset,
      project_id: newProjectId,
      origen_id:
        entityIdMap.get(relationship.origen_id) ??
        relationship.origen_id + offset,
      destino_id:
        entityIdMap.get(relationship.destino_id) ??
        relationship.destino_id + offset,
    }));

    return {
      ...payload,
      project: {
        ...payload.project,
        id: newProjectId,
        nombre: projectNameOverride || payload.project.nombre,
      },
      folders: remappedFolders,
      entities: remappedEntities,
      relationships: remappedRelationships,
    };
  };

  const resolveUniqueProjectName = (
    baseName: string,
    reservedNames: Set<string>,
    backupName: string,
  ): string => {
    if (!reservedNames.has(baseName)) {
      reservedNames.add(baseName);
      return baseName;
    }

    const backupCandidate = `${baseName} (${backupName})`;
    if (!reservedNames.has(backupCandidate)) {
      reservedNames.add(backupCandidate);
      return backupCandidate;
    }

    let suffix = 2;
    let candidate = `${backupCandidate} #${suffix}`;
    while (reservedNames.has(candidate)) {
      suffix += 1;
      candidate = `${backupCandidate} #${suffix}`;
    }
    reservedNames.add(candidate);
    return candidate;
  };

  const runWithConcurrencyLimit = async <T>(
    items: T[],
    concurrencyLimit: number,
    worker: (item: T, index: number) => Promise<void>,
  ): Promise<void> => {
    let nextIndex = 0;
    const totalWorkers = Math.min(concurrencyLimit, items.length);

    const workers = Array.from({ length: totalWorkers }, async () => {
      let shouldContinue = true;
      while (shouldContinue) {
        const currentIndex = nextIndex;
        nextIndex += 1;

        if (currentIndex >= items.length) {
          shouldContinue = false;
        } else {
          await worker(items[currentIndex], currentIndex);
        }
      }
    });

    await Promise.all(workers);
  };

  const {
    data: workspaces = [],
    isLoading: listLoading,
    refetch: refetchWorkspaces,
  } = useQuery<Proyecto[]>({
    queryKey: ["workspaces", "list"],
    queryFn: async () => {
      return await WorkspaceUseCase.listProjects();
    },
  });

  const loading = listLoading || actionLoading;

  const handleSelect = async (projectName: string) => {
    try {
      const selected = workspaces.find((w) => w.nombre === projectName);
      if (selected) {
        await setLastProjectId(selected.id);
      }
      await setUser({ username: "local" });
      navigate(`/local/${projectName}`);
    } catch (err: unknown) {
      setError((err as Error).message || "Fallo al entrar al cuaderno");
    }
  };

  const handleSaveWorkspace = async (formData: {
    nombre: string;
    descripcion: string;
    tag: string;
    coverUrl: string;
  }) => {
    try {
      setActionLoading(true);
      // Slug seguro derivado del nombre
      const nameSlug = formData.nombre
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\w-]/g, "");

      switch (isCreating) {
        case true: {
          const res = await WorkspaceUseCase.createProject(
            nameSlug,
            formData.nombre,
            formData.tag,
            formData.coverUrl,
          );
          // Actualizar descripción si se ingresó
          if (res && formData.descripcion) {
            await WorkspaceUseCase.updateProject(res.id, {
              descripcion: formData.descripcion,
            });
          }
          await queryClient.invalidateQueries({
            queryKey: ["workspaces", "list"],
          });
          if (res) await handleSelect(res.nombre);
          break;
        }
        default: {
          if (projectToEdit) {
            await WorkspaceUseCase.updateProject(projectToEdit.id, {
              nombre: formData.nombre,
              descripcion: formData.descripcion,
              tag: formData.tag,
              image_url: formData.coverUrl,
            });
            await queryClient.invalidateQueries({
              queryKey: ["workspaces", "list"],
            });
            await refetchWorkspaces();
            setProjectToEdit(null);
          }
          break;
        }
      }
      setIsCreating(false);
    } catch (err) {
      setError("Error al guardar la configuración del cuaderno");
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (projectToDelete !== null) {
      try {
        setActionLoading(true);
        await WorkspaceUseCase.deleteProject(projectToDelete);
        await queryClient.invalidateQueries({
          queryKey: ["workspaces", "list"],
        });
        await refetchWorkspaces();
        setProjectToDelete(null);
      } catch (err) {
        setError("Error al borrar el cuaderno");
      } finally {
        setActionLoading(false);
      }
    }
  };

  const handleExport = async () => {
    try {
      if (workspaces.length === 0) {
        setError("No hay proyectos para respaldar.");
        return;
      }

      setActionLoading(true);
      setLoadingProgress(5);
      setLoadingMessage("Preparando respaldos por proyecto...");

      const initialProjectProgress: ProjectProgressItem[] = workspaces.map(
        (workspace, index) => ({
          key: `backup-${workspace.id}-${index}`,
          label: workspace.nombre,
          status: "pending",
          progress: 0,
        }),
      );
      setProjectProgress(initialProjectProgress);

      let completedCount = 0;
      const failedProjects: string[] = [];

      await runWithConcurrencyLimit(
        workspaces,
        MAX_PARALLEL_TASKS,
        async (workspace, index) => {
          setProjectProgress((prev) =>
            prev.map((item, itemIndex) =>
              itemIndex === index
                ? { ...item, status: "running", progress: 35 }
                : item,
            ),
          );

          const res = await WorkspaceUseCase.exportBackup(workspace.nombre);

          completedCount += 1;
          setLoadingProgress(
            10 + Math.round((completedCount / workspaces.length) * 85),
          );
          setLoadingMessage(
            `Respaldando proyectos ${completedCount}/${workspaces.length}...`,
          );

          if (!res.success) {
            failedProjects.push(`${workspace.nombre}: ${res.message}`);
          }

          setProjectProgress((prev) =>
            prev.map((item, itemIndex) =>
              itemIndex === index
                ? {
                    ...item,
                    status: res.success ? "completed" : "error",
                    progress: 100,
                  }
                : item,
            ),
          );
        },
      );

      setStatusModal({
        title: "Respaldos completados",
        message: `Se procesaron ${workspaces.length} proyecto/s.${failedProjects.length > 0 ? ` Fallos: ${failedProjects.slice(0, 3).join(" | ")}${failedProjects.length > 3 ? " ..." : ""}` : " Todo correcto."}`,
      });
    } catch (err) {
      setError("Fallo en el respaldo de la base de datos.");
    } finally {
      setLoadingProgress(100);
      setActionLoading(false);
    }
  };

  const prepareServerImport = async () => {
    setImportConfirmOpen(true);
  };

  const executeImport = async () => {
    try {
      setActionLoading(true);
      setLoadingProgress(5);
      setLoadingMessage("Leyendo respaldos del servidor...");
      setProjectProgress([]);
      const backups = await WorkspaceUseCase.listAvailableBackups();
      if (backups.length === 0) {
        setError("No se encontraron respaldos en el servidor local.");
        return;
      }

      const snapshotsToMerge: SnapshotEntry[] = [];
      const failedBackups: string[] = [];
      let totalDetectedProjects = 0;
      const snapshotBuildErrors: string[] = [];
      const detectedProjectsByBackup: Array<{
        backupName: string;
        projectNames: string[];
      }> = [];

      for (
        let backupIndex = 0;
        backupIndex < backups.length;
        backupIndex += 1
      ) {
        const backupName = backups[backupIndex];
        setLoadingMessage(
          `Analizando respaldo ${backupIndex + 1}/${backups.length}...`,
        );
        setLoadingProgress(
          10 + Math.round(((backupIndex + 1) / backups.length) * 35),
        );
        const importRes = await WorkspaceUseCase.importBackup(backupName);

        if (!importRes.success) {
          failedBackups.push(backupName);
          continue;
        }

        const projectsInBackup = await WorkspaceUseCase.listProjects();
        totalDetectedProjects += projectsInBackup.length;
        detectedProjectsByBackup.push({
          backupName,
          projectNames: projectsInBackup.map((project) => project.nombre),
        });

        for (
          let projectIndex = 0;
          projectIndex < projectsInBackup.length;
          projectIndex += 1
        ) {
          const project = projectsInBackup[projectIndex];
          const progressKey = `import-${backupIndex}-${project.id}-${projectIndex}`;

          setProjectProgress((prev) => [
            ...prev,
            {
              key: progressKey,
              label: `${project.nombre} · ${backupName}`,
              status: "pending",
              progress: 10,
            },
          ]);

          const snapshotRes =
            await syncService.buildRealtimeSnapshotFromProject(project);

          if (snapshotRes.success && snapshotRes.payload) {
            snapshotsToMerge.push({
              payload: snapshotRes.payload,
              backupName,
              backupIndex,
              progressKey,
            });

            setProjectProgress((prev) =>
              prev.map((item) =>
                item.key === progressKey
                  ? { ...item, status: "pending", progress: 25 }
                  : item,
              ),
            );
          } else {
            snapshotBuildErrors.push(project.nombre);
            setProjectProgress((prev) =>
              prev.map((item) =>
                item.key === progressKey
                  ? { ...item, status: "error", progress: 100 }
                  : item,
              ),
            );
          }
        }
      }

      const seedBackup = backups[0];
      setLoadingMessage("Inicializando base local para fusión...");
      setLoadingProgress(50);
      const seedImportRes = await WorkspaceUseCase.importBackup(seedBackup);
      if (!seedImportRes.success) {
        setError(seedImportRes.message);
        return;
      }

      let mergedProjects = 0;
      let updatedProjects = 0;
      let separateCounter = 0;
      const projectErrors: string[] = [];
      const totalSnapshots = snapshotsToMerge.length;

      for (
        let snapshotIndex = 0;
        snapshotIndex < snapshotsToMerge.length;
        snapshotIndex += 1
      ) {
        const entry = snapshotsToMerge[snapshotIndex];
        setLoadingMessage(
          `Fusionando proyecto ${snapshotIndex + 1}/${totalSnapshots || 1}...`,
        );
        setLoadingProgress(
          55 + Math.round(((snapshotIndex + 1) / (totalSnapshots || 1)) * 40),
        );
        const sharedRunningProgress =
          30 + Math.round(((snapshotIndex + 1) / (totalSnapshots || 1)) * 60);
        setProjectProgress((prev) =>
          prev.map((item, index) =>
            item.key !== entry.progressKey ||
            item.status === "completed" ||
            item.status === "updated" ||
            item.status === "error"
              ? item
              : {
                  ...item,
                  status: "running",
                  progress: Math.max(
                    item.progress,
                    Math.min(95, sharedRunningProgress),
                  ),
                },
          ),
        );
        const currentProjects = await WorkspaceUseCase.listProjects();
        const exactMatch = currentProjects.find(
          (project) =>
            project.id === entry.payload.project.id &&
            project.nombre === entry.payload.project.nombre,
        );

        let candidatePayload: SyncRealtimePayload = entry.payload;
        if (!exactMatch) {
          const reservedNames = new Set(
            currentProjects.map((project) => project.nombre),
          );
          const uniqueProjectName = resolveUniqueProjectName(
            entry.payload.project.nombre,
            reservedNames,
            entry.backupName,
          );

          const offset =
            (entry.backupIndex + 1) * 1000000 + (separateCounter + 1) * 10000;
          candidatePayload = remapSnapshotIds(
            entry.payload,
            offset,
            uniqueProjectName,
          );
          separateCounter += 1;
        }

        const applyRes =
          await syncService.applyRealtimeSnapshot(candidatePayload);
        if (applyRes.success) {
          exactMatch ? (updatedProjects += 1) : (mergedProjects += 1);
          setProjectProgress((prev) =>
            prev.map((item) =>
              item.key === entry.progressKey
                ? {
                    ...item,
                    status: exactMatch ? "updated" : "completed",
                    progress: 100,
                  }
                : item,
            ),
          );
        } else {
          projectErrors.push(
            `${entry.payload.project.nombre}: ${applyRes.message}`,
          );
          setProjectProgress((prev) =>
            prev.map((item) =>
              item.key === entry.progressKey
                ? { ...item, status: "error", progress: 100 }
                : item,
            ),
          );
        }
      }

      await queryClient.invalidateQueries({
        queryKey: ["workspaces", "list"],
      });
      await refetchWorkspaces();
      setLoadingMessage("Finalizando importación...");
      setLoadingProgress(100);

      setStatusModal({
        title: "Importación completada",
        message: `Respaldos leidos: ${backups.length}. Respaldos omitidos: ${failedBackups.length}. Proyectos detectados: ${totalDetectedProjects}. Proyectos listos para fusionar: ${snapshotsToMerge.length}. Proyectos separados: ${mergedProjects}. Proyectos actualizados: ${updatedProjects}. Fallos al construir snapshot: ${snapshotBuildErrors.length}. Errores SQL/merge: ${projectErrors.length}.`,
      });
    } catch (err) {
      setError("Error al importar datos.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusAcknowledge = (): void => {
    setStatusModal(null);
  };

  const filteredWorkspaces = workspaces.filter((w) =>
    (w.nombre || w.descripcion || "")
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  return {
    navigate,
    workspaces,
    loading,
    loadingProgress,
    loadingMessage,
    projectProgress,
    error,
    setError,
    searchTerm,
    setSearchTerm,
    isCreating,
    setIsCreating,
    projectToEdit,
    setProjectToEdit,
    projectToDelete,
    setProjectToDelete,
    importConfirmOpen,
    setImportConfirmOpen,
    statusModal,
    setStatusModal,
    handleSelect,
    handleSaveWorkspace,
    handleDeleteConfirm,
    handleExport,
    prepareServerImport,
    executeImport,
    handleStatusAcknowledge,
    filteredWorkspaces,
  };
};
