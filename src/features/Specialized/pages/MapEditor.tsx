import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage, Circle, Text, Group } from 'react-konva';
import useImage from 'use-image';
import { entityService } from '../../../database/entityService';
import { folderService } from '../../../database/folderService';
import { Entidad } from '../../../database/types';
import { MapMarker } from '../../../types/maps';
import Button from '../../../components/common/Button';
import MoveModal from '../../../components/common/MoveModal';
import Breadcrumbs from '../../../components/common/Breadcrumbs';
import { Carpeta } from '../../../database/types';

interface MapEditorProps {
 mode?: 'create' | 'edit';
 entityId?: string;
 folderId?: string;
 onBack?: () => void;
 onSave?: () => Promise<void>;
}

const MapEditor: React.FC<MapEditorProps> = ({ mode = 'edit', entityId: propEntityId, folderId: propFolderId, onBack, onSave }) => {
 const navigate = useNavigate();
 const { entityId: urlEntityId, folderId: urlFolderId } = useParams();
 const entityId = propEntityId || urlEntityId;
 const initialFolderId = propFolderId || urlFolderId;

 const [mapEntity, setMapEntity] = useState<Entidad | null>(null);
 const [markers, setMarkers] = useState<MapMarker[]>([]);
 const [bgImage, setBgImage] = useState<string>('');
 const [image] = useImage(bgImage);
 const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight - 100 });
 const [path, setPath] = useState<Carpeta[]>([]);
 const [targetFolderId, setTargetFolderId] = useState<number | null>(initialFolderId ? Number(initialFolderId) : null);
 const [folderName, setFolderName] = useState<string>('Raíz');
 const [moveModalOpen, setMoveModalOpen] = useState(false);
 
 const { folders, projectId } = useOutletContext<any>() || {};

 const stageRef = useRef<any>(null);

 useEffect(() => {
 if (entityId && mode === 'edit') {
 loadMap(Number(entityId));
 } else if (mode === 'create') {
 // Initialize new map state
 setMapEntity({
 id: 0,
 nombre: 'Nuevo Mapa',
 tipo: 'Map',
 descripcion: '',
 contenido_json: JSON.stringify({ tipoEspecial: 'map', markers: [], bgImage: '' }),
 project_id: projectId || 0,
 carpeta_id: targetFolderId,
 fecha_creacion: new Date().toISOString()
 });
 }
 }, [entityId, mode, projectId]);

 useEffect(() => {
 if (targetFolderId && folders) {
 const f = folders.find((f: any) => f.id === targetFolderId);
 if (f) setFolderName(f.nombre);
 } else if (!targetFolderId) {
 setFolderName('Raíz');
 }
 }, [targetFolderId, folders]);

  useEffect(() => {
    const loadPath = async () => {
      if (targetFolderId) {
        const p = await folderService.getPath(targetFolderId);
        setPath(p);
      }
    };
    loadPath();
  }, [targetFolderId]);

  const loadMap = async (id: number) => {
 try {
 const entity = await entityService.getById(id);
 if (entity) {
 setMapEntity(entity);
 setTargetFolderId(entity.carpeta_id);
 const content = typeof entity.contenido_json === 'string' 
 ? JSON.parse(entity.contenido_json) 
 : (entity.contenido_json || {});
 
 setMarkers(content.markers || []);
 setBgImage(content.bgImage || content.snapshotUrl || '');
 }
 } catch (err) {
 console.error("Error loading map for editor", err);
 }
 };

 const handleSave = async () => {
 if (!mapEntity) return;

 try {
 const currentContent = typeof mapEntity.contenido_json === 'string'
 ? JSON.parse(mapEntity.contenido_json)
 : (mapEntity.contenido_json || {});

 const updatedContent = {
 ...currentContent,
 markers: markers,
 lastEdited: new Date().toISOString()
 };

 if (mode === 'create' || !entityId) {
 const newEntity = await entityService.create({
 nombre: mapEntity.nombre,
 tipo: 'Map',
 descripcion: mapEntity.descripcion,
 project_id: projectId,
 carpeta_id: targetFolderId,
 contenido_json: JSON.stringify(updatedContent)
 });
 alert("Mapa creado con éxito.");
 if (onSave) await onSave();
 else navigate(-1);
 } else {
 await entityService.update(Number(entityId), {
 nombre: mapEntity.nombre,
 carpeta_id: targetFolderId,
 contenido_json: JSON.stringify(updatedContent)
 });
 alert("Mapa guardado con éxito.");
 if (onSave) await onSave();
 }
 } catch (err) {
 console.error("Error saving map", err);
 alert("Error al guardar el mapa.");
 }
 };

 const handleStageClick = (e: any) => {
 // Only add marker if clicking on background (not existing marker)
 if (e.target === e.target.getStage() || e.target.className === 'Image') {
 const pos = e.target.getStage().getPointerPosition();
 const newMarker: MapMarker = {
 id: `marker-${Date.now()}`,
 x: pos.x,
 y: pos.y,
 label: 'Nuevo Punto',
 description: ''
 };
 setMarkers([...markers, newMarker]);
 }
 };

 const handleMarkerDragEnd = (id: string, e: any) => {
 const newMarkers = markers.map(m => {
 if (m.id === id) {
 return { ...m, x: e.target.x(), y: e.target.y() };
 }
 return m;
 });
 setMarkers(newMarkers);
 };

 const removeMarker = (id: string) => {
 setMarkers(markers.filter(m => m.id !== id));
 };

 return (
 <div className="flex flex-col h-screen w-full bg-[#050507] text-foreground overflow-hidden">
 {/* Header / Toolbar */}
  <header className="h-24 border-b border-foreground/10 bg-background/40 flex flex-col items-center justify-center gap-0 text-center px-6 z-10">
  <div className="w-full max-w-7xl pt-2">
    <Breadcrumbs path={path} />
  </div>
  <div className="flex-1 flex items-center justify-between w-full max-w-7xl pb-2">
  <div className="flex items-center gap-4">
  <button 
  onClick={() => onBack ? onBack() : navigate(-1)}
  className="size-10 rounded-none bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-all border border-foreground/10"
  >
  <span className="material-symbols-outlined text-sm">arrow_back</span>
  </button>
  <div className="text-left">
  <h1 className="text-sm font-black uppercase tracking-widest text-foreground leading-none mb-1">Editor de Atlas</h1>
  <p className="text-[10px] text-primary font-bold">{mapEntity?.nombre || 'Mapa sin título'}</p>
  </div>
  </div>

  <div className="flex items-center gap-3">
  <div className="flex flex-col items-end">
    <span className="text-[9px] text-foreground/40 font-black uppercase tracking-tighter">Carpeta de Destino</span>
    <button 
      onClick={() => setMoveModalOpen(true)}
      className="text-[10px] text-primary font-bold hover:underline flex items-center gap-1"
    >
      <span className="material-symbols-outlined text-xs">folder_open</span>
      {folderName}
    </button>
  </div>
  <div className="w-px h-8 bg-foreground/10 mx-2" />
  <div className="flex items-center bg-foreground/5 rounded-none px-3 py-1.5 border border-foreground/10">
  <span className="material-symbols-outlined text-primary text-sm mr-2">info</span>
  <span className="text-[10px] text-foreground/60 font-medium">Haz clic para añadir un marcador</span>
  </div>
  <Button variant="primary" size="sm" onClick={handleSave}>
  {mode === 'create' ? 'Crear Mapa' : 'Guardar Cambios'}
  </Button>
  </div>
  </div>
 </header>

 {/* Canvas Area */}
 <main className="flex-1 overflow-hidden bg-[radial-gradient(#1a1a2e_1px,transparent_1px)] [background-size:20px_20px] relative">
 <Stage 
 width={stageSize.width} 
 height={stageSize.height}
 onClick={handleStageClick}
 ref={stageRef}
 draggable
 >
 <Layer>
 {image && (
 <KonvaImage 
 image={image} 
 x={0} 
 y={0}
 width={image.width}
 height={image.height}
 />
 )}
 {markers.map((marker) => (
 <Group
 key={marker.id}
 x={marker.x}
 y={marker.y}
 draggable
 onDragEnd={(e) => handleMarkerDragEnd(marker.id, e)}
 onClick={(e) => {
 e.cancelBubble = true;
 if (e.evt.shiftKey) removeMarker(marker.id);
 }}
 >
 <Circle
 radius={12}
 fill="#6366f1"
 stroke="#fff"
 strokeWidth={2}
 shadowColor="#6366f1"
 shadowBlur={10}
 opacity={0.8}
 />
 <Text
 text={marker.label}
 y={15}
 x={-40}
 width={80}
 align="center"
 fontSize={10}
 fontStyle="bold"
 fill="#fff"
 />
 </Group>
 ))}
 </Layer>
 </Stage>

 {/* Floating Instructions */}
 <div className="absolute bottom-6 left-6 p-4 rounded-none monolithic-panel text-[10px] space-y-2 pointer-events-none shadow-2xl">
 <div className="flex items-center gap-2 text-primary">
 <span className="material-symbols-outlined text-xs">mouse</span>
 <span className="font-bold uppercase tracking-widest">Controles</span>
 </div>
 <ul className="text-foreground/60 space-y-1">
 <li>• <span className="text-foreground">Click</span> en fondo para añadir punto</li>
 <li>• <span className="text-foreground">Arrastrar</span> para reposicionar</li>
 <li>• <span className="text-foreground">Shift + Click</span> para eliminar</li>
 <li>• <span className="text-foreground">Rueda Scroll</span> o arrastrar vacío para navegar</li>
 </ul>
 </div>
 </main>
 </div>
 );
};

export default MapEditor;
