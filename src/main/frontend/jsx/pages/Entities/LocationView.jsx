import { useState, useEffect } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Button from '../../components/common/Button';
import api from '../../../js/services/api';

const LocationView = ({ id }) => {
    const [location, setLocation] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadLocation();
    }, [id]);

    const loadLocation = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/bd/zona/${id}`);
            setLocation(data);
        } catch (err) {
            console.error("Error loading location:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.patch('/bd/modificar', {
                ...location,
                tipoEntidad: 'zona'
            });
            setIsEditing(false);
            // alert("Changes saved!"); // Removed
        } catch (err) {
            console.error("Error saving:", err);
            // alert("Error saving: " + err.message); // Removed
        }
    };

    const handleChange = (field, value) => {
        setLocation(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <div className="p-20 text-center text-slate-500 animate-pulse">Scanning terrain...</div>;
    if (!location) return <div className="p-20 text-center text-red-500">Location not found in the maps.</div>;

    return (
        <div className="flex h-full overflow-y-auto custom-scrollbar p-8 flex-col gap-8">
            {/* Header */}
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">LOCATION</span>
                        <span className="text-xs font-bold text-slate-400 bg-surface-light px-2 py-0.5 rounded border border-white/5">{location.tipo || 'Wilderness'}</span>
                    </div>
                    <h1 className="text-5xl font-manrope font-black text-white tracking-tight">{location.nombre}</h1>
                    <p className="text-slate-400 mt-2">{location.apellidos || 'Uncharted territory'}</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={isEditing ? 'close' : 'edit'} onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? 'Cancel' : 'Edit Location'}
                    </Button>
                    {isEditing && <Button variant="primary" icon="save" onClick={handleSave}>Update Records</Button>}
                </div>
            </header>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1 space-y-6">
                    <GlassPanel className="p-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">straighten</span> Geography & Scale
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Size / Scale</label>
                                <input type="text" value={location.tamanno || ''} onChange={(e) => handleChange('tamanno', e.target.value)} className="w-full bg-surface-light border border-white/10 rounded px-3 py-2 text-white text-sm" readOnly={!isEditing} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Development Level</label>
                                <input type="text" value={location.desarrollo || ''} onChange={(e) => handleChange('desarrollo', e.target.value)} className="w-full bg-surface-light border border-white/10 rounded px-3 py-2 text-white text-sm" readOnly={!isEditing} />
                            </div>
                        </div>
                    </GlassPanel>

                    <GlassPanel className="p-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">Quick Stats</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-[10px] text-slate-500 block">Density</span>
                                <span className="text-white font-bold">Medium</span>
                            </div>
                            <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                                <span className="text-[10px] text-slate-500 block">Security</span>
                                <span className="text-emerald-400 font-bold">Stable</span>
                            </div>
                        </div>
                    </GlassPanel>
                </div>

                <div className="col-span-2 space-y-6">
                    <GlassPanel className="p-8">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">description</span> Topographic Records & Lore
                        </h3>
                        <textarea
                            value={location.descripcion || ''}
                            onChange={(e) => handleChange('descripcion', e.target.value)}
                            readOnly={!isEditing}
                            className="w-full bg-transparent border-none outline-none text-slate-300 text-lg leading-relaxed min-h-[400px] resize-none"
                            placeholder="Describe the vistas, the smells, and the secrets of this place..."
                        />
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
};

export default LocationView;
