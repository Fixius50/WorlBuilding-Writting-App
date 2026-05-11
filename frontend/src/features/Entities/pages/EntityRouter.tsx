import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { TemplateUseCase } from '@application/useCases/TemplateUseCase';
import { Entidad } from '@domain/models/database';
import CosmicProfileView from './CosmicProfileView';
import IndividualProfileView from './IndividualProfileView';
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

  // Switch de enrutamiento camaleónico (Refactorizado para extensibilidad futura)
  switch (true) {
    case cosmicTypes.includes(tipo):
      return <CosmicProfileView entityId={entity.id} />;
    
    case tipo === 'ENTIDAD' || tipo === 'ENTITY':
      // Redirección directa al Constructor para el tipo genérico 'ENTIDAD'
      return <EntityBuilder mode="edit" />;
    
    case mapTypes.includes(tipo):
      return <InteractiveMapView map={entity} />;
    
    default:
      // Perfil individual industrial para el resto de nodos (Personajes, Lugares, etc.)
      return <IndividualProfileView />;
  }
};

export default EntityRouter;
