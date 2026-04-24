import React, { useState, useEffect } from 'react';
import GlassPanel from '@atoms/GlassPanel';
import Button from '@atoms/Button';
import RelationshipManager from '@features/Relationships/components/RelationshipManager';
import { entityService } from '@repositories/entityService';
import { folderService } from '@repositories/folderService';

const InGraphNodeWindow = ({ node, elements, onClose, onCenter, onLock, isPinned }: { node: any, elements: any[], onClose?: () => void, onCenter?: () => void, onLock?: () => void, isPinned?: boolean }) => {
 const [activeTab, setActiveTab] = useState('ESENCIA'); // ESENCIA, RELACIONES, CRÓNICA
 const [details, setDetails] = useState<unknown>(null);
 const [loading, setLoading] = useState(false);

 // Fetch full data if not present
 useEffect(() => {
 if (!node?.id) return;

 const fetchDetails = async () => {
 try {
 setLoading(true);
 const response = await entityService.getById(Number(node.id));
 if (response && response.contenido_json) {
    try {
      const parsed = JSON.parse(response.contenido_json);
      setDetails({ ...response, attributes: parsed });
    } catch (e) {
      setDetails(response);
    }
  } else {
    setDetails(response);
  }
 } catch (err) {
 console.error(`Error fetching details for node ${node.id}:`, err);
 } finally {
 setLoading(false);
 }
 };

 // If it's a stub (not isFull) or we don't have details yet, fetch.
 if (!node.isFull || node.isStub) {
 fetchDetails();
 }
 }, [node?.id]);

 if (!node) return null;

 const data = details || node; // Use fetched details if available

 const categoryColor = node.category === 'Individual' ? 'border-indigo-500/50' :
 node.category === 'Location' ? 'border-emerald-500/50' :
 'border-purple-500/50';

 return (
 <div className={`w-[260px] flex flex-col shadow-2xl border-t-4 ${categoryColor} bg-foreground/5 border border-foreground/40 pointer-events-none overflow-hidden transition-all duration-300`}>
 {/* Header - Transparent to clicks for drag passthrough */}
 <div className={`p-3 border-b border-foreground/10 flex items-center justify-between pointer-events-none text-drag-handle bg-foreground/5 select-none`}>
 <div className="flex items-center gap-2 overflow-hidden pointer-events-none">
 <span className={`material-symbols-outlined text-[14px] ${categoryColor.replace('border-', 'text-')}`}>
 {node.category === 'Individual' ? 'person' : node.category === 'Location' ? 'location_on' : 'groups'}
 </span>
 <h3 className={`text-[10px] font-serif font-black truncate uppercase tracking-tight text-foreground`}>{node.label || node.nombre}</h3>
 </div>
 <div className="flex gap-1">
 <button onClick={onCenter} className="p-1 hover:bg-foreground/10 rounded-none text-foreground/60 transition-colors pointer-events-auto" title="Centrar Arcano">
 <span className="material-symbols-outlined text-xs">center_focus_strong</span>
 </button>
 </div>
 </div>

 {/* Navigation Tabs - Interactive */}
 <div className="flex bg-foreground/5 text-[8px] font-black uppercase tracking-widest border-b border-foreground/10 pointer-events-auto">
 {['ESENCIA', 'RELACIONES', 'CRÓNICA'].map(tab => (
 <button
 key={tab}
 onClick={() => setActiveTab(tab)}
 className={`flex-1 py-2.5 transition-all ${activeTab === tab ? 'bg-foreground/5 text-primary border-b border-primary' : 'text-foreground/60 hover:text-foreground/60'}`}
 >
 {tab}
 </button>
 ))}
 </div>

 {/* Content Area - Narrower and Taller */}
 <div className="p-4 min-h-[300px] max-h-[400px] overflow-y-auto custom-scrollbar bg-foreground/5 pointer-events-auto">
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
 <span className="text-[8px] font-black uppercase text-foreground/60 tracking-widest">Resumen Etéreo</span>
 <p className="text-xs text-foreground/60 leading-relaxed italic border-l border-foreground/40 pl-3">
 {data.description || data.summary || "Ningún cronista ha registrado detalles sobre esta entidad."}
 </p>
 </div>

 {data.attributes && Object.entries(data.attributes).length > 0 && (
 <div className="grid grid-cols-1 gap-1.5 pt-2">
 {Object.entries(data.attributes)
 .filter(([key, value]) => {
 const k = key.toLowerCase();
 // Filter out technical metadata
 return !k.includes('id') &&
 !k.includes('url') &&
 !k.includes('image') &&
 !k.includes('layers') &&
 !k.includes('snapshot') &&
 !k.includes('file') &&
 typeof value !== 'object'; // Extra safety for non-lore technical objects
 })
 .map(([key, value]) => {
 const displayValue = String(value);

 return (
 <div key={key} className="flex justify-between items-center p-2 rounded bg-white/[0.02] border border-foreground/10">
 <span className="text-[8px] font-bold text-foreground/60 uppercase">{key.replace(/_/g, ' ')}</span>
 <span className="text-[10px] text-foreground/60 truncate ml-4 font-medium" title={displayValue}>
 {displayValue}
 </span>
 </div>
 );
 })}
 </div>
 )}
 </div>
 )}

 {activeTab === 'RELACIONES' && (
 <div className="space-y-2 animate-in fade-in slide-in-from-top-1 duration-300">
 {(() => {
 const nodeIdStr = String(node.id);
 const nodeRelations = elements.filter(e => e.group === 'edges' && (String(e.data.source) === nodeIdStr || String(e.data.target) === nodeIdStr));

 if (nodeRelations.length === 0) return <p className="text-[10px] text-foreground/60 italic py-8 text-center">Sin hilos de causalidad activos.</p>;

 return nodeRelations.map(edge => {
 const otherId = String(edge.data.source) === nodeIdStr ? edge.data.target : edge.data.source;
 const otherNode = elements.find(n => String(n.data?.id) === String(otherId));
 return (
 <div key={edge.data.id} className="flex items-center justify-between p-2.5 rounded bg-white/[0.02] border border-foreground/10 group/rel">
 <div className="flex items-center gap-2 overflow-hidden">
 <span className="size-1 rounded-full bg-primary/40 group-hover/rel:bg-primary transition-colors"></span>
 <span className="text-[10px] text-foreground/60 font-medium truncate">{otherNode?.data?.label || otherNode?.label || 'Incógnito'}</span>
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
 <div className="flex flex-col items-center justify-center py-12 opacity-30 text-foreground/60">
 <span className="material-symbols-outlined text-3xl mb-2">history_edu</span>
 <span className="text-[8px] font-black uppercase tracking-widest">Cronología sellada</span>
 </div>
 </div>
 )}
 </>
 )}
 </div>

 {/* Footer Actions */}
 <div className="p-2 bg-background/30 border-t border-foreground/10 flex gap-2 pointer-events-auto">
 <button className="flex-1 py-1.5 bg-primary/10 hover:bg-primary/20 text-primary rounded text-[9px] font-black uppercase tracking-widest transition-all">
 Abrir en Archivador
 </button>
 </div>
 </div>
 );
};

export default React.memo(InGraphNodeWindow);
