import { useState, useEffect, useCallback } from 'react';
import { EntityUseCase } from '@application/EntityUseCase';
import { Entidad } from '@domain/database';

// --- Interfaces ---
export interface LocationData extends Partial<Entidad> {
  apellidos?: string;
  tamanno?: string;
  desarrollo?: string;
}

/**
 * 🧠 useLocationView
 * Logic hook for LocationView.
 */
export const useLocationView = (id: string | number) => {
  const [entity, setEntity] = useState<Entidad | null>(null);
  const [location, setLocation] = useState<LocationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  // --- Data Loading ---
  const loadLocation = useCallback(async () => {
    setLoading(true);
    try {
      const data = await EntityUseCase.getById(Number(id));
      if (data) {
        setEntity(data);
        const extra = typeof data.contenido_json === 'string'
          ? JSON.parse(data.contenido_json)
          : (data.contenido_json || {});

        setLocation({
          ...data,
          ...extra
        });
      }
    } catch (err) {
      console.error("Error loading location:", err);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadLocation();
  }, [loadLocation]);

  // --- Handlers ---
  const handleSave = async () => {
    if (!entity || !location) return;
    try {
      const { nombre, tipo, descripcion, ...extra } = location as LocationData;

      await EntityUseCase.update(entity.id, {
        nombre,
        tipo,
        descripcion,
        contenido_json: JSON.stringify(extra)
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving location:", err);
    }
  };

  const handleChange = (field: string, value: string) => {
    setLocation(prev => prev ? ({ ...prev, [field]: value }) : null);
  };

  return {
    location,
    loading,
    isEditing,
    setIsEditing,
    handleSave,
    handleChange
  };
};
