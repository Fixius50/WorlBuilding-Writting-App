import { useState, useEffect } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import GlassPanel from '../common/GlassPanel';
import Avatar from '../common/Avatar';

const TopNavBar = () => {
    const location = useLocation();
    const { id: routeProjectId } = useParams();
    const [activeProjectId, setActiveProjectId] = useState(() => sessionStorage.getItem('activeProjectId'));
    const path = location.pathname;

    useEffect(() => {
        // Fallback for detecting ID from URL directly if useParams is empty in this context
        const projectMatch = location.pathname.match(/\/project\/([^/]+)/);
        const entityMatch = location.pathname.match(/\/entities\/[^/]+\/([^/]+)/);
        const detectedId = routeProjectId || projectMatch?.[1] || entityMatch?.[1];

        if (detectedId) {
            sessionStorage.setItem('activeProjectId', detectedId);
            setActiveProjectId(detectedId);
        }
    }, [routeProjectId, location.pathname]);

    // Home goes to dashboard
    // Projects goes to active project (or dashboard if none)
    const projectPath = activeProjectId ? `/project/${activeProjectId}` : '/dashboard';

    return (
        <div className="h-16 flex items-center justify-center pointer-events-none sticky top-0 z-50 px-8">
            <GlassPanel className="flex items-center gap-2 px-2 py-1.5 rounded-full pointer-events-auto border-white/10 shadow-2xl backdrop-blur-xl bg-background-dark/40">
                <Link to="/dashboard" className={`p-2 rounded-full transition-colors ${path === '/dashboard' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                    <span className="material-symbols-outlined text-xl">home</span>
                </Link>

                <div className="w-px h-4 bg-white/10 mx-1"></div>

                {path !== '/dashboard' && path !== '/settings' && (
                    <nav className="flex items-center gap-1">
                        <NavItem to={projectPath} icon="grid_view" label="Dashboard" active={path.startsWith('/project/')} />
                        <NavItem to="/writing" icon="edit_note" label="Writing" active={path.startsWith('/writing')} />
                        <NavItem to="/timeline" icon="event_note" label="Timeline" active={path.includes('/timeline')} />
                        <NavItem to="/map" icon="map" label="Cartography" active={path.includes('/map')} />
                        <NavItem to="/languages" icon="translate" label="Linguistics" active={path.includes('/languages')} />
                        <NavItem to="/graph" icon="hub" label="Graph" active={path.includes('/graph')} />
                    </nav>
                )}
                {(path === '/dashboard' || path === '/settings') && (
                    <div className="flex items-center gap-1 px-4">
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vault Access Area</span>
                    </div>
                )}

                <div className="w-px h-4 bg-white/10 mx-1"></div>

                <div className="flex items-center gap-1">
                    <Link to="/settings" className={`p-2 rounded-full transition-colors ${path === '/settings' ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
                        <span className="material-symbols-outlined text-xl">settings</span>
                    </Link>
                    <Link to="/settings" className="ml-1">
                        <Avatar name="EW" size="sm" className="bg-primary/20 text-primary border border-primary/30" />
                    </Link>
                </div>
            </GlassPanel>
        </div>
    );
};

const NavItem = ({ to, icon, label, active }) => (
    <Link to={to} className={`flex items-center gap-2 px-3 py-1.5 rounded-full transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}>
        <span className="material-symbols-outlined text-sm">{icon}</span>
        <span className="text-[10px] font-bold tracking-[0.1em] uppercase">{label}</span>
    </Link>
);

export default TopNavBar;
