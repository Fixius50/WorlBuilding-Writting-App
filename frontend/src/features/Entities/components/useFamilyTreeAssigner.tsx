import { useState, useEffect, useCallback } from 'react';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { RelationshipUseCase } from '@application/useCases/RelationshipUseCase';
import { WorkspaceUseCase } from '@application/useCases/WorkspaceUseCase';
import { Entidad, Relacion } from '@domain/models/database';

export interface RelacionExtendida extends Relacion {
  nombre_origen?: string;
  nombre_destino?: string;
}

export const DEFAULT_RELATIONSHIP_TYPES = [
  "PADRE",
  "MADRE",
  "HIJO",
  "HIJA",
  "HERMANO/A",
  "PAREJA/CÓNYUGE"
];

/**
 * 🧠 useFamilyTreeAssigner
 * Logic for managing family relationships and lineage assignment.
 */
export const useFamilyTreeAssigner = (entityId: number, projectId: number) => {
  const [relationships, setRelationships] = useState<RelacionExtendida[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Entidad[]>([]);
  const [selectedRelative, setSelectedRelative] = useState<Entidad | null>(null);
  const [selectedType, setSelectedType] = useState(DEFAULT_RELATIONSHIP_TYPES[0]);
  const [customType, setCustomType] = useState('');
  const [availableTypes, setAvailableTypes] = useState<string[]>(DEFAULT_RELATIONSHIP_TYPES);
  const [loading, setLoading] = useState(true);
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  const SETTINGS_KEY = `CUSTOM_REL_TYPES_${projectId}`;

  const loadRelationships = useCallback(async () => {
    setLoading(true);
    try {
      const data = await RelationshipUseCase.getRelationshipsByEntity(entityId);
      setRelationships(data as RelacionExtendida[]);
      
      const storedTypes = await WorkspaceUseCase.getSetting(SETTINGS_KEY);
      if (storedTypes) {
        const parsed = JSON.parse(storedTypes);
        setAvailableTypes([...DEFAULT_RELATIONSHIP_TYPES, ...parsed]);
      }
    } catch { }
    finally {
      setLoading(false);
    }
  }, [entityId, SETTINGS_KEY]);

  useEffect(() => { loadRelationships(); }, [loadRelationships]);

  useEffect(() => {
    const search = async () => {
      if (searchQuery.length < 2) {
        setSearchResults([]);
        return;
      }
      try {
        const all = await EntityUseCase.getAllByProject(projectId);
        const filtered = all.filter(e => {
          const matchesQuery = e.nombre.toLowerCase().includes(searchQuery.toLowerCase());
          const isNotCurrent = e.id !== entityId;
          return matchesQuery && isNotCurrent;
        });
        setSearchResults(filtered);
      } catch { }
    };
    const timer = setTimeout(search, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, projectId, entityId]);

  const handleAddRelationship = async () => {
    if (!selectedRelative) return;
    const finalType = isAddingCustom ? customType.trim().toUpperCase() : selectedType;
    if (!finalType) return;

    try {
      await RelationshipUseCase.createRelationship({
        origen_id: entityId,
        destino_id: selectedRelative.id,
        tipo: finalType,
        descripcion: '',
        project_id: projectId
      });

      if (!availableTypes.includes(finalType)) {
        const customOnly = availableTypes.filter(t => !DEFAULT_RELATIONSHIP_TYPES.includes(t));
        const updatedCustom = [...customOnly, finalType];
        await WorkspaceUseCase.saveSetting(SETTINGS_KEY, JSON.stringify(updatedCustom));
        setAvailableTypes([...DEFAULT_RELATIONSHIP_TYPES, ...updatedCustom]);
      }

      setSelectedRelative(null);
      setSearchQuery('');
      setCustomType('');
      setIsAddingCustom(false);
      loadRelationships();
    } catch { }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('¿Eliminar este vínculo genealógico?')) return;
    try {
      await RelationshipUseCase.deleteRelationship(id);
      loadRelationships();
    } catch { }
  };

  return {
    relationships,
    searchQuery, setSearchQuery,
    searchResults,
    selectedRelative, setSelectedRelative,
    selectedType, setSelectedType,
    customType, setCustomType,
    availableTypes,
    loading,
    isAddingCustom, setIsAddingCustom,
    handleAddRelationship,
    handleDelete,
    loadRelationships
  };
};
