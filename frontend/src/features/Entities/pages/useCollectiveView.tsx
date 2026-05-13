import { useState, useEffect, useCallback } from 'react';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { Entidad } from '@domain/models/database';

interface CollectiveData extends Partial<Entidad> {
  cantidadMiembros?: string;
  comportamiento?: string;
}

/**
 * 🧠 useCollectiveView
 * Hook to handle collective entity management, including dynamic JSON metadata and state synchronization.
 */
export const useCollectiveView = (id: string | number) => {
  const [entity, setEntity] = useState<Entidad | null>(null);
  const [collective, setCollective] = useState<CollectiveData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const loadCollective = useCallback(async () => {
    setLoading(true);
    try {
      const data = await EntityUseCase.getById(Number(id));
      if (data) {
        setEntity(data);
        const extra = typeof data.contenido_json === 'string'
          ? JSON.parse(data.contenido_json)
          : (data.contenido_json || {});

        setCollective({
          ...data,
          ...extra
        });
      }
    } catch (err) {
      // [LOG REMOVED]
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadCollective();
  }, [loadCollective]);

  const handleSave = useCallback(async () => {
    if (!entity || !collective) return;
    try {
      const { nombre, tipo, descripcion, ...extra } = collective;

      await EntityUseCase.update(entity.id, {
        nombre,
        tipo,
        descripcion,
        contenido_json: JSON.stringify(extra)
      });
      setIsEditing(false);
    } catch (err) {
      // [LOG REMOVED]
    }
  }, [entity, collective]);

  const handleChange = useCallback((field: string, value: string) => {
    setCollective(prev => prev ? ({ ...prev, [field]: value }) : null);
  }, []);

  const toggleEditing = useCallback(() => {
    setIsEditing(prev => !prev);
  }, []);

  return {
    collective,
    loading,
    isEditing,
    toggleEditing,
    handleSave,
    handleChange
  };
};
