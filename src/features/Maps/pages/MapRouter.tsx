import React, { useState } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import MapCreationWizard from './MapCreationWizard';
import MapEditor from '../../Specialized/pages/MapEditor';
import InteractiveMapView from './InteractiveMapView';
import MapManager from './MapManager';
import { entityService } from '../../../database/entityService';
import { folderService } from '../../../database/folderService';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { Entidad } from '../../../database/types';

const MapRouter = () => {
 const { projectName } = useParams();
 const { projectId } = useOutletContext<{ projectId: number }>();
 const navigate = useNavigate();
 const [view, setView] = useState('manager'); // Default to manager
 const [maps, setMaps] = useState<Entidad[]>([]);
 const [selectedMap, setSelectedMap] = useState<Entidad | null>(null);
 const [newMapId, setNewMapId] = useState<number | null>(null);
 const [mapToDelete, setMapToDelete] = useState<Entidad | null>(null);

 React.useEffect(() => {
 if (projectId) loadMaps();

 const handleRefresh = () => loadMaps();
 window.addEventListener('map-updated', handleRefresh);
 return () => window.removeEventListener('map-updated', handleRefresh);
 }, [projectId]);

 const loadMaps = async () => {
 if (!projectId) return;
 try {
 const allEntities = await entityService.getAllByProject(projectId);
 const mapEntities = allEntities.filter(e => {
 // Check in attributes or tipo
 try {
 const attrs = typeof e.contenido_json === 'string' ? JSON.parse(e.contenido_json) : (e.contenido_json || {});
 return attrs.tipoEspecial === 'map' || e.tipo === 'Map' || e.tipo === 'Mapa';
 } catch (e) { return false; }
 });
 setMaps(mapEntities);
 } catch (err) { console.error("Error loading maps", err); }
 };

  const handleDuplicateMap = async (map: Entidad) => {
    if (!projectId) return;
    try {
      const attrs = typeof map.contenido_json === 'string' ? JSON.parse(map.contenido_json) : (map.contenido_json || {});
      const newAttrs = {
        ...attrs,
        layers: (attrs.layers || []).map((l: Record<string, unknown>) => ({ ...l, id: crypto.randomUUID() }))
      };


 await entityService.create({
 nombre: `${map.nombre} (Copia)`,
 tipo: map.tipo,
 descripcion: map.descripcion,
 project_id: projectId,
 carpeta_id: map.carpeta_id,
 contenido_json: JSON.stringify(newAttrs)
 });
 await loadMaps();
 } catch (err) {
 console.error("Error duplicating map:", err);
 alert("Error al duplicar el mapa.");
 }
 };

 const confirmDeleteMap = async () => {
 if (!mapToDelete) return;
 try {
 await entityService.delete(mapToDelete.id);
 setMapToDelete(null);
 await loadMaps();
 } catch (err) { console.error("Error deleting map", err); }
 };

  const handleCreateMap = async (
    mapName: string, 
    config: { bgImage: string; mapType: string; description: string; parentId?: number }
  ) => {
    if (!projectId) return;
    try {
      const folders = await folderService.getByProject(projectId);
      const defaultFolder = folders.find(f => f.nombre.toLowerCase().includes('map')) || folders[0];

      if (!defaultFolder) {
        console.error("No folders available to create map");
        return;
      }

      const newEntity = await entityService.create({
        nombre: mapName || 'Nuevo Mapa',
        project_id: projectId,
        carpeta_id: defaultFolder.id,
        tipo: 'Map',
        descripcion: config.description,
        contenido_json: JSON.stringify({
          tipoEspecial: 'map',
          bgImage: config.bgImage || 'placeholder-map.png',
          mapType: config.mapType,
          parentId: config.parentId,
          layers: [],
          markers: [],
          connections: []
        })
      });

      setNewMapId(newEntity.id);
      setView('editor');
      await loadMaps();
    } catch (err) {
      console.error("Error creating map:", err);
    }
  };

 return (
 <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
 {view === 'manager' && (
 <MapManager
 maps={maps}
 onSelectMap={(map: Entidad) => {
 setSelectedMap(map);
 setView('viewer');
 }}
 onCreateMap={() => setView('wizard')}
 onDuplicateMap={handleDuplicateMap}
 onDeleteMap={(map: Entidad) => setMapToDelete(map)}
 onEditMap={(map: Entidad) => {
 setSelectedMap(map);
 setNewMapId(null); // no es creación, es edición
 setView('editor');
 }}
 />
 )}

 {view === 'viewer' && selectedMap && (
  <InteractiveMapView map={selectedMap} onBack={() => { setView('manager'); window.dispatchEvent(new CustomEvent('clear-right-panel')); }} />
 )}

 {view === 'wizard' && (
 <MapCreationWizard
 onCancel={() => setView('manager')}
 onCreate={handleCreateMap}
 />
 )}

 {view === 'editor' && (
 <MapEditor
 mode={newMapId ? 'create' : 'edit'}
 entityId={(newMapId || selectedMap?.id)?.toString()}
 onBack={() => {
 setView('manager');
 setNewMapId(null);
 setSelectedMap(null);
 }}
 onSave={async () => {
 await loadMaps();
 // Volver siempre al manager — nunca al EntityRouter genérico
 setView('manager');
 setNewMapId(null);
 setSelectedMap(null);
 }}
 />
 )}

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
