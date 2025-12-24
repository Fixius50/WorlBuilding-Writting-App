import React, { useState } from 'react';
import GlassPanel from '../common/GlassPanel';
import Button from '../common/Button';

const TemplateManager = () => {
    const [selectedCategory, setSelectedCategory] = useState('Characters');
    const [templates, setTemplates] = useState({
        Characters: [
            { id: 1, label: 'Full Name', type: 'text', required: true },
            { id: 2, label: 'Age', type: 'number', required: false },
            { id: 3, label: 'Alignment', type: 'select', options: ['Good', 'Neutral', 'Evil'], required: false }
        ],
        Locations: [
            { id: 1, label: 'Region', type: 'text', required: true },
            { id: 2, label: 'Population', type: 'number', required: false }
        ]
    });

    const addField = () => {
        const newField = { id: Date.now(), label: 'New Field', type: 'text', required: false };
        setTemplates(prev => ({
            ...prev,
            [selectedCategory]: [...prev[selectedCategory], newField]
        }));
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <GlassPanel className="p-8 space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white">Entity Templates</h3>
                        <p className="text-xs text-slate-500 mt-1">Define custom fields for your world bible categories.</p>
                    </div>
                    <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-primary/50"
                    >
                        {Object.keys(templates).map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </header>

                <div className="space-y-4">
                    {templates[selectedCategory].map((field, idx) => (
                        <div key={field.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 group hover:border-white/10 transition-all">
                            <span className="text-[10px] font-black text-slate-700 w-6">0{idx + 1}</span>
                            <div className="flex-1 grid grid-cols-3 gap-4">
                                <TemplateInput label="Field Label" value={field.label} />
                                <div className="space-y-1.5">
                                    <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block ml-1">Data Type</label>
                                    <select className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-[10px] text-white outline-none">
                                        <option>Text</option>
                                        <option>Number</option>
                                        <option>Date</option>
                                        <option>Dropdown</option>
                                    </select>
                                </div>
                                <div className="flex items-center gap-4 pt-4">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={field.required} className="size-4 rounded border-white/10 bg-white/5 accent-primary" />
                                        <span className="text-[10px] font-bold text-slate-500">Required</span>
                                    </label>
                                </div>
                            </div>
                            <button className="p-2 rounded-lg text-slate-700 hover:text-red-400 hover:bg-red-400/10 transition-all opacity-0 group-hover:opacity-100">
                                <span className="material-symbols-outlined text-lg">delete</span>
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={addField}
                        className="w-full py-4 rounded-2xl border-2 border-dashed border-white/5 text-slate-600 hover:text-white hover:border-primary/30 hover:bg-primary/5 transition-all flex items-center justify-center gap-2"
                    >
                        <span className="material-symbols-outlined text-sm">add_circle</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Add New Field to {selectedCategory}</span>
                    </button>
                </div>
            </GlassPanel>

            <div className="flex justify-end gap-3">
                <Button variant="secondary">Restore Defaults</Button>
                <Button variant="primary">Apply Template Changes</Button>
            </div>
        </div>
    );
};

const TemplateInput = ({ label, value }) => (
    <div className="space-y-1.5">
        <label className="text-[8px] font-black uppercase tracking-widest text-slate-600 block ml-1">{label}</label>
        <input
            type="text"
            defaultValue={value}
            className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-[10px] text-white outline-none focus:border-primary/30 transition-all"
        />
    </div>
);

export default TemplateManager;
