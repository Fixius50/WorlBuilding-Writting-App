import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation, Link, NavLink } from 'react-router-dom';
import api from '../../../js/services/api';
// import TopNavigation from './TopNavigation'; // Removed for Top Nav
// import BottomDock from './BottomDock'; // Removed for Top Nav
import GlassPanel from '../common/GlassPanel';

const NavItem = ({ to, icon, label, collapsed, end }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all group
            ${isActive
                ? 'bg-primary text-white shadow-lg shadow-primary/20'
                : 'text-text-muted hover:text-white hover:bg-white/5'}
            ${collapsed ? 'justify-center' : ''}
        `}
        title={collapsed ? label : ''}
    >
        <span className="material-symbols-outlined text-xl">{icon}</span>
        {!collapsed && <span className="text-sm font-bold tracking-wide">{label}</span>}
    </NavLink>
);

const getIconForType = (type) => {
    switch (type) {
        case 'text': return 'notes';
        case 'short_text': return 'short_text';
        case 'number': return 'pin';
        case 'date': return 'calendar_today';
        case 'select': return 'list';
        case 'boolean': return 'check_box';
        case 'map': return 'map';
        case 'timeline': return 'timeline';
        case 'entity_link': return 'link';
        default: return 'label';
    }
};

const FolderItem = ({ folder, onCreateSubfolder, onRename, onDelete, onCreateTemplate }) => {
    const { username, projectName } = useParams();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState({ folders: [], entities: [] });
    const [loaded, setLoaded] = useState(false);
    const [contextMenu, setContextMenu] = useState(null); // { x, y }
    const [itemName, setItemName] = useState(folder.nombre);

    // Sync prop with local state in case parent updates
    useEffect(() => {
        setItemName(folder.nombre);
    }, [folder.nombre]);

    // Listen for updates to this folder to reload content
    useEffect(() => {
        const handleUpdate = (e) => {
            const { folderId, optimisticType, confirmedType, removeId, item, oldId, expand, type } = e.detail || {};

            if (folderId === folder.id) {
                // AUTO-EXPAND
                if (expand) {
                    setIsOpen(true);
                    // If not loaded, we load (which fetches real data).
                    // If optimistic item was just added, loading might act weird if it's too fast, 
                    // but usually we want to append the optimistic item IF we are already loaded.
                    if (!loaded) loadContent();
                }

                // If we are loaded, manipulate local state directly
                if (loaded) {
                    if (optimisticType) {
                        // Add temporary item
                        const key = optimisticType === 'folder' ? 'folders' : 'entities';
                        setContent(prev => ({
                            ...prev,
                            [key]: [...prev[key], item]
                        }));
                    } else if (confirmedType) {
                        // Swap temp with real
                        const key = confirmedType === 'folder' ? 'folders' : 'entities';
                        setContent(prev => ({
                            ...prev,
                            [key]: prev[key].map(i => i.id === oldId ? item : i)
                        }));
                    } else if (removeId) {
                        // Remove failed item
                        const key = type === 'folder' ? 'folders' : 'entities';
                        setContent(prev => ({
                            ...prev,
                            [key]: prev[key].filter(i => i.id !== removeId)
                        }));
                    } else if (!optimisticType && !confirmedType && !removeId) {
                        // Standard reload fallback
                        loadContent();
                    }
                }
            }
        };
        window.addEventListener('folder-update', handleUpdate);
        return () => window.removeEventListener('folder-update', handleUpdate);
    }, [folder.id, loaded]);

    const loadContent = async () => {
        try {
            const [subs, ents] = await Promise.all([
                api.get(`/world-bible/folders/${folder.id}/subfolders`),
                api.get(`/world-bible/folders/${folder.id}/entities`)
            ]);
            setContent({ folders: subs, entities: ents });
            setLoaded(true);
        } catch (err) {
            console.error("Error reloading folder content:", err);
        }
    };

    const toggle = async (e) => {
        e.stopPropagation();
        setIsOpen(!isOpen);
        if (!loaded && !isOpen) { // Only load if opening and not loaded
            loadContent();
        }
    };

    const navigateToFolder = () => {
        navigate(`/${username}/${projectName}/bible/folder/${folder.id}`);
    };

    const handleLocalRename = (id, currentName) => {
        const newName = prompt("Rename folder:", currentName);
        if (!newName || newName === currentName) return;

        setItemName(newName); // Optimistic visual update
        onRename(id, newName).catch(() => setItemName(currentName)); // Revert on fail
    };

    const handleContextMenu = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setContextMenu({ x: e.clientX, y: e.clientY });
    };

    const closeContextMenu = () => setContextMenu(null);

    // Close menu on click elsewhere
    useEffect(() => {
        if (contextMenu) {
            window.addEventListener('click', closeContextMenu);
            return () => window.removeEventListener('click', closeContextMenu);
        }
    }, [contextMenu]);

    return (
        <div className="space-y-1 select-none">
            <div
                className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-bold text-text-muted hover:text-white hover:bg-white/5 cursor-pointer transition-all group relative"
                onClick={navigateToFolder}
                onContextMenu={handleContextMenu}
            >
                <span
                    onClick={toggle}
                    className={`material-symbols-outlined text-lg transition-transform hover:text-primary ${isOpen ? 'rotate-90 text-primary' : 'opacity-50'}`}
                >
                    chevron_right
                </span>
                <span className="material-symbols-outlined text-lg text-primary/70">folder</span>
                <span className="truncate flex-1">{itemName}</span>

                {/* Hover Actions (Desktop) */}
                <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex gap-1 bg-surface-dark border border-glass-border rounded-lg p-0.5 shadow-lg transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onCreateSubfolder(folder.id); }}
                        className="p-1 hover:bg-white/10 rounded" title="New Subfolder"
                    >
                        <span className="material-symbols-outlined text-xs">create_new_folder</span>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); handleLocalRename(folder.id, itemName); }}
                        className="p-1 hover:bg-white/10 rounded" title="Rename"
                    >
                        <span className="material-symbols-outlined text-xs">edit</span>
                    </button>
                </div>
            </div>

            {/* Context Menu */}
            {contextMenu && (
                <div
                    className="fixed bg-surface-dark border border-glass-border shadow-2xl rounded-xl py-2 z-50 w-48 text-xs font-medium flex flex-col"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()} // Prevent closing immediately
                >
                    <button className="px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2" onClick={() => { onCreateSubfolder(folder.id); closeContextMenu(); }}>
                        <span className="material-symbols-outlined text-sm">create_new_folder</span> New Folder
                    </button>
                    <button className="px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2" onClick={() => { handleLocalRename(folder.id, itemName); closeContextMenu(); }}>
                        <span className="material-symbols-outlined text-sm">edit</span> Rename
                    </button>
                    <div className="h-px bg-white/5 my-1" />

                    <div className="px-4 py-1 text-[10px] uppercase font-bold text-text-muted opacity-50">Add Default Attribute</div>
                    <button className="px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2" onClick={() => { onCreateTemplate(folder.id, 'short_text'); closeContextMenu(); }}>
                        <span className="material-symbols-outlined text-sm">short_text</span> Text Field
                    </button>
                    {/* ... other type buttons ... */}

                    <div className="h-px bg-white/5 my-1" />
                    <button className="px-4 py-2 hover:bg-red-500/10 text-red-400 text-left flex items-center gap-2" onClick={() => { onDelete(folder.id); closeContextMenu(); }}>
                        <span className="material-symbols-outlined text-sm">delete</span> Delete
                    </button>
                </div>
            )}

            {isOpen && (
                <div className="ml-6 pl-4 border-l border-glass-border space-y-1 animate-slide-in">
                    {content.folders.map(sub => (
                        <FolderItem
                            key={sub.uiKey || sub.id}
                            folder={sub}
                            onCreateSubfolder={onCreateSubfolder}
                            onRename={onRename}
                            onDelete={onDelete}
                            onCreateTemplate={onCreateTemplate}
                            className={sub.pending ? 'opacity-50 pointer-events-none' : ''}
                        />
                    ))}
                    {content.entities.map(ent => (
                        <Link
                            key={ent.id}
                            to={`/${username}/${projectName}/bible/entity/${ent.id}`}
                            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-medium text-text-muted hover:text-white hover:bg-primary/10 transition-all group cursor-grab active:cursor-grabbing ${ent.pending ? 'opacity-50 pointer-events-none' : ''}`}
                            draggable={!ent.pending}
                            onDragStart={(e) => {
                                e.dataTransfer.setData('application/reactflow/type', 'entity');
                                e.dataTransfer.setData('entityId', ent.id);
                                e.dataTransfer.setData('entityName', ent.nombre);
                                e.dataTransfer.effectAllowed = 'copy';
                            }}
                        >
                            <span className="material-symbols-outlined text-sm opacity-50 group-hover:text-primary transition-colors">description</span>
                            <span className="truncate">{ent.nombre}</span>
                        </Link>
                    ))}
                    {loaded && content.folders.length === 0 && content.entities.length === 0 && (
                        <div className="px-3 py-2 text-[10px] text-text-muted/30 uppercase font-black italic tracking-tighter">Empty Sector</div>
                    )}
                </div>
            )}
        </div>
    );
};

const ArchitectLayout = () => {
    const { username, projectName: paramProjectName } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(false);
    const [loadedProjectName, setLoadedProjectName] = useState('Loading...');
    const [projectId, setProjectId] = useState(null);
    const [creationMenuOpen, setCreationMenuOpen] = useState(false);

    const [folders, setFolders] = useState([]);
    const [availableTemplates, setAvailableTemplates] = useState([]);
    const [addAttributeHandler, setAddAttributeHandler] = useState(null);
    const requestQueue = React.useRef([]); // Queue for dependent requests

    const baseUrl = `/${username}/${paramProjectName}`;

    useEffect(() => {
        const init = async () => {
            if (paramProjectName) {
                await loadProject(paramProjectName);
                loadFolders();
            }
        };
        init();
    }, [paramProjectName]);

    // Global listener for folder updates to process queue
    useEffect(() => {
        const processQueue = async (event) => {
            if (!event.detail || !event.detail.confirmedType) return;

            const { oldId, item } = event.detail;
            const realId = item.id;

            // Find queued items waiting for this oldId
            const waitingItems = requestQueue.current.filter(req => req.tempParentId === oldId);

            // Remove them from queue
            requestQueue.current = requestQueue.current.filter(req => req.tempParentId !== oldId);

            // Execute them
            for (const req of waitingItems) {
                try {
                    // Update parent ID
                    if (req.type === 'createFolder') {
                        await doCreateFolder(req.name, realId, req.tempId);
                    } else if (req.type === 'createEntity') {
                        await doCreateEntity(req.name, realId, req.specialType, req.tempId);
                    }
                } catch (err) {
                    console.error("Error processing queued item:", err);
                }
            }
        };

        window.addEventListener('folder-update', processQueue);
        return () => window.removeEventListener('folder-update', processQueue);
    }, []);

    const loadProject = async (identifier) => {
        try {
            const proj = await api.get(`/proyectos/${identifier}`);
            if (proj) {
                setLoadedProjectName(proj.nombreProyecto);
                setProjectId(proj.id);
                // Ensure session is set by calling open (backend does this in get /identifier too usually, but safe to verify)
                // The GET /identifier endpoint in backend ALREADY sets the session.
            }
        } catch (err) {
            console.error("Error loading project:", err);
        }
    };

    const loadFolders = async () => {
        try {
            const rootFolders = await api.get('/world-bible/folders');
            setFolders(rootFolders);
        } catch (err) {
            console.error("Error loading folders:", err);
        }
    };

    const doCreateFolder = async (name, parentId, tempId) => {
        try {
            const newFolder = await api.post('/world-bible/folders', { nombre: name, padreId: parentId });

            // 2. Confirmed Update (Swap key)
            if (parentId === null) {
                // For root folders, we just update the ID in the list
                setFolders(prev => prev.map(f => f.id === tempId ? { ...newFolder } : f));
            } else {
                // For nested, dispatch event to swap
                window.dispatchEvent(new CustomEvent('folder-update', {
                    detail: { folderId: parentId, confirmedType: 'folder', oldId: tempId, item: { ...newFolder } }
                }));
            }
        } catch (err) {
            console.error("Error creating folder:", err);
            // 3. Rollback
            if (parentId === null) {
                setFolders(prev => prev.filter(f => f.id !== tempId));
            } else {
                window.dispatchEvent(new CustomEvent('folder-update', {
                    detail: { folderId: parentId, removeId: tempId, type: 'folder' }
                }));
            }
            alert(`Failed to create folder: ${err.message}`);
        }
    };

    const handleCreateFolder = async (parentId = null) => {
        const name = prompt("Enter folder name:");
        if (!name) return;

        const tempId = `temp-${Date.now()}`;
        const tempFolder = { id: tempId, uiKey: tempId, nombre: name, parentId, pending: true };

        // 1. Optimistic Update
        if (parentId === null) {
            setFolders(prev => [...prev, tempFolder]);
        } else {
            // Dispatch optimistic event to parent folder
            // Note: If parentId is also temporary, the FolderItem for it exists and is listening to its tempId.
            window.dispatchEvent(new CustomEvent('folder-update', {
                detail: { folderId: parentId, optimisticType: 'folder', item: tempFolder, expand: true }
            }));
        }

        // Check if Parent is Temporary
        if (parentId && typeof parentId === 'string' && parentId.startsWith('temp-')) {
            requestQueue.current.push({ type: 'createFolder', name, tempParentId: parentId, tempId });
            return;
        }

        await doCreateFolder(name, parentId, tempId);
    };

    const handleRenameFolder = async (folderId, newName) => { // Updated sig
        // NOTE: Renaming logic is now partially handled in FolderItem for visual update.
        // We still need this to call API. 
        // If we want to update Root folders list state:
        try {
            await api.put(`/world-bible/folders/${folderId}`, { nombre: newName });

            // If it's a root folder, update our local state so it persists if we close/open
            setFolders(prev => prev.map(f => f.id === folderId ? { ...f, nombre: newName } : f));

            // Also dispatch event in case it's a child folder somewhere else? 
            // Only strictly needed if we have duplicate views or complex state.
            // window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId } })); 
        } catch (err) {
            console.error("Error renaming folder:", err);
            throw err; // throw so FolderItem visual update can revert
        }
    };

    const handleDeleteFolder = async (folderId) => {
        if (!confirm("Are you sure you want to delete this folder?")) return;
        try {
            await api.delete(`/world-bible/folders/${folderId}`);
            window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId } }));
            loadFolders();
        } catch (err) {
            console.error("Error deleting folder:", err);
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

            if (response && response.id) {
                navigate(`${baseUrl}/bible/entity/${response.id}`);
            }
        } catch (err) {
            console.error("Error creating entity:", err);
            window.dispatchEvent(new CustomEvent('folder-update', {
                detail: { folderId: folderId, removeId: tempId, type: 'entity' }
            }));
        }
    };

    const handleCreateEntity = async (folderId, specialType = null) => {
        const typeName = specialType === 'map' ? 'Map' : specialType === 'timeline' ? 'Timeline' : 'Entity';
        const name = prompt(`Enter ${typeName} name:`);
        if (!name) return;

        // Default folder logic
        let targetFolderId = folderId;
        if (!targetFolderId && folders.length > 0) {
            targetFolderId = folders[0].id; // Use first root folder
            // Note: If folders[0] is temporary? It works because we use its ID.
        } else if (!targetFolderId) {
            // If no folders exist, we can't create entity (unless we auto-create a root folder?)
            alert("Please create a folder first!");
            return;
        }

        const tempId = `temp-${Date.now()}`;
        const tempEntity = { id: tempId, uiKey: tempId, nombre: name, carpetaId: targetFolderId, tipoEspecial: specialType, pending: true };

        // 1. Optimistic Update
        window.dispatchEvent(new CustomEvent('folder-update', {
            detail: { folderId: targetFolderId, optimisticType: 'entity', item: tempEntity, expand: true }
        }));

        // Check if Parent is Temporary
        if (targetFolderId && typeof targetFolderId === 'string' && targetFolderId.startsWith('temp-')) {
            requestQueue.current.push({ type: 'createEntity', name, tempParentId: targetFolderId, specialType, tempId });
            return;
        }

        await doCreateEntity(name, targetFolderId, specialType, tempId);
    };

    const handleCreateTemplate = async (folderId, type) => {
        const name = prompt(`Enter name for new ${type} attribute:`);
        if (!name) return;
        try {
            await api.post(`/world-bible/folders/${folderId}/templates`, {
                nombre: name,
                tipo: type,
                required: false
            });
            alert("Attribute template added to folder!");
        } catch (err) {
            console.error("Error creating template:", err);
            alert("Failed to add attribute template");
        }
    };

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-text-main font-sans selection:bg-primary/30">

            {/* --- LEFT PANEL: NAVIGATION & EXPLORER --- */}
            <aside
                className={`
                    flex-none bg-surface-dark border-r border-glass-border transition-all duration-500 relative flex flex-col z-30
                    ${leftOpen ? 'w-80' : 'w-20'}
                `}
            >
                {/* Header / Brand */}
                <div className="h-16 flex items-center justify-center border-b border-glass-border relative">
                    {leftOpen ? (
                        <div className="flex items-center gap-2">
                            <div className="size-8 rounded-lg bg-surface-light flex items-center justify-center text-primary shadow-inner">
                                <span className="material-symbols-outlined text-xl">auto_stories</span>
                            </div>
                            <h2 className="text-sm font-black uppercase tracking-widest text-white truncate max-w-[150px]">{loadedProjectName}</h2>
                        </div>
                    ) : (
                        <button onClick={() => setLeftOpen(true)} className="size-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-text-muted hover:text-white transition-all">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    )}
                    {leftOpen && (
                        <button onClick={() => setLeftOpen(false)} className="absolute right-4 text-text-muted hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-lg">dock_to_left</span>
                        </button>
                    )}
                </div>

                <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
                    {/* Main Navigation */}
                    <div className="p-3 border-b border-glass-border space-y-1">
                        <NavItem to={baseUrl} icon="home" label="Dashboard" collapsed={!leftOpen} end />
                        <NavItem to={`${baseUrl}/bible`} icon="menu_book" label="World Bible" collapsed={!leftOpen} />
                        <NavItem to={`${baseUrl}/map`} icon="map" label="Atlas" collapsed={!leftOpen} />
                        <NavItem to={`${baseUrl}/timeline`} icon="calendar_month" label="Chronology" collapsed={!leftOpen} />
                        <NavItem to={`${baseUrl}/writing`} icon="edit_note" label="Writing" collapsed={!leftOpen} />
                        <NavItem to={`${baseUrl}/settings`} icon="settings" label="Settings" collapsed={!leftOpen} />
                    </div>

                    {/* World Bible Explorer (Only if Bible is active OR always? User requested navigation move, implying explorer stays) */}
                    {/* Visual separation */}
                    {leftOpen && <div className="px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted/50">Explorer</div>}

                    <div className="flex-1 p-3 space-y-4">
                        {leftOpen ? (
                            <>
                                {/* Search */}
                                <div className="relative group px-1">
                                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-text-muted text-lg group-focus-within:text-primary transition-colors">search</span>
                                    <input
                                        type="text"
                                        placeholder="Search..."
                                        className="w-full bg-surface-light/50 border border-glass-border rounded-xl py-2 pl-10 pr-4 text-xs focus:border-primary/50 outline-none transition-all placeholder:text-text-muted/50"
                                    />
                                </div>

                                {/* Folder Tree Header */}
                                <div className="flex items-center justify-between px-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Folders</h3>
                                    <div className="relative group/create">
                                        <button
                                            className={`transition-colors ${creationMenuOpen ? 'text-primary' : 'text-text-muted hover:text-primary'}`}
                                            title="Create New..."
                                            onClick={() => setCreationMenuOpen(!creationMenuOpen)}
                                        >
                                            <span className="material-symbols-outlined text-sm">add_circle</span>
                                        </button>

                                        {/* Dropdown Menu */}
                                        {creationMenuOpen && (
                                            <>
                                                <div
                                                    className="fixed inset-0 z-40 bg-transparent"
                                                    onClick={() => setCreationMenuOpen(false)}
                                                />
                                                <div className="absolute right-0 top-full mt-2 w-48 bg-surface-dark border border-glass-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                                    <button
                                                        onClick={() => { handleCreateFolder(null); setCreationMenuOpen(false); }}
                                                        className="w-full px-4 py-2.5 hover:bg-white/5 text-left flex items-center gap-2 group/item"
                                                    >
                                                        <span className="material-symbols-outlined text-sm text-primary group-hover/item:scale-110 transition-transform">folder</span>
                                                        <span className="text-xs font-bold text-white">New Folder</span>
                                                    </button>
                                                    <div className="h-px bg-white/5 mx-2 my-1"></div>
                                                    <button
                                                        onClick={() => { handleCreateEntity(null, 'default'); setCreationMenuOpen(false); }}
                                                        className="w-full px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2 text-text-muted hover:text-white"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">description</span>
                                                        <span className="text-xs">New Entity</span>
                                                    </button>
                                                    <button
                                                        onClick={() => { handleCreateEntity(null, 'timeline'); setCreationMenuOpen(false); }}
                                                        className="w-full px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2 text-text-muted hover:text-white"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">timeline</span>
                                                        <span className="text-xs">New Timeline</span>
                                                    </button>
                                                    <button
                                                        onClick={() => { handleCreateEntity(null, 'map'); setCreationMenuOpen(false); }}
                                                        className="w-full px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2 text-text-muted hover:text-white"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">map</span>
                                                        <span className="text-xs">New Map / Zone</span>
                                                    </button>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Tree Content */}
                                {folders.length === 0 ? (
                                    <div className="p-8 text-center border border-dashed border-glass-border rounded-3xl opacity-30">
                                        <span className="material-symbols-outlined text-3xl mb-2 block">folder_off</span>
                                        <p className="text-[10px] uppercase font-bold tracking-tighter">Empty Bible</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {folders.map(folder => (
                                            <FolderItem
                                                key={folder.uiKey || folder.id}
                                                folder={folder}
                                                onCreateSubfolder={handleCreateFolder}
                                                onRename={handleRenameFolder}
                                                onDelete={handleDeleteFolder}
                                                onCreateTemplate={handleCreateTemplate}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        ) : (
                            // Collapsed State - Minimal indicators check
                            <div className="flex flex-col items-center gap-4 text-text-muted/20">
                                <div className="w-8 h-px bg-white/10"></div>
                                <span className="material-symbols-outlined text-lg">folder</span>
                            </div>
                        )}
                    </div>
                </div>

                <footer className="p-4 border-t border-glass-border">
                    <div className={`flex items-center gap-3 ${!leftOpen && 'justify-center'}`}>
                        <div className="size-10 rounded-full border border-glass-border p-1 bg-surface-light relative">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-black text-xs">
                                {username ? username.substring(0, 2).toUpperCase() : 'US'}
                            </div>
                            <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-surface-dark rounded-full"></div>
                        </div>
                        {leftOpen && (
                            <div className="overflow-hidden">
                                <h4 className="text-xs font-bold text-white truncate">{username || 'User'}</h4>
                                <p className="text-[10px] text-text-muted uppercase font-black tracking-tighter">Architect</p>
                            </div>
                        )}
                    </div>
                </footer>
            </aside>

            {/* --- CENTRAL PANEL: CANVAS --- */}
            <main className="flex-1 flex flex-col min-w-0 bg-background-dark relative">
                {/* Top decorative bar (optional, or breadcrumbs later) */}
                <div className="h-16 w-full absolute top-0 left-0 bg-gradient-to-b from-background-dark to-transparent pointer-events-none"></div>

                <div className="flex-1 flex overflow-hidden relative z-0">
                    <Outlet context={{
                        availableTemplates, setAvailableTemplates,
                        setAddAttributeHandler,
                        projectName: loadedProjectName,
                        projectId,
                        handleCreateEntity
                    }} />
                </div>
            </main>

            {/* --- RIGHT PANEL: TOOLBOX / CONTEXT --- */}
            <aside
                className={`
                    flex-none bg-surface-dark border-l border-glass-border transition-all duration-500 relative flex flex-col z-30
                    ${rightOpen ? 'w-80' : 'w-20'}
                `}
            >
                <header className="h-16 flex items-center px-6 border-b border-glass-border justify-between">
                    {rightOpen ? (
                        <>
                            <h2 className="text-xs font-black uppercase tracking-widest text-white">Toolbox</h2>
                            <button onClick={() => setRightOpen(false)} className="text-text-muted hover:text-white transition-colors" title="Collapse Toolbox">
                                <span className="material-symbols-outlined text-lg">dock_to_right</span>
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setRightOpen(true)} className="w-full h-full flex items-center justify-center text-text-muted hover:text-white transition-colors" title="Expand Toolbox">
                            <span className="material-symbols-outlined">menu_open</span>
                        </button>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-4">
                    {rightOpen ? (
                        <>
                            {availableTemplates.length === 0 ? (
                                <div className="p-8 text-center border border-dashed border-glass-border rounded-3xl opacity-20 mt-4">
                                    <span className="material-symbols-outlined text-3xl mb-2 block">construction</span>
                                    <h3 className="font-bold text-white uppercase tracking-widest text-[10px]">No templates available</h3>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2">Attribute Palette</h3>
                                    {availableTemplates.map(tpl => (
                                        <button
                                            key={tpl.id}
                                            className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-glass-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group"
                                            onClick={() => {
                                                if (addAttributeHandler) addAttributeHandler(tpl.id);
                                            }}
                                            title={`Add ${tpl.nombre}`}
                                            draggable
                                            onDragStart={(e) => {
                                                e.dataTransfer.setData('application/reactflow/type', 'attribute');
                                                e.dataTransfer.setData('templateId', tpl.id);
                                                e.dataTransfer.effectAllowed = 'move';
                                            }}
                                        >
                                            <div className="size-8 rounded-lg bg-surface-light flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                <span className="material-symbols-outlined text-sm">
                                                    {getIconForType(tpl.tipo)}
                                                </span>
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="text-xs font-bold text-white truncate">{tpl.nombre}</p>
                                                <p className="text-[10px] text-text-muted uppercase font-black tracking-tighter">{tpl.tipo}</p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            {availableTemplates.map(tpl => (
                                <button
                                    key={tpl.id}
                                    className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-primary/20 transition-all"
                                    onClick={() => {
                                        if (addAttributeHandler) addAttributeHandler(tpl.id);
                                    }}
                                    title={`Add ${tpl.nombre}`}
                                    draggable
                                    onDragStart={(e) => {
                                        e.dataTransfer.setData('application/reactflow/type', 'attribute');
                                        e.dataTransfer.setData('templateId', tpl.id);
                                        e.dataTransfer.effectAllowed = 'move';
                                    }}
                                >
                                    <span className="material-symbols-outlined text-lg">
                                        {getIconForType(tpl.tipo)}
                                    </span>
                                </button>
                            ))}
                            {availableTemplates.length === 0 && (
                                <span className="material-symbols-outlined text-text-muted/30">construction</span>
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
};

export default ArchitectLayout;
