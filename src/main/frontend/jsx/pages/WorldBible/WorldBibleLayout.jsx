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
    const [favorites, setFavorites] = useState([]);
    const [createMenuOpen, setCreateMenuOpen] = useState(false);

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
        loadFavorites();

        const handleFavUpdate = () => loadFavorites();
        window.addEventListener('favorites-update', handleFavUpdate);
        return () => window.removeEventListener('favorites-update', handleFavUpdate);
    }, [projectName]);

    const loadFolders = async () => {
        try {
            const rootFolders = await api.get('/world-bible/folders');
            setFolders(rootFolders);
        } catch (err) { console.error("Error loading folders:", err); }
    };

    const loadFavorites = async () => {
        try {
            const favs = await api.get('/world-bible/favorites');
            setFavorites(favs);
        } catch (err) { console.error("Error loading favorites:", err); }
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
            {/* LEFT PANEL: EXPLORER */}
            <aside className="w-80 flex-none flex flex-col border-r border-glass-border bg-surface-dark/50 z-10">
                {/* Search Header */}
                <div className="p-4 border-b border-glass-border">
                    <div className="relative group mb-3">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm group-focus-within:text-primary transition-colors">search</span>
                        <input
                            type="text"
                            placeholder={t('bible.search_entity')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-surface-light/50 border border-glass-border rounded-xl py-2 pl-9 pr-3 text-xs focus:border-primary/50 outline-none transition-all text-white placeholder:text-text-muted/50"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        {/* Simplified Select Filter */}
                        <div className="relative">
                            <select
                                value={filterType}
                                onChange={(e) => setFilterType(e.target.value)}
                                className="appearance-none bg-surface-dark border border-glass-border rounded-xl px-4 py-2 pr-10 text-xs font-bold text-white transition-all hover:bg-white/5 focus:border-primary outline-none inline-flex items-center"
                            >
                                <option value="ALL">🔍 TODO</option>
                                <option value="individual">👤 PERSONAJES</option>
                                <option value="location">📍 LUGARES</option>
                                <option value="culture">🤝 CULTURAS</option>
                                <option value="map">🗺️ MAPAS</option>
                                <option value="timeline">⏳ TIMELINES</option>
                            </select>
                            <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">expand_more</span>
                        </div>

                        <button
                            onClick={() => setCreateMenuOpen(!createMenuOpen)}
                            className="p-2 aspect-square bg-primary hover:bg-primary-light text-white rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-sm">add</span>
                        </button>

                        {createMenuOpen && (
                            <div className="absolute top-full right-0 mt-2 w-48 bg-surface-dark border border-glass-border rounded-xl shadow-2xl py-2 z-50 animate-in fade-in slide-in-from-top-2">
                                <button
                                    onClick={() => { handleOpenCreateModal('FOLDER'); setCreateMenuOpen(false); }}
                                    className="w-full px-4 py-2 hover:bg-white/5 text-left text-xs font-bold text-white/70 hover:text-white flex items-center gap-3"
                                >
                                    <span className="material-symbols-outlined text-sm text-primary">create_new_folder</span>
                                    Nueva Carpeta
                                </button>
                                <button
                                    onClick={() => { handleCreateSimpleFolder(null, 'MAP'); setCreateMenuOpen(false); }}
                                    className="w-full px-4 py-2 hover:bg-white/5 text-left text-xs font-bold text-white/70 hover:text-white flex items-center gap-3"
                                >
                                    <span className="material-symbols-outlined text-sm text-red-400">map</span>
                                    Mapa
                                </button>
                                <button
                                    onClick={() => { handleCreateSimpleFolder(null, 'TIMELINE'); setCreateMenuOpen(false); }}
                                    className="w-full px-4 py-2 hover:bg-white/5 text-left text-xs font-bold text-white/70 hover:text-white flex items-center gap-3"
                                >
                                    <span className="material-symbols-outlined text-sm text-cyan-400">timeline</span>
                                    Timeline
                                </button>
                            </div>
                        )}
                    </div>

                </div>

                {/* Favorites Section */}
                <div className="px-2 pt-2">
                    <div className="flex items-center justify-between px-2 mb-1">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted">{t('bible.favorites')}</h2>
                    </div>
                    {favorites.length > 0 ? (
                        <div className="space-y-0.5">
                            {favorites.map(fav => (
                                <div key={fav.id}
                                    onClick={() => navigate(`${baseUrl}/folder/${fav.carpeta.slug || fav.carpeta.id}/entity/${fav.slug || fav.id}`)}
                                    className="flex items-center gap-3 px-3 py-1.5 rounded-lg text-[11px] font-medium text-text-muted hover:text-white hover:bg-white/5 cursor-pointer transition-all group"
                                >
                                    <span className="material-symbols-outlined text-sm text-yellow-500/70 group-hover:text-yellow-400">star</span>
                                    <span className="truncate">{fav.nombre}</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="px-4 py-2 text-[10px] text-text-muted/30 italic">{t('bible.no_favorites')}</div>
                    )}
                    <div className="h-px bg-glass-border my-2 opacity-50"></div>
                </div>

                <div className="p-4 border-b border-glass-border pt-0">
                    <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted">{t('bible.explorer')}</h2>
                        <div className="relative">
                            <button
                                className="transition-colors hover:text-white text-primary"
                                onClick={() => handleCreateSimpleFolder(null)}
                                title={t('bible.new_folder')}
                            >
                                <span className="material-symbols-outlined text-sm">create_new_folder</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tree Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-0.5">
                    {folders.length === 0 ? (
                        <div className="p-8 text-center opacity-30">
                            <span className="material-symbols-outlined text-3xl mb-2">folder_off</span>
                            <p className="text-[10px] uppercase font-bold">{t('bible.empty_archive')}</p>
                        </div>
                    ) : (
                        folders.map(folder => (
                            <FolderItem
                                key={folder.uiKey || folder.id}
                                folder={folder}
                                onCreateSubfolder={() => { }} // Flat hierarchy: no subfolders from sidebar
                                onRename={handleRenameFolder}
                                onDeleteFolder={handleDeleteFolder}
                                onDeleteEntity={handleDeleteFolder}
                                onCreateTemplate={() => { }}
                                onMoveEntity={handleMoveEntity}
                                onDuplicateEntity={handleDuplicateEntity}
                                onCreateEntity={handleCreateEntity}
                                onConfirmCreate={handleConfirmCreate}
                                searchTerm={searchTerm}
                                filterType={filterType}
                            />
                        ))
                    )}
                </div>
            </aside>

            {/* RIGHT PANEL: CONTENT OUTLET */}
            <main className="flex-1 overflow-hidden relative bg-gradient-to-br from-background-dark to-surface-dark/20">
                <Outlet context={{
                    ...architectContext,
                    folders, // Shared State
                    handleCreateEntity,
                    handleOpenCreateModal,
                    handleDeleteFolder,
                    handleDeleteEntity,
                    handleCreateSimpleFolder
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
