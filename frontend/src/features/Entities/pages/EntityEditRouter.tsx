import React from 'react';
import EntityBuilder from '@features/Entities/pages/EntityBuilder';
import CosmicCanvasEditor from '@features/Entities/pages/CosmicCanvasEditor';
import { useEntityEditRouter } from './useEntityEditRouter';

const EntityEditRouter = () => {
  const { entity, loading, isCosmic } = useEntityEditRouter();

  if (loading) return (
    <div className="flex-1 flex items-center justify-center bg-black">
      <div className="text-primary animate-pulse font-mono tracking-widest text-xs">
        [ CALCULANDO MATRIZ DE EDICIÓN ]
      </div>
    </div>
  );
  
  if (!entity) return (
    <div className="flex-1 flex items-center justify-center bg-black">
      <div className="text-destructive font-bold uppercase tracking-widest font-mono">
        404 - ENTIDAD NO ENCONTRADA
      </div>
    </div>
  );

  if (isCosmic) {
    return <CosmicCanvasEditor entityId={entity.id} />;
  }

  return <EntityBuilder mode="edit" />;
};

export default EntityEditRouter;

