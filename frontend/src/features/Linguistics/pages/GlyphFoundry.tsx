import React, { useState } from 'react';
import GlassPanel from '@atoms/GlassPanel';
import Button from '@atoms/Button';

const GlyphFoundry = () => {
    return (
        <div className="flex-1 flex flex-col h-full bg-background text-foreground font-serif overflow-hidden">
            {/* Zen Header */}
            <header className="h-20 border-b border-foreground/10 flex items-center justify-center gap-12 text-center px-10 monolithic-panel hover:bg-background/80 transition-colors">
                <div className="flex items-center gap-10">
                    <div className="flex flex-col">
                        <span className="text-xs uppercase tracking-widest font-bold opacity-60 font-sans">Módulo Lingüístico</span>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-2xl font-light">language</span>
                            <span className="text-2xl font-serif italic tracking-tighter">Fundición de Tipografía</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-l border-foreground/10 pl-10">
                        <span className="text-xl font-serif tracking-wide opacity-80">Diseño Tipográfico</span>
                        <div className="px-3 py-1 rounded-none border border-foreground/20 text-xs font-sans uppercase tracking-widest text-foreground/60">En Reposo</div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="material-symbols-outlined text-lg font-light">help</span>
                        <span className="text-[10px] font-sans font-bold uppercase tracking-widest">Manual Técnico</span>
                    </div>
                    <Button variant="primary" icon="save" className="rounded-none font-sans uppercase tracking-widest text-xs">
                        Guardar Fuente
                    </Button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Workshop */}
                <main className="flex-1 flex flex-col p-12 gap-12 overflow-y-auto custom-scrollbar relative">
                    <section className="space-y-6">
                        <div className="flex justify-between items-center border-b border-foreground/5 pb-4">
                            <div className="flex items-center gap-4">
                                <h3 className="text-sm font-sans font-bold uppercase tracking-widest text-foreground/80">Matriz de Símbolos Base</h3>
                            </div>
                            <div className="flex gap-4 opacity-40">
                                <span className="material-symbols-outlined text-xl font-light">grid_view</span>
                                <span className="material-symbols-outlined text-xl font-light">view_list</span>
                            </div>
                        </div>

                        <div className="p-10 sunken-panel grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
                            <GlyphSlot symbol="Δ" keyLabel="A" />
                            <GlyphSlot symbol="Θ" keyLabel="B" />
                            <GlyphSlot symbol="✔" keyLabel="C" />
                            <GlyphSlot symbol="✖" keyLabel="D" active />
                            <GlyphSlot />
                            <GlyphSlot />
                            <GlyphSlot />
                            <GlyphSlot />
                            <GlyphSlot />
                            <GlyphSlot />
                            <div className="aspect-square border border-dashed border-foreground/20 flex flex-col items-center justify-center hover:bg-foreground/5 transition-colors cursor-pointer group text-foreground/40 hover:text-foreground">
                                <span className="material-symbols-outlined font-light mb-1">add</span>
                                <span className="text-[8px] font-sans uppercase tracking-widest">Nuevo Símbolo</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-xs font-sans uppercase tracking-widest text-foreground/40">
                            <span>26 Símbolos Registrados</span>
                            <div className="flex gap-10">
                                <button className="hover:text-foreground flex items-center gap-2 transition-colors"><span className="material-symbols-outlined text-sm">tune</span> Configurar</button>
                                <button className="hover:text-foreground flex items-center gap-2 transition-colors"><span className="material-symbols-outlined text-sm">settings_input_component</span> Reglas Mapeo</button>
                            </div>
                        </div>
                    </section>

                    <section className="flex-1 flex flex-col gap-6">
                        <div className="flex items-center gap-4 border-b border-foreground/5 pb-4">
                            <h3 className="text-sm font-sans font-bold uppercase tracking-widest text-foreground/60">Pizarra de Escritura Libre</h3>
                        </div>

                        <div className="flex-1 sunken-panel flex flex-col p-12 items-center justify-center relative group min-h-[300px]">
                            <textarea
                                className="w-full h-full bg-transparent border-none outline-none text-center text-6xl font-serif tracking-widest text-foreground/40 focus:text-foreground/80 transition-colors placeholder:text-foreground/20 resize-none"
                                placeholder="Escribe aquí para probar la topología tipográfica..."
                            />

                            <div className="absolute bottom-6 right-8 flex gap-6 text-[10px] font-sans font-bold uppercase tracking-widest text-foreground/40">
                                <span>48px</span>
                                <span>Regular</span>
                                <span>UTF-8</span>
                            </div>

                            {/* Decorative Line */}
                            <div className="absolute inset-x-12 top-1/2 h-px bg-foreground/5 -translate-y-1/2 pointer-events-none"></div>
                        </div>
                    </section>
                </main>

                {/* Properties Sidebar */}
                <aside className="w-[450px] border-l border-foreground/10 p-10 flex flex-col gap-10 monolithic-panel relative z-20 overflow-y-auto">
                    <h3 className="text-xs font-sans font-bold uppercase tracking-widest text-foreground/60 border-b border-foreground/10 pb-2">Propiedades Estructurales</h3>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-foreground/60">Nombre del Sistema</label>
                            <input
                                type="text"
                                defaultValue="Alfabeto Real"
                                className="w-full bg-background border border-foreground/20 px-4 py-3 text-sm font-serif text-foreground focus:border-foreground/50 outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-foreground/60">Autor</label>
                            <input
                                type="text"
                                placeholder="Nombre del artesano o civilización"
                                className="w-full bg-background border border-foreground/20 px-4 py-3 text-sm font-serif text-foreground focus:border-foreground/50 outline-none transition-colors"
                            />
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-sans font-bold uppercase tracking-[0.2em] text-foreground/60">Formato de Exportación</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="py-3 border border-foreground/80 bg-foreground/5 text-foreground text-xs font-sans font-bold tracking-widest">.TTF</button>
                                <button className="py-3 border border-foreground/20 text-foreground/40 text-xs font-sans font-bold tracking-widest hover:border-foreground/40 hover:text-foreground transition-all">.OTF</button>
                            </div>
                        </div>

                        <div className="pt-2 space-y-4">
                            <Toggle label="Ligaduras" active />
                            <Toggle label="Kerning Automático" active />
                        </div>

                        <Button variant="primary" className="w-full py-4 mt-6 uppercase text-xs tracking-widest font-sans" icon="download">
                            Compilar Documento Tipográfico
                        </Button>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const GlyphSlot = ({ symbol, keyLabel, active }: { symbol?: string, keyLabel?: string, active?: boolean }) => (
    <div className={`aspect-square border transition-all cursor-pointer flex items-center justify-center relative group ${active ? 'bg-foreground/10 border-foreground/50 shadow-inner' : 'bg-background border-foreground/10 hover:border-foreground/30 hover:bg-foreground/5'}`}>
        <span className={`text-5xl font-serif ${active ? 'text-foreground' : 'text-foreground/40 group-hover:text-foreground/80'}`}>{symbol || '...'}</span>
        {keyLabel && (
            <span className={`absolute top-2 right-2 text-[9px] font-sans font-bold uppercase ${active ? 'text-foreground' : 'text-foreground/30 group-hover:text-foreground/60'}`}>{keyLabel}</span>
        )}
    </div>
);

const Toggle = ({ label, active }: { label: string, active: boolean }) => (
    <div className="flex justify-between items-center py-2 border-b border-foreground/5">
        <span className="text-xs font-sans uppercase tracking-widest text-foreground/80">{label}</span>
        <button className={`w-10 h-5 rounded-full p-1 transition-colors relative ${active ? 'bg-foreground/80' : 'bg-foreground/20'}`}>
            <div className={`size-3 rounded-full bg-background shadow-sm transition-transform ${active ? 'translate-x-5' : 'translate-x-0'}`}></div>
        </button>
    </div>
);

export default GlyphFoundry;
