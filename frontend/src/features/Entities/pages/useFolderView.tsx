import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { WorkspaceUseCase } from '@application/useCases/WorkspaceUseCase';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { Entidad, Carpeta } from '@domain/models/database';

// --- Interfaces ---
export interface FolderViewContext {
  projectId: number;
  handleDeleteEntity: (id: number, folderId: number) => void;
  handleDeleteFolder: (id: number) => void;
  handleCreateSimpleFolder: (padreId: number, tipo: string) => void;
  searchTerm: string;
  filterType: string;
  folders: Carpeta[];
  projectName: string;
}

/**
 * 🧠 useFolderView
 * Logic hook for FolderView.
 */
export const useFolderView = () => {
  const { folderId } = useParams();
  const navigate = useNavigate();
  
  const {
    searchTerm: folderSearchTerm,
    filterType: folderFilterType,
    projectName
  } = useOutletContext<FolderViewContext>();

  const [entities, setEntities] = useState<Entidad[]>([]);
  const [subfolders, setSubfolders] = useState<Carpeta[]>([]);
  const [currentFolder, setCurrentFolder] = useState<Carpeta | null>(null);
  const [path, setPath] = useState<Carpeta[]>([]);
  const [loading, setLoading] = useState(true);

  // --- Right Panel ---
  useEffect(() => {
    // Panel derecho eliminado: antes abría "Explorador" en modo bulk.
  }, []);

  // --- Data Loading ---
  const loadContent = useCallback(async () => {
    if (!folderId) return;
    setLoading(true);
    try {
      const id = Number(folderId);
      const folder = await WorkspaceUseCase.getFolderById(id);
      setCurrentFolder(folder);

      const [ents, subs, pth] = await Promise.all([
        EntityUseCase.getByFolder(id),
        WorkspaceUseCase.getSubfolders(id),
        WorkspaceUseCase.getFolderPath(id)
      ]);
      setEntities(ents);
      setSubfolders(subs);
      setPath(pth.slice(0, -1));
    } catch (err) {
      console.error("Error loading folder content:", err);
    } finally {
      setLoading(false);
    }
  }, [folderId]);

  useEffect(() => {
    loadContent();

    const handleUpdate = (e: Event) => {
      const { folderId: updatedFolderId } = (e as CustomEvent<{ folderId: number }>).detail || {};
      if (Number(updatedFolderId) === Number(folderId)) {
        loadContent();
      }
    };

    window.addEventListener('folder-update', handleUpdate);
    return () => window.removeEventListener('folder-update', handleUpdate);
  }, [folderId, loadContent]);

  // --- Filtering ---
  const filteredContent = useMemo(() => {
    const searchTermLower = (folderSearchTerm || '').toLowerCase();
    
    const fFolders = subfolders.filter(f => 
      f.nombre.toLowerCase().includes(searchTermLower)
    );
    
    const fEntities = entities.filter(e => {
      const matchesSearch = e.nombre.toLowerCase().includes(searchTermLower);
      const matchesFilter = folderFilterType === 'ALL' || e.tipo === folderFilterType;
      return matchesSearch && matchesFilter;
    });

    let finalFolders = fFolders;
    let finalEntities = fEntities;

    if (folderFilterType === 'SPACES') {
      finalEntities = [];
    } else if (folderFilterType === 'ENTITIES') {
      finalFolders = [];
      finalEntities = fEntities.filter(e => e.tipo !== 'MAPA' && e.tipo !== 'TIMELINE');
    } else if (folderFilterType === 'MAPS') {
      finalFolders = [];
      finalEntities = fEntities.filter(e => e.tipo === 'MAPA' || e.tipo === 'MAP');
    } else if (folderFilterType === 'TIMELINES') {
      finalFolders = [];
      finalEntities = fEntities.filter(e => e.tipo === 'TIMELINE' || e.tipo === 'LINEA_TEMPORAL');
    }

    return { folders: finalFolders, entities: finalEntities };
  }, [subfolders, entities, folderSearchTerm, folderFilterType]);

  return {
    folderId,
    projectName,
    loading,
    filteredContent,
    navigate,
    currentFolder,
    path
  };
};
