import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceService } from '../../js/services/api';

const WorkspaceSelector = () => {
    const navigate = useNavigate();
    const [workspaces, setWorkspaces] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadWorkspaces();
    }, []);

    const loadWorkspaces = async () => {
        try {
            setLoading(true);
            const data = await workspaceService.list();
            // Data is List<String>
            setWorkspaces(data);
        } catch (err) {
            console.error("Failed to load workspaces", err);
            setError("Could not load workspaces. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (projectName) => {
        try {
            setLoading(true);
            const response = await workspaceService.select(projectName);
            // { success: true, redirect: '/local/ProjectName' }
            if (response.success && response.redirect) {
                // Mock user for frontend compatibility if needed
                localStorage.setItem('user', JSON.stringify({
                    username: 'local',
                    success: true
                }));
                navigate(response.redirect);
            }
        } catch (err) {
            console.error("Selection failed", err);
            setError(err.message || "Failed to enter workspace");
            setLoading(false);
        }
    };

    const handleCreateWorkspace = async () => {
        const projectName = prompt("Enter Project Name:");
        if (!projectName) return;

        try {
            setLoading(true);
            const res = await workspaceService.create(projectName);
            if (res.success) {
                await handleSelect(projectName);
            }
        } catch (err) {
            console.error("Creation failed", err);
            setError("Failed to create workspace: " + (err.message || "Unknown error"));
            setLoading(false);
        }
    };

    const handleDelete = async (e, projectName) => {
        e.stopPropagation();
        if (!confirm("Are you sure you want to delete " + projectName + "? This cannot be undone.")) return;
        try {
            setLoading(true);
            await workspaceService.delete(projectName);
            await loadWorkspaces();
        } catch (err) {
            setError("Failed to delete: " + err.message);
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center relative overflow-hidden bg-background-dark p-8">
            {/* Background FX */}
            <div className="absolute inset-0 bg-[url('https://lh3.googleusercontent.com/aida-public/AB6AXuBXRuAnm4TWmeLokpiWualeQMnfpbzAWwF1z7vP_aEtaINpspl5kJGo3vfJJyZhtvNxfrZ83zjJ0RfQwomOQ8WLBjwNCkUbgECBD7apfwZ62QdXEtdLvKV2ZKpX0lqdRpUrytD5F2IoLbbFMnPhcua5NQFjVDCnI8Ptur2mDMgA3f0FJ6HvnU-F5PC4UrNB7UP9Ws-b_47IqoB-uuDQxqe-FZTZb2y0JW5F3ytTFp8uz9yLFPQXhRfXZDw0wkO1eT2pfujN32SWARc')] bg-cover opacity-20"></div>
            <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/20 rounded-full blur-[120px]"></div>

            <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
                <div className="mb-12 text-center">
                    <div className="flex items-center justify-center gap-4 mb-4">
                        <div className="size-12 bg-background-dark rounded-xl flex items-center justify-center border border-glass-border shadow-lg shadow-primary/20">
                            <span className="material-symbols-outlined text-2xl text-primary">public</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white tracking-tight">Chronos Atlas</h1>
                    </div>
                    <p className="text-slate-400 text-lg">Select a Neural Workspace to interface with.</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 font-bold flex items-center gap-2">
                        <span className="material-symbols-outlined">warning</span>
                        {error}
                        <button onClick={loadWorkspaces} className="ml-4 underline text-xs">Retry</button>
                    </div>
                )}

                {loading ? (
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <span className="text-slate-500 animate-pulse">Scanning local sector...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {/* Create New Card */}
                        <div
                            onClick={handleCreateWorkspace}
                            className="glass-panel group relative p-6 rounded-2xl border border-glass-border hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] hover:bg-white/5 active:scale-95"
                        >
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-white">add</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-300 group-hover:text-white">New Workspace</h3>
                        </div>

                        {workspaces.map(projectName => (
                            <div
                                key={projectName}
                                onClick={() => handleSelect(projectName)}
                                className="glass-panel group relative p-6 rounded-2xl border border-glass-border hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between min-h-[200px] hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="px-2 py-1 rounded bg-primary/20 border border-primary/30 text-xs font-bold text-primary-light uppercase tracking-wider">
                                            Local
                                        </div>
                                        <button
                                            onClick={(e) => handleDelete(e, projectName)}
                                            className="text-red-400 hover:text-red-200 material-symbols-outlined text-sm p-1 rounded hover:bg-white/10"
                                            title="Delete Workspace"
                                        >
                                            delete
                                        </button>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-light transition-colors">{projectName}</h3>
                                    <p className="text-slate-400 text-sm">Local Database</p>
                                </div>
                                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                                    <span className="text-xs text-slate-400">Ready</span>
                                    <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">arrow_forward</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 text-center text-xs text-slate-600">
                Chronos Atlas • Local Mode
            </div>
        </div>
    );
};

export default WorkspaceSelector;
