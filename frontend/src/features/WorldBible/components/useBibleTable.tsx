import { useState, useMemo, useCallback } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
} from '@tanstack/react-table';
import { Entidad } from '@domain/models/database';
import { WorldBibleUseCase } from '@application/useCases/WorldBibleUseCase';
import { useRightPanelStore } from '@store/useRightPanelStore';
import { useWorldBibleData } from '../hooks/useWorldBibleData';
import { useWorldBibleMutations } from '../hooks/useWorldBibleMutations';

/**
 * 🧠 useBibleTable
 * Logic for managing the world bible table, including filtering, selection, and bulk actions.
 * Powered by TanStack Query + Optimistic UI.
 */
export const useBibleTable = (
  projectId: number,
  searchTerm: string,
  filterType: string = 'ALL'
) => {
  const { data: entities = [], isLoading: loading, refetch: loadEntities } = useWorldBibleData(projectId);
  const { createEntity, bulkDelete, isCreating } = useWorldBibleMutations(projectId);

  const [rowSelection, setRowSelection] = useState({});
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isMassCreateOpen, setIsMassCreateOpen] = useState(false);
  const [newEntityName, setNewEntityName] = useState('');
  const [newEntityType, setNewEntityType] = useState('personaje');
  const [newEntityFolderId, setNewEntityFolderId] = useState<number | null>(null);

  const { openPanel, closePanel, isOpen: isPanelOpen } = useRightPanelStore();

  const filteredData = useMemo(() => {
    return entities.filter(e => {
      const matchesSearch = e.nombre.toLowerCase().includes(searchTerm.toLowerCase());
      if (!matchesSearch) return false;

      if (filterType === 'ALL') return true;
      if (filterType === 'SPACES') return false; 
      if (filterType === 'ENTITIES') return !['mapa', 'timeline', 'map', 'linea_temporal'].includes(e.tipo.toLowerCase());
      if (filterType === 'MAPS') return ['mapa', 'map'].includes(e.tipo.toLowerCase());
      if (filterType === 'TIMELINES') return ['timeline', 'linea_temporal'].includes(e.tipo.toLowerCase());
      return true;
    });
  }, [entities, filterType, searchTerm]);

  const confirmBulkDelete = async () => {
    const selectedIds = Object.keys(rowSelection).map(idx => {
      const rowIndex = Number(idx);
      return filteredData[rowIndex]?.id;
    }).filter(id => id !== undefined) as number[];

    if (!selectedIds.length) return;
    
    try {
      await bulkDelete(selectedIds);
      setRowSelection({});
    } catch (err) { }
  };

  const handleUpdateField = async (id: number, field: string, value: any) => {
    try {
      await WorldBibleUseCase.quickUpdateEntity(id, field, value);
      loadEntities();
    } catch (err) { }
  };

  const handleGhostCreate = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && newEntityName.trim() && !isCreating) {
      const name = newEntityName.trim();
      setNewEntityName('');
      
      try {
        await createEntity({
          nombre: name,
          tipo: newEntityType,
          project_id: projectId,
          carpeta_id: newEntityFolderId,
          descripcion: '',
          slug: name.toLowerCase().replace(/\s+/g, '-'),
          contenido_json: null,
          folder_slug: null,
          imagen_url: null
        } as any);
      } catch (err) { }
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
