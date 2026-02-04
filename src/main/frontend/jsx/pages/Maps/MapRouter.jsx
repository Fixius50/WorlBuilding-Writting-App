import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapCreationWizard from './MapCreationWizard';
import MapEditor from '../Specialized/MapEditor';
import InteractiveMapView from './InteractiveMapView';
import MapSelectionModal from './MapSelectionModal';
import api from '../../../js/services/api';

const MapRouter = () => {
    const { username, projectName } = useParams();
    const navigate = useNavigate();
    const [view, setView] = useState('viewer'); // 'viewer', 'wizard', 'editor'
    const [maps, setMaps] = useState([]);
    const [selectedMap, setSelectedMap] = useState(null);
    const [showSelectionModal, setShowSelectionModal] = useState(false);
    const [newMapId, setNewMapId] = useState(null);

    React.useEffect(() => {
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

    const handleCreateMap = async (source, mapName, uploadedFile) => {
        try {
            // Get root folders to find a default folder for maps
            const folders = await api.get('/world-bible/folders');
            const defaultFolder = folders.find(f => f.nombre.toLowerCase().includes('map')) || folders[0];

            if (!defaultFolder) {
                console.error("No folders available to create map");
                return;
            }

            // Create the entity in the backend first
            const newEntity = await api.post('/world-bible/entities', {
                nombre: mapName,
                carpetaId: defaultFolder.id,
                tipoEspecial: 'map',
                categoria: 'Location',
                descripcion: '',
                iconUrl: '',
                attributes: {
                    mapType: 'regional',
                    layers: []
                }
            });

            // If user uploaded a file, we could handle it here
            // For now, we'll just navigate to the editor with the new entity ID
            setNewMapId(newEntity.id);
            setView('wizard'); // Close the wizard first
            setShowSelectionModal(false); // Close the selection modal

            // Reload maps to include the new one
            await loadMaps();

            // Then switch to editor
            setTimeout(() => {
                setView('editor');
            }, 100);
        } catch (err) {
            console.error("Error creating map:", err);
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
                    mode={newMapId ? 'create' : 'edit'}
                    entityId={newMapId}
                    onBack={() => {
                        setView('viewer');
                        setNewMapId(null);
                    }}
                    onSave={async () => {
                        await loadMaps(); // Reload maps to include the newly created one
                        if (newMapId) {
                            // Navigate to the entity detail page
                            navigate(`/local/${projectName}/entity/${newMapId}`);
                        } else {
                            setView('viewer');
                        }
                        setNewMapId(null);
                    }}
                />
            )}
        </div>
    );
};

export default MapRouter;
