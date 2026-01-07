import React, { useState, useEffect } from 'react';
import api from '../../../js/services/api';
import Button from '../../components/common/Button';

// Mapping of internal types to user-friendly labels and endpoints
const ENTITY_TYPES = [
    { value: 'entidadIndividual', label: 'Character' },
    { value: 'entidadColectiva', label: 'Group' },
    { value: 'zona', label: 'Location' },
    { value: 'construccion', label: 'Building' },
    { value: 'efectos', label: 'Effect' },
    { value: 'interaccion', label: 'Interaction' },
    { value: 'lineatiempo', label: 'Timeline' },
    { value: 'eventotiempo', label: 'Event' },
    { value: 'mapa', label: 'Map' } // Assuming 'mapa' exists or will exist
];

const RelationshipManager = ({ entityId, entityType }) => {
    const [relationships, setRelationships] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);
    
    // Form State
    const [targetType, setTargetType] = useState('entidadIndividual');
    const [targetItems, setTargetItems] = useState([]);
    const [selectedTargetId, setSelectedTargetId] = useState('');
    const [relType, setRelType] = useState('');
    const [description, setDescription] = useState('');
    const [fetchingTargets, setFetchingTargets] = useState(false);

    useEffect(() => {
        if (entityId) {
            loadRelationships();
        }
    }, [entityId, entityType]);

    useEffect(() => {
        if (isAdding && targetType) {
            fetchTargets(targetType);
        }
    }, [isAdding, targetType]);

    const loadRelationships = async () => {
        setLoading(true);
        try {
            // In a real app we would filter on backend, but for Alpha we filter client-side
            const allRels = await api.get('/bd/relacion');
            const relevant = allRels.filter(r => 
                (r.nodoOrigenId === parseInt(entityId) && r.tipoOrigen === entityType) ||
                (r.nodoDestinoId === parseInt(entityId) && r.tipoDestino === entityType)
            );
            
            // Enrich with details (fetch names)
            const enriched = await Promise.all(relevant.map(async r => {
                const isOutgoing = r.nodoOrigenId === parseInt(entityId);
                const otherId = isOutgoing ? r.nodoDestinoId : r.nodoOrigenId;
                const otherType = isOutgoing ? r.tipoDestino : r.tipoOrigen;
                
                try {
                    // This creates N+1 requests, optimize later with bulk fetch or backend implementation
                    const otherEntity = await api.get(`/bd/${otherType}/${otherId}`);
                    return { ...r, otherName: otherEntity.nombre, otherType, isOutgoing };
                } catch (e) {
                    return { ...r, otherName: 'Unknown/Deleted', otherType, isOutgoing };
                }
            }));
            
            setRelationships(enriched);
        } catch (error) {
            console.error("Failed to load relationships", error);
        } finally {
            setLoading(false);
        }
    };

    const fetchTargets = async (type) => {
        setFetchingTargets(true);
        try {
            const items = await api.get(`/bd/${type}`);
            setTargetItems(items || []);
        } catch (error) {
            console.error("Failed to fetch targets", error);
            setTargetItems([]);
        } finally {
            setFetchingTargets(false);
        }
    };

    const handleSave = async () => {
        if (!selectedTargetId || !relType) return;

        try {
            const payload = {
                nodoOrigenId: parseInt(entityId),
                tipoOrigen: entityType,
                nodoDestinoId: parseInt(selectedTargetId),
                tipoDestino: targetType,
                tipoRelacion: relType,
                descripcion: description,
                tipoEntidad: 'relacion' // For BDController switch
            };

            await api.put('/bd/insertar', payload);
            setIsAdding(false);
            resetForm();
            loadRelationships();
        } catch (error) {
            console.error("Failed to save relationship", error);
            alert("Error saving relationship");
        }
    };

    const handleDelete = async (id) => {
        if(!confirm("Are you sure?")) return;
        try {
             await api.delete(`/bd/relacion/${id}`);
             loadRelationships();
        } catch (error) {
            console.error("Failed to delete", error);
        }
    }

    const resetForm = () => {
        setTargetType('entidadIndividual');
        setSelectedTargetId('');
        setRelType('');
        setDescription('');
    };

    return (
        <div className="p-6 space-y-6">
            <header className="flex justify-between items-center">
                <h3 className="text-lg font-bold text-white uppercase tracking-widest">Relationships</h3>
                <Button variant="secondary" icon="add_link" onClick={() => setIsAdding(!isAdding)}>
                    {isAdding ? 'Cancel' : 'Connect'}
                </Button>
            </header>

            {isAdding && (
                <div className="p-4 rounded-2xl bg-white/5 border border-white/10 space-y-4 animate-in fade-in slide-in-from-top-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Target Type</label>
                            <select 
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-sm text-white outline-none focus:border-primary"
                                value={targetType}
                                onChange={e => setTargetType(e.target.value)}
                            >
                                {ENTITY_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Target Entity</label>
                            <select 
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-sm text-white outline-none focus:border-primary"
                                value={selectedTargetId}
                                onChange={e => setSelectedTargetId(e.target.value)}
                                disabled={fetchingTargets}
                            >
                                <option value="">Select Target...</option>
                                {targetItems.map(item => (
                                    <option key={item.id} value={item.id}>{item.nombre}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Relationship Type</label>
                        <input 
                            type="text" 
                            placeholder="e.g. Father of, Located in, Enemy of..." 
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-sm text-white outline-none focus:border-primary"
                            value={relType}
                            onChange={e => setRelType(e.target.value)}
                        />
                    </div>

                    <div className="space-y-1">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Description (The Why)</label>
                        <textarea 
                            placeholder="Explain the nature of this connection..." 
                            className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-sm text-white outline-none focus:border-primary h-20 resize-none"
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button variant="primary" icon="save" onClick={handleSave} disabled={!selectedTargetId || !relType}>Save Connection</Button>
                    </div>
                </div>
            )}

            <div className="space-y-3">
                {loading ? (
                    <div className="text-center text-slate-500 py-8">Scanning connections...</div>
                ) : relationships.length === 0 ? (
                    <div className="text-center text-slate-500 py-8 italic border border-dashed border-white/10 rounded-2xl">No connections established</div>
                ) : (
                    relationships.map((rel, i) => (
                        <div key={rel.id || i} className="group relative p-4 rounded-2xl bg-surface-dark border border-white/5 hover:border-primary/50 transition-all flex items-start gap-4">
                            <div className="mt-1">
                                <span className="material-symbols-outlined text-slate-500">
                                    {rel.isOutgoing ? 'arrow_outward' : 'arrow_inward'}
                                </span>
                            </div>
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{rel.isOutgoing ? 'To:' : 'From:'}</span>
                                    <span className="text-sm font-bold text-white">{rel.otherName}</span>
                                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-slate-400 font-bold uppercase tracking-wider">{rel.otherType}</span>
                                </div>
                                <div className="text-primary text-xs font-black uppercase tracking-widest mb-2">{rel.tipoRelacion}</div>
                                {rel.descripcion && (
                                    <p className="text-xs text-slate-400 leading-relaxed bg-black/20 p-2 rounded-lg border border-white/5">
                                        "{rel.descripcion}"
                                    </p>
                                )}
                            </div>
                            <button 
                                onClick={() => handleDelete(rel.id)}
                                className="opacity-0 group-hover:opacity-100 p-2 text-slate-600 hover:text-red-400 transition-all"
                            >
                                <span className="material-symbols-outlined text-sm">delete</span>
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default RelationshipManager;
