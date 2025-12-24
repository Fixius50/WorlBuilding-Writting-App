import React, { useState } from 'react';
import GlassPanel from '../components/common/GlassPanel';
import Avatar from '../components/common/Avatar';
import Button from '../components/common/Button';
import TemplateManager from '../components/settings/TemplateManager';

const Settings = () => {
    const [activeTab, setActiveTab] = useState('profile');

    return (
        <div className="flex-1 p-12 pt-28 max-w-6xl mx-auto w-full animate-in fade-in duration-500 overflow-y-auto custom-scrollbar">
            <header className="mb-12">
                <h1 className="text-4xl font-manrope font-black text-white tracking-tight mb-2">Global Settings</h1>
                <p className="text-slate-400">Configure your personal experience and world defaults.</p>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
                {/* Settings Navigation */}
                <nav className="space-y-2">
                    <SettingsTab active={activeTab === 'profile'} onClick={() => setActiveTab('profile')} icon="person" label="User Profile" />
                    <SettingsTab active={activeTab === 'templates'} onClick={() => setActiveTab('templates')} icon="schema" label="Entity Templates" />
                    <SettingsTab active={activeTab === 'world'} onClick={() => setActiveTab('world')} icon="public" label="World Defaults" />
                    <SettingsTab active={activeTab === 'security'} onClick={() => setActiveTab('security')} icon="shield" label="Security & Privacy" />
                </nav>

                {/* Settings Content */}
                <div className="lg:col-span-3 space-y-8">
                    {activeTab === 'profile' && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            <GlassPanel className="p-8 space-y-8">
                                <div className="flex items-center gap-6">
                                    <Avatar name="JD" size="xl" className="size-24 rounded-2xl border-2 border-primary/30" />
                                    <div className="flex flex-col gap-3">
                                        <div className="flex gap-2">
                                            <Button variant="secondary" size="sm">Change Avatar</Button>
                                            <Button variant="secondary" size="sm" className="text-red-400 border-red-500/20 hover:bg-red-500/10">Remove</Button>
                                        </div>
                                        <p className="text-[10px] text-slate-500 italic uppercase tracking-widest">Recommended size: 400x400px</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputField label="Public Username" value="Aethelgard_Architect" />
                                    <InputField label="Email Address" value="robert@chronosatlas.com" />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Personal Bio</label>
                                    <textarea
                                        className="w-full h-32 bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-slate-300 focus:border-primary/50 transition-all outline-none resize-none"
                                        defaultValue="Building worlds since 2012. Passionate about hard magic systems and geopolitical intrigue."
                                    />
                                </div>
                            </GlassPanel>

                            <div className="flex justify-end gap-3">
                                <Button variant="secondary">Discard Changes</Button>
                                <Button variant="primary">Save Profile</Button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'templates' && <TemplateManager />}

                    {activeTab !== 'profile' && activeTab !== 'templates' && (
                        <div className="flex flex-col items-center justify-center p-20 text-center gap-4 opacity-50">
                            <span className="material-symbols-outlined text-6xl">construction</span>
                            <h3 className="text-xl font-bold text-white">Module Under Construction</h3>
                            <p className="text-sm text-slate-400">We're building this section to be as premium as possible. Stay tuned.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

const SettingsTab = ({ active, onClick, icon, label }) => (
    <button
        onClick={onClick}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl transition-all ${active ? 'bg-primary/10 text-white border border-primary/20 shadow-lg' : 'text-slate-500 hover:text-white hover:bg-white/5'}`}
    >
        <span className="material-symbols-outlined text-xl">{icon}</span>
        <span className="text-sm font-bold">{label}</span>
    </button>
);

const InputField = ({ label, value }) => (
    <div className="space-y-1.5">
        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">{label}</label>
        <input
            type="text"
            defaultValue={value}
            className="w-full bg-white/5 border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:border-primary/50 transition-all outline-none"
        />
    </div>
);

export default Settings;
