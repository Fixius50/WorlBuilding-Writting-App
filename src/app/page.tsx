'use client';

import { useState } from 'react';
import { WorldMap } from '@/components/world-map/WorldMap';
import { SmartEditor } from '@/components/smart-editor/SmartEditor';
import { TimeController } from '@/components/time-controller/TimeController';
import { Sidebar } from '@/components/sidebar/Sidebar';
import { TopBar } from '@/components/top-bar/TopBar';

export default function ChronosAtlas() {
    const [activePanel, setActivePanel] = useState<'map' | 'editor' | 'split'>('split');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    return (
        <div className="h-screen w-screen flex flex-col bg-background overflow-hidden">
            {/* Top Bar */}
            <TopBar
                onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                sidebarOpen={sidebarOpen}
            />

            {/* Main Content */}
            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar - Entity Tree */}
                {sidebarOpen && (
                    <Sidebar className="w-64 flex-shrink-0" />
                )}

                {/* Main Panel Area */}
                <main className="flex-1 flex flex-col overflow-hidden">
                    {/* Time Controller */}
                    <TimeController className="flex-shrink-0" />

                    {/* Workspace */}
                    <div className="flex-1 flex gap-1 p-1 overflow-hidden">
                        {/* Map Panel */}
                        {(activePanel === 'map' || activePanel === 'split') && (
                            <div className={`ide-panel overflow-hidden ${activePanel === 'split' ? 'flex-1' : 'w-full'}`}>
                                <WorldMap />
                            </div>
                        )}

                        {/* Editor Panel */}
                        {(activePanel === 'editor' || activePanel === 'split') && (
                            <div className={`ide-panel overflow-hidden ${activePanel === 'split' ? 'flex-1' : 'w-full'}`}>
                                <SmartEditor />
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* Status Bar */}
            <footer className="h-6 bg-card border-t border-border px-4 flex items-center justify-between text-xs text-muted-foreground">
                <span>Chronos Atlas v1.0.0</span>
                <span>Local Database • Ready</span>
            </footer>
        </div>
    );
}
