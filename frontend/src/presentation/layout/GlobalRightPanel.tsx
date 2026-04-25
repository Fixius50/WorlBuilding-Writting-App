import React from 'react';
import { useLanguage } from '@context/LanguageContext';

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
  panelMode?: 'classic' | 'binder' | 'floating';
}

const GlobalRightPanel: React.FC<GlobalRightPanelProps> = ({
  isOpen,
  onToggle,
  contextContent,
  activeTab,
  setActiveTab,
  title,
  panelMode = 'classic',
}) => {
  const { t } = useLanguage();

  // Forzar CONTEXT cuando hay contenido contextual
  React.useEffect(() => {
    if (contextContent) {
      setActiveTab('CONTEXT');
    }
  }, [contextContent, setActiveTab]);

  const rightSidebarClasses = panelMode === 'floating'
    ? `fixed top-[2vh] right-[2vw] h-[96vh] rounded-none border border-foreground/10 shadow-2xl z-50 transition-all duration-300 flex flex-col monolithic-panel ${isOpen ? 'w-[24rem] opacity-100 translate-y-0 pointer-events-auto' : 'w-[24rem] opacity-0 -translate-y-[1rem] pointer-events-none'}`
    : panelMode === 'binder'
    ? `fixed top-0 left-0 h-full monolithic-panel border-y-0 border-r border-l-0 border-foreground/10 shadow-2xl z-50 flex flex-col rounded-none ${isOpen ? 'w-[24rem] translate-x-0 pointer-events-auto' : 'w-[24rem] -translate-x-full opacity-0 pointer-events-none'}`
    : `fixed top-0 right-0 h-full monolithic-panel border-y-0 border-r-0 shadow-2xl z-50 transition-all duration-500 ease-in-out flex flex-col rounded-none ${isOpen ? 'w-[24rem] translate-x-0 pointer-events-auto' : 'w-[24rem] translate-x-full pointer-events-none'}`;

  return (
    <>
      <aside className={rightSidebarClasses} style={{ backgroundColor: 'hsl(var(--background))' }}>

        {/* Toggle lateral — classic y binder */}
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
            <div className={`w-[0.25rem] h-[0.75rem] bg-current opacity-20 transition-all duration-500 ${isOpen ? 'h-[1.5rem] opacity-40' : ''}`} />
            <span className={`material-symbols-outlined text-[1.125rem] transition-transform duration-500 ${!isOpen ? (panelMode === 'binder' ? 'rotate-180' : '') : (panelMode === 'binder' ? '' : 'rotate-180')}`}>
              side_navigation
            </span>
            <div className={`w-[0.25rem] h-[0.75rem] bg-current opacity-20 transition-all duration-500 ${isOpen ? 'h-[1.5rem] opacity-40' : ''}`} />
          </button>
        )}

        {/* Header — solo CONTEXT */}
        <div className="flex items-center border-b border-foreground/10 bg-foreground/[0.02]">
          <button
            onClick={() => setActiveTab('CONTEXT')}
            className={`flex-1 py-[1rem] flex flex-col items-center justify-center gap-[0.25rem] text-[0.6rem] font-black uppercase tracking-[0.15em] transition-colors relative ${activeTab === 'CONTEXT' ? 'text-primary' : 'text-foreground/60 hover:text-primary'}`}
            title={t('common.context')}
          >
            <span className="material-symbols-outlined text-[1.125rem]">view_sidebar</span>
            <span className="hidden sm:inline">{t('common.context')}</span>
            {activeTab === 'CONTEXT' && <div className="absolute bottom-0 left-0 right-0 h-[0.125rem] bg-primary" />}
          </button>
        </div>

        {/* Título opcional */}
        {title && (
          <div className="px-[1.5rem] py-[0.75rem] border-b border-foreground/10 bg-foreground/[0.01]">
            <div className="text-[0.875rem] font-bold text-foreground tracking-tight">{title}</div>
          </div>
        )}

        {/* Área de contenido */}
        <div className="flex-1 overflow-hidden relative bg-background/20" style={{ backgroundColor: 'hsl(var(--background) / 0.2)' }}>
          <div className={`absolute inset-0 flex flex-col animate-in fade-in duration-300 ${isOpen ? 'z-10 opacity-100 pointer-events-auto' : 'z-0 opacity-0 pointer-events-none'}`}>
            {contextContent ? (
              contextContent
            ) : (
              <div id="global-right-panel-portal" className="h-full flex flex-col relative overflow-y-auto no-scrollbar p-[1.5rem] bg-background">
                {/* Portal Target — inyección desde features */}
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default GlobalRightPanel;
