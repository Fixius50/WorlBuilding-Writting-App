import React from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';

const EntityProfile = ({ entity = {} }) => {
    // Mock data based on Image 3
    const mockEntity = {
        name: "King Alaric IV",
        type: "Character",
        category: "Royalty",
        image: "https://lh3.googleusercontent.com/aida-public/AB6AXuD3u8qB6O9M2X6Y7L2X7Z7L2X7Z7L2X7Z7L2X7Z7L2X7Z7L2X7Z7L2X7Z7L2X7Z7L2X7Z7L2X7Z7L2X7Z7L2X7Z7L2X7Z7L2X7Z7L2X7Z7L=s400", // Placeholder
        description: "The current ruler of Aethelgard. Known for his tactical brilliance and a somewhat cold demeanor.",
        attributes: [
            { label: "Strength", value: 85, color: "bg-red-500" },
            { label: "Intelligence", value: 95, color: "bg-blue-500" },
            { label: "Charisma", value: 70, color: "bg-amber-500" },
        ],
        relationships: [
            { name: "Queen Elara", role: "Spouse", type: "Ally" },
            { name: "Prince Valen", role: "Son", type: "Heir" },
            { name: "General Kael", role: "Advisor", type: "Neutral" },
        ]
    };

    const data = { ...mockEntity, ...entity };

    return (
        <div className="flex-1 p-12 max-w-5xl mx-auto w-full animate-in fade-in duration-500">
            <header className="flex items-start gap-8 mb-12">
                <div className="relative">
                    <Avatar name={data.name} size="xl" className="size-32 rounded-3xl border-2 border-primary/30 ring-4 ring-primary/10 shadow-2xl" />
                    <div className="absolute -bottom-2 -right-2 size-8 rounded-lg bg-primary flex items-center justify-center text-white border-4 border-background-dark shadow-lg">
                        <span className="material-symbols-outlined text-sm">verified</span>
                    </div>
                </div>

                <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                        <h1 className="text-4xl font-manrope font-black text-white tracking-tight">{data.name}</h1>
                        <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest border border-primary/20">
                            {data.type}
                        </span>
                    </div>
                    <p className="text-lg text-slate-400 leading-relaxed max-w-2xl">{data.description}</p>
                    <div className="flex gap-3">
                        <Button variant="primary" icon="edit" size="sm">Edit Entity</Button>
                        <Button variant="secondary" icon="share" size="sm">Share Profile</Button>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Stats / Attributes */}
                <div className="md:col-span-2 flex flex-col gap-8">
                    <GlassPanel className="p-8 space-y-6">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Core Attributes</h3>
                        <div className="space-y-6">
                            {data.attributes.map((attr, idx) => (
                                <div key={idx} className="space-y-2">
                                    <div className="flex justify-between items-end">
                                        <span className="text-sm font-bold text-white">{attr.label}</span>
                                        <span className="text-xs font-black text-slate-500">{attr.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full ${attr.color} rounded-full transition-all duration-1000 delay-300`}
                                            style={{ width: `${attr.value}%` }}
                                        ></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>

                    <GlassPanel className="p-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Recent Activity</h3>
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="flex items-center gap-4 py-3 border-b border-white/5 last:border-0">
                                    <div className="size-2 rounded-full bg-primary/50"></div>
                                    <p className="text-sm text-slate-400">Updated <span className="text-white font-medium">History Section</span> on Oct {20 + i}</p>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <GlassPanel className="p-8">
                        <h3 className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 mb-6">Relationships</h3>
                        <div className="space-y-4">
                            {data.relationships.map((rel, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-2 rounded-xl hove:bg-white/5 cursor-pointer transition-colors">
                                    <Avatar name={rel.name} size="sm" />
                                    <div className="flex-1">
                                        <p className="text-xs font-bold text-white">{rel.name}</p>
                                        <p className="text-[10px] text-slate-500">{rel.role}</p>
                                    </div>
                                    <span className="text-[10px] uppercase font-black text-slate-600">{rel.type}</span>
                                </div>
                            ))}
                        </div>
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
};

export default EntityProfile;
