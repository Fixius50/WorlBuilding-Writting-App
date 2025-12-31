import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';
import api from '../../../js/services/api';
import GlassPanel from '../../components/common/GlassPanel';
import SpecializedMap from './Specialized/SpecializedMap';
import SpecializedTimeline from './Specialized/SpecializedTimeline';

const EntityBuilder = () => {
    const { entityId } = useParams();
    const { setRightOpen, setAvailableTemplates, setAddAttributeHandler } = useOutletContext();
    const [entity, setEntity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [localValues, setLocalValues] = useState({}); // { valorId: newValue }
    const [viewMode, setViewMode] = useState('attributes'); // 'attributes', 'special'
    const [linkableEntities, setLinkableEntities] = useState([]);

    useEffect(() => {
        loadEntity();
        // Load all entities for linking if needed
        loadLinkableEntities();
        setViewMode('attributes'); // Reset view on entity change
    }, [entityId]);

    const loadLinkableEntities = async () => {
        try {
            // Assuming an endpoint exists to get a flat list of entities for the selector
            const all = await api.get('/world-bible/entities');
            setLinkableEntities(all);
        } catch (e) { console.error("Could not load linkable entities", e); }
    };


    // Register Handler for Toolbox
    useEffect(() => {
        if (setAddAttributeHandler) {
            setAddAttributeHandler(() => handleAddAttribute);
        }
        return () => {
            if (setAddAttributeHandler) setAddAttributeHandler(null);
        };
    }, [entityId, setAddAttributeHandler]); // Re-register if ID changes

    const loadEntity = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/world-bible/entities/${entityId}`);
            setEntity(data);

            // Map current values to local state
            const valMap = {};
            data.valores?.forEach(v => {
                valMap[v.id] = v.valor;
            });
            setLocalValues(valMap);

            // Load templates for this folder context
            if (data.carpeta?.id) {
                const templates = await api.get(`/world-bible/folders/${data.carpeta.id}/templates`);
                setAvailableTemplates(templates);
            }
        } catch (err) {
            console.error("Error loading entity:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleAddAttribute = async (templateId) => {
        try {
            await api.post(`/world-bible/entities/${entityId}/attributes`, { plantillaId: templateId });
            // Reload entity to see the new attribute
            const data = await api.get(`/world-bible/entities/${entityId}`);
            setEntity(data);
            // Update local values for the new attribute
            const valMap = {};
            data.valores?.forEach(v => {
                valMap[v.id] = v.valor;
            });
            setLocalValues(valMap);

            // Allow user to see it immediately
            setRightOpen(false);
        } catch (err) {
            console.error("Error adding attribute:", err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const updates = Object.entries(localValues).map(([id, val]) => ({
                valorId: parseInt(id),
                nuevoValor: val
            }));
            await api.patch(`/world-bible/entities/${entityId}/values`, updates);
            // Optional: Show toast
        } catch (err) {
            console.error("Error saving entity:", err);
        } finally {
            setSaving(false);
        }
    };

    const handleAttributeChange = (id, value) => {
        setLocalValues(prev => ({ ...prev, [id]: value }));
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-text-muted uppercase tracking-widest font-black">Summoning Entity...</div>;
    if (!entity) return <div className="p-20 text-center text-red-500">Entity lost in the void.</div>;

    return (
        <div className="flex-1 flex flex-col p-8 max-w-5xl mx-auto w-full @container">
            {/* Header */}
            <header className="mb-12 flex items-end justify-between gap-6 px-4">
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-xs font-black uppercase tracking-widest text-primary italic">
                        <span className="material-symbols-outlined text-sm">folder</span>
                        {entity.carpeta?.nombre || 'Root'}
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter">{entity.nombre}</h1>
                </div>

                <div className="flex gap-2">
                    <button onClick={() => setRightOpen(true)} className="size-12 rounded-2xl bg-white/5 border border-glass-border flex items-center justify-center text-text-muted hover:text-white transition-all hover:bg-white/10" title="Manage Attributes">
                        <span className="material-symbols-outlined">tune</span>
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className={`size-12 rounded-2xl bg-primary flex items-center justify-center text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all ${saving && 'opacity-50 animate-pulse'}`}
                    >
                        <span className="material-symbols-outlined">{saving ? 'sync' : 'save'}</span>
                    </button>
                </div>
            </header>

            {/* Dynamic Content Grid */}
            <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 pb-40 ${viewMode !== 'attributes' ? 'hidden' : ''}`}>
                {entity.valores?.map((val) => (
                    <AttributeField
                        key={val.id}
                        attribute={val}
                        value={localValues[val.id]}
                        onChange={(newVal) => handleAttributeChange(val.id, newVal)}
                        linkableEntities={linkableEntities}
                    />
                ))}

                {/* Empty State / Add Attribute */}
                <div
                    onClick={() => setRightOpen(true)}
                    className="md:col-span-2 border-2 border-dashed border-glass-border rounded-3xl p-12 flex flex-col items-center justify-center text-text-muted hover:border-primary/30 hover:text-white cursor-pointer transition-all group opacity-40 hover:opacity-100"
                >
                    <div className="size-16 rounded-full bg-white/5 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <span className="material-symbols-outlined text-3xl">add</span>
                    </div>
                    <p className="text-xs font-black uppercase tracking-widest">Enhance Entity with New Attributes</p>
                </div>
            </div>

            {/* Specialized Views */}
            {viewMode === 'special' && (
                <div className="w-full pb-40">
                    {entity.tipoEspecial === 'map' && <SpecializedMap entity={entity} active={true} />}
                    {entity.tipoEspecial === 'timeline' && <SpecializedTimeline entity={entity} active={true} />}
                </div>
            )}

            {/* Contextual Function Tabs (Bottom Overlay) */}
            {entity.tipoEspecial && (
                <div className="fixed bottom-32 left-1/2 -translate-x-1/2 flex gap-4 animate-slide-up z-40 bg-surface-dark/80 backdrop-blur-xl p-2 rounded-2xl border border-glass-border shadow-2xl">
                    <button
                        onClick={() => setViewMode('attributes')}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${viewMode === 'attributes' ? 'bg-white text-surface-dark shadow-lg scale-105' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined">dataset</span>
                        Attributes
                    </button>
                    <button
                        onClick={() => setViewMode('special')}
                        className={`px-6 py-3 rounded-xl font-bold flex items-center gap-3 transition-all ${viewMode === 'special' ? 'bg-primary text-white shadow-lg scale-105' : 'text-text-muted hover:text-white hover:bg-white/5'}`}
                    >
                        <span className="material-symbols-outlined">
                            {entity.tipoEspecial === 'map' ? 'map' : entity.tipoEspecial === 'timeline' ? 'timeline' : 'analytics'}
                        </span>
                        {entity.tipoEspecial === 'map' ? 'Interactive Map' : entity.tipoEspecial === 'timeline' ? 'Timeline View' : 'Specialized'}
                    </button>
                </div>
            )}
        </div>
    );
};

const AttributeField = ({ attribute, value, onChange, linkableEntities = [] }) => {
    const { plantilla } = attribute;

    const renderInput = () => {
        switch (plantilla.tipo) {
            case 'text':
                return (
                    <textarea
                        className="w-full bg-transparent text-white text-sm font-medium focus:outline-none resize-none no-scrollbar h-auto min-h-[100px]"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="..."
                    />
                );
            case 'short_text':
                return (
                    <input
                        type="text"
                        className="w-full bg-transparent text-white text-sm font-medium focus:outline-none"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                        placeholder="..."
                    />
                );
            case 'number':
                return (
                    <input
                        type="number"
                        className="w-full bg-transparent text-white text-sm font-medium focus:outline-none"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                );
            case 'boolean':
                return (
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onChange(value === 'true' ? 'false' : 'true')}
                            className={`size-6 rounded-lg border flex items-center justify-center transition-all ${value === 'true' ? 'bg-primary border-primary text-white' : 'border-glass-border text-transparent hover:border-primary/50'}`}
                        >
                            <span className="material-symbols-outlined text-sm">check</span>
                        </button>
                        <span className="text-xs text-text-muted">{value === 'true' ? 'Enabled' : 'Disabled'}</span>
                    </div>
                );
            case 'select':
                let options = [];
                try {
                    const meta = JSON.parse(plantilla.metadata || '{}');
                    options = meta.options || [];
                } catch (e) {
                    console.error("Invalid metadata for select", e);
                }
                return (
                    <div className="relative">
                        <select
                            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                        >
                            <option value="">Select an option...</option>
                            {options.map((opt, i) => (
                                <option key={i} value={opt} className="bg-surface-dark text-white p-2">
                                    {opt}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                            <span className="material-symbols-outlined text-sm">unfold_more</span>
                        </div>
                    </div>
                );
            case 'date':
                return (
                    <input
                        type="date"
                        className="w-full bg-transparent text-white text-sm font-medium focus:outline-none [color-scheme:dark]"
                        value={value || ''}
                        onChange={(e) => onChange(e.target.value)}
                    />
                );
            case 'entity_link':
                return (
                    <div className="relative">
                        <select
                            className="w-full bg-black/30 border border-white/5 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-primary/50 appearance-none cursor-pointer"
                            value={value || ''}
                            onChange={(e) => onChange(e.target.value)}
                        >
                            <option value="">Select an Entity Link...</option>
                            {linkableEntities.map((ent) => (
                                <option key={ent.id} value={ent.id} className="bg-surface-dark text-white p-2">
                                    {ent.nombre}
                                </option>
                            ))}
                        </select>
                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/50">
                            <span className="material-symbols-outlined text-sm">link</span>
                        </div>
                    </div>
                );
            case 'image':
                return (
                    <div className="space-y-2">
                        <div className="flex gap-2">
                            <input
                                type="text"
                                className="flex-1 bg-black/30 border border-white/5 rounded-xl px-4 py-2 text-xs text-text-muted focus:text-white focus:outline-none"
                                placeholder="Image URL..."
                                value={value || ''}
                                onChange={(e) => onChange(e.target.value)}
                            />
                        </div>
                        {value && (
                            <div className="w-full aspect-video rounded-xl bg-black/40 border border-white/5 overflow-hidden relative group">
                                <img src={value} alt="Preview" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                            </div>
                        )}
                        {!value && (
                            <div className="w-full h-20 rounded-xl bg-white/5 border border-dashed border-white/10 flex items-center justify-center text-text-muted/30">
                                <span className="material-symbols-outlined">image</span>
                            </div>
                        )}
                    </div>
                );
            case 'table':
                // Basic JSON Table Editor Placeholder
                const tableData = value || "[]";
                return (
                    <div className="space-y-2">
                        <textarea
                            className="w-full h-32 bg-black/30 border border-white/5 rounded-xl p-3 text-xs font-mono text-white/70 focus:outline-none focus:border-primary/50"
                            value={tableData}
                            onChange={(e) => onChange(e.target.value)}
                            placeholder='[{"Item": "Sword", "Qty": 1}, ...]'
                        />
                        <div className="text-[10px] text-text-muted flex justify-between">
                            <span>JSON Format supported</span>
                            <span className="material-symbols-outlined text-xs">data_array</span>
                        </div>
                    </div>
                );
            default:
                return (
                    <div className="text-sm font-medium text-white/70 italic p-2 rounded-lg bg-white/5 border border-white/5">
                        <span className="text-[10px] uppercase font-bold text-slate-500 mr-2">{plantilla.tipo}</span>
                        {value}
                    </div>
                );
        }
    };

    return (
        <GlassPanel className="p-6 border-white/5 hover:border-primary/20 transition-all group relative overflow-hidden h-full flex flex-col">
            <label className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-xs opacity-50">label</span>
                {plantilla.nombre}
            </label>

            <div className="flex-1">
                {renderInput()}
            </div>

            {/* Subtle Gradient Hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
        </GlassPanel>
    );
}

export default EntityBuilder;
