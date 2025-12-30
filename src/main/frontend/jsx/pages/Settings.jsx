import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../js/services/api';
import GlassPanel from '../components/common/GlassPanel';
import TemplateManager from '../components/settings/TemplateManager';

const Settings = () => {
    const navigate = useNavigate();
    const [user, setUser] = React.useState(null);
    const [activeTab, setActiveTab] = React.useState('profile'); // 'profile', 'templates'

    React.useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            setUser(JSON.parse(storedUser));
        }
    }, []);

    const handleLogout = async () => {
        try {
            await api.post('/auth/logout', {});
        } catch (err) {
            console.error('Logout error on server', err);
        } finally {
            localStorage.removeItem('user');
            sessionStorage.clear();
            navigate('/login');
        }
    };

    return (
        <div className="flex-1 flex flex-col items-center p-12 pt-28 overflow-y-auto custom-scrollbar relative">
            <div className="w-full max-w-2xl space-y-8">
                <header>
                    <h1 className="text-4xl font-manrope font-black text-white tracking-tight">System Settings</h1>
                    <div className="flex gap-4 mt-6 border-b border-white/5">
                        <button
                            onClick={() => setActiveTab('profile')}
                            className={`pb-4 text-sm font-bold transition-all ${activeTab === 'profile' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-white'}`}
                        >
                            Profile & Session
                        </button>
                        <button
                            onClick={() => setActiveTab('templates')}
                            className={`pb-4 text-sm font-bold transition-all ${activeTab === 'templates' ? 'text-primary border-b-2 border-primary' : 'text-slate-500 hover:text-white'}`}
                        >
                            Entity Templates
                        </button>
                    </div>
                </header>

                <div className="space-y-6">
                    {activeTab === 'templates' ? (
                        <TemplateManager />
                    ) : (
                        <>
                            {/* User Profile */}
                            <GlassPanel className="p-8 space-y-6 border-white/10">
                                <div className="flex items-center gap-6 border-b border-white/5 pb-6">
                                    <div className="size-20 rounded-2xl bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center text-white shadow-2xl shadow-primary/20">
                                        <span className="material-symbols-outlined text-4xl">person</span>
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-bold text-white tracking-tight">{user?.user?.username || 'Architect'}</h3>
                                        <p className="text-sm text-slate-400 font-medium">Level 1 Worldbuilder</p>
                                        <div className="mt-2 flex items-center gap-2">
                                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold uppercase tracking-wider border border-emerald-500/20">Active</span>
                                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase tracking-wider border border-blue-500/20">Pro Member</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Architect ID</label>
                                        <p className="text-white font-mono text-sm">{user?.user?.id || 'Undefined'}</p>
                                    </div>
                                    <div className="p-4 rounded-xl bg-white/5 border border-white/5">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-1">Email</label>
                                        <p className="text-white font-mono text-sm">{user?.user?.email || 'No email linked'}</p>
                                    </div>
                                </div>
                            </GlassPanel>

                            {/* Session Management */}
                            <GlassPanel className="p-8 space-y-6 border-white/10">
                                <div className="flex items-center gap-4 border-b border-white/5 pb-4">
                                    <div className="size-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500">
                                        <span className="material-symbols-outlined text-2xl">logout</span>
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">Session Termination</h3>
                                        <p className="text-sm text-slate-400">Securely end your current session and return to the vault entrance.</p>
                                    </div>
                                </div>

                                <div className="flex justify-end">
                                    <button
                                        onClick={handleLogout}
                                        className="px-6 py-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 font-bold text-sm transition-all shadow-lg hover:shadow-red-500/10"
                                    >
                                        Disconnect & Exit
                                    </button>
                                </div>
                            </GlassPanel>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
