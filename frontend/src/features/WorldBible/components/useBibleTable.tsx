import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Entidad } from '@domain/models/database';
import { WorldBibleUseCase } from '@application/useCases/WorldBibleUseCase';
import { useRightPanelStore } from '@store/useRightPanelStore';

/**
 * 🧠 useBibleTable
 * Logic for managing the world bible table, including filtering, selection, and bulk actions.
 */
export const useBibleTable = (
  projectId: number,
  searchTerm: string,
  filterType: string = 'ALL'
) => {
  const [entities, setEntities] = useState<Entidad[]>([]);
  const [loading, setLoading] = useState(true);
  const [rowSelection, setRowSelection] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMassCreateOpen, setIsMassCreateOpen] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityType, setNewEntityType] = useState('PERSONAJE');
  const [newEntityFolderId, setNewEntityFolderId] = useState<number | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const { openPanel, closePanel, isOpen: isPanelOpen } = useRightPanelStore();

  const loadEntities = useCallback(async () => {
    setLoading(true);
    try {
      const data = await WorldBibleUseCase.getRootEntities(projectId);
      setEntities(data);
    } catch (err) { } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadEntities();
  }, [loadEntities]);

  const filteredData = useMemo(() => {
    return entities.filter(e => {
      if (filterType === 'ALL') return true;
      if (filterType === 'SPACES') return false; 
      if (filterType === 'ENTITIES') return !['MAPA', 'TIMELINE', 'MAP', 'LINEA_TEMPORAL'].includes(e.tipo);
      if (filterType === 'MAPS') return ['MAPA', 'MAP'].includes(e.tipo);
      if (filterType === 'TIMELINES') return ['TIMELINE', 'LINEA_TEMPORAL'].includes(e.tipo);
      return true;
    });
  }, [entities, filterType]);

  const confirmBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(idx => {
      const rowIndex = Number(idx);
      return filteredData[rowIndex]?.id;
    }).filter(id => id !== undefined) as number[];

    if (!selectedIds.length) return;
    
    try {
      await WorldBibleUseCase.bulkDeleteEntities(selectedIds);
      setRowSelection({});
      await loadEntities();
    } catch (err) { }
  };

  const handleUpdateField = async (id: number, field: string, value: any) => {
    try {
      await WorldBibleUseCase.quickUpdateEntity(id, field, value);
      await loadEntities();
    } catch (err) { }
  };

  const handleGhostCreate = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newEntityName.trim() && !isCreating) {
      setIsCreating(true);
      try {
        await WorldBibleUseCase.createEntity({
          nombre: newEntityName.trim(),
          tipo: newEntityType,
          project_id: projectId,
          carpeta_id: newEntityFolderId,
          descripcion: '',
          slug: newEntityName.trim().toLowerCase().replace(/\s+/g, '-'),
          contenido_json: null,
          folder_slug: null,
          imagen_url: null
        } as any);
        setNewEntityName('');
        await loadEntities();
      } catch (err) { } finally {
        setIsCreating(false);
      }
    }
  };

  return {
    entities, loadEntities,
    loading,
    rowSelection, setRowSelection,
    isDeleteModalOpen, setIsDeleteModalOpen,
    isMassCreateOpen, setIsMassCreateOpen,
    newEntityName, setNewEntityName,
    newEntityType, setNewEntityType,
    newEntityFolderId, setNewEntityFolderId,
    isCreating,
    filteredData,
    confirmBulkDelete,
    handleUpdateField,
    handleGhostCreate,
    selectedCount: Object.keys(rowSelection).length,
    openPanel, closePanel, isPanelOpen
  };
};
