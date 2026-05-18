import React, { useState, useMemo, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { WorldBibleUseCase } from '@application/useCases/WorldBibleUseCase';
import { Carpeta } from '@domain/models/database';
import { ArchitectContext } from '@domain/models/ui';
import { useRightPanelStore } from '@store/useRightPanelStore';
import { useWorldBibleData, useWorldBibleFolderData, useWorldBibleFolderDetails } from '../hooks/useWorldBibleData';
import { useWorldBibleMutations } from '../hooks/useWorldBibleMutations';

export const useWorldBibleLayout = (architectContext: ArchitectContext) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectName, folderId: folderIdParam, entityId } = useParams();
  const projectId = architectContext?.projectId;

  const openPanel = useRightPanelStore(state => state.openPanel);
  const closePanel = useRightPanelStore(state => state.closePanel);
  const setActiveTab = useRightPanelStore(state => state.setActiveTab);
  
  const [viewMode, setViewMode] = useState<'folders' | 'table'>('folders');
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [targetParent, setTargetParent] = useState<Carpeta | null>(null);

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
  const { data: folderContent } = useWorldBibleFolderData(projectId || 0, currentFolderId);
  const { createEntity, createCategory, bulkDelete } = useWorldBibleMutations(projectId || 0);
  const { data: folderDetails } = useWorldBibleFolderDetails(currentFolderId);

  const localEntities = useMemo(() => {
    const safeEntities = Array.isArray(rootEntities) ? rootEntities : [];
    if (isRoot) {
      // En la raíz, mostramos las entidades que NO tienen carpeta_id
      return safeEntities.filter(e => !e.carpeta_id);
    }
    return folderContent?.entities || [];
  }, [isRoot, rootEntities, folderContent]);

  const localFolders = useMemo(() => {
    if (isRoot) {
      return (architectContext.folders || []).filter(f => !f.padre_id);
    }
    return folderContent?.folders || []; 
  }, [isRoot, architectContext.folders, folderContent]);

  const currentFolder = useMemo(() => {
    if (isRoot) return null;
    // Prioridad: 1. Detalles cargados por ID, 2. Búsqueda en el contexto global, 3. Fallback
    return folderDetails || (architectContext.folders || []).find(f => f.id === currentFolderId) || null;
  }, [isRoot, folderDetails, architectContext.folders, currentFolderId]);

  const isEditorView = useMemo(() => {
    return location.pathname.includes('/entity/') || location.pathname.includes('/dimension');
  }, [location.pathname]);

  const dynamicTitle = useMemo(() => {
    if (isRoot) return "Biblia del Mundo";
    
    if (location.pathname.includes('/dimension')) {
       return currentFolder ? `Dimensión: ${currentFolder.nombre}` : "Visor de Dimensiones";
    }

    if (location.pathname.includes('/entity/')) {
       return "Ficha de Entidad";
    }

    return currentFolder ? currentFolder.nombre : "Explorador de Archivos";
  }, [isRoot, location.pathname, currentFolder]);

  const handleOpenCreateModal = useCallback((folder: Carpeta | null = null) => {
    // Si estamos en una ruta de carpeta, FORZAMOS que el padre no sea null usando el ID de la URL
    const effectiveParentId = folder?.id || currentFolderId;
    
    if (effectiveParentId) {
      setTargetParent({ 
        id: Number(effectiveParentId), 
        nombre: folder?.nombre || folderDetails?.nombre || '...' 
      } as Carpeta);
    } else {
      setTargetParent(null);
    }
    setCreationModalOpen(true);
  }, [currentFolderId, folderDetails, currentFolder]);

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

  const handleCreateSubmit = useCallback(async (formData: { nombre: string; tipo: string; descripcion?: string }) => {
    if (!projectId) {
      console.warn("No se puede crear: Project ID no encontrado");
      return;
    }

    try {
      if (isRoot) {
        await createCategory({ 
          nombre: formData.nombre, 
          type: 'folder',
          projectId: projectId 
        });
      } else if (currentFolderId) {
        await createEntity({
          nombre: formData.nombre,
          descripcion: formData.descripcion || '',
          tipo: formData.tipo || 'personaje',
          carpeta_id: currentFolderId,
          project_id: projectId,
        });
      }
    } catch (err) {
      console.error(err);
    }
    setCreationModalOpen(false);
  }, [projectId, isRoot, currentFolderId, createCategory, createEntity]);

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
    projectName,
    projectId,
    navigate,
    openPanel,
    closePanel,
    setActiveTab,
    currentFolderId,
    setTargetParent,
    entityId
  };
};
