import React, { useState } from 'react';
import MapCreationWizard from './MapCreationWizard';
import MapEditor from './MapEditor';
import InteractiveMapView from './InteractiveMapView';

const MapRouter = () => {
    const [view, setView] = useState('viewer'); // 'viewer', 'wizard', 'editor'

    const handleCreateMap = (source) => {
        if (source === 'blank') {
            setView('editor');
        } else {
            // Simulator for upload path
            setView('viewer');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background-dark overflow-hidden">
            {view === 'viewer' && (
                <div className="flex-1 flex flex-col h-full">
                    {/* Tiny Creation Button Overlay */}
                    <button
                        onClick={() => setView('wizard')}
                        className="absolute right-12 bottom-12 z-50 size-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all group"
                    >
                        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
                    </button>
                    <InteractiveMapView />
                </div>
            )}

            {view === 'wizard' && (
                <MapCreationWizard
                    onCancel={() => setView('viewer')}
                    onCreate={handleCreateMap}
                />
            )}

            {view === 'editor' && (
                <MapEditor
                    onBack={() => setView('viewer')}
                    onSave={() => setView('viewer')}
                />
            )}
        </div>
    );
};

export default MapRouter;
