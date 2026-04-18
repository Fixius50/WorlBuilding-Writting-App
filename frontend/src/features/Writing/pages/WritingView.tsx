import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@context/LanguageContext';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { writingService } from '@repositories/writingService';
import { notebookService, Cuaderno, Hoja } from '@repositories/notebookService';
import ZenEditor from '@features/Editor/components/ZenEditor';
import ConfirmModal from '@organisms/ConfirmModal';
import GlassPanel from '@atoms/GlassPanel';

const WritingView = () => {
  const { notebookId } = useParams();
  const navigate = useNavigate();

  // --- Context from ArchitectLayout ---
  interface ArchitectContext {
    setRightPanelTab: (tab: string) => void;
    setRightOpen: (open: boolean) => void;
    projectName: string;
    projectId: number | null;
  }

  const { setRightPanelTab, setRightOpen } = useOutletContext<ArchitectContext>();
  const { t } = useLanguage();

  const [notebook, setNotebook] = useState<Cuaderno | null>(null);
  const [pages, setPages] = useState<Hoja[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{ id: number; index: number; error?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pagesRef = useRef(pages);
  const indexRef = useRef(currentPageIndex);
  const isMounted = useRef(true);

  // Keep refs synced for unmount saving
  useEffect(() => { pagesRef.current = pages; }, [pages]);
  useEffect(() => { indexRef.current = currentPageIndex; }, [currentPageIndex]);

  // Portal Target
  const [portalRef, setPortalRef] = useState<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = useState('index'); // 'index' or 'format'

  // Initial Load
  useEffect(() => {
    if (setRightPanelTab) setRightPanelTab('CONTEXT');
    setRightOpen(true);
    if (notebookId) {
      loadNotebookAndPages(Number(notebookId));
    }
  }, [notebookId, setRightPanelTab]);

  // Find portal target
  useEffect(() => {
    const checkPortal = setInterval(() => {
      const el = document.getElementById('global-right-panel-portal');
      if (el) {
        setPortalRef(el);
        clearInterval(checkPortal);
      }
    }, 100);
    return () => {
      clearInterval(checkPortal);
      if (setRightPanelTab) setRightPanelTab('NOTEBOOKS');
    };
  }, [setRightPanelTab]);

  // Cleanup & Save on Unmount
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
        const currentPage = pagesRef.current[indexRef.current];
        if (currentPage) {
          notebookService.updatePage(currentPage.id, { 
            contenido: currentPage.contenido || '',
            titulo: currentPage.titulo || '' 
          }).catch(err => console.error("Error preventing data loss:", err));
        }
      }
    };
  }, []);

  const loadNotebookAndPages = async (id: number) => {
    try {
      setLoading(true);
      const nb = await notebookService.getById(id);
      setNotebook(nb);

      const pgs = await notebookService.getPagesByNotebook(id);
      if (pgs && pgs.length > 0) {
        setPages(pgs);
        setCurrentPageIndex(0);
      } else {
        const newPage = await notebookService.createPage(id);
        setPages([newPage]);
        setCurrentPageIndex(0);
      }
    } catch (err) {
      console.error("Error loading notebook/pages:", err);
      navigate(-1);
    } finally {
      setLoading(false);
    }
  };

  const handleContentChange = (newContent: string) => {
    if (!pages[currentPageIndex]) return;
    const updatedPages = [...pages];
    updatedPages[currentPageIndex].contenido = newContent;
    setPages(updatedPages);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      savePage(updatedPages[currentPageIndex]);
    }, 800);
  };

  const handleSnapshot = async (html: string) => {
    if (!pages[currentPageIndex]) return;
    try {
      // Por ahora guardamos un snapshot simple como una página "oculta" o log (simulado)
      console.log("Guardando snapshot...", html.substring(0, 50));
      // En una implementación real, esto iría a una tabla `snapshots` en SQLite
    } catch (err) {
      console.error("Error saving snapshot:", err);
    }
  };

  const handleTitleChangeInternal = (index: number, newTitle: string) => {
    const updatedPages = [...pages];
    updatedPages[index] = { ...updatedPages[index], titulo: newTitle };
    setPages(updatedPages);

    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      savePage(updatedPages[index]);
    }, 800);
  };

  const savePage = async (page: Hoja) => {
    if (isMounted.current) setSaving(true);
    try {
      await notebookService.updatePage(page.id, {
        contenido: page.contenido || '',
        titulo: page.titulo || ''
      });
    } catch (err) {
      console.error("Error saving page:", err);
    } finally {
      if (isMounted.current) setSaving(false);
    }
  };

  const handleCreatePage = async () => {
    if (!notebook) return;
    try {
      const newPage = await notebookService.createPage(notebook.id);
      const updatedPages = [...pages, newPage];
      setPages(updatedPages);
      // NO saltamos automáticamente a la nueva página
      // setCurrentPageIndex(pages.length); 
    } catch (err) {
      console.error("Error creating page:", err);
    }
  };

  const handlePageSelect = async (index: number) => {
    if (saveTimeout.current) {
      clearTimeout(saveTimeout.current);
      const cp = pages[currentPageIndex];
      if (cp) await savePage(cp);
    }
    setCurrentPageIndex(index);
  };

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

  const confirmDeletePage = async () => {
    if (!pageToDelete) return;
    const { id, index } = pageToDelete;
    try {
      await notebookService.deletePage(id);
      const newPages = pages.filter(p => p.id !== id);
      let nextIndex = currentPageIndex;
      if (currentPageIndex === index) {
        nextIndex = Math.max(0, index - 1);
      } else if (currentPageIndex > index) {
        nextIndex = currentPageIndex - 1;
      }
      setPages(newPages);
      setCurrentPageIndex(nextIndex);
    } catch (err) {
      console.error("Error deleting page:", err);
    } finally {
      setDeleteModalOpen(false);
      setPageToDelete(null);
    }
  };

  const filteredPages = pages.filter(p => 
    (p.titulo || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.contenido || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

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
                        <input 
                          onClick={(e) => e.stopPropagation()}
                          className={`bg-transparent border-none font-serif font-bold text-sm truncate outline-none w-full ${isSelected ? 'text-primary' : 'text-foreground/80'}`}
                          value={page.titulo || `Hoja ${globalIdx + 1}`}
                          onChange={(e) => handleTitleChangeInternal(globalIdx, e.target.value)}
                          placeholder={`Hoja ${globalIdx + 1}`}
                        />
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 ml-2 animate-pulse"></span>}
                      </div>
                      <p className="text-[10px] line-clamp-1 opacity-50 font-mono break-words leading-relaxed pointer-events-none">
                        {page.contenido?.replace(/<[^>]+>/g, '').substring(0, 30) || 'Sin contenido...'}
                      </p>
                    </div>
                    <button
                      onClick={(e) => deletePage(e, page.id, globalIdx)}
                      className="absolute top-2 right-2 p-1.5 rounded-none text-foreground/60 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100 z-30"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
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
                <div className="flex justify-between items-center p-2 bg-background/20 rounded"><span>Mencionar</span><kbd>@</kbd></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const currentPage = pages[currentPageIndex];

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="animate-pulse text-foreground/60 font-serif text-2xl italic tracking-widest">Abriendo Archivador...</div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex w-full h-full bg-[#111] relative overflow-hidden font-sans text-foreground/60">
      {portalRef && createPortal(renderRightPanel(), portalRef)}
      <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
        <main className="flex-1 flex flex-col relative no-scrollbar bg-[#1e1e1e]">
          {currentPage && (
             <ZenEditor 
                content={currentPage.contenido || ''} 
                title={currentPage.titulo || ''}
                onUpdate={handleContentChange} 
                onTitleChange={(newTitle) => handleTitleChangeInternal(currentPageIndex, newTitle)}
                onSnapshot={handleSnapshot}
                snapshots={[]} // TODO: Cargar desde DB
                onRestoreSnapshot={(id) => console.log("Restaurando...", id)}
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
