import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import GlassPanel from '../common/GlassPanel';
import Avatar from '../common/Avatar';
import api from '../../../js/services/api';

const ArchitectLayout = () => {
    const { id } = useParams();
    const location = useLocation();
    const [leftOpen, setLeftOpen] = useState(true);
    const [rightOpen, setRightOpen] = useState(true);
    const [projectName, setProjectName] = useState('Loading...');
    const [expandedCategories, setExpandedCategories] = useState({
        characters: true,
        locations: false,
        items: false,
        constructions: false,
        effects: false,
        interactions: false
    });

    const [entities, setEntities] = useState({
        characters: [],
        locations: [],
        items: [],
        constructions: [],
        effects: [],
        interactions: []
    });

    useEffect(() => {
        if (id) {
            loadProject(id);
        }
    }, [id]);

    const loadProject = async (projectId) => {
        try {
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
            const [individuals, collectives, zones, constructions, effects, interactions] = await Promise.all([
                api.get('/bd/entidadindividual'),
                api.get('/bd/entidadcolectiva'),
                api.get('/bd/zona'),
                api.get('/bd/construccion'),
                api.get('/bd/efectos'),
                api.get('/bd/interaccion')
            ]);

            setEntities({
                characters: individuals.map(e => ({ id: e.id, name: e.nombre, type: 'entidadindividual' })),
                locations: zones.map(e => ({ id: e.id, name: e.nombre, type: 'zona' })),
                items: collectives.map(e => ({ id: e.id, name: e.nombre, type: 'entidadcolectiva' })),
                constructions: constructions.map(e => ({ id: e.id, name: e.nombre, type: 'construccion' })),
                effects: effects.map(e => ({ id: e.id, name: e.nombre, type: 'efectos' })),
                interactions: interactions.map(e => ({ id: e.id, name: e.nombre, type: 'interaccion' }))
            });
        } catch (err) {
            console.error("Error loading entities:", err);
        }
    };

    const toggleCategory = (cat) => {
        setExpandedCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
    };

    // Old handleNewEntry prompt logic removed in favor of NewEntityModal

    const [isCreating, setIsCreating] = useState(false);

    // ... (existing code for focus mode)
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
                    className="absolute top-1/2 -translate-y-1/2 -right-5 z-40 size-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white shadow-2xl transition-all"
                >
                    <span className="material-symbols-outlined text-xl">chevron_left</span>
                </button>

                <div className="flex flex-col h-full">
                    {/* Header - Moved to top and compacted */}
                    <header className="p-6 pb-2 border-b border-white/5 bg-surface-dark z-10">
                        <div className="flex justify-between items-start">
                            <div>
                                <h6 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-500 mb-1">Project Atlas</h6>
                                <h2 className="text-lg font-bold text-white tracking-tight leading-none truncate max-w-[200px]" title={projectName}>{projectName}</h2>
                            </div>
                            <button className="text-slate-500 hover:text-white"><span className="material-symbols-outlined text-lg">more_vert</span></button>
                        </div>
                    </header>

                    <nav className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                        <div className="space-y-1">
                            <SidebarItem icon="auto_stories" label="All Entries" count={12} active />
                        </div>

                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 px-3">Worldbuilding</p>
                            <nav className="space-y-1">
                                <SidebarItem to={`/project/${id}/graph`} icon="hub" label="Entity Graph" />
                                <SidebarItem to={`/project/${id}/timeline`} icon="event_note" label="Timeline" />
                                <SidebarItem to={`/project/${id}/map`} icon="map" label="Cartography" />
                                <SidebarItem to={`/project/${id}/languages`} icon="translate" label="Linguistics" />
                            </nav>
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
                                <SidebarCategory
                                    icon="apartment"
                                    label="Constructions"
                                    expanded={expandedCategories.constructions}
                                    onToggle={() => toggleCategory('constructions')}
                                    items={entities.constructions}
                                />
                                <SidebarCategory
                                    icon="auto_fix"
                                    label="Effects"
                                    expanded={expandedCategories.effects}
                                    onToggle={() => toggleCategory('effects')}
                                    items={entities.effects}
                                />
                                <SidebarCategory
                                    icon="compare_arrows"
                                    label="Interactions"
                                    expanded={expandedCategories.interactions}
                                    onToggle={() => toggleCategory('interactions')}
                                    items={entities.interactions}
                                />
                            </div>
                        </div>
                    </nav>

                    <div className="p-6 pt-0 mt-auto bg-gradient-to-t from-surface-dark to-transparent">
                        <button
                            onClick={() => setIsCreating(true)}
                            className="w-full py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-primary/20 hover:shadow-primary/40 group"
                        >
                            <span className="material-symbols-outlined text-xl group-hover:rotate-90 transition-transform duration-300">add</span>
                            <span className="text-sm tracking-wide">New Entry</span>
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
                    className="absolute top-1/2 -translate-y-1/2 -left-5 z-40 size-10 rounded-full bg-surface-dark border border-white/10 flex items-center justify-center text-slate-400 hover:text-white shadow-2xl transition-all"
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

            {/* Create Entity Modal */}
            {isCreating && (
                <NewEntityModal
                    onClose={() => setIsCreating(false)}
                    onSuccess={() => {
                        setIsCreating(false);
                        loadEntities();
                    }}
                    projectId={id} // Pass current project ID for navigation
                />
            )}
        </div>
    );
};

// --- Subcomponents ---

const NewEntityModal = ({ onClose, onSuccess, projectId }) => {
    const navigate = useNavigate();
    const [name, setName] = useState('');
    const [type, setType] = useState('entidadindividual');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name) return;
        setLoading(true);

        try {
            const res = await api.put('/bd/insertar', {
                tipoEntidad: type,
                nombre: name,
                descripcion: 'Created via Architect Interface'
            });

            // Navigate to the new entity view
            // res.entidad should have the ID
            if (res.entidad && res.entidad.id) {
                // Determine URL part based on type
                // Mapping: entidadindividual -> entities/character/:id
                // We need to match what the Router expects or what the Sidebar links use.
                // Sidebar uses: /project/:id/entities/:type/:id
                // But confusingly, Sidebar maps types like 'entidadindividual' directly to URL.
                // EntityRouter expects: character, location, etc OR entidadindividual, zona etc.
                // Let's use the raw type for simplicity as the Router supports it
                navigate(`/project/${projectId}/entities/${type}/${res.entidad.id}`);
            }

            onSuccess();
        } catch (err) {
            alert("Creation failed: " + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <GlassPanel className="w-full max-w-md p-8 border-white/10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-purple-500"></div>

                <h2 className="text-2xl font-bold text-white mb-2">Forging New Entity</h2>
                <p className="text-sm text-slate-400 mb-6">Define the essence of a new creation for your world.</p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Entity Name</label>
                        <input
                            autoFocus
                            type="text"
                            className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                            placeholder="e.g. The Crystal Spire"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1.5">Classification</label>
                        <select
                            className="w-full bg-surface-dark border border-white/10 rounded-xl px-4 py-3 text-white focus:border-primary/50 outline-none appearance-none"
                            value={type}
                            onChange={(e) => setType(e.target.value)}
                        >
                            <option value="entidadindividual">Character / NPC</option>
                            <option value="zona">Location / Zone</option>
                            <option value="entidadcolectiva">Item / Artifact / Group</option>
                            <option value="construccion">Construction / Building</option>
                            <option value="efectos">Effect / Spell</option>
                            <option value="interaccion">Interaction / Event</option>
                        </select>
                    </div>

                    <div className="pt-4 flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-surface-light border border-white/5 text-slate-300 font-bold hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !name}
                            className="flex-1 py-3 rounded-xl bg-primary hover:bg-primary-light text-white font-bold shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? 'Forging...' : 'Create Entry'}
                        </button>
                    </div>
                </form>
            </GlassPanel>
        </div>
    );
};

const SidebarCategory = ({ icon, label, expanded, onToggle, items }) => {
    const { id } = useParams();
    return (
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
                            to={`/project/${id}/entities/${item.type}/${item.id}`}
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
};

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
