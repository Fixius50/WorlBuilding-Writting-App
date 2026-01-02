import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useNavigate, useLocation, NavLink } from 'react-router-dom';
import api from '../../../js/services/api';

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
    const { username, projectName: paramProjectName } = useParams();
    const navigate = useNavigate();
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(false);
    const [loadedProjectName, setLoadedProjectName] = useState('Loading...');
    const [projectId, setProjectId] = useState(null);

    // Right Panel State
    const [rightPanelMode, setRightPanelMode] = useState('NOTES'); // 'NOTES', 'TOOLBOX'
    const [notesContent, setNotesContent] = useState('');
    const [availableTemplates, setAvailableTemplates] = useState([]); // Use for Toolbox
    const [addAttributeHandler, setAddAttributeHandler] = useState(null); // Handler for Toolbox clicks
    const [createTemplateHandler, setCreateTemplateHandler] = useState(null); // Handler for creating templates

    const baseUrl = `/${username}/${paramProjectName}`;

    useEffect(() => {
        const init = async () => {
            if (paramProjectName) {
                await loadProject(paramProjectName);

                // Load Notes from LocalStorage (or Backend in future)
                const savedNotes = localStorage.getItem(`notes_${paramProjectName}`);
                if (savedNotes) setNotesContent(savedNotes);
            }
        };
        init();
    }, [paramProjectName]);

    const loadProject = async (identifier) => {
        try {
            const proj = await api.get(`/proyectos/${identifier}`);
            if (proj) {
                setLoadedProjectName(proj.nombreProyecto);
                setProjectId(proj.id);
            }
        } catch (err) { console.error("Error loading project:", err); }
    };

    const handleNoteChange = (e) => {
        const val = e.target.value;
        setNotesContent(val);
        localStorage.setItem(`notes_${paramProjectName}`, val);
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
                    <div className="p-3 space-y-1">
                        <NavItem to={baseUrl} icon="home" label="Dashboard" collapsed={!leftOpen} end />
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
                <div className="h-16 w-full absolute top-0 left-0 bg-gradient-to-b from-background-dark to-transparent pointer-events-none"></div>

                <div className="flex-1 flex overflow-hidden relative z-0">
                    <Outlet context={{
                        setRightPanelMode, // Require pages to set this
                        availableTemplates, setAvailableTemplates,
                        setAddAttributeHandler,
                        setCreateTemplateHandler,
                        projectName: loadedProjectName,
                        projectId,
                        setRightOpen
                    }} />
                </div>
            </main>

            {/* --- RIGHT PANEL: TOOLBOX / NOTES --- */}
            <aside
                className={`
                    flex-none bg-surface-dark border-l border-glass-border transition-all duration-500 relative flex flex-col z-30
                    ${rightOpen ? 'w-80' : 'w-20'}
                `}
            >
                {/* Header */}
                <header className="h-16 flex items-center px-6 border-b border-glass-border justify-between">
                    {rightOpen ? (
                        <>
                            <h2 className="text-xs font-black uppercase tracking-widest text-white">
                                {rightPanelMode === 'NOTES' ? 'Notas Globales' : 'Constructor'}
                            </h2>
                            <button onClick={() => setRightOpen(false)} className="text-text-muted hover:text-white transition-colors">
                                <span className="material-symbols-outlined text-lg">dock_to_right</span>
                            </button>
                        </>
                    ) : (
                        <button onClick={() => setRightOpen(true)} className="w-full h-full flex items-center justify-center text-text-muted hover:text-white transition-colors">
                            <span className="material-symbols-outlined">
                                {rightPanelMode === 'NOTES' ? 'edit_note' : 'handyman'}
                            </span>
                        </button>
                    )}
                </header>

                <div className="flex-1 overflow-y-auto no-scrollbar p-0">
                    {rightOpen ? (
                        rightPanelMode === 'NOTES' ? (
                            // NOTES MODE
                            <div className="h-full flex flex-col p-4">
                                <textarea
                                    className="flex-1 bg-surface-light/50 border border-glass-border rounded-xl p-4 text-sm text-white/80 resize-none outline-none focus:border-primary/50 transition-colors"
                                    placeholder="Escribe tus propias notas..."
                                    value={notesContent}
                                    onChange={handleNoteChange}
                                ></textarea>
                            </div>
                        ) : (
                            // TOOLBOX MODE
                            <div className="p-4 space-y-6">
                                {/* Basic Modules Section if needed */}

                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-text-muted px-2 flex justify-between items-center">
                                        <span>Plantillas Disponibles</span>
                                        <button
                                            className="text-primary hover:text-white transition-colors"
                                            title="Crear Nueva Plantilla"
                                            onClick={() => {
                                                // We need to access the context handler passed FROM the Outlet Child TO this Layout?
                                                // Wait, Outlet context goes DOWN.
                                                // To pass UP, we need a refined approach.
                                                // Actually, useOutletContext in Child receives what we pass here.
                                                // So we need a state HERE that the child SETS.
                                                // I passed 'setAddAttributeHandler' (state) downward.
                                                // Child calls setAddAttributeHandler(fn).
                                                // So 'addAttributeHandler' is available here.
                                                // I need 'createTemplateHandler' similarly.
                                                // Let's add 'createTemplateHandler' state.
                                                if (createTemplateHandler) createTemplateHandler();
                                            }}
                                        >
                                            <span className="material-symbols-outlined text-sm">add</span>
                                        </button>
                                    </h3>

                                    {availableTemplates.length === 0 ? (
                                        <div className="p-6 text-center border border-dashed border-glass-border rounded-2xl opacity-30">
                                            <p className="text-[10px] uppercase font-bold">Sin Plantillas</p>
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
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>
                        )
                    ) : (
                        // COLLAPSED ICONS
                        <div className="flex flex-col items-center gap-4 py-4">
                            {rightPanelMode === 'NOTES' ? (
                                <button className="size-10 rounded-xl bg-white/5 flex items-center justify-center text-text-muted" title="Notes">
                                    <span className="material-symbols-outlined text-lg">edit_note</span>
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
                                    >
                                        {tpl.global && <span className="absolute top-0 right-0 size-2 bg-blue-500 rounded-full border border-surface-dark"></span>}
                                        <span className="material-symbols-outlined text-lg">{getIconForType(tpl.tipo)}</span>
                                    </button>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </aside>
        </div>
    );
};

export default ArchitectLayout;
