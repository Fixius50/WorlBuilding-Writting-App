import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Outlet, useParams, useNavigate, useOutletContext } from 'react-router-dom';
import { invoke } from '../../../services/invoke.js';

import FolderItem from '../components/FolderItem';
import CreateNodeModal from '../components/CreateNodeModal';
import ConfirmationModal from '../../../components/common/ConfirmationModal';

import { Carpeta } from '../../../database/types';

export interface BibleExplorerState {
 folders: Carpeta[];
 searchTerm: string;
 setSearchTerm: (term: string) => void;
 filterType: string;
 setFilterType: (type: string) => void;
 handleCreateSimpleFolder: (parentFolder?: any, type?: string) => Promise<void>;
 handleRenameFolder: (folderId: number, newName: string) => Promise<void>;
 handleDeleteFolder: (folderId: number | string, parentId?: number | string | null) => void;
 handleMoveEntity: (entityId: number | string, targetFolderId: number | string, sourceFolderId: number | string) => Promise<void>;
 handleDuplicateEntity: (entityId: number | string, folderId: number | string) => Promise<void>;
 handleCreateEntity: (folderId: number | string | { id: number | string; slug?: string }, specialType?: string) => Promise<void>;
 handleConfirmCreate: (tempId: number | string, name: string, type: 'folder' | 'entity', parentId: number, specialType?: string) => Promise<void>;
}

interface ArchitectContext {
 setBibleExplorerState: (state: BibleExplorerState) => void;
 [key: string]: any;
}

interface DeletionTarget {
 id: number | string;
 parentId?: number | string | null;
 folderId?: number | string;
 type: 'folder' | 'entity';
}

// World Bible Layout: Persistent Left Explorer + Right Outlet
const WorldBibleLayout = () => {
 const { username, projectName } = useParams();
 const navigate = useNavigate();
 const outletContext = (useOutletContext<ArchitectContext>() || {}) as ArchitectContext;
 const {
 handleCreateEntity: propHandleCreateEntity,
 ...architectContext
 } = outletContext;
 const { t } = useLanguage();

 const [folders, setFolders] = useState<Carpeta[]>([]);
 const [creationModalOpen, setCreationModalOpen] = useState(false);
 const [targetParent, setTargetParent] = useState<Carpeta | null>(null);
 const [searchTerm, setSearchTerm] = useState('');
 const [filterType, setFilterType] = useState('ALL');

 // Deletion Modal State
 const [confirmOpen, setConfirmOpen] = useState(false);
 const [deletionTarget, setDeletionTarget] = useState<DeletionTarget | null>(null);

 const baseUrl = `/${username}/${projectName}/bible`;

 useEffect(() => {
 loadFolders();
 }, [projectName]);

 // Notify parent layout about explorer state
 useEffect(() => {
 if (architectContext?.setBibleExplorerState) {
 architectContext.setBibleExplorerState({
 folders,
 searchTerm,
 setSearchTerm,
 filterType,
 setFilterType,
 handleCreateSimpleFolder,
 handleRenameFolder,
 handleDeleteFolder,
 handleMoveEntity,
 handleDuplicateEntity,
 handleCreateEntity,
 handleConfirmCreate
 });
 }
 }, [folders, searchTerm, filterType]);

 const loadFolders = async () => {
 try {
 const rootFolders = await invoke('get_carpetas', { projectId: projectName || 'local' });
 setFolders(rootFolders as Carpeta[]);
 } catch (err) {
 console.warn("Error loading folders (no data yet):", err);
 setFolders([]);
 }
 };

 // --- Modal Handlers ---

 const handleOpenCreateModal = (parentFolder = null) => {
 setTargetParent(parentFolder);
 setCreationModalOpen(true);
 };

 const handleCreateSimpleFolder = async (parentFolder: any = null, type = 'FOLDER') => {
 try {
 const parentId = parentFolder ? (typeof parentFolder === 'object' ? parentFolder.id : parentFolder) : null;
 const newFolder = await invoke('create_carpeta', {
 nombre: type === 'TIMELINE' ? (t('bible.new_timeline') || 'Nueva Timeline') : (t('bible.new_folder') || 'Nueva Carpeta'),
 projectId: projectName || 'local',
 padreId: parentId,
 tipo: type
 }) as Carpeta;

 await loadFolders();
 window.dispatchEvent(new CustomEvent('folder-update', {
 detail: { folderId: parentId, type: 'folder', item: newFolder, expand: !!parentId }
 }));
 } catch (err) {
 console.error("Error creating simple folder:", err);
 }
 };

 const handleCreateSubmit = async (formData: { nombre: string; tipo: any }) => {
 try {
 const parentId = targetParent ? targetParent.id : null;
 const newFolder = await invoke('create_carpeta', {
 nombre: formData.nombre,
 projectId: projectName || 'local',
 padreId: parentId,
 tipo: formData.tipo
 }) as Carpeta;

 await loadFolders();
 window.dispatchEvent(new CustomEvent('folder-update', {
 detail: { folderId: parentId, type: 'folder', item: newFolder, expand: !!parentId }
 }));
 } catch (err) {
 console.error(err);
 alert("Error creating folder/zone.");
 }
 };

 const handleMoveEntity = async (entityId: number | string, targetFolderId: number | string, sourceFolderId: number | string) => {
 // TODO: Implement entity folder update in Rust
 console.warn('handleMoveEntity: pending Rust implementation');
 window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: sourceFolderId, removeId: entityId, type: 'entity' } }));
 window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: targetFolderId, type: 'move-in', entityId } }));
 };

 const handleDuplicateEntity = async (entityId: number | string, folderId: number | string) => {
 // TODO: Implement duplicate entity in Rust
 console.warn('handleDuplicateEntity: pending Rust implementation');
 };

 const handleCreateEntity = async (folderId: number | string | { id: number | string; slug?: string }, specialType = 'entidadindividual') => {
 const targetSlug = typeof folderId === 'object' ? (folderId.slug || folderId.id) : folderId;
 navigate(`${baseUrl}/folder/${targetSlug}/entity/new/${specialType}`);
 };

 const handleRenameFolder = async (folderId: number, newName: string) => {
 try {
 await invoke('update_carpeta', { id: folderId, nombre: newName });
 setFolders(prev => prev.map(f => f.id === folderId ? { ...f, nombre: newName } : f));
 } catch (err) { throw err; }
 };

 const handleDeleteFolder = (folderId: number | string, parentId: number | string | null = null) => {
 setDeletionTarget({ id: folderId, parentId, type: 'folder' });
 setConfirmOpen(true);
 };

 const confirmDeletion = async () => {
 if (!deletionTarget) return;
 const { id, parentId, type, folderId } = deletionTarget;

 try {
 if (type === 'folder') {
 await invoke('delete_carpeta', { id });
 setFolders(prev => prev.filter(f => f.id !== id));
 window.dispatchEvent(new CustomEvent('folder-update', {
 detail: { folderId: parentId, removeId: id, type: 'folder' }
 }));
 } else if (type === 'entity') {
 await invoke('delete_entidad', { id });
 window.dispatchEvent(new CustomEvent('folder-update', {
 detail: { folderId: folderId, removeId: id, type: 'entity' }
 }));
 }
 } catch (err) {
 console.error("Deletion failed:", err);
 alert("Error trying to delete item.");
 } finally {
 setDeletionTarget(null);
 }
 };

 const handleDeleteEntity = (entityId: number | string, folderId: number | string) => {
 setDeletionTarget({ id: entityId, folderId, type: 'entity' });
 setConfirmOpen(true);
 };

 const handleConfirmCreate = async (tempId: number | string, name: string, type: 'folder' | 'entity', parentId: number, specialType?: string) => {
 try {
 if (type === 'folder') {
 if (typeof tempId === 'number' && !tempId.toString().startsWith('temp')) {
 await invoke('update_carpeta', { id: tempId, nombre: name });
 window.dispatchEvent(new CustomEvent('folder-update', {
 detail: {
 folderId: parentId,
 confirmedType: 'folder',
 oldId: tempId,
 item: { id: tempId, nombre: name, parentId, tipo: specialType, uiKey: Date.now() }
 }
 }));
 if (!parentId) {
 setFolders(prev => prev.map(f => f.id === tempId ? { ...f, nombre: name } : f));
 }
 }
 } else if (type === 'entity') {
 if (typeof tempId === 'string' && tempId.startsWith('new-')) {
 const newEntity = await invoke('create_entidad', {
 name,
 projectId: projectName || 'local',
 tipoEntidad: specialType || 'entidadindividual',
 carpetaId: parentId
 });
 window.dispatchEvent(new CustomEvent('folder-update', {
 detail: { folderId: parentId, confirmedType: 'entity', oldId: tempId, item: newEntity }
 }));
 } else {
 // Rename entity — TODO: implement update_entidad in Rust
 console.warn('update_entidad pending Rust implementation');
 }
 }
 } catch (err) {
 console.error("Creation/Rename failed", err);
 if (type === 'folder') handleDeleteFolder(tempId, parentId);
 }
 };

 return (
 <div className="flex h-full w-full bg-background max-w-[1920px] mx-auto">
 {/* MAIN CONTENT - FULL WIDTH */}
 <main className="flex-1 overflow-hidden relative bg-gradient-to-br from-background-dark to-surface-dark/20">
 <Outlet context={{
 ...architectContext,
 folders,
 searchTerm,
 setSearchTerm,
 filterType,
 setFilterType,
 handleCreateEntity,
 handleOpenCreateModal,
 handleDeleteFolder,
 handleRenameFolder,
 handleDeleteEntity,
 handleMoveEntity,
 handleDuplicateEntity,
 handleCreateSimpleFolder,
 handleConfirmCreate
 }} />
 </main>

 {/* MODAL */}
 <CreateNodeModal
 isOpen={creationModalOpen}
 onClose={() => setCreationModalOpen(false)}
 onCreate={handleCreateSubmit}
 parentFolder={targetParent}
 />

 <ConfirmationModal
 isOpen={confirmOpen}
 onClose={() => setConfirmOpen(false)}
 onConfirm={confirmDeletion}
 title={deletionTarget?.type === 'folder' ? t('bible.delete_folder') : t('bible.delete_entity')}
 message={deletionTarget?.type === 'folder'
 ? t('bible.delete_folder_msg')
 : t('bible.delete_entity_msg')
 }
 confirmText={t('common.confirm_delete')}
 />
 </div>
 );
};

export default WorldBibleLayout;
