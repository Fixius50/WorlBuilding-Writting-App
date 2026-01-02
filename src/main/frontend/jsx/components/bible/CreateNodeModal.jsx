import React, { useState } from 'react';
import { HIERARCHY_TYPES } from '../../../js/constants/hierarchy_types';

const CreateNodeModal = ({ isOpen, onClose, onCreate, parentFolder }) => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        nombre: '',
        descripcion: '',
        tipo: 'FOLDER', // Default
        canvasType: 'BLANK' // BLANK or IMPORT
    });

    if (!isOpen) return null;

    const handleNext = () => {
        if (step < 3) setStep(step + 1);
    };

    const handleBack = () => {
        if (step > 1) setStep(step - 1);
    };

    const handleSubmit = () => {
        onCreate(formData);
        onClose();
        setStep(1);
        setFormData({ nombre: '', descripcion: '', tipo: 'FOLDER', canvasType: 'BLANK' });
    };

    // Filter types based on context if needed. For now, show all major types.
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

                    {/* Step 1: Identidad */}
                    <div className={`transition-opacity duration-300 ${step === 1 ? 'block' : 'hidden'}`}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">1</div>
                            <h3 className="text-lg font-medium text-white">Identidad y Jerarquía</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nombre</label>
                                    <input
                                        type="text"
                                        value={formData.nombre}
                                        onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                                        className="w-full bg-[#13141f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition"
                                        placeholder="ej. El Bosque Susurrante"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Ubicación Padre</label>
                                    <div className="w-full bg-[#13141f] border border-white/10 rounded-xl px-4 py-3 text-gray-400 flex justify-between items-center cursor-not-allowed">
                                        <span>{parentFolder ? parentFolder.nombre : 'Raíz (Nivel Superior)'}</span>
                                        <span className="material-icons text-sm">lock</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2">Definido por la navegación actual.</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Descripción</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full h-full min-h-[140px] bg-[#13141f] border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-indigo-500 resize-none transition"
                                    placeholder="Breve descripción..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 2: Tipo de Estructura */}
                    <div className={`transition-opacity duration-300 ${step === 2 ? 'block' : 'hidden'}`}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">2</div>
                            <h3 className="text-lg font-medium text-white">Tipo de Espacio</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {TYPES.map(type => (
                                <div
                                    key={type.id}
                                    onClick={() => setFormData({ ...formData, tipo: type.id })}
                                    className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:bg-white/5 ${formData.tipo === type.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-[#13141f]'}`}
                                >
                                    <div className={`w-12 h-12 rounded-lg ${type.bgColor} flex items-center justify-center mb-4`}>
                                        <span className={`material-icons ${type.color} text-2xl`}>{type.icon}</span>
                                    </div>
                                    <h4 className="text-white font-medium mb-1">{type.label}</h4>
                                    <p className="text-xs text-gray-400">{type.description}</p>

                                    {formData.tipo === type.id && (
                                        <div className="absolute top-4 right-4 text-indigo-500">
                                            <span className="material-icons">check_circle</span>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Generic Folder */}
                            <div
                                onClick={() => setFormData({ ...formData, tipo: 'FOLDER' })}
                                className={`relative p-6 rounded-xl border-2 cursor-pointer transition-all hover:bg-white/5 ${formData.tipo === 'FOLDER' ? 'border-indigo-500 bg-indigo-500/10' : 'border-white/5 bg-[#13141f]'}`}
                            >
                                <div className="w-12 h-12 rounded-lg bg-gray-800 flex items-center justify-center mb-4">
                                    <span className="material-icons text-gray-400 text-2xl">folder</span>
                                </div>
                                <h4 className="text-white font-medium mb-1">Espacio Simple</h4>
                                <p className="text-xs text-gray-400">Contenedor genérico.</p>
                                {formData.tipo === 'FOLDER' && (
                                    <div className="absolute top-4 right-4 text-indigo-500">
                                        <span className="material-icons">check_circle</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Step 3: Fuente del Lienzo */}
                    <div className={`transition-opacity duration-300 ${step === 3 ? 'block' : 'hidden'}`}>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-sm">3</div>
                            <h3 className="text-lg font-medium text-white">Visualización (Opcional)</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div
                                onClick={() => setFormData({ ...formData, canvasType: 'BLANK' })}
                                className={`h-64 rounded-2xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition hover:bg-white/5 ${formData.canvasType === 'BLANK' ? 'border-indigo-500 bg-indigo-500/5' : 'border-white/10'}`}
                            >
                                <span className="material-icons text-5xl text-gray-500 mb-4">format_paint</span>
                                <h4 className="text-white font-medium text-lg">Sin Mapa</h4>
                                <p className="text-gray-400 text-sm mt-2">Solo estructura de datos</p>
                            </div>

                            <div className="h-64 rounded-2xl border-2 border-dashed border-white/10 flex flex-col items-center justify-center cursor-pointer hover:bg-white/5 opacity-50">
                                <span className="material-icons text-5xl text-gray-500 mb-4">cloud_upload</span>
                                <h4 className="text-white font-medium text-lg">Cargar Imagen</h4>
                                <p className="text-gray-400 text-sm mt-2">N/A</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/5 flex justify-between bg-[#1f202e]">
                    <button
                        onClick={step === 1 ? onClose : handleBack}
                        className="px-6 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/5 transition font-medium"
                    >
                        {step === 1 ? 'Cancelar' : 'Atrás'}
                    </button>

                    <button
                        onClick={step === 3 ? handleSubmit : handleNext}
                        className="px-8 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-medium shadow-lg shadow-indigo-500/20 transition flex items-center gap-2"
                    >
                        {step === 3 ? 'Crear' : 'Siguiente'}
                        {step < 3 && <span className="material-icons text-sm">arrow_forward</span>}
                        {step === 3 && <span className="material-icons text-sm">check</span>}
                    </button>
                </div>

            </div>
        </div>
    );
};

export default CreateNodeModal;
