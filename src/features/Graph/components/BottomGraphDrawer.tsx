import React from 'react';
import GraphView from '../pages/GraphView'; // Import the graph component to render

interface BottomGraphDrawerProps {
    isOpen: boolean;
    onClose: () => void;
}

const BottomGraphDrawer: React.FC<BottomGraphDrawerProps> = ({ isOpen, onClose }) => {
    return (
        <div
            className={`
                fixed bottom-0 left-0 right-0 z-[100] bg-[#050508]/95 backdrop-blur-2xl border-t border-white/10
                transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] shadow-[0_-15px_50px_rgba(0,0,0,0.5)]
                flex flex-col
                ${isOpen ? 'h-[85vh] translate-y-0 opacity-100' : 'h-[85vh] translate-y-full opacity-0 pointer-events-none'}
            `}
        >
            {/* Grab Bar & Header */}
            <div className="h-14 shrink-0 flex items-center justify-between px-8 border-b border-white/5 relative bg-white/[0.02]">
                <div className="flex items-center gap-3">
                    <div className="size-8 rounded-lg bg-primary/20 flex items-center justify-center text-primary border border-primary/20">
                        <span className="material-symbols-outlined text-sm">hub</span>
                    </div>
                    <h3 className="text-sm font-black uppercase tracking-widest text-white">Relational Graph</h3>
                </div>

                {/* Draggable indicator center */}
                <div 
                    className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-10 flex items-center justify-center cursor-pointer group"
                    onClick={onClose}
                    title="Close Graph"
                >
                    <div className="w-12 h-1.5 rounded-full bg-white/20 group-hover:bg-primary/50 transition-colors"></div>
                </div>

                <div className="flex items-center gap-2">
                    <button 
                        onClick={onClose}
                        className="size-8 flex items-center justify-center rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                    >
                        <span className="material-symbols-outlined text-[18px]">close</span>
                    </button>
                </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 relative overflow-hidden bg-[#050508]">
                {/* Render the full GraphView, but maybe as a lighter version or we just mount it when open */}
                {isOpen && <GraphView />}
            </div>
        </div>
    );
};

export default BottomGraphDrawer;
