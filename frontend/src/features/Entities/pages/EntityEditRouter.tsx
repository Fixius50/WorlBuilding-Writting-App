import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { entityService } from '@repositories/entityService';
import { Entidad } from '@domain/models/database';
import EntityBuilder from '@features/Entities/pages/EntityBuilder';
import CosmicCanvasEditor from '@features/Entities/pages/CosmicCanvasEditor';

const EntityEditRouter = () => {
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
      const data = await entityService.getById(Number(entityId));
      setEntity(data);
    } catch (err) {
      console.error("Error routing entity edit:", err);
    } finally {
      setLoading(false);
    }
  };

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

  const tipo = entity.tipo.trim().toUpperCase();
  const cosmicTypes = [
    'UNIVERSO', 'UNIVERSE', 'UNIVERSES',
    'GALAXIA', 'GALAXY', 'GALAXIES',
    'SISTEMA', 'SYSTEM', 'SYSTEMS',
    'PLANETA', 'PLANET', 'PLANETS',
    'DIMENSION', 'DIMENSIÓN', 'DIMENSIONS'
  ];

  if (cosmicTypes.includes(tipo)) {
    return <CosmicCanvasEditor entityId={entity.id} />;
  }

  return <EntityBuilder mode="edit" />;
};

export default EntityEditRouter;
