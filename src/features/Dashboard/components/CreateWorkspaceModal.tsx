import React, { useState } from 'react';
import { createPortal } from 'react-dom';

const GENRES = ['FANTASÍA', 'SCI-FI', 'HORROR', 'LORE', 'MISTERIO', 'HISTÓRICO', 'CYBERPUNK', 'STEAMPUNK'];

interface CreateWorkspaceModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (formData: { name: string, title: string, genre: string, imageUrl?: string }) => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({ isOpen, onClose, onCreate }) => {
    if (!isOpen) return null;

    const [imgError, setImgError] = useState(false);
    const [isCustomGenre, setIsCustomGenre] = useState(false);
    const [formData, setFormData] = useState({
        name: '', // Internal filename/ID
        title: '', // Display title
        genre: 'FANTASÍA',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
    });

    const slugify = (text: string) => {
        return text
            .toString()
            .toLowerCase()
            .trim()
            .normalize('NFD') // Normaliza acentos
            .replace(/[\u0300-\u036f]/g, '') // Quita acentos
            .replace(/\s+/g, '-') // Espacios por guiones
            .replace(/[^\w-]+/g, '') // Quita caracteres especiales
            .replace(/--+/g, '-'); // Quita dobles guiones
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => {
            const newData = { ...prev, [name]: value };
            // Si cambia el título, actualizamos el slug automáticamente
            if (name === 'title') {
                newData.name = slugify(value);
            }
            return newData;
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!formData.title) {
            alert("El título del proyecto es obligatorio");
            return;
        }

        const finalName = formData.name || slugify(formData.title);

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
                        <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-2 block">{formData.genre}</span>
                    </div>
                </div>

                {/* Right: Form */}
                <div className="flex-1 p-8">
                    <h2 className="text-2xl font-black text-white mb-6">Nuevo Cuaderno</h2>
                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Title */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">Título del Proyecto</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Las Crónicas de Etheria"
                                className="w-full bg-[#13141f] border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
                                autoFocus
                            />
                        </div>

                        {/* Genre Section */}
                        <div className="space-y-3 p-4 bg-white/5 border border-white/5 rounded-2xl">
                            <div className="flex items-center justify-between">
                                <label className="text-[10px] font-bold uppercase tracking-widest text-indigo-400">Género</label>
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => setIsCustomGenre(!isCustomGenre)}>
                                    <span className="text-[9px] font-bold uppercase text-white/30 tracking-widest">Personalizado</span>
                                    <div className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${isCustomGenre ? 'bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.4)]' : 'bg-white/10'}`}>
                                        <div className={`absolute top-1 left-1 h-3 w-3 bg-white rounded-full transition-transform duration-300 ${isCustomGenre ? 'translate-x-4' : 'translate-x-0'}`} />
                                    </div>
                                </div>
                            </div>

                            {!isCustomGenre ? (
                                <select
                                    name="genre"
                                    value={formData.genre}
                                    onChange={(e) => setFormData(p => ({ ...p, genre: e.target.value }))}
                                    className="w-full bg-[#13141f] border border-white/10 rounded-xl px-4 py-3 text-white text-[11px] font-bold tracking-widest focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all appearance-none cursor-pointer"
                                    style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 24 24\' stroke=\'%236366f1\'%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'org/19/9 12l-2 2-2-2m14 0l-2 2-2-2\' /%3E%3Cpath stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'2\' d=\'M19 9l-7 7-7-7\' /%3E%3C/svg%3E")', backgroundPosition: 'right 1rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.2em' }}
                                >
                                    {GENRES.map(g => (
                                        <option key={g} value={g} className="bg-[#0a0a0c] text-white py-2">
                                            {g}
                                        </option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="text"
                                    name="genre"
                                    value={formData.genre}
                                    onChange={(e) => setFormData(p => ({ ...p, genre: e.target.value.toUpperCase() }))}
                                    placeholder="E.G. REALISMO MÁGICO"
                                    className="w-full bg-[#13141f] border border-indigo-500/30 rounded-xl px-4 py-3 text-white text-[10px] font-bold tracking-widest focus:border-indigo-500 outline-none transition-all"
                                    autoFocus
                                />
                            )}
                        </div>

                        {/* Image URL */}
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">Imagen de Portada (URL)</label>
                            <input
                                type="text"
                                name="imageUrl"
                                value={formData.imageUrl}
                                onChange={(e) => { setFormData(p => ({ ...p, imageUrl: e.target.value })); setImgError(false); }}
                                className="w-full bg-[#13141f] border border-white/10 rounded-xl px-4 py-3 text-white text-xs focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all truncate"
                            />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex-1 px-4 py-3 bg-[#13141f] hover:bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-[#94a3b8] transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                type="submit"
                                className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-400 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
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
