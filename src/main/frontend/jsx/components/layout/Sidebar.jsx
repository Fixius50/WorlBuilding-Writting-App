import { Link, useLocation } from 'react-router-dom';
import Avatar from '../common/Avatar'; // We need to create this later, but I'll use a placeholder for now or create it in this batch.

const SidebarItem = ({ icon, label, to, active }) => (
    <Link
        to={to}
        className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors group ${active ? 'bg-primary/10 text-primary border border-primary/20' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}
    >
        <span className={`material-symbols-outlined text-[20px] ${active ? 'fill-1' : ''}`}>{icon}</span>
        <span className="text-sm font-medium">{label}</span>
    </Link>
);

const Sidebar = () => {
    const location = useLocation();
    const path = location.pathname;

    return (
        <aside className="w-64 flex-none flex flex-col border-r border-glass-border bg-surface-dark/50 backdrop-blur-xl z-20 h-full">
            {/* Brand */}
            <div className="h-16 flex items-center px-6 gap-3 border-b border-glass-border">
                <div className="size-8 bg-primary rounded-lg flex items-center justify-center text-white shadow-lg shadow-primary/20">
                    <span className="material-symbols-outlined">public</span>
                </div>
                <h1 className="text-white font-bold text-lg tracking-tight">Chronos Atlas</h1>
            </div>

            {/* Context */}
            <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
                <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-surface-light border border-glass-border mb-6">
                    <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></div>
                    <span className="text-white text-sm font-medium truncate">Kingdom of Aethelgard</span>
                </div>

                <div className="space-y-1">
                    <SidebarItem icon="dashboard" label="Dashboard" to="/dashboard" active={path === '/dashboard'} />
                    <div className="h-px bg-white/5 my-2 mx-2"></div>
                    <p className="px-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">World Bible</p>
                    <SidebarItem icon="group" label="Characters" to="/entities/character" active={path.includes('/entities/character')} />
                    <SidebarItem icon="public" label="Locations" to="/entities/location" active={path.includes('/entities/location')} />
                    <SidebarItem icon="timeline" label="Timeline" to="/timeline" active={path.includes('/timeline')} />
                    <SidebarItem icon="auto_stories" label="Magic Systems" to="/entities/magic" active={path.includes('/entities/magic')} />
                    <SidebarItem icon="diversity_3" label="Cultures" to="/entities/culture" active={path.includes('/entities/culture')} />
                    <SidebarItem icon="translate" label="Conlangs" to="/languages" active={path.includes('/languages')} />
                    <SidebarItem icon="hub" label="Graph View" to="/graph" active={path.includes('/graph')} />
                    <div className="h-px bg-white/5 my-2 mx-2"></div>
                    <SidebarItem icon="settings" label="Settings" to="/settings" active={path === '/settings'} />
                </div>
            </div>

            {/* Profile */}
            <div className="mt-auto p-4 border-t border-glass-border">
                <Link to="/profile" className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity">
                    <div className="size-8 rounded-full bg-slate-700"></div> {/* Placeholder Avatar */}
                    <div className="flex flex-col overflow-hidden">
                        <span className="text-sm font-medium text-white truncate">Elena Writer</span>
                        <span className="text-xs text-slate-500 truncate">Pro Plan</span>
                    </div>
                </Link>
            </div>
        </aside>
    );
};

export default Sidebar;
