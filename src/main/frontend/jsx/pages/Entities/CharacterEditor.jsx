import React, { useState } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

const CharacterEditor = () => {
    const [name, setName] = useState("Elara Vance");
    const [role, setRole] = useState("Protaganist");
    const [bio, setBio] = useState("A scavenger from the outer rim who discovers a hidden power.");

    return (
        <div className="flex-1 flex flex-col h-full animate-in fade-in duration-500">
            {/* Control Bar */}
            <header className="h-16 flex items-center justify-between px-8 border-b border-white/5 bg-surface-dark/50">
                <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-slate-500">person</span>
                    <span className="text-xs font-black uppercase tracking-widest text-slate-400">Editing Character</span>
                    <div className="w-px h-4 bg-white/10 mx-2"></div>
                    <span className="text-sm font-bold text-white">{name}</span>
                </div>
                <div className="flex gap-3">
                    <span className="text-[10px] text-slate-500 italic mr-4">Auto-saved 2s ago</span>
                    <Button variant="secondary" size="sm">Discard</Button>
                    <Button variant="primary" size="sm">Save Changes</Button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar p-12">
                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Visual & Basic Info */}
                    <div className="space-y-8">
                        <div className="relative group">
                            <div className="aspect-[3/4] rounded-3xl bg-surface-light border border-white/5 overflow-hidden shadow-2xl">
                                <img
                                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDt7f9W0wgoLUU8QBGI9cDQSvtddbyvQxPQFs4ZO3ongKxfVCLye41Zid6ZVos779xwVspRP6A0JkWO5o6VruPPusPZw-bPf6HaUFWWM3jNFyHR6RuuGDssk_cd73dm_4YlRQgyrZKYojvJyAHr0iaMiUE3Qq3SrkHxvd5eSWgQ89GeiZTdVGVG4OmkPF6oR8ZM86V8hOLH2pMpRepEelvC8Eg95blntg2Ojb-H6c-tZCYxD-Si6ohaa-rNqu4pWskIBt4lMNMA6xI"
                                    alt="Profile"
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 opacity-80"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-background-dark via-transparent to-transparent"></div>
                                <div className="absolute bottom-6 left-6 right-6">
                                    <button className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-widest border border-white/10 transition-all">
                                        Change Image
                                    </button>
                                </div>
                            </div>
                        </div>

                        <GlassPanel className="p-6 space-y-4">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">Primary Identity</h3>
                            <div className="space-y-4">
                                <InputField label="Full Name" value={name} onChange={setName} />
                                <InputField label="Current Role" value={role} onChange={setRole} />
                                <div className="grid grid-cols-2 gap-4">
                                    <InputField label="Age" value="24" />
                                    <InputField label="Species" value="Human" />
                                </div>
                            </div>
                        </GlassPanel>
                    </div>

                    {/* Rich Content Editor Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-manrope font-black text-white tracking-tight">Biography & Narrative</h2>
                            <textarea
                                className="w-full h-64 bg-transparent text-slate-300 text-lg leading-relaxed placeholder:text-slate-700 border-none focus:ring-0 resize-none no-scrollbar font-serif"
                                placeholder="Start writing the legend..."
                                value={bio}
                                onChange={(e) => setBio(e.target.value)}
                            />
                        </div>

                        <div className="w-full h-px bg-white/5"></div>

                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h3 className="text-xl font-bold text-white">Attribute Tuning</h3>
                                <button className="text-primary text-xs font-bold hover:underline">+ Add Attribute</button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <EditorStat label="Resilience" value={78} />
                                <EditorStat label="Influence" value={42} />
                                <EditorStat label="Arcane Potency" value={12} />
                                <EditorStat label="Stealth" value={91} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

const InputField = ({ label, value, onChange }) => (
    <div className="space-y-1.5">
        <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 ml-1">{label}</label>
        <input
            type="text"
            value={value}
            onChange={(e) => onChange && onChange(e.target.value)}
            className="w-full bg-white/5 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:border-primary/50 transition-all outline-none"
        />
    </div>
);

const EditorStat = ({ label, value }) => (
    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 space-y-3">
        <div className="flex justify-between items-center">
            <span className="text-xs font-bold text-slate-400">{label}</span>
            <span className="text-xs font-black text-white">{value}</span>
        </div>
        <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
            <div className="h-full bg-primary rounded-full" style={{ width: `${value}%` }}></div>
        </div>
    </div>
);

export default CharacterEditor;
