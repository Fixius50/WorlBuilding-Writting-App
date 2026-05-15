import React from 'react';
import { HierarchyTypeId, HIERARCHY_DEFINITIONS } from '../types';
import { useCreateNodeModal } from './useCreateNodeModal';

interface CreateNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { nombre: string; tipo: string; descripcion?: string }) => void;
  parentFolder?: { id: number; nombre: string } | null;
  forceEntityMode?: boolean;
}

const CreateNodeModal: React.FC<CreateNodeModalProps> = ({ isOpen, onClose, onCreate, parentFolder, forceEntityMode }) => {
  const {
    isRoot,
    formData,
    setNombre,
    setDescripcion,
    setTipo,
    handleSubmit,
    ARQUETIPOS_GROUPS,
    getFullType
  } = useCreateNodeModal(isOpen, parentFolder, onClose, onCreate, forceEntityMode);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
      <div className="bg-background w-full max-w-5xl rounded-none shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-foreground/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

        {/* Header & Actions Toolbar */}
        <div className="p-6 border-b border-foreground/5 flex justify-between items-center bg-foreground/[0.03] sticky top-0 z-10">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
              <span className="material-symbols-outlined text-base">add_circle</span>
            </div>
            <div>
              <h2 className="text-xl font-black text-foreground tracking-tight leading-none mb-1">
                {(parentFolder || forceEntityMode) ? 'Omni-Constructor' : 'Crear Nueva Carpeta'}
              </h2>
              <div className="flex items-center gap-2 text-[10px] font-black text-foreground/20 uppercase tracking-widest">
                <span className="material-symbols-outlined text-[12px] opacity-20">location_on</span>
                <span>{parentFolder ? parentFolder.nombre : 'Raíz'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-none text-[10px] font-black uppercase tracking-widest text-foreground/40 hover:text-foreground hover:bg-white/5 transition-all"
            >
              Cancelar
            </button>

            <button
              onClick={handleSubmit}
              disabled={!formData.nombre}
              className="px-6 py-2.5 rounded-none bg-primary hover:bg-primary-dark text-primary-foreground text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/10 transition-all disabled:opacity-30 disabled:pointer-events-none flex items-center gap-2"
            >
              <span>Confirmar y Crear</span>
              <span className="material-symbols-outlined text-sm">check_circle</span>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 overflow-y-auto flex-1 no-scrollbar">
          <div className={`grid grid-cols-1 ${!isRoot ? 'lg:grid-cols-[1fr_1.8fr]' : ''} gap-12`}>
            {/* Columna Izquierda: Identidad */}
            <div className="space-y-8">
              <div className="space-y-12">
                <div className="space-y-8">
                  <div>
                    <label className="block text-[10px] font-black text-foreground/20 uppercase mb-4 tracking-[0.2em]">Nombre</label>
                    <input
                      autoFocus
                      type="text"
                      value={formData.nombre}
                      onChange={(e) => setNombre(e.target.value)}
                      className="w-full bg-foreground/[0.02] border border-foreground/5 rounded-none px-6 py-5 text-foreground focus:outline-none focus:border-primary/20 transition-all text-sm font-black uppercase tracking-widest"
                      placeholder={isRoot ? "Nombre de Carpeta" : "Nombre de Entidad"}
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-black text-foreground/20 uppercase mb-4 tracking-[0.2em]">Crónica Inicial</label>
                    <textarea
                      value={formData.descripcion}
                      onChange={(e) => setDescripcion(e.target.value)}
                      className="w-full h-64 bg-foreground/[0.02] border border-foreground/5 rounded-none px-6 py-5 text-foreground focus:outline-none focus:border-primary/20 resize-none transition-all text-xs leading-relaxed italic"
                      placeholder="Describe la esencia de este nuevo registro..."
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Columna Derecha: Configuración (Oculto en Raíz) */}
            {(!isRoot || forceEntityMode) && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6 italic">Naturaleza del Nodo (Arquetipos)</h3>
                  
                  <div className="space-y-8">
                    {ARQUETIPOS_GROUPS.map(group => (
                      <div key={group.name} className="space-y-3">
                        <div className="text-[9px] font-black text-foreground/20 uppercase tracking-[0.3em] border-b border-foreground/5 pb-2">
                          {group.name}
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          {group.ids.map(id => {
                            const type = getFullType(id);
                            return (
                              <div
                                key={type.id}
                                onClick={() => setTipo(type.id as HierarchyTypeId)}
                                className={`group relative flex items-center gap-4 p-4 rounded-none border cursor-pointer transition-all duration-500 ${
                                  formData.tipo === type.id 
                                    ? 'bg-foreground/[0.03] border-primary/40' 
                                    : 'bg-foreground/[0.01] border-foreground/5 hover:border-foreground/10'
                                }`}
                              >
                                <div className={`size-10 flex items-center justify-center bg-background border border-foreground/5 group-hover:scale-110 transition-transform ${formData.tipo === type.id ? 'ring-1 ring-primary/30' : ''}`}>
                                  <span className={`material-symbols-outlined text-xl ${type.color || ''}`}>{type.icon}</span>
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className={`text-[11px] font-black uppercase tracking-tighter truncate ${formData.tipo === type.id ? 'text-primary' : 'text-foreground/80'}`}>
                                    {type.label}
                                  </span>
                                  <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">Inyectar</span>
                                </div>
                                {formData.tipo === type.id && (
                                  <div className="absolute top-2 right-2">
                                    <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="p-8 border border-foreground/5 italic">
                  <p className="text-[10px] text-foreground/30 leading-relaxed">
                    Creando registro tipo <span className="text-foreground/60 font-black">{HIERARCHY_DEFINITIONS[formData.tipo]?.label}</span>. El sistema aplicará el arquetipo visual correspondiente de forma automática.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNodeModal;

