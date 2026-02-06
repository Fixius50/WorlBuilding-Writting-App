import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import NotebookManager from '../writing/NotebookManager';
import GlassPanel from '../common/GlassPanel';

// Main Container Component
const GlobalRightPanel = ({
    isOpen,
    onClose,
    contextContent, // Content injected by active page (Map details, Graph controls, etc)
    projectId,
    activeTab,      // Controlled by ArchitectLayout
    setActiveTab    // Controlled by ArchitectLayout
}) => {
    const { t } = useLanguage();
    // const [activeTab, setActiveTab] = useState(contextContent ? 'CONTEXT' : 'NOTEBOOKS'); // REMOVED LOCAL STATE

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
            {/* Toggle Handle (visible when closed) - Can be added if needed, currently controlled by Layout */}

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
                    Cuadernos
                    {activeTab === 'NOTEBOOKS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                </button>
                {/* Close Button */}
                <button onClick={onClose} className="p-4 text-slate-500 hover:text-white transition-colors border-l border-white/5">
                    <span className="material-symbols-outlined text-sm">close_fullscreen</span>
                </button>
            </div>

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
