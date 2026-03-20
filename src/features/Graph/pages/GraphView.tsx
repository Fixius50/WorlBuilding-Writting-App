import React, { useState, useEffect } from 'react';
import GlassPanel from '../../../components/common/GlassPanel';
import Avatar from '../../../components/common/Avatar';
import Button from '../../../components/common/Button';
import api from '../../../services/api';
import { GraphNode, GraphConnection } from '../../../types/graph';


const GraphView = () => {
 const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
 const [nodes, setNodes] = useState<GraphNode[]>([]);
 const [connections, setConnections] = useState<GraphConnection[]>([]);
 const [loading, setLoading] = useState(true);
 const [draggingNodeId, setDraggingNodeId] = useState<string | null>(null);


 useEffect(() => {
 loadGraph();
 }, []);

 const loadGraph = async () => {
 setLoading(true);
 try {
 const rawRels = await api.get('/bd/relacion');

 // Extract unique nodes from relationships
 const uniqueNodes = new Map();
 rawRels.forEach((r: any) => {

 const originKey = `${r.tipoOrigen}-${r.nodoOrigenId}`;
 const destKey = `${r.tipoDestino}-${r.nodoDestinoId}`;

 if (!uniqueNodes.has(originKey)) uniqueNodes.set(originKey, { id: r.nodoOrigenId, type: r.tipoOrigen });
 if (!uniqueNodes.has(destKey)) uniqueNodes.set(destKey, { id: r.nodoDestinoId, type: r.tipoDestino });
 });

 // Fetch details for each node
 const nodesWithNames = await Promise.all(Array.from(uniqueNodes.values()).map(async (n, index) => {
 try {
 // Unified fetch: Use ID directly
 const detail = await api.get(`/world-bible/entities/${n.id}`);

 let color = 'bg-foreground/5';
 let icon = 'help';

 // Use category from detail, fallback to n.type
 const typeToCheck = (detail.categoria || n.type || '').toLowerCase();

 switch (typeToCheck) {
 case 'individual':
 case 'entidadindividual': color = 'bg-primary'; icon = 'person'; break;
 case 'group':
 case 'entidadcolectiva': color = 'bg-purple-500'; icon = 'groups'; break;
 case 'location':
 case 'zona': color = 'bg-emerald-500'; icon = 'location_on'; break;
 case 'structure':
 case 'construccion': color = 'bg-orange-500'; icon = 'apartment'; break;
 case 'timeline':
 case 'lineatiempo': color = 'bg-cyan-500'; icon = 'history'; break;
 case 'event':
 case 'eventotiempo': color = 'bg-red-500'; icon = 'event'; break;
 case 'map':
 case 'mapa': color = 'bg-amber-500'; icon = 'map'; break;
 case 'item':
 case 'objeto': color = 'bg-yellow-500'; icon = 'diamond'; break;
 default: break;
 }

 return {
 id: `${n.type}-${n.id}`,
 originalId: n.id,
 originalType: n.type,
 name: detail.nombre,
 description: detail.descripcion || '',
 type: detail.categoria || n.type, // Show real category
 icon,
 x: 400 + (Math.cos(index) * 300) + (Math.random() * 50),
 y: 400 + (Math.sin(index) * 300) + (Math.random() * 50),
 color
 };
 } catch (e) {
 console.warn(`Node not found: ${n.type} ${n.id}`);
 return null;
 }
 }));

 setNodes(nodesWithNames.filter((n): n is GraphNode => n !== null));
 setConnections(rawRels.map((r: any) => ({
 from: `${r.tipoOrigen}-${r.nodoOrigenId}`,
 to: `${r.tipoDestino}-${r.nodoDestinoId}`,
 label: r.tipoRelacion || 'Related',
 description: r.descripcion
 })));

 } catch (err) {
 console.error("Error loading graph:", err);
 } finally {
 setLoading(false);
 }
 };

 const handleMouseDown = (e: React.MouseEvent, nodeId: string) => {
 e.stopPropagation();
 setDraggingNodeId(nodeId);
 };

 const handleMouseMove = (e: React.MouseEvent) => {
 if (!draggingNodeId) return;
 
 const rect = e.currentTarget.getBoundingClientRect();
 const x = e.clientX - rect.left;
 const y = e.clientY - rect.top;

 setNodes(prev => prev.map(n => 
 n.id === draggingNodeId ? { ...n, x, y } : n
 ));
 };

 const handleMouseUp = () => {
 setDraggingNodeId(null);
 };

 const visibleNodes = nodes;
 const visibleConnections = connections;

 return (

 <div className="flex-1 flex overflow-hidden bg-background relative group/canvas">
 {/* Background Grid */}
 <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, var(--foreground) 1px, transparent 1px)', backgroundSize: '50px 50px' }}></div>

 {loading && (
 <div className="absolute inset-0 bg-background/80 z-50 flex items-center justify-center">
 <div className="text-foreground/60 font-sans font-bold uppercase tracking-widest text-lg">Cargando Red...</div>
 </div>
 )}

 {/* Left Controls */}
 <aside className="absolute left-10 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-6">
 <GlassPanel className="p-2 flex flex-col gap-2 rounded-none border-foreground/40 monolithic-panel/40 shadow-2xl">
 <GraphControl icon="near_me" active />
 <GraphControl icon="add_circle" />
 <GraphControl icon="share" />
 <div className="w-8 h-px bg-foreground/10 mx-auto my-1"></div>
 <GraphControl icon="settings_input_component" />
 </GlassPanel>

 <div className="px-4 py-2 rounded-none monolithic-panel text-[9px] font-sans font-bold tracking-widest text-foreground/60 text-center">
 ESTADO: INACTIVO
 </div>
 </aside>

 {/* Main Canvas Area */}
 <main className="flex-1 relative overflow-auto bg-transparent cursor-move"
 onMouseMove={handleMouseMove}
 onMouseUp={handleMouseUp}
 onMouseLeave={handleMouseUp}
 >
 {/* Connections */}
 <svg className="absolute top-0 left-0 w-[2000px] h-[2000px] pointer-events-none z-0">
 {visibleConnections.map((c, i) => {
 const fromNode = nodes.find(n => n.id === c.from);
 const toNode = nodes.find(n => n.id === c.to);
 if (!fromNode || !toNode) return null;

 return (
 <g key={i} className="group/line">
 <line
 x1={fromNode.x + 20} y1={fromNode.y + 20}
 x2={toNode.x + 20} y2={toNode.y + 20}
 stroke="currentColor"
 strokeWidth="1"
 className="text-foreground/10 transition-all group-hover/line:text-foreground/80 group-hover/line:stroke-width-2 cursor-pointer"
 />
 <title>{c.label}{c.description ? `: ${c.description}` : ''}</title>
 </g>
 );
 })}
 </svg>

 {/* Nodes */}
 {visibleNodes.map(node => (
 <div
 key={node.id}
 onMouseDown={(e) => handleMouseDown(e, node.id)}
 onClick={() => setSelectedNode(node)}
 className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all hover:scale-110 z-10 ${selectedNode?.id === node.id ? 'scale-125 z-20' : ''}`}
 style={{ left: node.x, top: node.y }}
 >
 <div className={`p-4 rounded-none monolithic-panel border transition-all flex items-center gap-4 shadow-xl ${selectedNode?.id === node.id ? 'border-primary ring-4 ring-primary/20' : 'border-foreground/10 hover:border-foreground/40'}`}>
 <div className={`size-10 rounded-none ${node.color} flex items-center justify-center text-foreground shadow-lg`}>
 <span className="material-symbols-outlined text-xl">
 {node.icon}
 </span>
 </div>
 <div className="pr-4">
 <h4 className="text-[11px] font-black text-foreground whitespace-nowrap uppercase tracking-widest">{node.name}</h4>
 <span className="text-[8px] font-bold text-foreground/60 uppercase tracking-[0.2em]">{node.type}</span>
 </div>
 </div>
 </div>
 ))}

 {/* Legend / Overlay */}
 <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex items-center gap-8 px-8 py-3 rounded-none monolithic-panel ">
 <LegendItem color="bg-primary" label="Characters" />
 <LegendItem color="bg-emerald-500" label="Locations" />
 <LegendItem color="bg-amber-500" label="Items" />
 </div>
 </main>

 {/* Right Sidebar Inspector */}
 <aside className={`w-80 border-l border-foreground/10 monolithic-panel/40 transition-all duration-700 overflow-hidden flex flex-col ${selectedNode ? 'opacity-100' : 'opacity-0 translate-x-10'}`}>
 {selectedNode && (
 <div className="p-8 space-y-10">
 <header className="space-y-6">
 <div className="flex justify-between items-start">
 <Avatar name={selectedNode.name} size="xl" className={`border-2 ${selectedNode.color.replace('bg-', 'border-')}/30`} />
 <button onClick={() => setSelectedNode(null)} className="p-2 rounded-none hover:bg-foreground/5 text-foreground/60 hover:text-foreground transition-colors">
 <span className="material-symbols-outlined">close</span>
 </button>
 </div>
 <div>
 <h3 className="text-2xl font-serif text-foreground tracking-tight">{selectedNode.name}</h3>
 <p className="text-[10px] font-sans font-bold uppercase tracking-widest text-foreground/60 mt-1">{selectedNode.type}</p>
 </div>
 </header>

 <div className="space-y-8">
 <section className="space-y-4">
 <h4 className="text-[10px] font-black uppercase tracking-widest text-foreground/60">Active Connections</h4>
 <div className="space-y-3">
 {connections.filter(c => c.from === selectedNode.id || c.to === selectedNode.id).map((c, i) => (
 <div key={i} className="flex justify-between items-center p-3 rounded-none monolithic-panel">
 <span className="text-[10px] font-bold text-foreground/60">
 {nodes.find(n => n.id === (c.from === selectedNode.id ? c.to : c.from))?.name || 'Unknown'}
 </span>

 <span className="px-2 py-0.5 rounded bg-primary/20 text-primary text-[8px] font-black uppercase">{c.label}</span>
 </div>
 ))}
 </div>
 </section>

 <Button variant="primary" icon="auto_stories" className="w-full py-4 rounded-none">Open Bible Entry</Button>
 </div>
 </div>
 )}
 </aside>
 </div>
 );
};

const GraphControl = ({ icon, active }: { icon: string; active?: boolean }) => (
 <button className={`size-12 rounded-none flex items-center justify-center border transition-all ${active ? 'bg-foreground/10 text-foreground border-foreground/30 shadow-inner' : 'bg-background border-foreground/5 text-foreground/60 hover:text-foreground hover:bg-foreground/5'}`}>
 <span className="material-symbols-outlined text-xl font-light">{icon}</span>
 </button>
);

const LegendItem = ({ color, label }: { color: string; label: string }) => (
 <div className="flex items-center gap-2">
 <div className={`size-2 rounded-full ${color}`}></div>
 <span className="text-[9px] font-black uppercase tracking-widest text-foreground/60">{label}</span>
 </div>
);


export default GraphView;
