'use client';

import { useSyncStore, SyncStatus } from '@/lib/stores/useSyncStore';

interface TopBarProps {
    currentView: 'map' | 'editor' | 'entities';
    onViewChange: (view: 'map' | 'editor' | 'entities') => void;
}

const syncConfig: Record<SyncStatus, { color: string; bgColor: string; dotColor: string; label: string }> = {
    synced: { color: 'text-green-400', bgColor: 'bg-green-500/10', dotColor: 'bg-green-400', label: 'Synced' },
    syncing: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', dotColor: 'bg-yellow-400', label: 'Saving...' },
    offline: { color: 'text-gray-400', bgColor: 'bg-gray-500/10', dotColor: 'bg-gray-400', label: 'Offline' },
    error: { color: 'text-red-400', bgColor: 'bg-red-500/10', dotColor: 'bg-red-400', label: 'Error' },
};

export function TopBar({ currentView, onViewChange }: TopBarProps) {
    const { status, lastSyncTime } = useSyncStore();
    const config = syncConfig[status];

    const formatLastSync = () => {
        if (!lastSyncTime) return '';
        const now = new Date();
        const diff = Math.floor((now.getTime() - lastSyncTime.getTime()) / 1000);
        if (diff < 60) return 'just now';
        if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
        return lastSyncTime.toLocaleTimeString();
    };

    const NavButton = ({ view, label, icon }: { view: 'map' | 'editor' | 'entities', label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => onViewChange(view)}
            className={`
                relative flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium transition-all
                ${currentView === view
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}
            `}
        >
            {icon}
            {label}
            {currentView === view && (
                <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/20" />
            )}
        </button>
    );

    return (
        <header className="h-14 bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6 sticky top-0 z-50">
            {/* Left Section - Logo */}
            <div className="flex items-center gap-3 w-48">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-lg shadow-primary/20">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10" />
                        <polyline points="12 6 12 12 16 14" />
                    </svg>
                </div>
                <div className="flex flex-col leading-none">
                    <span className="font-bold text-base tracking-tight text-foreground">Chronos Atlas</span>
                    <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">World Engine</span>
                </div>
            </div>

            {/* Center Section - Navigation Pills */}
            <div className="flex items-center gap-1 bg-secondary/30 p-1 rounded-full border border-white/5">
                <NavButton
                    view="map"
                    label="World Map"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                            <path d="M2 12h20" />
                        </svg>
                    }
                />
                <NavButton
                    view="editor"
                    label="Chronicle"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                    }
                />
                <NavButton
                    view="entities"
                    label="Database"
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M12 2c5.5 0 10 4.5 10 10s-4.5 10-10 10S2 17.5 2 12 6.5 2 12 2zm0 18c4.4 0 8-3.6 8-8s-3.6-8-8-8-8 3.6-8 8 3.6 8 8 8z" />
                            <circle cx="12" cy="12" r="3" />
                            <path d="M12 2v2" /><path d="M12 20v2" />
                            <path d="M2 12h2" /><path d="M20 12h2" />
                        </svg>
                    }
                />
            </div>

            {/* Right Section - Status & Actions */}
            <div className="flex items-center gap-3 w-48 justify-end">
                {/* Sync Status */}
                <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${config.bgColor} ${config.color} text-xs font-medium cursor-help transition-colors ring-1 ring-inset ring-white/5`}
                    title={lastSyncTime ? `Last saved: ${formatLastSync()}` : 'Not yet saved'}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${status === 'syncing' ? 'animate-pulse' : ''}`} />
                    <span>{config.label}</span>
                </div>

                <div className="w-px h-4 bg-border" />

                <button className="p-2 rounded-full hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground" title="Settings">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
