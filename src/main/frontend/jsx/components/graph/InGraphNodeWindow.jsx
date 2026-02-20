import React, { useState, useEffect } from 'react';
import GlassPanel from '../common/GlassPanel';
import RelationshipManager from '../relationships/RelationshipManager';
import api from '../../../js/services/api';

const InGraphNodeWindow = ({ node, elements, onClose, onCenter, onLock, isPinned }) => {
    const [activeTab, setActiveTab] = useState('ESENCIA'); // ESENCIA, RELACIONES, CRÓNICA
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(false);

    // Fetch full data if not present
    useEffect(() => {
        if (!node?.id) return;

        const fetchDetails = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/world-bible/entities/${node.id}`);
                setDetails(response);
            } catch (err) {
                console.error(`Error fetching details for node ${node.id}:`, err);
            } finally {
                setLoading(false);
            }
        };

        if (!node.isFull) {
            fetchDetails();
        }
    }, [node?.id]);

    if (!node) return null;

    const data = details || node; // Use fetched details if available

    const categoryColor = isPinned ? 'border-primary' :
        node.category === 'Individual' ? 'border-indigo-500/50' :
            node.category === 'Location' ? 'border-emerald-500/50' :
                'border-purple-500/50';

    return (
        <GlassPanel className={`w-[260px] flex flex-col shadow-2xl border-t-4 ${categoryColor} pointer-events-none overflow-hidden transition-all duration-300`}>
            {/* Header - Transparent to clicks for drag passthrough */}
            <div className={`p-3 border-b border-white/5 flex items-center justify-between pointer-events-none text-drag-handle glass-panel-header select-none ${isPinned ? 'bg-primary/10' : 'bg-white/[0.03]'}`}>
                <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
                    <span className={`material-symbols-outlined text-[14px] ${isPinned ? 'text-primary' : 'text-slate-400'}`}>
                        {isPinned ? 'keep' : (node.category === 'Individual' ? 'person' : node.category === 'Location' ? 'location_on' : 'groups')}
                    </span>
                    <h3 className="text-[10px] font-serif font-black text-white truncate uppercase tracking-tight">{node.label || node.nombre}</h3>
                </div>
                <div className="flex gap-1">
                    <button onClick={onLock} className={`p-1 rounded-md transition-colors pointer-events-auto ${isPinned ? 'text-primary bg-primary/20' : 'text-slate-500 hover:bg-white/10'}`} title={isPinned ? "Desanclar" : "Fijar posición"}>
                        <span className="material-symbols-outlined text-xs">{isPinned ? 'lock' : 'lock_open'}</span>
                    </button>
                    <button onClick={onCenter} className="p-1 hover:bg-white/10 rounded-md text-slate-400 transition-colors pointer-events-auto">
                        <span className="material-symbols-outlined text-xs">center_focus_strong</span>
                    </button>
                </div>
            </div>

            {/* Navigation Tabs - Interactive */}
            <div className="flex bg-black/40 text-[8px] font-black uppercase tracking-widest border-b border-white/5 pointer-events-auto">
                {['ESENCIA', 'RELACIONES', 'CRÓNICA'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`flex-1 py-2.5 transition-all ${activeTab === tab ? 'bg-white/5 text-primary border-b border-primary' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Content Area - Narrower and Taller */}
            <div className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar bg-black/10 pointer-events-auto">
                {loading && !details ? (
                    <div className="flex flex-col items-center justify-center h-40 opacity-20">
                        <div className="size-4 border-2 border-primary border-t-transparent animate-spin rounded-full mb-2"></div>
                        <span className="text-[8px] uppercase tracking-widest font-bold">Invocando datos...</span>
                    </div>
                ) : (
                    <>
                        {activeTab === 'ESENCIA' && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-1 duration-300">
                                <div className="space-y-1">
                                    <span className="text-[8px] font-black uppercase text-slate-600 tracking-widest">Resumen Etéreo</span>
                                    <p className="text-xs text-slate-400 leading-relaxed italic border-l border-white/10 pl-3">
                                        {data.description || data.summary || "Ningún cronista ha registrado detalles sobre esta entidad."}
                                    </p>
                                </div>

                                {data.attributes && Object.entries(data.attributes).length > 0 && (
                                    <div className="grid grid-cols-1 gap-1.5 pt-2">
                                        {Object.entries(data.attributes).map(([key, value]) => (
                                            <div key={key} className="flex justify-between items-center p-2 rounded bg-white/[0.02] border border-white/5">
                                                <span className="text-[8px] font-bold text-slate-500 uppercase">{key.replace(/_/g, ' ')}</span>
                                                <span className="text-[10px] text-slate-300 truncate ml-4 font-medium">{String(value)}</span>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'RELACIONES' && (
                            <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
                                {(() => {
                                    const nodeIdStr = String(node.id);
                                    const nodeRelations = elements.filter(e => e.group === 'edges' && (String(e.data.source) === nodeIdStr || String(e.data.target) === nodeIdStr));

                                    if (nodeRelations.length === 0) return <p className="text-[10px] text-slate-600 italic py-8 text-center">Sin hilos de causalidad activos.</p>;

                                    return nodeRelations.map(edge => {
                                        const otherId = String(edge.data.source) === nodeIdStr ? edge.data.target : edge.data.source;
                                        const otherNode = elements.find(n => String(n.data?.id) === String(otherId));
                                        return (
                                            <div key={edge.data.id} className="flex items-center justify-between p-2.5 rounded bg-white/[0.02] border border-white/5 group/rel">
                                                <div className="flex items-center gap-2 overflow-hidden">
                                                    <span className="size-1 rounded-full bg-primary/40 group-hover/rel:bg-primary transition-colors"></span>
                                                    <span className="text-[10px] text-slate-300 font-medium truncate">{otherNode?.data?.label || otherNode?.label || 'Incógnito'}</span>
                                                </div>
                                                <span className="px-1.5 py-0.5 rounded bg-primary/10 text-primary text-[7px] font-black uppercase tracking-tighter shrink-0">
                                                    {edge.data.label || 'Vínculo'}
                                                </span>
                                            </div>
                                        );
                                    });
                                })()}
                            </div>
                        )}

                        {activeTab === 'CRÓNICA' && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-1 duration-300">
                                <div className="flex flex-col items-center justify-center py-12 opacity-30 text-slate-500">
                                    <span className="material-symbols-outlined text-3xl mb-2">history_edu</span>
                                    <span className="text-[8px] font-black uppercase tracking-widest">Cronología sellada</span>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-2 bg-black/30 border-t border-white/5 flex gap-2 pointer-events-auto">
                <button className="flex-1 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded text-[9px] font-black uppercase tracking-widest transition-all">
                    Abrir en Archivador
                </button>
            </div>
        </GlassPanel>
    );
};

export default InGraphNodeWindow;
