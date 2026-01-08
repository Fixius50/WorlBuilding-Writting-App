import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import GlassPanel from '../../components/common/GlassPanel';
import Avatar from '../../components/common/Avatar';
import Button from '../../components/common/Button';
import api from '../../../js/services/api';

const CharacterView = ({ id }) => {
    const { id: projectId } = useParams();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('overview');
    const [character, setCharacter] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);

    useEffect(() => {
        loadCharacter();
    }, [id]);

    const loadCharacter = async () => {
        setLoading(true);
        try {
            const data = await api.get(`/bd/entidadindividual/${id}`);
            setCharacter(data);
        } catch (err) {
            console.error("Error loading character:", err);
        } finally {
            setLoading(false);
        }
    };


    const handleSave = async () => {
        try {
            await api.patch('/bd/modificar', {
                ...character,
                tipoEntidad: 'entidadindividual'
            });
            setIsEditing(false);
            // alert("Changes saved!"); // Removed
        } catch (err) {
            console.error("Error saving:", err);
            // alert("Error saving: " + err.message); // Removed
        }
    };

    const handleDelete = async () => {
        if (!window.confirm("Move this character to the Trash Bin?")) return;
        try {
            await api.delete(`/bd/entidadindividual/${id}`);
            navigate(`/project/${projectId}`);
        } catch (err) {
            console.error(err);
            // alert("Error deleting: " + (err.response?.data?.error || err.message)); // Removed
        }
    };

    const handleChange = (field, value) => {
        setCharacter(prev => ({ ...prev, [field]: value }));
    };

    if (loading) return <div className="p-20 text-center text-slate-500 animate-pulse">Summoning entity...</div>;
    if (!character) return <div className="p-20 text-center text-red-500">Character not found in the archives.</div>;

    return (
        <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-8 gap-6">

                {/* Header */}
                <div className="flex items-start gap-6">
                    <div className="relative">
                        <Avatar
                            url={character.imagenUrl || "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=1976&auto=format&fit=crop"}
                            size="xl"
                            className="rounded-2xl border-2 border-primary shadow-[0_0_30px_rgba(99,102,242,0.3)]"
                        />
                    </div>

                    <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded border border-primary/20">{character.estado || 'ACTIVE'}</span>
                            <span className="text-xs font-bold text-slate-400 bg-surface-light px-2 py-0.5 rounded border border-white/5">{character.tipo || 'Unknown'}</span>
                        </div>
                        <h1 className="text-4xl font-bold text-white mb-2">{character.nombre} {character.apellidos}</h1>
                        <p className="text-lg text-slate-300">{character.origen || 'Traveling the void'}</p>
                    </div>

                    <div className="flex gap-2">
                        {!isEditing && (
                            <Button className="border-red-500/30 text-red-400 hover:bg-red-500/10" icon="delete" onClick={handleDelete}>
                                Delete
                            </Button>
                        )}
                        <Button variant="secondary" icon={isEditing ? 'close' : 'edit'} onClick={() => setIsEditing(!isEditing)}>
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </Button>
                        {isEditing && <Button variant="primary" icon="save" onClick={handleSave}>Save Changes</Button>}
                    </div>
                </div>

                {/* Tabs */}
                <div className="border-b border-glass-border flex gap-6">
                    {['Overview', 'Biography', 'Attributes & Stats', 'Relationships'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab.toLowerCase())}
                            className={`pb-4 px-2 text-sm font-bold border-b-2 transition-colors ${activeTab === tab.toLowerCase() ? 'text-primary border-primary' : 'text-slate-500 border-transparent hover:text-white'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-3 gap-6">
                    {/* Left Col */}
                    <div className="col-span-1 space-y-6">
                        <GlassPanel className="p-4">
                            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 flex items-center gap-2">
                                <span className="material-symbols-outlined text-sm">fingerprint</span> Identity
                            </h3>
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Name</label>
                                        <input type="text" value={character.nombre} onChange={(e) => handleChange('nombre', e.target.value)} className="w-full bg-surface-light border border-white/10 rounded px-3 py-2 text-white text-sm" readOnly={!isEditing} />
                                    </div>
                                    <div>
                                        <label className="text-xs text-slate-400 block mb-1">Surnames</label>
                                        <input type="text" value={character.apellidos || ''} onChange={(e) => handleChange('apellidos', e.target.value)} className="w-full bg-surface-light border border-white/10 rounded px-3 py-2 text-white text-sm" readOnly={!isEditing} />
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Type / Species</label>
                                    <input type="text" value={character.tipo || ''} onChange={(e) => handleChange('tipo', e.target.value)} className="w-full bg-surface-light border border-white/10 rounded px-3 py-2 text-white text-sm" readOnly={!isEditing} />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-400 block mb-1">Origin</label>
                                    <input type="text" value={character.origen || ''} onChange={(e) => handleChange('origen', e.target.value)} className="w-full bg-surface-light border border-white/10 rounded px-3 py-2 text-white text-sm" readOnly={!isEditing} />
                                </div>
                            </div>
                        </GlassPanel>


                    </div>

                    {/* Center/Right Col: Unified Narrative & Relations */}
                    <div className="col-span-2 space-y-6">
                        <GlassPanel className="p-6 relative overflow-hidden group">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    <span className="material-symbols-outlined text-sm">auto_stories</span> Narrative & Connections
                                </h3>
                                {!isEditing && <span className="text-[10px] text-slate-600 bg-white/5 px-2 py-1 rounded">Read Only</span>}
                            </div>

                            {/* Backstory Section */}
                            <div className="mb-8">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-3 opacity-80">Biography</h4>
                                <textarea
                                    value={character.descripcion || ''}
                                    onChange={(e) => handleChange('descripcion', e.target.value)}
                                    readOnly={!isEditing}
                                    className={`w-full bg-transparent border-none outline-none text-slate-300 text-sm leading-relaxed resize-none custom-scrollbar ${isEditing ? 'min-h-[150px] placeholder-white/20' : 'h-auto overflow-hidden'}`}
                                    placeholder="Write the history of this person..."
                                />

                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mt-6 mb-3 opacity-80">Behavior & Personality</h4>
                                <textarea
                                    value={character.comportamiento || ''}
                                    onChange={(e) => handleChange('comportamiento', e.target.value)}
                                    readOnly={!isEditing}
                                    className={`w-full bg-transparent border-none outline-none text-slate-300 text-sm leading-relaxed resize-none custom-scrollbar ${isEditing ? 'min-h-[100px]' : 'h-auto overflow-hidden'}`}
                                    placeholder="How does this person act?"
                                />
                            </div>

                            {/* Relations Section (Merged) */}
                            <div className="pt-6 border-t border-white/5">
                                <h4 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4 flex items-center gap-2 opacity-80">
                                    <span className="material-symbols-outlined text-sm">hub</span> Established Connections
                                </h4>

                                {character.relaciones && character.relaciones.length > 0 ? (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {character.relaciones.map((rel, i) => (
                                            <div key={i} className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5 hover:border-primary/30 transition-colors">
                                                <div className="size-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold">
                                                    {rel.entidadDestino?.nombre?.charAt(0) || '?'}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-bold text-white truncate">{rel.entidadDestino?.nombre || 'Unknown'}</div>
                                                    <div className="text-[10px] text-primary truncate">{rel.tipoRelacion || 'Connected'}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="p-6 text-center bg-white/5 rounded-xl border border-dashed border-white/10">
                                        <p className="text-xs text-slate-500 italic">No relationships recorded yet.</p>
                                    </div>
                                )}
                            </div>
                        </GlassPanel>
                    </div>
                </div>
            </div>

            {/* Right Sidebar (Split View Placeholder) */}
            <div className="w-80 border-l border-glass-border bg-surface-dark/50 hidden xl:flex flex-col">
                <div className="p-4 border-b border-glass-border flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-500">QUICK NOTES</span>
                    <button className="text-slate-400 hover:text-white"><span className="material-symbols-outlined text-sm">open_in_new</span></button>
                </div>
                <div className="p-4 flex-1">
                    <textarea className="w-full h-full bg-transparent border-none outline-none text-sm text-slate-300 placeholder-slate-600 resize-none" placeholder="Draft a quick scene or jot down notes for Elara here..."></textarea>
                </div>
                <div className="p-2 border-t border-glass-border text-right text-[10px] text-slate-600">
                    0 words
                </div>
            </div>
        </div>
    );
};

export default CharacterView;
