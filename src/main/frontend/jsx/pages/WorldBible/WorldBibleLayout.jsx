import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../../js/services/api';
import FolderItem from '../../components/bible/FolderItem';
import CreateNodeModal from '../../components/bible/CreateNodeModal';

// World Bible Layout: Persistent Left Explorer + Right Outlet
const WorldBibleLayout = () => {
    const { username, projectName } = useParams();
    const navigate = useNavigate();
    const {
        handleCreateEntity: propHandleCreateEntity, // In case it's passed down, but we define it here mostly
        ...architectContext
    } = useOutletContext() || {};

    const [folders, setFolders] = useState([]);
    const [creationMenuOpen, setCreationMenuOpen] = useState(false);

    // Modal State
    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [targetParent, setTargetParent] = useState(null);

    const baseUrl = `/${username}/${projectName}/bible`;

    useEffect(() => {
        loadFolders();
    }, [projectName]);

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

    const handleCreateSimpleFolder = async (parentFolder = null) => {
        try {
            const parentId = parentFolder ? (typeof parentFolder === 'object' ? parentFolder.id : parentFolder) : null;
            const newFolder = await api.post('/world-bible/folders', {
                nombre: 'Nueva Carpeta',
                padreId: parentId,
                tipo: 'FOLDER'
            });

            if (parentId === null) {
                setFolders(prev => [...prev, newFolder]);
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

            if (parentId === null) {
                // Add to root
                setFolders(prev => [...prev, newFolder]);
            } else {
                // Propagate to subfolder via event
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

    // --- Entity Handlers (Keep inline or basic for now, or expand) ---
    // For now keeping 'handleCreateEntity' logic simplified or separate.

    // We retain the old 'handleCreateEntity' for consistency with FolderItem props, 
    // but maybe we should use the Modal for Entities too? 
    // User requested Hierarchy (Universes, etc) which are Folders.
    // 'Entidades' (Characters) are different.

    const handleCreateEntity = async (folderId, specialType = 'entidadindividual') => {
        const name = prompt("Nombre de la entidad:"); // Basic fallback for pure entities
        if (!name) return;

        try {
            const response = await api.post('/world-bible/entities', {
                nombre: name,
                carpetaId: folderId,
                tipoEspecial: specialType
            });
            window.dispatchEvent(new CustomEvent('folder-update', {
                detail: { folderId: folderId, optimisticType: 'entity', item: response, expand: true }
            }));
            // Navigate using slug
            navigate(`${baseUrl}/entity/${response.slug || response.id}`);
        } catch (err) {
            alert("Failed to create entity");
        }
    };

    const handleRenameFolder = async (folderId, newName) => {
        try {
            await api.put(`/world-bible/folders/${folderId}`, { nombre: newName });
            setFolders(prev => prev.map(f => f.id === folderId ? { ...f, nombre: newName } : f));
        } catch (err) { throw err; }
    };

    const handleDeleteFolder = async (folderId) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/world-bible/folders/${folderId}`);
            setFolders(prev => prev.filter(f => f.id !== folderId));
            window.dispatchEvent(new CustomEvent('folder-update', { detail: { removeId: folderId, type: 'folder' } }));
            loadFolders();
        } catch (err) { console.error(err); }
    };

    const handleConfirmCreate = async (tempId, name, type, parentId, specialType) => {
        // Legacy support if needed, but Modal replaces Main folder creation.
        // Used by Inline Inputs (if we keep them for Entities)
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
                            placeholder="Buscar en Biblia..."
                            className="w-full bg-surface-light/50 border border-glass-border rounded-xl py-2 pl-9 pr-3 text-xs focus:border-primary/50 outline-none transition-all text-white placeholder:text-text-muted/50"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Explorador</h2>
                        <div className="relative">
                            <button
                                className="transition-colors hover:text-white text-primary"
                                onClick={() => handleCreateSimpleFolder(null)}
                                title="Crear Carpeta"
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
                            <p className="text-[10px] uppercase font-bold">Biblia Vacía</p>
                        </div>
                    ) : (
                        folders.map(folder => (
                            <FolderItem
                                key={folder.uiKey || folder.id}
                                folder={folder}
                                onCreateSubfolder={handleCreateSimpleFolder} // Simple folder creation for sidebar
                                onRename={handleRenameFolder}
                                onDeleteFolder={handleDeleteFolder}
                                onDeleteEntity={handleDeleteFolder}
                                onCreateTemplate={() => { }}
                                onMoveEntity={(e, f, s) => console.log('move', e, f, s)}
                                onCreateEntity={handleCreateEntity}
                                onConfirmCreate={handleConfirmCreate}
                            />
                        ))
                    )}
                </div>
            </aside>

            {/* RIGHT PANEL: CONTENT OUTLET */}
            <main className="flex-1 overflow-hidden relative bg-gradient-to-br from-background-dark to-surface-dark/20">
                <Outlet context={{
                    ...architectContext,
                    handleCreateEntity,
                    handleOpenCreateModal
                }} />
            </main>

            {/* MODAL */}
            <CreateNodeModal
                isOpen={creationModalOpen}
                onClose={() => setCreationModalOpen(false)}
                onCreate={handleCreateSubmit}
                parentFolder={targetParent}
            />
        </div>
    );
};

export default WorldBibleLayout;
