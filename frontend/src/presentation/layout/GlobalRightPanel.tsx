import React from 'react';
import { useLanguage } from '@context/LanguageContext';
import NotebookManager from '@features/Writing/components/NotebookManager';
import FolderItem from '@features/WorldBible/components/FolderItem';
import { Carpeta } from '@domain/models/database';

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
  panelMode?: 'classic' | 'binder' | 'floating';
  addAttributeHandler?: ((templateId: number) => void) | null;
  availableTemplates?: unknown[];
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
  handleCreateEntity,
  panelMode = 'classic',
  addAttributeHandler,
  availableTemplates = []
}) => {
  const { t } = useLanguage();

  React.useEffect(() => {
    if (contextContent && activeTab !== 'EXPLORER' && activeTab !== 'QUICK_NOTES') {
      setActiveTab('CONTEXT');
    }
  }, [contextContent, activeTab, setActiveTab]);

  const rightSidebarClasses = panelMode === 'floating'
    ? `fixed top-[2vh] right-[2vw] h-[96vh] rounded-none border border-foreground/10 shadow-2xl z-50 transition-all duration-300 flex flex-col monolithic-panel ${isOpen ? 'w-[24rem] opacity-100 translate-y-0 pointer-events-auto' : 'w-[24rem] opacity-0 -translate-y-[1rem] pointer-events-none'}`
    : panelMode === 'binder'
    ? `fixed top-0 left-0 h-full monolithic-panel border-y-0 border-r border-l-0 border-foreground/10 shadow-2xl z-50 flex flex-col rounded-none ${isOpen ? 'w-[24rem] translate-x-0 pointer-events-auto' : 'w-[24rem] -translate-x-full opacity-0 pointer-events-none'}`
    : `fixed top-0 right-0 h-full monolithic-panel border-y-0 border-r-0 shadow-2xl z-50 transition-all duration-500 ease-in-out flex flex-col rounded-none ${isOpen ? 'w-[24rem] translate-x-0 pointer-events-auto' : 'w-[24rem] translate-x-full pointer-events-none'}`;

  return (
    <>
      <aside className={rightSidebarClasses} style={{ backgroundColor: 'hsl(var(--background))' }}>

      {(panelMode === 'classic' || panelMode === 'binder') && (
      <button
        onClick={onToggle}
        className={`
          absolute top-1/2 -translate-y-1/2 w-[2.5rem] h-[6rem] 
          bg-background border border-foreground/10
          rounded-none flex flex-col items-center justify-center gap-[0.25rem]
          transition-all duration-300 group pointer-events-auto
          hover:bg-primary/10 hover:border-primary/30
          ${isOpen ? 'text-primary shadow-[-4px_0_15px_-5px_rgba(var(--primary),0.3)] border-r-transparent' : 'text-foreground/60'}
          ${panelMode === 'binder' ? '-right-[2.5rem] border-l-0' : '-left-[2.5rem] border-r-0'}
        `}
        title={isOpen ? t('common.close_panel') : t('common.open_panel')}
      >
        <div className={`w-[0.25rem] h-[0.75rem] bg-current opacity-20 transition-all duration-500 ${isOpen ? 'h-[1.5rem] opacity-40' : ''}`}></div>
        <span className={`material-symbols-outlined text-[1.125rem] transition-transform duration-500 ${!isOpen ? (panelMode === 'binder' ? 'rotate-180' : '') : (panelMode === 'binder' ? '' : 'rotate-180')}`}>
          side_navigation
        </span>
        <div className={`w-[0.25rem] h-[0.75rem] bg-current opacity-20 transition-all duration-500 ${isOpen ? 'h-[1.5rem] opacity-40' : ''}`}></div>
      </button>
      )}

      {/* Header Tabs */}
      <div className="flex items-center border-b border-foreground/10 bg-foreground/[0.02]">
        <button
          onClick={() => setActiveTab('CONTEXT')}
          className={`flex-1 py-[1rem] flex flex-col items-center justify-center gap-[0.25rem] text-[0.6rem] font-black uppercase tracking-[0.15em] transition-colors relative ${activeTab === 'CONTEXT' ? 'text-primary' : 'text-foreground/60 hover:text-primary'}`}
          title={t('common.context')}
        >
          <span className="material-symbols-outlined text-[1.125rem]">view_sidebar</span>
          <span className="hidden sm:inline">{t('common.context')}</span>
          {activeTab === 'CONTEXT' && <div className="absolute bottom-0 left-0 right-0 h-[0.125rem] bg-primary"></div>}
        </button>
        <button
          onClick={() => {
            if (onClearContext) onClearContext();
            setActiveTab('QUICK_NOTES');
          }}
          className={`flex-1 py-[1rem] flex flex-col items-center justify-center gap-[0.25rem] text-[0.6rem] font-black uppercase tracking-[0.15em] transition-colors relative ${activeTab === 'QUICK_NOTES' ? 'text-primary' : 'text-foreground/60 hover:text-primary'}`}
          title={t('common.notes')}
        >
          <span className="material-symbols-outlined text-[1.125rem]">sticky_note_2</span>
          <span className="hidden sm:inline">{t('common.notes')}</span>
          {activeTab === 'QUICK_NOTES' && <div className="absolute bottom-0 left-0 right-0 h-[0.125rem] bg-primary"></div>}
        </button>
        <button
          onClick={() => {
            if (onClearContext) onClearContext();
            setActiveTab('EXPLORER');
          }}
          className={`flex-1 py-[1rem] flex flex-col items-center justify-center gap-[0.25rem] text-[0.6rem] font-black uppercase tracking-[0.15em] transition-colors relative ${activeTab === 'EXPLORER' ? 'text-primary' : 'text-foreground/60 hover:text-primary'}`}
          title={t('common.explorer')}
        >
          <span className="material-symbols-outlined text-[1.125rem]">folder_open</span>
          <span className="hidden sm:inline">{t('common.explorer')}</span>
          {activeTab === 'EXPLORER' && <div className="absolute bottom-0 left-0 right-0 h-[0.125rem] bg-primary"></div>}
        </button>
      </div>

      {/* Optional Title Section */}
      {title && activeTab === 'CONTEXT' && (
        <div className="px-[1.5rem] py-[0.75rem] border-b border-foreground/10 bg-foreground/[0.01]">
          <div className="text-[0.875rem] font-bold text-foreground tracking-tight">
            {title}
          </div>
        </div>
      )}

      {/* Content Area */}
      <div className="flex-1 overflow-hidden relative bg-background/20" style={{ backgroundColor: 'hsl(var(--background) / 0.2)' }}>
        {/* TAB: CONTEXT */}
        <div className={`absolute inset-0 flex flex-col animate-in fade-in duration-300 ${(activeTab === 'CONTEXT' && isOpen) ? 'z-10 opacity-100 pointer-events-auto' : 'z-0 opacity-0 pointer-events-none'}`}>
          {contextContent ? (
            contextContent
          ) : (
            <div id="global-right-panel-portal" className="h-full flex flex-col relative overflow-y-auto no-scrollbar p-[1.5rem] bg-background">
              {/* Portal Target - Content injected from features */}
            </div>
          )}
        </div>

        {/* TAB: QUICK_NOTES */}
        <div className={`absolute inset-0 flex flex-col animate-in fade-in duration-300 ${(activeTab === 'QUICK_NOTES' && isOpen) ? 'z-10 opacity-100 pointer-events-auto' : 'z-0 opacity-0 pointer-events-none'}`}>
          <NotebookManager projectId={projectId} />
        </div>

        {/* TAB: EXPLORER */}
        <div className={`absolute inset-0 flex flex-col animate-in fade-in duration-300 ${(activeTab === 'EXPLORER' && isOpen) ? 'z-10 opacity-100 pointer-events-auto' : 'z-0 opacity-0 pointer-events-none'}`}>
          <div className="p-[1rem] border-b border-foreground/10 bg-foreground/[0.01]">
            <div className="relative group mb-[0.75rem]">
              <span className="material-symbols-outlined absolute left-[0.75rem] top-1/2 -translate-y-1/2 text-foreground/60 text-[0.875rem] group-focus-within:text-primary transition-colors">search</span>
              <input
                type="text"
                placeholder={t('bible.search_entity')}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full monolithic-panel rounded-none py-[0.5rem] pl-[2.25rem] pr-[0.75rem] text-[0.75rem] focus:border-primary/50 outline-none transition-all text-foreground placeholder:text-foreground/40 bg-background border border-foreground/10"
              />
            </div>

            <div className="flex items-center gap-[0.5rem]">
              <div className="relative flex-1">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="appearance-none bg-background border border-foreground/10 rounded-none px-[1rem] py-[0.5rem] pr-[2.5rem] text-[0.75rem] font-bold text-foreground transition-all hover:bg-foreground/5 focus:border-primary outline-none w-full sunken-panel"
                >
                  <option value="ALL">🔍 TODO</option>
                  <option value="individual">👤 PERSONAJES</option>
                  <option value="location">📍 LUGARES</option>
                  <option value="culture">🤝 CULTURAS</option>
                  <option value="map">🗺️ MAPAS</option>
                  <option value="timeline">⏳ TIMELINES</option>
                </select>
                <span className="material-symbols-outlined absolute right-[0.75rem] top-1/2 -translate-y-1/2 text-[0.75rem] text-foreground/60 pointer-events-none font-bold">expand_more</span>
              </div>
            </div>
          </div>

          <div className="p-[1rem] border-b border-foreground/10 pt-[0.75rem] bg-foreground/[0.01]">
            <div className="flex items-center justify-between">
              <h2 className="text-[0.625rem] font-black uppercase tracking-[0.15em] text-foreground/60">{t('bible.explorer')}</h2>
              <button
                className="transition-colors hover:text-primary text-primary/60"
                onClick={() => handleCreateSimpleFolder(null)}
                title={t('bible.new_folder')}
              >
                <span className="material-symbols-outlined text-[0.875rem]">create_new_folder</span>
              </button>
            </div>
          </div>

          {/* Tree Content */}
          <div className="flex-1 overflow-y-auto no-scrollbar p-[0.5rem] space-y-[0.125rem] bg-background">
            {folders.length === 0 ? (
              <div className="p-[2rem] text-center opacity-30">
                <span className="material-symbols-outlined text-[1.875rem] mb-[0.5rem]">folder_off</span>
                <p className="text-[0.625rem] uppercase font-bold">{t('bible.empty_archive')}</p>
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
      </div>
    </aside>

    </>
  );
};

export default GlobalRightPanel;
