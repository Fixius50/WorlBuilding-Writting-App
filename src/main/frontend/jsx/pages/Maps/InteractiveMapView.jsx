import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOutletContext } from 'react-router-dom';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import LeafletMapView from '../../components/maps/LeafletMapView';
import api from '../../../js/services/api';

const InteractiveMapView = ({ map }) => {
    const { t } = useLanguage();
    const [selectedMarker, setSelectedMarker] = useState(null);
    const { setRightPanelContent, setRightOpen, setRightPanelTitle } = useOutletContext();
    const mapName = map?.nombre || t('maps.explorer');

    // Tool Modes: 'explore', 'add_layer', 'add_connection'
    const [interactionMode, setInteractionMode] = useState('explore');
    const [connectionSource, setConnectionSource] = useState(null);
    const [newLayerUrl, setNewLayerUrl] = useState('');
    const [newLayerName, setNewLayerName] = useState('');
    const [localMap, setLocalMap] = useState(map);

    // Sync local map when prop changes (if edited outside)
    useEffect(() => {
        setLocalMap(map);
    }, [map]);

    // Resolve Map Image: attributes.bgImage -> attributes.snapshotUrl -> iconUrl -> fallback
    const mapAttributes = localMap?.attributes || {};

    // Check for legacy description JSON if attributes are empty
    let legacyData = {};
    if (!mapAttributes.bgImage && localMap?.descripcion && localMap?.descripcion.startsWith('{')) {
        try { legacyData = JSON.parse(localMap.descripcion); } catch (e) { }
    }

    let mapImage = mapAttributes.bgImage || legacyData.bgImage || localMap?.iconUrl || null;
    if (mapImage && (mapImage.toLowerCase().includes('duckdns') || mapImage.toLowerCase().includes('nopreview'))) {
        mapImage = null;
    }

    // Get markers, layers and connections from attributes
    const markers = mapAttributes.markers || [];
    const layers = mapAttributes.layers || [];
    const connections = mapAttributes.connections || [];

    // Get image dimensions (default to 1920x1080 if not specified)
    const imageWidth = mapAttributes.imageWidth || 1920;
    const imageHeight = mapAttributes.imageHeight || 1080;

    // Persist changes to map entity
    const saveMapAttributes = async (newAttributes) => {
        try {
            const updatedMap = {
                ...localMap,
                attributes: newAttributes
            };
            await api.put(`/world-bible/entities/${localMap.id}`, updatedMap);
            setLocalMap(updatedMap);
        } catch (err) {
            console.error("Error saving map attributes", err);
            alert("No se pudieron guardar los cambios en el mapa.");
        }
    };

    const handleAddLayer = () => {
        if (!newLayerUrl) return;
        const newLayer = {
            name: newLayerName || `Capa ${layers.length + 1}`,
            url: newLayerUrl,
            defaultVisible: true,
            opacity: 1
        };
        const updatedAttrs = { ...mapAttributes, layers: [...layers, newLayer] };
        saveMapAttributes(updatedAttrs);
        setNewLayerUrl('');
        setNewLayerName('');
        setInteractionMode('explore');
    };

    const handleDeleteLayer = (index) => {
        const newLayers = [...layers];
        newLayers.splice(index, 1);
        saveMapAttributes({ ...mapAttributes, layers: newLayers });
    };

    const handleDeleteConnection = (index) => {
        const newConnections = [...connections];
        newConnections.splice(index, 1);
        saveMapAttributes({ ...mapAttributes, connections: newConnections });
    };

    // Push content to global panel whenever selectedMarker changes
    useEffect(() => {
        setRightPanelTab('CONTEXT'); // Ensure we are in Context tab
        setRightPanelTitle(
            <div className="flex flex-col">
                <span className="text-[10px] text-primary font-black uppercase tracking-widest leading-none mb-1">Explorador de Atlas</span>
                <span className="text-white font-serif font-black text-lg truncate">{mapName}</span>
            </div>
        );

        if (selectedMarker) {
            setRightPanelContent(
                <div className="flex flex-col h-full gap-8 p-6 animate-in slide-in-from-right-4 duration-300 custom-scrollbar overflow-y-auto">
                    <header className="space-y-6">
                        <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-xl group">
                            <img src="https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&w=500&q=80" alt="Detail" className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => setSelectedMarker(null)} className="size-8 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
                            </div>
                            <div className="absolute bottom-4 left-4 flex gap-2">
                                <span className="px-3 py-1 rounded bg-primary/20 text-primary border border-primary/20 text-[8px] font-black uppercase tracking-widest backdrop-blur-md">{t('maps.place')}</span>
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-black text-white leading-tight mb-2">{selectedMarker.label || 'Ubicación Desconocida'}</h2>
                            <p className="text-slate-500 font-medium text-xs leading-relaxed">{selectedMarker.description || 'Sin descripción disponible.'}</p>
                        </div>
                    </header>

                    <div className="space-y-8">
                        <section className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('maps.inhabitants')}</h3>
                            </div>
                            <div className="space-y-3">
                                <InhabitantRow name="Personaje A" role="Rol A" />
                            </div>
                        </section>

                        {/* Integrated Global Tools even when marker selected */}
                        <section className="space-y-4 pt-6 border-t border-white/5">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Herramientas</h3>
                            <div className="grid grid-cols-1 gap-2">
                                <button
                                    onClick={() => { setSelectedMarker(null); setInteractionMode('add_layer'); }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm text-primary">layers</span>
                                    Gestionar Multicapas
                                </button>
                                <button
                                    onClick={() => { setSelectedMarker(null); setInteractionMode('add_connection'); setConnectionSource(null); }}
                                    className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-[10px] font-black uppercase text-slate-400 hover:text-white hover:bg-white/10 transition-all"
                                >
                                    <span className="material-symbols-outlined text-sm text-primary">settings_ethernet</span>
                                    Relaciones N:M
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            );
            setRightOpen(true);
        } else {
            // No marker selected. Based on interactionMode show different panel
            if (interactionMode === 'add_layer') {
                setRightPanelContent(
                    <div className="p-6 h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={() => setInteractionMode('explore')} className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white transition-colors">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                            </button>
                            <h3 className="text-white font-serif font-black text-xl">Multicapas</h3>
                        </div>

                        <div className="space-y-6 flex-1">
                            <div className="space-y-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Nueva Capa</h4>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-2">URL de la Imagen (Opcional Transparente)</label>
                                    <input
                                        type="text"
                                        value={newLayerUrl}
                                        onChange={(e) => setNewLayerUrl(e.target.value)}
                                        placeholder="https://ejemplo.com/mapa-ruinas.png"
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-bold uppercase text-slate-500 block mb-2">Nombre de Capa</label>
                                    <input
                                        type="text"
                                        value={newLayerName}
                                        onChange={(e) => setNewLayerName(e.target.value)}
                                        placeholder="Ej: Catacumbas, Rutas Marítimas..."
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:border-primary outline-none"
                                    />
                                </div>
                                <Button
                                    variant="primary"
                                    className="w-full justify-center"
                                    onClick={handleAddLayer}
                                    disabled={!newLayerUrl}
                                >
                                    Agregar Capa
                                </Button>
                            </div>

                            <div className="space-y-3">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Capas Activas</h4>
                                {layers.length === 0 && <p className="text-xs text-slate-600 italic">No hay capas adicionales. Solo el mapa base.</p>}
                                {layers.map((l, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5">
                                        <div className="flex items-center gap-3">
                                            <span className="material-symbols-outlined text-primary text-sm opacity-50">layers</span>
                                            <span className="text-xs font-bold text-white">{l.name}</span>
                                        </div>
                                        <button onClick={() => handleDeleteLayer(idx)} className="text-red-400 hover:text-red-300 p-1">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                );
            } else if (interactionMode === 'add_connection') {
                setRightPanelContent(
                    <div className="p-6 h-full flex flex-col animate-in slide-in-from-right-4 duration-300">
                        <div className="flex items-center gap-3 mb-6">
                            <button onClick={() => { setInteractionMode('explore'); setConnectionSource(null); }} className="size-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 text-white transition-colors">
                                <span className="material-symbols-outlined text-sm">arrow_back</span>
                            </button>
                            <h3 className="text-white font-serif font-black text-xl">Rutas y Relaciones</h3>
                        </div>

                        <div className={`p-4 rounded-xl border-2 border-dashed ${connectionSource ? 'border-primary/50 bg-primary/5 text-primary' : 'border-white/10 bg-white/[0.02] text-slate-400'} text-center mb-6`}>
                            <span className="material-symbols-outlined text-3xl mb-2">{connectionSource ? 'route' : 'touch_app'}</span>
                            <p className="text-xs font-medium">
                                {connectionSource ? 'Selecciona el marcador de Destino en el mapa' : 'Haz clic en un marcador para establecer el Origen'}
                            </p>
                            {connectionSource && (
                                <div className="mt-3 p-2 bg-black/40 rounded-lg text-white font-bold text-[10px] uppercase tracking-wider shadow-inner">
                                    Origen: {connectionSource.label}
                                </div>
                            )}
                        </div>

                        <div className="space-y-3 flex-1 overflow-y-auto">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Rutas Existentes</h4>
                            {connections.length === 0 && <p className="text-xs text-slate-600 italic">No hay rutas conectadas.</p>}
                            {connections.map((c, idx) => {
                                const s = markers.find(m => m.id === c.sourceId);
                                const t = markers.find(m => m.id === c.targetId);
                                return (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-xl bg-white/[0.02] border border-white/5 group">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="text-[10px] font-bold text-white truncate">{s?.label || '???'}</span>
                                                <span className="material-symbols-outlined text-[10px] text-slate-500">arrow_forward</span>
                                                <span className="text-[10px] font-bold text-white truncate">{t?.label || '???'}</span>
                                            </div>
                                            <span className="text-[9px] font-medium text-primary uppercase tracking-widest">{c.label}</span>
                                        </div>
                                        <button onClick={() => handleDeleteConnection(idx)} className="text-red-400 hover:text-red-300 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <span className="material-symbols-outlined text-sm">delete</span>
                                        </button>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                );
            } else {
                setRightPanelContent(
                    <div className="p-6 text-slate-500 text-center flex flex-col items-center justify-center h-full animate-in fade-in duration-500">
                        <div className="size-20 rounded-full bg-primary/5 flex items-center justify-center mb-6 border border-primary/10">
                            <span className="material-symbols-outlined text-4xl text-primary opacity-40">explore</span>
                        </div>
                        <h3 className="text-white font-serif font-black mb-2 text-xl">{mapName}</h3>
                        <p className="text-xs max-w-[200px] leading-relaxed opacity-60">Navega por el mapa e interactúa con los puntos de interés para ver detalles específicos.</p>

                        <div className="mt-12 w-full space-y-4 border-t border-white/5 pt-8">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 text-left px-2 mb-4">Herramientas Globales</h3>
                            <button onClick={() => setInteractionMode('add_layer')} className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 hover:bg-white/[0.05] hover:border-primary/20 transition-all group">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                                    <span className="material-symbols-outlined">layers</span>
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-white mb-0.5">Gestionar Multicapas</span>
                                    <span className="block text-[9px] text-slate-500 font-medium normal-case tracking-normal">Control de elevación y estratos</span>
                                </div>
                            </button>
                            <button onClick={() => setInteractionMode('add_connection')} className="w-full p-4 rounded-2xl bg-white/[0.02] border border-white/5 flex items-center gap-4 hover:bg-white/[0.05] hover:border-primary/20 transition-all group">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform shadow-lg shadow-primary/5">
                                    <span className="material-symbols-outlined">settings_ethernet</span>
                                </div>
                                <div className="text-left">
                                    <span className="block text-[10px] font-black uppercase tracking-widest text-white mb-0.5">Relaciones N:M</span>
                                    <span className="block text-[9px] text-slate-500 font-medium normal-case tracking-normal">Conectar territorios y zonas</span>
                                </div>
                            </button>
                        </div>
                    </div>
                );
            }
        }
    }, [selectedMarker, localMap, interactionMode, newLayerUrl, newLayerName, connectionSource]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            setRightPanelContent(null);
            setRightPanelTitle(null);
            setRightOpen(false);
        };
    }, []);

    const handleMarkerClick = (marker) => {
        if (interactionMode === 'add_connection') {
            if (!connectionSource) {
                // Selecciona el primer nodo
                setConnectionSource(marker);
            } else {
                // Evita conectar consigo mismo
                if (connectionSource.id !== marker.id) {
                    const label = prompt("Nombre de la ruta/relación (Opcional):", "Camino");
                    if (label !== null) {
                        const newConn = {
                            sourceId: connectionSource.id,
                            targetId: marker.id,
                            label: label,
                            color: '#6366f1',
                            weight: 3,
                            dashed: false
                        };
                        saveMapAttributes({ ...mapAttributes, connections: [...connections, newConn] });
                    }
                }
                setConnectionSource(null);
            }
        } else {
            setSelectedMarker(marker);
            setRightOpen(true);
        }
    };

    return (
        <div className="flex-1 flex overflow-hidden bg-background-dark font-sans text-slate-300 relative">
            {/* Map Canvas - Added relative z-0 to avoid overlapping panel */}
            <main className="flex-1 overflow-hidden relative group z-0">
                <div className="absolute inset-4 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-surface-dark">
                    {/* Interactive Leaflet Map */}
                    {mapImage ? (
                        <LeafletMapView
                            mapImage={mapImage}
                            markers={markers}
                            layers={layers}
                            connections={connections}
                            onMarkerClick={handleMarkerClick}
                            imageWidth={imageWidth}
                            imageHeight={imageHeight}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                            <div className="text-center space-y-4">
                                <span className="material-symbols-outlined text-6xl opacity-20">map</span>
                                <p>{t('maps.not_found')}</p>
                                <p className="text-xs text-slate-600">{t('maps.upload_desc')}</p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Floating Map Title & Actions - REMOVED per user request, moved to panel */}
            </main>
        </div>
    );
};

const InhabitantRow = ({ name, role }) => (
    <div className="flex items-center gap-4 p-3 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all cursor-pointer group">
        <Avatar name={name} size="sm" className="border-white/10 group-hover:border-primary/50 transition-all" />
        <div className="flex-1 min-w-0">
            <h4 className="text-xs font-bold text-white truncate">{name}</h4>
            <p className="text-[10px] text-slate-500 font-medium truncate">{role}</p>
        </div>
        <span className="material-symbols-outlined text-slate-700 text-sm group-hover:text-white transition-colors">chevron_right</span>
    </div>
);

export default InteractiveMapView;
