import React, { useState, useEffect } from 'react';
import api from '../../../js/services/api';
import GlassPanel from '../common/GlassPanel';
import Button from '../common/Button';
import ConfirmationModal from '../ConfirmationModal';

const TemplateManager = ({ compact = false }) => {
    // We only need the Root Folder ID to attach the global templates to (Database requirement)
    // But logically they are global.
    const [rootFolderId, setRootFolderId] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);

    // Modal State for Deletion
    const [confirmDeleteId, setConfirmDeleteId] = useState(null);

    useEffect(() => {
        initialize();
    }, []);

    const initialize = async () => {
        try {
            // 1. Get Root Folder for attachment
            const folders = await api.get('/world-bible/folders');
            if (folders.length > 0) {
                setRootFolderId(folders[0].id);
            }
            // 2. Load Global Templates
            loadGlobalTemplates();
        } catch (err) {
            console.error("Init error:", err);
        }
    };

    const loadGlobalTemplates = async () => {
        setLoading(true);
        try {
            const data = await api.get('/world-bible/templates/global');
            setTemplates(data);
        } catch (err) {
            console.error("Error loading templates:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async (newField) => {
        if (!rootFolderId) return;
        try {
            // Create in Root Folder but mark as Global
            await api.post(`/world-bible/folders/${rootFolderId}/templates`, {
                nombre: newField.label,
                tipo: newField.type,
                required: newField.required,
                metadata: newField.metadata ? JSON.stringify(newField.metadata) : null,
                global: true
            });
            loadGlobalTemplates();
        } catch (err) {
            console.error("Error creating template:", err);
        }
    };

    const confirmDeleteAction = async () => {
        if (!confirmDeleteId) return;
        try {
            await api.delete(`/world-bible/templates/${confirmDeleteId}`);
            setTemplates(prev => prev.filter(t => t.id !== confirmDeleteId));
        } catch (err) {
            console.error("Error deleting template:", err);
        } finally {
            setConfirmDeleteId(null);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <GlassPanel className={`${compact ? 'p-4 bg-transparent border-none shadow-none' : 'p-8 space-y-8'}`}>
                <header className={`flex ${compact ? 'flex-col gap-4' : 'justify-between items-center'}`}>
                    <div>
                        <h3 className={`${compact ? 'text-sm' : 'text-xl'} font-bold text-white`}>Atributos Globales</h3>
                        <p className="text-xs text-slate-500 mt-1">Define atributos disponibles para todas las entidades.</p>
                    </div>
                    {/* Folder Selection Removed - Global Mode */}
                </header>

                <div className="space-y-4">
                    {loading ? (
                        <div className="text-center p-4 text-slate-500">Cargando plantillas...</div>
                    ) : (
                        templates.map((tpl, idx) => (
                            <div
                                key={tpl.id}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-primary/50 hover:bg-white/5 transition-all cursor-grab active:cursor-grabbing group select-none"
                                draggable
                                onDragStart={(e) => {
                                    e.dataTransfer.setData('application/reactflow/type', 'attribute');
                                    e.dataTransfer.setData('templateId', tpl.id);
                                    e.dataTransfer.setData('templateData', JSON.stringify(tpl));
                                    e.dataTransfer.effectAllowed = 'copy';
                                }}
                            >
                                <span className="text-[10px] font-black text-slate-700 w-6 group-hover:text-primary transition-colors">0{idx + 1}</span>
                                <div className="flex-1 pointer-events-none">
                                    <div className="text-sm font-bold text-white">{tpl.nombre}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">{tpl.tipo} {tpl.esObligatorio && '• Required'}</div>
                                    {tpl.metadata && <div className="text-[10px] text-slate-600 font-mono mt-1 truncate">{tpl.metadata}</div>}
                                </div>
                                <button
                                    onClick={() => setConfirmDeleteId(tpl.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg transition-colors"
                                    title="Eliminar Plantilla Global"
                                >
                                    <span className="material-symbols-outlined text-sm">delete</span>
                                </button>
                            </div>
                        ))
                    )}

                    <NewFieldForm onAdd={handleCreateTemplate} />
                </div>
            </GlassPanel >

            {/* Confirmation Modal */}
            < ConfirmationModal
                isOpen={!!confirmDeleteId}
                onClose={() => setConfirmDeleteId(null)}
                onConfirm={confirmDeleteAction}
                title="Eliminar Plantilla"
                message="¿Estás seguro de que quieres eliminar esta plantilla? Esta acción es irreversible."
                confirmText="Eliminar"
                type="danger"
            />
        </div >
    );
};

const NewFieldForm = ({ onAdd }) => {
    const [label, setLabel] = useState('');
    const [type, setType] = useState('text');
    const [required, setRequired] = useState(false);

    // For Dropdown/MultiSelect
    const [options, setOptions] = useState(['']);

    const handleAddOption = () => setOptions([...options, '']);
    const handleRemoveOption = (idx) => setOptions(options.filter((_, i) => i !== idx));
    const handleOptionChange = (idx, val) => {
        const newOpts = [...options];
        newOpts[idx] = val;
        setOptions(newOpts);
    };

    const handleSubmit = () => {
        if (!label) return;

        let metadata = null;
        if (['select', 'multi_select'].includes(type)) {
            metadata = { options: options.filter(o => o.trim()) };
        }

        onAdd({ label, type, required, metadata });
        setLabel('');
        setOptions(['']);
    };

    return (
        <div className="p-4 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary">Add New Attribute</h4>
            <div className="grid grid-cols-2 gap-4">
                <input
                    placeholder="Field Name"
                    value={label}
                    onChange={e => setLabel(e.target.value)}
                    className="bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-primary/30 min-w-0"
                />
                <select
                    value={type}
                    onChange={e => setType(e.target.value)}
                    className="bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none"
                >
                    <option value="text">Text (Long)</option>
                    <option value="short_text">Text (Short)</option>
                    <option value="number">Number</option>
                    <option value="date">Date</option>
                    <option value="select">Single Selection (Dropdown)</option>
                    <option value="multi_select">Multiple Selection</option>
                    <option value="boolean">Switch (True/False)</option>
                </select>
            </div>

            {['select', 'multi_select'].includes(type) && (
                <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase">Options</label>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2 custom-scrollbar">
                        {options.map((opt, idx) => (
                            <div key={idx} className="flex gap-2">
                                <input
                                    placeholder={`Option ${idx + 1}`}
                                    value={opt}
                                    onChange={e => handleOptionChange(idx, e.target.value)}
                                    className="flex-1 bg-black/20 border border-white/5 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-primary/30"
                                />
                                <button
                                    onClick={() => handleRemoveOption(idx)}
                                    className="p-1.5 hover:bg-red-500/20 text-slate-500 hover:text-red-400 rounded-lg transition-colors"
                                >
                                    <span className="material-symbols-outlined text-sm">close</span>
                                </button>
                            </div>
                        ))}
                    </div>
                    <button
                        onClick={handleAddOption}
                        className="w-full py-1.5 text-[10px] font-bold uppercase tracking-widest text-primary hover:bg-primary/5 rounded-lg border border-dashed border-primary/20 transition-all"
                    >
                        + Add Custom Option
                    </button>
                </div>
            )}

            <div className="flex justify-between items-center">
                <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={required} onChange={e => setRequired(e.target.checked)} className="size-4 rounded border-white/10 bg-white/5 accent-primary" />
                    <span className="text-[10px] font-bold text-slate-500">Required Field</span>
                </label>
                <button onClick={handleSubmit} className="px-4 py-2 bg-primary/20 text-primary rounded-lg text-xs font-bold hover:bg-primary/30 transition-all">
                    + Add Field
                </button>
            </div>
        </div>
    );
};

export default TemplateManager;
