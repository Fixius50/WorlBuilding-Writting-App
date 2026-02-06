import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const EntityBuilderSidebar = ({ templates, onAddTemplate }) => {
    const { t } = useLanguage();
    const [filter, setFilter] = useState('');

    const filteredTemplates = (templates || []).filter(tpl =>
        tpl.label?.toLowerCase().includes(filter.toLowerCase()) ||
        tpl.code?.toLowerCase().includes(filter.toLowerCase())
    );

    const handleDragStart = (e, template) => {
        e.dataTransfer.setData('application/reactflow/type', 'attribute');
        e.dataTransfer.setData('templateId', template.id.toString());
        // Also pass full data for drop zones that support it
        e.dataTransfer.setData('templateData', JSON.stringify(template));
        e.dataTransfer.effectAllowed = 'copy';
    };

    return (
        <div className="h-full flex flex-col p-4 space-y-4 animate-in fade-in slide-in-from-right-4">
            {/* Header */}
            <div className="flex items-center gap-3 text-slate-400">
                <span className="material-symbols-outlined">dataset</span>
                <h3 className="text-xs font-black uppercase tracking-widest">{t('builder.attributes') || 'Attributes'}</h3>
            </div>

            {/* Helper Text */}
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                <p className="text-[10px] text-indigo-300 leading-relaxed flex gap-2">
                    <span className="material-symbols-outlined text-sm shrink-0">drag_indicator</span>
                    Drag attributes from this list onto the entity's "Attributes" tab to add them.
                </p>
            </div>

            {/* Filter */}
            <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-sm">search</span>
                <input
                    className="w-full bg-black/30 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:border-primary/50 outline-none"
                    placeholder="Search templates..."
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                {filteredTemplates.length === 0 ? (
                    <div className="text-center py-8 text-slate-600 text-xs italic">
                        No templates found.
                    </div>
                ) : (
                    filteredTemplates.map(tpl => (
                        <div
                            key={tpl.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, tpl)}
                            className="bg-[#1a1a20] hover:bg-white/5 border border-white/5 hover:border-white/20 rounded-lg p-3 cursor-grab active:cursor-grabbing transition-all group"
                        >
                            <div className="flex items-center justify-between mb-1">
                                <span className="text-xs font-bold text-slate-200 group-hover:text-white">{tpl.label}</span>
                                <span className="material-symbols-outlined text-slate-600 text-xs">drag_pan</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className={`text-[8px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${tpl.tipoDato === 'text' ? 'bg-blue-500/20 text-blue-300' :
                                        tpl.tipoDato === 'number' ? 'bg-emerald-500/20 text-emerald-300' :
                                            tpl.tipoDato === 'boolean' ? 'bg-purple-500/20 text-purple-300' :
                                                'bg-slate-500/20 text-slate-300'
                                    }`}>
                                    {tpl.tipoDato}
                                </div>
                                {tpl.esObligatorio && (
                                    <span className="text-[8px] font-black text-rose-400 uppercase">*Req</span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create New (Optional hint) */}
            <div className="pt-2 border-t border-white/5 text-center">
                <p className="text-[10px] text-slate-600">
                    Manage templates in Bible Settings
                </p>
            </div>
        </div>
    );
};

export default EntityBuilderSidebar;
