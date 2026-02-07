import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import MapCreationWizard from './MapCreationWizard';
import MapEditor from '../Specialized/MapEditor';
import InteractiveMapView from './InteractiveMapView';
import MapManager from './MapManager'; // New Manager
import api from '../../../js/services/api';
import ConfirmationModal from '../../components/ConfirmationModal';

const MapRouter = () => {
    const { username, projectName } = useParams();
    const navigate = useNavigate();
    const [view, setView] = useState('manager'); // Default to manager
    const [maps, setMaps] = useState([]);
    const [selectedMap, setSelectedMap] = useState(null);
    const [newMapId, setNewMapId] = useState(null);
    const [mapToDelete, setMapToDelete] = useState(null);

    React.useEffect(() => {
        loadMaps();

        const handleRefresh = () => loadMaps();
        window.addEventListener('map-updated', handleRefresh);
        return () => window.removeEventListener('map-updated', handleRefresh);
    }, []);

    const loadMaps = async () => {
        try {
            const allEntities = await api.get('/world-bible/entities');
            const mapEntities = allEntities.filter(e => e.tipoEspecial === 'map');
            setMaps(mapEntities);
        } catch (err) { console.error("Error loading maps", err); }
    };

    const handleDuplicateMap = async (map) => {
        try {
            // Clean up the object for duplication
            const { id, slug, createdAt, updatedAt, ...rest } = map;

            // Ensure carpetaId is explicit and we handle common backend requirements
            const duplicated = await api.post('/world-bible/entities', {
                ...rest,
                nombre: `${map.nombre} (Copia)`,
                carpetaId: map.carpetaId || map.parent?.id,
                attributes: {
                    ...map.attributes,
                    layers: (map.attributes?.layers || []).map(l => ({ ...l, id: crypto.randomUUID() }))
                }
            });
            await loadMaps();
        } catch (err) {
            console.error("Error duplicating map:", err);
            alert("Error al duplicar el mapa. Verifica la consola.");
        }
    };

    const confirmDeleteMap = async () => {
        if (!mapToDelete) return;
        try {
            await api.delete(`/world-bible/entities/${mapToDelete.id}`);
            setMapToDelete(null);
            await loadMaps();
        } catch (err) { console.error("Error deleting map", err); }
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

            setNewMapId(newEntity.id);
            setView('wizard'); // Close wizard

            // Reload maps
            await loadMaps();

            // Switch to editor
            setTimeout(() => {
                setView('editor');
            }, 100);
        } catch (err) {
            console.error("Error creating map:", err);
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-background-dark overflow-hidden">
            {view === 'manager' && (
                <MapManager
                    maps={maps}
                    onSelectMap={(map) => {
                        setSelectedMap(map);
                        setView('viewer');
                    }}
                    onCreateMap={() => setView('wizard')}
                    onDuplicateMap={handleDuplicateMap}
                    onDeleteMap={(map) => setMapToDelete(map)}
                />
            )}

            {view === 'viewer' && selectedMap && (
                <div className="flex-1 flex flex-col h-full relative">
                    <div className="absolute top-4 left-4 z-[1001]">
                        <button
                            onClick={() => {
                                setView('manager');
                                // Trigger event to clear global right panel if necessary
                                window.dispatchEvent(new CustomEvent('clear-right-panel'));
                            }}
                            className="bg-black/60 hover:bg-black/80 text-white backdrop-blur-md px-4 py-2 rounded-xl flex items-center gap-2 border border-white/10 transition-all font-bold text-sm"
                        >
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Volver al Atlas
                        </button>
                    </div>
                    <InteractiveMapView map={selectedMap} />
                </div>
            )}

            {view === 'wizard' && (
                <MapCreationWizard
                    onCancel={() => setView(maps.length > 0 ? 'manager' : 'manager')}
                    onCreate={handleCreateMap}
                />
            )}

            {view === 'editor' && (
                <MapEditor
                    mode={newMapId ? 'create' : 'edit'}
                    entityId={newMapId}
                    onBack={() => {
                        setView('manager');
                        setNewMapId(null);
                    }}
                    onSave={async () => {
                        await loadMaps();
                        if (newMapId) {
                            navigate(`/local/${projectName}/entity/${newMapId}`);
                        } else {
                            setView('manager');
                        }
                        setNewMapId(null);
                    }}
                />
            )}

            <ConfirmationModal
                isOpen={!!mapToDelete}
                onClose={() => setMapToDelete(null)}
                onConfirm={confirmDeleteMap}
                title="Eliminar Mapa"
                message={`¿Estás seguro de que quieres eliminar el mapa "${mapToDelete?.nombre}"? Esta acción no se puede deshacer.`}
                confirmText="Eliminar"
                type="danger"
            />
        </div>
    );
};

export default MapRouter;
