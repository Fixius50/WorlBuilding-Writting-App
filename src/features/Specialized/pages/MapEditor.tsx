import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Stage, Layer, Image as KonvaImage, Circle, Text, Group } from 'react-konva';
import useImage from 'use-image';
import { entityService } from '../../../database/entityService';
import { Entidad } from '../../../database/types';
import { MapMarker } from '../../../types/maps';
import Button from '../../../components/common/Button';

interface MapEditorProps {
 mode?: 'create' | 'edit';
 entityId?: string;
 onBack?: () => void;
 onSave?: () => Promise<void>;
}

const MapEditor: React.FC<MapEditorProps> = ({ mode = 'edit', entityId: propEntityId, onBack, onSave }) => {
 const navigate = useNavigate();
 const { entityId: urlEntityId } = useParams();
 const entityId = propEntityId || urlEntityId;

 const [mapEntity, setMapEntity] = useState<Entidad | null>(null);
 const [markers, setMarkers] = useState<MapMarker[]>([]);
 const [bgImage, setBgImage] = useState<string>('');
 const [image] = useImage(bgImage);
 const [stageSize, setStageSize] = useState({ width: window.innerWidth, height: window.innerHeight - 100 });

 const stageRef = useRef<any>(null);

 useEffect(() => {
 if (entityId) {
 loadMap(Number(entityId));
 }
 }, [entityId]);

 const loadMap = async (id: number) => {
 try {
 const entity = await entityService.getById(id);
 if (entity) {
 setMapEntity(entity);
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
 if (!mapEntity || !entityId) return;

 try {
 const currentContent = typeof mapEntity.contenido_json === 'string'
 ? JSON.parse(mapEntity.contenido_json)
 : (mapEntity.contenido_json || {});

 const updatedContent = {
 ...currentContent,
 markers: markers,
 lastEdited: new Date().toISOString()
 };

 await entityService.update(Number(entityId), {
 ...mapEntity,
 contenido_json: JSON.stringify(updatedContent)
 });

 if (onSave) await onSave();
 alert("Mapa guardado con éxito.");
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
 <header className="h-16 border-b border-foreground/10 bg-background/40 flex items-center justify-center gap-12 text-center px-6 z-10">
 <div className="flex items-center gap-4">
 <button 
 onClick={() => onBack ? onBack() : navigate(-1)}
 className="size-10 rounded-none bg-foreground/5 hover:bg-foreground/10 flex items-center justify-center transition-all border border-foreground/10"
 >
 <span className="material-symbols-outlined text-sm">arrow_back</span>
 </button>
 <div>
 <h1 className="text-sm font-black uppercase tracking-widest text-foreground leading-none mb-1">Editor de Atlas</h1>
 <p className="text-[10px] text-primary font-bold">{mapEntity?.nombre || 'Mapa sin título'}</p>
 </div>
 </div>

 <div className="flex items-center gap-3">
 <div className="flex items-center bg-foreground/5 rounded-none px-3 py-1.5 border border-foreground/10">
 <span className="material-symbols-outlined text-primary text-sm mr-2">info</span>
 <span className="text-[10px] text-foreground/60 font-medium">Haz clic para añadir un marcador</span>
 </div>
 <Button variant="primary" size="sm" onClick={handleSave}>
 Guardar Cambios
 </Button>
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
