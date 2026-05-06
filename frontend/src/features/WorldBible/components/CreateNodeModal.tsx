import React, { useState } from 'react';
import { HIERARCHY_TYPES } from '@utils/constants/hierarchy_types';

interface CreateNodeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (data: any) => void;
  parentFolder?: { id: number; nombre: string } | null;
}

const CreateNodeModal: React.FC<CreateNodeModalProps> = ({ isOpen, onClose, onCreate, parentFolder }) => {
  const isRoot = !parentFolder;

  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    tipo: 'FOLDER',
    canvasType: 'BLANK'
  });

  // Reseteamos el estado cada vez que se abre el modal para evitar fugas de tipos
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        nombre: '',
        descripcion: '',
        tipo: isRoot ? 'FOLDER' : HIERARCHY_TYPES.UNIVERSE.id,
        canvasType: 'BLANK'
      });
    }
  }, [isOpen, isRoot]);

  if (!isOpen) return null;

  const handleSubmit = () => {
    // Si es root, forzamos FOLDER. Si no, forzamos que NO sea FOLDER (si el estado falló, asignamos UNIVERSE)
    const finalTipo = isRoot ? 'FOLDER' : (formData.tipo === 'FOLDER' ? HIERARCHY_TYPES.UNIVERSE.id : formData.tipo);
    const finalData = { ...formData, tipo: finalTipo };
    
    onCreate(finalData);
    onClose();
  };


  const TYPES = [
  HIERARCHY_TYPES.UNIVERSE,
  HIERARCHY_TYPES.GALAXY,
  HIERARCHY_TYPES.SYSTEM,
  HIERARCHY_TYPES.PLANET
  ];

  // Si no es raíz, no mostramos la opción de crear Carpeta (Espacio)
  const ALL_TYPES = isRoot ? [] : [...TYPES];

 return (
  <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/95 backdrop-blur-sm p-4">
    <div className="bg-background w-full max-w-4xl rounded-none shadow-[0_0_50px_rgba(0,0,0,0.5)] border border-foreground/10 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">

  {/* Header & Actions Toolbar */}
  <div className="p-6 border-b border-foreground/5 flex justify-between items-center bg-foreground/[0.03] sticky top-0 z-10">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary border border-primary/20">
        <span className="material-symbols-outlined text-base">add_circle</span>
      </div>
      <div>
        <h2 className="text-xl font-black text-foreground tracking-tight leading-none mb-1">
          {parentFolder ? 'Nuevo espacio' : 'Crear Nuevo Mapa'}
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
    <div className={`grid grid-cols-1 ${!isRoot ? 'md:grid-cols-2' : ''} gap-8`}>
      {/* Identidad */}
      <div className="space-y-6">
    <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Identidad</h3>
    <div>
      <label className="block text-[9px] font-black text-foreground/30 uppercase mb-2 tracking-widest">Nombre del espacio</label>
 <input
 autoFocus
 type="text"
 value={formData.nombre}
 onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
 className="w-full monolithic-panel rounded-none px-5 py-4 text-foreground focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
 placeholder="ej. Sistema Solar"
 />
 </div>
 <div>
 <label className="block text-[10px] font-black text-foreground/30 uppercase mb-2">Descripción</label>
 <textarea
 value={formData.descripcion}
 onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
 className="w-full h-32 monolithic-panel rounded-none px-5 py-4 text-foreground focus:outline-none focus:border-indigo-500/50 resize-none transition-all"
 placeholder="Detalles sobre este nivel jerárquico..."
 />
 </div>
      </div>

      {/* Jerarquía y Visualización (Oculto en Raíz) */}
      {!isRoot && (
        <div className="space-y-6">
          <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">Configuración</h3>

          <div className="space-y-3">
            <label className="block text-[9px] font-black text-foreground/30 uppercase mb-1 tracking-widest">Tipo de Jerarquía</label>
            <div className="grid grid-cols-2 gap-2">
              {ALL_TYPES.map(type => (
                <div
                  key={type.id}
                  onClick={() => setFormData({ ...formData, tipo: type.id })}
                  className={`flex items-center gap-3 p-3 rounded-none border cursor-pointer transition-all ${
                    formData.tipo === type.id 
                      ? 'bg-primary/10 border-primary/50 shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)]' 
                      : 'bg-white/5 border-white/5 hover:bg-white/10'
                  }`}
                >
                  <span className={`material-symbols-outlined text-lg ${type.color || ''}`}>{type.icon}</span>
                  <span className="text-xs font-bold text-foreground/80">{type.label}</span>
                </div>
              ))}
            </div>
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
