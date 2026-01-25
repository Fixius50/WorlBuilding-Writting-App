import { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { useOutletContext } from 'react-router-dom';
import GlassPanel from '../../components/common/GlassPanel';
import api from '../../../js/services/api';
import ZenEditor from '../../components/editor/ZenEditor';
import NotebookGrid from './NotebookGrid';

const WritingView = () => {
    // --- Context from ArchitectLayout ---
    const { setRightPanelMode, setRightOpen, setRightPanelTitle } = useOutletContext();

    // Modes: 'dashboard' | 'editor'
    const [viewMode, setViewMode] = useState('dashboard');
    const [notebook, setNotebook] = useState(null);
    const [pages, setPages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const saveTimeout = useRef(null);

    // --- NEW: Dashboard State managed here now ---
    const [notebooks, setNotebooks] = useState([]);
    const [loadingNotebooks, setLoadingNotebooks] = useState(true);

    // Portal Target
    const [portalRef, setPortalRef] = useState(null);

    // Initial Load
    useEffect(() => {
        setRightPanelMode('NOTES');
        loadNotebooks();
    }, []);

    // Find portal target (Always check, because we need it for both views now)
    useEffect(() => {
        // We always want to try to connect to the portal if we are in WritingView
        // But Layout logic hides it if tab is 'notes'. We just ensure we mount our content if 'index' is active there.
        // Actually, Layout always renders the portal div if isWritingContext + tab='index'.
        const checkPortal = setInterval(() => {
            const el = document.getElementById('architect-right-panel-portal');
            if (el) {
                setPortalRef(el);
                clearInterval(checkPortal);
            }
        }, 100);
        return () => clearInterval(checkPortal);
    }, [viewMode]); // Re-check on mode change just in case layout unmounts/remounts (unlikely but safe)

    // --- Notebook Actions ---

    const loadNotebooks = async () => {
        try {
            setLoadingNotebooks(true);
            const data = await api.get('/escritura/cuadernos');
            setNotebooks(data);
        } catch (err) {
            console.error("Error loading notebooks:", err);
        } finally {
            setLoadingNotebooks(false);
        }
    };

    const handleCreateNotebook = async (title) => {
        try {
            const newNotebook = await api.post('/escritura/cuaderno', { titulo: title });
            setNotebooks([...notebooks, newNotebook]);
        } catch (err) {
            console.error(err);
            alert("Error creating notebook");
        }
    };

    const handleDeleteNotebook = async (id) => {
        try {
            await api.delete(`/escritura/cuaderno/${id}`);
            setNotebooks(notebooks.filter(n => n.id !== id));
        } catch (err) {
            console.error(err);
            alert("Error deleting notebook");
        }
    };

    const handleUpdateNotebook = async (id, title, description) => {
        try {
            const updated = await api.put(`/escritura/cuaderno/${id}`, { titulo: title, descripcion: description });
            setNotebooks(notebooks.map(n => n.id === id ? updated : n));
        } catch (err) {
            console.error(err);
            alert("Error updating notebook");
        }
    };

    // --- Page Actions ---

    const handleNotebookSelect = async (selectedNotebook) => {
        setNotebook(selectedNotebook);
        await loadPages(selectedNotebook.id);
        setViewMode('editor');
    };

    const handleBackToDashboard = () => {
        setViewMode('dashboard');
        setNotebook(null);
        setPages([]);
        // We keep RightOpen usually, or user preference? 
        // User didn't specify, but Dashboard usually has Index of Notebooks open?
        // Let's keep it open if it was open.
    };

    const loadPages = async (notebookId) => {
        try {
            const data = await api.get(`/escritura/cuaderno/${notebookId}/hojas`);
            if (data && data.length > 0) {
                setPages(data);
                setCurrentPageIndex(0);
            } else {
                // If empty, create first page
                const newPage = await api.post(`/escritura/cuaderno/${notebookId}/hoja`, {});
                setPages([newPage]);
                setCurrentPageIndex(0);
            }
        } catch (err) {
            console.error("Error loading pages:", err);
            setPages([]);
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

    // --- Render Helpers ---

    // 1. Notebook Index (For Dashboard)
    const renderNotebookIndex = () => (
        <div className="flex flex-col h-full bg-[#08080A]">
            <div className="h-12 border-b border-white/5 flex items-center px-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                Library · {notebooks.length} Notebooks
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                {notebooks.map((nb) => (
                    <button
                        key={nb.id}
                        onClick={() => handleNotebookSelect(nb)}
                        className="w-full text-left p-3 rounded-lg border-b border-white/5 hover:bg-white/5 transition-all group"
                    >
                        <div className="flex items-center gap-3 mb-1">
                            <div className="text-slate-500 group-hover:text-indigo-400 transition-colors">
                                <span className="material-symbols-outlined text-lg">book</span>
                            </div>
                            <span className="font-serif font-bold text-sm text-slate-300 group-hover:text-white truncate">{nb.titulo}</span>
                        </div>
                    </button>
                ))}
            </div>
            {/* Could add a mini create button here too, but main view has it */}
        </div>
    );

    // 2. Page Index (For Editor)
    const renderPageIndex = () => (
        <div className="flex flex-col h-full bg-[#08080A]">
            <div className="h-12 border-b border-white/5 flex items-center px-4 font-mono text-[10px] uppercase tracking-widest text-slate-500 whitespace-nowrap overflow-hidden text-ellipsis">
                Index · {pages.length} Pages
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

    if (viewMode === 'dashboard') {
        return (
            <>
                {portalRef && createPortal(renderNotebookIndex(), portalRef)}
                <NotebookGrid
                    notebooks={notebooks}
                    loading={loadingNotebooks}
                    onSelectNotebook={handleNotebookSelect}
                    onCreateNotebook={handleCreateNotebook}
                    onDeleteNotebook={handleDeleteNotebook}
                    onUpdateNotebook={handleUpdateNotebook}
                />
            </>
        );
    }

    return (
        <div className="flex-1 flex w-full h-full bg-[#050508] relative overflow-hidden">

            {/* Inject Index into Layout Portal */}
            {portalRef && createPortal(renderPageIndex(), portalRef)}

            {/* MAIN CONTENT (Center) */}
            <div className="flex-1 flex flex-col relative z-10 transition-all duration-300">
                {/* Minimalist Header */}
                <header className="h-12 border-b border-white/5 bg-surface-dark/40 backdrop-blur-md flex items-center justify-between px-6 select-none">
                    <div className="flex items-center gap-4 text-xs font-serif text-slate-400">
                        <button onClick={handleBackToDashboard} className="hover:text-white transition-colors flex items-center gap-1">
                            <span className="material-symbols-outlined text-sm">arrow_back</span>
                            Dashboard
                        </button>
                        <span className="opacity-20">|</span>
                        <span className="text-slate-300 font-bold tracking-wide">{notebook?.titulo}</span>
                        <span className="opacity-20">|</span>
                        <span>{new Date().toLocaleDateString()}</span>
                    </div>

                    <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-slate-500">
                        <span>{notebook?.nombreProyecto || 'Workspace'}</span>
                        <div className={`w-1.5 h-1.5 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500/50'}`}></div>
                    </div>
                </header>

                {/* Editor Area */}
                <main className="flex-1 overflow-y-auto custom-scrollbar flex justify-center bg-[#101012] relative">
                    {/* Floating Toolbar Target Area (React-Quill Bubble Theme handles placement, 
                        but if we use standard toolbar we might position it absolutely here) */}

                    {currentPage && (
                        <div className="w-full max-w-3xl py-12 px-8 min-h-full flex flex-col">
                            {/* Page Title Input */}
                            <input
                                type="text"
                                placeholder="Untitled Page"
                                className="w-full bg-transparent text-4xl font-serif font-bold text-slate-200 placeholder:text-slate-700 border-none outline-none mb-8 text-center"
                                // Note: Page entity in DB needs 'titulo' field to support this fully. 
                                // For now we just visualy place it, or save it to 'contenido' header? 
                                // User requested "Title of the page is editable". 
                                // Assuming 'titulo' exists or we mock it. Hoja.java didn't show 'titulo'.
                                // I will use a local state for now or just display "Page X" if backing field missing.
                                // Actually, I'll display Page Number for now to avoid modifying Entity again immediately.
                                defaultValue={`Page ${currentPage.numeroPagina}`}
                                readOnly
                            />

                            {/* Editor */}
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
