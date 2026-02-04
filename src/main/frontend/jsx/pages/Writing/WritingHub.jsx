import React, { useState, useEffect } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { useParams, useNavigate, useOutletContext } from 'react-router-dom';
import api from '../../../js/services/api';
import Button from '../../components/common/Button';

const WritingHub = () => {
    const { username, projectName } = useParams();
    const navigate = useNavigate();
    const { t } = useLanguage();
    const { setRightPanelMode, setRightOpen, setRightPanelTitle } = useOutletContext();
    const [notebooks, setNotebooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isCreating, setIsCreating] = useState(false);
    const [newTitle, setNewTitle] = useState('');

    useEffect(() => {
        setRightPanelMode('NOTES');
        setRightOpen(false);
        setRightPanelTitle(t('writing.library'));
        loadNotebooks();
    }, []);

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

    const handleCreateNotebook = async (e) => {
        e.preventDefault();
        try {
            const nuevo = await api.post('/escritura/cuaderno', { titulo: newTitle || t('writing.new_notebook') });
            setNotebooks([...notebooks, nuevo]);
            setIsCreating(false);
            setNewTitle('');
            navigate(`/${username}/${projectName}/writing/${nuevo.id}`);
        } catch (err) {
            console.error("Error creating notebook:", err);
        }
    };

    const handleDelete = async (e, id) => {
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
            <div className="flex-1 flex items-center justify-center bg-background-dark">
                <div className="animate-spin text-primary material-symbols-outlined text-4xl">sync</div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col bg-background-dark overflow-y-auto no-scrollbar p-12">
            <header className="mb-12 flex justify-between items-end">
                <div>
                    <h1 className="text-4xl font-serif font-bold text-white mb-2">{t('writing.library')}</h1>
                    <p className="text-slate-500 uppercase text-[10px] font-black tracking-[0.2em]">{t('writing.library_desc')}</p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="group relative px-6 py-3 bg-primary/10 hover:bg-primary/20 border border-primary/30 rounded-2xl transition-all overflow-hidden"
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
                        onClick={() => navigate(`/${username}/${projectName}/writing/${nb.id}`)}
                        className="group relative h-64 bg-surface-dark border border-white/5 rounded-3xl p-6 cursor-pointer hover:border-primary/50 hover:bg-white/[0.02] transition-all hover:-translate-y-2 flex flex-col justify-between overflow-hidden shadow-2xl"
                    >
                        {/* Book Spine Decoration */}
                        <div className="absolute left-0 top-0 bottom-0 w-1.5 bg-primary/40 group-hover:bg-primary transition-colors"></div>

                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div className="size-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                    <span className="material-symbols-outlined">folder_open</span>
                                </div>
                                <button
                                    onClick={(e) => handleDelete(e, nb.id)}
                                    className="p-1.5 rounded-lg text-slate-600 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>

                            <div>
                                <h3 className="text-xl font-serif font-bold text-slate-100 group-hover:text-primary transition-colors line-clamp-2">{nb.titulo || t('common.no_results')}</h3>
                                <p className="text-[10px] text-slate-500 font-mono mt-1">ID: #{nb.id}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pt-4 border-t border-white/5 opacity-50 group-hover:opacity-100 transition-opacity">
                            <span className="material-symbols-outlined text-sm text-primary">auto_stories</span>
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{t('writing.open_archivador')}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Creation Modal */}
            {isCreating && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface-dark border border-white/10 rounded-[2rem] p-10 w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-xl shadow-primary/30">
                                <span className="material-symbols-outlined">create_new_folder</span>
                            </div>
                            <div>
                                <h2 className="text-2xl font-serif font-bold text-white">New Archivador</h2>
                                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Library Expansion</p>
                            </div>
                        </div>

                        <form onSubmit={handleCreateNotebook} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] ml-2">Book Title</label>
                                <input
                                    autoFocus
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all placeholder:text-slate-700"
                                    placeholder="The Chronicles of Void..."
                                    value={newTitle}
                                    onChange={e => setNewTitle(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="flex gap-4 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setIsCreating(false)}
                                    className="flex-1 py-4 text-slate-400 hover:text-white font-black uppercase text-[10px] tracking-widest transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="flex-[2] py-4 bg-primary hover:bg-primary-dark text-white rounded-2xl font-black uppercase text-[10px] tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all"
                                >
                                    Create and Open
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
