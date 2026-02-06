import { useState, useEffect, useRef } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import api from '../../../js/services/api';
import ZenEditor from '../../components/editor/ZenEditor';

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
        }, 800); // Reduced from 1500 to 800ms for responsiveness
    };

    const savePage = async (page) => {
        if (isMounted.current) setSaving(true);
        try {
            await api.put(`/escritura/hoja/${page.id}`, { contenido: page.contenido });
        } catch (err) {
            console.error("Error saving page:", err);
        } finally {
            if (isMounted.current) setSaving(false);
        }
    };

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

    const handlePageSelect = (index) => {
        setCurrentPageIndex(index);
    };

    const deletePage = async (e, id, index) => {
        e.stopPropagation();
        if (pages.length <= 1) {
            alert(t('writing.one_page_error'));
            return;
        }
        if (!window.confirm(t('writing.delete_page_confirm'))) return;

        try {
            await api.delete(`/escritura/hoja/${id}`);
            const newPages = pages.filter(p => p.id !== id);
            setPages(newPages);
            if (currentPageIndex === index) {
                setCurrentPageIndex(Math.max(0, index - 1));
            } else if (currentPageIndex > index) {
                setCurrentPageIndex(currentPageIndex - 1);
            }
        } catch (err) {
            console.error("Error deleting page:", err);
        }
    };

    const renderRightPanel = () => (
        <div className="flex flex-col h-full bg-surface-dark/95">
            {/* Dynamic Header for Right Panel (Back & Save Status) */}
            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-black/40">
                <button
                    onClick={() => navigate(`/${useParams().username}/${useParams().projectName}/writing`)}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                >
                    <span className="material-symbols-outlined text-sm">arrow_back</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{t('nav.writing')}</span>
                </button>
                <div className={`w-2 h-2 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500/50'}`} title={saving ? t('common.saving') : t('common.saved')}></div>
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
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-500 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">format_size</span> {t('writing.typography')}
                            </h3>
                            <div className="grid grid-cols-1 gap-2">
                                <p className="text-[9px] text-slate-600 uppercase font-bold italic">{t('writing.typography_desc')}</p>
                                {/* We could add more specific format toggles here that trigger editor commands */}
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
        <div className="flex-1 flex w-full h-full bg-background-dark relative overflow-hidden font-sans">
            {portalRef && createPortal(renderRightPanel(), portalRef)}

            <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
                <main className="flex-1 overflow-y-auto custom-scrollbar flex justify-center bg-transparent relative no-scrollbar">
                    {currentPage && (
                        <div className="w-full min-h-full flex flex-col animate-in slide-in-from-bottom-8 duration-700">
                            {/* Paper Container - Fully expanded */}
                            <div className="flex-1 bg-white overflow-hidden flex flex-col transition-all duration-500 group">
                                {/* Clean header for title */}
                                <div className="h-24 flex items-end px-16 pb-4 border-b border-slate-50">
                                    <input
                                        type="text"
                                        className="w-full bg-transparent text-4xl font-serif font-black text-slate-800 placeholder:text-slate-100 border-none outline-none"
                                        defaultValue={`${t('writing.chapter')} ${currentPageIndex + 1}`}
                                        placeholder={t('writing.title_placeholder')}
                                    />
                                </div>

                                <div className="flex-1 px-16 py-12 text-slate-900">
                                    <ZenEditor
                                        content={currentPage.contenido}
                                        onUpdate={handleContentChange}
                                        paperMode={true}
                                    />
                                </div>

                                <footer className="h-16 border-t border-slate-100 flex items-center justify-between px-16 text-[10px] font-mono text-slate-400 select-none">
                                    <span>{t('writing.page').toUpperCase()} {currentPageIndex + 1} {t('writing.of')} {pages.length}</span>
                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity uppercase font-black tracking-widest">
                                        {notebook?.titulo || t('common.no_results')}
                                    </span>
                                </footer>
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default WritingView;
