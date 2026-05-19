import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Carpeta, Entidad } from "@domain/models/database";

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
    handleRenameFolder,
  } = context;

  // Logic: Filter content based on Search and Type
  const filteredFolders = useMemo(() => {
    return folders.filter((f) =>
      f.nombre.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [folders, searchTerm]);

  const filteredEntities = useMemo(() => {
    return entities.filter((e) => {
      const matchesSearch = e.nombre
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
      const matchesType = filterType === "ALL" || e.tipo === filterType;
      return matchesSearch && matchesType;
    });
  }, [entities, searchTerm, filterType]);

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
