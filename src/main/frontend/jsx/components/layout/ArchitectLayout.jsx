import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation, Link } from 'react-router-dom';
import api from '../../../js/services/api';
import BottomDock from './BottomDock';
import GlassPanel from '../common/GlassPanel';

const ArchitectLayout = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();

    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(false);
    const [projectName, setProjectName] = useState('Loading...');

    const [folders, setFolders] = useState([]);
    const [availableTemplates, setAvailableTemplates] = useState([]);
    const [addAttributeHandler, setAddAttributeHandler] = useState(null);

    useEffect(() => {
        if (id) {
            loadProject(id);
            loadFolders();
        }
    }, [id]);

    const loadProject = async (projectId) => {
        try {
            const proj = await api.get(`/proyectos/${projectId}`);
            if (proj) {
                setProjectName(proj.nombreProyecto);
                await api.get(`/proyectos/abrir/${proj.nombreProyecto}`);
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

    const handleCreateFolder = async (parentId = null) => {
        const name = prompt("Enter folder name:");
        if (!name) return;
        try {
            await api.post('/world-bible/folders', { nombre: name, parentFolderId: parentId });
            // Refresh logic
            if (parentId === null) {
                loadFolders();
            } else {
                // If it's a subfolder, we might need to trigger a refresh on the parent item.
                // For simplified state management, I'll force a full reload or use a context event.
                // For now: Full reload if simple, or better yet, pass a callback.
                // Actually, let's just reload root for simplicity or implement a specific event bus later.
                // Because FolderItem has local state 'content', we need a way to refresh it.
                window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId: parentId } }));
                if (parentId === null) loadFolders();
            }
        } catch (err) {
            console.error("Error creating folder:", err);
            alert("Failed to create folder");
        }
    };

    const handleRenameFolder = async (folderId, currentName) => {
        const name = prompt("Rename folder:", currentName);
        if (!name || name === currentName) return;
        try {
            await api.put(`/world-bible/folders/${folderId}`, { nombre: name });
            window.dispatchEvent(new CustomEvent('folder-update', { detail: { folderId } })); // Trigger update
            loadFolders(); // Reload root just in case
        } catch (err) {
            console.error("Error renaming folder:", err);
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

            {/* --- LEFT PANEL: WORLD BIBLE EXPLORER --- */}
            <aside
                className={`
                    flex-none bg-surface-dark border-r border-glass-border transition-all duration-500 relative flex flex-col z-30
                    ${leftOpen ? 'w-80' : 'w-20'}
                `}
            >
                <header className="h-16 flex items-center px-6 border-b border-glass-border justify-between">
                    {leftOpen ? (
                        <div className="flex items-center gap-3">
                            <div className="size-8 rounded-xl bg-primary flex items-center justify-center text-white shrink-0 shadow-lg shadow-primary/20">
                                <span className="material-symbols-outlined text-lg">public</span>
                            </div>
                            <div className="overflow-hidden">
                                <h2 className="text-xs font-black uppercase tracking-widest text-white truncate w-40">{projectName}</h2>
                                <p className="text-[10px] text-text-muted uppercase font-bold tracking-tighter">Explorador</p>
                            </div>
                        </div>
                    ) : (
                        <button onClick={() => setLeftOpen(true)} className="size-10 rounded-xl hover:bg-white/5 flex items-center justify-center text-text-muted hover:text-white transition-all">
                            <span className="material-symbols-outlined">menu</span>
                        </button>
                    )}

                    {leftOpen && (
                        <button onClick={() => setLeftOpen(false)} className="text-text-muted hover:text-white transition-colors">
                            <span className="material-symbols-outlined text-lg">dock_to_left</span>
                        </button>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-6">
                    {leftOpen ? (
                        <>
                            {/* Search */}
                            <div className="relative group">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-lg group-focus-within:text-primary transition-colors">search</span>
                                <input
                                    type="text"
                                    placeholder="Search World Bible..."
                                    className="w-full bg-surface-light/50 border border-glass-border rounded-xl py-2.5 pl-10 pr-4 text-xs focus:border-primary/50 outline-none transition-all placeholder:text-text-muted/50"
                                />
                            </div>

                            {/* Folder Tree */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between px-2 mb-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted">Structure</h3>
                                    <button
                                        onClick={() => handleCreateFolder(null)}
                                        className="text-text-muted hover:text-primary transition-colors"
                                        title="Create Root Folder"
                                    >
                                        <span className="material-symbols-outlined text-sm">create_new_folder</span>
                                    </button>
                                </div>

                                {folders.length === 0 ? (
                                    <div className="p-8 text-center border border-dashed border-glass-border rounded-3xl opacity-30 mt-4">
                                        <span className="material-symbols-outlined text-3xl mb-2 block">folder_off</span>
                                        <p className="text-[10px] uppercase font-bold tracking-tighter">Empty Bible</p>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        {folders.map(folder => (
                                            <FolderItem
                                                key={folder.id}
                                                folder={folder}
                                                onCreateSubfolder={handleCreateFolder}
                                                onRename={handleRenameFolder}
                                                onDelete={handleDeleteFolder}
                                                onCreateTemplate={handleCreateTemplate}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center gap-6 pt-4">
                            <button className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:text-white" title="Folders">
                                <span className="material-symbols-outlined">folder</span>
                            </button>
                            <button className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:text-white" title="Connections Hub">
                                <span className="material-symbols-outlined">hub</span>
                            </button>
                            <button className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:text-white" title="History & Logs">
                                <span className="material-symbols-outlined">history_edu</span>
                            </button>
                        </div>
                    )}
                </div>

                <footer className="p-4 border-t border-glass-border">
                    <div className={`flex items-center gap-3 ${!leftOpen && 'justify-center'}`}>
                        <div className="size-10 rounded-full border border-glass-border p-1 bg-surface-light relative">
                            <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-black text-xs">RM</div>
                            <div className="absolute bottom-0 right-0 size-3 bg-emerald-500 border-2 border-surface-dark rounded-full"></div>
                        </div>
                        {leftOpen && (
                            <div className="overflow-hidden">
                                <h4 className="text-xs font-bold text-white truncate">Roberto</h4>
                                <p className="text-[10px] text-text-muted uppercase font-black tracking-tighter">Architect</p>
                            </div>
                        )}
                    </div>
                </footer>
            </aside>

            {/* --- CENTRAL PANEL: CANVAS --- */}
            <main className="flex-1 flex flex-col min-w-0 bg-background-dark relative">
                <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col">
                    <Outlet context={{
                        leftOpen, setLeftOpen,
                        rightOpen, setRightOpen,
                        availableTemplates, setAvailableTemplates,
                        setAddAttributeHandler,
                        projectName
                    }} />
                </div>

                {/* Bottom Navigation Dock */}
                <BottomDock />
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
                                    title={tpl.nombre}
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
    const { id: projectId } = useParams();
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState({ folders: [], entities: [] });
    const [loaded, setLoaded] = useState(false);
    const [contextMenu, setContextMenu] = useState(null); // { x, y }

    // Listen for updates to this folder to reload content
    useEffect(() => {
        const handleUpdate = (e) => {
            // If the update event is relevant to THIS folder (e.g. a child was added), reload.
            // Or if this folder itself was renamed (though parent handles that re-render usually).
            if (e.detail?.folderId === folder.id) {
                loadContent();
            }
        };
        window.addEventListener('folder-update', handleUpdate);
        return () => window.removeEventListener('folder-update', handleUpdate);
    }, [folder.id]);

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
        navigate(`/project/${projectId}/bible/folder/${folder.id}`);
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
                <span className="truncate flex-1">{folder.nombre}</span>

                {/* Hover Actions (Desktop) */}
                <div className="absolute right-2 opacity-0 group-hover:opacity-100 flex gap-1 bg-surface-dark border border-glass-border rounded-lg p-0.5 shadow-lg transition-opacity">
                    <button
                        onClick={(e) => { e.stopPropagation(); onCreateSubfolder(folder.id); }}
                        className="p-1 hover:bg-white/10 rounded" title="New Subfolder"
                    >
                        <span className="material-symbols-outlined text-xs">create_new_folder</span>
                    </button>
                    <button
                        onClick={(e) => { e.stopPropagation(); onRename(folder.id, folder.nombre); }}
                        className="p-1 hover:bg-white/10 rounded" title="Rename"
                    >
                        <span className="material-symbols-outlined text-xs">edit</span>
                    </button>
                </div>
            </div>

            {/* Context Menu Portal could be better, but fixed for now */}
            {contextMenu && (
                <div
                    className="fixed bg-surface-dark border border-glass-border shadow-2xl rounded-xl py-2 z-50 w-48 text-xs font-medium flex flex-col"
                    style={{ top: contextMenu.y, left: contextMenu.x }}
                    onClick={(e) => e.stopPropagation()} // Prevent closing immediately
                >
                    <button className="px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2" onClick={() => { onCreateSubfolder(folder.id); closeContextMenu(); }}>
                        <span className="material-symbols-outlined text-sm">create_new_folder</span> New Folder
                    </button>
                    <button className="px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2" onClick={() => { onRename(folder.id, folder.nombre); closeContextMenu(); }}>
                        <span className="material-symbols-outlined text-sm">edit</span> Rename
                    </button>
                    <div className="h-px bg-white/5 my-1" />

                    <div className="px-4 py-1 text-[10px] uppercase font-bold text-text-muted opacity-50">Add Default Attribute</div>
                    <button className="px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2" onClick={() => { onCreateTemplate(folder.id, 'short_text'); closeContextMenu(); }}>
                        <span className="material-symbols-outlined text-sm">short_text</span> Text Field
                    </button>
                    <button className="px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2" onClick={() => { onCreateTemplate(folder.id, 'number'); closeContextMenu(); }}>
                        <span className="material-symbols-outlined text-sm">pin</span> Number
                    </button>
                    <button className="px-4 py-2 hover:bg-white/5 text-left flex items-center gap-2" onClick={() => { onCreateTemplate(folder.id, 'select'); closeContextMenu(); }}>
                        <span className="material-symbols-outlined text-sm">list</span> Select List
                    </button>

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
                            key={sub.id}
                            folder={sub}
                            onCreateSubfolder={onCreateSubfolder}
                            onRename={onRename}
                            onDelete={onDelete}
                            onCreateTemplate={onCreateTemplate}
                        />
                    ))}
                    {content.entities.map(ent => (
                        <Link
                            key={ent.id}
                            to={`/project/${projectId}/bible/entity/${ent.id}`}
                            className="flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-medium text-text-muted hover:text-white hover:bg-primary/10 transition-all group"
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
}

export default ArchitectLayout;
