import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import api from '../../../js/services/api';
import ZenEditor from '../../components/editor/ZenEditor';
import ConfirmModal from '../../components/common/ConfirmModal';

const WritingView = () => {
    const { notebookId } = useParams();
    const navigate = useNavigate();

    // --- Context from ArchitectLayout ---
    // --- Context from ArchitectLayout ---
    const { setRightPanelTab, setRightOpen } = useOutletContext();
    const { t } = useLanguage();

    const [notebook, setNotebook] = useState(null);
    const [pages, setPages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [pageToDelete, setPageToDelete] = useState(null);
    const saveTimeout = useRef(null);
    const pagesRef = useRef(pages);
    const indexRef = useRef(currentPageIndex);
    const isMounted = useRef(true);

    // Keep refs synced for unmount saving
    useEffect(() => { pagesRef.current = pages; }, [pages]);
    useEffect(() => { indexRef.current = currentPageIndex; }, [currentPageIndex]);

    // Portal Target
    const [portalRef, setPortalRef] = useState(null);
    const [activeTab, setActiveTab] = useState('index'); // 'index' or 'format'

    // Initial Load
    useEffect(() => {
        if (setRightPanelTab) setRightPanelTab('CONTEXT');
        setRightOpen(true);
        if (notebookId) {
            loadNotebookAndPages(notebookId);
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
    // Cleanup & Save on Unmount
    useEffect(() => {
        isMounted.current = true;

        const handleBeforeUnload = (e) => {
            if (saveTimeout.current) {
                e.preventDefault();
                e.returnValue = '';
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);

        return () => {
            isMounted.current = false;
            window.removeEventListener('beforeunload', handleBeforeUnload);

            // Force save on unmount if pending
            if (saveTimeout.current) {
                clearTimeout(saveTimeout.current);
                const currentPage = pagesRef.current[indexRef.current];
                if (currentPage) {
                    console.log("Saving on unmount (keepalive):", currentPage.id);
                    // Use api.request directly to pass keepalive: true
                    api.request(`/escritura/hoja/${currentPage.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({ contenido: currentPage.contenido }),
                        keepalive: true
                    }).catch(err => console.error("Error preventing data loss:", err));
                }
            }
        };
    }, []);

    const loadNotebookAndPages = async (id) => {
        try {
            setLoading(true);
            const nb = await api.get(`/escritura/cuaderno/${id}`);
            setNotebook(nb);

            const pgs = await api.get(`/escritura/cuaderno/${id}/hojas`);
            if (pgs && pgs.length > 0) {
                setPages(pgs);
                setCurrentPageIndex(0);
            } else {
                const newPage = await api.post(`/escritura/cuaderno/${id}/hoja`, {});
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

    const handleContentChange = (newContent) => {
        if (!pages[currentPageIndex]) return;

        const updatedPages = [...pages];
        updatedPages[currentPageIndex].contenido = newContent;
        setPages(updatedPages);

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
            savePage(updatedPages[currentPageIndex]);
        }, 800);
    };

    const handleTitleChange = (newTitle) => {
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

    const savePage = async (page) => {
        if (isMounted.current) setSaving(true);
        try {
            await api.put(`/escritura/hoja/${page.id}`, {
                contenido: page.contenido,
                titulo: page.titulo
            });
        } catch (err) {
            console.error("Error saving page:", err);
        } finally {
            if (isMounted.current) setSaving(false);
        }
    };

    // Safety check for browser close/refresh
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (saveTimeout.current) {
                e.preventDefault();
                e.returnValue = ''; // Trigger browser confirmation dialog

                // Try to save via keepalive
                const currentPage = pages[currentPageIndex];
                if (currentPage) {
                    api.request(`/escritura/hoja/${currentPage.id}`, {
                        method: 'PUT',
                        body: JSON.stringify({
                            contenido: currentPage.contenido,
                            titulo: currentPage.titulo
                        }),
                        keepalive: true
                    }).catch(console.error);
                }
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [pages, currentPageIndex]); // Dependencies needed for closure access

    const handleCreatePage = async () => {
        if (!notebook) return;
        try {
            const newPage = await api.post(`/escritura/cuaderno/${notebook.id}/hoja`, {});
            setPages([...pages, newPage]);
            setCurrentPageIndex(pages.length);
        } catch (err) {
            console.error("Error creating page:", err);
        }
    };

    const handlePageSelect = async (index) => {
        // Save current page before switching
        if (saveTimeout.current) {
            clearTimeout(saveTimeout.current);
        }
        const currentPage = pages[currentPageIndex];
        if (currentPage) {
            try {
                await api.put(`/escritura/hoja/${currentPage.id}`, { contenido: currentPage.contenido });
            } catch (err) {
                console.error("Error saving before page switch:", err);
            }
        }
        setCurrentPageIndex(index);
    };

    const deletePage = (e, id, index) => {
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
            await api.delete(`/escritura/hoja/${id}`);
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
        <div className="flex flex-col h-full bg-surface-dark/95">
            {/* Clean Header (Minimalist) */}
            <div className="p-4 border-b border-white/5 flex items-center justify-center bg-black/60 relative">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Chronicle Hub</h3>
                {/* Save status is now subtle, no green dots */}
                {saving && (
                    <div className="absolute right-4 animate-pulse">
                        <span className="material-symbols-outlined text-xs text-amber-500">sync</span>
                    </div>
                )}
            </div>

            {/* Tabs */}
            <div className="flex p-2 gap-2 border-b border-white/5 bg-black/20">
                <button
                    onClick={() => setActiveTab('index')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'index' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
                >
                    {t('writing.index')}
                </button>
                <button
                    onClick={() => setActiveTab('format')}
                    className={`flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'format' ? 'bg-primary text-white shadow-lg' : 'text-slate-500 hover:text-white'}`}
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
                                        className={`w-full text-left p-4 rounded-2xl border transition-all ${idx === currentPageIndex
                                            ? 'bg-primary/10 border-primary/30 text-primary'
                                            : 'bg-white/5 border-transparent hover:bg-white/10 text-slate-400'
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
                                        className="absolute top-2 right-2 p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                                    >
                                        <span className="material-symbols-outlined text-sm">delete</span>
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-black/20 border-t border-white/5">
                            <button
                                onClick={handleCreatePage}
                                className="w-full py-3 bg-primary text-white rounded-2xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all hover:scale-[1.02] shadow-xl shadow-primary/20"
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
                                <p className="text-[9px] text-slate-500 uppercase font-bold mb-3">Atajos de Teclado</p>
                                <div className="space-y-2 text-[11px] text-slate-400">
                                    <div className="flex justify-between items-center p-2 bg-black/20 rounded">
                                        <span>Negrita</span>
                                        <kbd className="px-2 py-1 bg-slate-800 rounded text-[9px] font-mono">Ctrl+B</kbd>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-black/20 rounded">
                                        <span>Cursiva</span>
                                        <kbd className="px-2 py-1 bg-slate-800 rounded text-[9px] font-mono">Ctrl+I</kbd>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-black/20 rounded">
                                        <span>Mencionar entidad</span>
                                        <kbd className="px-2 py-1 bg-slate-800 rounded text-[9px] font-mono">@</kbd>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-black/20 rounded">
                                        <span>Deshacer</span>
                                        <kbd className="px-2 py-1 bg-slate-800 rounded text-[9px] font-mono">Ctrl+Z</kbd>
                                    </div>
                                    <div className="flex justify-between items-center p-2 bg-black/20 rounded">
                                        <span>Rehacer</span>
                                        <kbd className="px-2 py-1 bg-slate-800 rounded text-[9px] font-mono">Ctrl+Y</kbd>
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
            <div className="flex-1 flex items-center justify-center bg-background-dark">
                <div className="animate-pulse text-slate-500 font-serif text-2xl italic tracking-widest">{t('writing.opening_chronicle')}</div>
            </div>
        );
    }

    return (
        <><div className="flex-1 flex w-full h-full bg-[#111] relative overflow-hidden font-sans text-slate-200">
            {portalRef && createPortal(renderRightPanel(), portalRef)}

            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
                <main className="flex-1 flex flex-col relative no-scrollbar">
                    {currentPage && (
                        <div className="flex-1 flex flex-col overflow-hidden animate-in slide-in-from-bottom-8 duration-700">
                            {/* IDE Tabs Header */}
                            <div className="h-10 flex items-end px-2 bg-[#0d1117] border-b border-[#1e1e1e] select-none shrink-0">
                                <div className="flex items-center h-9 px-4 border-t-[3px] border-[#007acc] bg-[#1e1e1e] text-slate-200 text-sm gap-2 min-w-[200px] max-w-[300px]">
                                    <span className="material-symbols-outlined text-[14px] text-blue-400">history_edu</span>
                                    <input
                                        type="text"
                                        className="w-full bg-transparent font-sans text-sm text-slate-200 placeholder:text-slate-600 border-none outline-none focus:ring-0 p-0 truncate"
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
                                        content={currentPage.contenido}
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

