import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { WorldBibleUseCase } from '@application/useCases/WorldBibleUseCase';
import { Carpeta } from '@domain/models/database';
import { ArchitectContext } from '@domain/models/ui';
import { useRightPanelStore } from '@store/useRightPanelStore';

/**
 * 🧠 useWorldBibleLayout
 * Orchestrates navigation, searching, and node lifecycle in WorldBible.
 */
export const useWorldBibleLayout = (architectContext: ArchitectContext) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { projectName } = useParams();
  const { openPanel, closePanel, setActiveTab } = useRightPanelStore();
  
  const [viewMode, setViewMode] = useState<'folders' | 'table'>('folders');
  const [creationModalOpen, setCreationModalOpen] = useState(false);
  const [targetParent, setTargetParent] = useState<Carpeta | null>(null);
  
  const [localEntities, setLocalEntities] = useState<any[]>([]);
  const [localFolders, setLocalFolders] = useState<Carpeta[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Carpeta | null>(null);

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<number | null>(null);

  const isRoot = useMemo(() => {
    const path = location.pathname.split('?')[0];
    return path.endsWith('/bible') || path.endsWith('/bible/');
  }, [location.pathname]);

  const isEditorView = useMemo(() => {
    return location.pathname.includes('/entity/') || location.pathname.includes('/dimension');
  }, [location.pathname]);

  const dynamicTitle = useMemo(() => {
    if (isRoot) return "Biblia del Mundo";
    
    if (location.pathname.includes('/dimension')) {
       const folderMatch = location.pathname.match(/\/folder\/(\d+)/);
       if (folderMatch) {
         const id = Number(folderMatch[1]);
         const folder = architectContext?.folders?.find(f => f.id === id);
         return folder ? `Dimensión: ${folder.nombre}` : "Visor de Dimensiones";
       }
       return "Visor de Dimensiones";
    }

    if (location.pathname.includes('/entity/')) {
       return "Ficha de Entidad";
    }

    const folderMatch = location.pathname.match(/\/folder\/(\d+)/);
    if (folderMatch) {
      const id = Number(folderMatch[1]);
      const folder = architectContext?.folders?.find(f => f.id === id);
      return folder ? folder.nombre : "Explorador de Archivos";
    }

    return "Biblia del Mundo";
  }, [isRoot, location.pathname, architectContext?.folders]);

  const loadData = useCallback(async () => {
    if (!architectContext?.projectId) return;
    if (isRoot) {
      const roots = (architectContext.folders || []).filter(f => !f.padre_id);
      setLocalFolders(roots);
      setLocalEntities([]);
      setCurrentFolder(null);
    } else {
      const match = location.pathname.match(/\/folder\/(\d+)/);
      if (match) {
        const currentFolderId = Number(match[1]);
        const folder = architectContext.folders?.find(f => f.id === currentFolderId);
        setCurrentFolder(folder || null);
        const { entities } = await WorldBibleUseCase.getFolderContent(currentFolderId);
        setLocalEntities(entities);
        setLocalFolders([]);
      }
    }
  }, [isRoot, location.pathname, architectContext?.projectId, architectContext?.folders]);

  useEffect(() => {
    loadData();
    window.addEventListener('folder-update', loadData);
    window.addEventListener('entity-update', loadData);
    return () => {
      window.removeEventListener('folder-update', loadData);
      window.removeEventListener('entity-update', loadData);
    };
  }, [loadData]);

  const handleOpenCreateModal = useCallback((parentFolder: Carpeta | null = null) => {
    setTargetParent(parentFolder);
    setCreationModalOpen(true);
  }, []);

  const confirmDeleteEntity = useCallback(async () => {
    if (entityToDelete) {
      try {
        await WorldBibleUseCase.deleteEntity(entityToDelete);
        window.dispatchEvent(new CustomEvent('entity-update'));
        setEntityToDelete(null);
        setDeleteConfirmOpen(false);
      } catch (err) {
        console.error(err);
      }
    }
  }, [entityToDelete]);

  const handleCreateSubmit = useCallback(async (formData: { nombre: string; tipo: string; descripcion?: string }) => {
    if (architectContext?.projectId) {
      try {
        if (isRoot) {
          await WorldBibleUseCase.createCategory(formData.nombre, architectContext.projectId, 'FOLDER');
          window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: null } }));
        } else {
          const currentFolderId = Number(location.pathname.match(/\/folder\/(\d+)/)?.[1]);
          if (currentFolderId) {
            const baseSlug = formData.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
            await WorldBibleUseCase.createEntity({
              nombre: formData.nombre,
              descripcion: formData.descripcion || '',
              tipo: formData.tipo || 'PERSONAJE',
              carpeta_id: currentFolderId,
              project_id: architectContext.projectId,
              slug: baseSlug,
              contenido_json: null,
              folder_slug: null,
              imagen_url: null
            } as any);
            window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: currentFolderId } }));
            window.dispatchEvent(new CustomEvent('entity-update'));
          }
        }
      } catch (err) {
        console.error(err);
      }
      setCreationModalOpen(false);
    }
  }, [architectContext?.projectId, isRoot, location.pathname]);

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
    navigate,
    openPanel,
    closePanel,
    setActiveTab
  };
};
