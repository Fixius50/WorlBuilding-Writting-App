import React from 'react';
import MonolithicPanel from '@atoms/MonolithicPanel';
import Button from '@atoms/Button';
import AttributeField from './AttributeField';
import Avatar from '@atoms/Avatar';
import EntityBuilderSidebar from '../components/EntityBuilderSidebar';
import ConfirmationModal from '@organisms/ConfirmationModal';
import FamilyTreeAssigner from '../components/FamilyTreeAssigner';
import TemplateSettingsModal from '@organisms/TemplateSettingsModal';
import { useEntityBuilder } from './useEntityBuilder';

interface EntityBuilderProps {
  mode: 'creation' | 'edit';
}

const EntityBuilder: React.FC<EntityBuilderProps> = ({ mode }) => {
  const {
    entity,
    setEntity,
    fields,
    loading,
    saving,
    deleteModalOpen,
    setDeleteModalOpen,
    availableTemplates,
    activeEntityTab,
    setActiveEntityTab,
    zoomImage,
    setZoomImage,
    showLibrary,
    setShowLibrary,
    editingTemplate,
    setEditingTemplate,
    isDraggingOver,
    extras,
    projectId,
    handleSave,
    handleFieldChange,
    handleRemoveField,
    handleImageUpload,
    removeImage,
    handleDragOverArea,
    handleDragLeaveArea,
    handleDropArea,
    handleDeleteEntity,
    updateExtra,
    refreshTemplates,
    navigate
  } = useEntityBuilder(mode);

  if (loading) return (
    <div className="flex items-center justify-center h-full bg-background animate-pulse">
      <div className="text-[0.75rem] font-black uppercase tracking-[0.2em] text-primary">
        Iniciando Constructor Local...
      </div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden relative">
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleDeleteEntity}
        title="Confirmar Eliminación"
        message="¿Estás seguro de que deseas eliminar este elemento? Esta acción no se puede deshacer."
        confirmText="Borrar"
        cancelText="Cancelar"
      />
      <div className="flex-1 overflow-y-auto no-scrollbar scroll-smooth">
        {/* CABECERA UNIFICADA MONOLÍTICA */}
        <div className="sticky top-0 z-40 bg-background border-b border-foreground/10 animate-in slide-in-from-top-4 duration-700">
          
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
                onClick={() => setDeleteModalOpen(true)} 
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

          <div className="border-t border-foreground/5 bg-foreground/[0.02]">
            <div className="flex items-center justify-center gap-12 max-w-7xl mx-auto">
              {['identity', 'narrative', 'attributes', 'relationships'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveEntityTab(tab)}
                  className={`py-4 text-[9px] font-black uppercase tracking-[0.3em] border-b-2 transition-all duration-500 ${activeEntityTab === tab
                    ? 'border-primary text-primary drop-shadow-[0_0_8px_rgba(var(--primary),0.4)]'
                    : 'border-transparent text-foreground/30 hover:text-foreground'
                  }`}
                >
                  {tab === 'identity' ? 'Identidad' : 
                   tab === 'narrative' ? 'Narrativa' : 
                   tab === 'attributes' ? 'Atributos' : 'Linaje'}
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
                
                <div className="relative">
                  <button
                    onClick={() => setShowLibrary(!showLibrary)}
                    className={`flex items-center gap-3 px-6 py-2.5 rounded-none font-black text-[9px] uppercase tracking-[0.2em] transition-all border ${showLibrary ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20' : 'bg-primary/5 text-primary border-primary/20 hover:bg-primary/10'}`}
                  >
                    <span className="material-symbols-outlined text-sm">{showLibrary ? 'close' : 'add_box'}</span>
                    {showLibrary ? 'Cerrar Biblioteca' : 'Añadir Módulo'}
                  </button>

                  {showLibrary && (
                    <div className="absolute top-full right-0 mt-4 w-[22rem] h-[32rem] z-50 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                      <div className="h-full border border-foreground/10 bg-background overflow-hidden flex flex-col shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                        <EntityBuilderSidebar
                          templates={availableTemplates}
                          onAddTemplate={(tpl) => {
                            handleDropArea({
                              preventDefault: () => {},
                              stopPropagation: () => {},
                              dataTransfer: { getData: () => JSON.stringify(tpl) }
                            } as any);
                          }}
                          onRefresh={refreshTemplates}
                          projectId={projectId}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </header>
              
              <div 
                className={`flex flex-wrap gap-8 p-4 transition-all duration-500 border-2 border-transparent ${isDraggingOver ? 'bg-primary/5 border-dashed border-primary/40 shadow-2xl shadow-primary/5' : ''}`}
                onDragOver={handleDragOverArea}
                onDragLeave={handleDragLeaveArea}
                onDrop={handleDropArea}
              >
                {fields.length === 0 && !isDraggingOver && (
                  <div className="col-span-full py-32 border border-dashed border-white/5 flex flex-col items-center justify-center text-foreground/20 bg-background w-full">
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
                      onEditTemplate={(tpl) => setEditingTemplate(tpl)}
                    />
                  </div>
                ))}
              </div>

              {editingTemplate && (
                <TemplateSettingsModal
                  template={editingTemplate}
                  onClose={() => setEditingTemplate(null)}
                  onSave={async () => {
                    await refreshTemplates();
                    setEditingTemplate(null);
                  }}
                />
              )}
            </div>
          )}

          {activeEntityTab === 'relationships' && entity.id && (
            <FamilyTreeAssigner entityId={entity.id} projectId={projectId} />
          )}
        </div>

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

