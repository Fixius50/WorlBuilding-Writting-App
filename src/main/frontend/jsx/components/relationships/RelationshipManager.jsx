import React, { useState, useEffect } from 'react';
import api from '../../../js/services/api';
import Button from '../../components/common/Button';

// Mapping of internal types to user-friendly labels and endpoints
// Mapping of internal types to user-friendly labels (Matches 'Categoria' in EntidadGenerica)
const ENTITY_TYPES = [
    { value: 'All', label: 'Todo' },
    { value: 'Individual', label: 'Personaje' },
    { value: 'Group', label: 'Grupo/Facción' },
    { value: 'Location', label: 'Lugar' },
    { value: 'Item', label: 'Objeto' },
    { value: 'Event', label: 'Evento' },
    { value: 'Timeline', label: 'Línea de Tiempo' },
    { value: 'Map', label: 'Mapa' },
    { value: 'Structure', label: 'Construcción' },
    { value: 'Creature', label: 'Criatura' },
    { value: 'Plant', label: 'Flora' }
];

const RelationshipManager = ({ entityId, entityType }) => {
    console.log(">>> RELATIONSHIP MANAGER V2 LOADED");
    const [relationships, setRelationships] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isAdding, setIsAdding] = useState(false);

    // Form State
    const [targetType, setTargetType] = useState('All');
    const [targetItems, setTargetItems] = useState([]);
    const [targetSearch, setTargetSearch] = useState(''); // ADDED
    const [selectedTargetId, setSelectedTargetId] = useState('');
    const [relType, setRelType] = useState('');
    const [description, setDescription] = useState('');
    const [fetchingTargets, setFetchingTargets] = useState(false);

    useEffect(() => {
        if (entityId) {
            console.log(`[RelationshipManager] Loading for ID: ${entityId} Type: ${entityType}`);
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
            console.log(`[RelationshipManager] Total relationships in DB: ${allRels.length}`);

            const relevant = allRels.filter(r => {
                const sourceMatch = r.nodoOrigenId === parseInt(entityId);
                const targetMatch = r.nodoDestinoId === parseInt(entityId);

                // Helper to normalize types for comparison
                const normalizeType = (t) => {
                    if (!t) return '';
                    const lower = t.toLowerCase();
                    if (lower === 'generic' || lower === 'genericentity') return 'generic';
                    return lower;
                };

                const currentType = normalizeType(entityType);
                const rSourceType = normalizeType(r.tipoOrigen);
                const rTargetType = normalizeType(r.tipoDestino);

                // Debug matching
                if (sourceMatch || targetMatch) {
                    console.log(`[RelationshipManager] Potential match:`, r);
                    console.log(`   SourceMatch: ${sourceMatch} (Type: ${rSourceType} vs ${currentType})`);
                    console.log(`   TargetMatch: ${targetMatch} (Type: ${rTargetType} vs ${currentType})`);
                }

                return (sourceMatch && (rSourceType === currentType || rSourceType === 'generic')) ||
                    (targetMatch && (rTargetType === currentType || rTargetType === 'generic'));
            });
            console.log(`[RelationshipManager] Relevant relationships found: ${relevant.length}`);

            // Enrich with details (fetch names)
            const enriched = await Promise.all(relevant.map(async r => {
                const isOutgoing = r.nodoOrigenId === parseInt(entityId);
                const otherId = isOutgoing ? r.nodoDestinoId : r.nodoOrigenId;
                // const otherType = isOutgoing ? r.tipoDestino : r.tipoOrigen;

                // Unified fetch: Everything is an Entity now
                const otherEntity = await api.get(`/world-bible/entities/${otherId}`);
                if (!otherEntity) throw new Error(`Entity ${otherId} not found`);
                return { ...r, otherName: otherEntity.nombre, otherType: otherEntity.categoria || 'Entity', isOutgoing };
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
            // Fetch ALL entities and filter logic client-side
            const all = await api.get('/world-bible/entities');

            // Filter by category OR type
            // If type is "All" return all entities
            // Match against 'categoria' (e.g. Individual) or 'tipoEspecial' (e.g. map)

            const filtered = type === 'All' ? all : all.filter(e => {
                // Determine category of entity
                const cat = e.categoria || 'Generic';
                // loose match because case might differ
                return cat.toLowerCase() === type.toLowerCase() ||
                    (e.tipoEspecial && e.tipoEspecial.toLowerCase() === type.toLowerCase());
            });

            setTargetItems(filtered || []);
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
                tipoDestino: 'GenericEntity', // Uniform type for lookups
                tipoRelacion: relType,
                descripcion: description,
                // Metadata to store real category if needed
                metadata: JSON.stringify({ originalCategory: targetType }),
                tipoEntidad: 'relacion' // For BDController switch
            };

            await api.put('/bd/insertar', payload);
            setIsAdding(false);
            resetForm();
            loadRelationships();

            // Emit event to notify graph to reload
            window.dispatchEvent(new CustomEvent('relationships-update'));
        } catch (error) {
            console.error("Failed to save relationship", error);
            alert("Error saving relationship");
        }
    };

    const handleDelete = async (id) => {
        if (!confirm("Are you sure?")) return;
        try {
            await api.delete(`/bd/relacion/${id}`);
            loadRelationships();

            // Emit event to notify graph to reload
            window.dispatchEvent(new CustomEvent('relationships-update'));
        } catch (error) {
            console.error("Failed to delete", error);
        }
    }

    const resetForm = () => {
        setTargetType('All');
        setTargetSearch('');
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Target Type</label>
                            <select
                                className="w-full bg-black/40 border border-white/10 rounded-xl p-2 text-sm text-white outline-none focus:border-primary"
                                value={targetType}
                                onChange={e => {
                                    setTargetType(e.target.value);
                                    setTargetSearch('');
                                    setSelectedTargetId('');
                                }}
                            >
                                {ENTITY_TYPES.map(t => <option key={t.value} value={t.value} className="bg-[#1a1a20] text-white">{t.label}</option>)}
                            </select>
                        </div>
                        <div className="space-y-1">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Search & Select Target</label>
                            <div className="relative">
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/10 rounded-xl p-2 pl-8 text-sm text-white outline-none focus:border-primary"
                                    placeholder="Type to search..."
                                    value={targetSearch}
                                    onChange={e => setTargetSearch(e.target.value)}
                                />
                                <span className="material-symbols-outlined absolute left-2 top-2 text-slate-500 text-sm">search</span>

                                {targetSearch && !selectedTargetId && (
                                    <div className="absolute top-full left-0 right-0 mt-1 bg-surface-dark border border-white/10 rounded-xl shadow-2xl z-50 max-h-40 overflow-y-auto custom-scrollbar">
                                        {targetItems.filter(item => item.nombre.toLowerCase().includes(targetSearch.toLowerCase())).length === 0 ? (
                                            <div className="p-3 text-[10px] text-slate-500 text-center italic">No results found</div>
                                        ) : (
                                            targetItems.filter(item => item.nombre.toLowerCase().includes(targetSearch.toLowerCase())).map(item => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => {
                                                        setSelectedTargetId(item.id);
                                                        setTargetSearch(item.nombre);
                                                    }}
                                                    className="p-2 hover:bg-primary/10 hover:text-primary cursor-pointer text-xs text-slate-300 border-b border-white/5 last:border-0"
                                                >
                                                    {item.nombre}
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {selectedTargetId && (
                                    <button
                                        onClick={() => { setSelectedTargetId(''); setTargetSearch(''); }}
                                        className="absolute right-2 top-2 text-slate-500 hover:text-primary transition-colors"
                                    >
                                        <span className="material-symbols-outlined text-sm">close</span>
                                    </button>
                                )}
                            </div>
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
