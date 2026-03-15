import React from 'react';

const LeafletMapView = () => {
    return (
        <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900/50 text-slate-400 border border-white/5 rounded-xl">
            <span className="material-symbols-outlined text-4xl mb-4 opacity-20">explore</span>
            <p className="text-sm font-medium">Map View (Leaflet) temporarily disabled.</p>
            <p className="text-[10px] text-slate-600 mt-2 uppercase tracking-widest">Awaiting React 19 Compatibility</p>
        </div>
    );
};

export default LeafletMapView;
