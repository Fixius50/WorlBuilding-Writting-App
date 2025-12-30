import React from 'react';
import GlassPanel from '../../../components/common/GlassPanel';

const SpecializedMap = ({ entity, active }) => {
    if (!active) return null;

    return (
        <div className="w-full h-full p-4 animate-fade-in">
            <GlassPanel className="w-full h-[600px] relative overflow-hidden bg-black/40 border-white/10 group">
                {/* Simulated Map Background */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-slate-900 via-[#09090b] to-black opacity-80"></div>
                <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cartographer.png")' }}></div>

                {/* Grid Lines */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff05_1px,transparent_1px),linear-gradient(to_bottom,#ffffff05_1px,transparent_1px)] bg-[size:40px_40px]"></div>

                {/* Simulated Pins */}
                <div className="absolute top-1/3 left-1/4 flex flex-col items-center gap-2 group/pin cursor-pointer hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl text-emerald-500 drop-shadow-[0_0_15px_rgba(16,185,129,0.5)]">location_on</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-emerald-100 bg-black/50 px-2 py-1 rounded-full border border-emerald-500/30 opacity-0 group-hover/pin:opacity-100 transition-opacity">Capital City</span>
                </div>

                <div className="absolute bottom-1/3 right-1/3 flex flex-col items-center gap-2 group/pin cursor-pointer hover:scale-110 transition-transform">
                    <span className="material-symbols-outlined text-4xl text-indigo-500 drop-shadow-[0_0_15px_rgba(99,102,241,0.5)]">castle</span>
                    <span className="text-[10px] uppercase font-black tracking-widest text-indigo-100 bg-black/50 px-2 py-1 rounded-full border border-indigo-500/30 opacity-0 group-hover/pin:opacity-100 transition-opacity">Old Fortress</span>
                </div>

                {/* UI Overlay */}
                <div className="absolute top-4 left-4 flex gap-2">
                    <button className="p-2 rounded-xl bg-surface-light/80 backdrop-blur border border-glass-border hover:bg-white/10 text-white transition-all shadow-xl">
                        <span className="material-symbols-outlined">add_location</span>
                    </button>
                    <button className="p-2 rounded-xl bg-surface-light/80 backdrop-blur border border-glass-border hover:bg-white/10 text-white transition-all shadow-xl">
                        <span className="material-symbols-outlined">layers</span>
                    </button>
                </div>

                <div className="absolute bottom-4 right-4 text-xs font-mono text-white/30">
                    COORD: 45.32, -12.04 | SCALE: 1:50000
                </div>
            </GlassPanel>
        </div>
    );
};

export default SpecializedMap;
