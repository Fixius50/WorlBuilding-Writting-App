import React, { useState, useEffect } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import api from '../../../js/services/api';

const LinguisticsHub = () => {
    const [projectName, setProjectName] = useState('Loading...');
    const [stats, setStats] = useState({ words: 0, rules: 0, glyphs: 0 });
    const [langName, setLangName] = useState('Standard Tongue');

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const proj = await api.get('/bd/proyecto-activo');
            setProjectName(proj.nombreProyecto);

            const conlangStats = await api.get('/conlang/stats');
            setStats(conlangStats);

            const langs = await api.get('/conlang/lenguas');
            if (langs && langs.length > 0) {
                setLangName(langs[0].nombre);
            }
        } catch (err) {
            console.error("Error loading conlang data:", err);
            setProjectName("Default Project");
        }
    };

    return (
        <div className="flex-1 flex flex-col h-full bg-[#0a0a0f] text-slate-300 font-sans overflow-y-auto no-scrollbar p-12 lg:p-16 gap-16">

            {/* Project Header */}
            <header className="space-y-6">
                <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                    <span>{projectName}</span>
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                    <span className="text-white">Conlang: {langName}</span>
                </nav>

                <div className="flex justify-between items-start">
                    <div className="space-y-4 max-w-2xl">
                        <h1 className="text-6xl font-manrope font-black text-white tracking-tight">{langName}</h1>
                        <p className="text-lg text-slate-400 leading-relaxed">
                            A conlang belonging to {projectName}. Manage its lexicon, grammar rules, and writing systems here.
                        </p>
                        <div className="flex gap-4 pt-2">
                            <span className="px-3 py-1 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[9px] font-black uppercase tracking-widest">Complete: 45%</span>
                            <span className="px-3 py-1 rounded bg-primary/10 text-primary border border-primary/20 text-[9px] font-black uppercase tracking-widest">Type: Agglutinative</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 text-slate-500 border-r border-white/5 pr-6 mr-2">
                            <span className="material-symbols-outlined text-sm animate-pulse text-emerald-500">save</span>
                            <span className="text-[10px] font-bold">Auto-Saved</span>
                            <span className="material-symbols-outlined hover:text-white transition-colors cursor-pointer">dark_mode</span>
                        </div>
                        <Button variant="primary" icon="add" size="md">Create Element</Button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                {/* Left: Lexicon */}
                <section className="xl:col-span-2 space-y-8">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl">menu_book</span>
                            <h3 className="text-xl font-bold text-white tracking-tight">Lexicon</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-primary transition-all cursor-pointer">View All ({stats.words})</span>
                    </div>

                    <GlassPanel className="p-0 border-white/5 bg-surface-dark/40 overflow-hidden shadow-2xl">
                        <div className="p-4 border-b border-white/5 flex items-center gap-4">
                            <div className="flex-1 relative">
                                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-600 text-lg">search</span>
                                <input
                                    type="text"
                                    placeholder="Search word or meaning..."
                                    className="w-full bg-white/5 border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-xs focus:ring-1 focus:ring-primary/30 outline-none transition-all"
                                />
                            </div>
                            <button className="size-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-500 hover:text-white transition-all"><span className="material-symbols-outlined text-xl">tune</span></button>
                        </div>

                        <div className="p-6 space-y-4">
                            <LexiconItem word="Ael'or" type="noun" gender="neutral" def="Starlight; specifically the light from the twin moons." />
                            <LexiconItem word="Vexi" type="verb" gender="transitive" def="To weave magic; to create something from nothing." />
                            <LexiconItem word="Dra'kan" type="adj" gender="" def="Ancient; belonging to the era of dragons." />
                        </div>

                        <div className="p-6 bg-black/20 border-t border-white/5">
                            <button className="w-full py-4 rounded-3xl border-2 border-dashed border-white/5 text-slate-600 hover:text-white hover:border-primary/50 hover:bg-primary/5 transition-all text-[10px] font-black uppercase tracking-[0.2em] flex items-center justify-center gap-3">
                                <span className="material-symbols-outlined">add</span>
                                Add New Word
                            </button>
                        </div>
                    </GlassPanel>
                </section>

                {/* Right: Grammar Rules */}
                <section className="space-y-8">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl">architecture</span>
                            <h3 className="text-xl font-bold text-white tracking-tight">Grammar Rules</h3>
                        </div>
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest hover:text-primary transition-all cursor-pointer">Manage</span>
                    </div>

                    <div className="space-y-4">
                        <RuleCard
                            title="Sentence Structure"
                            status="active"
                            statusColor="emerald"
                            desc="Standard order is SOV (Subject-Object-Verb), but poetry uses VSO for emphasis on action."
                            tags={['Syntax', 'Basic']}
                        />
                        <RuleCard
                            title="Noun Declensions"
                            status="pending"
                            statusColor="amber"
                            desc="Seven cases marked by suffixes. Pluralization shifts the stress to the final syllable."
                            tags={['Morphology']}
                        />

                        <button className="w-full h-32 rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-2 text-slate-600 hover:text-white hover:border-primary/30 hover:bg-primary/5 transition-all">
                            <span className="material-symbols-outlined">add_circle</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Define New Rule</span>
                        </button>
                    </div>
                </section>
            </div>

            {/* Bottom Row: Writing System & Phonology */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-12">
                {/* Writing System */}
                <section className="space-y-8">
                    <div className="flex justify-between items-center px-2">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined text-primary text-2xl">draw</span>
                            <h3 className="text-xl font-bold text-white tracking-tight">Writing System</h3>
                        </div>
                        <div className="flex gap-2 text-slate-600">
                            <button className="p-1 rounded hover:bg-white/5 hover:text-white"><span className="material-symbols-outlined text-lg">grid_view</span></button>
                            <button className="p-1 rounded hover:bg-white/5 hover:text-white"><span className="material-symbols-outlined text-lg">title</span></button>
                        </div>
                    </div>

                    <GlassPanel className="p-8 border-white/5 bg-surface-dark/40 rounded-[3rem] space-y-8 shadow-2xl">
                        <div className="flex justify-between items-start">
                            <div>
                                <h4 className="text-2xl font-black text-white tracking-tight mb-1">Moon Script</h4>
                                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Abugida • Left-to-Right</p>
                            </div>
                            <Button variant="secondary" size="sm" className="bg-primary/10 border-primary/20 text-primary">Open Editor</Button>
                        </div>

                        <div className="grid grid-cols-6 gap-3">
                            {['α', 'β', 'γ', 'δ', 'ε'].map(glyph => (
                                <div key={glyph} className="aspect-square rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-3xl font-serif text-white hover:bg-white/10 transition-all cursor-pointer">
                                    {glyph}
                                </div>
                            ))}
                            <div className="aspect-square rounded-2xl border-2 border-dashed border-white/5 flex items-center justify-center text-slate-600 hover:border-primary/50 hover:text-white transition-all cursor-pointer">
                                <span className="material-symbols-outlined">add</span>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-[8px] font-black uppercase tracking-widest text-slate-600">
                                <span>Glyph Set</span>
                                <span>24/32 Completed</span>
                            </div>
                            <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[75%] rounded-full shadow-[0_0_10px_rgba(99,102,242,0.5)]"></div>
                            </div>
                        </div>
                    </GlassPanel>
                </section>

                {/* Phonology & Translator */}
                <section className="space-y-8">
                    <div className="flex items-center gap-3 px-2">
                        <span className="material-symbols-outlined text-primary text-2xl">graphic_eq</span>
                        <h3 className="text-xl font-bold text-white tracking-tight">Translator & Phonology</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Real-time Translator */}
                        <GlassPanel className="p-8 border-primary/20 bg-primary/5 rounded-[3rem] space-y-6 shadow-2xl shadow-primary/10">
                            <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary">Live Logographic Stream</h4>
                                <span className="material-symbols-outlined text-primary animate-pulse">sync_alt</span>
                            </div>
                            <div className="space-y-4">
                                <input
                                    type="text"
                                    placeholder="Source text here..."
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl p-4 text-xs font-bold text-white focus:border-primary/50 outline-none transition-all"
                                />
                                <div className="h-24 rounded-2xl bg-black/60 border border-white/5 flex items-center justify-center relative overflow-hidden group">
                                    <span className="text-5xl font-serif text-white opacity-40 group-hover:opacity-100 transition-opacity">α β δ γ</span>
                                    <div className="absolute top-2 right-4 text-[7px] font-black uppercase tracking-widest text-slate-700">Rendered Output</div>
                                </div>
                            </div>
                        </GlassPanel>

                        <GlassPanel className="p-8 border-white/5 bg-surface-dark/40 rounded-[3rem] space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vowel Inventory</h4>
                                <button className="text-primary text-lg"><span className="material-symbols-outlined">add</span></button>
                            </div>
                            <div className="flex flex-wrap gap-2">
                                {['/a/', '/e/', '/i/', '/o/', '/u/', '/y/'].map(v => (
                                    <div key={v} className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-[11px] font-mono font-bold text-slate-300 hover:text-white transition-colors cursor-pointer">{v}</div>
                                ))}
                            </div>
                        </GlassPanel>

                        <GlassPanel className="p-8 border-white/5 bg-surface-dark/40 rounded-[3rem] space-y-6">
                            <div className="flex justify-between items-center">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">Vector Symbols</h4>
                                <button className="text-[8px] font-bold text-primary hover:underline transition-all">Upload SVG</button>
                            </div>
                            <div className="grid grid-cols-4 gap-3">
                                {[
                                    { id: 1, icon: 'filter_vintage' },
                                    { id: 2, icon: 'auto_awesome' },
                                    { id: 3, icon: 'infinite' }
                                ].map(sym => (
                                    <div key={sym.id} className="aspect-square rounded-2xl bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white transition-all cursor-pointer">
                                        <span className="material-symbols-outlined text-2xl">{sym.icon}</span>
                                    </div>
                                ))}
                                <div className="aspect-square rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center text-slate-700 hover:border-primary/50 hover:text-white transition-all cursor-pointer">
                                    <span className="material-symbols-outlined text-lg">cloud_upload</span>
                                    <span className="text-[7px] font-bold uppercase mt-1">Add</span>
                                </div>
                            </div>
                        </GlassPanel>
                    </div>
                </section>
            </div>
        </div>
    );
};

const LexiconItem = ({ word, type, gender, def }) => (
    <div className="p-4 rounded-2xl border border-transparent hover:bg-white/5 hover:border-white/5 transition-all group cursor-pointer relative">
        <div className="flex items-center gap-3 mb-1">
            <h4 className="text-xl font-manrope font-black text-white group-hover:text-primary transition-colors">{word}</h4>
            <div className="flex gap-2">
                <span className="text-[9px] font-bold text-slate-600 italic">{type}</span>
                {gender && <span className="text-[9px] font-bold text-slate-700 uppercase">({gender})</span>}
            </div>
        </div>
        <p className="text-sm text-slate-400 leading-relaxed font-manrope">{def}</p>
        <button className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-slate-600 hover:text-white"><span className="material-symbols-outlined">edit_note</span></button>
    </div>
);

const RuleCard = ({ title, status, statusColor, desc, tags }) => (
    <GlassPanel className="p-8 border-white/5 hover:border-white/10 transition-all cursor-pointer group space-y-4">
        <header className="flex justify-between items-start">
            <div className="flex items-center gap-3">
                <div className={`size-2 rounded-full bg-${statusColor}-500 shadow-[0_0_10px_rgba(var(--${statusColor}-rgb),0.5)]`}></div>
                <h4 className="font-bold text-white group-hover:text-primary transition-colors">{title}</h4>
            </div>
            <button className="text-slate-700 hover:text-white transition-colors"><span className="material-symbols-outlined">more_vert</span></button>
        </header>
        <p className="text-[11px] text-slate-500 leading-relaxed font-manrope">{desc}</p>
        <div className="flex flex-wrap gap-2">
            {tags.map(tag => (
                <span key={tag} className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[8px] font-black uppercase tracking-widest text-slate-600">{tag}</span>
            ))}
        </div>
    </GlassPanel>
);

export default LinguisticsHub;
