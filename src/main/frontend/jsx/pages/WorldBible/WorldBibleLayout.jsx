import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Outlet, useParams, useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../../js/services/api';
import FolderItem from '../../components/bible/FolderItem';
import CreateNodeModal from '../../components/bible/CreateNodeModal';
import ConfirmationModal from '../../components/ConfirmationModal';

// World Bible Layout: Persistent Left Explorer + Right Outlet
const WorldBibleLayout = () => {
    const { username, projectName } = useParams();
    const navigate = useNavigate();
    const {
        handleCreateEntity: propHandleCreateEntity, // In case it's passed down, but we define it here mostly
        ...architectContext
    } = useOutletContext() || {};
    const { t } = useLanguage();

    const [folders, setFolders] = useState([]);



    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [targetParent, setTargetParent] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');

    // Deletion Modal State
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletionTarget, setDeletionTarget] = useState(null); // { id, parentId, type, folderId (for entity) }

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
    }, [folders, searchTerm, filterType]); // Update when these change

    const loadFolders = async () => {
        try {
            const rootFolders = await api.get('/world-bible/folders');
            setFolders(rootFolders);
        } catch (err) { console.error("Error loading folders:", err); }
    };



    // --- Modal Handlers ---

    const handleOpenCreateModal = (parentFolder = null) => {
        setTargetParent(parentFolder);
        setCreationModalOpen(true);
        setCreationMenuOpen(false); // Close dropdown if open
    };

    const handleCreateSimpleFolder = async (parentFolder = null, type = 'FOLDER') => {
        try {
            const parentId = parentFolder ? (typeof parentFolder === 'object' ? parentFolder.id : parentFolder) : null;
            const newFolder = await api.post('/world-bible/folders', {
                nombre: type === 'TIMELINE' ? t('bible.new_timeline') : t('bible.new_folder'),
                padreId: parentId,
                tipo: type
            });

            if (parentId === null) {
                // RELOAD folders to ensure data integrity (IDs, Slugs)
                const updatedFolders = await api.get('/world-bible/folders');
                setFolders(updatedFolders);

                // DISPATCH event so BibleGridView knows to reload too
                window.dispatchEvent(new CustomEvent('folder-update', {
                    detail: { folderId: null }
                }));
            } else {
                window.dispatchEvent(new CustomEvent('folder-update', {
                    detail: {
                        folderId: parentId,
                        optimisticType: 'folder',
                        item: newFolder,
                        expand: true
                    }
                }));
            }
        } catch (err) {
            console.error("Error creating simple folder:", err);
        }
    };

    const handleCreateSubmit = async (formData) => {
        try {
            const parentId = targetParent ? targetParent.id : null;

            // Create Folder with Type
            const newFolder = await api.post('/world-bible/folders', {
                nombre: formData.nombre,
                descripcion: formData.descripcion,
                padreId: parentId,
                tipo: formData.tipo
            });



            // RELOAD folders to ensure we have the correct ID and Slug from DB
            // Optimistic update might be missing fields if backend response is partial
            if (parentId === null) {
                const updatedFolders = await api.get('/world-bible/folders');
                setFolders(updatedFolders);

                // DISPATCH event so BibleGridView knows to reload too
                window.dispatchEvent(new CustomEvent('folder-update', {
                    detail: { folderId: null }
                }));
            } else {
                // For subfolders, we still rely on event, but passing the response 'newFolder'
                // verifying it has an ID
                if (!newFolder.id) console.error("CRITICAL: Created folder has no ID!", newFolder);

                window.dispatchEvent(new CustomEvent('folder-update', {
                    detail: {
                        folderId: parentId,
                        optimisticType: 'folder',
                        item: newFolder,
                        expand: true
                    }
                }));
            }
        } catch (err) {
            console.error(err);
            alert("Error creating folder/zone.");
        }
    };

    const handleMoveEntity = async (entityId, targetFolderId, sourceFolderId) => {
        try {
            await api.put(`/world-bible/entities/${entityId}`, { carpetaId: targetFolderId });
            window.dispatchEvent(new CustomEvent('folder-update', {
                detail: { folderId: sourceFolderId, removeId: entityId, type: 'entity' }
            }));
            window.dispatchEvent(new CustomEvent('folder-update', {
                detail: { folderId: targetFolderId, type: 'move-in', entityId }
            }));
        } catch (err) { console.error("Move failed:", err); }
    };

    const handleDuplicateEntity = async (entityId, folderId) => {
        try {
            const entity = await api.get(`/world-bible/entities/${entityId}`);
            const duplicated = await api.post('/world-bible/entities', {
                ...entity,
                id: undefined,
                nombre: `${entity.nombre} (Copia)`,
                carpetaId: folderId
            });
            window.dispatchEvent(new CustomEvent('folder-update', {
                detail: { folderId: folderId, type: 'entity', item: duplicated }
            }));
        } catch (err) { console.error("Duplicate failed:", err); }
    };

    // --- Entity Handlers ---
    // For now keeping 'handleCreateEntity' logic simplified or separate.

    // We retain the old 'handleCreateEntity' for consistency with FolderItem props, 
    // but maybe we should use the Modal for Entities too? 
    // User requested Hierarchy (Universes, etc) which are Folders.
    // 'Entidades' (Characters) are different.

    const handleCreateEntity = async (folderId, specialType = 'entidadindividual') => {
        // Navigate directly to the creation form instead of prompt()
        const targetSlug = typeof folderId === 'object' ? (folderId.slug || folderId.id) : folderId;
        navigate(`${baseUrl}/folder/${targetSlug}/entity/new/${specialType}`);
    };

    const handleRenameFolder = async (folderId, newName) => {
        try {
            await api.put(`/world-bible/folders/${folderId}`, { nombre: newName });
            setFolders(prev => prev.map(f => f.id === folderId ? { ...f, nombre: newName } : f));
        } catch (err) { throw err; }
    };

    const handleDeleteFolder = (folderId, parentId = null) => {
        setDeletionTarget({ id: folderId, parentId, type: 'folder' });
        setConfirmOpen(true);
    };

    const confirmDeletion = async () => {
        if (!deletionTarget) return;
        const { id, parentId, type, folderId } = deletionTarget;

        try {
            if (type === 'folder') {
                await api.delete(`/world-bible/folders/${id}`);
                if (parentId === null) {
                    setFolders(prev => prev.filter(f => f.id !== id));
                }
                window.dispatchEvent(new CustomEvent('folder-update', {
                    detail: { folderId: parentId, removeId: id, type: 'folder' }
                }));
            } else if (type === 'entity') {
                await api.delete(`/world-bible/entities/${id}`);
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

    const handleDeleteEntity = (entityId, folderId) => {
        setDeletionTarget({ id: entityId, folderId, type: 'entity' });
        setConfirmOpen(true);
    };

    const handleConfirmCreate = async (tempId, name, type, parentId, specialType) => {
        try {
            if (type === 'folder') {
                // If it's a rename (existing ID, not temp)
                if (typeof tempId === 'number' && !tempId.toString().startsWith('temp')) {
                    // It's a rename of an existing folder? Usually onRename handles this.
                    // But if InputItem was used on a 'clean' new item, it has a temp ID.
                    // Actually, FolderItem passes folder.id. If folder.isNew, it has a temp ID or real ID?
                    // In handleCreateSimpleFolder, we create it in Backend immediately...
                    // Wait, handleCreateSimpleFolder creates it with "New Folder".
                    // So we are just RENAMING it here.
                    await api.put(`/world-bible/folders/${tempId}`, { nombre: name });

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
                } else {
                    // True creation if we didn't create it before? 
                    // Current flow: handleCreateSimpleFolder creates it. So this is always a Rename.
                    // Unless we add "Optimistic UI" where we don't create until name is set.
                }
            } else if (type === 'entity') {
                if (typeof tempId === 'string' && tempId.startsWith('new-')) {
                    // Real creation for entity if we use inline input
                    const newEntity = await api.post('/world-bible/entities', {
                        nombre: name,
                        carpetaId: parentId,
                        tipoEspecial: specialType || 'entidadindividual'
                    });

                    window.dispatchEvent(new CustomEvent('folder-update', {
                        detail: {
                            folderId: parentId,
                            confirmedType: 'entity',
                            oldId: tempId,
                            item: newEntity
                        }
                    }));
                } else {
                    // Rename Entity
                    await api.put(`/world-bible/entities/${tempId}`, { nombre: name });
                    window.dispatchEvent(new CustomEvent('folder-update', {
                        detail: {
                            folderId: parentId,
                            confirmedType: 'entity',
                            oldId: tempId,
                            item: { id: tempId, nombre: name, carpeta: { id: parentId }, tipoEspecial: specialType, slug: tempId } // minimalistic update
                        }
                    }));
                    // Reload content to get full data
                    window.dispatchEvent(new CustomEvent('folder-update', {
                        detail: { folderId: parentId } // trigger reload
                    }));
                }
            }
        } catch (err) {
            console.error("Creation/Rename failed", err);
            // If failed and it was new, maybe delete it?
            if (type === 'folder') handleDeleteFolder(tempId, parentId);
        }
    };

    return (
        <div className="flex h-full w-full bg-background-dark max-w-[1920px] mx-auto">
            {/* MAIN CONTENT - FULL WIDTH */}
            <main className="flex-1 overflow-hidden relative bg-gradient-to-br from-background-dark to-surface-dark/20">
                <Outlet context={{
                    ...architectContext,
                    folders, // Shared State
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
