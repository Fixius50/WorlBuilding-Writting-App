import React, { useEffect } from 'react';
import { useLanguage } from '@context/LanguageContext';
import ZenEditor from '@features/Editor/components/ZenEditor';
import ConfirmModal from '@organisms/ConfirmModal';
import { useWritingView } from './useWritingView';

const WritingView = () => {
  const { t } = useLanguage();
  const {
    notebook,
    pages,
    currentPageIndex,
    saving,
    loading,
    deleteModalOpen,
    setDeleteModalOpen,
    pageToDelete,
    setPageToDelete,
    searchTerm,
    setSearchTerm,
    snapshots,
    activeTab,
    setActiveTab,
    editingPageId,
    setEditingPageId,
    handleContentChange,
    handleSnapshot,
    handleMentionClick,
    handleRestoreSnapshot,
    handleTitleChangeInternal,
    handleCreatePage,
    handleAutoDeletePage,
    handlePageSelect,
    confirmDeletePage,
    setCustomContent
  } = useWritingView();

  const filteredPages = pages.filter(p => 
    (p.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.contenido || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const deletePage = (e: React.MouseEvent, id: number, index: number) => {
    e.stopPropagation();
    if (pages.length <= 1) {
      setPageToDelete({ id, index, error: 'one_page' });
      setDeleteModalOpen(true);
      return;
    }
    setPageToDelete({ id, index });
    setDeleteModalOpen(true);
  };

  useEffect(() => {
    const renderRightPanel = () => (
      <div className="flex flex-col h-full monolithic-panel/95">
        <div className="p-4 border-b border-foreground/10 flex items-center justify-center bg-background/60 relative">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">{notebook?.titulo || 'Archivador'}</h3>
          {saving && (
            <div className="absolute right-4 animate-pulse">
              <span className="material-symbols-outlined text-xs text-amber-500">sync</span>
            </div>
          )}
        </div>

        <div className="flex p-2 gap-2 border-b border-foreground/10 bg-background/20">
          <button
            onClick={() => setActiveTab('index')}
            className={`flex-1 py-2 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'index' ? 'bg-primary text-foreground shadow-lg' : 'text-foreground/60 hover:text-foreground'}`}
          >
            {t('writing.index')}
          </button>
          <button
            onClick={() => setActiveTab('format')}
            className={`flex-1 py-2 rounded-none text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'format' ? 'bg-primary text-foreground shadow-lg' : 'text-foreground/60 hover:text-foreground'}`}
          >
            {t('writing.format')}
          </button>
        </div>

        <div className="flex-1 overflow-hidden">
          {activeTab === 'index' ? (
            <div className="flex flex-col h-full">
              <div className="p-4 border-b border-foreground/5">
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/40">search</span>
                  <input 
                    type="text"
                    placeholder="Buscar..."
                    className="w-full bg-foreground/5 border border-foreground/10 py-2 pl-9 pr-4 text-[10px] font-mono outline-none focus:border-primary/50 transition-all text-white placeholder:text-foreground/30"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
                {filteredPages.map((page) => {
                  const globalIdx = pages.findIndex(p => p.id === page.id);
                  const isSelected = globalIdx === currentPageIndex;
                  return (
                    <div key={page.id} className="group relative">
                      <div
                        onClick={() => handlePageSelect(globalIdx)}
                        className={`w-full text-left p-4 rounded-none border transition-all cursor-pointer ${isSelected
                          ? 'bg-primary/10 border-primary/30 text-primary shadow-[inset_0_0_20px_rgba(var(--primary-rgb),0.1)]'
                          : 'bg-foreground/5 border-transparent hover:bg-foreground/10 text-foreground/60'
                        }`}
                      >
                        <div className="flex justify-between items-center mb-1">
                          {editingPageId === page.id ? (
                            <input 
                              autoFocus
                              onBlur={() => setEditingPageId(null)}
                              onKeyDown={(e) => { 
                                if (e.key === 'Enter') setEditingPageId(null);
                                e.stopPropagation();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className={`bg-foreground/10 border-b border-primary font-serif font-bold text-sm outline-none w-full px-1 ${isSelected ? 'text-primary' : 'text-foreground/80'}`}
                              value={page.titulo || ''}
                              onChange={(e) => handleTitleChangeInternal(globalIdx, e.target.value)}
                              placeholder={`Hoja ${globalIdx + 1}`}
                            />
                          ) : (
                            <span className={`font-serif font-bold text-sm truncate w-full ${isSelected ? 'text-primary' : 'text-foreground/80'}`}>
                              {page.titulo || `Hoja ${globalIdx + 1}`}
                            </span>
                          )}
                          {isSelected && !editingPageId && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 ml-2 animate-pulse"></span>}
                        </div>
                        <p className="text-[10px] line-clamp-1 opacity-50 font-mono break-words leading-relaxed pointer-events-none">
                          {page.contenido?.replace(/<[^>]+>/g, '').substring(0, 30) || 'Sin contenido...'}
                        </p>
                      </div>
                      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-all z-30">
                        <button
                          onClick={(e) => { e.stopPropagation(); setEditingPageId(page.id); }}
                          className="p-1.5 rounded-none text-foreground/40 hover:text-primary hover:bg-primary/10 transition-all"
                          title="Editar título"
                        >
                          <span className="material-symbols-outlined text-sm">edit</span>
                        </button>
                        <button
                          onClick={(e) => deletePage(e, page.id, globalIdx)}
                          className="p-1.5 rounded-none text-foreground/40 hover:text-red-400 hover:bg-red-400/10 transition-all"
                          title="Eliminar hoja"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="p-4 bg-background/20 border-t border-foreground/10">
                <button
                  onClick={handleCreatePage}
                  className="w-full py-3 bg-primary text-foreground rounded-none text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
                >
                  <span className="material-symbols-outlined text-base">add</span>
                  <span>AÑADIR HOJA</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4">
              <div className="space-y-4">
                <h3 className="text-xs font-black uppercase text-primary mb-4 tracking-widest">{t('writing.format')}</h3>
                <div className="space-y-2 text-[11px] text-foreground/60 font-mono">
                  <div className="flex justify-between items-center p-2 bg-background/20 rounded"><span>Negrita</span><kbd>Ctrl+B</kbd></div>
                  <div className="flex justify-between items-center p-2 bg-background/20 rounded"><span>Cursiva</span><kbd>Ctrl+I</kbd></div>
                  <div className="flex justify-between items-center p-2 bg-background/20 rounded"><span>Mencionar Entidad</span><kbd>@</kbd></div>
                  <div className="flex justify-between items-center p-2 bg-background/20 rounded"><span>Comandos / Menú</span><kbd>/</kbd></div>
                </div>
                <div className="pt-6 border-t border-foreground/5 space-y-3">
                  <p className="text-[10px] text-foreground/40 leading-relaxed italic">
                    Tip: Puedes invocar entidades de tu biblia escribiendo @ y seleccionando el nombre. Usa / para insertar separadores o dar formato avanzado.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );

    setCustomContent(renderRightPanel(), notebook?.titulo || 'Archivador');
  }, [notebook, pages, activeTab, searchTerm, editingPageId, saving, currentPageIndex, handlePageSelect, handleCreatePage, handleTitleChangeInternal, setCustomContent, t, deletePage]);

  const currentPage = pages[currentPageIndex];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground/60 font-serif text-2xl italic tracking-widest">Abriendo Archivador...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex w-full h-full bg-[#111] relative font-sans text-foreground/60">
      <div className="flex-1 flex flex-col relative z-10">
        <main className="flex-1 flex flex-col relative bg-[#1e1e1e]">
          {currentPage && (
             <ZenEditor 
                pages={pages}
                currentPageIndex={currentPageIndex}
                onUpdate={handleContentChange} 
                onTitleChange={handleTitleChangeInternal}
                onCreatePage={handleCreatePage}
                onAutoDeletePage={handleAutoDeletePage}
                onSnapshot={handleSnapshot}
                snapshots={snapshots}
                onRestoreSnapshot={handleRestoreSnapshot}
                onMentionClick={handleMentionClick}
             />
          )}
        </main>
      </div>
      <ConfirmModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={pageToDelete?.error === 'one_page' ? () => setDeleteModalOpen(false) : confirmDeletePage}
        title={pageToDelete?.error === 'one_page' ? 'Aviso' : 'Eliminar Hoja'}
        message={pageToDelete?.error === 'one_page' ? 'Debe haber al menos una hoja en el archivador.' : '¿Estás seguro de que quieres eliminar esta hoja? Se borrará permanentemente.'}
        confirmText={pageToDelete?.error === 'one_page' ? 'Entendido' : 'Confirmar'}
        isDestructive={pageToDelete?.error !== 'one_page'} 
      />
    </div>
  );
};

export default WritingView;

