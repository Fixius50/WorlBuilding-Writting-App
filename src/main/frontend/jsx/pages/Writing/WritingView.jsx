import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import GlassPanel from '../../components/common/GlassPanel';
import Button from '../../components/common/Button';
import api from '../../services/api';

const WritingView = () => {
    const [notebook, setNotebook] = useState(null);
    const [pages, setPages] = useState([]);
    const [currentPageIndex, setCurrentPageIndex] = useState(0); // Index in pages array
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [suggestionPos, setSuggestionPos] = useState({ top: 0, left: 0 });
    const [entities, setEntities] = useState([]);
    const [saving, setSaving] = useState(false);
    const saveTimeout = useRef(null);

    useEffect(() => {
        loadNotebook();
        loadEntities();
    }, []);

    const loadNotebook = async () => {
        try {
            const notebooks = await api.get('/escritura/cuadernos');
            let current = notebooks[0];

            if (!current) {
                // Create default notebook
                current = await api.post('/escritura/cuaderno', { titulo: 'Chronicle' });
            }

            setNotebook(current);
            loadPages(current.id);
        } catch (err) {
            console.error("Error loading notebook:", err);
        }
    };

    const loadPages = async (notebookId) => {
        try {
            const data = await api.get(`/escritura/cuaderno/${notebookId}/hojas`);
            setPages(data);
        } catch (err) {
            console.error("Error loading pages:", err);
        }
    };

    const loadEntities = async () => {
        try {
            const individuals = await api.get('/bd/entidadindividual');
            const zones = await api.get('/bd/zona');
            const collectives = await api.get('/bd/entidadcolectiva');

            setEntities([
                ...individuals.map(e => ({ id: e.id, name: e.nombre, type: 'Character' })),
                ...zones.map(e => ({ id: e.id, name: e.nombre, type: 'Location' })),
                ...collectives.map(e => ({ id: e.id, name: e.nombre, type: 'Item' }))
            ]);
        } catch (err) {
            console.error("Error loading entities:", err);
        }
    };

    const handleContentChange = (newContent) => {
        const updatedPages = [...pages];
        updatedPages[currentPageIndex].contenido = newContent;
        setPages(updatedPages);

        // Auto-save with debounce
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

    const handleKeyDown = (e) => {
        if (e.key === '@') {
            const rect = e.target.getBoundingClientRect();
            setSuggestionPos({ top: rect.top + 20, left: Math.min(rect.left + 50, window.innerWidth - 300) });
            setShowSuggestions(true);
        } else if (e.key === 'Escape') {
            setShowSuggestions(false);
        }
    };

    const insertEntity = (name) => {
        const currentContent = pages[currentPageIndex].contenido;
        handleContentChange(currentContent + name + ' ');
        setShowSuggestions(false);
    };

    const nextPage = () => {
        if (currentPageIndex < pages.length - 1) {
            setCurrentPageIndex(prev => prev + 1);
        } else {
            // Create a new page if we are at the end
            createNewPage();
        }
    };

    const createNewPage = async () => {
        try {
            const newPage = await api.post(`/escritura/cuaderno/${notebook.id}/hoja`, {});
            setPages([...pages, newPage]);
            setCurrentPageIndex(pages.length);
        } catch (err) {
            console.error("Error creating page:", err);
        }
    };

    const currentPage = pages[currentPageIndex] || { contenido: '', numeroPagina: 1 };
    const nextPageData = pages[currentPageIndex + 1];

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050508] relative overflow-hidden">
            {/* Toolbar */}
            <header className="h-14 border-b border-white/5 bg-surface-dark/40 backdrop-blur-md flex items-center justify-between px-8 py-2">
                <div className="flex items-center gap-4">
                    <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-xl">format_bold</span>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-xl">format_italic</span>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-white/5 text-slate-400 hover:text-white transition-colors">
                        <span className="material-symbols-outlined text-xl">link</span>
                    </button>
                    <div className="w-px h-6 bg-white/10 mx-2"></div>
                    <button className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 text-[10px] font-black uppercase tracking-widest text-slate-300 hover:bg-white/10 transition-all">
                        <span className="material-symbols-outlined text-sm">auto_stories</span>
                        Book View
                    </button>
                </div>

                <div className="flex items-center gap-6 text-[10px] font-black uppercase tracking-[0.2em] text-slate-600">
                    <div className="flex items-center gap-2">
                        <div className={`size-1.5 rounded-full ${saving ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500'}`}></div>
                        {saving ? 'SAVING...' : 'SYNCED'}
                    </div>
                </div>
            </header>

            {/* Notebook Container */}
            <main className="flex-1 overflow-y-auto no-scrollbar py-12 px-8 flex justify-center bg-[url('https://grainy-gradients.vercel.app/noise.svg')] bg-repeat">
                <div className="w-full max-w-4xl flex items-stretch gap-1 bg-surface-dark/40 rounded-[2.5rem] border border-white/5 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] overflow-hidden relative group">

                    {/* Spine Decoration */}
                    <div className="absolute left-1/2 top-0 bottom-0 w-8 -translate-x-1/2 bg-gradient-to-r from-transparent via-black/40 to-transparent z-10 pointer-events-none"></div>

                    {/* Left Page */}
                    <article className="flex-1 bg-white/[0.02] p-16 relative border-r border-white/5 flex flex-col gap-8">
                        <header className="flex justify-between items-center opacity-30">
                            <span className="text-[10px] font-black uppercase tracking-widest">{notebook?.titulo || 'Untitled'}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Sheet {currentPage.numeroPagina}</span>
                        </header>

                        <div className="flex-1 flex flex-col">
                            {currentPage.numeroPagina === 1 ? (
                                <h1 className="text-4xl font-manrope font-black text-white mb-12 tracking-tight">{notebook?.titulo || 'The Stars We Inherit'}</h1>
                            ) : null}
                            <textarea
                                className="flex-1 bg-transparent border-none outline-none resize-none text-slate-300 font-serif leading-loose text-lg placeholder:text-slate-700 custom-scrollbar"
                                placeholder="Once upon a time in the Nebula clusters..."
                                value={currentPage.contenido}
                                onChange={(e) => handleContentChange(e.target.value)}
                                onKeyDown={handleKeyDown}
                            />
                        </div>
                    </article>

                    {/* Right Page (Next page or instruction) */}
                    <article className="flex-1 bg-white/[0.01] p-16 relative flex flex-col gap-8">
                        <header className="flex justify-between items-center opacity-30">
                            <span className="text-[10px] font-black uppercase tracking-widest">Workspace</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">Viewer</span>
                        </header>
                        <div className="flex-1 flex flex-col opacity-60">
                            {nextPageData ? (
                                <p className="font-serif leading-loose text-lg select-none text-slate-500 whitespace-pre-wrap line-clamp-[20]">
                                    {nextPageData.contenido || 'This page is currently empty.'}
                                </p>
                            ) : (
                                <p className="font-serif leading-loose text-lg select-none pointer-events-none italic text-slate-500">
                                    This is the end of the current manuscript. Navigating forward will create a new sheet.
                                </p>
                            )}
                        </div>
                    </article>

                    {/* Navigation Overlays */}
                    <div className="absolute inset-y-0 left-0 w-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => setCurrentPageIndex(p => Math.max(0, p - 1))} className="size-12 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all -ml-4 shadow-xl">
                            <span className="material-symbols-outlined">chevron_left</span>
                        </button>
                    </div>
                    <div className="absolute inset-y-0 right-0 w-20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={nextPage} className="size-12 rounded-full bg-black/40 border border-white/10 backdrop-blur-md text-white flex items-center justify-center hover:bg-black/60 transition-all -mr-4 shadow-xl">
                            <span className="material-symbols-outlined">chevron_right</span>
                        </button>
                    </div>
                </div>
            </main>

            {/* Floating Suggestions */}
            {showSuggestions && (
                <GlassPanel
                    className="absolute z-50 w-64 p-2 rounded-2xl border-primary/30 shadow-2xl shadow-primary/20 bg-surface-dark/90 backdrop-blur-xl animate-in fade-in zoom-in-95 duration-200"
                    style={{ top: suggestionPos.top, left: suggestionPos.left }}
                >
                    <header className="px-3 py-2 border-b border-white/5 mb-1">
                        <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">Reference Entity</span>
                    </header>
                    <div className="space-y-1">
                        {entities.map(ent => (
                            <button
                                key={ent.id}
                                onClick={() => insertEntity(ent.name)}
                                className="w-full flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-primary/20 text-xs transition-all text-left"
                            >
                                <span className="material-symbols-outlined text-primary text-sm">
                                    {ent.type === 'Character' ? 'person' : ent.type === 'Location' ? 'location_on' : 'diamond'}
                                </span>
                                <span className="flex-1 font-bold text-slate-200">{ent.name}</span>
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-widest">{ent.type}</span>
                            </button>
                        ))}
                    </div>
                </GlassPanel>
            )}

            {/* Bottom Status */}
            <footer className="h-10 border-t border-white/5 bg-background-dark/80 px-8 flex items-center justify-between">
                <div className="flex items-center gap-6 text-[9px] font-black uppercase tracking-widest text-slate-600">
                    <span>Words: {currentPage.contenido.split(/\s+/).filter(Boolean).length}</span>
                    <span>Characters: {currentPage.contenido.length}</span>
                </div>
                <div className="flex items-center gap-4">
                    <span className="text-[9px] font-black uppercase tracking-widest text-primary">Sheet {currentPage.numeroPagina} of {pages.length}</span>
                </div>
            </footer>
        </div>
    );
};

export default WritingView;
