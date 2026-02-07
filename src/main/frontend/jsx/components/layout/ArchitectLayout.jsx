import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation, NavLink } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../../js/services/api';
import TemplateManager from '../settings/TemplateManager';
import GlobalRightPanel from './GlobalRightPanel';
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

    // Layout State
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(false);
    const [loadedProjectName, setLoadedProjectName] = useState('Loading...');
    const [projectId, setProjectId] = useState(null);

    // Right Panel Context Content (Injected by pages)
    const [globalPanelContent, setGlobalPanelContent] = useState(null);
    const [rightPanelTab, setRightPanelTab] = useState('NOTEBOOKS');
    const [rightPanelTitle, setRightPanelTitle] = useState(null);
    const [rightPanelMode, setRightPanelMode] = useState('DEFAULT');

    // Map Settings State (Global) - KEEPING FOR BACKWARDS COMPATIBILITY IF NEEDED
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

    const toggleRightPanel = () => setRightOpen(prev => !prev);

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
                />
            </main>

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
