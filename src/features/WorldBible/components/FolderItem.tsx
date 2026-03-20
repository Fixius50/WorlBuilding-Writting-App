import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getHierarchyType } from '../../../utils/constants/hierarchy_types';
import { folderService } from '../../../database/folderService';
import { entityService } from '../../../database/entityService';
import { Carpeta, Entidad } from '../../../database/types';

const getIconForType = (type?: string) => {
 switch (type?.toLowerCase()) {
 case 'text': return 'notes';
 case 'short_text': return 'short_text';
 case 'number': return 'pin';
 case 'date': return 'calendar_today';
 case 'select': return 'list';
 case 'boolean': return 'check_box';
 case 'map': return 'map';
 case 'timeline': return 'timeline';
 case 'character': case 'entidadindividual': return 'person';
 case 'location': case 'zona': case 'construccion': return 'location_on';
 case 'culture': case 'entidadcolectiva': return 'groups';
 case 'universe': case 'galaxy': case 'system': case 'planet': return 'public';
 case 'entity_link': return 'link';
 default: return 'description';
 }
};

const getEntityRoute = (username: string, projectName: string, entity: Entidad, folderId: number) => {
 const id = entity.id;
 return `/${username}/${projectName}/bible/folder/${folderId}/entity/${id}`;
};

interface FolderUpdateEvent extends CustomEvent {
 detail: {
 folderId: number;
 };
}

interface FolderItemProps {
 folder: Carpeta;
 onCreateSubfolder: (parentId: number) => void;
 onRename: (folderId: number, newName: string) => void;
 onDeleteFolder: (id: number, parentId?: number | null) => void;
 onDeleteEntity: (id: number, folderId: number) => void;
 onCreateTemplate: () => void;
 onMoveEntity: (entityId: number, targetFolderId: number, sourceFolderId: number) => void;
 onDuplicateEntity: (entityId: number, folderId: number) => void;
 onCreateEntity: (folderId: number | string, specialType?: string) => void;
 onConfirmCreate: (tempId: string | number, name: string, type: 'folder' | 'entity', parentId: number, specialType?: string) => void;
 searchTerm: string;
 filterType: string;
 className?: string;
}

const FolderItem: React.FC<FolderItemProps> = ({
 folder,
 onCreateSubfolder,
 onRename,
 onDeleteFolder,
 onDeleteEntity,
 onCreateTemplate,
 onMoveEntity,
 onDuplicateEntity,
 onCreateEntity,
 onConfirmCreate,
 searchTerm,
 filterType,
 className
}) => {
 const { username, projectName } = useParams<{ username: string; projectName: string }>();
 const navigate = useNavigate();
 const [isOpen, setIsOpen] = useState(false);
 const [content, setContent] = useState<{ folders: Carpeta[], entities: Entidad[] }>({ folders: [], entities: [] });
 const [loaded, setLoaded] = useState(false);
 const [contextMenu, setContextMenu] = useState<{ x: number, y: number, type: 'folder' | 'entity', id: number, name: string } | null>(null);
 const [itemName, setItemName] = useState(folder.nombre);
 const [isEditing, setIsEditing] = useState(false);
 const [renamingEntityId, setRenamingEntityId] = useState<number | null>(null);

 useEffect(() => { setItemName(folder.nombre); }, [folder.nombre]);

 // Auto-expand on search
 useEffect(() => {
 if (searchTerm && !isOpen) {
 const hasMatch = content.entities.some(e =>
 e.nombre.toLowerCase().includes(searchTerm.toLowerCase()) &&
 (filterType === 'ALL' || e.tipo === filterType)
 );
 if (hasMatch) {
 setIsOpen(true);
 if (!loaded) loadContent();
 }
 }
 }, [searchTerm, content.entities]);

 const loadContent = async () => {
 try {
 const [subs, ents] = await Promise.all([
 folderService.getSubfolders(folder.id),
 entityService.getByFolder(folder.id)
 ]);
 setContent({ folders: subs, entities: ents });
 setLoaded(true);
 } catch (err) {
 console.error("Error reloading folder content:", err);
 }
 };

 const toggle = (e: React.MouseEvent) => {
 e.stopPropagation();
 setIsOpen(!isOpen);
 if (!loaded && !isOpen) loadContent();
 };

 // Listen for global updates to refresh tree
 useEffect(() => {
 const handleUpdate = (e: Event) => {
 const customEvent = e as FolderUpdateEvent;
 const { folderId } = customEvent.detail || {};
 if (folderId === folder.id) {
 loadContent();
 }
 };
 window.addEventListener('folder-update', handleUpdate);
 return () => window.removeEventListener('folder-update', handleUpdate);
 }, [folder.id]);

 const navigateToFolder = () => navigate(`/${username}/${projectName}/bible/folder/${folder.id}`);

 const handleContextMenu = (e: React.MouseEvent, type: 'folder' | 'entity', id: number, name: string) => {
 e.preventDefault();
 e.stopPropagation();
 setContextMenu({ x: e.clientX, y: e.clientY, type, id, name });
 };

 const closeContextMenu = () => setContextMenu(null);

 useEffect(() => {
 if (contextMenu) {
 window.addEventListener('click', closeContextMenu);
 return () => window.removeEventListener('click', closeContextMenu);
 }
 }, [contextMenu]);

 const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.add('bg-indigo-500/20'); };
 const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('bg-indigo-500/20'); };
 const handleDrop = (e: React.DragEvent) => {
 e.preventDefault(); e.stopPropagation(); e.currentTarget.classList.remove('bg-indigo-500/20');
 const entityId = e.dataTransfer.getData('entityId');
 const sourceFolderId = e.dataTransfer.getData('sourceFolderId');
 if (entityId && sourceFolderId && sourceFolderId !== String(folder.id)) {
 onMoveEntity(Number(entityId), folder.id, Number(sourceFolderId));
 }
 };

 return (
 <div className={`space-y-1 select-none ${className || ''}`}>
 <div
 className="flex items-center gap-3 px-3 py-2 rounded-none text-xs font-bold text-foreground/60 hover:text-indigo-400 hover:bg-indigo-400/5 cursor-pointer transition-all group relative"
 onClick={navigateToFolder}
 onContextMenu={(e) => handleContextMenu(e, 'folder', folder.id, folder.nombre)}
 onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
 >
 <span onClick={toggle} className={`material-symbols-outlined text-lg transition-transform hover:text-indigo-400 ${isOpen ? 'rotate-90 text-indigo-400' : 'opacity-50'}`}>chevron_right</span>

 <span className={`material-symbols-outlined text-lg ${getHierarchyType(folder.tipo).color}`}>
 {getHierarchyType(folder.tipo).icon}
 </span>

 {isEditing ? (
 <input
 autoFocus
 className="bg-foreground/5 border border-indigo-500/50 rounded px-2 py-0.5 text-xs text-foreground outline-none flex-1 min-w-0"
 defaultValue={itemName}
 onKeyDown={async (e) => {
 if (e.key === 'Enter') {
 e.preventDefault();
 e.stopPropagation();
 const val = (e.currentTarget as HTMLInputElement).value.trim();
 if (val && val !== itemName) {
 try {
 await onRename(folder.id, val);
 setItemName(val);
 } catch (err) { console.error("Rename failed", err); }
 }
 setIsEditing(false);
 } else if (e.key === 'Escape') {
 e.preventDefault();
 e.stopPropagation();
 setIsEditing(false);
 }
 }}
 onBlur={() => setIsEditing(false)}
 onClick={(e) => e.stopPropagation()}
 />
 ) : (
 <span className="truncate flex-1">{itemName}</span>
 )}
 </div>

 {contextMenu && (
 <div className="fixed monolithic-panel shadow-2xl rounded-none py-2 z-50 w-48 text-xs font-medium flex flex-col" style={{ top: contextMenu.y, left: contextMenu.x }} onClick={(e) => e.stopPropagation()}>
 <div className="px-4 py-2 border-b border-foreground/10 font-bold text-foreground/60 truncate">{contextMenu.name}</div>
 {contextMenu.type === 'folder' ? (
 <>
 <button className="px-4 py-2 hover:bg-foreground/5 text-left flex items-center gap-2" onClick={() => { onCreateEntity(folder.id, 'entidadindividual'); closeContextMenu(); }}><span className="material-symbols-outlined text-sm">person</span> Add Character</button>
 <div className="h-px bg-foreground/5 my-1" />
 <button className="px-4 py-2 hover:bg-foreground/5 text-left flex items-center gap-2" onClick={() => { setIsEditing(true); closeContextMenu(); }}><span className="material-symbols-outlined text-sm">edit</span> Rename Folder</button>
 <button className="px-4 py-2 hover:bg-red-500/10 text-red-400 text-left flex items-center gap-2" onClick={() => { onDeleteFolder(folder.id, folder.padre_id); closeContextMenu(); }}><span className="material-symbols-outlined text-sm">delete</span> Delete Folder</button>
 </>
 ) : (
 <>
 <button className="px-4 py-2 hover:bg-foreground/5 text-left flex items-center gap-2 cursor-pointer" onClick={() => {
 setRenamingEntityId(contextMenu.id);
 closeContextMenu();
 }}><span className="material-symbols-outlined text-sm">edit</span> Rename</button>
 <button className="px-4 py-2 hover:bg-red-500/10 text-red-400 text-left flex items-center gap-2" onClick={() => { onDeleteEntity(contextMenu.id, folder.id); closeContextMenu(); }}><span className="material-symbols-outlined text-sm">delete</span> Delete Entity</button>
 </>
 )}
 </div>
 )}

 {isOpen && (
 <div className="ml-6 pl-4 border-l border-foreground/10 space-y-1">
 {/* Render Subfolders */}
 {content.folders.map(sub => (
 <FolderItem
 key={sub.id}
 folder={sub}
 onCreateSubfolder={onCreateSubfolder}
 onRename={onRename}
 onDeleteFolder={onDeleteFolder}
 onDeleteEntity={onDeleteEntity}
 onCreateTemplate={onCreateTemplate}
 onMoveEntity={onMoveEntity}
 onDuplicateEntity={onDuplicateEntity}
 onCreateEntity={onCreateEntity}
 onConfirmCreate={onConfirmCreate}
 searchTerm={searchTerm}
 filterType={filterType}
 />
 ))}

 {/* Render Entities (Filtered) */}
 {content.entities
 .filter(ent => {
 if (!searchTerm) return true;
 const matchesSearch = ent.nombre.toLowerCase().includes(searchTerm.toLowerCase());
 const matchesType = filterType === 'ALL' || ent.tipo === filterType;
 return matchesSearch && matchesType;
 })
 .map(ent => (
 <Link
 key={ent.id}
 to={getEntityRoute(username!, projectName!, ent, folder.id)}
 onContextMenu={(e) => handleContextMenu(e, 'entity', ent.id, ent.nombre)}
 className="flex items-center gap-3 px-3 py-2 rounded-none text-[11px] font-medium text-foreground/60 hover:text-indigo-400 hover:bg-indigo-400/5 transition-all group cursor-grab active:cursor-grabbing"
 draggable
 onDragStart={(e) => {
 e.dataTransfer.setData('entityId', String(ent.id));
 e.dataTransfer.setData('sourceFolderId', String(folder.id));
 }}
 >
 <span className="material-symbols-outlined text-sm opacity-70 group-hover:text-indigo-400 transition-colors">{getIconForType(ent.tipo)}</span>
 <span className="truncate flex-1">{ent.nombre}</span>
 </Link>
 ))}
 {loaded && content.folders.length === 0 && content.entities.length === 0 && (
 <div className="px-3 py-2 text-[10px] text-foreground/60 uppercase font-black italic tracking-tighter">Sector Vacío</div>
 )}
 </div>
 )}
 </div>
 );
};

export default FolderItem;
