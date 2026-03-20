import React from 'react';

const LeafletMapView = () => {
 return (
 <div className="w-full h-full flex flex-col items-center justify-center bg-foreground/5 text-foreground/60 border border-foreground/10 rounded-none">
 <span className="material-symbols-outlined text-4xl mb-4 opacity-20">explore</span>
 <p className="text-sm font-medium">Map View (Leaflet) temporarily disabled.</p>
 <p className="text-[10px] text-foreground/60 mt-2 uppercase tracking-widest">Awaiting React 19 Compatibility</p>
 </div>
 );
};

export default LeafletMapView;
