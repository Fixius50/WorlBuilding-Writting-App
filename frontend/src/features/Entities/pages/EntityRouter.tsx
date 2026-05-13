import React from 'react';
import CosmicProfileView from './archetypes/CosmicProfileView';
import IndividualProfileView from './archetypes/IndividualProfileView';
import TerritoryProfileView from './archetypes/TerritoryProfileView';
import CollectiveProfileView from './archetypes/CollectiveProfileView';
import EventProfileView from './archetypes/EventProfileView';
import EntityBuilder from './EntityBuilder';
import InteractiveMapView from '../../Maps/pages/InteractiveMapView';
import { useEntityRouter } from './useEntityRouter';

const EntityRouter = () => {
  const { entity, loading, viewType } = useEntityRouter();

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

  switch (viewType) {
    case 'map':
      return <InteractiveMapView map={entity} />;
    case 'cosmic':
      return <CosmicProfileView entityId={entity.id} />;
    case 'individual':
      return <IndividualProfileView entityId={entity.id} />;
    case 'territory':
      return <TerritoryProfileView entityId={entity.id} />;
    case 'collective':
      return <CollectiveProfileView entityId={entity.id} />;
    case 'event':
      return <EventProfileView entityId={entity.id} />;
    case 'builder':
      return <EntityBuilder mode="edit" />;
    default:
      return <IndividualProfileView entityId={entity.id} />;
  }
};

export default EntityRouter;

