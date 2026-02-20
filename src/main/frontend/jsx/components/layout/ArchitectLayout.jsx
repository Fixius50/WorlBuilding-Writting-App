import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation, NavLink, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../../js/services/api';
import TemplateManager from '../settings/TemplateManager';
import GlobalRightPanel from './GlobalRightPanel';
import ConfirmationModal from '../ConfirmationModal';
import GeneralGraphView from '../../pages/Graph/GeneralGraphView';

const NavItem = ({ to, icon, label, collapsed, end }) => (
    <NavLink
        to={to}
        end={end}
        className={({ isActive }) => `
            flex items-center gap-3 px-3 py-2 border-l-[3px] transition-all duration-200 group
            ${isActive
                ? 'border-[#007acc] text-white bg-[#2b2b2b]'
                : 'border-transparent text-slate-400 hover:text-primary hover:bg-primary/5'}
            ${collapsed ? 'justify-center px-0' : ''}
        `}
        title={collapsed ? label : ''}
    >
        <span className="material-symbols-outlined text-[19px] transition-transform group-hover:scale-110">{icon}</span>
        {!collapsed && <span className="text-[12.5px] font-sans tracking-wide font-medium">{label}</span>}
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

const ArchitectLayout = () => {
    console.log("ArchitectLayout Mounting");
    const { username, projectName, folderSlug } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const location = useLocation(); // Hook location
    const [searchParams] = useSearchParams();
    const hideSidebarParam = searchParams.get('hideSidebar') === 'true';

    // Layout State
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(false);
    const [loadedProjectName, setLoadedProjectName] = useState('Loading...');
    const [projectId, setProjectId] = useState(null);


    // Right Panel Context Content (Injected by pages)
    const [globalPanelContent, setGlobalPanelContent] = useState(null);
    const [rightPanelTab, setRightPanelTab] = useState('NOTEBOOKS');
    const [rightPanelTitle, setRightPanelTitle] = useState(null);
    const [rightPanelMode, setRightPanelMode] = useState('overlay'); // 'overlay' | 'push'

    // --- BOTTOM DRAWER STATE (GRAPH) ---
    const [bottomDrawerOpen, setBottomDrawerOpen] = useState(false);  // Map Settings State (Global) - KEEPING FOR BACKWARDS COMPATIBILITY IF NEEDED
    const [mapSettings, setMapSettings] = useState({
        name: '', description: '', type: 'regional',
        showGrid: true, gridSize: 50,
        width: 800, height: 600,
        bgImage: null
    });
    const [onMapSettingsChange, setOnMapSettingsChange] = useState(null);

    // Helper to allow pages to set the panel content
    const setRightPanelContent = (content) => {
        setGlobalPanelContent(content);
        if (content) setRightOpen(true); // Auto-open if content is pushed
    };

    const [activeMapSection, setActiveMapSection] = useState('identity'); // 'identity', 'grid', 'canvas'

    // Notes vs Templates vs Filters (Bible Context)
    const [activeBibleTab, setActiveBibleTab] = useState('notes'); // 'notes', 'templates', 'filters'
    const [folderSearchTerm, setFolderSearchTerm] = useState('');
    const [folderFilterType, setFolderFilterType] = useState('ALL');
    const isBibleContext = location.pathname.includes('/bible');

    // GLOBAL Bible Explorer State - now loaded here instead of WorldBibleLayout
    const [folders, setFolders] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterType, setFilterType] = useState('ALL');
    const [bibleExplorerState, setBibleExplorerState] = useState(null); // Kept for compatibility

    // Writing Context Logic
    const isWritingContext = location.pathname.includes('/writing');
    const [activeWritingTab, setActiveWritingTab] = useState('index'); // 'index', 'notes'

    // Linguistics Context Logic
    const isLinguisticsContext = location.pathname.includes('/languages');

    // Edit State
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Entity Builder State
    const [entityTabs, setEntityTabs] = useState([]);
    const [activeEntityTab, setActiveEntityTab] = useState('identity');

    // Confirm Modal State
    const [confirmTemplateDelete, setConfirmTemplateDelete] = useState(null); // ID of template to delete

    // GLOBAL Explorer Modal States
    const [creationModalOpen, setCreationModalOpen] = useState(false);
    const [targetParent, setTargetParent] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [deletionTarget, setDeletionTarget] = useState(null); // { id, parentId, type, folderId }

    const handleDeleteTemplate = (e, id) => {
        e.stopPropagation();
        setConfirmTemplateDelete(id);
    };

    const confirmDeleteAction = async () => {
        if (!confirmTemplateDelete) return;
        try {
            await api.delete(`/world-bible/templates/${confirmTemplateDelete}`);
            setAvailableTemplates(prev => prev.filter(t => t.id !== confirmTemplateDelete));
        } catch (err) { console.error("Delete failed", err); }
        setConfirmTemplateDelete(null);
    };

    const handleUpdateTemplate = async (e) => {
        e.preventDefault();
        try {
            await api.put(`/world-bible/templates/${editingTemplate.id}`, editingTemplate);
            setAvailableTemplates(prev => prev.map(t => t.id === editingTemplate.id ? editingTemplate : t));
            setEditingTemplate(null);
        } catch (err) { console.error("Update failed", err); }
    };

    const baseUrl = `/${username}/${projectName}`;

    // If we are in "hideSidebar" mode (iframe), we might want a minimal version
    // to avoid infinite recursion and save resources.
    if (hideSidebarParam) {
        return (
            <div className="h-screen w-screen bg-[#0a0a0a]">
                <Outlet context={{
                    setRightPanelTab, setRightOpen, setRightPanelContent,
                    projectId, baseUrl
                }} />
            </div>
        );
    }

    // Load folders globally (for explorer)
    useEffect(() => {
        if (projectName) {
            loadFolders();
        }
    }, [projectName]);

    const loadFolders = async () => {
        try {
            const rootFolders = await api.get('/world-bible/folders');
            setFolders(rootFolders);
        } catch (err) {
            console.error("Error loading folders:", err);
        }
    };

    useEffect(() => {
        if (projectName) {
            loadProject(projectName);
        }

        const handleFocus = () => {
            if (projectName) loadProject(projectName);
        };
        window.addEventListener('focus', handleFocus);
        return () => window.removeEventListener('focus', handleFocus);
    }, [projectName]);

    // Auto-collapse logic removed based on user feedback (Bug: Sidebar compacting when not desired)
    // useEffect(() => {
    //     if (isBibleContext) {
    //         setLeftOpen(false);
    //     }
    // }, [isBibleContext]);

    // Clear global panel content when route changes to prevent timeline/content persistence
    useEffect(() => {
        console.log('[ArchitectLayout] Route changed, clearing panel content');
        setGlobalPanelContent(null);
        setRightPanelTab('CONTEXT'); // Always reset to CONTEXT on route change
    }, [location.pathname]);

    // Clear bible explorer state when leaving bible route to prevent stale handlers
    // NOTE: This is now less critical since folders are loaded globally
    useEffect(() => {
        if (!isBibleContext) {
            setBibleExplorerState(null);
        }
    }, [isBibleContext]);

    const toggleRightPanel = () => setRightOpen(prev => !prev);

    // ========== GLOBAL EXPLORER CRUD HANDLERS ==========
    const handleCreateSimpleFolder = async (parentFolder = null, type = 'FOLDER') => {
        try {
            const parentId = parentFolder ? (typeof parentFolder === 'object' ? parentFolder.id : parentFolder) : null;
            const newFolder = await api.post('/world-bible/folders', {
                nombre: type === 'TIMELINE' ? 'Nueva Timeline' : 'Nueva Carpeta',
                padreId: parentId,
                tipo: type
            });

            if (parentId === null) {
                // RELOAD folders to ensure data integrity
                await loadFolders();
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

    const handleDeleteEntity = (entityId, folderId) => {
        setDeletionTarget({ id: entityId, folderId, type: 'entity' });
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

    const handleCreateEntity = async (folderId, specialType = 'entidadindividual') => {
        const targetSlug = typeof folderId === 'object' ? (folderId.slug || folderId.id) : folderId;
        navigate(`${baseUrl}/bible/folder/${targetSlug}/entity/new/${specialType}`);
    };

    const handleConfirmCreate = async (tempId, name, type, parentId, specialType) => {
        try {
            if (type === 'folder') {
                if (typeof tempId === 'number' && !tempId.toString().startsWith('temp')) {
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
                }
            } else if (type === 'entity') {
                if (typeof tempId === 'string' && tempId.startsWith('new-')) {
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
                }
            }
        } catch (err) {
            console.error("Confirm create failed:", err);
        }
    };
    // ========== END GLOBAL EXPLORER CRUD HANDLERS ==========

    const loadProject = async (identifier) => {
        try {
            const proj = await api.get(`/proyectos/${identifier}`);
            if (proj) {
                setLoadedProjectName(proj.nombreProyecto);
                setProjectId(proj.id);
            }
        } catch (err) {
            console.error("Error loading project:", err);
            // If project not found or unauthorized, redirect to selector
            setLoadedProjectName('Error');
            navigate('/');
        }
    };

    const [user, setUser] = useState(null);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser && storedUser !== "undefined") {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    return (
        <div className="flex flex-col h-screen w-full overflow-hidden bg-[#1e1e1e] text-slate-300 font-sans selection:bg-primary/30">
            <div className="flex flex-1 overflow-hidden">
                {/* --- LEFT PANEL: NAVIGATION & EXPLORER (FIXED) --- */}
                {!hideSidebarParam && (
                    <aside
                        className={`
                        fixed top-0 left-0 h-full bg-surface-dark border-r border-glass-border shadow-2xl z-40 transition-all duration-500 ease-in-out flex flex-col
                        ${leftOpen ? 'w-64 translate-x-0' : 'w-64 -translate-x-full'}
                    `}
                    >
                        <div className="w-full h-full flex flex-col overflow-hidden">
                            {/* Header / Brand */}
                            <div className="h-16 flex items-center justify-center border-b border-glass-border relative bg-white/[0.02]">
                                <div className="flex items-center gap-2">
                                    <div className="size-8 rounded-lg bg-surface-light flex items-center justify-center text-primary shadow-inner">
                                        <span className="material-symbols-outlined">
                                            {location.pathname.includes('/writing') ? 'edit_note' :
                                                location.pathname.includes('/graph') ? 'hub' :
                                                    location.pathname.includes('/bible') ? 'auto_stories' :
                                                        location.pathname.includes('/map') ? 'map' :
                                                            location.pathname.includes('/timeline') ? 'timeline' :
                                                                location.pathname.includes('/languages') ? 'translate' :
                                                                    'auto_stories'}
                                        </span>
                                    </div>
                                    <h2 className="text-sm font-black uppercase tracking-widest text-white truncate max-w-[150px]">{loadedProjectName}</h2>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col">
                                <div className="p-3 space-y-1">
                                    <NavItem to={baseUrl} icon="home" label={t('nav.dashboard')} collapsed={false} end />
                                    <NavItem to={`${baseUrl}/bible`} icon="menu_book" label={t('nav.bible')} collapsed={false} />
                                    <NavItem to={`${baseUrl}/map`} icon="map" label={t('nav.atlas')} collapsed={false} />
                                    <NavItem to={`${baseUrl}/timeline`} icon="calendar_month" label={t('nav.chronology')} collapsed={false} />
                                    <NavItem to={`${baseUrl}/languages`} icon="translate" label={t('nav.languages')} collapsed={false} />
                                    <div className="h-px bg-glass-border my-2 mx-2 opacity-50"></div>
                                    <NavItem to={`${baseUrl}/writing`} icon="edit_note" label={t('nav.writing')} collapsed={false} />
                                    <div className="h-px bg-glass-border my-2 mx-2 opacity-10"></div>
                                    <NavItem to="/" icon="logout" label={t('nav.logout')} collapsed={false} />
                                </div>
                            </div>
                        </div>

                        {/* --- TAB TOGGLE BUTTON LEFT (IDÉNTICO AL DERECHO) --- */}
                        <button
                            onClick={() => setLeftOpen(!leftOpen)}
                            className={`
                            absolute top-1/2 -translate-y-1/2 -right-10 w-10 h-24 
                            bg-surface-dark border border-glass-border border-l-0
                            rounded-r-2xl flex flex-col items-center justify-center gap-1
                            transition-all duration-300 group
                            hover:bg-primary/10 hover:border-primary/30
                            ${leftOpen ? 'text-primary shadow-[4px_0_15px_-5px_rgba(var(--primary-rgb),0.3)]' : 'text-slate-500'}
                        `}
                            title={leftOpen ? "Cerrar Panel" : "Abrir Panel"}
                        >
                            <div className={`w-1 h-3 rounded-full bg-current opacity-20 transition-all duration-500 ${leftOpen ? 'h-6 opacity-40' : ''}`}></div>
                            <span className={`material-symbols-outlined text-lg transition-transform duration-500 ${!leftOpen ? 'rotate-180' : ''}`}>
                                side_navigation
                            </span>
                            <div className={`w-1 h-3 rounded-full bg-current opacity-20 transition-all duration-500 ${leftOpen ? 'h-6 opacity-40' : ''}`}></div>

                            <div className={`absolute inset-0 rounded-r-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                        </button>
                    </aside>
                )}

                {/* --- CENTRAL PANEL: CANVAS --- */}
                <main className="flex-1 flex flex-col min-w-0 bg-[#1e1e1e] relative">

                    <div className="flex-1 flex flex-col min-w-0 bg-background-dark relative overflow-hidden">
                        <Outlet context={{
                            // New Global Panel Context
                            setRightPanelContent,
                            setRightOpen,
                            toggleRightPanel,
                            rightPanelTab,
                            setRightPanelTab,
                            setRightPanelTitle,
                            setRightPanelMode,

                            // Search & Filter Context (Bible)
                            folderSearchTerm,
                            setFolderSearchTerm,
                            folderFilterType,
                            setFolderFilterType,

                            // Bible Explorer State Callback
                            setBibleExplorerState,

                            // Legacy Context (Keep only what's needed for other pages to not crash)
                            projectId,
                            mapSettings, setMapSettings,
                            onMapSettingsChange, setOnMapSettingsChange,

                            // Pass other necessary handlers
                        }}
                        />
                    </div>

                    {/* --- RIGHT PANEL (GLOBAL) --- */}
                    <GlobalRightPanel
                        isOpen={rightOpen}
                        onClose={() => setRightOpen(false)}
                        onToggle={toggleRightPanel} // Pass toggle function
                        contextContent={globalPanelContent}
                        projectId={projectId}
                        activeTab={rightPanelTab}
                        setActiveTab={setRightPanelTab}
                        title={rightPanelTitle}
                        onClearContext={() => setGlobalPanelContent(null)} // Clear timeline/context
                        // Bible Explorer Props - NOW FULLY GLOBAL
                        folders={folders}
                        searchTerm={searchTerm}
                        setSearchTerm={setSearchTerm}
                        filterType={filterType}
                        setFilterType={setFilterType}
                        // GLOBAL Handlers - work on ALL pages
                        handleCreateSimpleFolder={handleCreateSimpleFolder}
                        handleRenameFolder={handleRenameFolder}
                        handleDeleteFolder={handleDeleteFolder}
                        handleMoveEntity={handleMoveEntity}
                        handleDuplicateEntity={handleDuplicateEntity}
                        handleCreateEntity={handleCreateEntity}
                        handleConfirmCreate={handleConfirmCreate}
                    />
                </main>
            </div>

            {/* --- BOTTOM DRAWER (GLOBAL GRAPH) --- */}
            <div className={`
                fixed bottom-0 left-0 w-full bg-[#141414] border-t border-[#2d2d2d] z-50
                transition-transform duration-500 ease-in-out flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.5)]
                ${bottomDrawerOpen ? 'h-[60vh] translate-y-0' : 'h-[60vh] translate-y-full'}
            `}>
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 h-10 px-4 bg-[#141414] border border-b-0 border-[#2d2d2d] rounded-t-2xl flex items-center justify-center cursor-pointer hover:bg-[#1e1e1e] transition-colors group shadow-[0_-5px_15px_rgba(0,0,0,0.2)]"
                    onClick={() => setBottomDrawerOpen(!bottomDrawerOpen)}>
                    <div className="flex items-center gap-2 text-slate-400 group-hover:text-primary transition-colors">
                        <span className="material-symbols-outlined text-sm">{bottomDrawerOpen ? 'keyboard_arrow_down' : 'hub'}</span>
                        <span className="text-xs font-black tracking-widest uppercase">{bottomDrawerOpen ? 'Cerrar Grafo' : 'Grafo Global'}</span>
                    </div>
                </div>
                <div
                    className={`flex-1 w-full h-full p-2 relative bg-black/40 transition-opacity duration-300 ${!bottomDrawerOpen ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
                    style={{ visibility: bottomDrawerOpen ? 'visible' : 'hidden' }}
                >
                    <div className="w-full h-full border border-glass-border rounded-xl overflow-hidden bg-[#0a0a0a]">
                        <iframe
                            src={`${baseUrl}/graph?hideSidebar=true`}
                            className="w-full h-full border-none"
                            title="Global Graph"
                            loading="eager"
                        />
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {
                editingTemplate && (
                    <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-surface-dark border border-glass-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
                            <h3 className="text-xl font-black text-white mb-4">{t('settings.edit_template')}</h3>
                            <form onSubmit={handleUpdateTemplate} className="space-y-4">
                                <div>
                                    <label className="text-xs uppercase font-bold text-text-muted block mb-1">{t('settings.name')}</label>
                                    <input
                                        autoFocus
                                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                                        value={editingTemplate.nombre}
                                        onChange={e => setEditingTemplate({ ...editingTemplate, nombre: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs uppercase font-bold text-text-muted block mb-1">{t('settings.type')}</label>
                                        <select
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                                            value={editingTemplate.tipo}
                                            onChange={e => setEditingTemplate({ ...editingTemplate, tipo: e.target.value })}
                                        >
                                            <option className="bg-[#1a1a20] text-white" value="text">Texto Largo</option>
                                            <option className="bg-[#1a1a20] text-white" value="short_text">Texto Corto</option>
                                            <option className="bg-[#1a1a20] text-white" value="number">Número</option>
                                            <option className="bg-[#1a1a20] text-white" value="boolean">Si/No</option>
                                            <option className="bg-[#1a1a20] text-white" value="date">Fecha</option>
                                            <option className="bg-[#1a1a20] text-white" value="entity_link">Vínculo Entidad</option>
                                            <option className="bg-[#1a1a20] text-white" value="image">Imagen URL</option>
                                        </select>
                                    </div>
                                    <div className="flex items-center">
                                        <label className="flex items-center gap-2 cursor-pointer p-3 bg-white/5 rounded-xl w-full hover:bg-white/10 transition-colors">
                                            <input
                                                type="checkbox"
                                                checked={editingTemplate.global}
                                                onChange={e => setEditingTemplate({ ...editingTemplate, global: e.target.checked })}
                                                className="accent-primary size-4"
                                            />
                                            <span className="text-sm font-bold text-white">{t('settings.is_global')}</span>
                                        </label>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 pt-4">
                                    <button type="button" onClick={() => setEditingTemplate(null)} className="px-4 py-2 text-text-muted hover:text-white font-bold transition-colors">{t('common.cancel')}</button>
                                    <button type="submit" className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">{t('common.save')}</button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!confirmTemplateDelete}
                onClose={() => setConfirmTemplateDelete(null)}
                onConfirm={confirmDeleteAction}
                title={t('settings.delete_template')}
                message={t('common.are_you_sure')}
                confirmText={t('common.confirm_delete')}
                type="danger"
            />
        </div>
    );
};

export default ArchitectLayout;
