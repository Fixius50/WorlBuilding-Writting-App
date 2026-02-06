import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceService } from '../../js/services/api';
import CreateWorkspaceModal from "../components/dashboard/CreateWorkspaceModal";
import EditWorkspaceModal from "../components/dashboard/EditWorkspaceModal";
import ConfirmModal from "../components/common/ConfirmModal";

const WorkspaceSelector = () => {
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // CRUD State
    const [projectToDelete, setProjectToDelete] = useState(null);
    const [projectToEdit, setProjectToEdit] = useState(null);
    const [isRestartModalOpen, setIsRestartModalOpen] = useState(false);
    const [restartProgress, setRestartProgress] = useState(0);
    const [restartStatus, setRestartStatus] = useState('idle'); // idle, restarting, checking, complete, error

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
        try {
            setLoading(true);
            const res = await workspaceService.create(formData.name, formData.title, formData.genre, formData.imageUrl);
            if (res.success) await handleSelect(formData.name);
        } catch (err) {
            setError("Error al crear cuaderno");
            setLoading(false);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!projectToDelete) return;
        try {
            setLoading(true);
            await workspaceService.delete(projectToDelete);
            await loadWorkspaces();
            setProjectToDelete(null);
        } catch (err) {
            setError("Error al borrar el cuaderno");
            setLoading(false);
        }
    };

    const handleUpdateWorkspace = async (name, data) => {
        try {
            setLoading(true);
            await workspaceService.update(name, data);
            await loadWorkspaces();
            setProjectToEdit(null);
        } catch (err) {
            setError("Error al actualizar cuaderno");
            setLoading(false);
        }
    };

    const handleDownloadBackup = () => {
        window.location.href = '/api/backup/download';
    };

    const handleRestartBackend = async () => {
        setIsRestartModalOpen(true);
        setRestartStatus('restarting');
        setRestartProgress(10);

        try {
            // Trigger restart
            await workspaceService.restartBackend();
            setRestartProgress(30);

            // Wait for server to go down
            await new Promise(resolve => setTimeout(resolve, 2000));
            setRestartProgress(50);
            setRestartStatus('checking');

            // Poll for server to come back up
            let attempts = 0;
            const maxAttempts = 30;
            const checkHealth = async () => {
                try {
                    await workspaceService.healthCheck();
                    setRestartProgress(100);
                    setRestartStatus('complete');
                    setTimeout(() => {
                        setIsRestartModalOpen(false);
                        setRestartStatus('idle');
                        setRestartProgress(0);
                        loadWorkspaces();
                    }, 1500);
                } catch (err) {
                    attempts++;
                    if (attempts >= maxAttempts) {
                        setRestartStatus('error');
                        setRestartProgress(0);
                    } else {
                        setRestartProgress(50 + (attempts / maxAttempts) * 50);
                        setTimeout(checkHealth, 1000);
                    }
                }
            };
            checkHealth();
        } catch (err) {
            setRestartStatus('error');
            setRestartProgress(0);
        }
    };

    const filteredWorkspaces = workspaces.filter(w =>
        (w.title || w.filename || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

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
                        {/* SETTINGS BUTTON */}
                        <button
                            onClick={() => navigate('/settings')}
                            className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-xs font-bold text-slate-400 hover:text-white group"
                            title="Configuración Global"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:rotate-90 transition-transform duration-500">settings</span>
                            <span className="hidden sm:inline">Ajustes</span>
                        </button>

                        {/* BACKUP BUTTON */}
                        <button
                            onClick={handleDownloadBackup}
                            className="flex items-center gap-2 px-5 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all text-xs font-bold text-slate-400 hover:text-white group"
                            title="Descargar copia de seguridad de todos los universos"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:scale-110 transition-transform">cloud_download</span>
                            <span className="hidden sm:inline">Backup Global</span>
                        </button>

                        {/* RESTART BACKEND BUTTON */}
                        <button
                            onClick={handleRestartBackend}
                            className="flex items-center gap-2 px-5 py-3 bg-orange-500/10 hover:bg-orange-500/20 border border-orange-500/20 rounded-2xl transition-all text-xs font-bold text-orange-400 hover:text-orange-300 group"
                            title="Reiniciar servidor backend (útil tras migraciones)"
                        >
                            <span className="material-symbols-outlined text-lg group-hover:rotate-180 transition-transform duration-500">refresh</span>
                            <span className="hidden sm:inline">Reiniciar Backend</span>
                        </button>

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
                            {filteredWorkspaces.map(workspace => {
                                // Fallback image if empty
                                const displayImg = workspace.imageUrl || 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800';

                                return (
                                    <div
                                        key={workspace.filename}
                                        onClick={() => handleSelect(workspace.filename)}
                                        className="group relative h-[380px] rounded-[2.5rem] bg-[#13141f] border border-white/5 overflow-hidden transition-all hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer animate-in fade-in slide-in-from-bottom-4 w-full md:w-[calc(50%-0.75rem)] lg:w-[calc(33.333%-1rem)]"
                                    >
                                        {/* Image Background */}
                                        <div className="absolute inset-x-0 top-0 h-2/3">
                                            <img src={displayImg} className="w-full h-full object-cover opacity-40 group-hover:opacity-60 transition-opacity" alt="" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-[#13141f] via-transparent to-transparent"></div>
                                        </div>

                                        {/* ACTION BUTTONS (HOVER) */}
                                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-20">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setProjectToEdit(workspace.filename); }}
                                                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-indigo-500 hover:border-indigo-400 transition-all"
                                                title="Editar"
                                            >
                                                <span className="material-symbols-outlined text-sm">edit</span>
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); setProjectToDelete(workspace.filename); }}
                                                className="w-10 h-10 rounded-full bg-black/50 backdrop-blur-md border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-red-500 hover:border-red-400 transition-all"
                                                title="Eliminar"
                                            >
                                                <span className="material-symbols-outlined text-sm">delete</span>
                                            </button>
                                        </div>

                                        {/* Content */}
                                        <div className="absolute inset-0 flex flex-col justify-end p-8">
                                            <div className="mt-auto space-y-3">
                                                <span className="inline-block px-3 py-1 bg-red-500/20 border border-red-500/30 text-[9px] font-black text-red-100 rounded-lg tracking-widest uppercase">
                                                    {workspace.tag}
                                                </span>
                                                <h3 className="text-3xl font-black text-white tracking-tighter leading-tight group-hover:text-indigo-400 transition-colors">
                                                    {workspace.title}
                                                </h3>
                                                {/* Filename subtext if title differs */}
                                                {workspace.title !== workspace.filename && (
                                                    <p className="text-[10px] text-white/30 font-mono mb-1">{workspace.filename}</p>
                                                )}

                                                <p className="text-xs text-white/40 line-clamp-2 leading-relaxed">
                                                    Una tierra dividida por la magia y la tecnología antigua...
                                                </p>

                                                {/* Footer with status */}
                                                <div className="flex items-center justify-between pt-6 border-t border-white/5 mt-4">
                                                    <div className="flex items-center gap-2">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-white/20">
                                                            Última edición: <span className="text-white/40">{workspace.lastModified}</span>
                                                        </span>
                                                    </div>
                                                    <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[10px] font-black text-indigo-300">
                                                        {workspace.initials}
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

            <EditWorkspaceModal
                isOpen={!!projectToEdit}
                onClose={() => setProjectToEdit(null)}
                project={projectToEdit}
                onUpdate={handleUpdateWorkspace}
            />

            <ConfirmModal
                isOpen={!!projectToDelete}
                onClose={() => setProjectToDelete(null)}
                onConfirm={handleDeleteConfirm}
                title="¿Eliminar Proyecto?"
                message={`Estás a punto de borrar "${projectToDelete}" y todo su contenido permanentemente. Esta acción no se puede deshacer.`}
                confirmText="Eliminar Universo"
                isDestructive={true}
            />

            {/* RESTART MODAL */}
            {isRestartModalOpen && (
                <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="w-full max-w-md bg-[#0A0A0F] border border-orange-500/20 rounded-[2.5rem] overflow-hidden shadow-2xl shadow-orange-500/10 animate-in zoom-in-95 duration-500">
                        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-orange-500/10 to-transparent">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-full bg-orange-500/20 border border-orange-500/30 flex items-center justify-center">
                                    <span className="material-symbols-outlined text-2xl text-orange-400 animate-spin">refresh</span>
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-white">Reiniciando Backend</h2>
                                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">
                                        {restartStatus === 'restarting' && 'Deteniendo servidor...'}
                                        {restartStatus === 'checking' && 'Esperando reconexión...'}
                                        {restartStatus === 'complete' && '¡Reinicio completado!'}
                                        {restartStatus === 'error' && 'Error en el reinicio'}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="p-8 space-y-6">
                            {/* Progress Bar */}
                            <div className="space-y-2">
                                <div className="flex justify-between text-xs">
                                    <span className="text-slate-500 font-bold">Progreso</span>
                                    <span className="text-orange-400 font-black">{Math.round(restartProgress)}%</span>
                                </div>
                                <div className="h-2 bg-white/5 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-orange-500 to-orange-400 transition-all duration-500 ease-out"
                                        style={{ width: `${restartProgress}%` }}
                                    ></div>
                                </div>
                            </div>

                            {/* Status Messages */}
                            <div className="space-y-2 text-xs text-slate-400">
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${restartProgress >= 30 ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                                    <span>Señal de reinicio enviada</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${restartProgress >= 50 ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                                    <span>Servidor detenido</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${restartProgress >= 100 ? 'bg-green-500' : restartProgress > 50 ? 'bg-orange-500 animate-pulse' : 'bg-slate-700'}`}></div>
                                    <span>Servidor iniciado y listo</span>
                                </div>
                            </div>

                            {restartStatus === 'error' && (
                                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-xs text-red-400">
                                    <p className="font-bold">Error: El servidor no respondió después de 30 segundos.</p>
                                    <p className="mt-2 text-red-300/70">Por favor, reinicia manualmente desde la terminal.</p>
                                </div>
                            )}
                        </div>

                        {restartStatus === 'complete' && (
                            <div className="p-6 bg-green-500/10 border-t border-green-500/20 flex items-center justify-center gap-2 text-green-400 text-sm font-bold">
                                <span className="material-symbols-outlined">check_circle</span>
                                <span>Backend reiniciado correctamente</span>
                            </div>
                        )}

                        {restartStatus === 'error' && (
                            <div className="p-6 border-t border-white/5 flex justify-end">
                                <button
                                    onClick={() => {
                                        setIsRestartModalOpen(false);
                                        setRestartStatus('idle');
                                        setRestartProgress(0);
                                    }}
                                    className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold transition-all"
                                >
                                    Cerrar
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkspaceSelector;
