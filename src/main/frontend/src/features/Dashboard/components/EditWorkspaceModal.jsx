import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';

const GENRES = ['FANTASÍA', 'SCI-FI', 'HORROR', 'LORE', 'MISTERIO', 'HISTÓRICO', 'CYBERPUNK', 'STEAMPUNK'];

const EditWorkspaceModal = ({ isOpen, onClose, onUpdate, project }) => {
    if (!isOpen || !project) return null;

    const [imgError, setImgError] = useState(false);

    // We initialize form data from the passed project prop
    // Note: Since listWorkspaces currently returns STRINGS, 'project' is just a string name.
    // We don't have the real metadata here yet.
    // We will allow the user to SET the metadata, starting from defaults or blank.
    // Ideally we would fetch /api/proyectos/{name} to get current meta first.
    // But for now, let's assume empty or mock defaults, user overwrites them.
    const [formData, setFormData] = useState({
        name: project, // Read only identifier
        title: project,
        genre: 'FANTASÍA',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
    });

    useEffect(() => {
        if (project) {
            setFormData(prev => ({
                ...prev,
                name: project,
                title: project // Default title = ID
            }));
        }
    }, [project]);

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdate(formData.name, {
            title: formData.title,
            genre: formData.genre,
            imageUrl: formData.imageUrl
        });
        onClose();
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
                    <h2 className="text-2xl font-black text-white mb-6">Editar Cuaderno</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">Título del Proyecto</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))}
                                className="w-full bg-[#13141f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        {/* ID / Filename (Read Only) */}
                        <div className="space-y-1.5 opacity-50">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted">ID de Archivo (Inmutable)</label>
                            <input
                                type="text"
                                value={formData.name}
                                readOnly
                                className="w-full bg-[#0a0a0c] border border-white/5 rounded-xl px-4 py-3 text-white/50 font-mono text-xs outline-none cursor-not-allowed"
                            />
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
                                        className={`px-3 py-2 rounded-lg text-[10px] font-bold border transition-all ${formData.genre === g ? 'bg-primary text-white border-primary' : 'bg-[#13141f] border-white/10 text-text-muted hover:border-white/20'}`}
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
                                value={formData.imageUrl}
                                onChange={(e) => { setFormData(p => ({ ...p, imageUrl: e.target.value })); setImgError(false); }}
                                className="w-full bg-[#13141f] border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all truncate"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-[#13141f] hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-text-muted transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-primary hover:bg-primary-light text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
                            >
                                <span className="material-symbols-outlined text-sm">save</span>
                                Guardar Cambios
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default EditWorkspaceModal;
