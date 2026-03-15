import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { entityService } from '../../../database/entityService';
import { folderService } from '../../../database/folderService';
import { templateService } from '../../../database/templateService';
import { Entidad, Carpeta, Plantilla, Valor } from '../../../database/types';

import AttributeField from './AttributeField';
import GlassPanel from '../../../components/common/GlassPanel';
import Avatar from '../../../components/common/Avatar';
import EntityBuilderSidebar from '../components/EntityBuilderSidebar';

interface LayoutContext {
    setRightOpen: (open: boolean) => void;
    setRightPanelTab: (tab: string) => void;
    setAddAttributeHandler: (handler: (templateId: number) => void) => void;
    setAvailableTemplates: (templates: Plantilla[]) => void;
}

interface EntityBuilderProps {
    mode: 'creation' | 'edit';
}

const EntityBuilder: React.FC<EntityBuilderProps> = ({ mode }) => {
    const { username, projectName, entitySlug, folderSlug, type } = useParams();
    const navigate = useNavigate();
    const isCreation = mode === 'creation';

    const {
        setRightOpen,
        setRightPanelTab,
        setAddAttributeHandler
    } = useOutletContext<LayoutContext>();

    // Core Data State
    const [entity, setEntity] = useState<Partial<Entidad>>({
        nombre: '',
        tipo: type || 'PERSONAJE',
        descripcion: '',
        contenido_json: JSON.stringify({
            color: '#6366f1',
            tags: '',
            iconUrl: null,
            categoria: 'Individual',
            images: [],
            appearance: '',
            notes: ''
        }),
        project_id: 1, // Placeholder, should be resolved from context
        carpeta_id: folderSlug ? Number(folderSlug) : null
    });

    const [fields, setFields] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [removedFieldIds, setRemovedFieldIds] = useState<number[]>([]);
    const [availableTemplates, setAvailableTemplatesLocal] = useState<Plantilla[]>([]);
    const [activeEntityTab, setActiveEntityTab] = useState('identity');
    const [zoomImage, setZoomImage] = useState<string | null>(null);
    const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);

    // Parse contenido_json safely
    const getExtra = () => {
        try {
            return JSON.parse(entity.contenido_json || '{}');
        } catch (e) {
            return {};
        }
    };

    const updateExtra = (updates: any) => {
        const current = getExtra();
        setEntity(prev => ({
            ...prev,
            contenido_json: JSON.stringify({ ...current, ...updates })
        }));
    };

    // --- INITIALIZATION ---
    useEffect(() => {
        setRightOpen(true);
        setRightPanelTab('CONTEXT');

        const interval = setInterval(() => {
            const el = document.getElementById('global-right-panel-portal');
            if (el) {
                setPortalTarget(el);
                clearInterval(interval);
            }
        }, 100);

        return () => {
            clearInterval(interval);
            setRightPanelTab('NOTEBOOKS');
        };
    }, []);

    useEffect(() => {
        const init = async () => {
            setLoading(true);
            try {
                // Load templates for the project
                const templates = await templateService.getAll(); // Filter by project in future
                setAvailableTemplatesLocal(templates);

                if (isCreation) {
                    setEntity(prev => ({
                        ...prev,
                        nombre: `Nuevo ${type === 'map' ? 'Mapa' : type === 'timeline' ? 'Cronograma' : 'Ente'}`,
                    }));
                } else if (entitySlug) {
                    const data = await entityService.getWithValues(Number(entitySlug));
                    if (data) {
                        setEntity(data);
                        if (data.valores) {
                            setFields(data.valores.map(v => ({
                                id: v.id,
                                attribute: v.plantilla,
                                value: v.valor,
                                isTemp: false
                            })));
                        }
                    }
                }
            } catch (err) {
                console.error("Initialization error", err);
            } finally {
                setLoading(false);
            }
        };
        init();
    }, [entitySlug, isCreation, type]);

    // Define Handler for adding attributes from Sidebar (via layout context if needed, or local)
    useEffect(() => {
        setAddAttributeHandler((templateId: number) => {
            const tpl = availableTemplates.find(t => t.id === templateId);
            if (tpl) {
                setFields(prev => [...prev, {
                    id: `temp-${tpl.id}-${Date.now()}`,
                    attribute: tpl,
                    value: tpl.valor_defecto || '',
                    isTemp: true
                }]);
            }
        });
    }, [availableTemplates]);

    // --- HANDLERS ---
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        files.forEach(file => {
            const reader = new FileReader();
            reader.onload = (event) => {
                const base64 = event.target?.result as string;
                const currentImages = getExtra().images || [];
                updateExtra({ images: [...currentImages, base64] });
            };
            reader.readAsDataURL(file);
        });
        e.target.value = '';
    };

    const removeImage = (index: number) => {
        const currentImages = [...(getExtra().images || [])];
        currentImages.splice(index, 1);
        updateExtra({ images: currentImages });
    };

    const handleIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateExtra({ iconUrl: reader.result as string });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleFieldChange = (id: any, newValue: string) => {
        setFields(prev => prev.map(f => f.id === id ? { ...f, value: newValue } : f));
    };

    const handleRemoveField = (id: any) => {
        if (typeof id === 'number') {
            setRemovedFieldIds(prev => [...prev, id]);
        }
        setFields(prev => prev.filter(f => f.id !== id));
    };

    const handleSave = async (shouldRedirect = true) => {
        setSaving(true);
        try {
            let currentEntity: Entidad;
            if (isCreation) {
                currentEntity = await entityService.create(entity as Omit<Entidad, 'id' | 'fecha_creacion'>);
            } else {
                currentEntity = await entityService.update(entity.id!, entity);
            }

            // Save attributes (relational values)
            for (const field of fields) {
                const plantillaId = field.attribute?.id || (field.plantilla_id);
                if (plantillaId) {
                    await entityService.saveValue(currentEntity.id, plantillaId, field.value);
                }
            }

            // Remove deleted fields
            for (const id of removedFieldIds) {
                await entityService.deleteValue(id);
            }
            setRemovedFieldIds([]);

            setSaving(false);
            if (shouldRedirect) {
                navigate(`/${username}/${projectName}/bible/folder/${folderSlug || currentEntity.carpeta_id || 'root'}`);
            } else if (isCreation) {
                navigate(`/${username}/${projectName}/bible/folder/${folderSlug}/entity/${currentEntity.id}`, { replace: true });
            }
        } catch (err) {
            console.error("Save error", err);
            setSaving(false);
        }
    };

    if (loading) return <div className="p-20 text-center animate-pulse text-indigo-400 font-black uppercase tracking-widest">Iniciando Constructor Local...</div>;

    const extras = getExtra();

    return (
        <div className="flex h-full w-full bg-[#0a0a0c] overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 overflow-y-auto custom-scrollbar relative">
                
                {/* Header Actions */}
                <div className="border-b border-white/5 p-6 flex justify-between items-center bg-[#0a0a0c]/80 backdrop-blur sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <Avatar url={extras.iconUrl} name={entity.nombre} className="size-12 rounded-xl border border-white/10 shadow-lg" />
                        <div>
                            <h1 className="text-xl font-black text-white leading-tight tracking-tight">{entity.nombre || 'Sin Nombre'}</h1>
                            <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500">
                                {isCreation ? 'Nueva Entidad OPFS' : 'Sincronizado Localmente'}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => navigate(-1)}
                            className="px-4 py-2 rounded-xl text-slate-500 hover:text-white hover:bg-white/5 text-[10px] font-black uppercase tracking-widest transition-all"
                        >
                            Volver
                        </button>
                        <div className="flex bg-white/5 rounded-xl p-1 gap-1 border border-white/5 backdrop-blur-md">
                            <button
                                onClick={() => handleSave(true)}
                                disabled={saving}
                                className="h-10 px-6 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-white text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50 shadow-lg shadow-indigo-500/20"
                            >
                                {saving ? <span className="material-symbols-outlined animate-spin text-sm">refresh</span> : <span className="material-symbols-outlined text-sm">save_as</span>}
                                Guardar
                            </button>
                            <div className="w-px bg-white/10 my-1 mx-1"></div>
                            <button
                                onClick={() => handleSave(false)}
                                disabled={saving}
                                className="h-10 px-4 rounded-lg bg-transparent hover:bg-white/10 text-indigo-400 transition-all flex items-center justify-center disabled:opacity-50"
                                title="Guardar y Seguir"
                            >
                                <span className="material-symbols-outlined text-sm">history_edu</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar Portal */}
                {portalTarget && createPortal(
                    <EntityBuilderSidebar
                        templates={availableTemplates}
                        currentFields={fields}
                        onAddTemplate={(tpl) => {
                            setFields(prev => [...prev, {
                                id: `temp-${tpl.id}-${Date.now()}`,
                                attribute: tpl,
                                value: tpl.valor_defecto || '',
                                isTemp: true
                            }]);
                        }}
                    />,
                    portalTarget
                )}

                {/* Navigation Tabs */}
                <div className="flex border-b border-white/5 px-12 gap-8 bg-[#0a0a0c]/80 backdrop-blur sticky top-[89px] z-20">
                    {['identity', 'narrative', 'attributes'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveEntityTab(tab)}
                            className={`py-5 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${activeEntityTab === tab
                                ? 'border-indigo-500 text-indigo-400'
                                : 'border-transparent text-slate-600 hover:text-indigo-400'
                                }`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Main Content Area */}
                <div className="p-12 pb-32 max-w-6xl mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
                    
                    {activeEntityTab === 'identity' && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                            <div className="space-y-8">
                                <GlassPanel title="NÚCLEO DE IDENTIDAD" icon="fingerprint">
                                    <div className="space-y-6">
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-indigo-400 mb-3 block tracking-widest opacity-70">
                                                Nombre de la Entidad
                                            </label>
                                            <input
                                                type="text"
                                                className="w-full bg-[#0d0d12] border-2 border-white/5 rounded-2xl p-6 text-2xl font-black text-white focus:border-indigo-500 outline-none transition-all placeholder:text-slate-800 shadow-inner"
                                                placeholder="Ej: El Rey de Cenizas"
                                                value={entity.nombre}
                                                onChange={(e) => setEntity({ ...entity, nombre: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] font-bold uppercase text-slate-500 mb-3 block tracking-widest opacity-70">
                                                Categoría de Sistema
                                            </label>
                                            <select
                                                className="w-full bg-[#0d0d12] border-2 border-white/5 rounded-xl px-4 py-4 text-xs text-white font-black uppercase tracking-widest outline-none focus:border-indigo-500 transition-all cursor-pointer"
                                                value={extras.categoria}
                                                onChange={(e) => updateExtra({ categoria: e.target.value })}
                                            >
                                                <option value="Individual">👤 Personaje</option>
                                                <option value="Lugar">📍 Ubicación</option>
                                                <option value="Objeto">⚔️ Artefacto</option>
                                                <option value="Concepto">💡 Filosofía/Religión</option>
                                                <option value="Criatura">🐉 Especie/Bestia</option>
                                            </select>
                                        </div>
                                    </div>
                                </GlassPanel>

                                <GlassPanel title="APARIENCIA Y RASGOS" icon="auto_awesome">
                                    <textarea
                                        className="w-full bg-[#0d0d12] border-2 border-white/5 rounded-2xl p-6 text-sm text-slate-200 leading-relaxed min-h-[300px] outline-none focus:border-indigo-500 transition-all resize-none custom-scrollbar"
                                        placeholder="Describe visualmente esta entidad..."
                                        value={extras.appearance}
                                        onChange={(e) => updateExtra({ appearance: e.target.value })}
                                    />
                                </GlassPanel>
                            </div>

                            <div className="space-y-8">
                                <GlassPanel title="ARCHIVOS VISUALES" icon="photo_library">
                                    <div className="grid grid-cols-3 gap-4">
                                        {extras.images?.map((img: string, i: number) => (
                                            <div key={i} className="aspect-square rounded-2xl bg-black/40 border border-white/5 overflow-hidden relative group cursor-zoom-in" onClick={() => setZoomImage(img)}>
                                                <img src={img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="Gallery" />
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                                                    className="absolute top-2 right-2 size-7 bg-red-500/80 backdrop-blur-md text-white rounded-xl flex items-center justify-center translate-y-[-150%] group-hover:translate-y-0 transition-transform shadow-xl"
                                                >
                                                    <span className="material-symbols-outlined text-xs">close</span>
                                                </button>
                                            </div>
                                        ))}
                                        <label className="aspect-square rounded-2xl border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-3 hover:bg-white/5 hover:border-indigo-500/30 transition-all cursor-pointer group">
                                            <span className="material-symbols-outlined text-indigo-500/50 group-hover:text-indigo-400 group-hover:scale-110 transition-all">add_a_photo</span>
                                            <span className="text-[8px] font-black uppercase text-slate-500 group-hover:text-indigo-400 tracking-widest text-center px-4">Upload Fragment</span>
                                            <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                                        </label>
                                    </div>
                                </GlassPanel>

                                <GlassPanel title="NOTAS DE DESARROLLADOR" icon="edit_note">
                                    <textarea
                                        className="w-full bg-[#0d0d12] border-2 border-white/5 rounded-2xl p-6 text-sm text-slate-400 italic leading-relaxed min-h-[220px] outline-none focus:border-indigo-500 transition-all resize-none custom-scrollbar"
                                        placeholder="Secretos, ideas de desarrollo, conexiones ocultas..."
                                        value={extras.notes}
                                        onChange={(e) => updateExtra({ notes: e.target.value })}
                                    />
                                </GlassPanel>
                            </div>
                        </div>
                    )}

                    {activeEntityTab === 'narrative' && (
                        <div className="space-y-10">
                            <GlassPanel className="min-h-[50vh] p-8 flex flex-col border-indigo-500/10">
                                <div className="flex items-center justify-between mb-8">
                                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 flex items-center gap-3">
                                        <span className="material-symbols-outlined text-base">history_edu</span> Biografía Narrativa
                                    </h3>
                                    <div className="flex items-center gap-2 opacity-30">
                                        <span className="material-symbols-outlined text-xs">markdown</span>
                                        <span className="text-[9px] font-bold">TEXT READY</span>
                                    </div>
                                </div>
                                <textarea
                                    className="flex-1 w-full bg-[#0d0d12] border-2 border-white/5 rounded-2xl p-8 text-slate-100 text-lg leading-relaxed resize-none focus:border-indigo-500 outline-none placeholder:text-slate-800 custom-scrollbar shadow-inner"
                                    placeholder="Escribe la historia, leyendas y mitos corporativos..."
                                    value={entity.descripcion || ''}
                                    onChange={e => setEntity({ ...entity, descripcion: e.target.value })}
                                />
                            </GlassPanel>
                        </div>
                    )}

                    {activeEntityTab === 'attributes' && (
                        <div className="space-y-8 min-h-[60vh]">
                            <div className="flex items-center justify-between border-b border-white/5 pb-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-3">
                                    <span className="material-symbols-outlined text-base">layers</span> Atributos Modulares
                                </h3>
                                <p className="text-[9px] text-slate-600 font-bold uppercase tracking-wider">
                                    Arrastre elementos desde el panel lateral
                                </p>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {fields.length === 0 && (
                                    <div className="col-span-full py-32 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-slate-700 bg-white/[0.01]">
                                        <span className="material-symbols-outlined text-5xl mb-6 opacity-20">inventory_2</span>
                                        <p className="text-xs font-black uppercase tracking-widest opacity-40">Área de Atributos Vacía</p>
                                    </div>
                                )}
                                {fields.map((field) => (
                                    <div key={field.id} className="animate-in fade-in duration-500">
                                        <AttributeField
                                            attribute={field.attribute}
                                            value={field.value}
                                            onChange={(val) => handleFieldChange(field.id, val)}
                                            onRemove={() => handleRemoveField(field.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Overlays */}
                {zoomImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-2xl animate-in fade-in duration-300" onClick={() => setZoomImage(null)}>
                        <button className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors" onClick={() => setZoomImage(null)}>
                            <span className="material-symbols-outlined text-5xl">close</span>
                        </button>
                        <img src={zoomImage} className="max-w-[90vw] max-h-[85vh] object-contain rounded-3xl shadow-2xl border-4 border-white/5" alt="Zoom" />
                    </div>
                )}
            </div>
        </div>
    );
};

export default EntityBuilder;
