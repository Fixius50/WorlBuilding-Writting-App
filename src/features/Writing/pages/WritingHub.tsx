import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../../services/api';
import Button from '../../../components/common/Button';
import { Notebook } from '../../../types/writing';

const WritingHub = () => {
 const { username, projectName } = useParams();
 const navigate = useNavigate();
 const { t } = useLanguage();
 const { setRightPanelTab, setRightOpen, baseUrl } = useOutletContext<any>();
 const [notebooks, setNotebooks] = useState<Notebook[]>([]);
 const [loading, setLoading] = useState(true);
 const [isCreating, setIsCreating] = useState(false);
 const [newTitle, setNewTitle] = useState('');

 useEffect(() => {
 if (setRightPanelTab) setRightPanelTab('NOTEBOOKS');
 // setRightOpen(false); // Let user decide or default
 loadNotebooks();
 }, [setRightPanelTab]);

 const loadNotebooks = async () => {
 try {
 setLoading(true);
 const data = await api.get('/escritura/cuadernos');
 setNotebooks(data || []);
 } catch (err) {
 console.error("Error loading notebooks:", err);
 } finally {
 setLoading(false);
 }
 };

 const handleCreateNotebook = async (e: React.FormEvent) => {
 e.preventDefault();
 try {
 const nuevo = await api.post('/escritura/cuaderno', { titulo: newTitle || t('writing.new_notebook') });
 setNotebooks([...notebooks, nuevo]);
 setIsCreating(false);
 setNewTitle('');
 navigate(`${baseUrl}/writing/${nuevo.id}`);
 } catch (err) {
 console.error("Error creating notebook:", err);
 }
 };

 const handleDelete = async (e: React.MouseEvent, id: string | number) => {
 e.stopPropagation();
 if (!window.confirm(t('writing.delete_confirm'))) return;
 try {
 await api.delete(`/escritura/cuaderno/${id}`);
 setNotebooks(notebooks.filter(n => n.id !== id));
 } catch (err) {
 console.error("Error deleting notebook:", err);
 }
 };

 if (loading) {
 return (
 <div className="flex-1 flex items-center justify-center bg-background">
 <div className="animate-spin text-primary material-symbols-outlined text-4xl">sync</div>
 </div>
 );
 }

 return (
 <div className="flex-1 flex flex-col bg-background overflow-y-auto no-scrollbar p-12">
 <header className="mb-12 flex justify-between items-end">
 <div>
 <h1 className="text-4xl font-serif font-bold text-foreground mb-2">{t('writing.library')}</h1>
 <p className="text-foreground/60 uppercase text-[10px] font-black tracking-[0.2em]">{t('writing.library_desc')}</p>
 </div>
 <button
 onClick={() => setIsCreating(true)}
 className="group relative px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-none transition-all overflow-hidden"
 >
 <div className="flex items-center gap-2 text-primary">
 <span className="material-symbols-outlined text-sm transition-transform group-hover:rotate-90">add</span>
 <span className="text-[10px] font-black uppercase tracking-widest">{t('writing.new_notebook')}</span>
 </div>
 </button>
 </header>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
 {notebooks.map((nb) => (
 <div
 key={nb.id}
 onClick={() => navigate(`${baseUrl}/writing/${nb.id}`)}
 className="group relative h-64 monolithic-panel border border-foreground/10 rounded-none p-6 cursor-pointer hover:border-primary/50 hover:bg-white/[0.02] transition-all hover:-translate-y-2 flex flex-col justify-between overflow-hidden shadow-2xl"
 >
 {/* Book Spine Decoration */}
 <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/40 group-hover:bg-primary transition-colors"></div>

 <div className="space-y-4">
 <div className="flex justify-between items-start">
 <div className="size-10 rounded-none bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
 <span className="material-symbols-outlined">folder_open</span>
 </div>
 <button
 onClick={(e) => handleDelete(e, nb.id)}
 className="p-1.5 rounded-none text-foreground/60 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
 >
 <span className="material-symbols-outlined text-sm">delete</span>
 </button>
 </div>

 <div>
 <h3 className="text-xl font-serif font-bold text-foreground/60 group-hover:text-primary transition-colors line-clamp-2">{nb.titulo || t('common.no_results')}</h3>
 <p className="text-[10px] text-foreground/60 font-mono mt-1">ID: #{nb.id}</p>
 </div>
 </div>

 <div className="flex items-center gap-2 pt-4 border-t border-foreground/10 opacity-50 group-hover:opacity-100 transition-opacity">
 <span className="material-symbols-outlined text-sm text-primary">auto_stories</span>
 <span className="text-[10px] font-black uppercase tracking-widest text-foreground/60">{t('writing.open_archivador')}</span>
 </div>
 </div>
 ))}
 </div>

 {/* Creation Modal */}
 {isCreating && (
 <div className="fixed inset-0 z-[100] bg-background/80 flex items-center justify-center p-4">
 <div className="monolithic-panel border border-foreground/40 rounded-[2rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
 <div className="flex items-center gap-4 mb-8">
 <div className="size-12 rounded-none bg-primary flex items-center justify-center text-foreground shadow-xl shadow-primary/30">
 <span className="material-symbols-outlined">create_new_folder</span>
 </div>
 <div>
 <h2 className="text-2xl font-serif font-bold text-foreground">{t('writing.new_archivador_title')}</h2>
 <p className="text-[10px] text-foreground/60 uppercase font-black tracking-widest">{t('writing.library_expansion')}</p>
 </div>
 </div>

 <form onSubmit={handleCreateNotebook} className="space-y-6">
 <div className="space-y-2">
 <label className="text-[10px] uppercase font-black text-foreground/60 tracking-[0.2em] ml-2">{t('writing.book_title_label')}</label>
 <input
 autoFocus
 className="w-full monolithic-panel rounded-none px-6 py-4 text-foreground focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-foreground/60"
 placeholder={t('writing.placeholder_title')}
 value={newTitle}
 onChange={e => setNewTitle(e.target.value)}
 required
 />
 </div>

 <div className="flex gap-4 pt-4">
 <button
 type="button"
 onClick={() => setIsCreating(false)}
 className="flex-1 py-4 text-foreground/60 hover:text-foreground font-black uppercase text-[10px] tracking-widest transition-colors"
 >
 {t('writing.cancel_btn')}
 </button>
 <button
 type="submit"
 className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-foreground rounded-none font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
 >
 {t('writing.create_and_open_btn')}
 </button>
 </div>
 </form>
 </div>
 </div>
 )}
 </div>
 );
};

export default WritingHub;
