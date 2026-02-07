import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useLanguage } from '../../context/LanguageContext';
import { useOutletContext } from 'react-router-dom';
import GlassPanel from '../../components/common/GlassPanel';
import Button from '../../components/common/Button';
import api from '../../../js/services/api';

const MapManager = ({ maps, onSelectMap, onCreateMap, onDeleteMap, onDuplicateMap }) => {
    const { t } = useLanguage();
    const { setRightPanelTab, setRightOpen = () => { } } = useOutletContext();
    const [searchTerm, setSearchTerm] = useState('');
    const [spatialFilter, setSpatialFilter] = useState('ALL');
    const [selectedMapId, setSelectedMapId] = useState(null);

    // Portal Target
    const portalRef = document.getElementById('global-right-panel-portal');

    const selectedMap = maps.find(m => m.id === selectedMapId);

    const filteredMaps = maps.filter(m => {
        const matchesSearch = m.nombre.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesSpatial = spatialFilter === 'ALL' || (m.attributes?.spatialLevel || 'TERRITORY') === spatialFilter;
        return matchesSearch && matchesSpatial;
    });

    const getPreview = (map) => {
        let img = map.attributes?.snapshotUrl || map.attributes?.bgImage || map.iconUrl;
        // Robust Sanitization
        if (img && (img.toLowerCase().includes('duckdns') || img.toLowerCase().includes('nopreview'))) {
            return null;
        }
        return img;
    };

    const handleUpdateMapAttribute = async (map, key, value) => {
        try {
            const updated = {
                ...map,
                attributes: {
                    ...map.attributes,
                    [key]: value
                }
            };
            await api.put(`/world-bible/entities/${map.id}`, updated);
            window.dispatchEvent(new CustomEvent('map-updated'));
        } catch (err) {
            console.error("Error updating map attribute", err);
        }
    };

    useEffect(() => {
        if (selectedMapId) {
            setRightPanelTab('CONTEXTO');
            setRightOpen(true);
        }
    }, [selectedMapId]);

    const renderRightPanel = () => (
        <div className="flex flex-col h-full bg-surface-dark animate-in slide-in-from-right duration-500">
            <div className="p-6 border-b border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">info</span> {t('atlas.map_details') || 'Detalles del Mapa'}
                    </h3>
                    <button onClick={() => setSelectedMapId(null)} className="text-slate-500 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                </div>
                <h4 className="text-lg font-serif font-black text-white truncate">{selectedMap.nombre}</h4>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                {/* Preview Area */}
                <div className="aspect-[16/9] rounded-2xl bg-black/40 border border-white/5 overflow-hidden group">
                    {getPreview(selectedMap) ? (
                        <img src={getPreview(selectedMap)} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt="Preview" />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center opacity-20">
                            <span className="material-symbols-outlined text-4xl">public</span>
                        </div>
                    )}
                </div>

                {/* Hierarchy Management */}
                <GlassPanel title="JERARQUÍA ESPACIAL" icon="layers">
                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-text-muted mb-2 block tracking-widest">Nivel de Escala</label>
                            <div className="relative">
                                <select
                                    value={selectedMap.attributes?.spatialLevel || 'TERRITORY'}
                                    onChange={(e) => handleUpdateMapAttribute(selectedMap, 'spatialLevel', e.target.value)}
                                    className="w-full appearance-none bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold text-white transition-all hover:bg-white/5 focus:border-primary outline-none"
                                >
                                    <option value="UNIVERSE">💫 UNIVERSO</option>
                                    <option value="GALAXY">🌀 GALAXIA</option>
                                    <option value="PLANET">🌍 CUERPO CELESTE</option>
                                    <option value="TERRITORY">🗺️ TERRITORIO</option>
                                    <option value="ZONE">📍 ZONA</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">expand_more</span>
                            </div>
                        </div>

                        <p className="text-[10px] text-slate-500 leading-relaxed italic">
                            Define la escala de este mapa para facilitar su búsqueda y organización en el Atlas.
                        </p>
                    </div>
                </GlassPanel>

                {/* Global Tools (Integrated from viewer) */}
                <div className="space-y-3">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-600 px-1">Herramientas Globales</h4>
                    <Button
                        variant="secondary"
                        className="w-full justify-start py-3 bg-white/[0.02] border-white/5"
                        icon="layers"
                        onClick={() => {
                            onSelectMap(selectedMap);
                        }}
                    >
                        Gestionar Multicapas
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-full justify-start py-3 bg-white/[0.02] border-white/5"
                        icon="alt_route"
                        onClick={() => {
                            onSelectMap(selectedMap);
                        }}
                    >
                        Configurar Relaciones N:M
                    </Button>
                </div>

                {/* Main Actions */}
                <div className="space-y-3 pt-4 border-t border-white/5">
                    <Button
                        variant="primary"
                        className="w-full justify-center py-4 shadow-xl shadow-primary/20"
                        icon="visibility"
                        onClick={() => onSelectMap(selectedMap)}
                    >
                        Abrir Visionador
                    </Button>
                    <div className="grid grid-cols-2 gap-3">
                        <button
                            onClick={() => onDuplicateMap(selectedMap)}
                            className="flex items-center justify-center gap-2 py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] font-black uppercase text-slate-300 transition-all border border-white/5"
                        >
                            <span className="material-symbols-outlined text-sm">content_copy</span>
                            Duplicar
                        </button>
                        <button
                            onClick={() => onDeleteMap(selectedMap)}
                            className="flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 rounded-xl text-[10px] font-black uppercase text-red-400 transition-all border border-red-500/10"
                        >
                            <span className="material-symbols-outlined text-sm">delete</span>
                            Eliminar
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );

    return (
        <div className="flex-1 flex overflow-hidden bg-background-dark">
            {portalRef && selectedMap && createPortal(renderRightPanel(), portalRef)}
            <div className="flex-1 p-8 overflow-y-auto">
                <div className="max-w-7xl mx-auto space-y-8">

                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-end gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div>
                            <h1 className="text-3xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                                <span className="material-symbols-outlined text-primary text-4xl">travel_explore</span>
                                {t('nav.atlas') || 'Atlas'}
                            </h1>
                            <p className="text-sm text-slate-400 mt-2 max-w-xl">
                                Explora los territorios cartografiados de tu mundo. Gestiona mapas regionales, calabozos y planos astrales desde este centro de comando.
                            </p>
                        </div>
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            <div className="relative">
                                <select
                                    value={spatialFilter}
                                    onChange={(e) => setSpatialFilter(e.target.value)}
                                    className="appearance-none bg-surface-dark border border-glass-border rounded-xl px-4 py-3 pr-10 text-xs font-bold text-white transition-all hover:bg-white/5 focus:border-primary outline-none"
                                >
                                    <option value="ALL">TODA LA ESCALA</option>
                                    <option value="UNIVERSE">UNIVERSO</option>
                                    <option value="GALAXY">GALAXIA</option>
                                    <option value="PLANET">CUERPO CELESTE</option>
                                    <option value="TERRITORY">TERRITORIO</option>
                                    <option value="ZONE">ZONA</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">expand_more</span>
                            </div>

                            <div className="relative flex-1 md:w-64">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500">search</span>
                                <input
                                    type="text"
                                    placeholder="Buscar mapas..."
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    className="w-full bg-black/30 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:border-primary outline-none transition-all"
                                />
                            </div>
                        </div>
                        {/* Create button removed per user request */}
                    </div>
                </div>

                {/* Grid */}
                {filteredMaps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01] animate-in zoom-in-95 duration-500">
                        <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-slate-600">map</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No hay mapas visibles</h3>
                        <p className="text-slate-500 mb-6 text-center max-w-md">No se encontraron mapas con los filtros actuales.</p>
                        {/* Create button removed per user request */}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-700 pt-12 pb-20">
                        {filteredMaps.map((map, i) => {
                            const preview = getPreview(map);
                            const layersCount = map.attributes?.layers?.length || 0;
                            const markersCount = map.attributes?.markers?.length || 0;

                            return (
                                <GlassPanel
                                    key={map.id}
                                    className={`group relative overflow-hidden border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer ${selectedMapId === map.id ? 'ring-2 ring-primary bg-primary/5' : ''}`}
                                    onClick={() => setSelectedMapId(map.id)}
                                    onDoubleClick={() => onSelectMap(map)}
                                >
                                    {/* Image Area */}
                                    <div className="aspect-[16/9] w-full bg-black/50 relative overflow-hidden border-b border-white/5">
                                        {preview ? (
                                            <img src={preview} alt={map.nombre} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-surface-light">
                                                <span className="material-symbols-outlined text-4xl text-white/10 group-hover:text-primary/50 transition-colors">public</span>
                                                {/* Decorative Grid */}
                                                <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
                                            </div>
                                        )}

                                        {/* Overlay Stats */}
                                        <div className="absolute top-2 right-2 flex gap-1 transform translate-y-[-150%] group-hover:translate-y-0 transition-transform duration-300">
                                            {onDuplicateMap && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDuplicateMap(map); }}
                                                    className="p-2 bg-black/60 hover:bg-primary text-white rounded-lg backdrop-blur-sm transition-colors"
                                                    title="Duplicar Mapa"
                                                >
                                                    <span className="material-symbols-outlined text-sm">content_copy</span>
                                                </button>
                                            )}
                                            {onDeleteMap && (
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); onDeleteMap(map); }}
                                                    className="p-2 bg-black/60 hover:bg-red-500 text-white rounded-lg backdrop-blur-sm transition-colors"
                                                    title="Eliminar Mapa"
                                                >
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    {/* Content Area */}
                                    <div className="p-5">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="font-bold text-white text-lg truncate pr-2 group-hover:text-primary transition-colors">{map.nombre}</h3>
                                            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-400 px-2 py-1 rounded border border-white/5">
                                                {map.attributes?.spatialLevel || map.attributes?.mapType || 'Territorio'}
                                            </span>
                                        </div>

                                        <div className="flex items-center gap-4 text-xs text-slate-500 font-medium mt-4">
                                            <div className="flex items-center gap-1.5" title="Capas">
                                                <span className="material-symbols-outlined text-sm">layers</span>
                                                {layersCount}
                                            </div>
                                            <div className="flex items-center gap-1.5" title="Marcadores">
                                                <span className="material-symbols-outlined text-sm">location_on</span>
                                                {markersCount}
                                            </div>
                                            <div className="flex-1 text-right text-[10px] uppercase tracking-wider opacity-50">
                                                ID: {map.id}
                                            </div>
                                        </div>
                                    </div>
                                </GlassPanel>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default MapManager;
