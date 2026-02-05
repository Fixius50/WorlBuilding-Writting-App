import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../../js/services/api';
import TemplateManager from '../settings/TemplateManager';
import GlobalNotes from './GlobalNotes';
import ConfirmationModal from '../ConfirmationModal'; // Adjust path based on structure

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
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(false);
    const [loadedProjectName, setLoadedProjectName] = useState('Loading...');
    const [projectId, setProjectId] = useState(null);

    // Right Panel State
    const [rightPanelMode, setRightPanelMode] = useState('NOTES'); // 'NOTES', 'TOOLBOX', 'CUSTOM'
    const [rightPanelTitle, setRightPanelTitle] = useState(''); // Override title
    const [availableTemplates, setAvailableTemplates] = useState([]); // Use for Toolbox
    const [addAttributeHandler, setAddAttributeHandler] = useState(null); // Handler for Toolbox clicks
    const [createTemplateHandler, setCreateTemplateHandler] = useState(null); // Handler for creating templates

    // Map Settings State (Global)
    const [mapSettings, setMapSettings] = useState({
        name: '', description: '', type: 'regional',
        showGrid: true, gridSize: 50,
        width: 800, height: 600,
        bgImage: null
    });
    const [onMapSettingsChange, setOnMapSettingsChange] = useState(null);
    const [activeMapSection, setActiveMapSection] = useState('identity'); // 'identity', 'grid', 'canvas'

    // Notes vs Templates vs Filters (Bible Context)
    const [activeBibleTab, setActiveBibleTab] = useState('notes'); // 'notes', 'templates', 'filters'
    const [folderSearchTerm, setFolderSearchTerm] = useState('');
    const [folderFilterType, setFolderFilterType] = useState('ALL');
    const isBibleContext = location.pathname.includes('/bible');

    // Writing Context Logic
    const isWritingContext = location.pathname.includes('/writing');
    const [activeWritingTab, setActiveWritingTab] = useState('index'); // 'index', 'notes'

    // Edit State
    const [editingTemplate, setEditingTemplate] = useState(null);

    // Entity Builder State
    const [entityTabs, setEntityTabs] = useState([]);
    const [activeEntityTab, setActiveEntityTab] = useState('identity');

    // Confirm Modal State
    const [confirmTemplateDelete, setConfirmTemplateDelete] = useState(null); // ID of template to delete

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
                    <div className="p-3 space-y-1">
                        <NavItem to={baseUrl} icon="home" label={t('nav.dashboard')} collapsed={!leftOpen} end />
                        <NavItem to={`${baseUrl}/bible`} icon="menu_book" label={t('nav.bible')} collapsed={!leftOpen} />
                        <NavItem to={`${baseUrl}/map`} icon="map" label={t('nav.atlas')} collapsed={!leftOpen} />
                        <NavItem to={`${baseUrl}/timeline`} icon="calendar_month" label={t('nav.chronology')} collapsed={!leftOpen} />
                        <NavItem to={`${baseUrl}/languages`} icon="translate" label={t('nav.languages')} collapsed={!leftOpen} />
                        <NavItem to={`${baseUrl}/graph`} icon="hub" label={t('nav.graph')} collapsed={!leftOpen} />
                        <div className="h-px bg-glass-border my-2 mx-2 opacity-50"></div>
                        <NavItem to={`${baseUrl}/writing`} icon="edit_note" label={t('nav.writing')} collapsed={!leftOpen} />
                        {/* Settings removed from project sidebar - now global in the hub */}
                        <div className="h-px bg-glass-border my-2 mx-2 opacity-10"></div>
                        <NavItem to="/" icon="logout" label={t('nav.logout')} collapsed={!leftOpen} />
                    </div>
                </div>

                <footer className="p-4 border-t border-glass-border">
                    <div className={`flex items-center gap-3 ${!leftOpen && 'justify-center'}`}>
                        <div className="size-10 rounded-full border border-glass-border p-1 bg-surface-light relative overflow-hidden">
                            {user?.avatarUrl ? (
                                <img src={user.avatarUrl} alt="Me" className="w-full h-full rounded-full object-cover" />
                            ) : (
                                <div className="w-full h-full rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white font-black text-xs">
                                    {(user?.displayName || username)?.substring(0, 2).toUpperCase() || 'US'}
                                </div>
                            )}
                        </div>
                        {leftOpen && (
                            <div className="overflow-hidden">
                                <h4 className="text-xs font-bold text-white truncate">{user?.displayName || username || 'User'}</h4>
                                <p className="text-[10px] text-text-muted uppercase font-black tracking-tighter">{t('common.architect')}</p>
                            </div>
                        )}
                    </div>
                </footer>
            </aside>

            {/* --- CENTRAL PANEL: CANVAS --- */}
            <main className="flex-1 flex flex-col min-w-0 bg-background-dark relative">
                <div className="h-16 w-full absolute top-0 left-0 bg-gradient-to-b from-background-dark to-transparent pointer-events-none"></div>

                <div className="flex-1 flex overflow-hidden relative">
                    <Outlet context={{
                        // Global Layout
                        setRightPanelMode,
                        setRightOpen,
                        setRightPanelTitle,

                        // Project Info
                        projectName: loadedProjectName,
                        projectId,

                        // Templates & Attributes
                        availableTemplates, setAvailableTemplates,
                        setAddAttributeHandler,
                        setCreateTemplateHandler,

                        // Map Props
                        mapSettings, setMapSettings,
                        setOnMapSettingsChange,

                        // Entity Builder Props
                        entityTabs, setEntityTabs,
                        activeEntityTab, setActiveEntityTab,

                        // Folder Filter Props
                        folderSearchTerm, setFolderSearchTerm,
                        folderFilterType, setFolderFilterType
                    }} />
                </div>
            </main>

            {/* --- RIGHT PANEL: TOOLBOX / NOTES --- */}
            <aside
                className={`
                    flex-none bg-surface-dark border-l border-glass-border transition-all duration-500 relative flex flex-col z-30 shrink-0
                    ${rightOpen ? 'w-80' : 'w-20'}
                `}
            >
                {/* Header */}
                <header className="h-16 flex items-center px-6 border-b border-glass-border justify-between shrink-0">
                    {rightOpen ? (
                        <>
                            {rightPanelMode === 'CUSTOM' && !isWritingContext ? (
                                <h2 className="text-xs font-black uppercase tracking-widest text-primary">
                                    {rightPanelTitle || 'Panel'}
                                </h2>
                            ) : isWritingContext ? (
                                // TABS FOR WRITING MODE
                                <div className="flex bg-white/5 rounded-lg p-1 gap-1 w-full mr-4">
                                    <button
                                        onClick={() => setActiveWritingTab('index')}
                                        className={`flex-1 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${activeWritingTab === 'index' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {t('writing.index')}
                                    </button>
                                    <button
                                        onClick={() => setActiveWritingTab('notes')}
                                        className={`flex-1 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${activeWritingTab === 'notes' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {t('writing.notes')}
                                    </button>
                                </div>
                            ) : isBibleContext && rightPanelMode === 'NOTES' ? (
                                <div className="flex bg-white/5 rounded-lg p-1 gap-1">
                                    <button
                                        onClick={() => setActiveBibleTab('notes')}
                                        className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${activeBibleTab === 'notes' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {t('writing.notes')}
                                    </button>
                                    <button
                                        onClick={() => setActiveBibleTab('templates')}
                                        className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${activeBibleTab === 'templates' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {t('bible.templates')}
                                    </button>
                                    <button
                                        onClick={() => setActiveBibleTab('filters')}
                                        className={`px-3 py-1 rounded-md text-[10px] uppercase font-bold transition-all ${activeBibleTab === 'filters' ? 'bg-primary text-white shadow' : 'text-slate-500 hover:text-white'}`}
                                    >
                                        {t('bible.explore')}
                                    </button>
                                </div>
                            ) : (
                                <h2 className="text-xs font-black uppercase tracking-widest text-white">
                                    {rightPanelTitle || (rightPanelMode === 'NOTES' ? t('settings.notes_global') : t('common.architect'))}
                                </h2>
                            )}

                            <button onClick={() => setRightOpen(false)} className="text-text-muted hover:text-white transition-colors shrink-0">
                                <span className="material-symbols-outlined text-lg">dock_to_right</span>
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setRightOpen(true)} className="w-full h-full flex items-center justify-center text-text-muted hover:text-white transition-colors">
                            <span className="material-symbols-outlined">{rightPanelMode === 'NOTES' || isWritingContext ? 'edit_note' : rightPanelMode === 'MAP' ? 'map' : rightPanelMode === 'CUSTOM' ? 'build' : 'handyman'}</span>
                        </button>
                    )
                    }
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar p-0 relative">
                    {/* PERSISTENT PORTAL TARGET (Moved outside conditional to prevent ref loss) */}
                    <div
                        id="architect-right-panel-portal"
                        className={`
                            ${(isWritingContext || rightPanelMode === 'CUSTOM') && rightOpen ? 'flex flex-col h-full relative' : 'hidden'}
                        `}
                    ></div>

                    {rightOpen ? (
                        isWritingContext ? (
                            // WRITING MODE: NOTES (Index is in portal)
                            <>
                                <div className={`h-full p-4 overflow-hidden ${activeWritingTab === 'notes' ? 'block' : 'hidden'}`}>
                                    <GlobalNotes projectName={projectName} />
                                </div>
                            </>
                        ) : rightPanelMode === 'CUSTOM' ? (
                            // CUSTOM MODE (Content is in portal)
                            <></>
                        ) : rightPanelMode === 'NOTES' ? (
                            activeBibleTab === 'templates' && isBibleContext ? (
                                <div className="h-full overflow-y-auto no-scrollbar">
                                    <TemplateManager compact={true} />
                                </div>
                            ) : activeBibleTab === 'filters' && isBibleContext ? (
                                <div className="h-full p-6 space-y-6 animate-in fade-in slide-in-from-right-4">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Búsqueda</h3>
                                        <div className="bg-black/20 border border-white/10 rounded-xl p-3 flex items-center gap-2 focus-within:border-primary transition-colors">
                                            <span className="material-symbols-outlined text-slate-500">search</span>
                                            <input
                                                value={folderSearchTerm}
                                                onChange={e => setFolderSearchTerm(e.target.value)}
                                                placeholder={t('bible.search_entity')}
                                                className="bg-transparent border-none outline-none text-sm text-white w-full placeholder-slate-600"
                                            />
                                            {folderSearchTerm && (
                                                <button onClick={() => setFolderSearchTerm('')} className="text-slate-500 hover:text-white">
                                                    <span className="material-symbols-outlined text-sm">close</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="h-px bg-glass-border"></div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Filtrar por Tipo</h3>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[
                                                { id: 'ALL', label: t('bible.all'), icon: 'grid_view' },
                                                { id: 'ENTITY', label: t('bible.entities'), icon: 'person' },
                                                { id: 'MAP', label: t('bible.maps'), icon: 'map' },
                                                { id: 'TIMELINE', label: t('bible.timelines'), icon: 'timeline' }
                                            ].map(type => (
                                                <button
                                                    key={type.id}
                                                    onClick={() => setFolderFilterType(type.id)}
                                                    className={`
                                                        p-3 rounded-xl border flex flex-col items-center gap-2 transition-all
                                                        ${folderFilterType === type.id
                                                            ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                            : 'bg-white/5 border-transparent text-slate-500 hover:bg-white/10 hover:text-white'}
                                                    `}
                                                >
                                                    <span className="material-symbols-outlined">{type.icon}</span>
                                                    <span className="text-[10px] font-bold uppercase">{type.label}</span>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="h-full p-4 overflow-hidden">
                                    <GlobalNotes projectName={projectName} />
                                </div>
                            )
                        ) : rightPanelMode === 'MAP' ? (
                            // MAP SETTINGS MODE
                            <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4">
                                {/* Grid Settings */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">Grid System</h3>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={mapSettings.showGrid}
                                                onChange={(e) => {
                                                    const newVal = { ...mapSettings, showGrid: e.target.checked };
                                                    setMapSettings(newVal);
                                                    if (onMapSettingsChange) onMapSettingsChange(newVal);
                                                }}
                                                className="sr-only peer" />
                                            <div className="w-9 h-5 bg-white/10 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary"></div>
                                        </label>
                                    </div>

                                    <div className={`space-y-2 transition-opacity ${mapSettings.showGrid ? 'opacity-100' : 'opacity-30 pointer-events-none'}`}>
                                        <div className="flex justify-between text-xs font-bold text-white">
                                            <span>Size</span>
                                            <span className="font-mono text-primary">{mapSettings.gridSize}px</span>
                                        </div>
                                        <input
                                            type="range"
                                            min="10"
                                            max="200"
                                            step="10"
                                            value={mapSettings.gridSize}
                                            onChange={(e) => {
                                                const newVal = { ...mapSettings, gridSize: parseInt(e.target.value) };
                                                setMapSettings(newVal);
                                                if (onMapSettingsChange) onMapSettingsChange(newVal);
                                            }}
                                            className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" />
                                    </div>
                                </div>

                                <div className="h-px bg-glass-border"></div>

                                {/* Dimensions Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">{t('atlas.canvas_data')}</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-500">{t('atlas.width')}</label>
                                            <input
                                                type="number"
                                                value={mapSettings.width}
                                                onChange={(e) => {
                                                    const newVal = { ...mapSettings, width: parseInt(e.target.value) };
                                                    setMapSettings(newVal);
                                                    if (onMapSettingsChange) onMapSettingsChange(newVal);
                                                }}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-right font-mono text-sm focus:border-primary outline-none" />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-slate-500">{t('atlas.height')}</label>
                                            <input
                                                type="number"
                                                value={mapSettings.height}
                                                onChange={(e) => {
                                                    const newVal = { ...mapSettings, height: parseInt(e.target.value) };
                                                    setMapSettings(newVal);
                                                    if (onMapSettingsChange) onMapSettingsChange(newVal);
                                                }}
                                                className="w-full bg-black/20 border border-white/10 rounded-lg p-2 text-white text-right font-mono text-sm focus:border-primary outline-none" />
                                        </div>
                                    </div>
                                </div>

                                <div className="h-px bg-glass-border"></div>

                                {/* Background Image Settings */}
                                <div className="space-y-4">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-text-muted">{t('atlas.background_image')}</h3>
                                    <div className="space-y-2">
                                        <div className="flex items-center gap-2">
                                            <label className="cursor-pointer bg-white/5 hover:bg-white/10 text-white rounded-lg px-3 py-2 text-xs font-bold transition-colors border border-glass-border flex items-center gap-2 flex-1">
                                                <span className="material-symbols-outlined text-sm">upload</span>
                                                <span>{t('atlas.upload_image')}</span>
                                                <input
                                                    type="file"
                                                    accept="image/*"
                                                    className="hidden"
                                                    onChange={(e) => {
                                                        const file = e.target.files[0];
                                                        if (file) {
                                                            const reader = new FileReader();
                                                            reader.onload = (ev) => {
                                                                const img = new Image();
                                                                img.onload = () => {
                                                                    const newVal = {
                                                                        ...mapSettings,
                                                                        bgImage: ev.target.result,
                                                                        width: img.width,
                                                                        height: img.height
                                                                    };
                                                                    setMapSettings(newVal);
                                                                    if (onMapSettingsChange) onMapSettingsChange(newVal);
                                                                };
                                                                img.src = ev.target.result;
                                                            };
                                                            reader.readAsDataURL(file);
                                                        }
                                                    }}
                                                />
                                            </label>
                                            {mapSettings.bgImage && (
                                                <button
                                                    onClick={() => {
                                                        const newVal = { ...mapSettings, bgImage: null };
                                                        setMapSettings(newVal);
                                                        if (onMapSettingsChange) onMapSettingsChange(newVal);
                                                    }}
                                                    className="p-2 bg-red-500/10 text-red-400 hover:bg-red-500/20 rounded-lg border border-red-500/20"
                                                    title="Remove Image"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            )}
                                        </div>
                                        {mapSettings.bgImage && (
                                            <div className="rounded-lg overflow-hidden border border-glass-border bg-black/20 h-32 relative group">
                                                <img src={mapSettings.bgImage} alt="Background" className="w-full h-full object-cover opacity-70" />
                                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                                    <span className="text-[10px] font-mono bg-black/50 px-2 py-1 rounded text-white backdrop-blur-sm">
                                                        {mapSettings.width} x {mapSettings.height}
                                                    </span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : rightPanelMode === 'ENTITY' ? (
                            // ENTITY BUILDER NAVIGATION (Switch Style)
                            <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4">
                                <div className="p-4 border-b border-glass-border">
                                    <div className="bg-black/40 p-1 rounded-xl flex">
                                        {entityTabs.map(tab => {
                                            const getIcon = (t) => {
                                                switch (t.toLowerCase()) {
                                                    case 'identity': return 'badge';
                                                    case 'narrative': return 'auto_stories';
                                                    case 'attributes': return 'tune';
                                                    case 'notes': return 'edit_note';
                                                    default: return 'circle';
                                                }
                                            }
                                            return (
                                                <button
                                                    key={tab}
                                                    onClick={() => setActiveEntityTab(tab)}
                                                    className={`
                                                        flex-1 py-2 rounded-lg transition-all group relative flex items-center justify-center
                                                        ${activeEntityTab === tab
                                                            ? 'bg-primary text-white shadow-lg'
                                                            : 'text-text-muted hover:text-white hover:bg-white/5'}
                                                    `}
                                                    title={tab}
                                                >
                                                    <span className="material-symbols-outlined text-lg">{getIcon(tab)}</span>
                                                    {/* Tooltip on Hover */}
                                                    <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 bg-black/90 text-white text-[10px] uppercase font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-50">
                                                        {tab}
                                                    </span>
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>
                                {activeEntityTab === 'attributes' && (
                                    <div className="flex-1 overflow-hidden flex flex-col bg-black/20">
                                        <div className="px-6 py-4 text-[10px] font-black uppercase text-slate-500 tracking-widest flex items-center gap-2">
                                            <span className="material-symbols-outlined text-sm">drag_indicator</span> {t('bible.drag_attributes')}
                                        </div>
                                        <div className="flex-1 overflow-y-auto custom-scrollbar px-2">
                                            <TemplateManager compact={true} initialFolderSlug={folderSlug} />
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : rightPanelMode === 'TOOLBOX' ? (
                            // TOOLBOX MODE
                            <div className="p-4 space-y-6">
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2 flex justify-between items-center">
                                        <span>{t('settings.available_templates')}</span>
                                        <button
                                            className="text-primary hover:text-white transition-colors"
                                            title="Crear Nueva Plantilla"
                                            onClick={() => createTemplateHandler && createTemplateHandler()}
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </h3>

                                    {availableTemplates.length === 0 ? (
                                        <div className="p-6 text-center border border-dashed border-glass-border rounded-2xl opacity-30">
                                            <p className="text-[10px] uppercase font-bold">{t('settings.no_templates')}</p>
                                        </div>
                                    ) : (
                                        availableTemplates.map(tpl => (
                                            <button
                                                key={tpl.id}
                                                className="w-full flex items-center gap-3 p-3 rounded-2xl bg-white/5 border border-glass-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group relative"
                                                draggable
                                                onDragStart={(e) => {
                                                    e.dataTransfer.setData('application/reactflow/type', 'attribute');
                                                    e.dataTransfer.setData('templateId', tpl.id);
                                                    e.dataTransfer.effectAllowed = 'move';
                                                }}
                                                onClick={() => addAttributeHandler && addAttributeHandler(tpl.id)}
                                            >
                                                {tpl.global && (
                                                    <span className="absolute top-2 right-2 flex size-2 bg-blue-500 rounded-full shadow-lg shadow-blue-500/50" title="Global"></span>
                                                )}
                                                <div className="size-8 rounded-lg bg-surface-light flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <span className="material-symbols-outlined text-sm">{getIconForType(tpl.tipo)}</span>
                                                </div>
                                                <div className="overflow-hidden">
                                                    <p className="text-xs font-bold text-white truncate">{tpl.nombre}</p>
                                                    <p className="text-[10px] text-text-muted uppercase font-black tracking-tighter">{tpl.tipo}</p>
                                                </div>

                                                {/* Actions */}
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <div
                                                        onClick={(e) => { e.stopPropagation(); setEditingTemplate(tpl); }}
                                                        className="p-1 hover:text-white text-text-muted hover:bg-white/10 rounded cursor-pointer"
                                                        title="Edit"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">edit</span>
                                                    </div>
                                                    <div
                                                        onClick={(e) => handleDeleteTemplate(e, tpl.id)}
                                                        className="p-1 hover:text-red-400 text-text-muted hover:bg-white/10 rounded cursor-pointer"
                                                        title="Delete"
                                                    >
                                                        <span className="material-symbols-outlined text-sm">delete</span>
                                                    </div>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        ) : (
                            // DEFAULT / EMPTY
                            <div className="flex flex-col items-center justify-center h-full text-text-muted opacity-50">
                                <span className="material-symbols-outlined text-4xl mb-2">dashboard</span>
                                <p className="text-xs uppercase font-bold tracking-widest">Select an item</p>
                            </div>
                        )
                    ) : (
                        // COLLAPSED ICONS
                        <div className="flex flex-col items-center gap-4 py-4 w-full">
                            {rightPanelMode === 'NOTES' || isWritingContext ? (
                                <button
                                    onClick={() => setRightOpen(true)}
                                    className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:text-white"
                                    title="Notas Globales"
                                >
                                    <span className="material-symbols-outlined text-lg">edit_note</span>
                                </button>
                            ) : rightPanelMode === 'MAP' ? (
                                <button
                                    onClick={() => setRightOpen(true)}
                                    className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:text-white"
                                    title="Ajustes de Mapa"
                                >
                                    <span className="material-symbols-outlined text-lg">tune</span>
                                </button>
                            ) : rightPanelMode === 'ENTITY' ? (
                                <button
                                    onClick={() => setRightOpen(true)}
                                    className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:text-white"
                                    title="Atributos"
                                >
                                    <span className="material-symbols-outlined text-lg">fact_check</span>
                                </button>
                            ) : rightPanelMode === 'CUSTOM' ? (
                                <button
                                    onClick={() => setRightOpen(true)}
                                    className="size-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary hover:bg-primary/20 transition-all"
                                    title={rightPanelTitle || 'Panel'}
                                >
                                    <span className="material-symbols-outlined text-lg">extension</span>
                                </button>
                            ) : (
                                availableTemplates.slice(0, 5).map(tpl => (
                                    <button
                                        key={tpl.id}
                                        className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted hover:text-white hover:bg-primary/20 transition-all relative"
                                        draggable
                                        onDragStart={(e) => {
                                            e.dataTransfer.setData('application/reactflow/type', 'attribute');
                                            e.dataTransfer.setData('templateId', tpl.id);
                                        }}
                                        title={tpl.nombre}
                                    >
                                        {tpl.global && <span className="absolute top-0 right-0 size-2 bg-blue-500 rounded-full border border-surface-dark"></span>}
                                        <span className="material-symbols-outlined text-lg">{getIconForType(tpl.tipo)}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </aside >
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
                                            <option value="text">Texto Largo</option>
                                            <option value="short_text">Texto Corto</option>
                                            <option value="number">Número</option>
                                            <option value="boolean">Si/No</option>
                                            <option value="date">Fecha</option>
                                            <option value="entity_link">Vínculo Entidad</option>
                                            <option value="image">Imagen URL</option>
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
