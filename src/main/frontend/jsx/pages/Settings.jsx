import React from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import GlassPanel from '../components/common/GlassPanel';

const Settings = () => {
    const navigate = useNavigate();

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
                    <p className="text-slate-500 font-medium mt-1">Configure your architect profile and session preferences.</p>
                </header>

                <div className="space-y-6">
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

                    {/* Placeholder for other settings */}
                    <GlassPanel className="p-8 space-y-4 border-white/10 opacity-50 pointer-events-none">
                        <div className="flex items-center gap-4">
                            <div className="size-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                <span className="material-symbols-outlined text-2xl">palette</span>
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">Interface Customization</h3>
                                <p className="text-sm text-slate-400">Theme selection coming in future updates.</p>
                            </div>
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
};

export default Settings;
