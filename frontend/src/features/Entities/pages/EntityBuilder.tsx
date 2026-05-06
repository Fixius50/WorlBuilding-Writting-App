import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { createPortal } from 'react-dom';
import { useLanguage } from '@context/LanguageContext';
import { folderService } from '@repositories/folderService';
import { entityService } from '@repositories/entityService';
import { templateService } from '@repositories/templateService';
import { Entidad, Plantilla } from '@domain/models/database';
import MonolithicPanel from '@atoms/MonolithicPanel';
import Button from '@atoms/Button';
import Switch from '@atoms/Switch';
import { useRightPanelStore } from '@store/useRightPanelStore';
import AttributeField from './AttributeField';
import Avatar from '@atoms/Avatar';
import EntityBuilderSidebar from '../components/EntityBuilderSidebar';
import Breadcrumbs from '@molecules/Breadcrumbs';
import { Carpeta, Valor } from '@domain/models/database';

interface LayoutContext {
  projectId: number;
}

interface EntityField {
  id: number | string;
  attribute: Plantilla;
  value: string;
  isTemp: boolean;
}

interface EntityExtras {
  color?: string;
  tags?: string;
  iconUrl?: string | null;
  categoria?: string;
  appearance?: string;
  notes?: string;
  images?: string[];
}

interface EntityBuilderProps {
  mode: 'creation' | 'edit';
}

const EntityBuilder: React.FC<EntityBuilderProps> = ({ mode }) => {
  const { username, projectName, entityId, folderId, type } = useParams();
  const navigate = useNavigate();
  const [isCreation, setIsCreation] = useState(mode === 'creation');

  const { projectId } = useOutletContext<LayoutContext>();
  const { openPanel, setCustomContent } = useRightPanelStore();

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
      appearance: '',
      notes: '',
      images: []
    }),
    project_id: projectId || 1, 
    carpeta_id: folderId ? Number(folderId) : null
  });

  const [path, setPath] = useState<Carpeta[]>([]);

  const [fields, setFields] = useState<EntityField[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [removedFieldIds, setRemovedFieldIds] = useState<number[]>([]);
  const [availableTemplates, setAvailableTemplatesLocal] = useState<Plantilla[]>([]);
  const [activeEntityTab, setActiveEntityTab] = useState('identity');
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [portalTarget, setPortalTarget] = useState<HTMLElement | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // Parse contenido_json safely
  const getExtra = useCallback((): EntityExtras => {
    try {
      return JSON.parse(entity.contenido_json || '{}') as EntityExtras;
    } catch (e) {
      return {};
    }
  }, [entity.contenido_json]);

  const updateExtra = useCallback((updates: Partial<EntityExtras>) => {
    const current = getExtra();
    setEntity(prev => ({
      ...prev,
      contenido_json: JSON.stringify({ ...current, ...updates })
    }));
  }, [getExtra]);

  // --- INITIALIZATION ---
  useEffect(() => {
    openPanel('custom', 0, 'Constructor de Entidad');


    return () => {
    };
  }, []);

  useEffect(() => {
    const init = async () => {
      setLoading(true);
      try {
        const templates = await templateService.getAll(projectId || 1); 
        setAvailableTemplatesLocal(templates);
        /* setAddAttributeHandler removed - handled via setCustomContent */

        if (!isCreation && entityId) {
          const data = await entityService.getById(Number(entityId));
          if (data) {
            setEntity(data);
            const vals = await entityService.getValues(data.id);
            setFields(vals.map(v => ({
              id: v.id,
              attribute: v.plantilla || { id: v.plantilla_id, nombre: 'Unknown', tipo: 'text' } as Plantilla,
              value: v.valor || '',
              isTemp: false
            })));
          }
        }
      } catch (err) {
        // [LOG REMOVED]
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [entityId, isCreation, projectId]);

  // Sincronizar projectId si llega después de la montura inicial
  useEffect(() => {
    if (projectId && entity.project_id !== projectId) {
      setEntity(prev => ({ ...prev, project_id: projectId }));
    }
  }, [projectId]);


  useEffect(() => {
    const loadPath = async () => {
      if (entity.carpeta_id) {
        const p = await folderService.getPath(entity.carpeta_id);
        setPath(p);
      }
    };
    loadPath();
  }, [entity.carpeta_id]);

  const refreshTemplates = async () => {
    try {
      const templates = await templateService.getAll(projectId || 1);
      setAvailableTemplatesLocal(templates);
    } catch (err) {
      // [LOG REMOVED]
    }
  };
  // --- SIDEBAR SYNC ---
  useEffect(() => {
    setCustomContent(
      <EntityBuilderSidebar
        key={`sidebar-${availableTemplates.length}-${activeEntityTab}`}
        templates={availableTemplates}
        onAddTemplate={(tpl) => {
          setFields(prev => [...prev, {
            id: `temp-${tpl.id}-${Date.now()}`,
            attribute: tpl,
            value: tpl.valor_defecto || '',
            isTemp: true
          }]);
        }}
        onRefresh={refreshTemplates}
        projectId={projectId}
      />,
      'Gestión de Atributos'
    );
  }, [availableTemplates, activeEntityTab, projectId]);

  // --- HANDLERS ---
  const handleSave = useCallback(async (redirect = true) => {
    setSaving(true);
    try {
      let savedEntity: Entidad;
      if (isCreation) {
        savedEntity = await entityService.create(entity as Omit<Entidad, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'borrado'>);
      } else {
        await entityService.update(entity.id!, entity as Partial<Entidad>);
        const refreshed = await entityService.getById(entity.id!);
        savedEntity = refreshed ?? (entity as unknown as Entidad);
      }

      window.dispatchEvent(new CustomEvent('folder-update', { 
        detail: { folderId: savedEntity.carpeta_id } 
      }));

      const updatedFields = [...fields];
      for (let i = 0; i < updatedFields.length; i++) {
        const f = updatedFields[i];
        if (f.isTemp) {
          await entityService.addValue(savedEntity.id, f.attribute.id, f.value);
        } else {
          await entityService.updateValue(f.id as number, f.value);
        }
      }

      for (const rid of removedFieldIds) {
        if (typeof rid === 'number') {
          await entityService.deleteValue(rid);
        }
      }

      if (redirect) {
        navigate(-1);
      } else {
        setEntity(savedEntity);
        setIsCreation(false);
        setRemovedFieldIds([]);
        const freshValues = await entityService.getValues(savedEntity.id);
        setFields(freshValues.map(v => ({
          id: v.id,
          attribute: v.plantilla || { id: v.plantilla_id, nombre: 'Unknown', tipo: 'text' } as Plantilla,
          value: v.valor || '',
          isTemp: false
        })));
      }
    } catch (err) {
      // [LOG REMOVED]
    } finally {
      setSaving(false);
    }
  }, [entity, fields, isCreation, navigate, removedFieldIds, projectId]);

  const handleFieldChange = (fieldId: number | string, value: string) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, value } : f));
  };

  const handleRemoveField = (fieldId: number | string) => {
    const field = fields.find(f => f.id === fieldId);
    if (field && !field.isTemp) {
      setRemovedFieldIds(prev => [...prev, field.id as number]);
    }
    setFields(prev => prev.filter(f => f.id !== fieldId));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const current = getExtra();
        const imgs = [...(current.images || []), reader.result as string];
        updateExtra({ images: imgs });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const current = getExtra();
    const imgs = (current.images || []).filter((_: string, i: number) => i !== index);
    updateExtra({ images: imgs });
  };

  const handleDragOverArea = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDraggingOver(true);
  };

  const handleDragLeaveArea = () => {
    setIsDraggingOver(false);
  };

  const handleDropArea = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    try {
      const data = e.dataTransfer.getData('application/worldbuilder/attribute') || 
                   e.dataTransfer.getData('text/plain');
      if (data) {
        const tpl = JSON.parse(data) as Plantilla;
        setFields(prev => [...prev, {
          id: `temp-${tpl.id}-${Date.now()}`,
          attribute: tpl,
          value: tpl.valor_defecto || '',
          isTemp: true
        }]);
      }
    } catch (err) {
      // [LOG REMOVED]
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-background animate-pulse">
      <div className="text-[0.75rem] font-black uppercase tracking-[0.2em] text-primary">
        Iniciando Constructor Local...
      </div>
    </div>
  );

  const extras = getExtra();

  const isInBible = location.pathname.includes('/bible');

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
                {/* CABECERA UNIFICADA MONOLÍTICA */}
        <div className="sticky top-0 z-40 bg-background border-b border-foreground/10 animate-in slide-in-from-top-4 duration-700">
          
          {/* 1. INFORMACIÓN DE ENTIDAD Y ACCIONES (PARTE SUPERIOR) */}
          <div className="px-8 lg:px-12 py-4 flex items-center justify-between w-full max-w-7xl mx-auto gap-8">
            <div className="flex items-center gap-6 min-w-0">
              <Avatar 
                url={extras.iconUrl}
                name={entity.nombre || 'Nuevo Ente'} 
                size="sm" 
                className="ring-1 ring-primary/20 shadow-xl shadow-primary/5 shrink-0" 
              />
              <div className="space-y-0.5 min-w-0">
                <div className="text-[8px] font-black uppercase tracking-[0.4em] text-primary/40 italic truncate">Constructor Central</div>
                <h2 className="text-xl font-black text-foreground tracking-tighter uppercase leading-none truncate">
                  {entity.nombre || 'Nuevo Ente'}
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button 
                onClick={() => { if(confirm('¿Seguro que quieres borrar esta entidad?')) { /* Lógica de borrado */ } }} 
                className="size-10 flex items-center justify-center text-foreground/20 hover:text-red-400 hover:bg-red-400/5 transition-all border border-foreground/5"
                title="Eliminar Entidad"
              >
                <span className="material-symbols-outlined text-base">delete</span>
              </button>

              <div className="w-px h-6 bg-foreground/10 mx-1" />

              <button 
                onClick={() => navigate(-1)} 
                className="flex items-center gap-2 px-4 py-2.5 text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-foreground transition-all group border border-foreground/5 bg-foreground/[0.02]"
              >
                <span className="material-symbols-outlined text-sm group-hover:-translate-x-1 transition-transform">arrow_back</span>
                Volver
              </button>

              <button 
                onClick={() => handleSave(true)} 
                disabled={saving}
                className={`flex items-center gap-3 px-8 py-2.5 rounded-none font-black text-[9px] uppercase tracking-[0.2em] transition-all shadow-lg ${saving ? 'bg-primary/20 text-primary cursor-wait' : 'bg-primary hover:bg-primary/90 text-primary-foreground hover:scale-[1.02] active:scale-[0.98] shadow-primary/20'}`}
              >
                <span className="material-symbols-outlined text-sm">{saving ? 'sync' : 'save'}</span>
                {saving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>
          </div>

          {/* 2. NAVEGACIÓN DE PESTAÑAS (PARTE INFERIOR) */}
          <div className="border-t border-foreground/5 bg-foreground/[0.02]">
            <div className="flex items-center justify-center gap-12 max-w-7xl mx-auto">
              {['identity', 'narrative', 'attributes'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveEntityTab(tab)}
                  className={`py-4 text-[9px] font-black uppercase tracking-[0.3em] border-b-2 transition-all duration-500 ${activeEntityTab === tab
                    ? 'border-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]'
                    : 'border-transparent text-foreground/30 hover:text-foreground'
                  }`}
                >
                  {tab === 'identity' ? 'Identidad' : tab === 'narrative' ? 'Narrativa' : 'Atributos'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content Area */}
        <div className="p-8 lg:p-16 pb-32 max-w-[90rem] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-1000">
          
          {activeEntityTab === 'identity' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              <div className="space-y-12">
                {/* NÚCLEO DE IDENTIDAD */}
                <div className="monolithic-panel border border-foreground/10 bg-foreground/[0.02] p-8 space-y-8">
                  <header className="flex items-center gap-3 text-[hsl(var(--primary))] border-b border-[hsl(var(--foreground)/0.05)] pb-4">
                    <span className="material-symbols-outlined text-lg">fingerprint</span>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--foreground))]">Núcleo de Identidad</h3>
                  </header>
                  
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase text-[hsl(var(--foreground)/0.4)] tracking-[0.2em] block px-1">
                        Nombre de la Entidad
                      </label>
                      <input
                        type="text"
                        className="w-full bg-[hsl(var(--foreground)/0.02)] border border-[hsl(var(--foreground)/0.1)] rounded-none p-6 text-4xl font-black text-[hsl(var(--foreground))] focus:border-[hsl(var(--primary)/0.5)] outline-none transition-all placeholder:text-[hsl(var(--foreground)/0.05)] shadow-inner"
                        placeholder="Nombre..."
                        value={entity.nombre}
                        onChange={(e) => setEntity({ ...entity, nombre: e.target.value })}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-white/40 tracking-[0.2em] block px-1">
                          Categoría de Sistema
                        </label>
                        <div className="relative group">
                          <select
                            className="w-full bg-[hsl(var(--foreground)/0.02)] border border-[hsl(var(--foreground)/0.1)] rounded-none p-4 text-[11px] text-[hsl(var(--foreground))] font-black uppercase tracking-[0.2em] outline-none focus:border-[hsl(var(--primary)/0.5)] transition-all cursor-pointer appearance-none"
                            value={entity.tipo}
                            onChange={(e) => setEntity({ ...entity, tipo: e.target.value })}
                          >
                            <option value="PERSONAJE">👤 Personaje</option>
                            <option value="LUGAR">📍 Ubicación</option>
                            <option value="OBJETO">⚔️ Artefacto</option>
                            <option value="CONCEPTO">💡 Filosofía</option>
                            <option value="CRIATURA">🐉 Especie</option>
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 material-symbols-outlined text-foreground/20 group-hover:text-primary transition-colors pointer-events-none">expand_more</span>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <label className="text-[9px] font-black uppercase text-white/40 tracking-[0.2em] block px-1">
                          Color de Identificación
                        </label>
                        <div className="flex items-center gap-4 bg-[hsl(var(--foreground)/0.02)] border border-[hsl(var(--foreground)/0.1)] p-3">
                          <input
                            type="color"
                            className="size-10 bg-transparent border-none cursor-pointer"
                            value={extras.color || '#6366f1'}
                            onChange={(e) => updateExtra({ color: e.target.value })}
                          />
                          <span className="text-[10px] font-mono text-foreground/40 uppercase">{extras.color || '#6366F1'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <label className="text-[9px] font-black uppercase text-white/40 tracking-[0.2em] block px-1">
                        Etiquetas (Tags)
                      </label>
                      <input
                        type="text"
                        className="w-full bg-foreground/[0.03] border border-foreground/20 rounded-none p-4 text-[11px] text-foreground outline-none focus:border-primary/50 transition-all placeholder:text-foreground/20 shadow-inner"
                        placeholder="Importante, Secreto, Fase 1..."
                        value={extras.tags || ''}
                        onChange={(e) => updateExtra({ tags: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* APARIENCIA Y RASGOS */}
                <div className="monolithic-panel border border-white/10 bg-black/20 p-8 space-y-6">
                  <header className="flex items-center gap-3 text-[hsl(var(--primary))] border-b border-[hsl(var(--foreground)/0.05)] pb-4">
                    <span className="material-symbols-outlined text-lg">auto_awesome</span>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--foreground))]">Apariencia y Rasgos</h3>
                  </header>
                  <textarea
                    className="w-full bg-foreground/[0.03] border border-foreground/20 rounded-none p-6 text-[13px] text-foreground/90 leading-relaxed min-h-[20rem] outline-none focus:border-primary/50 transition-all resize-none custom-scrollbar shadow-inner placeholder:italic placeholder:text-foreground/20"
                    placeholder="Describe visualmente esta entidad..."
                    value={extras.appearance}
                    onChange={(e) => updateExtra({ appearance: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-12">
                {/* ARCHIVOS VISUALES */}
                <div className="monolithic-panel border border-white/10 bg-black/20 p-8 space-y-6">
                  <header className="flex items-center gap-3 text-[hsl(var(--primary))] border-b border-[hsl(var(--foreground)/0.05)] pb-4">
                    <span className="material-symbols-outlined text-lg">photo_library</span>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--foreground))]">Archivos Visuales</h3>
                  </header>
                  
                  <div className="grid grid-cols-2 gap-4">
                    {extras.images?.map((img: string, i: number) => (
                      <div key={i} className="aspect-[16/10] bg-background border border-foreground/10 overflow-hidden relative group cursor-zoom-in" onClick={() => setZoomImage(img)}>
                        <img src={img} className="w-full h-full object-cover opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-1000" alt="Gallery" />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                          className="absolute top-2 right-2 size-8 bg-rose-500 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-2xl"
                        >
                          <span className="material-symbols-outlined text-xs">close</span>
                        </button>
                      </div>
                    ))}
                    <label className="aspect-[16/10] border-2 border-dashed border-white/5 flex flex-col items-center justify-center gap-4 hover:bg-background hover:border-primary/30 transition-all cursor-pointer group">
                      <div className="size-12 rounded-full bg-primary/5 flex items-center justify-center border border-primary/10 group-hover:bg-primary/20 group-hover:scale-110 transition-all">
                        <span className="material-symbols-outlined text-primary/40 group-hover:text-primary text-xl">add_a_photo</span>
                      </div>
                      <span className="text-[8px] font-black uppercase text-foreground/20 group-hover:text-primary tracking-[0.3em]">Upload Fragment</span>
                      <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                </div>

                {/* NOTAS DE DESARROLLADOR */}
                <div className="monolithic-panel border border-white/10 bg-black/20 p-8 space-y-6">
                  <header className="flex items-center gap-3 text-[hsl(var(--primary))] border-b border-[hsl(var(--foreground)/0.05)] pb-4">
                    <span className="material-symbols-outlined text-lg">edit_note</span>
                    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-[hsl(var(--foreground))]">Notas de Desarrollador</h3>
                  </header>
                  <textarea
                    className="w-full bg-foreground/[0.03] border border-foreground/20 rounded-none p-6 text-[13px] text-foreground/60 italic leading-relaxed min-h-[15rem] outline-none focus:border-primary/50 transition-all resize-none custom-scrollbar shadow-inner placeholder:text-foreground/20"
                    placeholder="Secretos, ideas de desarrollo, conexiones ocultas..."
                    value={extras.notes}
                    onChange={(e) => updateExtra({ notes: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {activeEntityTab === 'narrative' && (
            <div className="space-y-12">
              <div className="monolithic-panel border border-white/10 bg-black/20 p-12 min-h-[60vh] flex flex-col">
                <header className="flex items-center justify-between mb-12 border-b border-white/5 pb-6">
                  <div className="flex items-center gap-4">
                    <span className="material-symbols-outlined text-primary/60">history_edu</span>
                    <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[hsl(var(--foreground))]">Biografía Narrativa</h3>
                  </div>
                  <div className="flex items-center gap-2 text-primary/20">
                    <span className="material-symbols-outlined text-xs">markdown</span>
                    <span className="text-[8px] font-black uppercase tracking-widest">System Ready</span>
                  </div>
                </header>
                  <textarea
                    className="flex-1 w-full bg-transparent border-none outline-none text-xl text-foreground font-medium leading-relaxed resize-none custom-scrollbar placeholder:text-foreground/20 italic"
                    placeholder="Escribe la historia, leyendas y mitos corporativos..."
                    value={entity.descripcion || ''}
                    onChange={e => setEntity({ ...entity, descripcion: e.target.value })}
                  />
              </div>
            </div>
          )}

          {activeEntityTab === 'attributes' && (
            <div className="space-y-12 min-h-[60vh]">
              <header className="flex items-center justify-between border-b border-white/10 pb-8">
                <div className="flex items-center gap-4">
                  <span className="material-symbols-outlined text-primary/60">layers</span>
                  <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-[hsl(var(--foreground))]">Atributos Modulares</h3>
                </div>
                <div className="px-4 py-2 bg-primary/5 border border-primary/10 text-[9px] font-black text-primary uppercase tracking-widest animate-pulse">
                  Panel lateral activo para inyectar plantillas
                </div>
              </header>
              
              <div 
                className={`grid grid-cols-1 md:grid-cols-2 gap-8 p-4 transition-all duration-500 border-2 border-transparent ${isDraggingOver ? 'bg-primary/5 border-dashed border-primary/40 shadow-2xl shadow-primary/5' : ''}`}
                onDragOver={handleDragOverArea}
                onDragLeave={handleDragLeaveArea}
                onDrop={handleDropArea}
              >
                {fields.length === 0 && !isDraggingOver && (
                  <div className="col-span-full py-32 border border-dashed border-white/5 flex flex-col items-center justify-center text-foreground/20 bg-background">
                    <span className="material-symbols-outlined text-5xl mb-6 font-light">inventory_2</span>
                    <p className="text-[10px] font-black uppercase tracking-[0.3em]">Área de Atributos Vacía</p>
                    <p className="text-[9px] mt-4 opacity-50 italic">Arrastra aquí tus módulos desde el lateral derecho</p>
                  </div>
                )}
                {fields.map((field) => (
                  <div key={field.id} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 animate-in fade-in duration-300" onClick={() => setZoomImage(null)}>
            <button className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors" onClick={() => setZoomImage(null)}>
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>
            <img src={zoomImage} className="max-w-[90vw] max-h-[85vh] object-contain border border-white/10 shadow-2xl" alt="Zoom" />
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityBuilder;
