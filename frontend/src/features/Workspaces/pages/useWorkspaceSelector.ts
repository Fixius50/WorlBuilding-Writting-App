import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { WorkspaceUseCase } from "@features/Workspaces";
import { Proyecto } from "@domain/database";
import { useAppStore } from "@features/App";

export const useWorkspaceSelector = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const setUser = useAppStore((state) => state.setUser);
  const setLastProjectId = useAppStore((state) => state.setLastProjectId);
  const [actionLoading, setActionLoading] = useState(false);
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
      setActionLoading(true);
      const res = await WorkspaceUseCase.exportBackup("worldbuilding_master");
      switch (res.success) {
        case true:
          setStatusModal({
            title: "Exportación completada",
            message:
              "La copia de seguridad se guardó correctamente en el servidor local.",
          });
          break;
        default:
          setError(res.message);
          break;
      }
    } catch (err) {
      setError("Fallo en el respaldo de la base de datos.");
    } finally {
      setActionLoading(false);
    }
  };

  const executeImport = async () => {
    try {
      setActionLoading(true);
      const res = await WorkspaceUseCase.importBackup("worldbuilding_master");
      switch (res.success) {
        case true:
          setStatusModal({
            title: "Importación completada",
            message:
              "Los datos se restauraron correctamente. La aplicación se recargará para aplicar los cambios.",
          });
          break;
        default:
          setError(res.message);
          break;
      }
    } catch (err) {
      setError("Error al importar datos.");
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusAcknowledge = (): void => {
    switch (statusModal?.title) {
      case "Importación completada":
        setStatusModal(null);
        window.location.reload();
        break;
      default:
        setStatusModal(null);
        break;
    }
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
    executeImport,
    handleStatusAcknowledge,
    filteredWorkspaces,
  };
};
