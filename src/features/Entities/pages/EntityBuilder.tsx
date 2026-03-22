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
  const [isCreation, setIsCreation] = useState(mode === 'creation');

  const {
    setRightOpen,
    setRightPanelTab,
    setAddAttributeHandler,
    setAvailableTemplates
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
      appearance: '',
      notes: '',
      images: []
    }),
    project_id: 1, 
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
  const [isDraggingOver, setIsDraggingOver] = useState(false);

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
        const templates = await templateService.getByProject(1); // project_id 1 + global (0)
        setAvailableTemplatesLocal(templates);
        setAvailableTemplates(templates);

        setAddAttributeHandler((templateId: number) => {
          const tpl = templates.find(t => t.id === templateId);
          if (tpl) {
            setFields(prev => [...prev, {
              id: `temp-${tpl.id}-${Date.now()}`,
              attribute: tpl,
              value: tpl.valor_defecto || '',
              isTemp: true
            }]);
          }
        });

        if (!isCreation && entitySlug) {
          const data = await entityService.getById(Number(entitySlug));
          if (data) {
            setEntity(data);
            const vals = await entityService.getValues(data.id);
            setFields(vals.map(v => ({
              id: v.id,
              attribute: templates.find(t => t.id === v.plantilla_id),
              value: v.valor,
              isTemp: false
            })));
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    init();
  }, [entitySlug, isCreation]);

  const refreshTemplates = async () => {
    try {
      const templates = await templateService.getByProject(1);
      setAvailableTemplatesLocal(templates);
      setAvailableTemplates(templates);
    } catch (err) {
      console.error('Error refreshing templates:', err);
    }
  };

  // --- HANDLERS ---
  const handleSave = async (redirect = true) => {
    setSaving(true);
    try {
      let savedEntity: Entidad;
      if (isCreation) {
        savedEntity = await entityService.create(entity as any);
      } else {
        savedEntity = await entityService.update(entity.id!, entity);
      }

      const updatedFields = [...fields];
      for (let i = 0; i < updatedFields.length; i++) {
        const f = updatedFields[i];
        if (f.isTemp) {
          await entityService.addValue(savedEntity.id, f.attribute.id, f.value);
        } else {
          await entityService.updateValue(f.id, f.value);
        }
      }

      // NEW: Actually DELETE removed fields from DB
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
        // Force a re-fetch of values to get real IDs from DB
        const freshValues = await entityService.getValues(savedEntity.id);
        setFields(freshValues.map(v => ({ ...v, isTemp: false })));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleFieldChange = (fieldId: any, value: string) => {
    setFields(prev => prev.map(f => f.id === fieldId ? { ...f, value } : f));
  };

  const handleRemoveField = (fieldId: any) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field.isTemp) {
      setRemovedFieldIds(prev => [...prev, field.id]);
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
        const imgs = [...(current.images || []), reader.result];
        updateExtra({ images: imgs });
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    const current = getExtra();
    const imgs = (current.images || []).filter((_: any, i: number) => i !== index);
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
      console.error('Error dropping attribute:', err);
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

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        {/* ENCABEZADO DE ENTIDAD - PREMIUM GLASS */}
        <div className="sticky top-0 z-40 bg-background/80 backdrop-blur-xl border-b border-foreground/10 px-[1.5rem] lg:px-[3rem] py-[1rem] flex flex-col items-center gap-0">
          
          {/* Fila 1: Logo + Nombre (Más espaciosa) */}
          <div className="flex items-center gap-[1.25rem] py-[2rem] w-full justify-center">
            <Avatar 
              url={extras.iconUrl}
              name={entity.nombre || 'Nuevo Ente'} 
              size="md" 
              className="ring-1 ring-primary/20 ring-offset-4 ring-offset-background shadow-xl" 
            />
            <h2 className="text-[1.5rem] font-black text-foreground tracking-[-0.02em] uppercase">
              {entity.nombre || 'Nuevo Ente'}
            </h2>
          </div>

          {/* Fila 2: Controles de Acción (Más compacta) */}
          <div className="flex items-center justify-center gap-[2rem] w-full py-[0.75rem] border-t border-foreground/5 bg-foreground/[0.01]">
            <button 
              onClick={() => navigate(-1)} 
              className="flex items-center gap-2 px-[1rem] py-[0.4rem] text-[0.625rem] font-black uppercase tracking-[0.2em] text-foreground/40 hover:text-primary transition-all group"
            >
              <span className="material-symbols-outlined text-[0.875rem]">arrow_back</span>
              Volver
            </button>

            <button 
              onClick={() => handleSave(true)} 
              disabled={saving}
              className={`flex items-center gap-[0.5rem] px-[2rem] py-[0.6rem] rounded-none font-black text-[0.625rem] uppercase tracking-[0.2em] transition-all shadow-lg ${saving ? 'bg-primary/20 text-primary cursor-wait' : 'bg-primary hover:bg-primary/90 text-white hover:scale-105 active:scale-95 shadow-primary/20'}`}
             >
               <span className="material-symbols-outlined text-[1rem]">save</span>
               {saving ? 'Guardando...' : 'Guardar Cambios'}
             </button>
          </div>
        </div>

        {/* Sidebar Portal */}
        {portalTarget && createPortal(
          <EntityBuilderSidebar
            key={`sidebar-${availableTemplates.length}-${activeEntityTab}`}
            templates={availableTemplates}
            currentFields={fields}
            onAddTemplate={(tpl) => {
              // Now only called when specifically requested (e.g. from a future 'Add' button within edit)
              setFields(prev => [...prev, {
                id: `temp-${tpl.id}-${Date.now()}`,
                attribute: tpl,
                value: tpl.valor_defecto || '',
                isTemp: true
              }]);
            }}
            onRefresh={refreshTemplates}
          />,
          portalTarget
        )}

        {/* NAVEGACIÓN DE PESTAÑAS */}
        <div className="px-[1.5rem] lg:px-[3rem] border-b border-foreground/5 bg-background/40 sticky top-[9.875rem] z-30 backdrop-blur-md">
          <div className="flex items-center justify-center gap-[3rem]">
            {['identity', 'narrative', 'attributes'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveEntityTab(tab)}
                className={`py-[1.25rem] text-[0.625rem] font-black uppercase tracking-[0.2em] border-b-2 transition-all ${activeEntityTab === tab
                  ? 'border-primary text-primary'
                  : 'border-transparent text-foreground/60 hover:text-primary'
                }`}
              >
                {tab === 'identity' ? 'Identidad' : tab === 'narrative' ? 'Narrativa' : 'Atributos'}
              </button>
            ))}
          </div>
        </div>

        {/* Main Content Area - WITH PROPER SIDE MARGINS */}
        <div className="p-[1.5rem] lg:p-[3rem] pb-[8rem] max-w-[80rem] mx-auto w-full animate-in fade-in slide-in-from-bottom-4 duration-700">
          
          {activeEntityTab === 'identity' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-[2.5rem]">
              <div className="space-y-[2rem]">
                <GlassPanel title="NÚCLEO DE IDENTIDAD" icon="fingerprint">
                  <div className="space-y-[1.5rem]">
                    <div>
                      <label className="text-[0.625rem] font-bold uppercase text-primary mb-[0.75rem] block tracking-[0.15em] opacity-70">
                        Nombre de la Entidad
                      </label>
                      <input
                        type="text"
                        className="w-full bg-foreground/[0.03] border-2 border-foreground/10 rounded-none p-[1.5rem] text-[1.5rem] font-black text-foreground focus:border-primary outline-none transition-all placeholder:text-foreground/30 shadow-inner sunken-panel"
                        placeholder="Ej: El Rey de Cenizas"
                        value={entity.nombre}
                        onChange={(e) => setEntity({ ...entity, nombre: e.target.value })}
                      />
                    </div>
                    <div>
                      <label className="text-[0.625rem] font-bold uppercase text-foreground/60 mb-[0.75rem] block tracking-[0.15em] opacity-70">
                        Categoría de Sistema
                      </label>
                      <select
                        className="w-full bg-foreground/[0.03] border-2 border-foreground/10 rounded-none px-[1rem] py-[1rem] text-[0.75rem] text-foreground font-black uppercase tracking-[0.15em] outline-none focus:border-primary transition-all cursor-pointer sunken-panel"
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
                    className="w-full bg-foreground/[0.03] border-2 border-foreground/10 rounded-none p-[1.5rem] text-[0.875rem] text-foreground leading-relaxed min-h-[18.75rem] outline-none focus:border-primary transition-all resize-none custom-scrollbar sunken-panel"
                    placeholder="Describe visualmente esta entidad..."
                    value={extras.appearance}
                    onChange={(e) => updateExtra({ appearance: e.target.value })}
                  />
                </GlassPanel>
              </div>

              <div className="space-y-[2rem]">
                <GlassPanel title="ARCHIVOS VISUALES" icon="photo_library">
                  <div className="grid grid-cols-3 gap-[1rem]">
                    {extras.images?.map((img: string, i: number) => (
                      <div key={i} className="aspect-square rounded-none monolithic-panel overflow-hidden relative group cursor-zoom-in" onClick={() => setZoomImage(img)}>
                        <img src={img} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-700" alt="Gallery" />
                        <button
                          onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                          className="absolute top-[0.5rem] right-[0.5rem] size-[1.75rem] bg-red-500/80 text-white rounded-none flex items-center justify-center translate-y-[-150%] group-hover:translate-y-0 transition-transform shadow-xl"
                        >
                          <span className="material-symbols-outlined text-[0.75rem]">close</span>
                        </button>
                      </div>
                    ))}
                    <label className="aspect-square rounded-none border-2 border-dashed border-foreground/10 flex flex-col items-center justify-center gap-[0.75rem] hover:bg-foreground/5 hover:border-primary/30 transition-all cursor-pointer group sunken-panel">
                      <span className="material-symbols-outlined text-primary/50 group-hover:text-primary group-hover:scale-110 transition-all text-[1.5rem]">add_a_photo</span>
                      <span className="text-[0.5rem] font-black uppercase text-foreground/60 group-hover:text-primary tracking-[0.15em] text-center px-[1rem]">Upload Fragment</span>
                      <input type="file" multiple className="hidden" onChange={handleImageUpload} accept="image/*" />
                    </label>
                  </div>
                </GlassPanel>

                <GlassPanel title="NOTAS DE DESARROLLADOR" icon="edit_note">
                  <textarea
                    className="w-full bg-foreground/[0.03] border-2 border-foreground/10 rounded-none p-[1.5rem] text-[0.875rem] text-foreground/60 italic leading-relaxed min-h-[13.75rem] outline-none focus:border-primary transition-all resize-none custom-scrollbar sunken-panel"
                    placeholder="Secretos, ideas de desarrollo, conexiones ocultas..."
                    value={extras.notes}
                    onChange={(e) => updateExtra({ notes: e.target.value })}
                  />
                </GlassPanel>
              </div>
            </div>
          )}

          {activeEntityTab === 'narrative' && (
            <div className="space-y-[2.5rem]">
              <GlassPanel className="min-h-[50vh] p-[2rem] flex flex-col border-primary/10">
                <div className="flex items-center justify-between mb-[2rem]">
                  <h3 className="text-[0.625rem] font-bold uppercase tracking-[0.15em] text-primary flex items-center gap-[0.75rem]">
                    <span className="material-symbols-outlined text-[1rem]">history_edu</span> Biografía Narrativa
                  </h3>
                  <div className="flex items-center gap-[0.5rem] opacity-30">
                    <span className="material-symbols-outlined text-[0.75rem]">markdown</span>
                    <span className="text-[0.5625rem] font-bold tracking-[0.1em]">TEXT READY</span>
                  </div>
                </div>
                <textarea
                  className="flex-1 w-full bg-foreground/[0.03] border-2 border-foreground/10 rounded-none p-[2rem] text-foreground text-[1.125rem] leading-relaxed resize-none focus:border-primary outline-none placeholder:text-foreground/30 custom-scrollbar shadow-inner sunken-panel"
                  placeholder="Escribe la historia, leyendas y mitos corporativos..."
                  value={entity.descripcion || ''}
                  onChange={e => setEntity({ ...entity, descripcion: e.target.value })}
                />
              </GlassPanel>
            </div>
          )}

          {activeEntityTab === 'attributes' && (
            <div className="space-y-[2rem] min-h-[60vh] relative">
              <div className="flex items-center justify-between border-b border-foreground/10 pb-[1.5rem]">
                <h3 className="text-[0.625rem] font-black uppercase tracking-[0.15em] text-primary flex items-center gap-[0.75rem]">
                  <span className="material-symbols-outlined text-[1rem]">layers</span> Atributos Modulares
                </h3>
                <p className="text-[0.5625rem] text-foreground/60 font-bold uppercase tracking-[0.1em]">
                  Arrastre elementos desde el panel lateral
                </p>
              </div>
              
              <div 
                className={`grid grid-cols-1 md:grid-cols-2 gap-[2rem] p-[1rem] transition-all border-2 border-transparent ${isDraggingOver ? 'bg-primary/5 border-dashed border-primary ring-4 ring-primary/10 scale-[1.01]' : ''}`}
                onDragOver={handleDragOverArea}
                onDragLeave={handleDragLeaveArea}
                onDrop={handleDropArea}
              >
                {fields.length === 0 && !isDraggingOver && (
                  <div className="col-span-full py-[8rem] border-2 border-dashed border-foreground/10 rounded-none flex flex-col items-center justify-center text-foreground/60 bg-foreground/[0.01]">
                    <span className="material-symbols-outlined text-[3rem] mb-[1.5rem] opacity-20">inventory_2</span>
                    <p className="text-[0.75rem] font-black uppercase tracking-[0.15em] opacity-40">Área de Atributos Vacía</p>
                    <p className="text-[0.625rem] font-bold uppercase tracking-[0.1em] mt-2 opacity-30">Arrastra aquí tus módulos</p>
                  </div>
                )}
                {isDraggingOver && fields.length === 0 && (
                  <div className="col-span-full py-[8rem] flex flex-col items-center justify-center text-primary animate-pulse">
                    <span className="material-symbols-outlined text-[4rem] mb-4">add_circle</span>
                    <p className="text-[0.875rem] font-black uppercase tracking-[0.2em]">Soltar para añadir módulo</p>
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
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 animate-in fade-in duration-300" onClick={() => setZoomImage(null)}>
            <button className="absolute top-[2.5rem] right-[2.5rem] text-foreground/40 hover:text-foreground transition-colors" onClick={() => setZoomImage(null)}>
              <span className="material-symbols-outlined text-[3rem]">close</span>
            </button>
            <img src={zoomImage} className="max-w-[90vw] max-h-[85vh] object-contain rounded-none shadow-2xl border-4 border-foreground/10" alt="Zoom" />
          </div>
        )}
      </div>
    </div>
  );
};

export default EntityBuilder;
