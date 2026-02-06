import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useOutletContext } from 'react-router-dom';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import LeafletMapView from '../../components/maps/LeafletMapView';

const InteractiveMapView = ({ map }) => {
    const { t } = useLanguage();
    const [selectedMarker, setSelectedMarker] = useState(null);
    const { setRightPanelContent, setRightOpen } = useOutletContext();
    const mapName = map?.nombre || t('maps.explorer');

    // Resolve Map Image: attributes.bgImage -> attributes.snapshotUrl -> iconUrl -> fallback
    const mapAttributes = map?.attributes || {};

    // Check for legacy description JSON if attributes are empty
    let legacyData = {};
    if (!mapAttributes.bgImage && map?.descripcion && map?.descripcion.startsWith('{')) {
        try { legacyData = JSON.parse(map.descripcion); } catch (e) { }
    }

    let mapImage = mapAttributes.bgImage || legacyData.bgImage || map?.iconUrl || null;
    if (mapImage && (mapImage.toLowerCase().includes('duckdns') || mapImage.toLowerCase().includes('nopreview'))) {
        mapImage = null;
    }

    // Get markers from attributes
    const markers = mapAttributes.markers || [];

    // Get image dimensions (default to 1920x1080 if not specified)
    const imageWidth = mapAttributes.imageWidth || 1920;
    const imageHeight = mapAttributes.imageHeight || 1080;

    // Push content to global panel whenever selectedMarker changes
    useEffect(() => {
        if (selectedMarker) {
            setRightPanelContent(
                <div className="flex flex-col h-full gap-8 p-6 animate-in slide-in-from-right-4 duration-300">
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
                            <h2 className="text-3xl font-black text-white leading-none mb-2">{selectedMarker.label || 'Ubicación Desconocida'}</h2>
                            <p className="text-slate-500 font-medium text-sm leading-relaxed">{selectedMarker.description || 'Sin descripción disponible.'}</p>
                        </div>
                    </header>
                    {/* More details here... */}
                    <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar">
                        <section className="space-y-4">
                            <div className="flex justify-between items-center px-1">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{t('maps.inhabitants')}</h3>
                                <button className="text-[10px] font-bold text-primary hover:underline transition-all">{t('maps.view_all')}</button>
                            </div>
                            {/* Placeholder inhabitants */}
                            <div className="space-y-3">
                                <InhabitantRow name="Personaje A" role="Rol A" />
                            </div>
                        </section>
                    </div>
                </div>
            );
            setRightOpen(true);
        } else {
            setRightPanelContent(
                <div className="p-6 text-slate-500 text-center flex flex-col items-center justify-center h-full">
                    <span className="material-symbols-outlined text-6xl mb-4 opacity-20">map</span>
                    <h3 className="text-white font-bold mb-2 text-xl">{mapName}</h3>
                    <p className="text-sm max-w-[200px]">Selecciona un marcador en el mapa para ver sus detalles aquí.</p>
                </div>
            );
        }
    }, [selectedMarker, map]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            setRightPanelContent(null);
            setRightOpen(false);
        };
    }, []);

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
        setRightOpen(true);
    };

    return (
        <div className="flex-1 flex overflow-hidden bg-background-dark font-sans text-slate-300 relative">
            {/* Map Canvas */}
            <main className="flex-1 overflow-hidden relative group">
                <div className="absolute inset-4 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-surface-dark">
                    {/* Interactive Leaflet Map */}
                    {mapImage ? (
                        <LeafletMapView
                            mapImage={mapImage}
                            markers={markers}
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

                {/* Floating Map Title */}
                <div className="absolute top-8 left-8 z-[1000]">
                    <GlassPanel className="px-6 py-3 border-white/10">
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary">public</span>
                            {mapName}
                        </h1>
                    </GlassPanel>
                </div>

                {/* Quick Actions */}
                <div className="absolute top-8 right-8 z-[1000] flex gap-3">
                    <button
                        onClick={() => setRightOpen(prev => !prev)}
                        className="size-12 rounded-xl bg-surface-dark/90 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 transition-all shadow-lg"
                        title="Toggle Panel"
                    >
                        <span className="material-symbols-outlined">side_navigation</span>
                    </button>
                </div>
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
