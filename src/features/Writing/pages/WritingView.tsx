import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import { notebookService, Cuaderno, Hoja } from '../../../database/notebookService';
import ZenEditor from '../../Editor/components/ZenEditor';
import ConfirmModal from '../../../components/common/ConfirmModal';

const WritingView = () => {
 const { notebookId } = useParams();
 const navigate = useNavigate();

 // --- Context from ArchitectLayout ---
 const { setRightPanelTab, setRightOpen } = useOutletContext<any>();
 const { t } = useLanguage();

 const [notebook, setNotebook] = useState<Cuaderno | null>(null);
 const [pages, setPages] = useState<Hoja[]>([]);
 const [currentPageIndex, setCurrentPageIndex] = useState(0);
 const [saving, setSaving] = useState(false);
 const [loading, setLoading] = useState(true);
 const [deleteModalOpen, setDeleteModalOpen] = useState(false);
 const [pageToDelete, setPageToDelete] = useState<{ id: number; index: number; error?: string } | null>(null);
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

 // Force save on unmount if pending
 if (saveTimeout.current) {
 clearTimeout(saveTimeout.current);
 const currentPage = pagesRef.current[indexRef.current];
 if (currentPage) {
 console.log("Saving on unmount (local):", currentPage.id);
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

 const handleTitleChange = (newTitle: string) => {
 if (!pages[currentPageIndex]) return;

 const updatedPages = [...pages];
 updatedPages[currentPageIndex] = {
 ...updatedPages[currentPageIndex],
 titulo: newTitle
 };
 setPages(updatedPages);

 if (saveTimeout.current) clearTimeout(saveTimeout.current);
 saveTimeout.current = setTimeout(() => {
 savePage(updatedPages[currentPageIndex]);
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
 setPages([...pages, newPage]);
 setCurrentPageIndex(pages.length);
 } catch (err) {
 console.error("Error creating page:", err);
 }
 };

 const handlePageSelect = async (index: number) => {
 // Save current page before switching
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

 // Adjust current index BEFORE setting pages to avoid OOB
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

 const renderRightPanel = () => (
 <div className="flex flex-col h-full monolithic-panel/95">
 {/* Clean Header (Minimalist) */}
 <div className="p-4 border-b border-foreground/10 flex items-center justify-center bg-background/60 relative">
 <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-foreground/60">Chronicle Hub</h3>
 {/* Save status is now subtle, no green dots */}
 {saving && (
 <div className="absolute right-4 animate-pulse">
 <span className="material-symbols-outlined text-xs text-amber-500">sync</span>
 </div>
 )}
 </div>

 {/* Tabs */}
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
 <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
 {pages.map((page, idx) => (
 <div key={page.id} className="group relative">
 <button
 onClick={() => handlePageSelect(idx)}
 className={`w-full text-left p-4 rounded-none border transition-all ${idx === currentPageIndex
 ? 'bg-primary/10 border-primary/30 text-primary'
 : 'bg-foreground/5 border-transparent hover:bg-foreground/10 text-foreground/60'
 }`}
 >
 <div className="flex justify-between items-center mb-1">
 <span className="font-serif font-bold text-sm truncate">{t('writing.page')} {idx + 1}</span>
 {idx === currentPageIndex && <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0 ml-2"></span>}
 </div>
 <p className="text-[10px] line-clamp-2 opacity-50 font-mono break-words leading-relaxed">
 {page.contenido?.replace(/<[^>]+>/g, '').substring(0, 40) || t('writing.empty')}
 </p>
 </button>

 <button
 onClick={(e) => deletePage(e, page.id, idx)}
 className="absolute top-2 right-2 p-1.5 rounded-none text-foreground/60 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
 >
 <span className="material-symbols-outlined text-sm">delete</span>
 </button>
 </div>
 ))}
 </div>
 <div className="p-4 bg-background/20 border-t border-foreground/10">
 <button
 onClick={handleCreatePage}
 className="w-full py-3 bg-primary text-foreground rounded-none text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
 >
 <span className="material-symbols-outlined text-base">add</span>
 <span>{t('writing.new_page')}</span>
 </button>
 </div>
 </div>
 ) : (
 <div className="p-6 space-y-8 animate-in fade-in slide-in-from-right-4">
 <div className="space-y-4">
 <h3 className="text-xs font-black uppercase text-primary mb-4 tracking-widest">
 {t('writing.format')}
 </h3>
 <div className="space-y-3">
 <p className="text-[9px] text-foreground/60 uppercase font-bold mb-3">Atajos de Teclado</p>
 <div className="space-y-2 text-[11px] text-foreground/60">
 <div className="flex justify-between items-center p-2 bg-background/20 rounded">
 <span>Negrita</span>
 <kbd className="px-2 py-1 bg-foreground/5 rounded text-[9px] font-mono">Ctrl+B</kbd>
 </div>
 <div className="flex justify-between items-center p-2 bg-background/20 rounded">
 <span>Cursiva</span>
 <kbd className="px-2 py-1 bg-foreground/5 rounded text-[9px] font-mono">Ctrl+I</kbd>
 </div>
 <div className="flex justify-between items-center p-2 bg-background/20 rounded">
 <span>Mencionar entidad</span>
 <kbd className="px-2 py-1 bg-foreground/5 rounded text-[9px] font-mono">@</kbd>
 </div>
 <div className="flex justify-between items-center p-2 bg-background/20 rounded">
 <span>Deshacer</span>
 <kbd className="px-2 py-1 bg-foreground/5 rounded text-[9px] font-mono">Ctrl+Z</kbd>
 </div>
 <div className="flex justify-between items-center p-2 bg-background/20 rounded">
 <span>Rehacer</span>
 <kbd className="px-2 py-1 bg-foreground/5 rounded text-[9px] font-mono">Ctrl+Y</kbd>
 </div>
 </div>
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
 <div className="animate-pulse text-foreground/60 font-serif text-2xl italic tracking-widest">{t('writing.opening_chronicle')}</div>
 </div>
 );
 }

 return (
 <><div className="flex-1 flex w-full h-full bg-[#111] relative overflow-hidden font-sans text-foreground/60">
 {portalRef && createPortal(renderRightPanel(), portalRef)}

 <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
 <main className="flex-1 flex flex-col relative no-scrollbar">
 {currentPage && (
 <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
 {/* IDE Tabs Header */}
 <div className="h-10 flex items-end px-2 bg-[#0d1117] border-b border-[#1e1e1e] select-none shrink-0">
 <div className="flex items-center h-9 px-4 border-t-[3px] border-[#007acc] bg-[#1e1e1e] text-foreground/60 text-sm gap-2 min-w-[200px] max-w-[300px]">
 <span className="material-symbols-outlined text-[14px] text-blue-400">history_edu</span>
 <input
 type="text"
 className="w-full bg-transparent font-sans text-sm text-foreground/60 placeholder:text-foreground/60 border-none outline-none focus:ring-0 p-0 truncate"
 value={currentPage.titulo || ''}
 onChange={(e) => handleTitleChange(e.target.value)}
 placeholder={`${t('writing.chapter')} ${currentPageIndex + 1}`} />

 {/* Small save indicator in tab */}
 <span className={`material-symbols-outlined text-[14px] transition-opacity ml-2 ${saving ? 'opacity-100 text-blue-400 animate-spin' : 'opacity-0'}`}>sync</span>
 </div>
 </div>

 {/* IDE Editor Container */}
 <div className="flex-1 bg-[#1e1e1e] overflow-y-auto custom-scrollbar flex justify-center">
 <div className="w-full max-w-4xl px-8 py-12">
 <ZenEditor
 content={currentPage.contenido || ''}
 onUpdate={handleContentChange}
 paperMode={true} />
 </div>
 </div>

 </div>
 )}
 </main>
 </div>
 </div>
 <ConfirmModal
 isOpen={deleteModalOpen}
 onClose={() => {
 setDeleteModalOpen(false);
 setPageToDelete(null);
 }}
 onConfirm={pageToDelete?.error === 'one_page' ? () => {
 setDeleteModalOpen(false);
 setPageToDelete(null);
 } : confirmDeletePage}
 title={pageToDelete?.error === 'one_page' ? t('common.error') : t('writing.delete_page')}
 message={pageToDelete?.error === 'one_page' ? t('writing.one_page_error') : t('writing.delete_page_confirm')}
 confirmText={pageToDelete?.error === 'one_page' ? t('common.ok') : t('common.confirm_delete')}
 isDestructive={pageToDelete?.error !== 'one_page'} />
 </>
 );
};

export default WritingView;

