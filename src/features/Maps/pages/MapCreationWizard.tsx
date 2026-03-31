import React, { useState } from 'react';
import GlassPanel from '../../../components/common/GlassPanel';
import Button from '../../../components/common/Button';

interface MapCreationWizardProps {
  onCancel: () => void;
  onCreate: (
    mapName: string, 
    config: { bgImage: string; mapType: string; description: string; parentId?: number }
  ) => void;
}

const MapCreationWizard: React.FC<MapCreationWizardProps> = ({ onCancel, onCreate }) => {
  const [step, setStep] = useState(1);
  const [mapType, setMapType] = useState('TERRITORY');
  const [canvasSource, setCanvasSource] = useState('url');
  const [bgImageUrl, setBgImageUrl] = useState('');
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [mapName, setMapName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState<number | undefined>(undefined);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

 const handleFileSelect = (e) => {
 const file = e.target.files?.[0];
 if (file && file.type.startsWith('image/')) {
 setUploadedFile(file);
 setCanvasSource('upload');
 }
 };

 const handleUploadClick = () => {
 fileInputRef.current?.click();
 };

  const handleCreate = () => {
    if (canvasSource === 'upload' && uploadedFile) {
      const reader = new FileReader();
      reader.onload = (e) => {
        onCreate(mapName, {
          bgImage: e.target?.result as string,
          mapType,
          description,
          parentId
        });
      };
      reader.readAsDataURL(uploadedFile);
    } else {
      onCreate(mapName, {
        bgImage: canvasSource === 'url' ? bgImageUrl : 'placeholder-map.png',
        mapType,
        description,
        parentId
      });
    }
  };


 return (
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 animate-in fade-in duration-300">
 <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar relative animate-in zoom-in-95 duration-500">
 <GlassPanel className="p-0 border-foreground/40 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
 {/* Header */}
 <header className="p-8 border-b border-foreground/10 flex justify-center gap-12 text-center items-center bg-white/[0.02]">
 <div className="flex items-center gap-4">
 <div className="size-12 rounded-none bg-primary/20 text-primary flex items-center justify-center">
 <span className="material-symbols-outlined text-2xl">add_location_alt</span>
 </div>
 <div>
 <h1 className="text-2xl font-manrope font-black text-foreground tracking-tight">Crear Nuevo Mapa / Zona</h1>
 <p className="text-xs text-foreground/60 font-medium">Configura los detalles para tu nueva entrada cartográfica.</p>
 </div>
 </div>
 <button onClick={onCancel} className="text-foreground/60 hover:text-foreground transition-colors">
 <span className="material-symbols-outlined">close</span>
 </button>
 </header>

 {/* Content */}
 <div className="p-12 space-y-12">
 {/* Step 1: Identity */}
 <section className="space-y-6">
 <div className="flex items-center gap-4">
 <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${step === 1 ? 'bg-primary text-foreground shadow-lg shadow-primary/30' : 'bg-foreground/10 text-foreground/60'}`}>1</div>
 <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Identidad y Jerarquía</h2>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-12">
 <div className="space-y-1.5">
 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60 ml-1">Nombre del Mapa</label>
 <input
 type="text"
 placeholder="ej. La Costa de Zafiro"
 value={mapName}
 onChange={(e) => setMapName(e.target.value)}
 className="w-full monolithic-panel rounded-none px-4 py-3 text-sm text-foreground focus:border-primary/50 transition-all outline-none"
 />
 </div>
 <div className="space-y-1.5 row-span-2">
 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60 ml-1">Descripción</label>
  <textarea
    placeholder="Breve descripción de la geografía, clima o importancia..."
    value={description}
    onChange={(e) => setDescription(e.target.value)}
    className="w-full h-[120px] monolithic-panel rounded-none p-4 text-sm text-foreground focus:border-primary/50 outline-none transition-all resize-none"
  />

 </div>
 <div className="space-y-1.5">
 <label className="text-[10px] font-black uppercase tracking-widest text-foreground/60 ml-1">Zona Padre (Opcional)</label>
  <select 
    value={parentId || ''}
    onChange={(e) => setParentId(e.target.value ? Number(e.target.value) : undefined)}
    className="w-full monolithic-panel rounded-none px-4 py-3 text-sm text-foreground focus:border-primary/50 outline-none appearance-none"
  >
    <option value="" className="bg-[#1a1a20] text-foreground">Ninguna (Nivel Superior)</option>
    {/* Dynamic options would go here */}
  </select>
 <p className="text-[9px] text-foreground/60 italic mt-1 ml-1 text-primary/70">Seleccionar un padre convierte esto en sub-zona.</p>
 </div>
 </div>
 </section>

 <div className="h-px w-full bg-foreground/5"></div>

 {/* Step 2: Map Type */}
 <section className="space-y-6">
 <div className="flex items-center gap-4">
 <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${step === 2 ? 'bg-primary text-foreground shadow-lg shadow-primary/30' : 'bg-foreground/10 text-foreground/60'}`}>2</div>
 <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Tipo de Mapa</h2>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-12">
  <TypeCard
    active={mapType === 'PLANET'}
    onClick={() => setMapType('PLANET')}
    icon="public"
    label="Mundo / Planeta"
    desc="Continentes, océanos, escala global."
  />
  <TypeCard
    active={mapType === 'TERRITORY'}
    onClick={() => setMapType('TERRITORY')}
    icon="map"
    label="Territorio / Región"
    desc="Reinos, provincias, biomas."
  />
  <TypeCard
    active={mapType === 'ZONE'}
    onClick={() => setMapType('ZONE')}
    icon="location_city"
    label="Zona / Local"
    desc="Ciudades, mazmorras, mapas de batalla."
  />

 </div>
 </section>

 <div className="h-px w-full bg-foreground/5"></div>

 {/* Step 3: Canvas Source */}
 <section className="space-y-6">
 <div className="flex items-center gap-4">
 <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${step === 3 ? 'bg-primary text-foreground shadow-lg shadow-primary/30' : 'bg-foreground/10 text-foreground/60'}`}>3</div>
 <h2 className="text-sm font-black uppercase tracking-[0.2em] text-foreground">Fuente del Lienzo</h2>
 </div>
 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pl-12">
 <input
 ref={fileInputRef}
 type="file"
 accept="image/*"
 onChange={handleFileSelect}
 className="hidden"
 />
  <SourceCard
    active={canvasSource === 'url'}
    onClick={() => setCanvasSource('url')}
    icon="language"
    label="URL Externa"
    desc="Enlazar una imagen desde la web"
    subdesc="Perfecto para imágenes grandes"
  />
  <SourceCard
    active={canvasSource === 'upload'}
    onClick={handleUploadClick}
    icon="cloud_upload"
    label={uploadedFile ? uploadedFile.name : "Archivo Local"}
    desc={uploadedFile ? "Archivo seleccionado" : "Subir desde tu equipo (Baja Res)"}
    subdesc="Base64 • MAX 5MB Recomendado"
  />

 <SourceCard
 active={canvasSource === 'blank'}
 onClick={() => setCanvasSource('blank')}
 icon="brush"
 label="Lienzo en Blanco"
 desc="Crear un nuevo dibujo desde cero"
 subdesc="4096 px x 4096 px"
 />
 </div>
 </section>
 </div>

 {/* Footer */}
 <footer className="p-8 bg-white/[0.02] border-t border-foreground/10 flex justify-between items-center">
 <button onClick={onCancel} className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors">Cancelar</button>
 <div className="flex items-center gap-6">
 <span className="text-[9px] font-black uppercase tracking-widest text-foreground/60">Cambios guardados localmente</span>
 <Button
 variant="primary"
 className="px-10 py-3 shadow-xl"
 onClick={handleCreate}
 >
 Crear Mapa
 </Button>
 </div>
 </footer>
 </GlassPanel>
 </div>
 </div>
 );
};



const TypeCard: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string; desc: string }> = ({ active, onClick, icon, label, desc }) => (
  <div
    onClick={onClick}
    className={`p-6 rounded-none border transition-all cursor-pointer group ${active ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' : 'bg-foreground/5 border-foreground/10 hover:border-foreground/40'}`}
  >
    <div className={`size-10 rounded-none mb-4 flex items-center justify-center transition-all ${active ? 'bg-primary text-foreground' : 'bg-foreground/5 text-foreground/60 group-hover:text-foreground/60'}`}>
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <h3 className={`text-sm font-bold mb-1 transition-colors ${active ? 'text-foreground' : 'text-foreground/60 group-hover:text-foreground/60'}`}>{label}</h3>
    <p className="text-[10px] text-foreground/60 leading-relaxed font-medium">{desc}</p>
  </div>
);

const SourceCard: React.FC<{ active: boolean; onClick: () => void; icon: string; label: string; desc: string; subdesc: string }> = ({ active, onClick, icon, label, desc, subdesc }) => (
  <div
    onClick={onClick}
    className={`p-10 rounded-[2.5rem] border transition-all cursor-pointer group flex flex-col items-center text-center gap-4 ${active ? 'bg-primary/5 border-primary shadow-lg' : 'bg-white/[0.02] border-foreground/10 hover:border-foreground/40 hover:bg-white/[0.04]'}`}
  >
    <div className={`size-16 rounded-[2rem] flex items-center justify-center transition-all ${active ? 'bg-primary text-foreground shadow-xl shadow-primary/20' : 'bg-foreground/5 text-foreground/60 group-hover:text-foreground/60'}`}>
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </div>
    <div className="space-y-1">
      <h3 className={`font-bold transition-colors ${active ? 'text-foreground' : 'text-foreground/60'}`}>{label}</h3>
      <p className="text-xs text-foreground/60 font-medium">{desc}</p>
    </div>
    <div className="flex gap-2 mt-2">
      {subdesc.split('•').map((s, i) => (
        <span key={i} className="px-2 py-1 rounded bg-background/20 text-[8px] font-black text-foreground/60 tracking-tighter uppercase whitespace-nowrap">{s.trim()}</span>
      ))}
    </div>
  </div>
);

export default MapCreationWizard;
