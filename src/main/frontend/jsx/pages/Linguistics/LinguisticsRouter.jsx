import React, { useState } from 'react';
import LinguisticsHub from './LinguisticsHub';
import GlyphFoundry from './GlyphFoundry';
import SymbologyEditor from './SymbologyEditor';

const LinguisticsRouter = () => {
    const [view, setView] = useState('hub'); // 'hub', 'foundry', 'editor'

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050508] overflow-hidden">
            {view === 'hub' && (
                <div className="flex-1 flex flex-col h-full relative">
                    <button
                        onClick={() => setView('foundry')}
                        className="absolute right-12 bottom-12 z-50 size-16 rounded-3xl bg-primary text-white flex items-center justify-center shadow-2xl shadow-primary/40 hover:scale-110 active:scale-95 transition-all group"
                        title="Glyph Foundry"
                    >
                        <span className="material-symbols-outlined text-3xl group-hover:rotate-12 transition-transform duration-300">font_download</span>
                    </button>
                    <LinguisticsHub onOpenEditor={() => setView('editor')} />
                </div>
            )}

            {view === 'foundry' && (
                <GlyphFoundry onBack={() => setView('hub')} />
            )}

            {view === 'editor' && (
                <SymbologyEditor
                    onBack={() => setView('hub')}
                    onSave={() => setView('hub')}
                />
            )}
        </div>
    );
};

export default LinguisticsRouter;
