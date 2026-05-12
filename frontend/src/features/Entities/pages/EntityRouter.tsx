import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { Entidad } from '@domain/models/database';
import CosmicProfileView from './archetypes/CosmicProfileView';
import IndividualProfileView from './archetypes/IndividualProfileView';
import TerritoryProfileView from './archetypes/TerritoryProfileView';
import CollectiveProfileView from './archetypes/CollectiveProfileView';
import EventProfileView from './archetypes/EventProfileView';
import EntityBuilder from './EntityBuilder';
import InteractiveMapView from '../../Maps/pages/InteractiveMapView';

const EntityRouter = () => {
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

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-primary animate-pulse font-mono tracking-widest">
        ENRUTANDO ENTIDAD...
      </div>
    </div>
  );
  
  if (!entity) return (
    <div className="flex-1 flex items-center justify-center bg-background">
      <div className="text-destructive font-bold uppercase tracking-widest">
        404 - ENTIDAD NO ENCONTRADA EN EL ARCHIVO
      </div>
    </div>
  );

  const tipo = entity.tipo.trim().toUpperCase();

  const cosmicTypes = ['UNIVERSO', 'PLANETA', 'SISTEMA', 'DIMENSION', 'ASTRO', 'UNIVERSE', 'PLANET', 'SYSTEM', 'ASTRO'];
  const actorTypes = ['PERSONAJE', 'OBJETO', 'RELIQUIA', 'VEHICULO', 'ENTITY', 'ENTIDAD', 'CHARACTER', 'OBJECT', 'ITEM'];
  const territoryTypes = ['REINO', 'CIUDAD', 'LUGAR', 'CONTINENTE', 'LOCATION', 'PLACE', 'GEOGRAPHY', 'MAP', 'MAPA'];
  const collectiveTypes = ['FACCION', 'RELIGION', 'RAZA', 'ORGANIZACION', 'FACTION', 'RELIGION', 'RACE', 'ORGANIZATION', 'CONLANG'];
  const eventTypes = ['EVENTO', 'GUERRA', 'ERA', 'MARCA_TEMPORAL', 'EVENT', 'WAR', 'TIMELINE', 'LINEA_TEMPORAL'];
  
  const mapTypes = ['MAP', 'MAPA'];

  switch (true) {
    case mapTypes.includes(tipo):
      return <InteractiveMapView map={entity} />;
    case cosmicTypes.includes(tipo):
      return <CosmicProfileView entityId={entity.id} />;
    case actorTypes.includes(tipo):
      return <IndividualProfileView entityId={entity.id} />;
    case territoryTypes.includes(tipo):
      return <TerritoryProfileView entityId={entity.id} />;
    case collectiveTypes.includes(tipo):
      return <CollectiveProfileView entityId={entity.id} />;
    case eventTypes.includes(tipo):
      return <EventProfileView entityId={entity.id} />;
    case tipo === 'ENTIDAD' || tipo === 'ENTITY':
      return <EntityBuilder mode="edit" />;
    default:
      return <IndividualProfileView entityId={entity.id} />;
  }
};

export default EntityRouter;
