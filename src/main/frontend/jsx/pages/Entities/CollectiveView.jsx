import { useState, useEffect } from 'react';
import GlassPanel from '../../components/common/GlassPanel';
import Button from '../../components/common/Button';
import api from '../../services/api';

const CollectiveView = ({ id }) => {
    const [collective, setCollective] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadCollective();
    }, [id]);

    const loadCollective = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/bd/entidadcolectiva/${id}`);
            setCollective(data);
        } catch (err) {
            console.error("Error loading collective:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        try {
            await api.patch('/bd/modificar', {
                ...collective,
                tipoEntidad: 'entidadcolectiva'
            });
            setIsEditing(false);
            alert("Changes saved!");
        } catch (err) {
            alert("Error saving: " + err.message);
        }
    };

    const handleChange = (field, value) => {
        setCollective(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <div className="p-20 text-center text-slate-500 animate-pulse">Gathering intelligence...</div>;
    if (!collective) return <div className="p-20 text-center text-red-500">Collective not found in the records.</div>;

    return (
        <div className="flex h-full overflow-y-auto custom-scrollbar p-8 flex-col gap-8">
            {/* Header */}
            <header className="flex justify-between items-end">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs font-bold text-indigo-400 bg-indigo-400/10 px-2 py-0.5 rounded border border-indigo-400/20">COLLECTIVE</span>
                        <span className="text-xs font-bold text-slate-400 bg-surface-light px-2 py-0.5 rounded border border-white/5">{collective.tipo || 'Organization'}</span>
                    </div>
                    <h1 className="text-5xl font-manrope font-black text-white tracking-tight">{collective.nombre}</h1>
                    <p className="text-slate-400 mt-2">{collective.cantidadMiembros || 'Unknown'} members</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="secondary" icon={isEditing ? 'close' : 'edit'} onClick={() => setIsEditing(!isEditing)}>
                        {isEditing ? 'Cancel' : 'Edit Collective'}
                    </Button>
                    {isEditing && <Button variant="primary" icon="save" onClick={handleSave}>Update Dossier</Button>}
                </div>
            </header>

            <div className="grid grid-cols-3 gap-8">
                <div className="col-span-1 space-y-6">
                    <GlassPanel className="p-6">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">group_work</span> Group Dynamics
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Scale / Members</label>
                                <input type="text" value={collective.cantidadMiembros || ''} onChange={(e) => handleChange('cantidadMiembros', e.target.value)} className="w-full bg-surface-light border border-white/10 rounded px-3 py-2 text-white text-sm" readOnly={!isEditing} />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 block mb-1">Behavior / Alignment</label>
                                <input type="text" value={collective.comportamiento || ''} onChange={(e) => handleChange('comportamiento', e.target.value)} className="w-full bg-surface-light border border-white/10 rounded px-3 py-2 text-white text-sm" readOnly={!isEditing} />
                            </div>
                        </div>
                    </GlassPanel>
                </div>

                <div className="col-span-2 space-y-6">
                    <GlassPanel className="p-8">
                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                            <span className="material-symbols-outlined text-sm">history_edu</span> Mandate & History
                        </h3>
                        <textarea
                            value={collective.descripcion || ''}
                            onChange={(e) => handleChange('descripcion', e.target.value)}
                            readOnly={!isEditing}
                            className="w-full bg-transparent border-none outline-none text-slate-300 text-lg leading-relaxed min-h-[400px] resize-none"
                            placeholder="Detail the motives, the structure, and the legacy of this group..."
                        />
                    </GlassPanel>
                </div>
            </div>
        </div>
    );
};

export default CollectiveView;
