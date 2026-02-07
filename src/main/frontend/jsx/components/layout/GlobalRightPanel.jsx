import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import NotebookManager from '../writing/NotebookManager';
import GlassPanel from '../common/GlassPanel';

// Main Container Component
const GlobalRightPanel = ({
    isOpen,
    onClose,
    onToggle,       // Added prop for toggling from the tab button
    contextContent,
    projectId,
    activeTab,
    setActiveTab,
    title           // Added title prop
}) => {
    const { t } = useLanguage();

    // Auto-switch to context if new context content arrives
    React.useEffect(() => {
        if (contextContent) {
            setActiveTab('CONTEXT');
        }
    }, [contextContent]);

    return (
        <aside
            className={`
                fixed top-0 right-0 h-full bg-surface-dark border-l border-glass-border shadow-2xl z-40 transition-all duration-500 ease-in-out flex flex-col
                ${isOpen ? 'w-96 translate-x-0' : 'w-96 translate-x-full'}
            `}
        >
            {/* --- TAB TOGGLE BUTTON (CENTRADO VERTICAL) --- */}
            <button
                onClick={onToggle}
                className={`
                    absolute top-1/2 -translate-y-1/2 -left-10 w-10 h-24 
                    bg-surface-dark border border-glass-border border-r-0
                    rounded-l-2xl flex flex-col items-center justify-center gap-1
                    transition-all duration-300 group
                    hover:bg-primary/10 hover:border-primary/30
                    ${isOpen ? 'text-primary shadow-[-4px_0_15px_-5px_rgba(var(--primary-rgb),0.3)]' : 'text-slate-500'}
                `}
                title={isOpen ? "Cerrar Panel" : "Abrir Panel"}
            >
                <div className={`w-1 h-3 rounded-full bg-current opacity-20 transition-all duration-500 ${isOpen ? 'h-6 opacity-40' : ''}`}></div>
                <span className={`material-symbols-outlined text-lg transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
                    side_navigation
                </span>
                <div className={`w-1 h-3 rounded-full bg-current opacity-20 transition-all duration-500 ${isOpen ? 'h-6 opacity-40' : ''}`}></div>

                {/* Micro-glow effect */}
                <div className={`absolute inset-0 rounded-l-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity`}></div>
            </button>

            {/* Header Tabs */}
            <div className="flex items-center border-b border-glass-border bg-white/[0.02]">
                <button
                    onClick={() => setActiveTab('CONTEXT')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-colors relative ${activeTab === 'CONTEXT' ? 'text-primary' : 'text-slate-500 hover:text-white'}`}
                >
                    <span className="material-symbols-outlined text-sm">view_sidebar</span>
                    Contexto
                    {activeTab === 'CONTEXT' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                </button>
                <button
                    onClick={() => setActiveTab('NOTEBOOKS')}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-colors relative ${activeTab === 'NOTEBOOKS' ? 'text-primary' : 'text-slate-500 hover:text-white'}`}
                >
                    <span className="material-symbols-outlined text-sm">book</span>
                    Apuntes
                    {activeTab === 'NOTEBOOKS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                </button>
            </div>

            {/* Optional Title Section */}
            {title && (
                <div className="px-6 py-3 border-b border-glass-border bg-white/[0.01]">
                    <div className="text-sm font-bold text-white tracking-tight">
                        {title}
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-black/20">

                {/* TAB: CONTEXT */}
                <div className={`absolute inset-0 transition-opacity duration-300 flex flex-col ${activeTab === 'CONTEXT' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    {contextContent ? (
                        contextContent
                    ) : (
                        <div id="global-right-panel-portal" className="h-full flex flex-col relative">
                            {/* Portal Content will be injected here. If empty, we can show placeholder IF we could detect it.
                               For now, we assume if activeTab is CONTEXT and contextContent is null, the Portal is being used.
                               We can keep the placeholder logic inside the portal injector or just leave empty. 
                            */}
                        </div>
                    )}
                </div>

                {/* TAB: NOTEBOOKS */}
                <div className={`absolute inset-0 transition-opacity duration-300 flex flex-col ${activeTab === 'NOTEBOOKS' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    <NotebookManager projectId={projectId} />
                </div>

            </div>
        </aside>
    );
};

export default GlobalRightPanel;
