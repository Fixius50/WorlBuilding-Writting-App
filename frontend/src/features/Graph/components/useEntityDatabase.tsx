import { useState, useEffect, useMemo, useCallback } from 'react';
import { RelationshipUseCase } from '@application/useCases/RelationshipUseCase';
import { Entidad, Carpeta } from '@domain/models/database';

/**
 * 🧠 useEntityDatabase
 * Logic for managing the entity database in the graph feature.
 */
export const useEntityDatabase = (projectId?: number) => {
  const [allEntities, setAllEntities] = useState<Entidad[]>([]);
  const [folders, setFolders] = useState<Carpeta[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [folderFilter, setFolderFilter] = useState<number | 'ALL'>('ALL');
  const [selectedEntity, setSelectedEntity] = useState<Entidad | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { entities } = await RelationshipUseCase.getFullNetwork(projectId);
      const folds = await RelationshipUseCase.getNetworkFolders(projectId);
      setAllEntities(entities.filter(e => !e.borrado));
      setFolders(folds);
    } catch { /* silencioso */ }
    setLoading(false);
  }, [projectId]);

  useEffect(() => { load(); }, [load]);

  // Escucha actualizaciones globales
  useEffect(() => {
    const handler = () => load();
    window.addEventListener('folder-update', handler);
    window.addEventListener('map-updated', handler);
    return () => {
      window.removeEventListener('folder-update', handler);
      window.removeEventListener('map-updated', handler);
    };
  }, [load]);

  const filtered = useMemo(() => {
    return allEntities.filter(e => {
      const matchSearch = !searchTerm ||
        e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (e.descripcion?.toLowerCase().includes(searchTerm.toLowerCase()) ?? false);
      const matchType = typeFilter === 'ALL' || e.tipo === typeFilter;
      const matchFolder = folderFilter === 'ALL' || e.carpeta_id === folderFilter;
      return matchSearch && matchType && matchFolder;
    });
  }, [allEntities, searchTerm, typeFilter, folderFilter]);

  const selectedEntityAttrs = useMemo(() => {
    if (!selectedEntity) return {};
    try {
      return typeof selectedEntity.contenido_json === 'string'
        ? JSON.parse(selectedEntity.contenido_json)
        : (selectedEntity.contenido_json || {});
    } catch { return {}; }
  }, [selectedEntity]);

  const folderName = (folderId: number | null) =>
    folders.find(f => f.id === folderId)?.nombre ?? '—';

  return {
    allEntities,
    folders,
    searchTerm, setSearchTerm,
    typeFilter, setTypeFilter,
    folderFilter, setFolderFilter,
    selectedEntity, setSelectedEntity,
    loading,
    filtered,
    selectedEntityAttrs,
    folderName,
    load
  };
};
