import { useState, useEffect, useCallback } from 'react';
import { RelationshipUseCase } from '@application/useCases/RelationshipUseCase';
import { Entidad, Relacion, RelacionEnriquecida } from '@domain/models/database';

export interface EnrichedRelationship extends Omit<Relacion, 'created_at'> {
  created_at?: string;
  otherName: string;
  otherType: string;
  isOutgoing: boolean;
}

/**
 * 🧠 useRelationshipManager
 * Logic for managing bidirectional relationships between entities.
 */
export const useRelationshipManager = (entityId: number | string, entityType?: string) => {
  const [relationships, setRelationships] = useState<EnrichedRelationship[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdding, setIsAdding] = useState(false);

  // Form State
  const [targetType, setTargetType] = useState('All');
  const [targetItems, setTargetItems] = useState<Entidad[]>([]);
  const [targetSearch, setTargetSearch] = useState('');
  const [selectedTargetId, setSelectedTargetId] = useState<number | null>(null);
  const [relType, setRelType] = useState('');
  const [description, setDescription] = useState('');
  const [fetchingTargets, setFetchingTargets] = useState(false);

  const loadRelationships = useCallback(async () => {
    if (!entityId) return;
    setLoading(true);
    try {
      const relevant = await RelationshipUseCase.getRelationshipsByEntity(Number(entityId));
      
      const enriched = await Promise.all(relevant.map(async (r: RelacionEnriquecida) => {
        const isOutgoing = r.origen_id === Number(entityId);
        const otherId = isOutgoing ? r.destino_id : r.origen_id;

        const otherEntity = await RelationshipUseCase.getEntityDetails(otherId);
        if (!otherEntity) return null;
        return { 
          ...r, 
          otherName: otherEntity.nombre, 
          otherType: otherEntity.tipo || 'Entity', 
          isOutgoing 
        };
      }));

      setRelationships(enriched.filter(Boolean) as EnrichedRelationship[]);
    } catch (error) {
      console.error("Error loading relationships:", error);
    } finally {
      setLoading(false);
    }
  }, [entityId]);

  useEffect(() => {
    loadRelationships();
  }, [loadRelationships]);

  const fetchTargets = useCallback(async (type: string) => {
    setFetchingTargets(true);
    try {
      const { entities: all } = await RelationshipUseCase.getFullNetwork(1); // Placeholder project_id
      const filtered = type === 'All' ? all : all.filter(e => (e.tipo || '').toLowerCase() === type.toLowerCase());
      setTargetItems(filtered || []);
    } catch (error) {
      console.error("Error fetching targets:", error);
      setTargetItems([]);
    } finally {
      setFetchingTargets(false);
    }
  }, []);

  useEffect(() => {
    if (isAdding && targetType) {
      fetchTargets(targetType);
    }
  }, [isAdding, targetType, fetchTargets]);

  const resetForm = useCallback(() => {
    setTargetType('All');
    setTargetSearch('');
    setSelectedTargetId(null);
    setRelType('');
    setDescription('');
  }, []);

  const handleSave = useCallback(async () => {
    if (!selectedTargetId || !relType) return;

    try {
      await RelationshipUseCase.createRelationship({
        origen_id: Number(entityId),
        destino_id: selectedTargetId,
        tipo: relType,
        descripcion: description,
        project_id: 1 // Placeholder
      });
      setIsAdding(false);
      resetForm();
      await loadRelationships();
      window.dispatchEvent(new CustomEvent('relationships-update'));
    } catch (error) {
      console.error("Error saving relationship:", error);
    }
  }, [selectedTargetId, relType, entityId, description, resetForm, loadRelationships]);

  const handleDelete = useCallback(async (id: number) => {
    if (!confirm("Are you sure?")) return;
    try {
      await RelationshipUseCase.deleteRelationship(id);
      await loadRelationships();
      window.dispatchEvent(new CustomEvent('relationships-update'));
    } catch (error) {
      console.error("Error deleting relationship:", error);
    }
  }, [loadRelationships]);

  return {
    relationships,
    loading,
    isAdding,
    setIsAdding,
    targetType,
    setTargetType,
    targetItems,
    targetSearch,
    setTargetSearch,
    selectedTargetId,
    setSelectedTargetId,
    relType,
    setRelType,
    description,
    setDescription,
    fetchingTargets,
    handleSave,
    handleDelete,
    resetForm
  };
};
