import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Carpeta, Entidad } from "@domain/database";

type SortDirection = "asc" | "desc";

interface BibleContext {
  handleOpenCreateModal: (
    parentId: string | number | null,
    type: string,
  ) => void;
  handleDeleteFolder: (id: string | number) => void;
  handleCreateSimpleFolder: (
    parentId: string | number | null,
    type: string,
  ) => void;
  handleRenameFolder: (id: string | number, name: string) => void;
  handleDeleteEntity: (id: number) => void;
  folders: Carpeta[];
  entities: Entidad[];
  projectId: number;
  searchTerm: string;
  filterType: string;
  sortDirection?: SortDirection;
}

/**
 * 🧠 useBibleGridView
 * Hook to handle filtering of folders and entities, renaming logic, and navigation context for the Bible Grid view.
 */
export const useBibleGridView = (context: BibleContext) => {
  const { username: urlUsername, projectName, folderId } = useParams();

  const username = urlUsername || "local";
  const isInsideFolder = !!folderId;

  const {
    folders = [],
    entities = [],
    searchTerm = "",
    filterType = "ALL",
    sortDirection = "desc",
    handleRenameFolder,
  } = context;

  const sortMultiplier = sortDirection === "asc" ? 1 : -1;

  const getNumericId = (value: number | string): number => {
    const parsedId = Number(value);
    return Number.isFinite(parsedId) ? parsedId : 0;
  };

  const getTimestamp = (value: unknown): number => {
    if (typeof value !== "string" || value.trim().length === 0) return 0;
    const parsedTime = Date.parse(value);
    return Number.isFinite(parsedTime) ? parsedTime : 0;
  };

  // Logic: Filter content based on Search and Type
  const filteredFolders = useMemo(() => {
    return [...folders]
      .filter((f) => f.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
      .sort(
        (a, b) => (getNumericId(a.id) - getNumericId(b.id)) * sortMultiplier,
      );
  }, [folders, searchTerm, sortMultiplier]);

  const filteredEntities = useMemo(() => {
    return [...entities]
      .filter((e) => {
        const matchesSearch = e.nombre
          .toLowerCase()
          .includes(searchTerm.toLowerCase());
        const matchesType = filterType === "ALL" || e.tipo === filterType;
        return matchesSearch && matchesType;
      })
      .sort((a, b) => {
        const byCreatedAt =
          (getTimestamp(a.fecha_creacion) - getTimestamp(b.fecha_creacion)) *
          sortMultiplier;
        if (byCreatedAt !== 0) return byCreatedAt;
        return (getNumericId(a.id) - getNumericId(b.id)) * sortMultiplier;
      });
  }, [entities, searchTerm, filterType, sortMultiplier]);

  // Rename State
  const [renamingFolderId, setRenamingFolderId] = useState<
    string | number | null
  >(null);
  const [renameValue, setRenameValue] = useState<string>("");

  // Additional logic based on route context
  const isNodeType = isInsideFolder;

  // Rename Submit Logic
  const handleRenameSubmit = useCallback(
    (id: string | number, newName: string) => {
      if (!newName.trim()) {
        setRenamingFolderId(null); // Cancel renaming if name is empty
        return;
      }
      handleRenameFolder(id, newName.trim());
      setRenamingFolderId(null);
    },
    [handleRenameFolder],
  );

  const startRenaming = useCallback((folder: Carpeta) => {
    setRenamingFolderId(folder.id);
    setRenameValue(folder.nombre || "");
  }, []);

  return {
    username,
    projectName,
    isInsideFolder,
    filteredFolders,
    filteredEntities,
    renamingFolderId,
    renameValue,
    setRenameValue,
    setRenamingFolderId,
    isNodeType, // Expose the type for conditional rendering
    handleRenameFolder,
    handleRenameSubmit, // Add handleRenameSubmit to the return object
    startRenaming,
  };
};
