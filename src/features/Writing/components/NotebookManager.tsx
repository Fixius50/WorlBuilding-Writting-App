import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import ConfirmationModal from '../../../components/common/ConfirmationModal';
import { Notebook } from '../../../types/writing';
import ZenEditor from '../../Editor/components/ZenEditor';


// Mock storage for development/fallback if API fails or for local-first speed
const useLocalNotebooks = (projectId: string | number): [Notebook[], (newNotebooks: Notebook[]) => void] => {
 const key = `notebooks_v2_${projectId}`;
 const [notebooks, setNotebooks] = useState<Notebook[]>(() => {
 const saved = localStorage.getItem(key);
 return saved ? JSON.parse(saved) : [];
 });

 const save = (newNotebooks: Notebook[]) => {
 setNotebooks(newNotebooks);
 localStorage.setItem(key, JSON.stringify(newNotebooks));
 };

 return [notebooks, save];
};

interface NotebookManagerProps {
 projectId: number | string | null;
}

const NotebookManager: React.FC<NotebookManagerProps> = ({ projectId }) => {
 const { t } = useLanguage();
 const [notebooks, setNotebooks] = useLocalNotebooks(projectId || 'global');
 const [activeNotebook, setActiveNotebook] = useState<Notebook | null>(null); // If null, show list. If set, show content.
 const [editingTitleId, setEditingTitleId] = useState<string | null>(null);
 const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

 // -- CRUD Operations --

 const createNotebook = () => {
 const newNotebook: Notebook = {
 id: Date.now().toString(),
 titulo: 'Nueva Nota',
 contenido: '',
 updatedAt: new Date().toISOString()
 };
 setNotebooks([newNotebook, ...notebooks]);
 setEditingTitleId(newNotebook.id.toString()); // Auto-focus title edit
 };

 const updateNotebook = (id: string | number, field: keyof Notebook, value: string) => {
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
 <div className="flex flex-col h-full monolithic-panel/50 animate-in slide-in-from-right-4 duration-300">
 {/* Header */}
 <div className="flex items-center gap-2 p-3 border-b border-foreground/10 bg-white/[0.02]">
 <button
 onClick={() => setActiveNotebook(null)}
 className="p-1.5 rounded-none hover:bg-primary/10 text-foreground/60 hover:text-primary transition-colors"
 >
 <span className="material-symbols-outlined text-sm">arrow_back</span>
 </button>
 <input
 className="bg-transparent border-none outline-none font-bold text-foreground text-sm w-full placeholder-slate-600"
 value={activeNotebook.titulo}
 onChange={(e) => updateNotebook(activeNotebook.id, 'titulo', e.target.value)}
 placeholder="Título de la Nota..."
 />
 </div>

 {/* Editor Area */}
 <div className="flex-1 overflow-hidden relative">
 <ZenEditor
 content={activeNotebook.contenido || ''}
 onUpdate={(newContent) => updateNotebook(activeNotebook.id, 'contenido', newContent)}
 paperMode={false}
 />
 </div>


 {/* Footer status */}
 <div className="p-2 text-[10px] text-foreground/60 text-right border-t border-foreground/10">
 {activeNotebook.updatedAt ? `Guardado: ${new Date(activeNotebook.updatedAt).toLocaleTimeString()}` : 'Sin guardar'}
 </div>
 </div>
 );
 }

 // VIEW: Notebook List
 return (
 <div className="flex flex-col h-full monolithic-panel/50">
 {/* Header */}
 <div className="flex items-center justify-between p-3 border-b border-foreground/10 bg-white/[0.02]">
 <h3 className="text-xs font-black uppercase tracking-widest text-foreground/60">Tus Notas Rápidas</h3>
 <button
 onClick={createNotebook}
 className="flex items-center gap-1.5 px-3 py-1.5 rounded-none bg-primary/20 text-primary hover:bg-primary/30 transition-all text-[10px] font-bold uppercase tracking-wide border border-primary/20"
 >
 <span className="material-symbols-outlined text-sm">add</span>
 Nuevo
 </button>
 </div>

 {/* List */}
 <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-2">
 {notebooks.length === 0 ? (
 <div className="flex flex-col items-center justify-center py-10 text-foreground/60 space-y-2 opacity-60">
 <span className="material-symbols-outlined text-3xl">sticky_note_2</span>
 <p className="text-xs">No hay notas</p>
 </div>
 ) : (
 notebooks.map(nb => (
 <div
 key={nb.id}
 onClick={() => setActiveNotebook(nb)}
 className="group relative bg-foreground/5 hover:monolithic-panel hover:border-primary/30 rounded-none p-3 cursor-pointer transition-all hover:translate-x-1"
 >
 <div className="flex justify-between items-start mb-2">
 {editingTitleId === nb.id.toString() ? (
 <input
 className="bg-background/50 border border-primary/50 text-foreground text-xs font-bold rounded px-1 outline-none w-full mr-6"
 value={nb.titulo}
 onChange={(e) => updateNotebook(nb.id, 'titulo', e.target.value)}
 onBlur={() => setEditingTitleId(null)}
 onKeyDown={(e) => e.key === 'Enter' && setEditingTitleId(null)}
 autoFocus
 onClick={(e) => e.stopPropagation()}
 />
 ) : (
 <h4 className="text-xs font-bold text-foreground truncate pr-6 group-hover:text-primary transition-colors">{nb.titulo}</h4>
 )}

 <button
 onClick={(e) => { e.stopPropagation(); setConfirmDeleteId(nb.id.toString()); }}
 className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 p-1 hover:text-red-400 text-foreground/60 transition-all monolithic-panel rounded-none shadow-lg shadow-black/40"
 >
 <span className="material-symbols-outlined text-[14px]">delete</span>
 </button>
 </div>
 <div className="text-[10px] text-foreground/60 line-clamp-2" dangerouslySetInnerHTML={{ __html: nb.contenido?.replace(/<[^>]+>/g, '') || 'Sin contenido...' }} />
 </div>
 ))
 )}
 </div>


 <ConfirmationModal
 isOpen={!!confirmDeleteId}
 onClose={() => setConfirmDeleteId(null)}
 onConfirm={deleteNotebook}
 title="Eliminar Nota"
 message="¿Estás seguro? Esta acción no se puede deshacer."
 confirmText="Eliminar"
 type="danger"
 />
 </div>
 );
};

export default NotebookManager;
