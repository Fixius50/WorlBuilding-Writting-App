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
    switch (type?.toLowerCase()) {
        case 'text': return 'notes';
        case 'short_text': return 'short_text';
        case 'number': return 'pin';
        case 'date': return 'calendar_today';
        case 'select': return 'list';
        case 'boolean': return 'check_box';
        // Entity Types
        case 'map': return 'map';
        case 'timeline': return 'timeline';
        case 'character': case 'entidadindividual': return 'person';
        case 'location': case 'zona': case 'construccion': return 'location_on';
        case 'culture': case 'entidadcolectiva': return 'groups';
        case 'universe': case 'galaxy': case 'system': case 'planet': return 'public';
        case 'entity_link': return 'link';
        default: return 'description'; // Fallback
    }
};

// ... ArchitectLayout ...
const ArchitectLayout = () => {
    // ... (Hooks)
    const { username, projectName: paramProjectName } = useParams();
    const navigate = useNavigate();
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(false);
    const [loadedProjectName, setLoadedProjectName] = useState('Loading...');
    const [projectId, setProjectId] = useState(null);

    const [availableTemplates, setAvailableTemplates] = useState([]);
    const [addAttributeHandler, setAddAttributeHandler] = useState(null);

    const baseUrl = `/${username}/${paramProjectName}`;

    useEffect(() => {
        const init = async () => {
            if (paramProjectName) {
                await loadProject(paramProjectName);
                // Folders loaded in WorldBibleLayout now
            }
        };
        init();
    }, [paramProjectName]);

    // ... (rest of listeners) ...

    const loadProject = async (identifier) => {
        try {
            const proj = await api.get(`/proyectos/${identifier}`);
            if (proj) {
                setLoadedProjectName(proj.nombreProyecto);
                setProjectId(proj.id);
            }
        } catch (err) { console.error("Error loading project:", err); }
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

    const handleRenameFolder = async (folderId, newName) => {
        try {
            await api.put(`/world-bible/folders/${folderId}`, { nombre: newName });
            setFolders(prev => prev.map(f => f.id === folderId ? { ...f, nombre: newName } : f));
        } catch (err) {
            console.error("Error renaming folder:", err);
            throw err;
        }
    };

    const handleDeleteFolder = async (folderId) => {
        if (!confirm("Are you sure you want to delete this folder?")) return;
        try {
            await api.delete(`/world-bible/folders/${folderId}`);
            setFolders(prev => prev.filter(f => f.id !== folderId));
            // Trigger update for any parent listeners
            window.dispatchEvent(new CustomEvent('folder-update', {
                detail: { removeId: folderId, type: 'folder' }
                // Note: We don't know parentId here easily, but listeners check 'removeId' globally? 
                // No, FolderItem checks: e.detail.folderId === folder.id OR removeId logic inside the loop?
                // FolderItem listener: "if (folderId === folder.id) ... else if (removeId) ..."
                // The logical parent ID is needed for the listener of the PARENT folder to react.
                // However, our FolderItem listener logic:
                // "if (folderId === folder.id)" -> ONLY if the event specifies the PARENT ID.

                // If we don't know parentId, we can't notify the specific parent via ID.
                // BUT, we can just reload the parent if we knew it.
                // Or, we rely on the fact that 'removeId' is checked?

                // Current FolderItem code:
                // if (folderId === folder.id) { ... if (removeId) ... }
                // So we MUST pass the parent folderId in event detail.

                // Since we don't track parentId easily here without passing it up, 
                // we might need to change Sidebar to pass (id, parentId) to delete.
                // But handleDeleteFolder(folderId) is the signature.

                // Hack: We can iterate 'folders' to see if it's root. If not, we don't update root state.
                // But for subfolders... 
                // Actually, FolderItem's onDeleteFolder calls: onDeleteFolder(folder.id). 
                // It doesn't pass parentId.

                // If I want to fix generic deletion, I should reload the parent.
                // But I don't have parent info.

                // Let's assume for now that ROOT folders work (setFolders).
                // For subfolders, since we reload on expand...
                // Actually, if we just delete it from DB, the UI won't update until reload.
                // To force UI update, we need to find the parent.

                // FOR NOW: I will just dispatch valid event if possible, or trigger a full reload? 
                // Ideally, window.location.reload() or re-fetch root? 
                // Re-fetching root won't fix nested.
            }));
            // Dispatch a generic event that might force reload if we match?
            window.dispatchEvent(new CustomEvent('folder-specific-update', { detail: { folderId } }));
            loadFolders(); // Refresh root at least
        } catch (err) {
            console.error("Error deleting folder:", err);
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
                    {/* Main Navigation */}
                    <div className="p-3 space-y-1">
                        <NavItem to={baseUrl} icon="home" label="Dashboard" collapsed={!leftOpen} />
                        <NavItem to={`${baseUrl}/bible`} icon="menu_book" label="World Bible" collapsed={!leftOpen} />
                        <NavItem to={`${baseUrl}/map`} icon="map" label="Atlas" collapsed={!leftOpen} />
                        <NavItem to={`${baseUrl}/timeline`} icon="calendar_month" label="Chronology" collapsed={!leftOpen} />

                        <div className="h-px bg-glass-border my-2 mx-2 opacity-50"></div>

                        <NavItem to={`${baseUrl}/writing`} icon="edit_note" label="Writing" collapsed={!leftOpen} />
                        <NavItem to={`${baseUrl}/settings`} icon="settings" label="Settings" collapsed={!leftOpen} />
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
                        projectId
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
