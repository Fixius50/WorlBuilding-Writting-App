import React, { useState } from 'react';
import GlassPanel from '../../../components/common/GlassPanel';
import Button from '../../../components/common/Button';

interface CreateProjectModalProps {
 isOpen: boolean;
 onClose: () => void;
 onCreate: (project: { title: string; genre: string }) => void;
}

const CreateProjectModal: React.FC<CreateProjectModalProps> = ({ isOpen, onClose, onCreate }) => {
 const [title, setTitle] = useState('');
 const [genre, setGenre] = useState('Fantasy');

 if (!isOpen) return null;

 const handleSubmit = (e: React.FormEvent) => {
 e.preventDefault();
 onCreate({ title, genre });
 setTitle('');
 onClose();
 };

 return (
 <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
 <div className="absolute inset-0 bg-background/60 " onClick={onClose}></div>
 <div className="relative w-full max-w-md animate-in fade-in zoom-in duration-200">
 <GlassPanel className="p-8 border-primary/30 shadow-2xl shadow-primary/10">
 <h2 className="text-2xl font-bold text-foreground mb-6">Create New World</h2>

 <form onSubmit={handleSubmit} className="space-y-4">
 <div>
 <label className="block text-xs font-bold text-foreground/60 mb-1 uppercase tracking-wider">Project Title</label>
 <input
 type="text"
 value={title}
 onChange={(e) => setTitle(e.target.value)}
 placeholder="e.g., The Realms of Aethelgard"
 className="w-full bg-background/50 border border-foreground/10 rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all"
 autoFocus
 />
 </div>

 <div>
 <label className="block text-xs font-bold text-foreground/60 mb-1 uppercase tracking-wider">Genre</label>
 <select
 value={genre}
 onChange={(e) => setGenre(e.target.value)}
 className="w-full bg-background/50 border border-foreground/10 rounded-none px-4 py-3 text-foreground focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-all appearance-none"
 >
 <option className="bg-[#0f0f13] text-foreground" value="Fantasy">Fantasy</option>
 <option className="bg-[#0f0f13] text-foreground" value="Sci-Fi">Sci-Fi</option>
 <option className="bg-[#0f0f13] text-foreground" value="Horror">Horror</option>
 <option className="bg-[#0f0f13] text-foreground" value="Steampunk">Steampunk</option>
 <option className="bg-[#0f0f13] text-foreground" value="Modern">Modern</option>
 <option className="bg-[#0f0f13] text-foreground" value="Historical">Historical</option>
 </select>
 </div>

 <div className="pt-4 flex justify-end gap-3">
 <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
 <Button variant="primary" type="submit" icon="add">Create World</Button>
 </div>
 </form>
 </GlassPanel>
 </div>
 </div>
 );
};

export default CreateProjectModal;
