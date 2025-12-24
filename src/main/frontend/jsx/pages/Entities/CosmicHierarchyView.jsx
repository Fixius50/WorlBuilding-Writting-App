import React from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

const CosmicHierarchyView = () => {
    return (
        <div className="flex-1 flex overflow-hidden bg-background-dark font-sans text-slate-300">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col p-12 overflow-y-auto custom-scrollbar relative">
                <header className="mb-12 space-y-4">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] tracking-widest uppercase">
                        <span className="material-symbols-outlined text-sm">grid_view</span>
                        <span>Universo Alpha</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span>Galaxia AndrÃ³meda</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-white">Sistema Solar</span>
                    </div>

                    <div className="flex justify-between items-start">
                        <div className="space-y-4 max-w-3xl">
                            <div className="flex items-center gap-3 px-3 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 inline-block">
                                <span className="material-symbols-outlined text-[14px]">sunny</span>
                                <span className="text-[9px] font-black uppercase tracking-widest">Sistema Planetario</span>
                                <span className="text-[9px] font-bold text-slate-600 tracking-widest ml-2">ID: SYS-SOL-001</span>
                            </div>
                            <h1 className="text-6xl font-manrope font-black text-white tracking-tight">Sistema Solar</h1>
                            <p className="text-slate-400 text-lg leading-relaxed">
                                Sistema planetario principal ubicado en el Brazo de OriÃ³n, hogar de la Ãºnica vida biolÃ³gica compleja confirmada en el sector galÃ¡ctico Alpha-9.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button className="p-3 rounded-2xl bg-white/5 hover:bg-red-500/10 text-slate-500 hover:text-red-400 border border-white/5 transition-all outline-none">
                                <span className="material-symbols-outlined">delete</span>
                            </button>
                            <Button variant="primary" icon="save">Guardar</Button>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column: Attributes & Tags */}
                    <div className="lg:col-span-1 space-y-8">
                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">sell</span>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Etiquetas</h4>
                                <span className="ml-auto text-[9px] font-bold text-slate-600 px-1.5 py-0.5 rounded bg-white/5">3 ACTIVAS</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                <Tag label="Estrella Tipo G" color="amber" icon="star" />
                                <Tag label="Vida Confirmada" color="emerald" icon="tempest" />
                                <Tag label="Rico en Agua" color="cyan" icon="water_drop" />
                                <button className="size-8 rounded-full border border-dashed border-white/10 flex items-center justify-center text-slate-600 hover:text-white hover:border-white/30 transition-all">+</button>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">analytics</span>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Atributos Principales</h4>
                                <button className="ml-auto text-slate-600 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">settings</span></button>
                            </div>

                            <div className="space-y-4">
                                <Attribute label="Forma / Estructura" value="HeliosfÃ©rica EstÃ¡ndar" icon="hive" />
                                <Attribute label="ComposiciÃ³n" value="HidrÃ³geno (74%), Helio (24%)" icon="experiment" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Attribute label="Edad (AÃ±os)" value="4.6 MM" unit="AÃ±os" />
                                    <Attribute label="Ciclo Orbital" value="230 MM" unit="AÃ±os" />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-4">
                            <div className="flex items-center gap-2">
                                <span className="material-symbols-outlined text-primary text-lg">menu_book</span>
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Notas de Lore</h4>
                            </div>
                            <textarea
                                className="w-full h-48 bg-white/5 border border-white/5 rounded-[2rem] p-6 text-sm text-slate-400 placeholder:text-slate-700 focus:border-primary/50 outline-none transition-all resize-none leading-relaxed italic shadow-inner"
                                defaultValue="El sistema contiene un cinturÃ³n de asteroides inusualmente denso entre el 4Âº y 5Âº planeta. Se teoriza que es el remanente de una colisiÃ³n planetaria antigua conocida como 'El Gran Impacto' en las escrituras sagradas de los habitantes de Terra."
                            />
                        </section>
                    </div>

                    {/* Right Column: Internal Content List */}
                    <div className="lg:col-span-2">
                        <GlassPanel className="h-full border-white/5 bg-surface-dark/40 overflow-hidden flex flex-col shadow-2xl">
                            <header className="p-8 border-b border-white/5 flex justify-between items-center">
                                <div className="flex items-center gap-4">
                                    <div className="size-10 rounded-xl bg-primary/20 text-primary flex items-center justify-center">
                                        <span className="material-symbols-outlined">hub</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg tracking-tight">Contenido Interno (Planetas)</h3>
                                        <p className="text-[10px] font-medium text-slate-500 mt-0.5">Arrastra para reordenar la jerarquÃa orbital</p>
                                    </div>
                                </div>
                                <div className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                                    <div className="size-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                                    8 Entidades
                                </div>
                            </header>

                            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-3">
                                <PlanetRow name="Mercurio" type="Rocoso" stats="430Â°C | 88 DÃas" icon="public" />
                                <PlanetRow name="Venus" type="AtmÃ³sfera" stats="462Â°C | 225 DÃas" icon="public" />
                                <PlanetRow name="Tierra" type="Habitable" stats="8B Hab | 1 Luna" icon="public" active />
                                <PlanetRow name="Marte" type="Desierto" stats="-60Â°C | 2 Lunas" icon="public" />
                                <PlanetRow name="CinturÃ³n Asteroides" type="Anillo" stats=">1M Obj" icon="grain" />
                            </div>

                            <div className="p-8 bg-black/20 border-t border-white/5">
                                <button className="w-full py-4 rounded-[1.5rem] border-2 border-dashed border-white/10 text-slate-500 hover:text-white hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em]">
                                    <span className="material-symbols-outlined">add</span>
                                    AÃ±adir Nueva Entidad
                                </button>
                            </div>
                        </GlassPanel>
                    </div>
                </div>
            </main>
        </div>
    );
};

const Tag = ({ label, color, icon }) => (
    <div className={`px-4 py-1.5 rounded-xl bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg`}>
        <span className="material-symbols-outlined text-[14px]">{icon}</span>
        {label}
    </div>
);

const Attribute = ({ label, value, unit, icon }) => (
    <div className="space-y-2">
        <p className="text-[9px] font-black uppercase tracking-widest text-slate-600 ml-1">{label}</p>
        <div className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-3.5 flex items-center justify-between group hover:border-white/10 transition-all">
            <div className="flex items-center gap-3">
                {icon && <span className="material-symbols-outlined text-slate-500 text-lg group-hover:text-primary transition-colors">{icon}</span>}
                <span className="text-sm font-bold text-slate-300">{value}</span>
            </div>
            {unit && <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">{unit}</span>}
        </div>
    </div>
);

const PlanetRow = ({ name, type, stats, icon, active }) => (
    <div className={`group flex items-center gap-6 p-4 rounded-2xl transition-all cursor-pointer ${active ? 'bg-primary/10 border border-primary/20 shadow-xl' : 'hover:bg-white/5 border border-transparent'}`}>
        <span className="material-symbols-outlined text-slate-700 group-hover:text-slate-500">drag_indicator</span>
        <div className={`size-12 rounded-xl flex items-center justify-center ${active ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'bg-surface-dark border border-white/5 text-slate-500'}`}>
            <span className="material-symbols-outlined text-3xl">{icon}</span>
        </div>
        <div className="flex-1">
            <div className="flex items-center gap-3">
                <h4 className="text-sm font-bold text-white group-hover:text-primary transition-colors">{name}</h4>
                <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-white/5 text-slate-600'}`}>{type}</span>
            </div>
        </div>
        <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-1.5 text-slate-500">
                <span className="material-symbols-outlined text-[12px]">analytics</span>
                <span className="text-[10px] font-mono tracking-tight group-hover:text-slate-300">{stats}</span>
            </div>
        </div>
        <div className="flex gap-2 ml-4">
            <button className="p-2 rounded-lg text-slate-700 hover:text-white hover:bg-white/5 transition-all"><span className="material-symbols-outlined text-xl">edit_note</span></button>
            {active ? (
                <button className="size-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg"><span className="material-symbols-outlined text-lg">arrow_forward</span></button>
            ) : (
                <button className="p-2 rounded-lg text-slate-700 hover:text-white hover:bg-white/5 transition-all"><span className="material-symbols-outlined text-xl">open_in_new</span></button>
            )}
        </div>
    </div>
);

export default CosmicHierarchyView;
