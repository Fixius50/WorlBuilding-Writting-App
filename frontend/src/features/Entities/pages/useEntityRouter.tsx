import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { Entidad } from '@domain/models/database';

/**
 * 🧠 useEntityRouter
 * Hook to handle entity routing logic, determining which profile view or specialized view to display based on entity type.
 */
export const useEntityRouter = () => {
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
      console.error("Error routing entity:", err);
    } finally {
      setLoading(false);
    }
  };

  const viewType = useMemo(() => {
    if (!entity) return 'none';
    const tipo = entity.tipo.trim().toUpperCase();

    const cosmicTypes = ['UNIVERSO', 'PLANETA', 'SISTEMA', 'DIMENSION', 'ASTRO', 'UNIVERSE', 'PLANET', 'SYSTEM', 'ASTRO'];
    const actorTypes = ['PERSONAJE', 'OBJETO', 'RELIQUIA', 'VEHICULO', 'ENTITY', 'ENTIDAD', 'CHARACTER', 'OBJECT', 'ITEM'];
    const territoryTypes = ['REINO', 'CIUDAD', 'LUGAR', 'CONTINENTE', 'LOCATION', 'PLACE', 'GEOGRAPHY', 'MAP', 'MAPA'];
    const collectiveTypes = ['FACCION', 'RELIGION', 'RAZA', 'ORGANIZACION', 'FACTION', 'RELIGION', 'RACE', 'ORGANIZATION', 'CONLANG'];
    const eventTypes = ['EVENTO', 'GUERRA', 'ERA', 'MARCA_TEMPORAL', 'EVENT', 'WAR', 'TIMELINE', 'LINEA_TEMPORAL'];
    const mapTypes = ['MAP', 'MAPA'];

    if (mapTypes.includes(tipo)) return 'map';
    if (cosmicTypes.includes(tipo)) return 'cosmic';
    if (actorTypes.includes(tipo)) return 'individual';
    if (territoryTypes.includes(tipo)) return 'territory';
    if (collectiveTypes.includes(tipo)) return 'collective';
    if (eventTypes.includes(tipo)) return 'event';
    if (tipo === 'ENTIDAD' || tipo === 'ENTITY') return 'builder';
    
    return 'individual'; // Default fallback
  }, [entity]);

  return {
    entity,
    loading,
    viewType
  };
};
