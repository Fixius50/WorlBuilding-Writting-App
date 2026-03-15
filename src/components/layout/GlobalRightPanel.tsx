import React from 'react';
import { useLanguage } from '../../context/LanguageContext';
import NotebookManager from '../../features/Writing/components/NotebookManager';
import FolderItem from '../../features/WorldBible/components/FolderItem';
import { Carpeta } from '../../database/types';

interface GlobalRightPanelProps {
    isOpen: boolean;
    onClose: () => void;
    onToggle: () => void;
    contextContent?: React.ReactNode;
    projectId: number | null;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    title?: string | null;
    onClearContext?: () => void;
    // Explorer props
    folders: Carpeta[];
    searchTerm: string;
    setSearchTerm: (term: string) => void;
    filterType: string;
    setFilterType: (type: string) => void;
    handleCreateSimpleFolder: (parentId?: number | null, type?: string) => void;
    handleRenameFolder: (folderId: number, newName: string) => void;
    handleDeleteFolder: (folderId: number, parentId?: number | null) => void;
    handleCreateEntity: (folderId: number | string, specialType?: string) => void;
}

const GlobalRightPanel: React.FC<GlobalRightPanelProps> = ({
    isOpen,
    onToggle,
    contextContent,
    projectId,
    activeTab,
    setActiveTab,
    title,
    onClearContext,
    folders,
    searchTerm,
    setSearchTerm,
    filterType,
    setFilterType,
    handleCreateSimpleFolder,
    handleRenameFolder,
    handleDeleteFolder,
    handleCreateEntity
}) => {
    const { t } = useLanguage();

    React.useEffect(() => {
        if (contextContent && activeTab !== 'EXPLORER' && activeTab !== 'QUICK_NOTES') {
            setActiveTab('CONTEXT');
        }
    }, [contextContent, activeTab, setActiveTab]);

    return (
        <aside
            className={`
                fixed top-0 right-0 h-full bg-background border-l border-white/5 shadow-2xl z-40 transition-all duration-500 ease-in-out flex flex-col
                ${isOpen ? 'w-96 translate-x-0' : 'w-96 translate-x-full'}
            `}
        >
            {/* TAB TOGGLE BUTTON */}
            <button
                onClick={onToggle}
                className={`
                    absolute top-1/2 -translate-y-1/2 -left-10 w-10 h-24 
                    bg-background border border-white/5 border-r-0
                    rounded-l-2xl flex flex-col items-center justify-center gap-1
                    transition-all duration-300 group
                    hover:bg-indigo-500/10 hover:border-indigo-500/30
                    ${isOpen ? 'text-indigo-500 shadow-[-4px_0_15px_-5px_rgba(99,102,241,0.3)]' : 'text-slate-500'}
                `}
                title={isOpen ? "Cerrar Panel" : "Abrir Panel"}
            >
                <div className={`w-1 h-3 rounded-full bg-current opacity-20 transition-all duration-500 ${isOpen ? 'h-6 opacity-40' : ''}`}></div>
                <span className={`material-symbols-outlined text-lg transition-transform duration-500 ${isOpen ? 'rotate-180' : ''}`}>
                    side_navigation
                </span>
                <div className={`w-1 h-3 rounded-full bg-current opacity-20 transition-all duration-500 ${isOpen ? 'h-6 opacity-40' : ''}`}></div>
            </button>

            {/* Header Tabs */}
            <div className="flex items-center border-b border-white/5 bg-white/[0.02]">
                <button
                    onClick={() => setActiveTab('CONTEXT')}
                    className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 text-[0.6rem] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'CONTEXT' ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-400'}`}
                    title={t('common.context')}
                >
                    <span className="material-symbols-outlined text-[1.125rem]">view_sidebar</span>
                    <span className="hidden sm:inline">{t('common.context')}</span>
                    {activeTab === 'CONTEXT' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>}
                </button>
                <button
                    onClick={() => {
                        if (onClearContext) onClearContext();
                        setActiveTab('QUICK_NOTES');
                    }}
                    className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 text-[0.6rem] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'QUICK_NOTES' ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-400'}`}
                    title={t('common.notes')}
                >
                    <span className="material-symbols-outlined text-[1.125rem]">sticky_note_2</span>
                    <span className="hidden sm:inline">{t('common.notes')}</span>
                    {activeTab === 'QUICK_NOTES' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>}
                </button>
                <button
                    onClick={() => {
                        if (onClearContext) onClearContext();
                        setActiveTab('EXPLORER');
                    }}
                    className={`flex-1 py-4 flex flex-col items-center justify-center gap-1 text-[0.6rem] font-black uppercase tracking-widest transition-colors relative ${activeTab === 'EXPLORER' ? 'text-indigo-400' : 'text-slate-500 hover:text-indigo-400'}`}
                    title={t('common.explorer')}
                >
                    <span className="material-symbols-outlined text-[1.125rem]">folder_open</span>
                    <span className="hidden sm:inline">{t('common.explorer')}</span>
                    {activeTab === 'EXPLORER' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-500"></div>}
                </button>
            </div>

            {/* Optional Title Section */}
            {title && activeTab === 'CONTEXT' && (
                <div className="px-6 py-3 border-b border-white/5 bg-white/[0.01]">
                    <div className="text-sm font-bold text-white tracking-tight">
                        {title}
                    </div>
                </div>
            )}

            {/* Content Area */}
            <div className="flex-1 overflow-hidden relative bg-black/20">
                {/* TAB: CONTEXT */}
                {activeTab === 'CONTEXT' && (
                    <div className="absolute inset-0 flex flex-col animate-in fade-in duration-300">
                        {contextContent ? (
                            contextContent
                        ) : (
                            <div id="global-right-panel-portal" className="h-full flex flex-col relative overflow-y-auto custom-scrollbar">
                            </div>
                        )}
                    </div>
                )}

                {/* TAB: QUICK_NOTES */}
                {activeTab === 'QUICK_NOTES' && (
                    <div className="absolute inset-0 flex flex-col animate-in fade-in duration-300">
                        <NotebookManager projectId={projectId} />
                    </div>
                )}

                {/* TAB: EXPLORER */}
                {activeTab === 'EXPLORER' && (
                    <div className="absolute inset-0 flex flex-col animate-in fade-in duration-300">
                        <div className="p-4 border-b border-white/5">
                        <div className="relative group mb-3">
                            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm group-focus-within:text-indigo-400 transition-colors">search</span>
                            <input
                                type="text"
                                placeholder={t('bible.search_entity')}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-9 pr-3 text-xs focus:border-indigo-500/50 outline-none transition-all text-white placeholder:text-slate-600"
                            />
                        </div>

                        <div className="flex items-center gap-2">
                            <div className="relative flex-1">
                                <select
                                    value={filterType}
                                    onChange={(e) => setFilterType(e.target.value)}
                                    className="appearance-none bg-background border border-white/5 rounded-xl px-4 py-2 pr-10 text-xs font-bold text-white transition-all hover:bg-white/5 focus:border-indigo-500 outline-none w-full"
                                >
                                    <option value="ALL">🔍 TODO</option>
                                    <option value="individual">👤 PERSONAJES</option>
                                    <option value="location">📍 LUGARES</option>
                                    <option value="culture">🤝 CULTURAS</option>
                                    <option value="map">🗺️ MAPAS</option>
                                    <option value="timeline">⏳ TIMELINES</option>
                                </select>
                                <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 pointer-events-none">expand_more</span>
                            </div>
                        </div>
                    </div>

                    <div className="p-4 border-b border-white/5 pt-3">
                        <div className="flex items-center justify-between">
                            <h2 className="text-[10px] font-black uppercase tracking-widest text-slate-500">{t('bible.explorer')}</h2>
                            <button
                                className="transition-colors hover:text-white text-indigo-400"
                                onClick={() => handleCreateSimpleFolder(null)}
                                title={t('bible.new_folder')}
                            >
                                <span className="material-symbols-outlined text-sm">create_new_folder</span>
                            </button>
                        </div>
                    </div>

                    {/* Tree Content */}
                    <div className="flex-1 overflow-y-auto no-scrollbar p-2 space-y-0.5">
                        {folders.length === 0 ? (
                            <div className="p-8 text-center opacity-30">
                                <span className="material-symbols-outlined text-3xl mb-2">folder_off</span>
                                <p className="text-[10px] uppercase font-bold">{t('bible.empty_archive')}</p>
                            </div>
                        ) : (
                            folders.map(folder => (
                                <FolderItem
                                    key={folder.id}
                                    folder={folder}
                                    onCreateSubfolder={(parentId: number) => handleCreateSimpleFolder(parentId)}
                                    onRename={handleRenameFolder}
                                    onDeleteFolder={(id: number) => handleDeleteFolder(id)}
                                    onCreateEntity={(folderId: number | string, type?: string) => handleCreateEntity(folderId, type)}
                                    searchTerm={searchTerm}
                                    filterType={filterType}
                                    className=""
                                    onDeleteEntity={(id: number, fId: number) => handleDeleteFolder(id, fId)}
                                    onCreateTemplate={() => {}}
                                    onMoveEntity={() => {}}
                                    onDuplicateEntity={() => {}}
                                    onConfirmCreate={() => {}}
                                />
                            ))
                        )}
                    </div>
                    </div>
                )}
            </div>
        </aside>
    );
};

export default GlobalRightPanel;
