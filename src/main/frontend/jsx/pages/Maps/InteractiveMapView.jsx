import React, { useState } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

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

    // Convert Editor Layers to Viewable Markers
    // This is a basic mapping. In the future, we might want dedicated "pins" layer.
    // For now, we'll strip out texts or specific shapes if we want them as markers, 
    // BUT the editor draws them on the canvas. 
    // The previous implementation used an overlay. 
    // Since the editor "burns" drawing into the conceptual map, we probably just want to show the IMAGE for now.
    // OR if we saved layers separately (we did), we could render them.
    // Let's stick to just the image for this pass to fix the "default map" issue, 
    // as the user's created map is likely just an image + drawings.

    const markers = []; // TODO: Parse 'point of interest' from map.attributes.layers if we add that feature.

    return (
        <div className="flex-1 flex overflow-hidden bg-background-dark font-sans text-slate-300 relative">
            {/* Map Canvas */}
            <main className="flex-1 overflow-hidden relative group">
                <div className="absolute inset-4 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-2xl bg-surface-dark">
                    {/* World Map Background */}
                    {/* World Map Background */}
                    {mapImage ? (
                        <img
                            src={mapImage}
                            alt={mapName}
                            className="w-full h-full object-contain bg-black/20"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-500">
                            Map Image Not Found
                        </div>
                    )}

                    {/* Markers Overlay */}
                    <div className="absolute inset-0">
                        {markers.map(marker => (
                            <div
                                key={marker.id}
                                onClick={() => setSelectedMarker(marker)}
                                className={`absolute size-10 -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-125 z-10 ${selectedMarker?.id === marker.id ? 'scale-125' : ''}`}
                                style={{ left: marker.x, top: marker.y }}
                            >
                                <div className={`size-full rounded-2xl ${marker.color} border-4 border-background-dark shadow-[0_0_20px_rgba(0,0,0,0.5)] flex items-center justify-center text-white relative group/marker`}>
                                    <span className="material-symbols-outlined text-lg">{marker.type === 'location' ? 'fort' : marker.type === 'region' ? 'terrain' : 'skull'}</span>

                                    {/* Tooltip Label */}
                                    <div className="absolute top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-surface-dark border border-white/10 text-[9px] font-black uppercase tracking-widest text-white whitespace-nowrap opacity-0 group-hover/marker:opacity-100 transition-opacity">
                                        {marker.name}
                                    </div>

                                    {/* Pulse Effect */}
                                    <div className={`absolute -inset-2 rounded-[1.5rem] opacity-20 animate-ping -z-10 ${marker.color}`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Left Floating Controls */}
                <aside className="absolute left-12 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
                    <GlassPanel className="p-2 flex flex-col gap-2 rounded-2xl border-white/10 bg-surface-dark/40 backdrop-blur-2xl shadow-2xl">
                        <MapControlButton icon="near_me" active />
                        <MapControlButton icon="location_on" />
                        <MapControlButton icon="brush" />
                        <MapControlButton icon="layers" />
                        <div className="w-8 h-px bg-white/10 mx-auto my-1"></div>
                        <MapControlButton icon="tune" />
                    </GlassPanel>
                </aside>

                {/* Zoom Indicator */}
                <div className="absolute bottom-12 left-12 z-20 px-4 py-2 rounded-xl bg-black/40 border border-white/10 backdrop-blur-md text-[10px] font-black tracking-widest text-slate-400">
                    125%
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
                                    <h2 className="text-3xl font-manrope font-black text-white tracking-tight leading-none">{selectedMarker.name}</h2>
                                    <button className="text-slate-500 hover:text-white transition-colors p-2 rounded-xl hover:bg-white/5"><span className="material-symbols-outlined">edit</span></button>
                                </div>
                                <p className="text-sm text-slate-400 leading-relaxed font-manrope">
                                    La antigua sede de los Magos de Fuego, erigida sobre la caldera inactiva del Monte Ignis. Sus muros están imbuidos de magia protectora.
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
