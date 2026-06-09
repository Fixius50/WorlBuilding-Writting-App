import { useState, useEffect, useCallback } from "react";
import { EntityUseCase } from "@application/useCases/EntityUseCase";
import { RelationshipUseCase } from "@application/useCases/RelationshipUseCase";
import { WorkspaceUseCase } from "@application/useCases/WorkspaceUseCase";
import { Entidad, Relacion } from "@domain/models/database";

export interface RelacionExtendida extends Relacion {
  nombre_origen?: string;
  nombre_destino?: string;
}

/**
 * 🧠 useFamilyTreeAssigner
 * Logic for managing family relationships and lineage assignment.
 */
export const useFamilyTreeAssigner = (entityId: number, projectId: number) => {
  const [relationships, setRelationships] = useState<RelacionExtendida[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Entidad[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [selectedRelatives, setSelectedRelatives] = useState<Entidad[]>([]);
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [selectedType, setSelectedType] = useState("");
  const [customType, setCustomType] = useState("");
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);
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
        if (Array.isArray(parsed)) {
          const normalized = parsed
            .map((t) =>
              String(t || "")
                .trim()
                .toUpperCase(),
            )
            .filter((t) => !!t);
          setAvailableTypes(Array.from(new Set(normalized)));
        } else {
          setAvailableTypes([]);
        }
      } else {
        setAvailableTypes([]);
      }
    } catch {
    } finally {
      setLoading(false);
    }
  }, [entityId, SETTINGS_KEY]);

  useEffect(() => {
    loadRelationships();
  }, [loadRelationships]);

  const loadSearchResults = useCallback(
    async (query: string) => {
      try {
        const all = await EntityUseCase.getAllByProject(projectId);
        const selectedIds = new Set(selectedRelatives.map((sr) => sr.id));
        const eligible = all.filter((entity) => entity.id !== entityId && !selectedIds.has(entity.id));
        const normalizedQuery = query.trim().toLowerCase();
        const filtered = normalizedQuery
          ? eligible.filter((entity) =>
              entity.nombre.toLowerCase().includes(normalizedQuery),
            )
          : eligible;
        setSearchResults(filtered);
      } catch {
        setSearchResults([]);
      }
    },
    [projectId, entityId, selectedRelatives],
  );

  useEffect(() => {
    if (!isSearchOpen) {
      return;
    }

    const timer = setTimeout(() => {
      void loadSearchResults(searchQuery);
    }, 180);

    return () => clearTimeout(timer);
  }, [searchQuery, isSearchOpen, loadSearchResults]);

  const handleAddRelationship = async () => {
    let finalTypes = [...selectedTypes];
    const cleanCustom = customType.trim().toUpperCase();
    if (isAddingCustom && cleanCustom && !finalTypes.includes(cleanCustom)) {
      finalTypes.push(cleanCustom);
    }

    if (selectedRelatives.length === 0 || finalTypes.length === 0) {
      return;
    }

    try {
      const promises = selectedRelatives.flatMap((relative) =>
        finalTypes.map((t) =>
          RelationshipUseCase.createRelationship({
            origen_id: entityId,
            destino_id: relative.id,
            tipo: t,
            descripcion: "",
            project_id: projectId,
          })
        )
      );

      await Promise.all(promises);

      const newCustoms = finalTypes.filter((t) => !availableTypes.includes(t));
      if (newCustoms.length > 0) {
        const updated = [...availableTypes, ...newCustoms];
        await WorkspaceUseCase.saveSetting(
          SETTINGS_KEY,
          JSON.stringify(updated),
        );
        setAvailableTypes(updated);
      }

      setSelectedRelatives([]);
      setSelectedTypes([]);
      setSelectedType("");
      setSearchQuery("");
      setIsSearchOpen(false);
      setCustomType("");
      setIsAddingCustom(false);
      loadRelationships();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    try {
      await RelationshipUseCase.deleteRelationship(id);
      loadRelationships();
    } catch {}
  };

  return {
    relationships,
    searchQuery,
    setSearchQuery,
    searchResults,
    isSearchOpen,
    setIsSearchOpen,
    selectedRelatives,
    setSelectedRelatives,
    selectedTypes,
    setSelectedTypes,
    selectedType,
    setSelectedType,
    customType,
    setCustomType,
    availableTypes,
    loading,
    isAddingCustom,
    setIsAddingCustom,
    handleAddRelationship,
    handleDelete,
    loadRelationships,
  };
};
