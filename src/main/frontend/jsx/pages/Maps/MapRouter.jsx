import React, { useState } from 'react';
import MapCreationWizard from './MapCreationWizard';
import MapEditor from '../Specialized/MapEditor';
import InteractiveMapView from './InteractiveMapView';
import MapSelectionModal from './MapSelectionModal';
import api from '../../../js/services/api';
import { useEffect } from 'react';

const MapRouter = () => {
    const [view, setView] = useState('viewer'); // 'viewer', 'wizard', 'editor'
    const [maps, setMaps] = useState([]);
    const [selectedMap, setSelectedMap] = useState(null);
    const [showSelectionModal, setShowSelectionModal] = useState(false);

    useEffect(() => {
        loadMaps();
    }, []);

    const loadMaps = async () => {
        try {
            const allEntities = await api.get('/world-bible/entities');
            const mapEntities = allEntities.filter(e => e.tipoEspecial === 'map');
            setMaps(mapEntities);
            if (mapEntities.length > 0 && !selectedMap) {
                setSelectedMap(mapEntities[0]);
            }
        } catch (err) { console.error("Error loading maps", err); }
    };

    const handleCreateMap = (source) => {
        if (source === 'blank') {
            setView('editor');
        } else {
            // Simulator for upload path
            loadMaps();
            setView('viewer');
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background-dark overflow-hidden">
            {view === 'viewer' && (
                <div className="flex-1 flex flex-col h-full relative">
                    {/* Tiny Creation Button Overlay */}
                    <button
                        onClick={() => setShowSelectionModal(true)}
                        className="absolute right-12 bottom-12 z-50 size-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all group"
                    >
                        <span className="material-symbols-outlined text-3xl group-hover:rotate-90 transition-transform duration-300">add</span>
                    </button>
                    <InteractiveMapView map={selectedMap} />

                    {showSelectionModal && (
                        <MapSelectionModal
                            maps={maps}
                            onSelect={(map) => {
                                setSelectedMap(map);
                                setShowSelectionModal(false);
                            }}
                            onCreateNew={() => {
                                setShowSelectionModal(false);
                                setView('wizard');
                            }}
                            onClose={() => setShowSelectionModal(false)}
                        />
                    )}
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
