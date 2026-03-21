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
 layers: (attrs.layers || []).map((l: any) => ({ ...l, id: crypto.randomUUID() }))
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

 const handleCreateMap = async (source: string, mapName: string, uploadedFile: File | null) => {
 if (!projectId) return;
 try {
 const folders = await folderService.getByProject(projectId);
 const defaultFolder = folders.find(f => f.nombre.toLowerCase().includes('map')) || folders[0];

 if (!defaultFolder) {
 console.error("No folders available to create map");
 return;
 }

 // In local-first, we store the file path or base64 if it's small, 
 
 // For now, let's just use a placeholder or local URL if available.
 let bgImage = source === 'upload' ? 'placeholder-map.png' : ''; 

 const newEntity = await entityService.create({
 nombre: mapName,
 project_id: projectId,
 carpeta_id: defaultFolder.id,
 tipo: 'Map',
 descripcion: '',
 contenido_json: JSON.stringify({
 tipoEspecial: 'map',
 bgImage: bgImage,
 layers: [],
 markers: []
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
 />
 )}

 {view === 'viewer' && selectedMap && (
 <div className="flex-1 flex flex-col h-full relative">
 <div className="absolute top-4 left-4 z-[1001]">
 <button
 onClick={() => {
 setView('manager');
 window.dispatchEvent(new CustomEvent('clear-right-panel'));
 }}
 className="bg-background/60 hover:bg-background/80 text-foreground px-4 py-2 rounded-none flex items-center gap-2 border border-foreground/40 transition-all font-bold text-sm"
 >
 <span className="material-symbols-outlined text-sm">arrow_back</span>
 Volver al Atlas
 </button>
 </div>
 <InteractiveMapView map={selectedMap} />
 </div>
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
 entityId={newMapId?.toString()}
 onBack={() => {
 setView('manager');
 setNewMapId(null);
 }}
 onSave={async () => {
 await loadMaps();
 if (newMapId) {
 navigate(`/local/${projectName}/entities/Map/${newMapId}`);
 } else {
 setView('manager');
 }
 setNewMapId(null);
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
