import { useState, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Carpeta, Entidad } from '@domain/models/database';

interface BibleContext {
  handleOpenCreateModal: () => void;
  handleDeleteFolder: (id: string | number) => void;
  handleCreateSimpleFolder: (parentId: string | number | null, type: string) => void;
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
  const { projectName, folderId } = useParams();
  const navigate = useNavigate();
  const isInsideFolder = !!folderId;

  const {
    folders = [],
    entities = [],
    searchTerm = '',
    filterType = 'ALL',
    handleRenameFolder
  } = context;

  // Logic: Filter content based on Search and Type
  const filteredFolders = useMemo(() => {
    return folders.filter(f => 
      f.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [folders, searchTerm]);

  const filteredEntities = useMemo(() => {
    return entities.filter(e => {
      const matchesSearch = e.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'ALL' || e.tipo === filterType;
      return matchesSearch && matchesType;
    });
  }, [entities, searchTerm, filterType]);

  // Rename State
  const [renamingFolderId, setRenamingFolderId] = useState<string | number | null>(null);
  const [renameValue, setRenameValue] = useState('');

  const handleRenameSubmit = useCallback(async (id: string | number, name: string = '') => {
    if (name && name.trim() && handleRenameFolder) {
      await handleRenameFolder(Number(id), name.trim());
    }
    setRenamingFolderId(null);
    setRenameValue('');
  }, [handleRenameFolder]);

  const startRenaming = useCallback((folder: Carpeta) => {
    setRenamingFolderId(folder.id);
    setRenameValue(folder.nombre);
  }, []);

  return {
    projectName,
    isInsideFolder,
    filteredFolders,
    filteredEntities,
    renamingFolderId,
    renameValue,
    setRenameValue,
    handleRenameSubmit,
    startRenaming
  };
};
