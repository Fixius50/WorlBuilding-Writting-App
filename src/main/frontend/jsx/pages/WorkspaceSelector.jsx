import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { workspaceService, projectService } from '../../js/services/api';

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
            setWorkspaces(data);
        } catch (err) {
            console.error("Failed to load workspaces", err);
            setError("Could not load workspaces. Is the backend running?");
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = async (projectId) => {
        try {
            setLoading(true);
            const response = await workspaceService.select(projectId);
            if (response.success && response.redirect) {
                // Store user info similar to login
                localStorage.setItem('user', JSON.stringify({
                    username: response.username,
                    email: 'connected@workspace', // Dummy
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

    // Simplified creation (redirects to old creation or we can add a modal later)
    // For now, let's just show existing ones. If empty, maybe show a "Create" button 
    // that assumes a default user or asks for a name.

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
                        <span className="text-slate-500 animate-pulse">Establishing uplink...</span>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
                        {/* Create New Card */}
                        <div className="glass-panel group relative p-6 rounded-2xl border border-glass-border hover:border-primary/50 transition-all cursor-pointer flex flex-col items-center justify-center min-h-[200px] hover:bg-white/5 disabled opacity-50">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <span className="material-symbols-outlined text-3xl text-slate-400 group-hover:text-white">add</span>
                            </div>
                            <h3 className="text-xl font-bold text-slate-300 group-hover:text-white">New Workspace</h3>
                            <p className="text-slate-500 text-sm mt-2">Initialize a new world</p>
                            {/* Disabled for now until we add logic */}
                        </div>

                        {workspaces.map(ws => (
                            <div
                                key={ws.id}
                                onClick={() => handleSelect(ws.id)}
                                className="glass-panel group relative p-6 rounded-2xl border border-glass-border hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between min-h-[200px] hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10"
                            >
                                <div>
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="px-2 py-1 rounded bg-primary/20 border border-primary/30 text-xs font-bold text-primary-light uppercase tracking-wider">
                                            {ws.type || 'General'}
                                        </div>
                                        <span className="text-slate-500 text-xs">{new Date(ws.created).toLocaleDateString()}</span>
                                    </div>
                                    <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-primary-light transition-colors">{ws.title}</h3>
                                    <p className="text-slate-400 text-sm line-clamp-2">{ws.description || "No description provided."}</p>
                                </div>
                                <div className="mt-6 flex items-center justify-between border-t border-white/5 pt-4">
                                    <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center text-[10px] font-bold text-white">
                                            {ws.owner?.[0]?.toUpperCase() || '?'}
                                        </span>
                                        <span className="text-xs text-slate-400">{ws.owner}</span>
                                    </div>
                                    <span className="material-symbols-outlined text-slate-600 group-hover:text-primary transition-colors">arrow_forward</span>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div className="absolute bottom-6 text-center text-xs text-slate-600">
                Workspace Selector v1.0 • Connected to Mainframe
            </div>
        </div>
    );
};

export default WorkspaceSelector;
