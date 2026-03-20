import React from 'react';
import GlassPanel from '../../../components/common/GlassPanel';
import Avatar from '../../../components/common/Avatar';
import Button from '../../../components/common/Button';

const CosmicHierarchyView = () => {
 return (
 <div className="flex-1 flex overflow-hidden bg-background font-sans text-foreground/60">
 {/* Main Content Area */}
 <main className="flex-1 flex flex-col p-12 overflow-y-auto custom-scrollbar relative">
 <header className="mb-12 space-y-4">
 <div className="flex items-center gap-2 text-foreground/60 font-bold text-[10px] tracking-widest uppercase">
 <span className="material-symbols-outlined text-sm">grid_view</span>
 <span>Universo Alpha</span>
 <span className="material-symbols-outlined text-sm">chevron_right</span>
 <span>Galaxia AndrÃ³meda</span>
 <span className="material-symbols-outlined text-sm">chevron_right</span>
 <span className="text-foreground">Sistema Solar</span>
 </div>

 <div className="flex justify-between items-start">
 <div className="space-y-4 max-w-3xl">
 <div className="flex items-center gap-3 px-3 py-1 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 inline-block">
 <span className="material-symbols-outlined text-[14px]">sunny</span>
 <span className="text-[9px] font-black uppercase tracking-widest">Sistema Planetario</span>
 <span className="text-[9px] font-bold text-foreground/60 tracking-widest ml-2">ID: SYS-SOL-001</span>
 </div>
 <h1 className="text-6xl font-manrope font-black text-foreground tracking-tight">Sistema Solar</h1>
 <p className="text-foreground/60 text-lg leading-relaxed">
 Sistema planetario principal ubicado en el Brazo de OriÃ³n, hogar de la Ãºnica vida biolÃ³gica compleja confirmada en el sector galÃ¡ctico Alpha-9.
 </p>
 </div>
 <div className="flex gap-3">
 <button className="p-3 rounded-none bg-foreground/5 hover:bg-red-500/10 text-foreground/60 hover:text-red-400 border border-foreground/10 transition-all outline-none">
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
 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">Etiquetas</h4>
 <span className="ml-auto text-[9px] font-bold text-foreground/60 px-1.5 py-0.5 rounded bg-foreground/5">3 ACTIVAS</span>
 </div>
 <div className="flex flex-wrap gap-2">
 <Tag label="Estrella Tipo G" color="amber" icon="star" />
 <Tag label="Vida Confirmada" color="emerald" icon="tempest" />
 <Tag label="Rico en Agua" color="cyan" icon="water_drop" />
 <button className="size-8 rounded-full border border-dashed border-foreground/40 flex items-center justify-center text-foreground/60 hover:text-foreground hover:border-foreground/40 transition-all">+</button>
 </div>
 </section>

 <section className="space-y-6">
 <div className="flex items-center gap-2">
 <span className="material-symbols-outlined text-primary text-lg">analytics</span>
 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">Atributos Principales</h4>
 <button className="ml-auto text-foreground/60 hover:text-foreground transition-colors"><span className="material-symbols-outlined text-lg">settings</span></button>
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
 <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60">Notas de Lore</h4>
 </div>
 <textarea
 className="w-full h-48 monolithic-panel rounded-[2rem] p-6 text-sm text-foreground/60 placeholder:text-foreground/60 focus:border-primary/50 outline-none transition-all resize-none leading-relaxed italic shadow-inner"
 defaultValue="El sistema contiene un cinturÃ³n de asteroides inusualmente denso entre el 4Âº y 5Âº planeta. Se teoriza que es el remanente de una colisiÃ³n planetaria antigua conocida como 'El Gran Impacto' en las escrituras sagradas de los habitantes de Terra."
 />
 </section>
 </div>

 {/* Right Column: Internal Content List */}
 <div className="lg:col-span-2">
 <GlassPanel className="h-full border-foreground/10 monolithic-panel/40 overflow-hidden flex flex-col shadow-2xl">
 <header className="p-8 border-b border-foreground/10 flex justify-between items-center">
 <div className="flex items-center gap-4">
 <div className="size-10 rounded-none bg-primary/20 text-primary flex items-center justify-center">
 <span className="material-symbols-outlined">hub</span>
 </div>
 <div>
 <h3 className="font-bold text-foreground text-lg tracking-tight">Contenido Interno (Planetas)</h3>
 <p className="text-[10px] font-medium text-foreground/60 mt-0.5">Arrastra para reordenar la jerarquÃa orbital</p>
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

 <div className="p-8 bg-background/20 border-t border-foreground/10">
 <button className="w-full py-4 rounded-[1.5rem] border-2 border-dashed border-foreground/40 text-foreground/60 hover:text-foreground hover:border-primary/50 hover:bg-primary/5 transition-all flex items-center justify-center gap-3 font-black uppercase text-[10px] tracking-[0.2em]">
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
 <div className={`px-4 py-1.5 rounded-none bg-${color}-500/10 text-${color}-400 border border-${color}-500/20 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest shadow-lg`}>
 <span className="material-symbols-outlined text-[14px]">{icon}</span>
 {label}
 </div>
);

const Attribute = ({ label, value, unit, icon }) => (
 <div className="space-y-2">
 <p className="text-[9px] font-black uppercase tracking-widest text-foreground/60 ml-1">{label}</p>
 <div className="w-full monolithic-panel rounded-none px-5 py-3.5 flex items-center justify-between group hover:border-foreground/40 transition-all">
 <div className="flex items-center gap-3">
 {icon && <span className="material-symbols-outlined text-foreground/60 text-lg group-hover:text-primary transition-colors">{icon}</span>}
 <span className="text-sm font-bold text-foreground/60">{value}</span>
 </div>
 {unit && <span className="text-[10px] font-black text-foreground/60 uppercase tracking-widest">{unit}</span>}
 </div>
 </div>
);

const PlanetRow = ({ name, type, stats, icon, active }) => (
 <div className={`group flex items-center gap-6 p-4 rounded-none transition-all cursor-pointer ${active ? 'bg-primary/10 border border-primary/20 shadow-xl' : 'hover:bg-foreground/5 border border-transparent'}`}>
 <span className="material-symbols-outlined text-foreground/60 group-hover:text-foreground/60">drag_indicator</span>
 <div className={`size-12 rounded-none flex items-center justify-center ${active ? 'bg-primary text-foreground shadow-lg shadow-primary/30' : 'monolithic-panel border border-foreground/10 text-foreground/60'}`}>
 <span className="material-symbols-outlined text-3xl">{icon}</span>
 </div>
 <div className="flex-1">
 <div className="flex items-center gap-3">
 <h4 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors">{name}</h4>
 <span className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-widest ${active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-foreground/5 text-foreground/60'}`}>{type}</span>
 </div>
 </div>
 <div className="flex flex-col items-end gap-1">
 <div className="flex items-center gap-1.5 text-foreground/60">
 <span className="material-symbols-outlined text-[12px]">analytics</span>
 <span className="text-[10px] font-mono tracking-tight group-hover:text-foreground/60">{stats}</span>
 </div>
 </div>
 <div className="flex gap-2 ml-4">
 <button className="p-2 rounded-none text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all"><span className="material-symbols-outlined text-xl">edit_note</span></button>
 {active ? (
 <button className="size-8 rounded-full bg-primary text-foreground flex items-center justify-center shadow-lg"><span className="material-symbols-outlined text-lg">arrow_forward</span></button>
 ) : (
 <button className="p-2 rounded-none text-foreground/60 hover:text-foreground hover:bg-foreground/5 transition-all"><span className="material-symbols-outlined text-xl">open_in_new</span></button>
 )}
 </div>
 </div>
);

export default CosmicHierarchyView;
