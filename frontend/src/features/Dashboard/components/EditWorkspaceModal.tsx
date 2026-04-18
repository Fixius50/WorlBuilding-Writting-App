import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Proyecto } from '@domain/models/database';
import GlassPanel from '@atoms/GlassPanel';
import Button from '@atoms/Button';

const GENRES = ['FANTASÍA', 'SCI-FI', 'HORROR', 'LORE', 'MISTERIO', 'HISTÓRICO', 'CYBERPUNK', 'STEAMPUNK'];

interface EditWorkspaceModalProps {
 isOpen: boolean;
 onClose: () => void;
 onUpdate: (data: Partial<Proyecto>) => void;
 project: Proyecto;
}

const EditWorkspaceModal: React.FC<EditWorkspaceModalProps> = ({ isOpen, onClose, onUpdate, project }) => {
 if (!isOpen || !project) return null;

 const [imgError, setImgError] = useState(false);

 const [formData, setFormData] = useState({
 nombre: project.nombre,
 descripcion: project.descripcion || '',
 tag: project.tag || 'FANTASÍA',
 image_url: project.image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
 });

 useEffect(() => {
 if (project) {
 setFormData({
 nombre: project.nombre,
 descripcion: project.descripcion || '',
 tag: project.tag || 'FANTASÍA',
 image_url: project.image_url || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800'
 });
 }
 }, [project]);

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 onUpdate({
 nombre: formData.nombre,
 descripcion: formData.descripcion,
 tag: formData.tag,
 image_url: formData.image_url
 });
 onClose();
 };

 return createPortal(
 <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-background/80 animate-in fade-in duration-200" onClick={onClose} />

 <div className="relative w-full max-w-2xl monolithic-panel rounded-none shadow-2xl overflow-hidden flex animate-in zoom-in-95 duration-200">
 {/* Left: Image Preview */}
 <div className="w-1/3 bg-black relative hidden sm:block">
 <img
 src={formData.image_url}
 onError={() => setImgError(true)}
 className={`absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-500 ${imgError ? 'hidden' : ''}`}
 alt="Preview"
 />
 <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent">
 <h4 className="text-foreground font-black text-xl leading-none">{formData.nombre || "Untitled"}</h4>
 <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mt-2 block">{formData.tag}</span>
 </div>
 </div>

 {/* Right: Form */}
 <div className="flex-1 p-8">
 <h2 className="text-2xl font-black text-foreground mb-6">Editar Cuaderno</h2>
 <form onSubmit={handleSubmit} className="space-y-5">

 {/* Title */}
 <div className="space-y-1.5">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">Título del Proyecto</label>
 <input
 type="text"
 name="nombre"
 value={formData.nombre}
 onChange={(e) => setFormData(p => ({ ...p, nombre: e.target.value }))}
 className="w-full monolithic-panel rounded-none px-4 py-3 text-foreground text-sm focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all"
 autoFocus
 />
 </div>

 {/* Genre */}
 <div className="space-y-1.5">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">Género</label>
 <div className="grid grid-cols-2 gap-2">
 {GENRES.slice(0, 4).map(g => (
 <button
 key={g}
 type="button"
 onClick={() => setFormData(p => ({ ...p, tag: g }))}
 className={`px-3 py-2 rounded-none text-[10px] font-bold border transition-all ${formData.tag === g ? 'bg-indigo-500 text-foreground border-indigo-500' : 'bg-[#13141f] border-foreground/40 text-[#94a3b8] hover:border-foreground/40'}`}
 >
 {g}
 </button>
 ))}
 </div>
 </div>

 {/* Image URL */}
 <div className="space-y-1.5">
 <label className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">Imagen de Portada (URL)</label>
 <input
 type="text"
 value={formData.image_url}
 onChange={(e) => { setFormData(p => ({ ...p, image_url: e.target.value })); setImgError(false); }}
 className="w-full monolithic-panel rounded-none px-4 py-3 text-foreground text-xs focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 outline-none transition-all truncate"
 />
 </div>

 <div className="pt-4 flex gap-3">
 <button
 type="button"
 onClick={onClose}
 className="flex-1 px-4 py-3 bg-[#13141f] hover:monolithic-panel rounded-none text-xs font-bold text-[#94a3b8] transition-all"
 >
 Cancelar
 </button>
 <button
 type="submit"
 className="flex-1 px-4 py-3 bg-indigo-500 hover:bg-indigo-400 text-foreground rounded-none text-xs font-bold transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2"
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
