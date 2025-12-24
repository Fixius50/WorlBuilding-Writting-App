import React, { useState } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Button from '../../components/common/Button';

const GlyphFoundry = () => {
    return (
        <div className="flex-1 flex flex-col h-full bg-[#050B0D] text-[#00E5FF] font-mono overflow-hidden">
            {/* Cyber Header */}
            <header className="h-20 border-b border-[#00E5FF]/20 flex items-center justify-between px-10 bg-black/40 backdrop-blur-xl">
                <div className="flex items-center gap-10">
                    <div className="flex flex-col">
                        <span className="text-[10px] opacity-40 uppercase tracking-[0.4em] font-bold">Datastream_Nav</span>
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-2xl">language</span>
                            <span className="text-2xl font-black italic tracking-tighter">Chronos Atlas</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4 border-l border-[#00E5FF]/20 pl-10">
                        <span className="text-3xl font-black tracking-[0.2em] italic opacity-80">DIGITAL RUNE COMPILER</span>
                        <div className="px-3 py-1 rounded-sm bg-[#00E5FF]/10 border border-[#00E5FF]/30 text-[10px] font-black uppercase tracking-widest animate-pulse">Data Ready</div>
                    </div>
                </div>

                <div className="flex items-center gap-8">
                    <div className="flex items-center gap-2 opacity-60 hover:opacity-100 transition-opacity cursor-pointer">
                        <span className="material-symbols-outlined text-lg">help</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Protocol</span>
                    </div>
                    <button className="flex items-center gap-3 px-6 py-2.5 bg-[#00E5FF] text-black font-black uppercase text-xs tracking-widest rounded-sm hover:shadow-[0_0_20px_rgba(0,229,255,0.4)] transition-all">
                        <span className="material-symbols-outlined">save</span>
                        Commit Data
                    </button>
                    <div className="size-10 rounded-full bg-gradient-to-tr from-[#00E5FF] to-blue-600 border border-white/20 shadow-lg"></div>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Main Workshop */}
                <main className="flex-1 flex flex-col p-12 gap-12 overflow-y-auto no-scrollbar relative">
                    {/* Scan Progress Bar Mock */}
                    <div className="absolute top-0 left-0 w-full h-[2px] bg-white/5 overflow-hidden">
                        <div className="h-full bg-[#00E5FF] w-[64%] shadow-[0_0_10px_#00E5FF]"></div>
                    </div>

                    <section className="space-y-6">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="size-2 bg-[#00E5FF] rounded-full shadow-[0_0_10px_#00E5FF]"></div>
                                <h3 className="text-sm font-black uppercase tracking-[0.4em]">Glyph Set (Scan)</h3>
                            </div>
                            <div className="flex gap-4 opacity-40">
                                <span className="material-symbols-outlined text-xl">grid_view</span>
                                <span className="material-symbols-outlined text-xl">view_list</span>
                            </div>
                        </div>

                        <div className="p-10 rounded-sm border border-[#00E5FF]/10 bg-[#00E5FF]/[0.02] grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-6">
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
                            <div className="aspect-square rounded shadow-inner border border-dashed border-[#00E5FF]/20 flex items-center justify-center hover:bg-[#00E5FF]/5 transition-colors cursor-pointer group">
                                <span className="material-symbols-outlined opacity-20 group-hover:opacity-100 transition-opacity">add</span>
                            </div>
                        </div>

                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-[0.2em] opacity-40">
                            <span>26 Glyphs Mapped</span>
                            <div className="flex gap-10">
                                <button className="hover:text-[#00E5FF] flex items-center gap-2"><span className="material-symbols-outlined text-sm">tune</span> Manage</button>
                                <button className="hover:text-[#00E5FF] flex items-center gap-2"><span className="material-symbols-outlined text-sm">settings_input_component</span> Ranges</button>
                            </div>
                        </div>
                    </section>

                    <section className="flex-1 flex flex-col gap-6">
                        <div className="flex items-center gap-4">
                            <div className="size-2 bg-[#00E5FF] rounded-full shadow-[0_0_10px_#00E5FF] opacity-40"></div>
                            <h3 className="text-sm font-black uppercase tracking-[0.4em] opacity-40">Live Preview Stream</h3>
                        </div>

                        <div className="flex-1 rounded-sm border border-[#00E5FF]/10 bg-black/40 flex flex-col p-12 items-center justify-center relative group min-h-[300px]">
                            <div className="absolute top-4 left-4 text-[8px] opacity-20 uppercase tracking-widest font-black">Buffer Status: Active</div>

                            <textarea
                                className="w-full h-full bg-transparent border-none outline-none text-center text-7xl font-bold tracking-widest text-[#00E5FF]/10 group-hover:text-[#00E5FF]/40 transition-all placeholder:text-[#00E5FF]/5 resize-none italic"
                                placeholder="Input your data stream here..."
                            />

                            <div className="absolute bottom-6 right-8 flex gap-6 text-[8px] font-black uppercase tracking-widest opacity-20">
                                <span>48px</span>
                                <span>Regular</span>
                                <span>UTF-8</span>
                            </div>

                            {/* Decorative Grid Lines */}
                            <div className="absolute inset-x-12 top-1/2 h-px bg-[#00E5FF]/10 -translate-y-1/2 pointer-events-none"></div>
                        </div>
                    </section>
                </main>

                {/* Cyber Sidebar */}
                <aside className="w-[450px] border-l border-[#00E5FF]/10 p-10 flex flex-col gap-10 bg-black/40 backdrop-blur-xl relative z-20">
                    <h3 className="text-xs font-black uppercase tracking-[0.4em] opacity-60 mb-2">Configuration Matrix</h3>

                    <GlassPanel className="p-8 border-[#00E5FF]/20 bg-[#00E5FF]/[0.02] space-y-8 rounded-sm">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E5FF]/60 block ml-1">Font Name</label>
                            <input
                                type="text"
                                defaultValue="NEURALINK CIPHER"
                                className="w-full bg-black/60 border border-[#00E5FF]/30 px-6 py-4 text-xs font-black text-[#00E5FF] focus:border-[#00E5FF] outline-none transition-all tracking-widest uppercase italic"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E5FF]/60 block ml-1">Author / Metadata</label>
                            <input
                                type="text"
                                placeholder="YOUR SYNTHETIC ID"
                                className="w-full bg-black/60 border border-[#00E5FF]/30 px-6 py-4 text-xs font-black text-[#00E5FF] focus:border-[#00E5FF] outline-none transition-all tracking-widest uppercase italic"
                            />
                        </div>

                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00E5FF]/60 block ml-1">Format</label>
                            <div className="grid grid-cols-2 gap-4">
                                <button className="py-4 border border-[#00E5FF] bg-[#00E5FF]/10 text-[#00E5FF] text-xs font-black tracking-widest shadow-[0_0_15px_rgba(0,229,255,0.2)]">.TTF</button>
                                <button className="py-4 border border-[#00E5FF]/20 text-[#00E5FF]/40 text-xs font-black tracking-widest hover:border-[#00E5FF]/40 transition-all">.OTF</button>
                            </div>
                        </div>

                        <div className="pt-4 space-y-6">
                            <Toggle label="Ligatures" active />
                            <Toggle label="Kerning" active />
                        </div>

                        <button className="w-full py-6 mt-6 bg-gradient-to-r from-blue-600 to-fuchsia-500 text-white font-black uppercase text-xs tracking-[0.3em] flex items-center justify-center gap-4 hover:shadow-[0_0_30px_rgba(255,0,255,0.3)] transition-all animate-pulse">
                            <span className="material-symbols-outlined text-lg">download</span>
                            Compile & Download
                        </button>
                    </GlassPanel>

                    <div className="flex-1 flex flex-col gap-6 opacity-30 pointer-events-none">
                        <div className="flex justify-between text-[10px] uppercase font-black">
                            <span>Compiler Logs</span>
                            <span>V2.0.4</span>
                        </div>
                        <div className="flex-1 border border-[#00E5FF]/10 bg-black/20 p-6 flex flex-col font-mono text-[9px] gap-2 overflow-hidden">
                            <p>[SCN] Initializing Glyph Buffer...</p>
                            <p>[MAP] Vector data detected for U+0394</p>
                            <p>[SYS] Memory allocation optimized</p>
                            <p className="animate-pulse">_</p>
                        </div>
                    </div>
                </aside>
            </div>
        </div>
    );
};

const GlyphSlot = ({ symbol, keyLabel, active }) => (
    <div className={`aspect-square rounded border transition-all cursor-pointer flex items-center justify-center relative group ${active ? 'bg-[#00E5FF]/20 border-[#00E5FF] shadow-[0_0_20px_rgba(0,229,255,0.3)]' : 'bg-black/40 border-[#00E5FF]/10 hover:border-[#00E5FF]/40'}`}>
        <span className={`text-3xl font-serif ${active ? 'text-white' : 'opacity-20 group-hover:opacity-60'}`}>{symbol || '...'}</span>
        {keyLabel && (
            <span className={`absolute top-1 right-1 text-[8px] font-black uppercase ${active ? 'text-[#00E5FF]/80' : 'opacity-20'}`}>{keyLabel}</span>
        )}
    </div>
);

const Toggle = ({ label, active }) => (
    <div className="flex justify-between items-center">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-60">{label}</span>
        <button className={`w-12 h-6 rounded-full p-1 transition-colors relative ${active ? 'bg-[#00E5FF]/40' : 'bg-white/5'}`}>
            <div className={`size-4 rounded-full bg-[#00E5FF] shadow-[0_0_10px_#00E5FF] transition-transform ${active ? 'translate-x-6' : 'translate-x-0'}`}></div>
        </button>
    </div>
);

export default GlyphFoundry;
