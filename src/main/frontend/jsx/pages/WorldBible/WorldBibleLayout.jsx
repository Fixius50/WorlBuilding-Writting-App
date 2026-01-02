import React, { useState, useEffect, useRef } from 'react';
import { Outlet, useParams, useNavigate } from 'react-router-dom';
import api from '../../../js/services/api';
import FolderItem from '../../components/bible/FolderItem';

// World Bible Layout: Persistent Left Explorer + Right Outlet
const WorldBibleLayout = () => {
    const { username, projectName } = useParams();
    const navigate = useNavigate();
    const [folders, setFolders] = useState([]);
    const [creationMenuOpen, setCreationMenuOpen] = useState(false);
    const [availableTemplates, setAvailableTemplates] = useState([]);

    // We can define base URL or context
    const baseUrl = `/${username}/${projectName}/bible`;

    useEffect(() => {
        loadFolders();
        loadTemplates();
    }, [projectName]);

    const loadFolders = async () => {
        try {
            const rootFolders = await api.get('/world-bible/folders');
            setFolders(rootFolders);
        } catch (err) { console.error("Error loading folders:", err); }
    };

    const loadTemplates = async () => {
        // Mock or real call if needed for creation
        // setAvailableTemplates(...)
    };

    // --- Actions (Copied/Refactored from ArchitectLayout) ---
    const handleCreateFolder = async (parentId = null) => {
        const tempId = `temp-${Date.now()}`;
        const tempFolder = { id: tempId, uiKey: tempId, nombre: '', parentId, pending: true, isNew: true };

        if (parentId === null) {
            setFolders(prev => [...prev, tempFolder]);
        } else {
            window.dispatchEvent(new CustomEvent('folder-update', {
                detail: { folderId: parentId, optimisticType: 'folder', item: tempFolder, expand: true }
            }));
        }
    };

    const handleCreateEntity = async (folderId, specialType = 'entidadindividual') => {
        let targetFolderId = folderId;
        if (!targetFolderId && folders.length > 0) targetFolderId = folders[0].id;
        else if (!targetFolderId) return alert("Create a folder first!");

        const tempId = `temp-${Date.now()}`;
        const tempEntity = { id: tempId, uiKey: tempId, nombre: '', carpetaId: targetFolderId, tipoEspecial: specialType, pending: true, isNew: true };

        window.dispatchEvent(new CustomEvent('folder-update', {
            detail: { folderId: targetFolderId, optimisticType: 'entity', item: tempEntity, expand: true }
        }));
    };

    const handleConfirmCreate = async (tempId, name, type, parentId, specialType) => {
        if (type === 'folder') {
            await doCreateFolder(name, parentId, tempId);
        } else {
            await doCreateEntity(name, parentId, specialType, tempId);
        }
    };

    const doCreateFolder = async (name, parentId, tempId) => {
        try {
            const newFolder = await api.post('/world-bible/folders', { nombre: name, padreId: parentId });
            if (parentId === null) {
                setFolders(prev => prev.map(f => f.id === tempId ? { ...newFolder } : f));
            } else {
                window.dispatchEvent(new CustomEvent('folder-update', {
                    detail: { folderId: parentId, confirmedType: 'folder', oldId: tempId, item: { ...newFolder } }
                }));
            }
        } catch (err) {
            if (parentId === null) setFolders(prev => prev.filter(f => f.id !== tempId));
            else window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: parentId, removeId: tempId, type: 'folder' } }));
            alert("Failed to create folder");
        }
    };

    const doCreateEntity = async (name, folderId, specialType, tempId) => {
        try {
            const response = await api.post('/world-bible/entities', {
                nombre: name,
                carpetaId: folderId,
                tipoEspecial: specialType
            });
            window.dispatchEvent(new CustomEvent('folder-update', {
                detail: { folderId: folderId, confirmedType: 'entity', oldId: tempId, item: { ...response, uiKey: tempId } }
            }));
            navigate(`${baseUrl}/entity/${response.id}`);
        } catch (err) {
            window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: folderId, removeId: tempId, type: 'entity' } }));
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

    const handleCreateTemplate = async (folderId, type) => {
        // Implementation similar to ArchitectLayout if needed
    };


    return (
        <div className="flex h-full w-full bg-background-dark max-w-[1920px] mx-auto">
            {/* LEFT PANEL: EXPLORER (300px Fixed or Resizable) */}
            <aside className="w-80 flex-none flex flex-col border-r border-glass-border bg-surface-dark/50 z-10">
                {/* Search Header */}
                <div className="p-4 border-b border-glass-border">
                    <div className="relative group mb-3">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm group-focus-within:text-primary transition-colors">search</span>
                        <input
                            type="text"
                            placeholder="Search in Bible..."
                            className="w-full bg-surface-light/50 border border-glass-border rounded-xl py-2 pl-9 pr-3 text-xs focus:border-primary/50 outline-none transition-all text-white placeholder:text-text-muted/50"
                        />
                    </div>

                    <div className="flex items-center justify-between">
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Explorer</h2>
                        <div className="relative">
                            <button
                                className={`transition-colors hover:text-white ${creationMenuOpen ? 'text-primary' : 'text-text-muted'}`}
                                onClick={() => setCreationMenuOpen(!creationMenuOpen)}
                            >
                                <span className="material-symbols-outlined text-sm">add_circle</span>
                            </button>
                            {creationMenuOpen && (
                                <>
                                    <div className="fixed inset-0 z-40" onClick={() => setCreationMenuOpen(false)}></div>
                                    <div className="absolute right-0 top-full mt-2 w-48 bg-surface-dark border border-glass-border rounded-xl shadow-xl z-50 p-1 animate-in fade-in zoom-in-95 duration-200">
                                        <button onClick={() => { handleCreateFolder(null); setCreationMenuOpen(false); }} className="w-full px-3 py-2 hover:bg-white/5 rounded-lg text-left flex items-center gap-2 text-xs text-white">
                                            <span className="material-symbols-outlined text-sm text-primary">folder</span> New Folder
                                        </button>
                                        <button onClick={() => { handleCreateEntity(null, 'entidadindividual'); setCreationMenuOpen(false); }} className="w-full px-3 py-2 hover:bg-white/5 rounded-lg text-left flex items-center gap-2 text-xs text-text-muted hover:text-white">
                                            <span className="material-symbols-outlined text-sm">person</span> New Character
                                        </button>
                                        {/* Add more types */}
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tree Content */}
                <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-0.5">
                    {folders.length === 0 ? (
                        <div className="p-8 text-center opacity-30">
                            <span className="material-symbols-outlined text-3xl mb-2">folder_off</span>
                            <p className="text-[10px] uppercase font-bold">Empty Bible</p>
                        </div>
                    ) : (
                        folders.map(folder => (
                            <FolderItem
                                key={folder.uiKey || folder.id}
                                folder={folder}
                                onCreateSubfolder={handleCreateFolder}
                                onRename={handleRenameFolder}
                                onDeleteFolder={handleDeleteFolder}
                                onDeleteEntity={handleDeleteFolder} // Uses same logic for now or split
                                onCreateTemplate={handleCreateTemplate}
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
                    handleCreateEntity // Pass down for pages to use
                }} />
            </main>
        </div>
    );
};

export default WorldBibleLayout;
