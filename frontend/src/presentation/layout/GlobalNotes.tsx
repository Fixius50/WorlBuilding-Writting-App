import React, { useState, useEffect } from 'react';
import { settingsService } from '@repositories/settingsService';
import ConfirmationModal from '@organisms/ConfirmationModal';

interface Note {
 id: number;
 title: string;
 content: string;
}

interface GlobalNotesProps {
 projectName: string;
 storageKey?: string;
}

const GlobalNotes: React.FC<GlobalNotesProps> = ({ projectName, storageKey }) => {
 const [notes, setNotes] = useState<Note[]>([]);
 const [isFullscreen, setIsFullscreen] = useState(false);
 const [editingNoteId, setEditingNoteId] = useState<number | null>(null);

 const getStorageKey = () => storageKey || `notes_v2_${projectName}`;

 useEffect(() => {
  const loadNotes = async () => {
    const key = getStorageKey();
    if (!key) return;

    const saved = await settingsService.get(key);
    if (saved) {
      setNotes(JSON.parse(saved));
    } else if (!storageKey) {
      // Migration from old single string if exists (ONLY for global project notes)
      // Since we are moving to SQLite, we check if there's anything in localStorage to migrate once
      const oldNotes = localStorage.getItem(`notes_${projectName}`);
      if (oldNotes) {
        const initialNote = { id: Date.now(), title: 'Nota General', content: oldNotes };
        const newNotes = [initialNote];
        setNotes(newNotes);
        await settingsService.set(key, JSON.stringify(newNotes));
        localStorage.removeItem(`notes_${projectName}`); // Cleanup
      }
    }
  };
  loadNotes();
 }, [projectName, storageKey]);

 const saveNotes = async (newNotes: Note[]) => {
  setNotes(newNotes);
  const key = getStorageKey();
  if (key) {
    await settingsService.set(key, JSON.stringify(newNotes));
  }
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
 const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);

 const deleteNote = (id: number) => {
 setConfirmDeleteId(id);
 };

 const confirmDeleteAction = () => {
 if (!confirmDeleteId) return;
 saveNotes(notes.filter(n => n.id !== confirmDeleteId));
 setConfirmDeleteId(null);
 };

 const updateNote = (id: number, field: keyof Note, value: string) => {
 saveNotes(notes.map(n => n.id === id ? { ...n, [field]: value } : n));
 };

 const toggleFullscreen = () => setIsFullscreen(!isFullscreen);

 const Content = () => (
 <div className={`flex flex-col h-full monolithic-panel/40 ${!isFullscreen ? 'max-h-[25vh]' : ''}`}>
 {/* Header */}
 <div className="flex items-center justify-between p-3 border-b border-foreground/10 bg-foreground/5">
 <div className="flex items-center gap-2">
 <span className="material-symbols-outlined text-sm text-primary">edit_note</span>
 <h3 className="text-[10px] font-black uppercase tracking-widest text-foreground">Notas ({notes.length})</h3>
 </div>
 <div className="flex items-center gap-2">
 <button onClick={addNote} className="p-1 hover:text-primary text-text-muted transition-colors" title="Añadir Nota">
 <span className="material-symbols-outlined text-sm">add</span>
 </button>
 <button onClick={toggleFullscreen} className="p-1 hover:text-foreground text-text-muted transition-colors" title="Pantalla Completa">
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
 <div key={note.id} className="group bg-foreground/5 border border-foreground/10 rounded-none overflow-hidden hover:border-primary/30 transition-all">
 <div className="flex items-center justify-between px-3 py-2 bg-foreground/5">
 <input
 className="bg-transparent border-none text-[11px] font-bold text-foreground outline-none w-full"
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
 className="w-full bg-transparent p-3 text-xs text-foreground/70 outline-none resize-none min-h-[80px] custom-scrollbar"
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
 <div className="fixed inset-0 z-[100] bg-background/95 p-8 flex flex-col items-center">
 <div className="w-full max-w-4xl h-full flex flex-col border border-foreground/10 rounded-none overflow-hidden shadow-2xl monolithic-panel">
 <Content />
 </div>
 </div>
 );
 }

 return (
 <div className="h-full border border-foreground/10 rounded-none overflow-hidden">
 <Content />
 </div>
 );
};

export default GlobalNotes;
