import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { RelationshipUseCase } from '@application/useCases/RelationshipUseCase';
import { Entidad } from '@domain/models/database';

// --- Interfaces ---
export interface CharacterExtras {
  imagenUrl?: string;
  estado?: string;
  apellidos?: string;
  origen?: string;
  comportamiento?: string;
  appearance?: string;
  notes?: string;
}

export interface CharacterRelationship {
  entidadDestino?: {
    nombre?: string;
  };
  tipoRelacion?: string;
}

export interface CharacterData extends Entidad, CharacterExtras {
  relaciones?: CharacterRelationship[]; 
}

/**
 * 🧠 useCharacterView
 * Logic hook for CharacterView.
 */
export const useCharacterView = (id: string | number) => {
  const navigate = useNavigate();
  
  // --- States ---
  const [activeTab, setActiveTab] = useState('overview');
  const [entity, setEntity] = useState<Entidad | null>(null);
  const [character, setCharacter] = useState<CharacterData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // --- Data Loading ---
  const loadCharacter = useCallback(async () => {
    setLoading(true);
    try {
      const data = await EntityUseCase.getById(Number(id));
      if (data) {
        setEntity(data);
        const extra = typeof data.contenido_json === 'string'
          ? JSON.parse(data.contenido_json)
          : (data.contenido_json || {});
        
        // Fetch relationships for this character
        const relations = await RelationshipUseCase.getRelationshipsByEntity(data.id);
        
        setCharacter({
          ...data,
          ...extra,
          relaciones: relations
        });
      }
    } catch (err) {
      console.error("Error loading character:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCharacter();
  }, [loadCharacter]);

  // --- Handlers ---
  const handleSave = async () => {
    if (!entity || !character) return;
    try {
      const { nombre, tipo, descripcion, ...rest } = character;
      const extra: Record<string, unknown> = { ...rest };
      // We don't save relationships back as part of entity update
      delete extra.relaciones;

      await EntityUseCase.update(entity.id, {
        nombre,
        tipo,
        descripcion,
        contenido_json: JSON.stringify(extra)
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving character:", err);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Move this character to the Trash Bin?")) return;
    try {
      if (entity) await EntityUseCase.delete(entity.id);
      navigate(-1);
    } catch (err) {
      console.error("Error deleting character:", err);
    }
  };

  const handleChange = (field: keyof CharacterData, value: unknown) => {
    setCharacter(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  return {
    activeTab,
    setActiveTab,
    entity,
    character,
    loading,
    isEditing,
    setIsEditing,
    handleSave,
    handleDelete,
    handleChange,
    navigate
  };
};
