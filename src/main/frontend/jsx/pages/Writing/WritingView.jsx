import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext, useParams, useNavigate } from 'react-router-dom';
import api from '../../../js/services/api';
import ZenEditor from '../../components/editor/ZenEditor';

const WritingView = () => {
    const { notebookId } = useParams();
    const navigate = useNavigate();

    // --- Context from ArchitectLayout ---
    const { setRightPanelMode, setRightOpen } = useOutletContext();

    const [notebook, setNotebook] = useState(null);
    const [pages, setPages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(true);
    const saveTimeout = useRef(null);

    // Portal Target
    const [portalRef, setPortalRef] = useState(null);

    // Initial Load
    useEffect(() => {
        setRightPanelMode('NOTES');
        setRightOpen(true);
        if (notebookId) {
            loadNotebookAndPages(notebookId);
        } else {
            // Attempt to find the default notebook for the current project
            fetchDefaultNotebook();
        }
    }, [notebookId]);

    const fetchDefaultNotebook = async () => {
        try {
            setLoading(true);
            const data = await api.get('/escritura/cuadernos');
            if (data && data.length > 0) {
                // Take the first one (usually the only one for now)
                loadNotebookAndPages(data[0].id);
            } else {
                console.warn("No notebook found for this project.");
                navigate(-1);
            }
        } catch (err) {
            console.error("Error fetching default notebook:", err);
            navigate(-1);
        }
    };

    // Find portal target
    useEffect(() => {
        const checkPortal = setInterval(() => {
            const el = document.getElementById('architect-right-panel-portal');
            if (el) {
                setPortalRef(el);
                clearInterval(checkPortal);
            }
        }, 100);
        return () => clearInterval(checkPortal);
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
        }, 1500);
    };

    const savePage = async (page) => {
        setSaving(true);
        try {
            await api.put(`/escritura/hoja/${page.id}`, { contenido: page.contenido });
        } catch (err) {
            console.error("Error saving page:", err);
        } finally {
            setSaving(false);
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

    const renderPageIndex = () => (
        <div className="flex flex-col h-full bg-[#08080A]">
            <div className="h-12 border-b border-white/5 flex items-center px-4 font-mono text-[10px] uppercase tracking-widest text-slate-500">
                Library Index · {pages.length} Pages
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {pages.map((page, idx) => (
                    <button
                        key={page.id}
                        onClick={() => handlePageSelect(idx)}
                        className={`w-full text-left p-3 rounded-lg border transition-all group ${idx === currentPageIndex
                            ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
                            : 'bg-transparent border-transparent hover:bg-white/5 text-slate-400'
                            }`}
                    >
                        <div className="flex justify-between items-center mb-1">
                            <span className="font-serif font-bold text-sm truncate">Page {page.numeroPagina}</span>
                            {idx === currentPageIndex && <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 ml-2"></span>}
                        </div>
                        <p className="text-[10px] line-clamp-2 opacity-50 font-mono break-words">
                            {page.contenido?.replace(/<[^>]+>/g, '').substring(0, 50) || "Empty page..."}
                        </p>
                    </button>
                ))}
            </div>
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={handleCreatePage}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/5 rounded-lg text-[10px] font-black uppercase tracking-widest text-slate-300 flex items-center justify-center gap-2 transition-all"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    <span>New Page</span>
                </button>
            </div>
        </div>
    );

    const currentPage = pages[currentPageIndex];

    if (loading) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#050508]">
                <div className="animate-pulse text-slate-500 font-mono">Opening chronicle...</div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex w-full h-full bg-[#050508] relative overflow-hidden">
            {portalRef && createPortal(renderPageIndex(), portalRef)}

            <div className="flex-1 flex flex-col relative z-10">
                <header className="h-12 border-b border-white/5 bg-surface-dark/40 backdrop-blur-md flex items-center justify-between px-6 select-none">
                    <div className="flex items-center gap-4 text-xs font-serif text-slate-400">
                        <button onClick={() => navigate(-1)} className="hover:text-white transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Biblioteca
                        </button>
                        <span className="opacity-20">|</span>
                        <span className="text-slate-300 font-bold tracking-wide">{notebook?.titulo}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>{saving ? 'Saving...' : 'All Changes Saved'}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500/50'}`}></div>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto custom-scrollbar flex justify-center bg-[#101012] relative">
                    {currentPage && (
                        <div className="w-full max-w-3xl py-12 px-8 min-h-full flex flex-col">
                            <input
                                type="text"
                                className="w-full bg-transparent text-4xl font-serif font-bold text-slate-200 placeholder:text-slate-700 border-none outline-none mb-8 text-center"
                                defaultValue={`Page ${currentPage.numeroPagina}`}
                                readOnly
                            />

                            <div className="flex-1 bg-white/5 border border-white/5 rounded-sm shadow-2xl shadow-black/50 overflow-hidden relative">
                                <ZenEditor
                                    content={currentPage.contenido}
                                    onUpdate={handleContentChange}
                                />
                            </div>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
};

export default WritingView;
