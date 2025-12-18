'use client';

import { useState } from 'react';
import { TopBar } from '@/components/top-bar/TopBar';
import { TimeBar } from '@/components/time-bar/TimeBar';
import { WorldMap } from '@/components/world-map/WorldMap';
import { UniverseOutliner } from '@/components/universe-outliner/UniverseOutliner';
import { SmartEditor as ChronicleEditor } from '@/components/smart-editor/SmartEditor';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { Settings } from '@/components/settings/Settings';

export default function ChronosAtlas() {
    const [currentView, setCurrentView] = useState<'dashboard' | 'map' | 'editor' | 'entities' | 'settings'>('dashboard');
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleViewChange = (view: 'dashboard' | 'map' | 'editor' | 'entities' | 'settings') => {
        if (view === currentView) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentView(view);
            setIsTransitioning(false);
        }, 300); // Wait for fade out
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
            <TopBar
                currentView={currentView}
                onViewChange={handleViewChange}
            />
            <main className="flex-1 relative overflow-hidden bg-background">
                <div
                    className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${isTransitioning ? 'opacity-0' : 'opacity-100'
                        }`}
                >
                    {currentView === 'dashboard' && (
                        <Dashboard onNavigate={handleViewChange} />
                    )}
                    {currentView === 'map' && (
                        <div className="w-full h-full animate-in zoom-in-95 duration-500">
                            <WorldMap />
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl bg-black/50 backdrop-blur-md rounded-full p-2 animate-in slide-in-from-bottom-4 duration-700">
                                <TimeBar minimal />
                            </div>
                        </div>
                    )}
                    {currentView === 'editor' && (
                        <div className="w-full h-full max-w-5xl mx-auto p-6 animate-in slide-in-from-bottom-4 duration-500">
                            <ChronicleEditor />
                        </div>
                    )}
                    {currentView === 'entities' && (
                        <div className="w-full h-full flex animate-in slide-in-from-right-4 duration-500">
                            <UniverseOutliner />
                        </div>
                    )}
                    {currentView === 'settings' && (
                        <Settings />
                    )}
                </div>
            </main>
            <footer className="h-6 bg-card/80 border-t border-border px-4 flex items-center justify-between text-xs text-muted-foreground backdrop-blur-sm fixed bottom-0 w-full z-50">
                <span>Chronos Atlas v2.2 • Dark Fantasy Suite</span>
                <span>{currentView.toUpperCase()} VIEW</span>
            </footer>
        </div>
    );
}
