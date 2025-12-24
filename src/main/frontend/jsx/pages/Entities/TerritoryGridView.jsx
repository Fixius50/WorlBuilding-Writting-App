import React, { useState } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

const TerritoryGridView = () => {
    return (
        <div className="flex-1 flex overflow-hidden bg-background-dark font-sans text-slate-300">
            {/* Main Content Area */}
            <main className="flex-1 flex flex-col p-12 overflow-y-auto custom-scrollbar relative">
                <header className="mb-12 space-y-4">
                    <div className="flex items-center gap-2 text-slate-500 font-bold text-[10px] tracking-widest uppercase">
                        <span>Sistema Solar</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span>Kepler-186f</span>
                        <span className="material-symbols-outlined text-sm">chevron_right</span>
                        <span className="text-white">Territorios</span>
                    </div>

                    <div className="flex justify-between items-end">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-6xl font-manrope font-black text-white tracking-tight">Kepler-186f</h1>
                                <span className="material-symbols-outlined text-4xl text-primary">public</span>
                            </div>
                            <p className="text-slate-400 text-lg max-w-2xl leading-relaxed">
                                GestiÃ³n geopolÃtica y geogrÃ¡fica de la superficie planetaria. Administra biomas, asentamientos y recursos estratÃ©gicos.
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" icon="map">Ver Atlas</Button>
                            <Button variant="primary" icon="add">Nuevo Territorio</Button>
                        </div>
                    </div>
                </header>

                <section className="space-y-8">
                    {/* Filters Toolbar */}
                    <GlassPanel className="p-2 flex items-center justify-between border-white/5">
                        <div className="flex items-center gap-4 flex-1">
                            <div className="relative flex-1 max-w-sm">
                                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">search</span>
                                <input
                                    type="text"
                                    placeholder="Buscar por nombre..."
                                    className="w-full bg-transparent border-none rounded-xl py-2 pl-9 pr-4 text-xs focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                                />
                            </div>
                            <div className="w-px h-6 bg-white/5 mx-2"></div>
                            <FilterDropdown label="Bioma: Todos" />
                            <FilterDropdown label="PoblaciÃ³n" />
                            <FilterDropdown label="Estado" />
                        </div>
                        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-lg">
                            <button className="p-1.5 rounded-md text-slate-500 hover:text-white transition-colors"><span className="material-symbols-outlined text-lg">format_list_bulleted</span></button>
                            <button className="p-1.5 rounded-md bg-white/10 text-white shadow-sm"><span className="material-symbols-outlined text-lg">grid_view</span></button>
                        </div>
                    </GlassPanel>

                    {/* Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <TerritoryCard
                            title="Nueva Neo-Tokyo"
                            desc="MetrÃ³polis vertical construida sobre las..."
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuAYF5Q6W3o1w1f1"
                            badges={['Capital']}
                            stats={['15M', 'Templado', 'Costero']}
                            color="cyan"
                        />
                        <TerritoryCard
                            title="Mar de Dunas"
                            desc="ExtensiÃ³n Ã¡rida rica en especia sÃlica..."
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuBYG6R7X4p2x2g2"
                            stats={['Hostil', 'Ãrido']}
                            color="amber"
                        />
                        <TerritoryCard
                            title="Sanctum Bio-Domo"
                            desc="InstalaciÃ³n de investigaciÃ³n..."
                            image="https://lh3.googleusercontent.com/aida-public/AB6AXuCZ H7S8Y5q3z3h3"
                            badges={['Ciencia']}
                            stats={['5K', 'Jungla']}
                            color="purple"
                        />
                        <div className="group border-2 border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center p-12 gap-4 hover:border-primary/30 hover:bg-primary/5 transition-all cursor-pointer">
                            <div className="size-16 rounded-3xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl text-slate-600 group-hover:text-primary">add_location_alt</span>
                            </div>
                            <p className="text-xs font-black uppercase tracking-widest text-slate-600 group-hover:text-white">AÃ±adir Territorio</p>
                        </div>
                    </div>
                </section>
            </main>
        </div>
    );
};

const FilterDropdown = ({ label }) => (
    <button className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-white/5 transition-all group">
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-white">{label}</span>
        <span className="material-symbols-outlined text-slate-600 text-[14px]">expand_more</span>
    </button>
);

const TerritoryCard = ({ title, desc, image, badges = [], stats = [], color }) => (
    <div className="group relative rounded-[2.5rem] overflow-hidden border border-white/5 bg-surface-dark/50 hover:border-white/10 transition-all shadow-2xl">
        <div className="h-48 overflow-hidden relative">
            <img src={image} alt={title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 opacity-60 group-hover:opacity-100" />
            <div className="absolute inset-0 bg-gradient-to-t from-surface-dark via-transparent to-transparent"></div>

            {/* Floating Badges */}
            <div className="absolute top-4 right-4 flex gap-2">
                {badges.map(b => (
                    <span key={b} className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest bg-${color === 'cyan' ? 'primary' : color === 'amber' ? 'amber-500' : 'purple-500'}/20 text-${color === 'cyan' ? 'primary' : color === 'amber' ? 'amber-400' : 'purple-400'} border border-white/10 backdrop-blur-md flex items-center gap-1.5`}>
                        <span className="material-symbols-outlined text-[12px]">{b === 'Capital' ? 'star' : 'science'}</span>
                        {b}
                    </span>
                ))}
            </div>
        </div>

        <div className="p-8 space-y-6">
            <header className="flex justify-between items-start">
                <div>
                    <h3 className="text-2xl font-manrope font-black text-white mb-2 group-hover:text-primary transition-colors">{title}</h3>
                    <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">{desc}</p>
                </div>
                <button className="p-2 text-slate-700 hover:text-white"><span className="material-symbols-outlined">more_vert</span></button>
            </header>

            <div className="flex flex-wrap gap-2">
                {stats.map(s => (
                    <div key={s} className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                        <div className={`size-1.5 rounded-full bg-${color === 'cyan' ? 'primary' : color === 'amber' ? 'amber-500' : 'purple-500'}/50`}></div>
                        {s}
                    </div>
                ))}
            </div>

            <div className="flex gap-3 pt-2">
                <button className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center justify-center gap-2 transition-all">
                    <span className="material-symbols-outlined text-sm opacity-50">edit</span> Editar
                </button>
                <button className="flex-1 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center justify-center gap-2 transition-all">
                    <span className="material-symbols-outlined text-sm opacity-50">map</span> UbicaciÃ³n
                </button>
            </div>
        </div>
    </div>
);

export default TerritoryGridView;
