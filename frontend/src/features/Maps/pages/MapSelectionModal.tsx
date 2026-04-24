import React from 'react';
import GlassPanel from '@atoms/GlassPanel';

const MapSelectionModal = ({ maps, onSelect, onCreateNew, onClose }: { maps: any[], onSelect: (map: any) => void, onCreateNew: () => void, onClose: () => void }) => {
 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 animate-in fade-in duration-300">
 <div className="w-full max-w-3xl animate-in zoom-in-95 duration-500">
 <GlassPanel className="overflow-hidden border-foreground/40 shadow-2xl">
 <header className="p-6 border-b border-foreground/10 flex justify-center gap-12 text-center items-center bg-white/[0.02]">
 <div className="flex items-center gap-3">
 <span className="material-symbols-outlined text-primary">map</span>
 <h2 className="text-xl font-manrope font-black text-foreground">Cartografía del Proyecto</h2>
 </div>
 <button onClick={onClose} className="text-foreground/60 hover:text-foreground transition-colors">
 <span className="material-symbols-outlined">close</span>
 </button>
 </header>

 <div className="p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[60vh] overflow-y-auto custom-scrollbar">
 {/* Create New Card */}
 <div
 onClick={onCreateNew}
 className="group p-6 rounded-none border-2 border-dashed border-foreground/10 hover:border-primary/50 hover:bg-primary/5 transition-all cursor-pointer flex flex-col items-center justify-center text-center gap-3"
 >
 <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
 <span className="material-symbols-outlined">add</span>
 </div>
 <div>
 <h3 className="text-sm font-bold text-foreground">Nuevo Mapa</h3>
 <p className="text-[10px] text-foreground/60 uppercase font-black tracking-tighter">Crear desde cero</p>
 </div>
 </div>

 {/* Existing Maps */}
 {maps.map(map => {
 // Get map preview image (Sanitize DuckDNS or broken placeholders)
 let previewImage = map.attributes?.snapshotUrl || map.attributes?.bgImage || map.iconUrl;
 if (previewImage && (previewImage.includes('duckdns') || previewImage.includes('nopreview'))) {
 previewImage = null;
 }

 return (
 <div
 key={map.id}
 onClick={() => onSelect(map)}
 className="group p-4 rounded-none monolithic-panel hover:border-primary/50 hover:bg-foreground/10 transition-all cursor-pointer space-y-3"
 >
 <div className={`aspect-video rounded-none border border-foreground/10 flex items-center justify-center overflow-hidden relative ${!previewImage ? 'bg-gradient-to-br from-slate-800 to-black' : 'sunken-panel'}`}>
 {previewImage ? (
 <img
 src={previewImage}
 alt={map.nombre}
 className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
 />
 ) : (
 <>
 <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #ffffff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
 <span className="material-symbols-outlined text-4xl opacity-20 group-hover:opacity-40 transition-opacity text-primary">map</span>
 </>
 )}
 </div>
 <div>
 <h3 className="text-sm font-bold text-foreground truncate">{map.nombre}</h3>
 <p className="text-[10px] text-foreground/60 uppercase font-black tracking-tighter">
 {map.attributes?.layers?.length || 0} capas
 </p>
 </div>
 </div>
 );
 })}
 </div>

 <footer className="p-6 bg-white/[0.02] border-t border-foreground/10 flex justify-end">
 <p className="text-[10px] text-foreground/60 font-bold uppercase tracking-widest">Selecciona un mapa para cargar el visor</p>
 </footer>
 </GlassPanel>
 </div>
 </div>
 );
};

export default MapSelectionModal;
