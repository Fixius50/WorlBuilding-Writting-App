import React, { useState, useEffect } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Button from '../../components/common/Button';
import api from '../../services/api';

const TimelineView = () => {
    const [zoom, setZoom] = useState(1);
    const [events, setEvents] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEvents();
    }, []);

    const loadEvents = async () => {
        setLoading(true);
        try {
            const data = await api.get('/timeline/eventos');
            setEvents(data.map(e => ({
                id: e.id,
                trackId: (e.tipo?.length % 3) + 1 || 1, // Simple hash for track
                year: parseInt(e.fechaInGame) || (e.ordenCronologico * 10),
                title: e.titulo,
                desc: e.descripcion
            })));
        } catch (err) {
            console.error("Error loading events:", err);
        } finally {
            setLoading(false);
        }
    };

    const tracks = [
        { id: 1, name: 'General History', color: 'bg-primary' },
        { id: 2, name: 'Personal Events', color: 'bg-amber-500' },
        { id: 3, name: 'Cosmic Shifts', color: 'bg-emerald-500' }
    ];

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050508] text-slate-300 font-sans overflow-hidden">
            <header className="h-20 flex-none border-b border-white/5 flex items-center justify-between px-12 bg-surface-dark/40 backdrop-blur-xl z-20">
                <div>
                    <h2 className="text-3xl font-manrope font-black text-white tracking-tight">Master Timeline</h2>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Project: Nebula • Chronos Axis</p>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4 px-4 py-2 rounded-xl bg-white/5 border border-white/5">
                        <button onClick={() => setZoom(Math.max(0.5, zoom - 0.1))} className="material-symbols-outlined text-slate-500 hover:text-white transition-colors">zoom_out</button>
                        <span className="text-[10px] font-black w-10 text-center">{Math.round(zoom * 100)}%</span>
                        <button onClick={() => setZoom(Math.min(2, zoom + 0.1))} className="material-symbols-outlined text-slate-500 hover:text-white transition-colors">zoom_in</button>
                    </div>
                    <Button variant="primary" icon="history_edu">Add Event</Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden relative">
                {loading && (
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center">
                        <div className="text-primary animate-pulse font-black uppercase tracking-widest">Chronos syncing...</div>
                    </div>
                )}
                {/* Track Headers (Left) */}
                <aside className="w-64 border-r border-white/5 bg-black/40 backdrop-blur-xl z-10 flex flex-col py-20 gap-8">
                    {tracks.map(track => (
                        <div key={track.id} className="h-32 flex items-center px-8 border-y border-transparent hover:bg-white/5 transition-all group cursor-pointer">
                            <div className={`size-1.5 rounded-full ${track.color} mr-4`}></div>
                            <span className="text-xs font-bold text-slate-400 group-hover:text-white">{track.name}</span>
                        </div>
                    ))}
                    <button className="mx-8 mt-4 py-4 rounded-2xl border-2 border-dashed border-white/5 text-slate-600 hover:text-white hover:border-primary/30 transition-all flex items-center justify-center gap-2">
                        <span className="material-symbols-outlined text-sm">add</span>
                        <span className="text-[9px] font-black uppercase tracking-widest">New Track</span>
                    </button>
                </aside>

                {/* Timeline Grid */}
                <div className="flex-1 overflow-x-auto overflow-y-hidden custom-scrollbar bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat relative">
                    {/* Year Labels Top */}
                    <div className="h-20 flex items-end pb-4 border-b border-white/5 min-w-[3000px] sticky top-0 bg-black/40 backdrop-blur-md z-10">
                        {Array.from({ length: 20 }).map((_, i) => (
                            <div key={i} className="w-40 flex-none flex flex-col items-center">
                                <span className="text-[9px] font-black text-slate-600 mb-2">{i * 50} AE</span>
                                <div className="w-px h-2 bg-white/20"></div>
                            </div>
                        ))}
                    </div>

                    {/* Infinite Grid Background */}
                    <div className="absolute inset-0 opacity-[0.03] pointer-events-none min-w-[3000px]" style={{ backgroundImage: 'linear-gradient(90deg, white 1px, transparent 1px)', backgroundSize: '40px 100%' }}></div>

                    <div className="py-20 flex flex-col gap-8 min-w-[3000px] relative">
                        {tracks.map(track => (
                            <div key={track.id} className="h-32 relative border-b border-white/5 last:border-none">
                                {events.filter(e => e.trackId === track.id).map(event => (
                                    <div
                                        key={event.id}
                                        className="absolute top-1/2 -translate-y-1/2 group cursor-pointer"
                                        style={{ left: `${event.year * 3}px` }}
                                    >
                                        <div className={`size-4 rounded-full ${track.color} border-4 border-background-dark shadow-lg group-hover:scale-125 transition-all`}></div>

                                        {/* Card Popup */}
                                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-64 opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 pointer-events-none z-20">
                                            <GlassPanel className="p-4 rounded-2xl border-white/10 shadow-2xl bg-surface-dark/90 backdrop-blur-xl">
                                                <div className="flex justify-between items-center mb-2">
                                                    <span className="text-[8px] font-black text-primary uppercase tracking-widest">{event.year} AE</span>
                                                    <span className="material-symbols-outlined text-xs text-slate-600">open_in_new</span>
                                                </div>
                                                <h4 className="text-sm font-bold text-white mb-1">{event.title}</h4>
                                                <p className="text-[10px] text-slate-400 leading-relaxed line-clamp-2">{event.desc}</p>
                                            </GlassPanel>
                                            <div className="size-3 bg-surface-dark/90 rotate-45 border-r border-b border-white/10 mx-auto -mt-1.5"></div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ))}
                    </div>

                    {/* Time Slider (Interactive Mock) */}
                    <div className="absolute left-[400px] top-0 bottom-0 w-[2px] bg-primary/40 shadow-[0_0_10px_rgba(99,102,242,0.5)] z-20 pointer-events-none">
                        <div className="absolute top-20 left-1/2 -translate-x-1/2 px-2 py-1 rounded bg-primary text-white text-[8px] font-black">133 AE</div>
                    </div>
                </div>

                {/* Event Sidebar (Right) */}
                <aside className="w-80 border-l border-white/5 bg-surface-dark/40 backdrop-blur-xl flex flex-col p-8 gap-10">
                    <header className="flex justify-between items-center">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Event Inspector</h3>
                        <button className="text-slate-600 hover:text-white"><span className="material-symbols-outlined text-sm">filter_list</span></button>
                    </header>

                    <div className="space-y-6">
                        <div className="p-6 rounded-3xl bg-primary/10 border border-primary/20 space-y-4">
                            <h4 className="text-lg font-bold text-white">The Great Sealing</h4>
                            <p className="text-xs text-slate-400 leading-relaxed">The event that redefined magic use across the three continents. Led by the Magus Council.</p>
                            <Button variant="secondary" size="sm" className="w-full text-[10px] py-3 uppercase tracking-widest">Edit in Bible</Button>
                        </div>

                        <div className="space-y-4">
                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-600">Related Entities</h5>
                            <div className="flex flex-wrap gap-2">
                                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300">Council of mages</span>
                                <span className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300">Aethelgard</span>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

export default TimelineView;
