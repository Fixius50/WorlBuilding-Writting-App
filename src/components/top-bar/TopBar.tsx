'use client';

import { useSyncStore } from '@/lib/stores/useSyncStore';
import { useThemeStore } from '@/lib/stores/useThemeStore';
import {
    Activity,
    Book,
    ChevronLeft,
    ChevronRight,
    Cloud,
    CloudOff,
    Database as DatabaseIcon,
    Map as MapIcon,
    Menu,
    MoreVertical,
    Redo2,
    Settings as SettingsIcon,
    Undo2,
    ScrollText as ChronicleIcon,
    Home as HomeIcon,
    Sparkles,
    Ghost
} from 'lucide-react';
import React from 'react';

interface TopBarProps {
    currentView: 'dashboard' | 'map' | 'editor' | 'entities' | 'settings';
    onViewChange: (view: 'dashboard' | 'map' | 'editor' | 'entities' | 'settings') => void;
}

export function TopBar({ currentView, onViewChange }: TopBarProps) {
    const { status, pendingChanges, lastSyncTime } = useSyncStore();
    const { mode, toggleMode } = useThemeStore();

    const getStatusLabel = () => {
        switch (status) {
            case 'synced': return 'Synced';
            case 'syncing': return 'Saving...';
            case 'error': return 'Error';
            case 'offline': return 'Offline';
        }
    };

    const getStatusColor = () => {
        switch (status) {
            case 'synced': return 'text-emerald-500 bg-emerald-500/10 ring-emerald-500/20';
            case 'syncing': return 'text-amber-500 bg-amber-500/10 ring-amber-500/20';
            case 'error': return 'text-destructive bg-destructive/10 ring-destructive/20';
            case 'offline': return 'text-muted-foreground bg-secondary ring-white/10';
        }
    };

    const NavButton = ({ view, label, icon }: { view: 'dashboard' | 'map' | 'editor' | 'entities' | 'settings', label: string, icon: React.ReactNode }) => (
        <button
            onClick={() => onViewChange(view)}
            className={`
                relative flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all
                ${currentView === view
                    ? 'bg-primary text-primary-foreground shadow-sm ring-1 ring-white/10'
                    : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'}
                ${mode === 'detailed' && currentView === view ? 'shadow-[0_0_10px_rgba(var(--primary),0.3)]' : ''}
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
        <header className={`h-14 backdrop-blur-md border-b flex items-center justify-between px-6 sticky top-0 z-50 transition-all duration-500
            ${mode === 'detailed'
                ? 'bg-[#0c0d12]/90 border-[#2a2b35] shadow-lg shadow-black/50'
                : 'bg-card/80 border-border'}
        `}>
            {/* Left Section - Logo */}
            <div className="flex items-center gap-3 w-48 transition-opacity hover:opacity-80 cursor-pointer" onClick={() => onViewChange('dashboard')}>
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold shadow-lg transition-all duration-500
                    ${mode === 'detailed'
                        ? 'bg-gradient-to-br from-amber-700 to-amber-900 shadow-amber-900/20 ring-1 ring-amber-500/30'
                        : 'bg-gradient-to-br from-indigo-500 to-purple-600 shadow-indigo-500/20'}
                `}>
                    <span className={mode === 'detailed' ? 'font-serif text-amber-100' : ''}>CA</span>
                </div>
                <div>
                    <h1 className={`text-sm font-bold leading-none tracking-tight ${mode === 'detailed' ? 'text-amber-100/90 font-serif' : ''}`}>Chronos Atlas</h1>
                    <span className="text-[10px] text-muted-foreground font-medium">WORLD ENGINE</span>
                </div>
            </div>

            {/* Center Section - Navigation Pills */}
            <div className={`flex items-center gap-1 p-1 rounded-full border transition-all duration-500
                ${mode === 'detailed'
                    ? 'bg-black/40 border-[#2a2b35] shadow-inner'
                    : 'bg-secondary/30 border-white/5'}
            `}>
                <NavButton
                    view="dashboard"
                    label="Home"
                    icon={<HomeIcon className="w-3.5 h-3.5" />}
                />
                <NavButton
                    view="map"
                    label="Map"
                    icon={<MapIcon className="w-3.5 h-3.5" />}
                />
                <NavButton
                    view="editor"
                    label="Chronicle"
                    icon={<ChronicleIcon className="w-3.5 h-3.5" />}
                />
                <NavButton
                    view="entities"
                    label="Database"
                    icon={<DatabaseIcon className="w-3.5 h-3.5" />}
                />
                <NavButton
                    view="settings"
                    label="Settings"
                    icon={<SettingsIcon className="w-3.5 h-3.5" />}
                />
            </div>

            {/* Right Section - Status & Actions */}
            <div className="flex items-center gap-3 w-48 justify-end">
                {/* Sync Status */}
                <div
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full ${getStatusColor()} text-xs font-medium cursor-help transition-colors ring-1 ring-inset`}
                    title={lastSyncTime ? `Last saved: ${lastSyncTime.toLocaleTimeString()}` : 'Not yet saved'}
                >
                    <div className={`w-1.5 h-1.5 rounded-full bg-current ${status === 'syncing' ? 'animate-pulse' : ''}`} />
                    <span>{getStatusLabel()}</span>
                </div>

                <div className="w-px h-4 bg-border" />

                {/* Theme Toggle */}
                <button
                    onClick={toggleMode}
                    className={`p-2 rounded-full hover:bg-secondary transition-colors group relative ${mode === 'detailed' ? 'text-amber-400 hover:text-amber-200 hover:bg-amber-900/20' : 'text-muted-foreground hover:text-foreground'}`}
                    title={mode === 'detailed' ? 'Switch to Minimal' : 'Switch to Dark Fantasy'}
                >
                    {mode === 'detailed' ? <Ghost className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </button>

            </div>
        </header>
    );
}
