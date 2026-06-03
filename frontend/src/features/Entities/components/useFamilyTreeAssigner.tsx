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
  const [selectedRelative, setSelectedRelative] = useState<Entidad | null>(
    null,
  );
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
        const eligible = all.filter((entity) => entity.id !== entityId);
        const normalizedQuery = query.trim().toLowerCase();
        const isSelectedName = selectedRelative && query === selectedRelative.nombre;
        const filtered = (normalizedQuery && !isSelectedName)
          ? eligible.filter((entity) =>
              entity.nombre.toLowerCase().includes(normalizedQuery),
            )
          : eligible;
        setSearchResults(filtered);
      } catch {
        setSearchResults([]);
      }
    },
    [projectId, entityId, selectedRelative],
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
    if (!selectedRelative) return;
    const finalType = isAddingCustom
      ? customType.trim().toUpperCase()
      : selectedType.trim().toUpperCase();
    if (!finalType) return;

    try {
      await RelationshipUseCase.createRelationship({
        origen_id: entityId,
        destino_id: selectedRelative.id,
        tipo: finalType,
        descripcion: "",
        project_id: projectId,
      });

      if (!availableTypes.includes(finalType)) {
        const updated = [...availableTypes, finalType];
        await WorkspaceUseCase.saveSetting(
          SETTINGS_KEY,
          JSON.stringify(updated),
        );
        setAvailableTypes(updated);
      }

      setSelectedRelative(null);
      setSelectedType("");
      setSearchQuery("");
      setIsSearchOpen(false);
      setCustomType("");
      setIsAddingCustom(false);
      loadRelationships();
    } catch {}
  };

  const handleDelete = async (id: number) => {
    if (!confirm("¿Eliminar este vínculo genealógico?")) return;
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
    selectedRelative,
    setSelectedRelative,
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
