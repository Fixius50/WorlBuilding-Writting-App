import React from 'react';

const GlyphEditorCanvas = () => {
    return (
        <div className="w-full aspect-square flex flex-col items-center justify-center bg-[#0f172a] rounded-lg border border-slate-700 text-slate-500">
            <span className="material-symbols-outlined text-4xl mb-2">draw</span>
            <p className="text-xs uppercase tracking-tighter">Canvas Suspended</p>
        </div>
    );
};

export default GlyphEditorCanvas;
