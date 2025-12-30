import React, { useState, useEffect } from 'react';
import api from '../../../js/services/api';
import GlassPanel from '../common/GlassPanel';
import Button from '../common/Button';

const TemplateManager = () => {
    const [folders, setFolders] = useState([]);
    const [selectedFolderId, setSelectedFolderId] = useState('');
    const [templates, setTemplates] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadFolders();
    }, []);

    useEffect(() => {
        if (selectedFolderId) {
            loadTemplates(selectedFolderId);
        } else {
            setTemplates([]);
        }
    }, [selectedFolderId]);

    const loadFolders = async () => {
        try {
            // Flatten folder structure for dropdown or just get root for now
            // For simplicity, let's fetch root folders
            const data = await api.get('/world-bible/folders');
            setFolders(data);
            if (data.length > 0) setSelectedFolderId(data[0].id);
        } catch (err) {
            console.error("Error loading folders:", err);
        }
    };

    const loadTemplates = async (folderId) => {
        setLoading(true);
        try {
            const data = await api.get(`/world-bible/folders/${folderId}/templates`);
            setTemplates(data);
        } catch (err) {
            console.error("Error loading templates:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateTemplate = async (newField) => {
        if (!selectedFolderId) return;
        try {
            await api.post(`/world-bible/folders/${selectedFolderId}/templates`, {
                nombre: newField.label,
                tipo: newField.type,
                required: newField.required,
                metadata: newField.metadata ? JSON.stringify(newField.metadata) : null
            });
            loadTemplates(selectedFolderId);
        } catch (err) {
            console.error("Error creating template:", err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
            <GlassPanel className="p-8 space-y-8">
                <header className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-bold text-white">Folder Templates</h3>
                        <p className="text-xs text-slate-500 mt-1">Define default attributes for entities in...</p>
                    </div>
                    <select
                        value={selectedFolderId}
                        onChange={(e) => setSelectedFolderId(e.target.value)}
                        className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-primary/50"
                    >
                        <option value="">Select a Folder...</option>
                        {folders.map(f => (
                            <option key={f.id} value={f.id}>{f.nombre}</option>
                        ))}
                    </select>
                </header>

                <div className="space-y-4">
                     {loading ? (
                        <div className="text-center p-4 text-slate-500">Loading templates...</div>
                    ) : (
                        templates.map((tpl, idx) => (
                            <div key={tpl.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5">
                                <span className="text-[10px] font-black text-slate-700 w-6">0{idx + 1}</span>
                                <div className="flex-1">
                                    <div className="text-sm font-bold text-white">{tpl.nombre}</div>
                                    <div className="text-[10px] text-slate-500 uppercase tracking-widest">{tpl.tipo} {tpl.esObligatorio && '• Required'}</div>
                                    {tpl.metadata && <div className="text-[10px] text-slate-600 font-mono mt-1 truncate">{tpl.metadata}</div>}
                                </div>
                            </div>
                        ))
                    )}
                    
                    <NewFieldForm onAdd={handleCreateTemplate} />
                </div>
            </GlassPanel>
        </div>
    );
};

const NewFieldForm = ({ onAdd }) => {
    const [label, setLabel] = useState('');
    const [type, setType] = useState('text');
    const [required, setRequired] = useState(false);
    
    // For Dropdown
    const [options, setOptions] = useState('');

    const handleSubmit = () => {
        if (!label) return;
        
        const metadata = type === 'select' 
            ? { options: options.split(',').map(s => s.trim()).filter(Boolean) } 
            : null;

        onAdd({ label, type, required, metadata });
        setLabel('');
        setOptions('');
    };

    return (
        <div className="p-4 rounded-2xl border-2 border-dashed border-white/10 bg-white/[0.01] space-y-4">
            <h4 className="text-xs font-black uppercase tracking-widest text-primary">Add New Attribute</h4>
            <div className="grid grid-cols-2 gap-4">
                <input 
                    placeholder="Field Name" 
                    value={label} 
                    onChange={e => setLabel(e.target.value)}
                    className="bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-primary/30"
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
                    <option value="select">Dropdown (Selector)</option>
                    <option value="boolean">Checkbox</option>
                </select>
            </div>
            
            {type === 'select' && (
                <input 
                    placeholder="Options (comma separated, e.g. High, Medium, Low)" 
                    value={options} 
                    onChange={e => setOptions(e.target.value)}
                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-primary/30"
                />
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
