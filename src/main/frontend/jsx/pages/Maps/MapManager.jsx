import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar'; // Or similar generic
import Button from '../../components/common/Button';

const MapManager = ({ maps, onSelectMap, onCreateMap, onDeleteMap }) => {
    const { t } = useLanguage();
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMaps = maps.filter(m =>
        m.nombre.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getPreview = (map) => {
        let img = map.attributes?.snapshotUrl || map.attributes?.bgImage || map.iconUrl;
        // Robust Sanitization
        if (img && (img.toLowerCase().includes('duckdns') || img.toLowerCase().includes('nopreview'))) {
            return null;
        }
        return img;
    };

    return (
        <div className="flex-1 p-8 overflow-y-auto bg-background-dark">
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
                        <Button variant="primary" icon="add_location_alt" onClick={onCreateMap}>
                            {t('common.create') || 'Nuevo Mapa'}
                        </Button>
                    </div>
                </div>

                {/* Grid */}
                {filteredMaps.length === 0 ? (
                    <div className="flex flex-col items-center justify-center p-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01] animate-in zoom-in-95 duration-500">
                        <div className="size-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <span className="material-symbols-outlined text-4xl text-slate-600">map</span>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">No hay mapas visibles</h3>
                        <p className="text-slate-500 mb-6 text-center max-w-md">No se encontraron mapas con los filtros actuales. Comienza creando tu primer territorio.</p>
                        <Button variant="secondary" icon="add" onClick={onCreateMap}>Crear Primer Mapa</Button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in fade-in duration-700">
                        {filteredMaps.map((map, i) => {
                            const preview = getPreview(map);
                            const layersCount = map.attributes?.layers?.length || 0;
                            const markersCount = map.attributes?.markers?.length || 0;

                            return (
                                <GlassPanel
                                    key={map.id}
                                    className="group relative overflow-hidden border-white/5 hover:border-primary/50 transition-all duration-300 hover:-translate-y-1 cursor-pointer"
                                    onClick={() => onSelectMap(map)}
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
                                            <span className="shrink-0 text-[10px] font-black uppercase tracking-widest bg-white/5 text-slate-400 px-2 py-1 rounded">
                                                {map.attributes?.mapType || 'Regional'}
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
