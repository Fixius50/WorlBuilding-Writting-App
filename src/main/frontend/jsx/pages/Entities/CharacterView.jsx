import { useState } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

const CharacterView = ({ id }) => {
    const [activeTab, setActiveTab] = useState('overview');

    return (
        <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-8 gap-6">

                {/* Header */}
                <div className="flex items-start gap-6">
                    <div className="relative">
                        <Avatar
                            url="https://lh3.googleusercontent.com/aida-public/AB6AXuC5wrA90E3iR_n72y4TFiYkSf3rPv_D5QFb0SJth3Kl1UaBKnE7lU0Fsj3O-jCJXEEjk_Gybekesf6hQQLSJ3_OQRotMJ6nQeayQ7roTvhzuK-QF-S0OzPtcsraoXjTnZYSQGFZoPNCl8nnsScT3dJfjfcXshdQxGliJ2VvpZ2WTsag0upqgNgL83K-TiY4FEif3q_RANKImopD6_S1Dx1OlkE_L2U65BoxsFX35Ex3bcKYMLONzF8D6KP47cvaCOgAcWSBH6JHP-A"
                            size="xl"
                            className="rounded-2xl border-2 border-primary shadow-[0_0_30px_rgba(99,102,242,0.3)]"
                        />
                        <div className="absolute -bottom-2 -right-2 bg-emerald-500 rounded-full p-1 border border-background-dark">
                            <span className="material-symbols-outlined text-[14px] text-white">check</span>
                        </div>
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">PROTAGONIST</span>
                            <span className="text-xs font-bold text-slate-400 bg-surface-light px-2 py-0.5 rounded border border-white/5">Human</span>
                            <span className="text-xs font-bold text-slate-400 bg-surface-light px-2 py-0.5 rounded border border-white/5">Mage</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">Elara Vance</h1>
                        <p className="text-lg text-slate-300">The Last Weaver of Time</p>
                    </div>

                    <div className="flex gap-2">
                        <Button variant="secondary" icon="edit">Edit Profile</Button>
                        <Button variant="primary" icon="save">Save Changes</Button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-glass-border flex gap-6">
                    {['Overview', 'Biography', 'Attributes & Stats', 'Relationships'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.toLowerCase() ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Left Col */}
                    <div className="col-span-1 space-y-6">
                        <GlassPanel className="p-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">fingerprint</span> Identity
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Full Name</label>
                                    <input type="text" value="Elara Vance" className="w-full bg-surface-light border border-white/10 rounded px-3 py-2 text-white text-sm" readOnly />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Age</label>
                                        <input type="text" value="24" className="w-full bg-surface-light border border-white/10 rounded px-3 py-2 text-white text-sm" readOnly />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Gender</label>
                                        <input type="text" value="Female" className="w-full bg-surface-light border border-white/10 rounded px-3 py-2 text-white text-sm" readOnly />
                                    </div>
                                </div>
                            </div>
                        </GlassPanel>

                        <GlassPanel className="p-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">psychology</span> Personality Matrix
                            </h3>
                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="w-20 text-slate-400 text-xs">Bravery</span>
                                    <div className="flex-1 h-1.5 bg-surface-light rounded-full overflow-hidden">
                                        <div className="h-full bg-blue-500 w-[85%]"></div>
                                    </div>
                                    <span className="text-xs text-blue-400 w-8 text-right">85%</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="w-20 text-slate-400 text-xs">Magic</span>
                                    <div className="flex-1 h-1.5 bg-surface-light rounded-full overflow-hidden">
                                        <div className="h-full bg-purple-500 w-[95%]"></div>
                                    </div>
                                    <span className="text-xs text-purple-400 w-8 text-right">95%</span>
                                </div>
                                <div className="flex items-center gap-2 text-sm">
                                    <span className="w-20 text-slate-400 text-xs">Diplomacy</span>
                                    <div className="flex-1 h-1.5 bg-surface-light rounded-full overflow-hidden">
                                        <div className="h-full bg-emerald-500 w-[40%]"></div>
                                    </div>
                                    <span className="text-xs text-emerald-400 w-8 text-right">40%</span>
                                </div>
                            </div>
                        </GlassPanel>
                    </div>

                    {/* Center/Right Col */}
                    <div className="col-span-2 space-y-6">
                        <GlassPanel className="p-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button className="text-xs text-primary hover:underline">Expand Editor</button>
                            </div>
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">history_edu</span> Backstory
                            </h3>
                            <p className="text-slate-300 text-sm leading-relaxed mb-4">
                                Born during the Great Eclipse, Elara was marked by the Void from her first breath. Her parents, simple weavers in the lower districts of Silverfall, hid her away fearing the Inquisition.
                            </p>
                            <p className="text-slate-300 text-sm leading-relaxed">
                                It wasn't until her twelfth birthday that her powers manifested violently, shattering the windows of the weaver's guild hall...
                            </p>
                        </GlassPanel>
                    </div>
                </div>
            </div>

            {/* Right Sidebar (Split View Placeholder) */}
            <div className="w-80 border-l border-glass-border bg-surface-dark/50 hidden xl:flex flex-col">
                <div className="p-4 border-b border-glass-border flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">QUICK NOTES</span>
                    <button className="text-slate-400 hover:text-white"><span className="material-symbols-outlined text-sm">open_in_new</span></button>
                </div>
                <div className="p-4 flex-1">
                    <textarea className="w-full h-full bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-600 resize-none" placeholder="Draft a quick scene or jot down notes for Elara here..."></textarea>
                </div>
                <div className="p-2 border-t border-glass-border text-right text-[10px] text-slate-600">
                    0 words
                </div>
            </div>
        </div>
    );
};

export default CharacterView;
