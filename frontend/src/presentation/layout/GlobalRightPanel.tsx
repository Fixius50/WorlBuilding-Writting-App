import React from 'react';
import { useLanguage } from '@context/LanguageContext';
import { useRightPanelStore } from '@store/useRightPanelStore';
import UniversalInspector from '@organisms/UniversalInspector';

interface GlobalRightPanelProps {
  panelMode?: 'classic' | 'binder' | 'floating';
}

const GlobalRightPanel: React.FC<GlobalRightPanelProps> = ({
  panelMode = 'classic',
}) => {
  const { t } = useLanguage();
  const { 
    isOpen, 
    togglePanel, 
    closePanel, 
    title,
    mode
  } = useRightPanelStore();

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
            onClick={togglePanel}
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

        {/* Header (Título dinámico) */}
        {mode !== 'custom' && (
          <div className="flex items-center justify-between px-[1.5rem] py-[1rem] border-b border-foreground/10 bg-foreground/[0.02]">
            <div className="flex flex-col">
              <span className="text-[0.6rem] font-black uppercase tracking-[0.2em] text-primary mb-0.5">
                {mode === 'bulk' ? 'Editor Masivo' : 'Inspector Central'}
              </span>
              <div className="text-[0.875rem] font-bold text-foreground tracking-tight truncate max-w-[15rem]">
                {title || (mode === 'bulk' ? 'Operaciones de Lote' : 'Detalles de Entidad')}
              </div>
            </div>
            <button onClick={closePanel} className="text-foreground/20 hover:text-foreground transition-colors">
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        )}


        {/* Área de contenido */}
        <div className="flex-1 overflow-hidden relative" style={{ backgroundColor: 'hsl(var(--background))' }}>
          <div className={`absolute inset-0 flex flex-col animate-in fade-in duration-300 ${isOpen ? 'z-10 opacity-100 pointer-events-auto' : 'z-0 opacity-0 pointer-events-none'}`}>
             <UniversalInspector />
          </div>
        </div>
      </aside>
    </>
  );
};

export default GlobalRightPanel;
