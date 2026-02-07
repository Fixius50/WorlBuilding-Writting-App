import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import NotebookManager from '../writing/NotebookManager';
import GlassPanel from '../common/GlassPanel';
import FolderItem from '../bible/FolderItem';

// Main Container Component
const GlobalRightPanel = ({
    isOpen,
    onClose,
    onToggle,       // Added prop for toggling from the tab button
    contextContent,
    projectId,
    activeTab,
    setActiveTab,
    title,           // Added title prop
    onClearContext,  // NEW: Callback to clear context content
    // Explorer props
    folders,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    handleCreateSimpleFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleMoveEntity,
    handleDuplicateEntity,
    handleCreateEntity,
    handleConfirmCreate
}) => {
    const { t } = useLanguage();

    // Auto-switch to context only if explicitly requested (not automatic on content change)
    // This prevents timeline from persisting when navigating between pages
    React.useEffect(() => {
        console.log('[GlobalRightPanel] contextContent changed:', !!contextContent, 'activeTab:', activeTab);
        if (contextContent && activeTab !== 'EXPLORER' && activeTab !== 'NOTEBOOKS') {
            // Only auto-switch if not already on a user-selected tab
            console.log('[GlobalRightPanel] Auto-switching to CONTEXT tab');
            setActiveTab('CONTEXT');
        }
    }, [contextContent, activeTab]);

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
                    onClick={() => {
                        if (onClearContext) onClearContext(); // Clear timeline/context content
                        setActiveTab('NOTEBOOKS');
                    }}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-colors relative ${activeTab === 'NOTEBOOKS' ? 'text-primary' : 'text-slate-500 hover:text-white'}`}
                >
                    <span className="material-symbols-outlined text-sm">book</span>
                    Apuntes
                    {activeTab === 'NOTEBOOKS' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                </button>
                <button
                    onClick={() => {
                        if (onClearContext) onClearContext(); // Clear timeline/context content
                        setActiveTab('EXPLORER');
                    }}
                    className={`flex-1 py-4 flex items-center justify-center gap-2 text-xs font-black uppercase tracking-widest transition-colors relative ${activeTab === 'EXPLORER' ? 'text-primary' : 'text-slate-500 hover:text-white'}`}
                >
                    <span className="material-symbols-outlined text-sm">folder_open</span>
                    Explorador
                    {activeTab === 'EXPLORER' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"></div>}
                </button>
            </div>

            {/* Optional Title Section - Only show in CONTEXT tab */}
            {title && activeTab === 'CONTEXT' && (
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
                        <div id="global-right-panel-portal" className="h-full flex flex-col relative overflow-y-auto custom-scrollbar">
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

                {/* TAB: EXPLORER */}
                <div className={`absolute inset-0 transition-opacity duration-300 flex flex-col ${activeTab === 'EXPLORER' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                    {/* Search Header */}
                    <div className="p-4 border-b border-glass-border">
                        <div className="relative group mb-3">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm group-focus-within:text-primary transition-colors">search</span>
                            <input
                                type="text"
                                placeholder={t('bible.search_entity')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm && setSearchTerm(e.target.value)}
                                className="w-full bg-surface-light/50 border border-glass-border rounded-xl py-2 pl-9 pr-3 text-xs focus:border-primary/50 outline-none transition-all text-white placeholder:text-text-muted/50"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            {/* Simplified Select Filter */}
                            <div className="relative flex-1">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType && setFilterType(e.target.value)}
                                    className="appearance-none bg-surface-dark border border-glass-border rounded-xl px-4 py-2 pr-10 text-xs font-bold text-white transition-all hover:bg-slate-800/50 focus:border-primary outline-none inline-flex items-center w-full"
                                >
                                    <option value="ALL">🔍 TODO</option>
                                    <option value="individual">👤 PERSONAJES</option>
                                    <option value="location">📍 LUGARES</option>
                                    <option value="culture">🤝 CULTURAS</option>
                                    <option value="map">🗺️ MAPAS</option>
                                    <option value="timeline">⏳ TIMELINES</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xs text-text-muted pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-b border-glass-border pt-0">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-text-muted">{t('bible.explorer')}</h2>
                            <div className="relative">
                                <button
                                    className="transition-colors hover:text-white text-primary"
                                    onClick={() => handleCreateSimpleFolder && handleCreateSimpleFolder(null)}
                                    title={t('bible.new_folder')}
                                >
                                    <span className="material-symbols-outlined text-sm">create_new_folder</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Tree Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-0.5">
                        {folders && folders.length === 0 ? (
                            <div className="p-8 text-center opacity-30">
                                <span className="material-symbols-outlined text-3xl mb-2">folder_off</span>
                                <p className="text-[10px] uppercase font-bold">{t('bible.empty_archive')}</p>
                            </div>
                        ) : (
                            folders && folders.map(folder => (
                                <FolderItem
                                    key={folder.uiKey || folder.id}
                                    folder={folder}
                                    onCreateSubfolder={() => { }}
                                    onRename={handleRenameFolder}
                                    onDeleteFolder={handleDeleteFolder}
                                    onDeleteEntity={handleDeleteFolder}
                                    onCreateTemplate={() => { }}
                                    onMoveEntity={handleMoveEntity}
                                    onDuplicateEntity={handleDuplicateEntity}
                                    onCreateEntity={handleCreateEntity}
                                    onConfirmCreate={handleConfirmCreate}
                                    searchTerm={searchTerm}
                                    filterType={filterType}
                                />
                            ))
                        )}
                    </div>
                </div>

            </div>
        </aside>
    );
};

export default GlobalRightPanel;
