import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const GENRES = ['FANTASÍA', 'SCI-FI', 'HORROR', 'LORE', 'MISTERIO', 'HISTÓRICO', 'CYBERPUNK', 'STEAMPUNK'];

const CreateWorkspaceModal = ({ isOpen, onClose, onCreate }) => {
    if (!isOpen) return null;

    const [imgError, setImgError] = useState(false);
    const [formData, setFormData] = useState({
        name: '', // Internal filename/ID
        title: '', // Display title
        genre: 'FANTASÍA',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Fallback: if name is empty but title exists, slugify title
        let finalName = formData.name;
        if (!finalName && formData.title) {
            finalName = formData.title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        }

        if (!finalName) {
            alert("Project ID/Name is required");
            return;
        }

        onCreate({
            ...formData,
            name: finalName
        });
        onClose();
        // Reset
        setFormData({
            name: '',
            title: '',
            genre: 'FANTASÍA',
            imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
        });
    };

    return createPortal(
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />

            <div className="relative w-full max-w-2xl bg-[#0a0a0c] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex animate-in zoom-in-95 duration-200">
                {/* Left: Image Preview */}
                <div className="w-1/3 bg-black relative hidden sm:block">
                    <img
                        src={formData.imageUrl}
                        onError={() => setImgError(true)}
                        className={`absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-500 ${imgError ? 'hidden' : ''}`}
                        alt="Preview"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent">
                        <h4 className="text-white font-black text-xl leading-none">{formData.title || "Untitled"}</h4>
                        <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2 block">{formData.genre}</span>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="flex-1 p-8">
                    <h2 className="text-2xl font-black text-white mb-6">Nuevo Cuaderno</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Título del Proyecto</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Las Crónicas de Etheria"
                                className="w-full bg-surface-dark border border-glass-border rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        {/* ID / Filename */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">ID de Archivo (Slug)</label>
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                placeholder="e.g. etheria-v1"
                                className="w-full bg-surface-dark border border-glass-border rounded-xl px-4 py-3 text-white font-mono text-xs focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-white/10"
                            />
                            <p className="text-[10px] text-white/20">Se usará como nombre del archivo .db</p>
                        </div>

                        {/* Genre */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Género</label>
                            <div className="grid grid-cols-2 gap-2">
                                {GENRES.slice(0, 4).map(g => (
                                    <button
                                        key={g}
                                        type="button"
                                        onClick={() => setFormData(p => ({ ...p, genre: g }))}
                                        className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${formData.genre === g ? 'bg-primary text-white border-primary' : 'bg-surface-dark border-glass-border text-text-muted hover:border-white/20'}`}
                                    >
                                        {g}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Image URL */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Imagen de Portada (URL)</label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) => { setFormData(p => ({ ...p, imageUrl: e.target.value })); setImgError(false); }}
                                className="w-full bg-surface-dark border border-glass-border rounded-xl px-4 py-3 text-white text-xs focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all truncate"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-surface-dark hover:bg-white/5 border border-glass-border rounded-xl text-xs font-bold text-text-muted transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">rocket_launch</span>
                                Crear Universo
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default CreateWorkspaceModal;
