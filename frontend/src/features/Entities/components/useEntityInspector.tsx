import { useState, useEffect } from 'react';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { TemplateUseCase } from '@application/useCases/TemplateUseCase';
import { Entidad, Valor } from '@domain/models/database';

/**
 * 🧠 useEntityInspector
 * Logic for the quick entity inspector, including loading entity data and key values.
 */
export const useEntityInspector = (entityId: number | string) => {
  const [entity, setEntity] = useState<Entidad | null>(null);
  const [values, setValues] = useState<Valor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const data = await EntityUseCase.getById(Number(entityId));
        if (data) {
          setEntity(data);
          const vals = await TemplateUseCase.getEntityValues(data.id);
          setValues(vals.slice(0, 5)); // Just the first 5 for the quick inspector
        }
      } catch (err) { }
      finally {
        setLoading(false);
      }
    };
    loadData();
  }, [entityId]);

  const handleNavigate = () => {
    if (entity) {
      window.dispatchEvent(new CustomEvent('navigate-entity', { detail: entity.id }));
    }
  };

  return {
    entity,
    values,
    loading,
    handleNavigate
  };
};
