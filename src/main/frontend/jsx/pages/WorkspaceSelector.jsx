import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceService } from '../../js/services/api';
import CreateWorkspaceModal from "../components/dashboard/CreateWorkspaceModal";

const WorkspaceSelector = () => {
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    useEffect(() => {
        loadWorkspaces();
    }, []);

    const loadWorkspaces = async () => {
        try {
            setLoading(true);
            const data = await workspaceService.list();
            setWorkspaces(data);
        } catch (err) {
            console.error("Failed to load workspaces", err);
            setError("Error al cargar cuadernos. ¿Está el servidor encendido?");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (projectName) => {
        try {
            setLoading(true);
            const response = await workspaceService.select(projectName);
            if (response.success && response.redirect) {
                localStorage.setItem('user', JSON.stringify({ username: 'local', success: true }));
                navigate(response.redirect);
            }
        } catch (err) {
            setError(err.message || "Fallo al entrar al cuaderno");
            setLoading(false);
        }
    };

    const handleCreateWorkspace = async (formData) => {
        // formData: { name, title, genre, imageUrl }
        try {
            setLoading(true);
            const res = await workspaceService.create(formData.name, formData.title, formData.genre, formData.imageUrl);
            if (res.success) await handleSelect(formData.name);
        } catch (err) {
            setError("Error al crear cuaderno");
            setLoading(false);
        }
    };

    // Random Mock Data for Redesign Mockup alignment
    const getMockData = (name) => {
        const hash = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        const tags = ['FANTASÍA', 'SCI-FI', 'HORROR', 'LORE', 'MISTERIO'];
        const images = [
            'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1505634467193-785724601157?auto=format&fit=crop&q=80&w=800',
            'https://images.unsplash.com/photo-1478720568477-152d9b164e26?auto=format&fit=crop&q=80&w=800'
        ];
        return {
            tag: tags[hash % tags.length],
            img: images[hash % images.length],
            desc: "Una tierra dividida por la magia y la tecnología antigua...",
            initials: name.substring(0, 2).toUpperCase(),
            time: "hace 2h"
        };
    };

    const filteredWorkspaces = workspaces.filter(w => w.toLowerCase().includes(searchTerm.toLowerCase()));

    return (
        <div className="h-screen w-full bg-[#0a0b14] text-white flex flex-col items-center font-sans selection:bg-indigo-500/30 overflow-hidden">
            <div className="w-full max-w-6xl flex-1 flex flex-col overflow-y-auto custom-scrollbar p-8">

                {/* HEADER AREA */}
                <header className="w-full mt-24 mb-12 flex flex-col lg:flex-row lg:items-end justify-between gap-8 flex-shrink-0">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <h1 className="text-6xl font-black tracking-tighter leading-none">
                                <span className="block text-indigo-400">Mis</span>
                                <span className="block text-white">Cuadernos</span>
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {/* SEARCH INPUT */}
                        <div className="relative group min-w-[300px]">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/20 text-xl group-focus-within:text-indigo-400 transition-colors pointer-events-none">search</span>
                            <input
                                type="text"
                                placeholder="Buscar..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-[#13141f] border border-white/5 rounded-2xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 transition-all placeholder:text-white/10"
                            />
                        </div>
                    </div>
                </header>

                {/* GRID SECTION */}
                <section className="w-full max-w-6xl">
                    {loading ? (
                        <div className="flex flex-col items-center gap-6 py-20 opacity-20">
                            <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em]">Accediendo al Sector Local...</p>
                        </div>
                    ) : (
                        <div className="flex flex-wrap gap-6 justify-start pb-20">

                            {/* New Cuaderno Card */}
                            <div
                                onClick={() => setIsCreateModalOpen(true)}
                                className="group relative h-[380px] rounded-[2.5rem] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-6 hover:bg-white/5 hover:border-indigo-500/30 transition-all cursor-pointer overflow-hidden animate-in fade-in duration-700 w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                            >
                                <div className="w-20 h-20 rounded-full bg-[#13141f] border border-white/5 flex items-center justify-center text-4xl text-white/20 group-hover:scale-110 group-hover:text-indigo-400 transition-all">
                                    <span className="material-symbols-outlined text-4xl">add</span>
                                </div>
                                <div className="text-center">
                                    <h3 className="text-xl font-black tracking-tight text-white/50 group-hover:text-white transition-colors">Nuevo Cuaderno</h3>
                                    <p className="text-[10px] font-bold text-white/20 uppercase tracking-widest mt-2 group-hover:text-white/40">Inicia un nuevo universo</p>
                                </div>
                            </div>

                            {/* Project Cards */}
                            {filteredWorkspaces.map(projectName => {
                                const meta = getMockData(projectName);
                                return (
                                    <div
                                        key={projectName}
                                        onClick={() => handleSelect(projectName)}
                                        className="group relative h-[380px] rounded-[2.5rem] bg-[#13141f] border border-white/5 overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer animate-in fade-in slide-in-from-bottom-4 w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                                    >
                                        {/* Image Background */}
                                        <div className="absolute inset-x-0 top-0 h-2/3">
                                            <img src={meta.img} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#13141f] via-transparent to-transparent"></div>
                                        </div>

                                        {/* Content */}
                                        <div className="absolute inset-0 flex flex-col justify-end p-8">
                                            <div className="mt-auto space-y-3">
                                                <span className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/30 text-[9px] font-black text-red-100 rounded-lg tracking-widest uppercase">
                                                    {meta.tag}
                                                </span>
                                                <h3 className="text-3xl font-black text-white tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors">
                                                    {projectName}
                                                </h3>
                                                <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                                                    {meta.desc}
                                                </p>

                                                {/* Footer with status */}
                                                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                                                            Última edición: <span className="text-white/40">{meta.time}</span>
                                                        </span>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-indigo-300">
                                                        {meta.initials}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </section>
            </div>

            {error && (
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-2xl text-xs font-bold shadow-2xl animate-bounce">
                    {error}
                </div>
            )}

            <CreateWorkspaceModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onCreate={handleCreateWorkspace}
            />
        </div>
    );
};

export default WorkspaceSelector;
