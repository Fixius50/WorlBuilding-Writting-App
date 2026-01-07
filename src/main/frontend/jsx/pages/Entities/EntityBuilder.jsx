import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import api from '../../../js/services/api';
import AttributeField from './AttributeField';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import RelationshipManager from '../../components/relationships/RelationshipManager';

const EntityBuilder = ({ mode }) => {
    const { username, projectName, entitySlug, folderSlug, type } = useParams();
    const navigate = useNavigate();
    const isCreation = mode === 'creation';

    // Layout Context
    const { setRightOpen, setAvailableTemplates, setRightPanelMode, setAddAttributeHandler, setEntityTabs, activeEntityTab, setActiveEntityTab } = useOutletContext();

    // Core Data State
    const [entity, setEntity] = useState({
        nombre: '',
        tipo: 'entidadindividual',
        descripcion: '',
        color: '#6366f1', // Default PRIMARY color
        apariencia: '',
        notas: '',
        iconUrl: null, // Base64 or Blob URL
        tipoEspecial: type || null,
        carpeta: null
    });

    // Attribute State
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [removedFieldIds, setRemovedFieldIds] = useState([]);

    // UI State
    // const [activeTab, setActiveTab] = useState('identity'); // REMOVED: Now managed by Layout

    // --- INITIALIZATION ---
    useEffect(() => {
        // Configure Global Right Panel
        setRightOpen(true);
        setRightPanelMode('ENTITY');
        setEntityTabs(['identity', 'backstory', 'attributes', 'relationships', 'notes']);
        setActiveEntityTab('identity');

        return () => {
            // Restore default panel state when leaving builder
            setRightPanelMode('NOTES');
            setEntityTabs([]);
        };
    }, []);

    useEffect(() => {
        if (isCreation) loadCreationMode();
        else loadEntity();
    }, [entitySlug, folderSlug, isCreation]);

    const setupContextHandlers = (templates) => {
        // Push templates to Layout
        setAvailableTemplates(templates);

        // Define Handler for adding attributes from Sidebar
        setAddAttributeHandler((templateId) => {
            const tpl = templates.find(t => t.id === templateId);
            if (tpl) {
                setFields(prev => {
                    if (prev.some(f => f.attribute.id === tpl.id)) {
                        alert("Attribute already added.");
                        return prev;
                    }
                    return [...prev, {
                        id: `temp-${tpl.id}`,
                        attribute: tpl,
                        value: tpl.valorDefecto || '',
                        isTemp: true
                    }];
                });
            }
        });
    };

    const loadCreationMode = async () => {
        setLoading(true);
        try {
            const folderInfo = await api.get(`/world-bible/folders/${folderSlug}`);
            const folderTemplates = await api.get(`/world-bible/folders/${folderSlug}/templates`);

            setupContextHandlers(folderTemplates);

            setEntity(prev => ({
                ...prev,
                nombre: `Nuevo ${type === 'map' ? 'Mapa' : type === 'timeline' ? 'Cronograma' : 'Ente'}`,
                carpeta: folderInfo,
                tipoEspecial: type || 'entidadindividual',
                tipo: type || 'entidadindividual' // Initialize 'tipo' for new entities
            }));

            // Auto-populate? Maybe better to let user choose.
            // But if we want to default them:
            const initialFields = folderTemplates.map(tpl => ({
                id: `temp-${tpl.id}`,
                attribute: tpl,
                value: tpl.valorDefecto || '',
                isTemp: true
            }));
            setFields(initialFields);
        } catch (err) {
            console.error("Error creating draft:", err);
        } finally {
            setLoading(false);
        }
    };

    const loadEntity = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/world-bible/entities/${entitySlug}`);
            setEntity({
                ...data,
                apariencia: data.apariencia || '',
                notas: data.notas || '',
                iconUrl: data.iconUrl || null,
                tags: data.tags || '',
                tipo: data.tipoEspecial || getHierarchyType(data.tipo).id, // Ensure 'tipo' is set
                color: data.color || '#6366f1' // Ensure 'color' is set
            });

            if (data.carpeta?.id) {
                const folderTemplates = await api.get(`/world-bible/folders/${data.carpeta.id}/templates`);
                setupContextHandlers(folderTemplates);
            }

            const loadedFields = (data.valores || []).map(val => ({
                id: val.id.toString(),
                attribute: val.plantilla,
                value: val.valor,
                isTemp: false
            }));
            setFields(loadedFields);
        } catch (err) {
            console.error("Error loading entity:", err);
        } finally {
            setLoading(false);
        }
    };

    // --- HANDLERS ---
    const handleCoreChange = (key, val) => {
        setEntity(prev => ({ ...prev, [key]: val }));
    };

    const handleIconUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleCoreChange('iconUrl', reader.result); // Save as Base64
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFieldChange = (id, newValue) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, value: newValue } : f));
    };

    const handleRemoveField = (id) => {
        if (!id.toString().startsWith('temp-')) {
            setRemovedFieldIds(prev => [...prev, id]);
        }
        setFields(prev => prev.filter(f => f.id !== id));
    };

    // Auto-Save Handler for critical properties (Icon, Color)
    const handleAutoSave = async (field, value) => {
        // 1. Update Local State Immediately
        setEntity(prev => ({ ...prev, [field]: value }));

        // 2. Persist to Backend if not new
        if (!isNew) {
            try {
                const updatedEntity = { ...entity, [field]: value };
                await api.put(`/world-bible/entities/${entityId}`, updatedEntity);
                console.log(`Auto-saved ${field}`);
            } catch (err) {
                console.error(`Failed to auto-save ${field}`, err);
                // Optionally revert state here on failure
            }
        }
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                handleAutoSave('iconUrl', reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSave = async (shouldRedirect = true) => {
        setSaving(true);
        try {
            const payload = {
                nombre: entity.nombre,
                descripcion: entity.descripcion,
                tags: entity.tags,
                apariencia: entity.apariencia,
                notas: entity.notas,
                iconUrl: entity.iconUrl,
                tipoEspecial: entity.tipoEspecial || 'entidadindividual',
                color: entity.color // Include color in the payload
            };

            let targetId = entity.id;

            if (isCreation) {
                payload.carpetaId = entity.carpeta.id;
                const newEntity = await api.post('/world-bible/entities', payload);
                targetId = newEntity.id;

                // Save Attributes
                for (const field of fields) {
                    if (field.isTemp) {
                        const val = await api.post(`/world-bible/entities/${newEntity.id}/attributes`, {
                            plantillaId: field.attribute.id
                        });
                        await api.patch(`/world-bible/entities/${newEntity.id}/values`, [{
                            valorId: val.id,
                            nuevoValor: field.value
                        }]);
                    }
                }
                setSaving(false);

                if (shouldRedirect) {
                    navigate(`/${username}/${projectName}/bible/folder/${folderSlug}`);
                } else {
                    // Update URL without reloading to switch to Edit Mode
                    navigate(`/${username}/${projectName}/bible/folder/${folderSlug}/entity/${newEntity.slug || newEntity.id}/edit`, { replace: true });
                }
                return;
            }

            // Update Existing
            await api.put(`/world-bible/entities/${targetId}`, { nombre: payload.nombre, color: payload.color, iconUrl: payload.iconUrl }); // Update name, color, iconUrl
            await api.patch(`/world-bible/entities/${targetId}/details`, {
                descripcion: payload.descripcion,
                tags: payload.tags,
                apariencia: payload.apariencia,
                notas: payload.notas,
                iconUrl: payload.iconUrl
            });

            if (removedFieldIds.length > 0) {
                await Promise.all(removedFieldIds.map(id => api.delete(`/world-bible/values/${id}`)));
                setRemovedFieldIds([]);
            }

            const updates = fields
                .filter(f => !f.isTemp)
                .map(f => ({ valorId: parseInt(f.id), nuevoValor: f.value }));

            if (updates.length > 0) {
                await api.patch(`/world-bible/entities/${targetId}/values`, updates);
            }

            // Also handle newly added fields during edit (converted from temp)
            for (const field of fields) {
                if (field.isTemp) {
                    const val = await api.post(`/world-bible/entities/${targetId}/attributes`, {
                        plantillaId: field.attribute.id
                    });
                    await api.patch(`/world-bible/entities/${targetId}/values`, [{
                        valorId: val.id,
                        nuevoValor: field.value
                    }]);
                    // Update local state to make it non-temp
                    field.id = val.id.toString();
                    field.isTemp = false;
                }
            }

            setSaving(false);
        } catch (err) {
            console.error("Save error", err);
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse">Loading Builder...</div>;

    return (
        <div className="flex h-full w-full bg-background-dark overflow-hidden">

            {/* --- MAIN AREA --- */}
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar relative">

                {/* Header Actions */}
                <div className="border-b border-white/5 p-4 flex justify-between items-center bg-background-dark/80 backdrop-blur sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Avatar url={entity.iconUrl} name={entity.nombre} className="size-10 rounded-lg border border-white/10" />
                        <div>
                            <h1 className="text-lg font-bold text-white leading-tight">{entity.nombre || 'Sin Nombre'}</h1>
                            <span className="text-[10px] uppercase font-black tracking-widest text-slate-500">
                                {isCreation ? 'Creando Nueva Entidad' : 'Editando Entidad'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(`/${username}/${projectName}/bible/folder/${folderSlug}`)}
                            className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/5 text-xs font-bold uppercase tracking-widest transition-all"
                        >
                            Cancelar
                        </button>
                        <div className="flex bg-white/5 rounded-xl p-1 gap-1 border border-white/10">
                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                className="h-9 px-4 rounded-lg bg-primary hover:bg-primary-light text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                            >
                                {saving ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : <span className="material-symbols-outlined text-sm">save</span>}
                                Guardar
                            </button>
                            <div className="w-px bg-white/10 my-1"></div>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                className="h-9 px-3 rounded-lg bg-transparent hover:bg-white/10 text-white transition-all flex items-center justify-center disabled:opacity-50"
                                title="Guardar y Seguir Editando"
                            >
                                <span className="material-symbols-outlined text-sm">edit_document</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs Removed - Moved to Right Panel */}

                {/* Content */}
                <div className="p-8 pb-32 max-w-5xl mx-auto w-full">

                    {activeEntityTab === 'identity' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Identity Card */}
                            <GlassPanel className="p-6 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-sm">badge</span> Identity
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Full Name</label>
                                        <input
                                            value={entity.nombre}
                                            onChange={e => handleCoreChange('nombre', e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-white focus:border-primary/50 outline-none transition-colors"
                                            placeholder="E.g. King Alaric"
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Entity Type</label>
                                        <div className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-slate-400 capitalize cursor-not-allowed">
                                            {entity.tipoEspecial || 'Standard'}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Tags (comma separated)</label>
                                        <input
                                            value={entity.tags}
                                            onChange={e => handleCoreChange('tags', e.target.value)}
                                            className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-sm text-slate-300 focus:border-primary/50 outline-none transition-colors"
                                            placeholder="Warrior, Leader, Human..."
                                        />
                                    </div>
                                    <div>
                                        <label className="text-[10px] uppercase font-bold text-slate-500 mb-1 block">Icon / Portrait</label>
                                        <div className="flex items-center gap-4">
                                            <Avatar url={entity.iconUrl} name={entity.nombre} size="lg" className="rounded-xl" />
                                            <label className="cursor-pointer px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg border border-white/10 text-xs font-bold text-slate-300 transition-colors">
                                                Upload Image
                                                <input type="file" accept="image/*" className="hidden" onChange={handleIconUpload} />
                                            </label>
                                            {entity.iconUrl && (
                                                <button onClick={() => handleCoreChange('iconUrl', '')} className="p-2 hover:text-red-400 transition-colors">
                                                    <span className="material-symbols-outlined text-sm">delete</span>
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </GlassPanel>

                            {/* Appearance */}
                            <GlassPanel className="p-6 space-y-6">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-sm">palette</span> Appearance
                                </h3>
                                <textarea
                                    value={entity.apariencia}
                                    onChange={e => handleCoreChange('apariencia', e.target.value)}
                                    className="w-full h-40 bg-black/30 border border-white/10 rounded-xl p-4 text-sm text-slate-300 leading-relaxed resize-none focus:border-primary/50 outline-none transition-colors custom-scrollbar"
                                    placeholder="Describe their physical appearance, clothing, distinct marks..."
                                />
                            </GlassPanel>


                            <GlassPanel className="p-6 lg:col-span-2">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2 mb-6">
                                    <span className="material-symbols-outlined text-sm">psychology</span> Personality / Stats
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {fields.filter(f => f.attribute.tipo === 'number').map(f => (
                                        <div key={f.id} className="space-y-2">
                                            <div className="flex justify-between">
                                                <span className="text-xs font-bold text-white">{f.attribute.nombre}</span>
                                                <span className="text-xs text-primary font-mono">{f.value || 0}</span>
                                            </div>
                                            <input
                                                type="range"
                                                min="0" max="100"
                                                value={f.value || 0}
                                                onChange={e => handleFieldChange(f.id, e.target.value)}
                                                className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary"
                                            />
                                        </div>
                                    ))}
                                    {fields.filter(f => f.attribute.tipo === 'number').length === 0 && (
                                        <div className="col-span-2 text-center text-xs text-slate-500 italic py-4">
                                            No numeric attributes defined. Add them from the Templates tab.
                                        </div>
                                    )}
                                </div>
                            </GlassPanel>
                        </div>
                    )}

                    {activeEntityTab === 'backstory' && (
                        <div className="animate-in fade-in duration-500">
                            <GlassPanel className="min-h-[60vh] flex flex-col p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-primary">Biography</h3>
                                    <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">Markdown Supported</span>
                                </div>
                                <textarea
                                    className="flex-1 w-full bg-transparent border-none outline-none text-slate-300 leading-relaxed resize-none focus:ring-0 placeholder:text-slate-600 custom-scrollbar text-base"
                                    placeholder="Write the origin story..."
                                    value={entity.descripcion || ''}
                                    onChange={e => handleCoreChange('descripcion', e.target.value)}
                                />
                            </GlassPanel>
                        </div>
                    )}

                    {activeEntityTab === 'attributes' && (
                        <div className="animate-in fade-in duration-500 space-y-6">
                            <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-white/5 pb-4">
                                Dynamic Attributes
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {fields.filter(f => f.attribute.tipo !== 'number').map((field) => (
                                    <AttributeField
                                        key={field.id}
                                        attribute={field.attribute}
                                        value={field.value}
                                        onChange={(val) => handleFieldChange(field.id, val)}
                                        onRemove={() => handleRemoveField(field.id)}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {activeEntityTab === 'relationships' && (
                        <div className="animate-in fade-in duration-500">
                            <GlassPanel className="min-h-[50vh]">
                                {isCreation ? (
                                    <div className="p-20 text-center text-slate-500">
                                        <span className="material-symbols-outlined text-4xl mb-4">save_as</span>
                                        <p className="text-sm font-bold">Please save the entity first to manage relationships.</p>
                                    </div>
                                ) : (
                                    <RelationshipManager entityId={entity.id} entityType={entity.tipo || 'entidadindividual'} />
                                )}
                            </GlassPanel>
                        </div>
                    )}

                    {activeEntityTab === 'notes' && (
                        <div className="animate-in fade-in duration-500">
                            <GlassPanel className="min-h-[60vh] flex flex-col p-8 bg-yellow-900/5 border-yellow-500/10">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-yellow-500 flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">sticky_note_2</span> GM Notes (Private)
                                    </h3>
                                    <span className="text-[10px] text-yellow-500/50 uppercase font-bold">Not visible to players</span>
                                </div>
                                <textarea
                                    className="flex-1 w-full bg-transparent border-none outline-none text-yellow-100/80 leading-relaxed resize-none focus:ring-0 placeholder:text-yellow-500/20 custom-scrollbar text-sm font-mono"
                                    placeholder="Secret notes, plot hooks, or truth..."
                                    value={entity.notas || ''}
                                    onChange={e => handleCoreChange('notas', e.target.value)}
                                />
                            </GlassPanel>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default EntityBuilder;
