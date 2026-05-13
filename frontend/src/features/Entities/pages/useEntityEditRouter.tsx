import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { Entidad } from '@domain/models/database';

/**
 * 🧠 useEntityEditRouter
 * Hook to handle entity loading and routing logic for the editor, determining which specialized editor to display.
 */
export const useEntityEditRouter = () => {
  const { entityId } = useParams();
  const [entity, setEntity] = useState<Entidad | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (entityId) {
      loadEntity();
    }
  }, [entityId]);

  const loadEntity = async () => {
    setLoading(true);
    try {
      const data = await EntityUseCase.getById(Number(entityId));
      setEntity(data);
    } catch (err) {
      console.error("Error routing entity edit:", err);
    } finally {
      setLoading(false);
    }
  };

  const isCosmic = useMemo(() => {
    if (!entity) return false;
    const tipo = entity.tipo.trim().toUpperCase();
    const cosmicTypes = [
      'UNIVERSO', 'UNIVERSE', 'UNIVERSES',
      'GALAXIA', 'GALAXY', 'GALAXIES',
      'SISTEMA', 'SYSTEM', 'SYSTEMS',
      'PLANETA', 'PLANET', 'PLANETS',
      'DIMENSION', 'DIMENSIÓN', 'DIMENSIONS'
    ];
    return cosmicTypes.includes(tipo);
  }, [entity]);

  return {
    entity,
    loading,
    isCosmic
  };
};
