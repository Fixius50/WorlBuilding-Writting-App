import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useParams } from 'react-router-dom';
import GlassPanel from '../common/GlassPanel';
import Avatar from '../common/Avatar';
import api from '../../services/api';

const ArchitectLayout = () => {
    const { id } = useParams();
    const location = useLocation();
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(true);
    const [projectName, setProjectName] = useState('Loading...');
    const [expandedCategories, setExpandedCategories] = useState({
        characters: true,
        locations: false,
        items: false
    });

    const [entities, setEntities] = useState({
        characters: [],
        locations: [],
        items: []
    });

    useEffect(() => {
        if (id) {
            loadProject(id);
        }
    }, [id]);

    const loadProject = async (projectId) => {
        try {
            // Get project details to know its name
            // The existing ProyectoController doesn't have a direct "get by ID" that returns the object easily, 
            // but let's assume one or use the list to find it if needed.
            // Actually ProyectoController.java line 103 has obtenerProyecto(Long id)
            const proj = await api.get(`/proyectos/${projectId}`);
            if (proj) {
                setProjectName(proj.nombreProyecto);
                // Mark as active in session
                await api.get(`/proyectos/abrir/${proj.nombreProyecto}`);

                // Load entities
                loadEntities();
            }
        } catch (err) {
            console.error("Error loading project:", err);
            setProjectName("Unknown Project");
        }
    };

    const loadEntities = async () => {
        try {
            const individuals = await api.get('/bd/entidadindividual');
            const collectives = await api.get('/bd/entidadcolectiva');
            const zones = await api.get('/bd/zona');

            setEntities({
                characters: individuals.map(e => ({ id: e.id, name: e.nombre, type: 'entidadindividual' })),
                locations: zones.map(e => ({ id: e.id, name: e.nombre, type: 'zona' })),
                items: collectives.map(e => ({ id: e.id, name: e.nombre, type: 'entidadcolectiva' }))
            });
        } catch (err) {
            console.error("Error loading entities:", err);
        }
    };

    const toggleCategory = (cat) => {
        setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    const handleNewEntry = async () => {
        const name = prompt("Enter entity name:");
        if (!name) return;
        const typeRaw = prompt("Enter type (characters, locations, items):", "characters");
        const type = typeRaw?.toLowerCase();

        let apiType = '';
        if (type === 'characters') apiType = 'entidadindividual';
        else if (type === 'locations') apiType = 'zona';
        else if (type === 'items') apiType = 'entidadcolectiva';

        if (apiType) {
            try {
                await api.put('/bd/insertar', {
                    tipoEntidad: apiType,
                    nombre: name,
                    descripcion: 'New entry added via Architect.'
                });
                loadEntities();
            } catch (err) {
                alert("Failed to create entity: " + err.message);
            }
        } else {
            alert("Invalid category. Use 'characters', 'locations', or 'items'.");
        }
    };

    const isFocusMode = !leftOpen && !rightOpen;

    return (
        <div className="flex h-screen w-full overflow-hidden bg-background-dark text-slate-300 font-sans selection:bg-primary/30">
            {/* Focus Mode Indicator */}
            {isFocusMode && (
                <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2 animate-in fade-in slide-in-from-top-4 duration-1000">
                    <div className="px-4 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/40">Focus Mode Active</span>
                    </div>
                </div>
            )}

            {/* World Bible Sidebar (Left) */}
            <aside className={`flex-none border-r border-white/5 bg-surface-dark transition-all duration-500 flex flex-col relative z-30 ${leftOpen ? 'w-80' : 'w-0 opacity-0 overflow-hidden'}`}>
                {/* Close toggle inside sidebar */}
                <button
                    onClick={() => setLeftOpen(false)}
                    className="absolute top-6 -right-5 z-40 size-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white shadow-2xl transition-all"
                >
                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>

                <div className="p-8 pt-20 flex flex-col h-full gap-8">
                    <header className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white tracking-tight">World Bible</h2>
                            <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mt-1">Project: {projectName}</p>
                        </div>
                        <button className="text-slate-500 hover:text-white"><span className="material-symbols-outlined">more_vert</span></button>
                    </header>

                    <nav className="flex-1 overflow-y-auto custom-scrollbar -mx-2 px-2 space-y-6">
                        <div className="space-y-1">
                            <SidebarItem icon="auto_stories" label="All Entries" count={12} active />
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 px-3">Library</p>
                            <div className="space-y-1">
                                <SidebarCategory
                                    icon="groups"
                                    label="Characters"
                                    expanded={expandedCategories.characters}
                                    onToggle={() => toggleCategory('characters')}
                                    items={entities.characters}
                                />
                                <SidebarCategory
                                    icon="public"
                                    label="Locations"
                                    expanded={expandedCategories.locations}
                                    onToggle={() => toggleCategory('locations')}
                                    items={entities.locations}
                                />
                                <SidebarCategory
                                    icon="diamond"
                                    label="Items & Artifacts"
                                    expanded={expandedCategories.items}
                                    onToggle={() => toggleCategory('items')}
                                    items={entities.items}
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 px-3">Worldbuilding</p>
                            <nav className="space-y-1">
                                <SidebarItem to="/graph" icon="hub" label="Entity Graph" />
                                <SidebarItem to="/timeline" icon="event_note" label="Timeline" />
                                <SidebarItem to="/map" icon="map" label="Cartography" />
                                <SidebarItem to="/languages" icon="translate" label="Linguistics" />
                            </nav>
                        </div>
                    </nav>

                    <div className="mt-auto pt-4 border-t border-white/5">
                        <button
                            onClick={handleNewEntry}
                            className="w-full py-4 rounded-2xl bg-primary/20 hover:bg-primary/30 text-primary border border-primary/20 font-bold flex items-center justify-center gap-3 transition-all shadow-lg hover:shadow-primary/10 group"
                        >
                            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">add</span>
                            New Entry
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 relative h-full">
                {/* Open Toggles (only visible when sidebars are closed) */}
                {!leftOpen && (
                    <button
                        onClick={() => setLeftOpen(true)}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-40 size-12 rounded-2xl bg-surface-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white shadow-2xl transition-all animate-in fade-in slide-in-from-left-4"
                    >
                        <span className="material-symbols-outlined">dock_to_left</span>
                    </button>
                )}

                {!rightOpen && (
                    <button
                        onClick={() => setRightOpen(true)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-40 size-12 rounded-2xl bg-surface-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white shadow-2xl transition-all animate-in fade-in slide-in-from-right-4"
                    >
                        <span className="material-symbols-outlined">dock_to_right</span>
                    </button>
                )}

                <div className="flex-1 overflow-y-auto no-scrollbar relative flex flex-col pt-16">
                    <Outlet context={{ leftOpen, setLeftOpen, rightOpen, setRightOpen }} />

                    <footer className="mt-auto p-8 flex justify-between items-center opacity-50">
                        <div className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase">
                            <div className="size-2 rounded-full bg-emerald-500"></div>
                            Atlas Realm Server Connected (SQLite DB)
                        </div>
                    </footer>
                </div>
            </div>

            {/* Writing Canvas Sidebar (Right) */}
            <aside className={`flex-none border-l border-white/5 bg-surface-dark transition-all duration-500 flex flex-col relative z-30 ${rightOpen ? 'w-[450px]' : 'w-0 opacity-0 overflow-hidden'}`}>
                {/* Close toggle inside sidebar */}
                <button
                    onClick={() => setRightOpen(false)}
                    className="absolute top-6 -left-5 z-40 size-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white shadow-2xl transition-all"
                >
                    <span className="material-symbols-outlined text-xl">chevron_right</span>
                </button>

                <div className="p-10 pt-20 flex flex-col h-full gap-8">
                    <header className="flex justify-between items-center">
                        <h2 className="text-2xl font-bold text-white tracking-tight">Writing Canvas</h2>
                        <div className="flex gap-2">
                            <button className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"><span className="material-symbols-outlined">search</span></button>
                            <button className="text-slate-500 hover:text-white p-2 hover:bg-white/5 rounded-xl transition-all"><span className="material-symbols-outlined">more_horiz</span></button>
                        </div>
                    </header>

                    <div className="flex-1 flex flex-col items-center justify-center text-center p-8 gap-4 border border-dashed border-white/5 rounded-3xl opacity-20">
                        <div className="size-16 rounded-3xl bg-white/5 flex items-center justify-center mb-2">
                            <span className="material-symbols-outlined text-3xl text-slate-500">lock</span>
                        </div>
                        <h3 className="font-bold text-white uppercase tracking-widest text-[10px]">Vault Secured</h3>
                        <p className="text-[10px] text-slate-500 leading-relaxed max-w-[200px]">Contextual tools for the current view will appear here.</p>
                    </div>
                </div>
            </aside>
        </div>
    );
};

const SidebarCategory = ({ icon, label, expanded, onToggle, items }) => (
    <div className="space-y-1">
        <div
            onClick={onToggle}
            className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all hover:bg-white/5 group ${expanded ? 'text-white' : 'text-slate-400'}`}
        >
            <div className="flex items-center gap-3">
                <span className={`material-symbols-outlined text-lg ${expanded ? 'text-primary' : 'opacity-50'}`}>{icon}</span>
                <span className="text-xs font-bold tracking-wide uppercase">{label}</span>
            </div>
            <span className={`material-symbols-outlined text-sm transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}>expand_more</span>
        </div>

        {expanded && (
            <div className="ml-4 pl-4 border-l border-white/5 space-y-1 animate-in slide-in-from-top-2 duration-300">
                {items.map(item => (
                    <Link
                        key={item.id}
                        to={`/entities/${item.type}/${item.id}`}
                        className="flex items-center gap-3 px-3 py-2 rounded-xl text-[11px] font-medium text-slate-500 hover:text-white hover:bg-primary/10 hover:border-primary/20 border border-transparent transition-all group"
                    >
                        <div className="size-1.5 rounded-full bg-slate-700 group-hover:bg-primary transition-colors"></div>
                        {item.name}
                    </Link>
                ))}
            </div>
        )}
    </div>
);

const SidebarItem = ({ icon, label, count, active, to }) => (
    <Link
        to={to}
        className={`flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all ${active ? 'bg-primary/10 text-white border border-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
        <div className="flex items-center gap-3">
            <span className={`material-symbols-outlined text-lg ${active ? 'text-primary' : ''}`}>{icon}</span>
            <span className="text-xs font-bold tracking-wide uppercase">{label}</span>
        </div>
        {count !== undefined && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${active ? 'bg-primary/20 text-primary' : 'bg-white/5 text-slate-500'}`}>{count}</span>
        )}
    </Link>
);

export default ArchitectLayout;
