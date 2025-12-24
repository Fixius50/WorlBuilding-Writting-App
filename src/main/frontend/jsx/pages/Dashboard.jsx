import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/common/Button';
import CreateProjectModal from '../components/dashboard/CreateProjectModal';
import api from '../services/api';

import GlassPanel from '../components/common/GlassPanel';

const ProjectCard = ({ title, desc, type, updated, image, id, name, onDelete }) => (
    <Link to={`/project/${id}`} className="block group">
        <GlassPanel className="h-64 flex flex-col p-6 hover:shadow-2xl hover:shadow-primary/20 hover:border-primary/50 transition-all relative">
            <div className="absolute top-6 right-6 z-20 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(name); }}
                    className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 transition-colors"
                >
                    <span className="material-symbols-outlined text-lg">delete</span>
                </button>
            </div>

            <div className="mb-auto">
                <div className="flex items-center gap-2 mb-4">
                    <div className="h-10 w-10 rounded-xl bg-primary/20 flex items-center justify-center text-primary border border-primary/20 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-xl">
                            {type === 'Fantasy' ? 'auto_awesome' : type === 'Sci-Fi' ? 'rocket_launch' : 'public'}
                        </span>
                    </div>
                    <div>
                        <span className="text-[10px] font-black uppercase tracking-widest text-primary">{type}</span>
                        <h3 className="text-xl font-bold text-white leading-tight group-hover:text-primary transition-colors">{title}</h3>
                    </div>
                </div>
                <p className="text-sm text-slate-400 line-clamp-3 leading-relaxed">{desc}</p>
            </div>

            <div className="pt-4 border-t border-white/5 flex justify-between items-center text-xs text-slate-500">
                <span>Updated {updated}</span>
                <span className="group-hover:translate-x-1 transition-transform material-symbols-outlined text-base">arrow_forward</span>
            </div>
        </GlassPanel>
    </Link>
);

const Dashboard = () => {
    const [projects, setProjects] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchProjects();
    }, []);

    const fetchProjects = async () => {
        try {
            const data = await api.get('/proyectos');
            setProjects(data);
        } catch (err) {
            console.error("Error fetching projects:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (name) => {
        if (window.confirm(`Are you sure you want to delete "${name}"?`)) {
            try {
                await api.delete(`/proyectos/${name}`);
                fetchProjects();
            } catch (err) {
                alert("Failed to delete project: " + err.message);
            }
        }
    };

    const handleCreateProject = async (projectData) => {
        try {
            const response = await api.post('/proyectos/crear', {
                nombreProyecto: projectData.title,
                tipo: projectData.genre,
                descripcion: `A new ${projectData.genre} world.`
            });
            if (response.success) {
                setIsModalOpen(false);
                fetchProjects();
                // Optionally navigate to the new project
                // navigate(`/project/${response.id}`);
            }
        } catch (err) {
            alert("Error creating project: " + err.message);
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center p-12 pt-28 overflow-y-auto custom-scrollbar relative">
            <div className="w-full max-w-6xl space-y-12">
                <header className="flex flex-col gap-2">
                    <h1 className="text-5xl font-manrope font-black text-white tracking-tight">Chronos Atlas</h1>
                    <p className="text-slate-500 text-lg font-medium">Select a world to begin building.</p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {projects.map(proj => (
                        <ProjectCard
                            key={proj.id}
                            id={proj.id}
                            name={proj.nombreProyecto}
                            title={proj.nombreProyecto}
                            desc={proj.descripcion}
                            type={proj.tipo}
                            updated="Recently"
                            image={proj.imagenUrl}
                            onDelete={handleDelete}
                        />
                    ))}

                    {loading && projects.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center gap-4 opacity-30">
                            <span className="material-symbols-outlined text-6xl animate-spin">refresh</span>
                            <span className="text-sm font-bold uppercase tracking-widest">Scanning Vaults...</span>
                        </div>
                    )}

                    {!loading && projects.length === 0 && (
                        <div className="col-span-full py-20 flex flex-col items-center gap-4 border-2 border-dashed border-white/5 rounded-[3rem] bg-white/[0.02]">
                            <span className="material-symbols-outlined text-6xl text-slate-700">folder_open</span>
                            <span className="text-sm font-medium text-slate-500">No worlds found. Time to create one.</span>
                        </div>
                    )}

                    <div
                        onClick={() => setIsModalOpen(true)}
                        className="group relative h-64 rounded-2xl border-2 border-dashed border-slate-700 hover:border-primary hover:bg-primary/5 flex flex-col items-center justify-center cursor-pointer transition-all"
                    >
                        <div className="size-16 rounded-full bg-surface-light flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-primary">add</span>
                        </div>
                        <span className="text-sm font-bold text-slate-400 group-hover:text-primary">Create New Project</span>
                    </div>
                </div>
            </div>

            <CreateProjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onCreate={handleCreateProject}
            />
        </div>
    );
};

export default Dashboard;

