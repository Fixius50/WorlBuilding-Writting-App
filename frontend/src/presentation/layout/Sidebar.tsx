import { Link, useLocation } from 'react-router-dom';
import Avatar from '@atoms/Avatar';

interface SidebarItemProps {
 icon: string;
 label: string;
 to: string;
 active: boolean;
}

const SidebarItem = ({ icon, label, to, active }: SidebarItemProps) => (
 <Link
 to={to}
 className={`flex items-center gap-3 px-3 py-2 rounded-none transition-colors group ${active ? 'bg-primary/10 text-primary' : 'text-foreground/60 hover:bg-foreground/5 hover:text-foreground'}`}
 >
 <span className={`material-symbols-outlined text-[20px] ${active ? 'fill-1' : ''}`}>{icon}</span>
 <span className="text-sm font-medium">{label}</span>
 </Link>
);

const Sidebar = () => {
 const location = useLocation();
 const path = location.pathname;

 return (
 <aside className="w-64 flex-none flex flex-col monolithic-panel border-y-0 border-l-0 z-20 h-full">
 {/* Brand */}
 <div className="h-16 flex items-center px-6 gap-3 border-b" >
 <div className="size-8 bg-primary rounded-none flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/20">
 <span className="material-symbols-outlined">public</span>
 </div>
 <h1 className="text-foreground font-bold text-lg tracking-tight">Chronos Atlas</h1>
 </div>

 {/* Context */}
 <div className="p-4 flex-1 overflow-y-auto no-scrollbar">
 <div className="flex items-center gap-3 px-3 py-2 rounded-none sunken-panel mb-6">
 <div className="size-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.4)] animate-pulse"></div>
 <span className="text-foreground text-sm font-medium truncate">Kingdom of Aethelgard</span>
 </div>

 <div className="space-y-1">
 <SidebarItem icon="dashboard" label="Dashboard" to="/dashboard" active={path === '/dashboard'} />
 <div className="h-px bg-foreground/10 my-2 mx-2"></div>
 <p className="px-3 text-xs font-bold text-foreground/40 uppercase tracking-wider mb-2">World Bible</p>
 <SidebarItem icon="group" label="Characters" to="/entities/character" active={path.includes('/entities/character')} />
 <SidebarItem icon="public" label="Locations" to="/entities/location" active={path.includes('/entities/location')} />
 <SidebarItem icon="timeline" label="Timeline" to="/timeline" active={path.includes('/timeline')} />
 <SidebarItem icon="auto_stories" label="Magic Systems" to="/entities/magic" active={path.includes('/entities/magic')} />
 <SidebarItem icon="diversity_3" label="Cultures" to="/entities/culture" active={path.includes('/entities/culture')} />
 <SidebarItem icon="translate" label="Conlangs" to="/languages" active={path.includes('/languages')} />
 <SidebarItem icon="hub" label="Graph View" to="/graph" active={path.includes('/graph')} />
 <div className="h-px bg-foreground/10 my-2 mx-2"></div>
 <SidebarItem icon="settings" label="Settings" to="/settings" active={path === '/settings'} />
 </div>
 </div>

 {/* Profile */}
 <div className="mt-auto p-4 border-t" >
 <Link to="/profile" className="flex items-center gap-3 px-2 hover:opacity-80 transition-opacity">
 <div className="size-8 rounded-full bg-foreground/10"></div> {/* Placeholder Avatar */}
 <div className="flex flex-col overflow-hidden">
 <span className="text-sm font-medium text-foreground truncate">Elena Writer</span>
 <span className="text-xs text-foreground/50 truncate">Pro Plan</span>
 </div>
 </Link>
 </div>
 </aside>
 );
};

export default Sidebar;
