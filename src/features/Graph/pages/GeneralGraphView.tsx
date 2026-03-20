import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
 ReactFlow, 
 Background, 
 Controls, 
 MiniMap, 
 Panel,
 useNodesState,
 useEdgesState,
 addEdge,
 Connection,
 Edge,
 MarkerType,
 Node
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useOutletContext } from 'react-router-dom';
import { entityService } from '../../../database/entityService';
import { relationshipService, Relacion } from '../../../database/relationshipService';
import { Entidad } from '../../../database/types';
import Button from '../../../components/common/Button';
import GlassPanel from '../../../components/common/GlassPanel';
import { useLanguage } from '../../../context/LanguageContext';

const GeneralGraphView = () => {
 const { t } = useLanguage();
 const { projectId } = useOutletContext<{ projectId: number }>();
 const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
 const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
 const [loading, setLoading] = useState(true);
 const [entities, setEntities] = useState<Entidad[]>([]);

 const loadGraph = useCallback(async () => {
 if (!projectId) return;
 setLoading(true);
 try {
 const [allEntities, allRels] = await Promise.all([
 entityService.getAllByProject(projectId),
 relationshipService.getByProject(projectId)
 ]);

 setEntities(allEntities);

 // Create nodes from entities
 const newNodes: Node[] = allEntities.map((ent, idx) => ({
 id: ent.id.toString(),
 data: { label: ent.nombre, tipo: ent.tipo },
 position: { x: Math.random() * 500, y: Math.random() * 500 },
 style: {
 background: 'rgba(30, 41, 59, 0.7)',
 color: '#fff',
 border: '1px solid rgba(255, 255, 255, 0.1)',
 borderRadius: '12px',
 padding: '10px',
 fontSize: '12px',
 fontWeight: 'bold',
 backdropFilter: 'blur(10px)',
 width: 150,
 textAlign: 'center'
 }
 }));

 // Create edges from relationships
 const newEdges: Edge[] = allRels.map(rel => ({
 id: `e-${rel.id}`,
 source: rel.origen_id.toString(),
 target: rel.destino_id.toString(),
 label: rel.tipo,
 animated: true,
 style: { stroke: '#00E5FF', strokeWidth: 2 },
 labelStyle: { fill: '#94a3b8', fontWeight: 700, fontSize: 10 },
 markerEnd: {
 type: MarkerType.ArrowClosed,
 color: '#00E5FF',
 },
 }));

 setNodes(newNodes);
 setEdges(newEdges);
 } catch (error) {
 console.error('Error loading graph:', error);
 } finally {
 setLoading(false);
 }
 }, [projectId, setNodes, setEdges]);

 useEffect(() => {
 loadGraph();
 }, [loadGraph]);

 const onConnect = useCallback(
 (params: Connection) => setEdges((eds) => addEdge(params, eds)),
 [setEdges]
 );

 const nodeTypes = useMemo(() => ({}), []); // For future custom node components

 if (loading) {
 return (
 <div className="w-full h-full flex flex-col items-center justify-center bg-[#050508] text-foreground/60">
 <div className="size-24 rounded-full border border-foreground/10 flex items-center justify-center mb-6 animate-pulse">
 <span className="material-symbols-outlined text-5xl">hub</span>
 </div>
 <h3 className="text-xl font-bold text-foreground/50 mb-2">{t('common.loading')}...</h3>
 </div>
 );
 }

 return (
 <div className="w-full h-full bg-[#050508] relative">
 <ReactFlow
 nodes={nodes}
 edges={edges}
 onNodesChange={onNodesChange}
 onEdgesChange={onEdgesChange}
 onConnect={onConnect}
 nodeTypes={nodeTypes}
 fitView
 colorMode="dark"
 >
 <Background color="#1e293b" gap={20} />
 <Controls />
 <MiniMap 
 nodeColor="#00E5FF" 
 maskColor="rgba(0, 0, 0, 0.5)"
 className="monolithic-panel border border-foreground/40 rounded-none"
 />
 
 <Panel position="top-right" className="p-4">
 <GlassPanel className="p-4 flex flex-col gap-3 min-w-[200px]">
 <h3 className="text-xs font-black uppercase tracking-widest text-primary">Relaciones del Proyecto</h3>
 <p className="text-[10px] text-foreground/60">
 Visualización dinámica de la red de {entities.length} entidades.
 </p>
 <Button 
 variant="secondary" 
 size="sm" 
 icon="refresh" 
 onClick={loadGraph}
 className="w-full text-[10px]"
 >
 RECARGAR RED
 </Button>
 </GlassPanel>
 </Panel>

 <Panel position="bottom-center" className="p-4 monolithic-panel rounded-full px-6 py-2 mb-8">
 <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest flex items-center gap-2">
 <span className="size-2 bg-primary rounded-full animate-pulse"></span>
 Motor de Grafos Premium Activo
 </p>
 </Panel>
 </ReactFlow>
 </div>
 );
};

export default GeneralGraphView;
