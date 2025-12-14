'use client';

import { useState } from 'react';
import { WorldMap } from '@/components/world-map/WorldMap';
import { SmartEditor } from '@/components/smart-editor/SmartEditor';
import { TimeBar } from '@/components/time-bar/TimeBar';
import { UniverseOutliner } from '@/components/universe-outliner/UniverseOutliner';
import { TopBar } from '@/components/top-bar/TopBar';

export default function ChronosAtlas() {
    const [currentView, setCurrentView] = useState<'map' | 'editor' | 'entities'>('map');
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleViewChange = (view: 'map' | 'editor' | 'entities') => {
        if (view === currentView) return;
        setIsTransitioning(true);
        setTimeout(() => {
            setCurrentView(view);
            setIsTransitioning(false);
        }, 300); // Wait for fade out
    };

    return (
        <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
            {/* Top Bar with View Navigation */}
            <TopBar 
                currentView={currentView}
                onViewChange={handleViewChange}
            />

            {/* Main Content Area */}
            <main className="flex-1 relative overflow-hidden bg-background">
                
                {/* View Container with Transition */}
                <div 
                    className={`absolute inset-0 transition-opacity duration-300 ease-in-out ${
                        isTransitioning ? 'opacity-0' : 'opacity-100'
                    }`}
                >
                    {currentView === 'map' && (
                        <div className="w-full h-full">
                            <WorldMap />
                            {/* Overlay TimeBar in Map Mode */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-3/4 max-w-2xl bg-black/50 backdrop-blur-md rounded-full p-2">
                                <TimeBar minimal />
                            </div>
                        </div>
                    )}

                    {currentView === 'editor' && (
                        <div className="w-full h-full max-w-4xl mx-auto p-6 animate-in slide-in-from-bottom-4 duration-500">
                             <SmartEditor />
                        </div>
                    )}

                    {currentView === 'entities' && (
                        <div className="w-full h-full p-6 animate-in zoom-in-95 duration-300">
                            {/* Reusing UniverseOutliner as full page view */}
                            <h2 className="text-3xl font-bold mb-6 text-foreground">Universe Entities</h2>
                            <UniverseOutliner className="w-full max-w-3xl mx-auto h-[80vh] border rounded-lg shadow-lg" />
                        </div>
                    )}
                </div>

            </main>

            {/* Global Status Footer */}
            <footer className="h-6 bg-card/80 border-t border-border px-4 flex items-center justify-between text-xs text-muted-foreground backdrop-blur-sm fixed bottom-0 w-full z-50">
                <span>Chronos Atlas v2.1 • Focus Mode</span>
                <span>{currentView.toUpperCase()} VIEW</span>
            </footer>
        </div>
    );
}
