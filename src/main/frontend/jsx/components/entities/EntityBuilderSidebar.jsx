import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';

const EntityBuilderSidebar = ({ templates, onAddTemplate, currentFields = [] }) => {
    const { t } = useLanguage();
    const [filter, setFilter] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const [newTpl, setNewTpl] = useState({ label: '', tipo: 'text' });

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

    const handleCreateTemplate = () => {
        if (!newTpl.label.trim()) return;
        onAddTemplate({
            ...newTpl,
            id: Date.now(),
            code: newTpl.label.toLowerCase().replace(/\s+/g, '_')
        });
        setNewTpl({ label: '', tipo: 'text' });
        setIsCreating(false);
    };

    return (
        <div className="flex flex-col h-full bg-surface-dark border-l border-glass-border w-full animate-in slide-in-from-right duration-500">
            {/* Header */}
            <div className="p-6 border-b border-white/5 bg-gradient-to-br from-primary/10 to-transparent">
                <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">schema</span> {t('builder.templates') || 'Templates'}
                    </h3>
                    <button
                        onClick={() => setIsCreating(!isCreating)}
                        className={`size-8 rounded-full flex items-center justify-center transition-all ${isCreating ? 'bg-red-500 text-white rotate-45' : 'bg-white/5 text-primary hover:bg-primary hover:text-white'}`}
                    >
                        <span className="material-symbols-outlined text-sm">add</span>
                    </button>
                </div>

                {isCreating ? (
                    <div className="space-y-3 p-4 rounded-2xl bg-black/40 border border-primary/20 animate-in fade-in zoom-in-95">
                        <input
                            autoFocus
                            placeholder="Nombre del atributo..."
                            className="w-full bg-transparent border-b border-white/10 py-1 text-xs text-white outline-none focus:border-primary"
                            value={newTpl.label}
                            onChange={e => setNewTpl({ ...newTpl, label: e.target.value })}
                        />
                        <select
                            className="w-full bg-black/50 border border-white/10 rounded-lg px-2 py-1.5 text-[10px] text-white/70 outline-none"
                            value={newTpl.tipo}
                            onChange={e => setNewTpl({ ...newTpl, tipo: e.target.value })}
                        >
                            <option value="text">Texto Largo</option>
                            <option value="short_text">Texto Corto</option>
                            <option value="number">Número</option>
                            <option value="boolean">Booleano</option>
                            <option value="date">Fecha</option>
                            <option value="select">Selección Única</option>
                        </select>
                        <button
                            onClick={handleCreateTemplate}
                            className="w-full py-2 bg-primary text-white rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20"
                        >
                            Crear Plantilla
                        </button>
                    </div>
                ) : (
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-xs text-text-muted">search</span>
                        <input
                            type="text"
                            placeholder={t('common.search')}
                            className="w-full bg-black/20 border border-white/5 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:border-primary/50 outline-none transition-all placeholder:text-white/10"
                            value={filter}
                            onChange={(e) => setFilter(e.target.value)}
                        />
                    </div>
                )}
            </div>

            {/* Current Attributes Summary */}
            {currentFields.length > 0 && (
                <div className="space-y-2 p-6 pt-0">
                    <div className="flex items-center gap-2 text-slate-500 px-1">
                        <span className="material-symbols-outlined text-xs">summary</span>
                        <span className="text-[10px] font-black uppercase tracking-widest">Active Attributes</span>
                    </div>
                    <div className="max-h-48 overflow-y-auto custom-scrollbar space-y-1 bg-white/[0.02] rounded-xl p-2 border border-white/5">
                        {currentFields.map(f => (
                            <div key={f.id} className="flex flex-col p-1.5 rounded bg-white/5 border border-white/5">
                                <span className="text-[9px] font-bold text-primary uppercase tracking-tighter truncate">{f.attribute?.nombre || 'Unnamed'}</span>
                                <span className="text-[10px] text-slate-300 truncate">
                                    {typeof f.value === 'string' && f.value.startsWith('[') ? 'Multiple Values' : (f.value || '---')}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

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
                                <span className="text-xs font-bold text-slate-200 group-hover:text-primary">{tpl.label}</span>
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
