import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useOutletContext, Routes, Route } from 'react-router-dom';
import MapCreationWizard from './MapCreationWizard';
import MapEditor from '@features/Specialized/pages/MapEditor';
import InteractiveMapView from './InteractiveMapView';
import MapManager from './MapManager';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { WorkspaceUseCase } from '@application/useCases/WorkspaceUseCase';
import ConfirmationModal from '@organisms/ConfirmationModal';
import { Entidad } from '@domain/models/database';

const MapRouter = () => {
  const outletContext = useOutletContext<unknown>();
  const { projectId } = outletContext as { projectId: number };
  const { projectName } = useParams<{ projectName: string }>();
  const navigate = useNavigate();
  const [maps, setMaps] = useState<Entidad[]>([]);
  const [mapToDelete, setMapToDelete] = useState<Entidad | null>(null);

  useEffect(() => {
    projectId ? loadMaps() : null;
    const handleRefresh = () => loadMaps();
    window.addEventListener('map-updated', handleRefresh);
    return () => window.removeEventListener('map-updated', handleRefresh);
  }, [projectId]);

  const loadMaps = async () => {
    if (!projectId) return;
    try {
      const allEntities = await EntityUseCase.getAllByProject(projectId);
      const mapEntities = allEntities.filter(e => {
        try {
          const attrs = typeof e.contenido_json === 'string' ? JSON.parse(e.contenido_json) : (e.contenido_json || {});
          return attrs.tipoEspecial === 'map' || e.tipo === 'Map' || e.tipo === 'Mapa';
        } catch (e) { return false; }
      });
      setMaps(mapEntities);
    } catch (err) { /* Ignored */ }
  };

  const handleDuplicateMap = async (map: Entidad) => {
    if (!projectId) return;
    try {
      const attrs = typeof map.contenido_json === 'string' ? JSON.parse(map.contenido_json) : (map.contenido_json || {});
      const newAttrs = {
        ...attrs,
        layers: (attrs.layers || []).map((l: any) => ({ ...l, id: crypto.randomUUID() }))
      };
      await EntityUseCase.create({
        nombre: `${map.nombre} (Copia)`,
        tipo: map.tipo,
        descripcion: map.descripcion,
        project_id: projectId,
        carpeta_id: map.carpeta_id,
        contenido_json: JSON.stringify(newAttrs),
        slug: '',
        folder_slug: '',
        imagen_url: ''
      });
      await loadMaps();
    } catch (err) {
      alert("Error al duplicar el mapa.");
    }
  };

  const confirmDeleteMap = async () => {
    if (!mapToDelete) return;
    try {
      await EntityUseCase.delete(mapToDelete.id);
      setMapToDelete(null);
      await loadMaps();
    } catch (err) { /* Ignored */ }
  };

  const handleCreateMap = async (mapName: string, config: any) => {
    if (!projectId) return;
    try {
      const folders = await WorkspaceUseCase.getRootFolders(projectId);
      const defaultFolder = folders.find(f => f.nombre.toLowerCase().includes('map')) || folders[0];
      if (!defaultFolder) return;

      const newEntity = await EntityUseCase.create({
        nombre: mapName || 'Nuevo Mapa',
        project_id: projectId,
        carpeta_id: defaultFolder.id,
        tipo: 'Map',
        descripcion: config.description,
        slug: '',
        folder_slug: '',
        imagen_url: '',
        contenido_json: JSON.stringify({
          tipoEspecial: 'map',
          bgImage: config.bgImage || 'placeholder-map.png',
          mapType: config.mapType,
          parentId: config.parentId,
          is3D: config.is3D,
          layers: [],
          markers: [],
          connections: []
        })
      });
      await loadMaps();
      navigate(`/local/${projectName}/map/editor/${newEntity.slug || newEntity.id}`);
    } catch (err) { /* Ignored */ }
  };

  const MapViewerWrapper = () => {
    const { mapId } = useParams();
    const map = maps.find(m => m.slug === mapId || m.id.toString() === mapId);
    const content = !map
      ? <div className="p-10 text-foreground/50 uppercase text-[10px] font-black">Cargando mapa...</div>
      : <InteractiveMapView map={map} onBack={() => navigate(`/local/${projectName}/map`)} />;
    return content;
  };

  const MapEditorWrapper = () => {
    return <MapEditor />;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      <Routes>
        <Route index element={
          <MapManager
            maps={maps}
            onSelectMap={(map: Entidad) => navigate(`viewer/${map.slug || map.id}`)}
            onCreateMap={() => navigate(`wizard`)}
            onDuplicateMap={handleDuplicateMap}
            onDeleteMap={(map: Entidad) => setMapToDelete(map)}
            onEditMap={(map: Entidad) => navigate(`editor/${map.slug || map.id}`)}
          />
        } />
        <Route path="viewer/:mapId" element={<MapViewerWrapper />} />
        <Route path="editor/:entityId" element={<MapEditorWrapper />} />
        <Route path="wizard" element={<MapCreationWizard onCancel={() => navigate('..')} onCreate={handleCreateMap} projectName={projectName || ''} />} />
      </Routes>

      <ConfirmationModal
        isOpen={!!mapToDelete}
        onClose={() => setMapToDelete(null)}
        onConfirm={confirmDeleteMap}
        title="Eliminar Mapa"
        message={`¿Estás seguro de que quieres eliminar el mapa "${mapToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
      />
    </div>
  );
};

export default MapRouter;
