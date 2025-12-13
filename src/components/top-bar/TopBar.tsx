'use client';

import { useSyncStore, SyncStatus } from '@/lib/stores/useSyncStore';

interface TopBarProps {
    onToggleSidebar: () => void;
    sidebarOpen: boolean;
}

const syncConfig: Record<SyncStatus, { color: string; bgColor: string; dotColor: string; label: string }> = {
    synced: { color: 'text-green-400', bgColor: 'bg-green-500/10', dotColor: 'bg-green-400', label: 'Synced' },
    syncing: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/10', dotColor: 'bg-yellow-400', label: 'Saving...' },
    offline: { color: 'text-gray-400', bgColor: 'bg-gray-500/10', dotColor: 'bg-gray-400', label: 'Offline' },
    error: { color: 'text-red-400', bgColor: 'bg-red-500/10', dotColor: 'bg-red-400', label: 'Error' },
};

export function TopBar({ onToggleSidebar, sidebarOpen }: TopBarProps) {
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

    return (
        <header className="h-12 bg-card border-b border-border flex items-center justify-between px-4">
            {/* Left Section */}
            <div className="flex items-center gap-3">
                {/* Sidebar Toggle */}
                <button
                    onClick={onToggleSidebar}
                    className="p-1.5 rounded hover:bg-secondary transition-colors"
                    title={sidebarOpen ? 'Hide Sidebar' : 'Show Sidebar'}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <line x1="9" y1="3" x2="9" y2="21" />
                    </svg>
                </button>

                {/* Logo */}
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                        </svg>
                    </div>
                    <span className="font-semibold text-lg tracking-tight">Chronos Atlas</span>
                </div>
            </div>

            {/* Center Section - Project Name */}
            <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Project:</span>
                <span className="text-sm font-medium">My World</span>
                <button className="p-1 rounded hover:bg-secondary transition-colors" title="Project Settings">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-muted-foreground" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="6 9 12 15 18 9" />
                    </svg>
                </button>
            </div>

            {/* Right Section - Actions */}
            <div className="flex items-center gap-2">
                {/* Sync Status - Connected to real store */}
                <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bgColor} ${config.color} text-xs cursor-help`}
                    title={lastSyncTime ? `Last saved: ${formatLastSync()}` : 'Not yet saved'}
                >
                    <div className={`w-1.5 h-1.5 rounded-full ${config.dotColor} ${status === 'syncing' ? 'animate-pulse' : ''}`} />
                    <span>{config.label}</span>
                </div>

                {/* Undo/Redo */}
                <div className="flex items-center border border-border rounded-md overflow-hidden">
                    <button className="p-1.5 hover:bg-secondary transition-colors border-r border-border" title="Undo (Ctrl+Z)">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="1 4 1 10 7 10" />
                            <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
                        </svg>
                    </button>
                    <button className="p-1.5 hover:bg-secondary transition-colors" title="Redo (Ctrl+Y)">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="23 4 23 10 17 10" />
                            <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
                        </svg>
                    </button>
                </div>

                {/* Settings */}
                <button className="p-1.5 rounded hover:bg-secondary transition-colors" title="Settings">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="3" />
                        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                    </svg>
                </button>
            </div>
        </header>
    );
}
