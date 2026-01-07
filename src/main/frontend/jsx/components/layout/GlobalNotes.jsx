import React, { useState, useEffect } from 'react';
import ConfirmationModal from '../ConfirmationModal'; // Adjust path if needed

const GlobalNotes = ({ projectName }) => {
    const [notes, setNotes] = useState([]);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState(null);

    useEffect(() => {
        const saved = localStorage.getItem(`notes_v2_${projectName}`);
        if (saved) {
            setNotes(JSON.parse(saved));
        } else {
            // Migration from old single string if exists
            const oldNotes = localStorage.getItem(`notes_${projectName}`);
            if (oldNotes) {
                const initialNote = { id: Date.now(), title: 'Nota General', content: oldNotes };
                setNotes([initialNote]);
                localStorage.setItem(`notes_v2_${projectName}`, JSON.stringify([initialNote]));
            }
        }
    }, [projectName]);

    const saveNotes = (newNotes) => {
        setNotes(newNotes);
        localStorage.setItem(`notes_v2_${projectName}`, JSON.stringify(newNotes));
    };

    const addNote = () => {
        const newNote = {
            id: Date.now(),
            title: 'Nueva Nota',
            content: ''
        };
        saveNotes([...notes, newNote]);
        setEditingNoteId(newNote.id);
    };

    // Modal State
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    const deleteNote = (id) => {
        setConfirmDeleteId(id);
    };

    const confirmDeleteAction = () => {
        if (!confirmDeleteId) return;
        saveNotes(notes.filter(n => n.id !== confirmDeleteId));
        setConfirmDeleteId(null);
    };

    const updateNote = (id, field, value) => {
        saveNotes(notes.map(n => n.id === id ? { ...n, [field]: value } : n));
    };

    const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

    const Content = () => (
        <div className={`flex flex-col h-full bg-surface-dark/40 ${!isFullscreen ? 'max-h-[25vh]' : ''}`}>
            {/* Header */}
            <div className="flex items-center justify-between p-3 border-b border-glass-border bg-white/5">
                <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-sm text-primary">edit_note</span>
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-white">Notas ({notes.length})</h3>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={addNote} className="p-1 hover:text-primary text-text-muted transition-colors" title="Añadir Nota">
                        <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                    <button onClick={toggleFullscreen} className="p-1 hover:text-white text-text-muted transition-colors" title="Pantalla Completa">
                        <span className="material-symbols-outlined text-sm">{isFullscreen ? 'fullscreen_exit' : 'fullscreen'}</span>
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
                {notes.length === 0 ? (
                    <div className="py-8 text-center opacity-30 italic text-[10px] uppercase font-bold">Sin notas</div>
                ) : (
                    notes.map(note => (
                        <div key={note.id} className="group bg-white/5 border border-glass-border rounded-xl overflow-hidden hover:border-primary/30 transition-all">
                            <div className="flex items-center justify-between px-3 py-2 bg-white/5">
                                <input
                                    className="bg-transparent border-none text-[11px] font-bold text-white outline-none w-full"
                                    value={note.title}
                                    onChange={(e) => updateNote(note.id, 'title', e.target.value)}
                                    placeholder="Título..."
                                />
                                <button
                                    onClick={() => deleteNote(note.id)}
                                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-red-400 transition-all"
                                >
                                    <span className="material-symbols-outlined text-xs">delete</span>
                                </button>
                            </div>
                            <textarea
                                className="w-full bg-transparent p-3 text-xs text-white/70 outline-none resize-none min-h-[80px] custom-scrollbar"
                                value={note.content}
                                onChange={(e) => updateNote(note.id, 'content', e.target.value)}
                                placeholder="Escribe el contenido aquí..."
                            />
                        </div>
                    ))
                )}
            </div>
            {/* Confirmation Modal */}
            <ConfirmationModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDeleteAction}
                title="Eliminar Nota"
                message="¿Estás seguro de que quieres eliminar esta nota? No se podrá recuperar."
                confirmText="Eliminar"
                type="danger"
            />
        </div>
    );

    if (isFullscreen) {
        return (
            <div className="fixed inset-0 z-[100] bg-background-dark/95 backdrop-blur-md p-8 flex flex-col items-center">
                <div className="w-full max-w-4xl h-full flex flex-col border border-glass-border rounded-3xl overflow-hidden shadow-2xl bg-surface-dark">
                    <Content />
                </div>
            </div>
        );
    }

    return (
        <div className="h-full border border-glass-border rounded-2xl overflow-hidden">
            <Content />
        </div>
    );
};

export default GlobalNotes;
