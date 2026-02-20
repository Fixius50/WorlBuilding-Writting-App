import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import ConfirmationModal from '../ConfirmationModal';

// Mock storage for development/fallback if API fails or for local-first speed
const useLocalNotebooks = (projectId) => {
    const key = `notebooks_v2_${projectId}`;
    const [notebooks, setNotebooks] = useState(() => {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : [];
    });

    const save = (newNotebooks) => {
        setNotebooks(newNotebooks);
        localStorage.setItem(key, JSON.stringify(newNotebooks));
    };

    return [notebooks, save];
};

const NotebookManager = ({ projectId }) => {
    const { t } = useLanguage();
    const [notebooks, setNotebooks] = useLocalNotebooks(projectId || 'global');
    const [activeNotebook, setActiveNotebook] = useState(null); // If null, show list. If set, show content.
    const [editingTitleId, setEditingTitleId] = useState(null);
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    // -- CRUD Operations --

    const createNotebook = () => {
        const newNotebook = {
            id: Date.now().toString(),
            title: 'Nuevo Cuaderno',
            content: '',
            updatedAt: new Date().toISOString()
        };
        setNotebooks([newNotebook, ...notebooks]);
        setEditingTitleId(newNotebook.id); // Auto-focus title edit
    };

    const updateNotebook = (id, field, value) => {
        const updated = notebooks.map(nb =>
            nb.id === id ? { ...nb, [field]: value, updatedAt: new Date().toISOString() } : nb
        );
        setNotebooks(updated);

        // Also update active notebook state if it's the one being edited
        if (activeNotebook && activeNotebook.id === id) {
            setActiveNotebook({ ...activeNotebook, [field]: value });
        }
    };

    const deleteNotebook = () => {
        if (!confirmDeleteId) return;
        setNotebooks(notebooks.filter(nb => nb.id !== confirmDeleteId));
        if (activeNotebook && activeNotebook.id === confirmDeleteId) {
            setActiveNotebook(null);
        }
        setConfirmDeleteId(null);
    };

    // -- Views --

    if (activeNotebook) {
        // VIEW: Single Notebook Editor
        return (
            <div className="flex flex-col h-full bg-surface-dark/50 animate-in slide-in-from-right-4 duration-300">
                {/* Header */}
                <div className="flex items-center gap-2 p-3 border-b border-white/5 bg-white/[0.02]">
                    <button
                        onClick={() => setActiveNotebook(null)}
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-slate-400 hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-sm">arrow_back</span>
                    </button>
                    <input
                        className="bg-transparent border-none outline-none font-bold text-white text-sm w-full placeholder-slate-600"
                        value={activeNotebook.title}
                        onChange={(e) => updateNotebook(activeNotebook.id, 'title', e.target.value)}
                        placeholder="Título del Cuaderno..."
                    />
                </div>

                {/* Editor Area */}
                <textarea
                    className="flex-1 w-full bg-transparent p-4 text-sm text-slate-300 outline-none resize-none custom-scrollbar leading-relaxed"
                    placeholder="Escribe aquí tus ideas..."
                    value={activeNotebook.content || ''}
                    onChange={(e) => updateNotebook(activeNotebook.id, 'content', e.target.value)}
                    autoFocus
                />

                {/* Footer status */}
                <div className="p-2 text-[10px] text-slate-600 text-right border-t border-white/5">
                    {activeNotebook.updatedAt ? `Guardado: ${new Date(activeNotebook.updatedAt).toLocaleTimeString()}` : 'Sin guardar'}
                </div>
            </div>
        );
    }

    // VIEW: Notebook List
    return (
        <div className="flex flex-col h-full bg-surface-dark/50">
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-white/5 bg-white/[0.02]">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400">Tus Cuadernos</h3>
                <button
                    onClick={createNotebook}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary/20 text-primary hover:bg-primary/30 transition-all text-[10px] font-bold uppercase tracking-wide border border-primary/20"
                >
                    <span className="material-symbols-outlined text-sm">add</span>
                    Nuevo
                </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
                {notebooks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-10 text-slate-600 space-y-2 opacity-60">
                        <span className="material-symbols-outlined text-3xl">library_books</span>
                        <p className="text-xs">No hay cuadernos</p>
                    </div>
                ) : (
                    notebooks.map(nb => (
                        <div
                            key={nb.id}
                            onClick={() => setActiveNotebook(nb)}
                            className="group relative bg-white/5 hover:bg-white/10 border border-white/5 hover:border-primary/30 rounded-xl p-3 cursor-pointer transition-all hover:translate-x-1"
                        >
                            <div className="flex justify-between items-start mb-2">
                                {editingTitleId === nb.id ? (
                                    <input
                                        className="bg-black/50 border border-primary/50 text-white text-xs font-bold rounded px-1 outline-none w-full mr-6"
                                        value={nb.title}
                                        onChange={(e) => updateNotebook(nb.id, 'title', e.target.value)}
                                        onBlur={() => setEditingTitleId(null)}
                                        onKeyDown={(e) => e.key === 'Enter' && setEditingTitleId(null)}
                                        autoFocus
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                ) : (
                                    <h4 className="text-xs font-bold text-white truncate pr-6 group-hover:text-primary transition-colors">{nb.title}</h4>
                                )}

                                <button
                                    onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(nb.id); }}
                                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-slate-500 transition-all bg-surface-dark rounded-md shadow-lg shadow-black/40"
                                >
                                    <span className="material-symbols-outlined text-[14px]">delete</span>
                                </button>
                            </div>
                            <p className="text-[10px] text-slate-500 line-clamp-2">
                                {nb.content || 'Sin contenido...'}
                            </p>
                        </div>
                    ))
                )}
            </div>

            <ConfirmationModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={deleteNotebook}
                title="Eliminar Cuaderno"
                message="¿Estás seguro? Esta acción no se puede deshacer."
                confirmText="Eliminar"
                type="danger"
            />
        </div>
    );
};

export default NotebookManager;
