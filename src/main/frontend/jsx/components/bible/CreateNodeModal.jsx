import React, { useState } from 'react';
import { HIERARCHY_TYPES } from '../../../js/constants/hierarchy_types';

const CreateNodeModal = ({ isOpen, onClose, onCreate, parentFolder }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo: 'FOLDER', // Default
        canvasType: 'BLANK' // BLANK or IMPORT
    });

    if (!isOpen) return null;

    const handleSubmit = () => {
        onCreate(formData);
        onClose();
        setFormData({ nombre: '', descripcion: '', tipo: 'FOLDER', canvasType: 'BLANK' });
    };

    const TYPES = [
        HIERARCHY_TYPES.UNIVERSE,
        HIERARCHY_TYPES.GALAXY,
        HIERARCHY_TYPES.SYSTEM,
        HIERARCHY_TYPES.PLANET
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="bg-[#1a1b26] w-full max-w-4xl rounded-2xl shadow-2xl border border-white/10 overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="p-6 border-b border-white/5 flex justify-between items-center bg-[#1f202e]">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                            <span className="material-icons text-sm">add</span>
                        </div>
                        <h2 className="text-xl font-semibold text-white">
                            {parentFolder ? 'Crear Nuevo Espacio' : 'Crear Nuevo Mapa'}
                        </h2>
                    </div>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition">
                        <span className="material-icons">close</span>
                    </button>
                </div>

                {/* Content */}
                <div className="p-8 overflow-y-auto flex-1">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Identidad */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">Identidad</h3>
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase mb-2">Nombre del Espacio</label>
                                <input
                                    autoFocus
                                    type="text"
                                    value={formData.nombre}
                                    onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                    className="w-full bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 transition-all shadow-inner"
                                    placeholder="ej. Sistema Solar"
                                />
                            </div>
                            <div>
                                <label className="block text-[10px] font-black text-white/30 uppercase mb-2">Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full h-32 bg-black/40 border border-white/5 rounded-2xl px-5 py-4 text-white focus:outline-none focus:border-indigo-500/50 resize-none transition-all"
                                    placeholder="Detalles sobre este nivel jerárquico..."
                                />
                            </div>
                        </div>

                        {/* Jerarquía y Visualización */}
                        <div className="space-y-6">
                            <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400">Configuración</h3>

                            <div className="space-y-3">
                                <label className="block text-[10px] font-black text-white/30 uppercase mb-1">Tipo de Jerarquía</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {TYPES.concat([{ id: 'FOLDER', label: 'Carpeta', icon: 'folder', color: 'text-white/50' }]).map(type => (
                                        <div
                                            key={type.id || 'FOLDER'}
                                            onClick={() => setFormData({ ...formData, tipo: type.id })}
                                            className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${formData.tipo === type.id ? 'bg-indigo-500/10 border-indigo-500/50' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                                        >
                                            <span className={`material-icons text-lg ${type.color || ''}`}>{type.icon}</span>
                                            <span className="text-xs font-bold text-white/80">{type.label}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="p-4 rounded-2xl bg-indigo-500/5 border border-indigo-500/10">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <span className="material-icons">info</span>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase font-black text-indigo-300">Ubicación Actual</p>
                                        <p className="text-xs text-indigo-100/50">{parentFolder ? parentFolder.nombre : 'Raíz del Mundo'}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex justify-end gap-3 bg-[#1f202e]">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-text-muted hover:text-white transition"
                    >
                        Cancelar
                    </button>

                    <button
                        onClick={handleSubmit}
                        disabled={!formData.nombre}
                        className="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-black uppercase tracking-widest shadow-lg shadow-indigo-500/20 transition-all disabled:opacity-30 disabled:pointer-events-none"
                    >
                        Confirmar y Crear
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateNodeModal;
