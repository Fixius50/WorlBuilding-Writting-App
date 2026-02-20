import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom'; // ADDED
import api from '../../../js/services/api';
import AttributeField from './AttributeField';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import RelationshipManager from '../../components/relationships/RelationshipManager';
import EntityBuilderSidebar from '../../components/entities/EntityBuilderSidebar'; // ADDED


const EntityBuilder = ({ mode }) => {
    const { username, projectName, entitySlug, folderSlug, type } = useParams();
    const navigate = useNavigate();
    const isCreation = mode === 'creation';

    // Layout Context - Simplified
    const {
        setRightOpen,
        setRightPanelTab, // CHANGED
        setAvailableTemplates, // Keep for legacy if needed, but likely unused by Layout for sidebar now
        setAddAttributeHandler
    } = useOutletContext();

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
        carpeta: null,
        categoria: 'Individual' // Default category
    });

    // Attribute State
    const [fields, setFields] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [removedFieldIds, setRemovedFieldIds] = useState([]);
    const [availableTemplatesLocal, setAvailableTemplatesLocal] = useState([]); // Local copy for Drag & Drop

    // UI State
    const [activeEntityTab, setActiveEntityTab] = useState('identity'); // LOCAL STATE FOR TABS
    const [showImageModal, setShowImageModal] = useState(false);
    const [zoomImage, setZoomImage] = useState(null); // For image preview modal

    // Portal Target
    const [portalTarget, setPortalTarget] = useState(null);

    // --- INITIALIZATION ---
    useEffect(() => {
        // Configure Global Right Panel
        setRightOpen(true);
        if (setRightPanelTab) setRightPanelTab('CONTEXT'); // Use Context Tab

        // Find Portal
        const interval = setInterval(() => {
            const el = document.getElementById('global-right-panel-portal');
            if (el) {
                setPortalTarget(el);
                clearInterval(interval);
            }
        }, 100);

        return () => {
            clearInterval(interval);
            // Restore default panel state when leaving builder
            if (setRightPanelTab) setRightPanelTab('NOTEBOOKS');
        };
    }, []);



    useEffect(() => {
        if (isCreation) loadCreationMode();
        else loadEntity();
    }, [entitySlug, folderSlug, isCreation]);

    const setupContextHandlers = (templates) => {
        // Push templates to Layout
        setAvailableTemplates(templates);
        setAvailableTemplatesLocal(templates);

        // Define Handler for adding attributes from Sidebar
        setAddAttributeHandler((templateId) => {
            const tpl = templates.find(t => t.id === templateId);
            if (tpl) {
                setFields(prev => {
                    // Removed duplicate check to allow 0-N attributes
                    return [...prev, {
                        id: `temp-${tpl.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
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
            // Only auto-populate REQUIRED templates
            const initialFields = folderTemplates
                .filter(tpl => tpl.esObligatorio)
                .map(tpl => ({
                    id: `temp-${tpl.id}-${Math.random().toString(36).substr(2, 9)}`,
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
                color: data.color || '#6366f1', // Ensure 'color' is set
                categoria: data.categoria || 'Individual',
                attributes: data.attributes || {}
            });

            if (data.carpeta?.id) {
                const folderTemplates = await api.get(`/world-bible/folders/${data.carpeta.id}/templates`);
                setupContextHandlers(folderTemplates);
            }

            const loadedFields = (data.valores || [])
                .filter(val => val.plantilla) // Filter out values without a template
                .map(val => ({
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
    const handleImageUpload = (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target.result;
                const currentImages = entity.attributes?.images || [];
                setEntity(prev => ({
                    ...prev,
                    attributes: {
                        ...prev.attributes,
                        images: [...currentImages, base64]
                    }
                }));
            };
            reader.readAsDataURL(file);
        });

        // Reset input to allow selecting the same files again
        e.target.value = null;
    };

    const removeImage = (index) => {
        const currentImages = [...(entity.attributes?.images || [])];
        currentImages.splice(index, 1);
        setEntity(prev => ({
            ...prev,
            attributes: {
                ...prev.attributes,
                images: currentImages
            }
        }));
    };

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
        if (!isCreation) { // Changed from !isNew to !isCreation
            try {
                const updatedEntity = { ...entity, [field]: value };
                // Assuming entity.id is available for existing entities
                await api.put(`/world-bible/entities/${entity.id}`, updatedEntity);
                console.log(`Auto-saved ${field}`);
            } catch (err) {
                console.error(`Failed to auto-save ${field}`, err);
                // Optionally revert state here on failure
            }
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
                color: entity.color, // Include color in the payload
                categoria: entity.categoria,
                attributes: entity.attributes // Include JSON attributes
            };

            let targetId = entity.id;

            if (isCreation) {
                if (!entity.carpeta && !folderSlug) {
                    alert("Error: Missing context (no folder). Redirecting.");
                    navigate(`/${username}/${projectName}/bible`);
                    return;
                }
                payload.carpetaId = entity.carpeta?.id;
                if (!payload.carpetaId && folderSlug) {
                    // Try to fetch folder ID from slug if not in entity state
                    try {
                        const f = await api.get(`/world-bible/folders/${folderSlug}`);
                        payload.carpetaId = f.id;
                    } catch (e) { console.error("Could not resolve folder", e); }
                }
                const newEntity = await api.post('/world-bible/entities', payload);
                targetId = newEntity.id;

                // Save Attributes
                const updatedFields = [...fields];
                for (let i = 0; i < updatedFields.length; i++) {
                    const field = updatedFields[i];
                    if (field.isTemp) {
                        try {
                            const val = await api.post(`/world-bible/entities/${newEntity.id}/attributes`, {
                                plantillaId: field.attribute.id
                            });
                            await api.patch(`/world-bible/entities/${newEntity.id}/values`, [{
                                valorId: val.id,
                                nuevoValor: field.value
                            }]);

                            updatedFields[i] = {
                                ...field,
                                id: val.id.toString(),
                                isTemp: false
                            };
                        } catch (e) { console.error("Attr save failed", e); }
                    }
                }
                setFields(updatedFields);
                setSaving(false);

                if (shouldRedirect) {
                    const targetFolder = newEntity.carpeta ? (newEntity.carpeta.slug || newEntity.carpeta.id) : folderSlug;
                    navigate(`/${username}/${projectName}/bible/folder/${targetFolder}`);
                } else {
                    // Update URL without reloading to switch to Edit Mode
                    // Ensure we use the correct folder slug from the server response if available
                    const targetFolder = newEntity.carpeta ? (newEntity.carpeta.slug || newEntity.carpeta.id) : folderSlug;
                    navigate(`/${username}/${projectName}/bible/folder/${targetFolder}/entity/${newEntity.slug || newEntity.id}`, { replace: true });
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
                iconUrl: payload.iconUrl,
                attributes: payload.attributes
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
            let hasNewFields = false;
            const updatedFields = [...fields];

            for (let i = 0; i < updatedFields.length; i++) {
                const field = updatedFields[i];
                if (field.isTemp) {
                    try {
                        const val = await api.post(`/world-bible/entities/${targetId}/attributes`, {
                            plantillaId: field.attribute.id
                        });

                        await api.patch(`/world-bible/entities/${targetId}/values`, [{
                            valorId: val.id,
                            nuevoValor: field.value
                        }]);

                        // Update field description with real ID
                        updatedFields[i] = {
                            ...field,
                            id: val.id.toString(),
                            isTemp: false
                        };
                        hasNewFields = true;
                    } catch (e) {
                        console.error("Error saving field:", field, e);
                    }
                }
            }

            if (hasNewFields) {
                setFields(updatedFields);
            }

            setSaving(false);
            if (shouldRedirect) {
                // Use folderSlug from params, or fallback to entity's folder from state, or default to 'root'
                const targetFolder = folderSlug || (entity.carpeta ? (entity.carpeta.slug || entity.carpeta.id) : 'root');
                // Fix: Ensure targetFolder is never undefined/null to prevent router crash
                const finalTarget = targetFolder || 'root';
                navigate(`/${username}/${projectName}/bible/folder/${finalTarget}`);
            }

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
                            className="px-4 py-2 rounded-xl text-slate-400 hover:text-primary hover:bg-primary/5 text-xs font-bold uppercase tracking-widest transition-all"
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

                {/* Portal for Sidebar */}
                {portalTarget && createPortal(
                    <EntityBuilderSidebar
                        templates={availableTemplatesLocal}
                        currentFields={fields}
                        onAddTemplate={(tpl) => {
                            setFields(prev => [...prev, {
                                id: `temp-${tpl.id}-${Date.now()}`,
                                attribute: tpl,
                                value: tpl.valorDefecto || '',
                                isTemp: true
                            }]);
                        }}
                    />,
                    portalTarget
                )}

                {/* Local Tabs */}
                <div className="flex border-b border-white/5 px-8 gap-6 bg-background-dark/80 backdrop-blur sticky top-[73px] z-20">
                    {['identity', 'narrative', 'attributes'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveEntityTab(tab)}
                            className={`py-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-colors ${activeEntityTab === tab
                                ? 'border-primary text-primary'
                                : 'border-transparent text-slate-500 hover:text-primary'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-8 pb-32 max-w-5xl mx-auto w-full">

                    {activeEntityTab === 'identity' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
                            {/* Panel 1: IDENTITY */}
                            <div className="space-y-6">
                                <GlassPanel title="IDENTITY" icon="fingerprint">
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs font-black uppercase text-primary mb-3 block tracking-wider flex items-center gap-2">
                                                <span className="material-symbols-outlined text-base">badge</span>
                                                Nombre Principal
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full bg-gradient-to-br from-indigo-950/90 to-purple-950/90 border-2 border-indigo-500/50 rounded-2xl p-5 text-2xl font-black text-white focus:border-indigo-400 focus:from-indigo-950 focus:to-purple-950 outline-none transition-all placeholder:text-slate-500 shadow-lg shadow-indigo-900/20"
                                                placeholder="Entiende el nombre..."
                                                value={entity.nombre}
                                                onChange={(e) => setEntity({ ...entity, nombre: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase text-purple-400 mb-3 block tracking-wider flex items-center gap-2">
                                                <span className="material-symbols-outlined text-base">category</span>
                                                Categoría / Tags
                                            </label>
                                            <select
                                                className="w-full bg-gradient-to-r from-purple-950/90 to-indigo-950/90 border-2 border-purple-500/50 rounded-xl px-4 py-3 text-sm text-white font-bold focus:border-purple-400 focus:from-purple-950 focus:to-indigo-950 outline-none transition-all cursor-pointer shadow-md"
                                                value={entity.categoria}
                                                onChange={(e) => setEntity({ ...entity, categoria: e.target.value })}
                                            >
                                                <option value="Individual" className="bg-slate-900">👤 Individual</option>
                                                <option value="Lugar" className="bg-slate-900">📍 Lugar</option>
                                                <option value="Organización" className="bg-slate-900">🏛️ Organización</option>
                                                <option value="Objeto" className="bg-slate-900">⚔️ Objeto</option>
                                                <option value="Concepto" className="bg-slate-900">💡 Concepto</option>
                                                <option value="Evento" className="bg-slate-900">⚡ Evento</option>
                                                <option value="Criatura" className="bg-slate-900">🐉 Criatura</option>
                                                <option value="Facción" className="bg-slate-900">⚔️ Facción</option>
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-xs font-black uppercase text-slate-400 mb-3 block tracking-wider flex items-center gap-2">
                                                <span className="material-symbols-outlined text-base">description</span>
                                                Resumen Breve
                                            </label>
                                            <textarea
                                                className="w-full bg-slate-950/90 border-2 border-slate-600/60 rounded-xl p-5 text-sm text-slate-100 leading-relaxed min-h-[120px] outline-none focus:border-slate-500 focus:bg-slate-950 transition-all resize-none custom-scrollbar shadow-inner"
                                                placeholder="Describe brevemente quién o qué es..."
                                                value={entity.descripcion}
                                                onChange={(e) => setEntity({ ...entity, descripcion: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </GlassPanel>

                                {/* Panel 3: DESCRIPTION (Appearance) */}
                                <GlassPanel title="APARIENCIA FÍSICA" icon="accessibility_new">
                                    <textarea
                                        className="w-full bg-slate-950/90 border-2 border-slate-600/60 rounded-xl p-6 text-sm text-slate-100 leading-relaxed min-h-[280px] outline-none focus:border-slate-500 focus:bg-slate-950 transition-all resize-none custom-scrollbar shadow-inner"
                                        placeholder="Detalles de su aspecto físico, vestimenta, rasgos distintivos..."
                                        value={entity.attributes?.appearance || ''}
                                        onChange={(e) => setEntity({
                                            ...entity,
                                            attributes: { ...entity.attributes, appearance: e.target.value }
                                        })}
                                    />
                                </GlassPanel>
                            </div>

                            <div className="space-y-6">
                                {/* Panel 2: GALLERY */}
                                <GlassPanel title="GALLERY" icon="photo_library">
                                    <div className="grid grid-cols-3 gap-3">
                                        {entity.attributes?.images?.map((img, i) => (
                                            <div key={i} className="aspect-square rounded-xl bg-black/40 border border-white/5 overflow-hidden relative group cursor-pointer" onClick={() => setZoomImage(img)}>
                                                <img src={img} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500" alt="Gallery" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                    className="absolute top-1 right-1 size-6 bg-red-500 text-white rounded-lg flex items-center justify-center translate-y-[-120%] group-hover:translate-y-0 transition-transform shadow-lg"
                                                >
                                                    <span className="material-symbols-outlined text-xs">close</span>
                                                </button>
                                            </div>
                                        ))}
                                        <label className="aspect-square rounded-xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center gap-2 hover:bg-white/5 hover:border-primary/50 transition-all cursor-pointer group">
                                            <span className="material-symbols-outlined text-text-muted group-hover:text-primary transition-colors">add_photo_alternate</span>
                                            <span className="text-[8px] font-black uppercase text-text-muted group-hover:text-primary">Upload Photos</span>
                                            <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                    </div>
                                </GlassPanel>

                                {/* Panel 4: NOTES */}
                                <GlassPanel title="NOTES" icon="sticky_note_2">
                                    <textarea
                                        className="w-full bg-amber-950/90 border-2 border-amber-700/60 rounded-xl p-5 text-sm text-amber-100 leading-relaxed min-h-[200px] outline-none focus:border-amber-600 focus:bg-amber-950 transition-all resize-none custom-scrollbar shadow-inner"
                                        placeholder="Apuntes rápidos, secretos o ideas sueltas..."
                                        value={entity.attributes?.notes || ''}
                                        onChange={(e) => setEntity({
                                            ...entity,
                                            attributes: { ...entity.attributes, notes: e.target.value }
                                        })}
                                    />
                                </GlassPanel>
                            </div>
                        </div>
                    )}

                    {activeEntityTab === 'narrative' && (
                        <div className="animate-in fade-in duration-500 space-y-8">
                            <GlassPanel className="min-h-[40vh] flex flex-col p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                                        <span className="material-symbols-outlined text-sm">history_edu</span> Biography
                                    </h3>
                                    <span className="text-[10px] text-slate-500 bg-white/5 px-2 py-1 rounded">Markdown Supported</span>
                                </div>
                                <textarea
                                    className="flex-1 w-full bg-slate-950/90 border-2 border-slate-600/60 rounded-xl p-6 text-slate-100 leading-relaxed resize-none focus:border-slate-500 focus:bg-slate-950 outline-none placeholder:text-slate-600 custom-scrollbar text-base min-h-[320px] shadow-inner"
                                    placeholder="Write the origin story..."
                                    value={entity.descripcion || ''}
                                    onChange={e => handleCoreChange('descripcion', e.target.value)}
                                />
                            </GlassPanel>

                            <GlassPanel className="min-h-[40vh]">
                                <h3 className="text-xs font-black uppercase tracking-widest text-primary p-6 pb-0 flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">hub</span> Relationships
                                </h3>
                                {isCreation ? (
                                    <div className="p-12 text-center text-slate-500">
                                        <span className="material-symbols-outlined text-4xl mb-4">save_as</span>
                                        <p className="text-sm font-bold">Please save the entity first to manage relationships.</p>
                                    </div>
                                ) : (
                                    <RelationshipManager entityId={entity.id} entityType={entity.tipo || 'entidadindividual'} />
                                )}
                            </GlassPanel>
                        </div>
                    )}
                    {activeEntityTab === 'attributes' && (
                        <div
                            className={`animate-in fade-in duration-500 space-y-6 min-h-[50vh] transition-colors rounded-2xl p-4 ${window.isDraggingOver ? 'bg-primary/10 border-2 border-dashed border-primary' : ''}`}
                            onDragOver={(e) => {
                                e.preventDefault();
                                e.dataTransfer.dropEffect = 'copy';
                                e.currentTarget.classList.add('bg-primary/10', 'border-primary', 'border-dashed', 'border-2');
                            }}
                            onDragLeave={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('bg-primary/10', 'border-primary', 'border-dashed', 'border-2');
                            }}
                            onDrop={(e) => {
                                e.preventDefault();
                                e.currentTarget.classList.remove('bg-primary/10', 'border-primary', 'border-dashed', 'border-2');
                                const type = e.dataTransfer.getData('application/reactflow/type');
                                if (type !== 'attribute') return;

                                let tpl = null;
                                try {
                                    const json = e.dataTransfer.getData('templateData');
                                    if (json) {
                                        tpl = JSON.parse(json);
                                    } else {
                                        // Fallback to local lookup
                                        const templateId = parseInt(e.dataTransfer.getData('templateId'));
                                        tpl = availableTemplatesLocal.find(t => t.id === templateId);
                                    }
                                } catch (err) {
                                    console.error("Drop error", err);
                                }

                                if (tpl) {
                                    setFields(prev => {
                                        return [...prev, {
                                            id: `temp-${tpl.id}-${Date.now()}`,
                                            attribute: tpl,
                                            value: tpl.valorDefecto || '',
                                            isTemp: true
                                        }];
                                    });
                                }
                            }}
                        >
                            <h3 className="text-xs font-black uppercase tracking-widest text-primary border-b border-white/5 pb-4 flex items-center justify-between">
                                <span>Atributos especiales</span>
                                <span className="text-[10px] text-slate-500 font-normal normal-case opacity-50 hidden md:block">
                                    Arraste atributos desde el panel derecho
                                </span>
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 border-2 border-dashed border-white/5 rounded-2xl hover:border-primary/20 transition-colors bg-white/[0.01]">
                                {fields.length === 0 && (
                                    <div className="col-span-full py-12 text-center text-slate-500 text-sm pointer-events-none">
                                        <span className="material-symbols-outlined text-4xl mb-2 opacity-50">drag_indicator</span>
                                        <p>Arrastra plantillas aquí para añadir atributos</p>
                                    </div>
                                )}
                                {fields.filter(f => f.attribute).map((field) => (
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


                </div>


                {/* Image Modal */}
                {showImageModal && entity.iconUrl && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setShowImageModal(false)}>
                        <div className="relative max-w-[90vw] max-h-[90vh] p-2">
                            <button
                                onClick={() => setShowImageModal(false)}
                                className="absolute -top-12 right-0 p-2 text-white hover:text-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>
                            <img
                                src={entity.iconUrl}
                                alt={entity.nombre}
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}

                {/* Gallery Image Zoom Modal */}
                {zoomImage && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setZoomImage(null)}>
                        <div className="relative max-w-[95vw] max-h-[95vh] p-4">
                            <button
                                onClick={() => setZoomImage(null)}
                                className="absolute -top-14 right-0 p-3 text-white/80 hover:text-white hover:bg-white/10 rounded-xl transition-all"
                            >
                                <span className="material-symbols-outlined text-3xl">close</span>
                            </button>
                            <img
                                src={zoomImage}
                                alt="Gallery Preview"
                                className="max-w-full max-h-[90vh] object-contain rounded-2xl shadow-2xl border-2 border-white/20"
                                onClick={(e) => e.stopPropagation()}
                            />
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
};


export default EntityBuilder;

// Helper for hierarchy types
const getHierarchyType = (type) => {
    return { id: type, label: type };
};
