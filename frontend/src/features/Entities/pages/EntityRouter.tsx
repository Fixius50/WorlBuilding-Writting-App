import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { entityService } from '@repositories/entityService';
import { Entidad } from '@domain/models/database';
import CosmicProfileView from './CosmicProfileView';
import IndividualProfileView from './IndividualProfileView';
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
      const data = await entityService.getById(Number(entityId));
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
  const cosmicTypes = [
    'UNIVERSO', 'UNIVERSE', 'UNIVERSES',
    'GALAXIA', 'GALAXY', 'GALAXIES',
    'SISTEMA', 'SYSTEM', 'SYSTEMS',
    'PLANETA', 'PLANET', 'PLANETS',
    'DIMENSION', 'DIMENSIÓN', 'DIMENSIONS',
    'ASTRO', 'ESTRELLA', 'STAR', 'STARS',
    'COSMOS', 'SPACE', 'ESPACIO'
  ];
  const mapTypes = ['MAP', 'MAPA'];
  const timelineTypes = ['TIMELINE', 'CRONOLOGIA', 'CRONOLOGÍA'];

  // Switch de enrutamiento camaleónico
  if (cosmicTypes.includes(tipo)) {
    return <CosmicProfileView entityId={entity.id} />;
  }

  if (mapTypes.includes(tipo)) {
    return <InteractiveMapView map={entity} />;
  }

  // Por defecto, perfil individual (Personajes, Lugares, Cronologías, etc.)
  return <IndividualProfileView />;
};

export default EntityRouter;
