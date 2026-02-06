import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import GlassPanel from '../../components/common/GlassPanel';

const LinguisticsSidebar = ({
    stats,
    langName,
    glyphs = [],
    rules = [],
    onEditGlyph,
    onCreateGlyph,
    onCreateRule,
    onViewAllGlyphs
}) => {
    const { t } = useLanguage();

    return (
        <div className="h-full flex flex-col p-4 space-y-6 animate-in fade-in slide-in-from-right-4 overflow-y-auto custom-scrollbar">
            {/* Header */}
            <div className="flex items-center gap-3 text-slate-400 shrink-0">
                <span className="material-symbols-outlined">translate</span>
                <h3 className="text-xs font-black uppercase tracking-widest">{langName || 'Language'}</h3>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-2 shrink-0">
                <div className="bg-[#1a1a20] border border-white/5 p-2 rounded-xl text-center">
                    <div className="text-xl font-serif text-white font-bold">{stats?.words || 0}</div>
                    <div className="text-[8px] text-slate-500 uppercase tracking-widest">Words</div>
                </div>
                <div className="bg-[#1a1a20] border border-white/5 p-2 rounded-xl text-center">
                    <div className="text-xl font-serif text-white font-bold">{stats?.rules || 0}</div>
                    <div className="text-[8px] text-slate-500 uppercase tracking-widest">Rules</div>
                </div>
                <div className="bg-[#1a1a20] border border-white/5 p-2 rounded-xl text-center">
                    <div className="text-xl font-serif text-white font-bold">{stats?.glyphs || 0}</div>
                    <div className="text-[8px] text-slate-500 uppercase tracking-widest">Glyphs</div>
                </div>
            </div>

            <div className="h-px bg-white/5 my-2 shrink-0"></div>

            {/* Writing System / Glyphs */}
            <section className="space-y-4 shrink-0">
                <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('linguistics.writing_system') || 'WRITING SYSTEM'}</h4>
                    <button onClick={onCreateGlyph} className="text-primary hover:text-white transition-colors" title="Create New Glyph">
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                    </button>
                </div>
                <div className="p-4 bg-[#1a1a20] border border-white/5 rounded-2xl">
                    <div className="grid grid-cols-4 gap-2">
                        {glyphs.slice(0, 12).map(g => (
                            <div
                                key={g.id}
                                onClick={() => onEditGlyph(g)}
                                className="aspect-square rounded-lg bg-black/40 border border-white/5 flex items-center justify-center text-xl font-serif text-primary hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer"
                                title={g.lema}
                            >
                                <span>{g.lema}</span>
                            </div>
                        ))}
                        {glyphs.length === 0 && (
                            <div className="col-span-4 py-8 flex items-center justify-center opacity-20">
                                <span className="text-[8px] font-black uppercase font-mono">No Glyphs</span>
                            </div>
                        )}
                    </div>
                    <div className="mt-3 text-center">
                        <button onClick={onViewAllGlyphs} className="text-[9px] font-bold text-primary hover:underline uppercase tracking-wide">
                            View all ({glyphs.length})
                        </button>
                    </div>
                </div>
            </section>

            {/* Grammar Rules */}
            <section className="space-y-4 shrink-0">
                <div className="flex justify-between items-center">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('linguistics.grammar') || 'GRAMMAR'}</h4>
                    <button onClick={onCreateRule} className="text-primary hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-lg">add_circle</span>
                    </button>
                </div>
                <div className="space-y-2">
                    {rules.length > 0 ? rules.map(rule => (
                        <div key={rule.id} className="p-3 bg-[#1a1a20] border border-white/5 rounded-xl hover:border-primary/30 transition-all cursor-pointer group">
                            <div className="flex items-center gap-2 mb-1">
                                <div className={`size-1.5 rounded-full ${rule.status === 'complete' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
                                <span className="text-[10px] font-bold text-white group-hover:text-primary transition-colors">{rule.titulo}</span>
                            </div>
                            <p className="text-[9px] text-slate-500 leading-tight line-clamp-2">{rule.descripcion}</p>
                        </div>
                    )) : (
                        <div className="p-4 text-center border border-dashed border-white/10 rounded-xl">
                            <p className="text-[9px] text-slate-600 italic">No rules defined.</p>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default LinguisticsSidebar;
