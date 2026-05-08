import React, { useState, useEffect } from 'react';
import { HIERARCHY_DEFINITIONS, HierarchyTypeId } from '@domain/models/hierarchy';
import { getHierarchyVisuals } from '@presentation/utils/hierarchyVisuals';

interface CreateNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: { nombre: string; tipo: string; descripcion?: string }) => void;
  parentFolder?: { id: number; nombre: string } | null;
}

const CreateNodeModal: React.FC<CreateNodeModalProps> = ({ isOpen, onClose, onCreate, parentFolder }) => {
  const isRoot = !parentFolder;

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'FOLDER' as HierarchyTypeId,
    canvasType: 'BLANK'
  });

  // Definición de tipos disponibles para el Omni-Constructor
  const TYPES_IDS: HierarchyTypeId[] = [
    'UNIVERSE',
    'MAP',
    'TIMELINE',
    'PERSONAJE',
    'LUGAR',
    'ORGANIZACION',
    'OBJETO',
    'EVENTO',
    'CONLANG'
  ];

  const TYPES = TYPES_IDS.map(id => ({
    ...HIERARCHY_DEFINITIONS[id],
    ...getHierarchyVisuals(id)
  }));

  useEffect(() => {
    if (isOpen) {
      const defaultType: HierarchyTypeId = parentFolder ? TYPES[0].id : 'FOLDER';
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: defaultType,
        canvasType: 'BLANK'
      });
    }
  }, [isOpen, parentFolder]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    const finalTipo = isRoot ? 'FOLDER' : (formData.tipo === 'FOLDER' ? TYPES[0].id : formData.tipo);
    const finalData = { ...formData, tipo: finalTipo };
    
    onCreate(finalData);
    onClose();
  };

  const AVAILABLE_TYPES = parentFolder
    ? TYPES 
    : [{ 
        id: 'FOLDER' as HierarchyTypeId, 
        label: 'Nueva Carpeta', 
        ...getHierarchyVisuals('FOLDER')
      }];

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
              {parentFolder ? 'Omni-Constructor' : 'Crear Nueva Carpeta'}
            </h2>
            <div className="flex items-center gap-2 text-[10px] font-bold text-foreground/40 uppercase tracking-widest">
              <span className="material-symbols-outlined text-[12px] opacity-50">location_on</span>
              <span>{parentFolder ? parentFolder.nombre : 'Raíz del Archivo'}</span>
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
      <div className="p-8 overflow-y-auto flex-1">
        <div className={`grid grid-cols-1 ${!isRoot ? 'lg:grid-cols-[1fr_1.5fr]' : ''} gap-12`}>
          {/* Columna Izquierda: Identidad */}
          <div className="space-y-8">
            <div>
              <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Identidad del Nodo</h3>
              <div className="space-y-6">
                <div>
                  <label className="block text-[9px] font-black text-foreground/30 uppercase mb-2 tracking-widest">Nombre</label>
                  <input
                    autoFocus
                    type="text"
                    value={formData.nombre}
                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                    className="w-full bg-foreground/[0.03] border border-foreground/10 rounded-none px-5 py-4 text-foreground focus:outline-none focus:border-primary/50 transition-all shadow-inner placeholder:italic"
                    placeholder={isRoot ? "Nombre de la carpeta..." : "Nombre del ente, mapa o cronología..."}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-foreground/30 uppercase mb-2">Descripción Breve</label>
                  <textarea
                    value={formData.descripcion}
                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                    className="w-full h-48 bg-foreground/[0.03] border border-foreground/10 rounded-none px-5 py-4 text-foreground focus:outline-none focus:border-primary/50 resize-none transition-all placeholder:italic"
                    placeholder="Escribe una breve introducción..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Configuración (Oculto en Raíz) */}
          {!isRoot && (
            <div className="space-y-8">
              <div>
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary mb-6">Naturaleza del Nodo</h3>
                <div className="grid grid-cols-2 gap-3">
                  {AVAILABLE_TYPES.map(type => (
                    <div
                      key={type.id}
                      onClick={() => setFormData({ ...formData, tipo: type.id as HierarchyTypeId })}
                      className={`group relative flex items-center gap-4 p-4 rounded-none border cursor-pointer transition-all duration-300 ${
                        formData.tipo === type.id 
                          ? 'bg-primary/10 border-primary/40 shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]' 
                          : 'bg-foreground/[0.02] border-foreground/5 hover:bg-foreground/[0.05] hover:border-foreground/10'
                      }`}
                    >
                      <div className={`size-10 flex items-center justify-center bg-background border border-foreground/5 group-hover:scale-110 transition-transform ${formData.tipo === type.id ? 'ring-1 ring-primary/30' : ''}`}>
                        <span className={`material-symbols-outlined text-xl ${type.color || ''}`}>{type.icon}</span>
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className={`text-[11px] font-black uppercase tracking-tighter truncate ${formData.tipo === type.id ? 'text-primary' : 'text-foreground/80'}`}>
                          {type.label}
                        </span>
                        <span className="text-[8px] font-bold text-foreground/30 uppercase tracking-widest">Seleccionar</span>
                      </div>
                      {formData.tipo === type.id && (
                        <div className="absolute top-2 right-2">
                          <div className="size-2 bg-primary rounded-full animate-pulse"></div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="p-6 bg-primary/[0.02] border border-primary/10">
                <div className="flex items-center gap-3 text-primary mb-2">
                  <span className="material-symbols-outlined text-sm">info</span>
                  <span className="text-[9px] font-black uppercase tracking-widest">Información del Sistema</span>
                </div>
                <p className="text-[10px] text-foreground/40 leading-relaxed italic">
                  Estás creando un nodo de tipo <span className="text-primary font-bold">{AVAILABLE_TYPES.find(t => t.id === formData.tipo)?.label}</span> dentro de <span className="text-foreground/60 font-bold">{parentFolder?.nombre}</span>. Los atributos específicos estarán disponibles tras la creación.
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
