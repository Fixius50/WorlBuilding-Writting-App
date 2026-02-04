import React, { useState } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import LeafletMapView from '../../components/maps/LeafletMapView';

const InteractiveMapView = ({ map }) => {
    const [selectedMarker, setSelectedMarker] = useState(null);
    const mapName = map?.nombre || 'Explorador de Mundo';

    // Resolve Map Image: attributes.bgImage -> attributes.snapshotUrl -> iconUrl -> fallback
    const mapAttributes = map?.attributes || {};

    // Check for legacy description JSON if attributes are empty
    let legacyData = {};
    if (!mapAttributes.bgImage && map?.descripcion && map?.descripcion.startsWith('{')) {
        try { legacyData = JSON.parse(map.descripcion); } catch (e) { }
    }

    const mapImage = mapAttributes.bgImage || legacyData.bgImage || map?.iconUrl || null;

    // Get markers from attributes
    const markers = mapAttributes.markers || [];

    // Get image dimensions (default to 1920x1080 if not specified)
    const imageWidth = mapAttributes.imageWidth || 1920;
    const imageHeight = mapAttributes.imageHeight || 1080;

    const handleMarkerClick = (marker) => {
        setSelectedMarker(marker);
        console.log('Marker clicked:', marker);
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
                                <p>Map Image Not Found</p>
                                <p className="text-xs text-slate-600">Upload a map image in the editor to get started</p>
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
                    <button className="size-12 rounded-xl bg-surface-dark/90 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 transition-all shadow-lg">
                        <span className="material-symbols-outlined">fullscreen</span>
                    </button>
                    <button className="size-12 rounded-xl bg-surface-dark/90 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:border-primary/50 transition-all shadow-lg">
                        <span className="material-symbols-outlined">share</span>
                    </button>
                </div>
            </main>

            {/* Right Details Panel (Slide out) */}
            <aside className={`flex-none bg-surface-dark border-l border-white/5 transition-all duration-700 relative z-30 ${selectedMarker ? 'w-96 p-8 opacity-100' : 'w-0 p-0 opacity-0 overflow-hidden'}`}>
                {selectedMarker && (
                    <div className="flex flex-col h-full gap-8 animate-in slide-in-from-right-8 duration-500">
                        <header className="space-y-6">
                            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden border border-white/10 shadow-xl group">
                                <img src="https://images.unsplash.com/photo-1533154683836-84ea7a0bc310?auto=format&fit=crop&w=500&q=80" alt="Detail" className="w-full h-full object-cover grayscale-[0.4] group-hover:grayscale-0 transition-all duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                                <div className="absolute top-4 right-4 flex gap-2">
                                    <button onClick={() => setSelectedMarker(null)} className="size-8 rounded-lg bg-black/40 border border-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-colors"><span className="material-symbols-outlined text-sm">close</span></button>
                                </div>
                                <div className="absolute bottom-4 left-4 flex gap-2">
                                    <span className="px-3 py-1 rounded bg-primary/20 text-primary border border-primary/20 text-[8px] font-black uppercase tracking-widest backdrop-blur-md">Lugar</span>
                                    <span className="px-3 py-1 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 text-[8px] font-black uppercase tracking-widest backdrop-blur-md">Capital</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex justify-between items-start">
                                    <h2 className="text-3xl font-manrope font-black text-white tracking-tight leading-none">{selectedMarker.label || selectedMarker.name}</h2>
                                    <button className="text-slate-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"><span className="material-symbols-outlined">edit</span></button>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed font-manrope">
                                    {selectedMarker.description || 'No description available'}
                                </p>
                            </div>
                        </header>

                        <div className="space-y-8 flex-1 overflow-y-auto no-scrollbar">
                            {/* Key Inhabitants */}
                            <section className="space-y-4">
                                <div className="flex justify-between items-center px-1">
                                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Habitantes Clave</h3>
                                    <button className="text-[10px] font-bold text-primary hover:underline transition-all">Ver todos</button>
                                </div>
                                <div className="space-y-3">
                                    <InhabitantRow name="Lyra Ignis" role="Gran Maga" />
                                    <InhabitantRow name="Kaelen" role="Capitán de la Guardia" />
                                </div>
                            </section>

                            {/* Related Events */}
                            <section className="space-y-4">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 px-1">Eventos Relacionados</h3>
                                <GlassPanel className="p-4 border-white/5 hover:border-white/10 transition-all cursor-pointer group">
                                    <div className="flex gap-4 items-center">
                                        <div className="size-10 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center justify-center">
                                            <span className="material-symbols-outlined text-xl">history_edu</span>
                                        </div>
                                        <div>
                                            <h4 className="text-xs font-bold text-white group-hover:text-primary transition-colors">El Asedio de Ceniza</h4>
                                            <p className="text-[10px] text-slate-500 font-medium">Hace 300 años</p>
                                        </div>
                                    </div>
                                </GlassPanel>
                            </section>
                        </div>

                        <footer className="pt-6 border-t border-white/5">
                            <Button variant="primary" icon="auto_stories" className="w-full py-4 rounded-2xl shadow-xl shadow-primary/20">
                                Abrir en la Biblia
                            </Button>
                        </footer>
                    </div>
                )}
            </aside>
        </div>
    );
};

const MapControlButton = ({ icon, active }) => (
    <button className={`size-12 rounded-xl flex items-center justify-center transition-all ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}>
        <span className="material-symbols-outlined text-xl">{icon}</span>
    </button>
);

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
