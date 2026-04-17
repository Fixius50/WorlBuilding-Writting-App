import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';

const MapEditorSettings = ({ settings, onUpdate }) => {
 const { t } = useLanguage();

 if (!settings) return null;

 const handleChange = (key, value) => {
 onUpdate({ ...settings, [key]: value });
 };

 return (
 <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4">
 {/* Header */}
 <div className="flex items-center gap-3 text-foreground/60 mb-2">
 <span className="material-symbols-outlined">tune</span>
 <h3 className="text-xs font-black uppercase tracking-widest">{t('map.settings') || 'Settings'}</h3>
 </div>

 {/* Grid Settings */}
 <div className="space-y-4">
 <div className="flex items-center justify-between">
 <label className="text-sm font-bold text-foreground flex items-center gap-2">
 <span className="material-symbols-outlined text-foreground/60">grid_4x4</span>
 {t('map.show_grid') || 'Show Grid'}
 </label>
 <input
 type="checkbox"
 checked={settings.showGrid || false}
 onChange={(e) => handleChange('showGrid', e.target.checked)}
 className="accent-primary size-5 rounded cursor-pointer"
 />
 </div>

 {settings.showGrid && (
 <div>
 <label className="text-[10px] uppercase font-bold text-foreground/60 mb-2 block">{t('map.grid_size') || 'Grid Size'} (px)</label>
 <input
 type="range"
 min="20"
 max="200"
 step="10"
 value={settings.gridSize || 50}
 onChange={(e) => handleChange('gridSize', parseInt(e.target.value))}
 className="w-full accent-primary mb-2"
 />
 <div className="flex justify-between text-[10px] font-mono text-foreground/60">
 <span>20px</span>
 <span className="text-primary font-bold">{settings.gridSize || 50}px</span>
 <span>200px</span>
 </div>
 </div>
 )}
 </div>

 <div className="h-px bg-foreground/5 my-4"></div>

 {/* Dimensions */}
 <div className="space-y-4">
 <h4 className="text-[10px] uppercase font-bold text-foreground/60 tracking-widest mb-4 flex items-center gap-2">
 <span className="material-symbols-outlined text-sm">aspect_ratio</span>
 {t('map.dimensions') || 'Dimensions'}
 </h4>

 <div className="grid grid-cols-2 gap-4">
 <div>
 <label className="text-[10px] uppercase font-bold text-foreground/60 mb-1 block">Width</label>
 <input
 type="number"
 value={settings.width || 800}
 onChange={(e) => handleChange('width', parseInt(e.target.value))}
 className="w-full monolithic-panel rounded-none p-2 text-foreground font-mono text-xs focus:border-primary outline-none"
 />
 </div>
 <div>
 <label className="text-[10px] uppercase font-bold text-foreground/60 mb-1 block">Height</label>
 <input
 type="number"
 value={settings.height || 600}
 onChange={(e) => handleChange('height', parseInt(e.target.value))}
 className="w-full monolithic-panel rounded-none p-2 text-foreground font-mono text-xs focus:border-primary outline-none"
 />
 </div>
 </div>
 </div>

 <div className="h-px bg-foreground/5 my-4"></div>

 {/* Background Info */}
 <div className="space-y-2">
 <h4 className="text-[10px] uppercase font-bold text-foreground/60 tracking-widest mb-2 flex items-center gap-2">
 <span className="material-symbols-outlined text-sm">image</span>
 {t('map.background') || 'Background'}
 </h4>
 {settings.bgImage ? (
 <div className="w-full h-32 rounded-none border border-foreground/40 overflow-hidden relative group">
 <img src={settings.bgImage} className="w-full h-full object-cover opacity-50" />
 <div className="absolute inset-0 flex items-center justify-center">
 <span className="text-xs font-mono text-foreground/50">{settings.width}x{settings.height}</span>
 </div>
 </div>
 ) : (
 <div className="p-4 rounded-none border border-dashed border-foreground/40 text-center text-xs text-foreground/60">
 No background image
 </div>
 )}
 </div>
 </div>
 );
};

export default MapEditorSettings;
