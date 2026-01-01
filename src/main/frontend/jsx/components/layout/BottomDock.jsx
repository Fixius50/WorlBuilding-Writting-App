import React from 'react';
import { NavLink, useParams } from 'react-router-dom';

const BottomDock = () => {
    const { username, projectName } = useParams();
    const baseUrl = `/${username}/${projectName}`;

    const navItems = [
        { icon: 'home', label: 'Home', to: baseUrl },
        { icon: 'auto_stories', label: 'World Bible', to: `${baseUrl}/bible` },
        { icon: 'map', label: 'Maps', to: `${baseUrl}/map` },
        { icon: 'event_note', label: 'Timeline', to: `${baseUrl}/timeline` },
        { icon: 'edit_note', label: 'Writing', to: `${baseUrl}/writing` },
        { icon: 'settings', label: 'Settings', to: '/settings' }
    ];

    return (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[60] flex items-center h-16 px-4 bg-surface-dark/40 backdrop-blur-2xl border border-white/10 rounded-full shadow-2xl animate-slide-up">
            <div className="flex items-center gap-1">
                {navItems.map((item, idx) => (
                    <NavLink
                        key={idx}
                        to={item.to}
                        end={item.to === baseUrl}
                        className={({ isActive }) => `
                            flex flex-col items-center justify-center min-w-[64px] h-12 rounded-full transition-all duration-300 group relative
                            ${isActive ? 'bg-primary/20 text-white' : 'text-slate-400 hover:text-white hover:bg-white/5'}
                        `}
                    >
                        <span className="material-symbols-outlined text-xl">{item.icon}</span>
                        <span className="text-[9px] font-black uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity absolute -top-8 bg-surface-light px-2 py-1 rounded-md border border-white/10 pointer-events-none">
                            {item.label}
                        </span>

                        {/* Active Indicator */}
                        <div className="absolute -bottom-1 w-1 h-1 rounded-full bg-primary opacity-0 scale-0 group-[.active]:opacity-100 group-[.active]:scale-100 transition-all duration-300"></div>
                    </NavLink>
                ))}
            </div>

            <div className="w-px h-6 bg-white/10 mx-2"></div>

            {/* Action Group */}
            <div className="flex items-center gap-2">
                <button className="size-10 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/5 transition-all">
                    <span className="material-symbols-outlined">search</span>
                </button>
                <div className="size-10 rounded-full bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 cursor-pointer hover:scale-105 transition-transform active:scale-95">
                    <span className="material-symbols-outlined">add</span>
                </div>
            </div>
        </div>
    );
};

export default BottomDock;
