import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import api from '../../../js/services/api';
import AttributeField from './AttributeField';
import SpecializedMap from './Specialized/SpecializedMap';
import SpecializedTimeline from './Specialized/SpecializedTimeline';

const EntityBuilder = ({ mode }) => {
    const { username, projectName, entitySlug, folderSlug, type } = useParams();
    const navigate = useNavigate();
    const isCreation = mode === 'creation';

    // Layout Context
    const {
        setRightOpen,
        setRightPanelMode,
        setAvailableTemplates,
        setAddAttributeHandler,
        setCreateTemplateHandler
    } = useOutletContext();

    // State
    const [entity, setEntity] = useState(null);
    const [fields, setFields] = useState([]); // Array of { id, attribute (template), value, isCore, isTemp }
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [viewMode, setViewMode] = useState('attributes');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newTemplate, setNewTemplate] = useState({ nombre: '', tipo: 'text', global: false });
    const [linkableEntities, setLinkableEntities] = useState([]);
    const [removedFieldIds, setRemovedFieldIds] = useState([]); // Track IDs to delete on save

    // --- INITIALIZATION ---

    useEffect(() => {
        setRightPanelMode('TOOLBOX');
        setRightOpen(true);
        loadLinkableEntities();

        // Register Handlers
        setAddAttributeHandler(() => (tplId) => handleAddAttribute(tplId));
        setCreateTemplateHandler(() => () => setShowCreateModal(true));

        if (isCreation) {
            loadCreationMode();
        } else {
            loadEntity();
        }

        return () => {
            setRightPanelMode('NOTES');
            setAddAttributeHandler(null);
            setCreateTemplateHandler(null);
        };
    }, [entitySlug, folderSlug, isCreation]);

    const loadLinkableEntities = async () => {
        try {
            const all = await api.get('/world-bible/entities');
            setLinkableEntities(all);
        } catch (e) { console.error("Could not load linkable entities", e); }
    };

    const loadCreationMode = async () => {
        setLoading(true);
        try {
            const folderInfo = await api.get(`/world-bible/folders/${folderSlug}`);
            const templates = await api.get(`/world-bible/folders/${folderSlug}/templates`);
            setAvailableTemplates(templates);

            const newEntity = {
                nombre: `Nuevo ${type === 'map' ? 'Mapa' : type === 'timeline' ? 'Cronograma' : 'Ente'}`,
                carpeta: folderInfo,
                tipoEspecial: type,
                descripcion: '',
                tags: '',
                isNew: true
            };
            setEntity(newEntity);

            // Inherited Fields
            const initialFields = templates.map((tpl, idx) => ({
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
            setEntity(data);

            if (data.carpeta?.id) {
                const templates = await api.get(`/world-bible/folders/${data.carpeta.id}/templates`);
                setAvailableTemplates(templates);
            }

            // Existing Values
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

    // --- VIEW MODE ---
    useEffect(() => {
        const t = entity?.tipoEspecial || type;
        if (t === 'map' || t === 'timeline') setViewMode('special');
        else setViewMode('attributes');
    }, [entity?.tipoEspecial, type]);


    // --- ACTIONS ---

    const handleAddAttribute = async (templateId) => {
        if (isCreation) {
            // Check availability in context templates
            // We need to fetch it from AvailableTemplates? No, we have the ID.
            // We need the template object actually. 
            // Ideally availableTemplates is present.
            // But setAddAttributeHandler only passes ID.
            // Let's refetch or find in availableTemplates locally if possible.
            // But layout context `availableTemplates` might not be exposed back to us updated?
            // Actually we setAvailableTemplates(templates) above. So we know them.

            // Wait, `availableTemplates` is in Outlet context, but `setAvailableTemplates` changes it UPSTREAM.
            // Does `availableTemplates` come back down? 
            // ArchitectLayout passes `availableTemplates` down. Yes.
            // But we need to use it from context here too?
            // Actually, `useOutletContext` returns `availableTemplates` too.
            // Let's grab it.
        } else {
            try {
                await api.post(`/world-bible/entities/${entity.id}/attributes`, { plantillaId: templateId });
                loadEntity();
            } catch (err) { console.error("Failed to add attribute", err); }
        }
    };

    // Need to get availableTemplates from context to find the object
    const { availableTemplates } = useOutletContext();

    const handleManualAdd = (templateId) => {
        const tpl = availableTemplates?.find(t => t.id === parseInt(templateId));
        if (!tpl) return;

        // Prevent duplicates? Maybe allowed.
        setFields(prev => [...prev, {
            id: `temp-${tpl.id}-${Date.now()}`,
            attribute: tpl,
            value: tpl.valorDefecto || '',
            isTemp: true
        }]);
    };

    const handleFieldChange = (id, newValue) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, value: newValue } : f));
    };

    const handleRemoveField = (id) => {
        // If it's a real field (not temp), add to removed list
        if (!id.toString().startsWith('temp-')) {
            setRemovedFieldIds(prev => [...prev, id]);
        }
        // Remove from UI
        setFields(prev => prev.filter(f => f.id !== id));
    };

    const handleCoreChange = (key, val) => {
        setEntity(prev => ({ ...prev, [key]: val }));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = {
                nombre: entity.nombre,
                descripcion: entity.descripcion,
                tags: entity.tags,
                tipoEspecial: entity.tipoEspecial || 'entidadindividual'
            };

            if (isCreation) {
                payload.carpetaId = entity.carpeta.id;
                const newEntity = await api.post('/world-bible/entities', payload);

                // Save Attributes
                for (const field of fields) {
                    if (field.isTemp) {
                        const val = await api.post(`/world-bible/entities/${newEntity.id}/attributes`, {
                            plantillaId: field.attribute.id
                        });
                        // Update value
                        await api.patch(`/world-bible/entities/${newEntity.id}/values`, [{
                            valorId: val.id,
                            nuevoValor: field.value
                        }]);
                    }
                }
                setSaving(false);
                navigate(`/${username}/${projectName}/bible/folder/${folderSlug}/entity/${newEntity.slug || newEntity.id}`, { replace: true });
            } else {
                await api.put(`/world-bible/entities/${entity.id}`, { nombre: payload.nombre });
                await api.patch(`/world-bible/entities/${entity.id}/details`, {
                    descripcion: payload.descripcion,
                    tags: payload.tags
                });

                // Process Deletions
                if (removedFieldIds.length > 0) {
                    await Promise.all(removedFieldIds.map(id => api.delete(`/world-bible/values/${id}`)));
                    setRemovedFieldIds([]); // Clear after success
                }

                const updates = fields
                    .filter(f => !f.isTemp)
                    .map(f => ({ valorId: parseInt(f.id), nuevoValor: f.value }));

                if (updates.length > 0) {
                    await api.patch(`/world-bible/entities/${entity.id}/values`, updates);
                }
                setSaving(false);
            }
        } catch (err) {
            console.error("Save error", err);
            setSaving(false);
        }
    };

    const handleCreateTemplateSubmit = async (e) => {
        e.preventDefault();
        try {
            await api.post(`/world-bible/folders/${entity.carpeta.id}/templates`, newTemplate);
            setShowCreateModal(false);
            setNewTemplate({ nombre: '', tipo: 'text', global: false });
            // Refresh
            if (entity.carpeta?.id) {
                const templates = await api.get(`/world-bible/folders/${entity.carpeta.id}/templates`);
                setAvailableTemplates(templates);
            }
        } catch (err) { console.error(err); }
    };

    // Draggable Drop
    const handleDrop = async (e) => {
        e.preventDefault();
        const type = e.dataTransfer.getData('application/reactflow/type');
        const tplId = e.dataTransfer.getData('templateId');

        if (type === 'attribute' && tplId) {
            if (isCreation) {
                handleManualAdd(tplId);
            } else {
                await handleAddAttribute(tplId);
            }
        }
    };

    if (loading) return <div className="p-20 text-center text-text-muted font-bold tracking-widest animate-pulse">Loading...</div>;

    return (
        <div
            className="flex-1 flex flex-col h-full w-full relative bg-background-dark overflow-y-auto custom-scrollbar"
            onDragOver={e => e.preventDefault()}
            onDrop={handleDrop}
        >
            {/* Header */}
            <header className="flex-none p-6 pb-2 flex items-end justify-between gap-6 border-b border-white/5 bg-background-dark/50 backdrop-blur sticky top-0 z-20">
                <div className="space-y-1 w-full max-w-4xl mx-auto">
                    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary/50">
                        <span className="material-symbols-outlined text-xs">folder</span>
                        {entity?.carpeta?.nombre || 'Root'}
                    </div>
                    <input
                        className="text-4xl font-black text-white bg-transparent border-none outline-none placeholder:text-white/20 w-full"
                        value={entity?.nombre || ''}
                        onChange={e => handleCoreChange('nombre', e.target.value)}
                        placeholder="Entity Name"
                    />
                </div>
                <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`h-12 px-6 rounded-xl bg-primary flex items-center gap-2 text-white font-bold shadow-lg shadow-primary/20 hover:scale-105 active:scale-95 transition-all flex-none ${saving && 'opacity-50 animate-pulse'}`}
                >
                    <span className="material-symbols-outlined">{saving ? 'sync' : 'save'}</span>
                    <span>Guardar</span>
                </button>
            </header>

            {/* Special Views */}
            {viewMode === 'special' && (
                <div className="flex-1 p-6">
                    {entity?.tipoEspecial === 'map' && <SpecializedMap entity={entity} />}
                    {entity?.tipoEspecial === 'timeline' && <SpecializedTimeline entity={entity} />}
                </div>
            )}

            {/* Form Content */}
            <div className={`p-6 w-full max-w-4xl mx-auto space-y-8 ${viewMode !== 'attributes' ? 'hidden' : ''}`}>

                {/* Core Fields */}
                <div className="space-y-6">
                    <div className="group">
                        <label className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 block group-focus-within:text-primary transition-colors">Descripción General</label>
                        <textarea
                            className="w-full min-h-[120px] bg-surface-light/50 border border-glass-border rounded-xl p-4 text-sm text-white focus:border-primary/50 focus:bg-surface-light outline-none transition-all resize-none"
                            placeholder="Write a description..."
                            value={entity?.descripcion || ''}
                            onChange={e => handleCoreChange('descripcion', e.target.value)}
                        />
                    </div>

                    <div className="group">
                        <label className="text-xs font-black uppercase tracking-widest text-text-muted mb-2 block group-focus-within:text-primary transition-colors flex items-center gap-2">
                            <span>Etiquetas</span>
                            <span className="text-[10px] opacity-40 font-normal normal-case">(Separadas por comas)</span>
                        </label>
                        <div className="flex items-center gap-3 bg-surface-light/50 border border-glass-border rounded-xl p-3 focus-within:border-primary/50 focus-within:bg-surface-light transition-all">
                            <span className="material-symbols-outlined text-text-muted">label</span>
                            <input
                                className="w-full bg-transparent border-none outline-none text-sm text-white placeholder:text-white/20"
                                placeholder="Fantasy, Hero, Important..."
                                value={entity?.tags || ''}
                                onChange={e => handleCoreChange('tags', e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent w-full my-8"></div>

                {/* Attributes Grid */}
                <div className="space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">tune</span>
                        Atributos
                    </h3>

                    {fields.length === 0 ? (
                        <div className="p-12 border-2 border-dashed border-white/5 rounded-2xl flex flex-col items-center justify-center text-text-muted/50 gap-4">
                            <span className="material-symbols-outlined text-4xl">drag_indicator</span>
                            <div className="text-center">
                                <p className="font-bold">Sin Atributos</p>
                                <p className="text-xs">Arrastra plantillas desde el panel derecho</p>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {fields.map((field) => (
                                <div key={field.id} className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <AttributeField
                                        attribute={field.attribute}
                                        value={field.value}
                                        onChange={(val) => handleFieldChange(field.id, val)}
                                        onRemove={() => handleRemoveField(field.id)}
                                        linkableEntities={linkableEntities}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Padding for bottom */}
                <div className="h-24"></div>
            </div>

            {/* Template Creation Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
                    <div className="bg-surface-dark border border-glass-border rounded-2xl p-6 w-full max-w-md shadow-2xl animate-scale-in">
                        <h3 className="text-xl font-black text-white mb-4">Nueva Plantilla</h3>
                        <form onSubmit={handleCreateTemplateSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs uppercase font-bold text-text-muted block mb-1">Nombre</label>
                                <input
                                    autoFocus
                                    className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                                    value={newTemplate.nombre}
                                    onChange={e => setNewTemplate({ ...newTemplate, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs uppercase font-bold text-text-muted block mb-1">Tipo</label>
                                    <select
                                        className="w-full bg-black/30 border border-white/10 rounded-xl p-3 text-white focus:border-primary outline-none"
                                        value={newTemplate.tipo}
                                        onChange={e => setNewTemplate({ ...newTemplate, tipo: e.target.value })}
                                    >
                                        <option value="text">Texto Largo</option>
                                        <option value="short_text">Texto Corto</option>
                                        <option value="number">Número</option>
                                        <option value="boolean">Si/No</option>
                                        <option value="date">Fecha</option>
                                        <option value="entity_link">Vínculo Entidad</option>
                                        <option value="image">Imagen URL</option>
                                    </select>
                                </div>
                                <div className="flex items-center">
                                    <label className="flex items-center gap-2 cursor-pointer p-3 bg-white/5 rounded-xl w-full hover:bg-white/10 transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={newTemplate.global}
                                            onChange={e => setNewTemplate({ ...newTemplate, global: e.target.checked })}
                                            className="accent-primary size-4"
                                        />
                                        <span className="text-sm font-bold text-white">Es Global?</span>
                                    </label>
                                </div>
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 text-text-muted hover:text-white font-bold transition-colors">Cancelar</button>
                                <button type="submit" className="px-6 py-2 bg-primary text-white rounded-xl font-bold shadow-lg shadow-primary/20 hover:scale-105 transition-transform">Crear</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EntityBuilder;
