import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '@context/LanguageContext';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { notebookService, Cuaderno, Hoja } from '@repositories/notebookService';
import { entityService } from '@repositories/entityService';
import ZenEditor from '@features/Editor/components/ZenEditor';
import ConfirmModal from '@organisms/ConfirmModal';
import GlassPanel from '@atoms/GlassPanel';

const WritingView = () => {
  const { notebookId } = useParams();
  const navigate = useNavigate();

  interface ArchitectContext {
    setRightPanelTab: (tab: string) => void;
    setRightPanelTitle: (title: React.ReactNode) => void;
    setRightPanelContent: (content: React.ReactNode) => void;
    setRightOpen: (open: boolean) => void;
    setStatsData: (data: any) => void;
    projectName: string;
    projectId: number | null;
  }

  const { 
    setRightPanelTab, 
    setRightPanelTitle, 
    setRightPanelContent, 
    setRightOpen, 
    projectId, 
    projectName,
    setStatsData 
  } = useOutletContext<ArchitectContext>();
  const { t } = useLanguage();

  const [notebook, setNotebook] = useState<Cuaderno | null>(null);
  const [pages, setPages] = useState<Hoja[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{ id: number; index: number; error?: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [snapshots, setSnapshots] = useState<{ id: number; timestamp: string; contenido: string }[]>([]);
  
  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pagesRef = useRef(pages);
  const indexRef = useRef(currentPageIndex);
  const isMounted = useRef(true);

  // Keep refs synced for unmount saving
  useEffect(() => { pagesRef.current = pages; }, [pages]);
  useEffect(() => { indexRef.current = currentPageIndex; }, [currentPageIndex]);

  // Portal Target
  const [portalRef, setPortalRef] = useState<HTMLElement | null>(null);
  const [activeTab, setActiveTab] = useState<'index' | 'format'>('index');
  const [editingPageId, setEditingPageId] = useState<number | null>(null);

  // Update global stats
  useEffect(() => {
    if (setStatsData && pages.length > 0) {
      const totalWords = pages.reduce((acc, p) => acc + (p.contenido?.replace(/<[^>]+>/g, '').trim().split(/\s+/).filter(Boolean).length || 0), 0);
      setStatsData({
        pages: pages,
        totalPages: pages.length,
        wordsToday: totalWords, // Por ahora totalWords como wordsToday hasta tener snapshots históricos
      });
    }
    return () => {
       if (setStatsData) setStatsData(null);
    };
  }, [pages, setStatsData]);

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
        loadSnapshots(pgs[0].id);
      } else {
        const newPage = await notebookService.createPage(id);
        setPages([newPage]);
        setCurrentPageIndex(0);
        loadSnapshots(newPage.id);
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
    const currentPage = pages[currentPageIndex];
    if (!currentPage) return;
    try {
      console.log("[Snapshot] Guardando versión...");
      await notebookService.createSnapshot(currentPage.id, html);
      await loadSnapshots(currentPage.id);
    } catch (err) {
      console.error("Error saving snapshot:", err);
    }
  };

  const handleMentionClick = async (id: string) => {
    try {
      const entity = await entityService.getById(Number(id));
      if (entity) {
        const extra = typeof entity.contenido_json === 'string'
          ? JSON.parse(entity.contenido_json)
          : (entity.contenido_json || {});
        
        const img = extra.imageUrl || extra.image || extra.avatar || '';

        setRightPanelTitle(
          <div className="flex flex-col">
            <span className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Previsualización de Entidad</span>
            <span className="text-foreground font-black text-sm truncate">{entity.nombre}</span>
          </div>
        );

        setRightPanelContent(
          <div className="p-6 space-y-8 animate-in fade-in duration-500">
             {/* Info Básica */}
             <section className="space-y-4">
                {img && (
                  <div className="aspect-video border border-foreground/10 bg-foreground/5 overflow-hidden">
                    <img src={img} alt={entity.nombre} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 text-[9px] font-black bg-primary/10 text-primary border border-primary/20 uppercase tracking-widest">
                    {entity.tipo}
                  </span>
                </div>
                <p className="text-xs text-foreground/60 leading-relaxed italic">
                  {entity.descripcion || "Sin descripción disponible."}
                </p>
             </section>

             {/* Backlinks (Simulados o reales si el servicio los da) */}
             <section className="space-y-4">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground/40 px-2 border-l-2 border-primary">Apariciones Recientes</h3>
                <div className="space-y-3">
                   <div className="p-3 bg-foreground/5 border border-foreground/10 text-[11px] text-foreground/50 italic">
                      Buscando referencias en el manuscrito...
                   </div>
                </div>
             </section>

             {/* Acciones Rápidas */}
             <section className="pt-4 border-t border-foreground/5">
                <button 
                  onClick={() => navigate(`/local/${projectName}/bible/folder/${entity.carpeta_id}/entity/${entity.id}`)}
                  className="w-full py-2 bg-foreground/5 border border-foreground/10 text-[10px] font-black uppercase tracking-widest hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-all"
                >
                  Abrir Ficha Completa
                </button>
             </section>
          </div>
        );

        setRightPanelTab('CONTEXT');
        setRightOpen(true);
      }
    } catch (err) {
      console.error('Error al cargar previsualización de la mención:', err);
    }
  };

  const loadSnapshots = async (hojaId: number) => {
    try {
      const list = await notebookService.getSnapshots(hojaId);
      setSnapshots(list);
    } catch (err) {
      console.error("Error loading snapshots:", err);
    }
  };

  const handleRestoreSnapshot = async (snapshotId: number) => {
    const snap = snapshots.find(s => s.id === snapshotId);
    if (!snap) return;

    if (!window.confirm("¿Estás seguro de restaurar esta versión? Se perderá el contenido actual no guardado.")) return;

    const updatedPages = [...pages];
    updatedPages[currentPageIndex].contenido = snap.contenido;
    setPages(updatedPages);
    
    // Guardar inmediatamente la restauración
    await savePage(updatedPages[currentPageIndex]);
    alert("Versión restaurada con éxito.");
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
    loadSnapshots(pages[index].id);
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

  const renderRightPanel = () => {
    return (
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
  };

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
