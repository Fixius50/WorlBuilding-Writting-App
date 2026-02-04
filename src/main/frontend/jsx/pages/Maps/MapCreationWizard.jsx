import React, { useState } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Button from '../../components/common/Button';

const MapCreationWizard = ({ onCancel, onCreate }) => {
    const [step, setStep] = useState(1);
    const [mapType, setMapType] = useState('regional');
    const [canvasSource, setCanvasSource] = useState('upload');
    const [uploadedFile, setUploadedFile] = useState(null);
    const [mapName, setMapName] = useState('');
    const fileInputRef = React.useRef(null);

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
        onCreate(canvasSource, mapName || 'Nuevo Mapa', uploadedFile);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background-dark/80 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="w-full max-w-4xl max-h-[90vh] overflow-y-auto no-scrollbar relative animate-in zoom-in-95 duration-500">
                <GlassPanel className="p-0 border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] overflow-hidden">
                    {/* Header */}
                    <header className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center">
                                <span className="material-symbols-outlined text-2xl">add_location_alt</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-manrope font-black text-white tracking-tight">Crear Nuevo Mapa / Zona</h1>
                                <p className="text-xs text-slate-500 font-medium">Configura los detalles para tu nueva entrada cartográfica.</p>
                            </div>
                        </div>
                        <button onClick={onCancel} className="text-slate-500 hover:text-white transition-colors">
                            <span className="material-symbols-outlined">close</span>
                        </button>
                    </header>

                    {/* Content */}
                    <div className="p-12 space-y-12">
                        {/* Step 1: Identity */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${step === 1 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/10 text-slate-500'}`}>1</div>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Identidad y Jerarquía</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pl-12">
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Nombre del Mapa</label>
                                    <input
                                        type="text"
                                        placeholder="ej. La Costa de Zafiro"
                                        value={mapName}
                                        onChange={(e) => setMapName(e.target.value)}
                                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary/50 transition-all outline-none"
                                    />
                                </div>
                                <div className="space-y-1.5 row-span-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Descripción</label>
                                    <textarea
                                        placeholder="Breve descripción de la geografía, clima o importancia..."
                                        className="w-full h-[120px] bg-white/5 border border-white/5 rounded-2xl p-4 text-sm text-white focus:border-primary/50 outline-none transition-all resize-none"
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">Zona Padre (Opcional)</label>
                                    <select className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary/50 outline-none appearance-none">
                                        <option>Ninguna (Nivel Superior)</option>
                                        <option>Reino de Aethelgard</option>
                                        <option>Continente de Aurum</option>
                                    </select>
                                    <p className="text-[9px] text-slate-500 italic mt-1 ml-1 text-primary/70">Seleccionar un padre convierte esto en sub-zona.</p>
                                </div>
                            </div>
                        </section>

                        <div className="h-px w-full bg-white/5"></div>

                        {/* Step 2: Map Type */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${step === 2 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/10 text-slate-500'}`}>2</div>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Tipo de Mapa</h2>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pl-12">
                                <TypeCard
                                    active={mapType === 'world'}
                                    onClick={() => setMapType('world')}
                                    icon="public"
                                    label="Mapa Mundial"
                                    desc="Continentes, océanos, escala global."
                                />
                                <TypeCard
                                    active={mapType === 'regional'}
                                    onClick={() => setMapType('regional')}
                                    icon="map"
                                    label="Mapa Regional"
                                    desc="Reinos, provincias, biomas."
                                />
                                <TypeCard
                                    active={mapType === 'local'}
                                    onClick={() => setMapType('local')}
                                    icon="location_city"
                                    label="Ciudad / Local"
                                    desc="Ciudades, mazmorras, mapas de batalla."
                                />
                            </div>
                        </section>

                        <div className="h-px w-full bg-white/5"></div>

                        {/* Step 3: Canvas Source */}
                        <section className="space-y-6">
                            <div className="flex items-center gap-4">
                                <div className={`size-8 rounded-full flex items-center justify-center text-[10px] font-black ${step === 3 ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-white/10 text-slate-500'}`}>3</div>
                                <h2 className="text-sm font-black uppercase tracking-[0.2em] text-white">Fuente del Lienzo</h2>
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
                                    active={canvasSource === 'upload'}
                                    onClick={handleUploadClick}
                                    icon="cloud_upload"
                                    label={uploadedFile ? uploadedFile.name : "Cargar Archivo de Imagen"}
                                    desc={uploadedFile ? "Archivo seleccionado" : "Arrastra y suelta o haz clic para buscar"}
                                    subdesc="JPG, PNG, WEBP • MAX 25MB"
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
                    <footer className="p-8 bg-white/[0.02] border-t border-white/5 flex justify-between items-center">
                        <button onClick={onCancel} className="text-sm font-bold text-slate-500 hover:text-white transition-colors">Cancelar</button>
                        <div className="flex items-center gap-6">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-600">Cambios guardados localmente</span>
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

const InputField = ({ label, placeholder }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-600 ml-1">{label}</label>
        <input
            type="text"
            placeholder={placeholder}
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary/50 transition-all outline-none"
        />
    </div>
);

const TypeCard = ({ active, onClick, icon, label, desc }) => (
    <div
        onClick={onClick}
        className={`p-6 rounded-3xl border transition-all cursor-pointer group ${active ? 'bg-primary/10 border-primary shadow-lg shadow-primary/10' : 'bg-white/5 border-white/5 hover:border-white/10'}`}
    >
        <div className={`size-10 rounded-xl mb-4 flex items-center justify-center transition-all ${active ? 'bg-primary text-white' : 'bg-white/5 text-slate-500 group-hover:text-slate-300'}`}>
            <span className="material-symbols-outlined">{icon}</span>
        </div>
        <h3 className={`text-sm font-bold mb-1 transition-colors ${active ? 'text-white' : 'text-slate-400 group-hover:text-slate-200'}`}>{label}</h3>
        <p className="text-[10px] text-slate-500 leading-relaxed font-medium">{desc}</p>
    </div>
);

const SourceCard = ({ active, onClick, icon, label, desc, subdesc }) => (
    <div
        onClick={onClick}
        className={`p-10 rounded-[2.5rem] border transition-all cursor-pointer group flex flex-col items-center text-center gap-4 ${active ? 'bg-primary/5 border-primary shadow-lg' : 'bg-white/[0.02] border-white/5 hover:border-white/10 hover:bg-white/[0.04]'}`}
    >
        <div className={`size-16 rounded-[2rem] flex items-center justify-center transition-all ${active ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'bg-white/5 text-slate-600 group-hover:text-slate-400'}`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <div className="space-y-1">
            <h3 className={`font-bold transition-colors ${active ? 'text-white' : 'text-slate-400'}`}>{label}</h3>
            <p className="text-xs text-slate-500 font-medium">{desc}</p>
        </div>
        <div className="flex gap-2 mt-2">
            {subdesc.split('•').map((s, i) => (
                <span key={i} className="px-2 py-1 rounded bg-black/20 text-[8px] font-black text-slate-600 tracking-tighter uppercase whitespace-nowrap">{s.trim()}</span>
            ))}
        </div>
    </div>
);

export default MapCreationWizard;
