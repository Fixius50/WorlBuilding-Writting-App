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
  Node,
  OnConnect,
  BackgroundVariant,
  Handle,
  Position,
  ConnectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { entityService } from '@repositories/entityService';
import { relationshipService, Relacion } from '@repositories/relationshipService';
import { Entidad } from '@domain/models/database';
import { getHierarchyType } from '@utils/constants/hierarchy_types';
import Button from '@atoms/Button';
import GlassPanel from '@atoms/GlassPanel';
import { useLanguage } from '@context/LanguageContext';

interface ZenNodeData {
  label?: string;
  tipo: string;
  icon?: string;
  descripcion?: string;
  valores?: Array<{ plantilla_nombre: string; valor: string }>;
  onNavigate?: () => void;
}

// --- Helper for Perimeter Handles ---
const renderPerimeterHandles = (type: 'source' | 'target') => {
  const sides = [
    { pos: Position.Top, count: 7, className: "!w-[14%] !h-[2px] !top-0 !translate-y-[-50%]" },
    { pos: Position.Bottom, count: 7, className: "!w-[14%] !h-[2px] !bottom-0 !translate-y-[50%]" },
    { pos: Position.Left, count: 5, className: "!h-[20%] !w-[2px] !left-0 !translate-x-[-50%]" },
    { pos: Position.Right, count: 5, className: "!h-[20%] !w-[2px] !right-0 !translate-x-[50%]" },
  ];

  return sides.flatMap(side => 
    Array.from({ length: side.count }).map((_, i) => {
      const offset = (100 / side.count) * i + (50 / side.count);
      const style = side.pos === Position.Top || side.pos === Position.Bottom 
        ? { left: `${offset}%` } 
        : { top: `${offset}%` };
      
      const id = `${type === 'source' ? 's' : 't'}-${side.pos[0]}-${i}`;
      
      return (
        <Handle
          key={id}
          id={id}
          type={type}
          position={side.pos}
          style={style}
          className={`${side.className} !bg-transparent hover:!bg-primary !border-none !rounded-none z-30 transition-all duration-100 !min-w-0 !min-h-0`}
        />
      );
    })
  );
};

// --- Custom Node Component ---
const ZenNode = React.memo(({ data, selected }: { data: ZenNodeData, selected: boolean }) => {
  const typeInfo = getHierarchyType(data.tipo);
  
  return (
    <div className={`monolithic-panel group min-w-[220px] cursor-pointer transition-all duration-500 relative ${selected ? '!border-primary shadow-[0_0_30px_rgba(var(--primary),0.2)]' : 'border-foreground/20 hover:border-foreground/40'}`}
         style={{
           backgroundColor: 'hsl(var(--background) / 0.9)',
           backdropFilter: 'blur(20px)',
           borderRadius: '0px',
           borderWidth: '1px'
         }}
         onClick={() => data.onNavigate?.()}
    >
      
      {/* Handles Multicanal (Perímetro Reactivo) */}
      {renderPerimeterHandles('target')}
      {renderPerimeterHandles('source')}

      {/* Main Content Area (con padding interno para no obstruir handles) */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          <div className="size-9 rounded-none border border-primary/20 bg-primary/5 flex items-center justify-center shrink-0">
            <span className="material-symbols-outlined text-lg text-primary">{data.icon}</span>
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] font-black uppercase tracking-[0.2em] text-primary/70 mb-0.5">{data.tipo}</div>
            <div className="text-sm font-bold text-foreground truncate tracking-tight">{data.label}</div>
          </div>
        </div>

        {/* Expanded Preview (Under the node) */}
        {selected && (
          <div className="mt-5 pt-5 border-t border-foreground/10 animate-in fade-in slide-in-from-top-4 duration-500">
             <div className="space-y-4">
               {data.descripcion && (
                 <div className="space-y-1">
                   <h5 className="text-[9px] font-black uppercase tracking-widest text-foreground/30 italic">Sinopsis</h5>
                   <p className="text-[11px] text-foreground/60 leading-relaxed font-serif italic line-clamp-6 text-justify">
                     {data.descripcion}
                   </p>
                 </div>
               )}
               
               {data.valores && data.valores.length > 0 && (
                  <div className="flex flex-wrap gap-2 pt-1">
                    {data.valores.map((v: { plantilla_nombre: string; valor: string }, i: number) => (
                      <span key={i} className="text-[8px] font-black uppercase tracking-tighter bg-primary/10 text-primary/80 px-2 py-1 border border-primary/10">
                        {v.plantilla_nombre}: {v.valor}
                      </span>
                    ))}
                  </div>
               )}
             </div>
          </div>
        )}
      </div>
    </div>
  );
});

interface GraphViewProps {
  projectId?: number;
  projectName?: string;
}

const GeneralGraphView: React.FC<GraphViewProps> = (props) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  const outletCtx = useOutletContext<{ projectId?: number; projectName?: string } | null>();
  const projectId: number | undefined = props.projectId ?? outletCtx?.projectId;
  const projectName: string | undefined = props.projectName ?? outletCtx?.projectName;

  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);
  const [entities, setEntities] = useState<Entidad[]>([]);

  // Modal para seleccionar relaciones (múltiples vínculos)
  const [multiRelModal, setMultiRelModal] = useState<{
    id: string;
    rels: Relacion[];
    active: string[];
  } | null>(null);

  const loadGraph = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [allEntities, allRels] = await Promise.all([
        entityService.getAllByProject(projectId),
        relationshipService.getByProject(projectId)
      ]);

      // Filtrar entidades que no tengan carpeta (evitar "fantasmas" huérfanos)
      const filteredEntities = allEntities.filter(ent => ent.carpeta_id !== null);
      setEntities(filteredEntities);

      // Creamos nodos con previsualización interna
      const newNodes: Node[] = filteredEntities.map((ent, idx) => {
        const typeInfo = getHierarchyType(ent.tipo);
        const angle = (idx / filteredEntities.length) * 2 * Math.PI;
        const radius = 350 + Math.random() * 50;

        return {
          id: ent.id.toString(),
          type: 'zen',
          data: { 
            label: ent.nombre, 
            tipo: ent.tipo, 
            icon: typeInfo.icon,
            descripcion: ent.descripcion,
            valores: ent.valores,
            onNavigate: () => navigate(`/local/${projectName}/bible/entity/${ent.id}`)
          },
          position: { 
            x: Math.cos(angle) * radius + 500, 
            y: Math.sin(angle) * radius + 500 
          },
          dragHandle: '.monolithic-panel',
        };
      });

      // Agrupamos relaciones entre los mismos pares de nodos (sin importar dirección para evitar solapamiento visual)
      const groupMap: Map<string, Relacion[]> = new Map();
      allRels.forEach(rel => {
        const sortedIds = [rel.origen_id, rel.destino_id].sort((a, b) => a - b);
        const key = sortedIds.join('-');
        if (!groupMap.has(key)) groupMap.set(key, []);
        groupMap.get(key)!.push(rel);
      });

      const newEdges: Edge[] = Array.from(groupMap.entries()).map(([key, rels]) => {
        const [idA, idB] = key.split('-');
        const source = rels[0].origen_id.toString();
        const target = rels[0].destino_id.toString();

        return {
          id: `e-${key}`,
          source,
          target,
          sourceHandle: rels[0].origen_handle || undefined,
          targetHandle: rels[0].destino_handle || undefined,
          label: rels.length > 1 ? `${rels.length} RELACIONES` : rels[0].tipo,
          data: { rels },
          animated: false,
          style: { stroke: 'hsl(var(--primary))', strokeWidth: 1.5, opacity: 0.6 },
          labelStyle: { fill: 'hsl(var(--foreground))', fontWeight: 900, fontSize: 8, textTransform: 'uppercase' },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: 'hsl(var(--primary))',
          },
        };
      });

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Error loading graph:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId, navigate, projectName]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const onConnect = useCallback(async (params: Connection) => {
    if (!params.source || !params.target) return;
    try {
      await relationshipService.create({
        origen_id: parseInt(params.source),
        destino_id: parseInt(params.target),
        tipo: 'RELACIONADO',
        descripcion: '',
        project_id: projectId,
        origen_handle: params.sourceHandle,
        destino_handle: params.targetHandle
      });
      await loadGraph();
    } catch (err) {
      console.error("Error creating relationship:", err);
    }
  }, [projectId]);

  const onReconnect = useCallback(async (oldEdge: Edge, newConnection: Connection) => {
    try {
      const relId = parseInt(oldEdge.id.replace('e-', '').split('-')[0]); 
      // Si el ID es compuesto por agrupación, necesitamos el ID real de la relación.
      // Pero Note: en mi agrupación actual, uso el par de IDs de nodos.
      // Para simplificar la reconexión, si hay múltiples relaciones agrupadas, 
      // moveremos todas al nuevo handle o solo la primera.
      const rels = oldEdge.data?.rels as Relacion[];
      if (rels && rels.length > 0) {
        for (const r of rels) {
          await relationshipService.update(r.id, {
            origen_id: parseInt(newConnection.source!),
            destino_id: parseInt(newConnection.target!),
            origen_handle: newConnection.sourceHandle,
            destino_handle: newConnection.targetHandle
          });
        }
      }
      await loadGraph();
    } catch (err) {
      console.error("Error reconnecting edge:", err);
    }
  }, []);

  const onEdgesDelete = useCallback(async (deletedEdges: Edge[]) => {
    for (const edge of deletedEdges) {
      const rels = edge.data?.rels as Relacion[];
      if (rels) {
        for (const r of rels) {
          await relationshipService.delete(r.id);
        }
      }
    }
    await loadGraph();
  }, []);

  const onEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    if (edge.data?.rels && (edge.data.rels as Relacion[]).length > 1) {
      setMultiRelModal({
        id: edge.id,
        rels: edge.data.rels as Relacion[],
        active: (edge.data.rels as Relacion[]).map(r => r.id.toString())
      });
    }
  }, []);

  const nodeTypes = useMemo(() => ({ zen: ZenNode }), []);

  if (loading) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-background text-foreground/60">
        <div className="size-24 rounded-full border border-foreground/10 flex items-center justify-center mb-6 animate-pulse">
          <span className="material-symbols-outlined text-5xl text-primary/40">hub</span>
        </div>
        <h3 className="text-xl font-black uppercase tracking-widest text-foreground/30 mb-2">{t('common.loading')}</h3>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-background relative overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onEdgeClick={onEdgeClick}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        connectionMode={ConnectionMode.Loose}
        style={{ width: '100%', height: '100%' }}
      >
        <style>{`
          .react-flow__edge-path {
            stroke-dasharray: 4;
            animation: dash 15s linear infinite;
          }
          @keyframes dash {
            from { stroke-dashoffset: 200; }
            to { stroke-dashoffset: 0; }
          }
          .react-flow__handle {
            transition: all 0.2s ease;
          }
        `}</style>

        <Background color="rgba(255, 255, 255, 0.05)" gap={20} variant={BackgroundVariant.Lines} />
        <Controls className="bg-background/80 border-border/50 rounded-none overflow-hidden backdrop-blur-md" />
      </ReactFlow>

      {/* Relation Multi-Selector Modal */}
      {multiRelModal && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
           <GlassPanel className="max-w-md w-full border-white/10 shadow-2xl overflow-hidden animate-in zoom-in-95 duration-300">
              <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-widest text-primary">Vínculos Múltiples</h4>
                <button onClick={() => setMultiRelModal(null)} className="text-foreground/40 hover:text-foreground">
                  <span className="material-symbols-outlined text-sm">close</span>
                </button>
              </div>
              <div className="p-6 space-y-4">
                 <p className="text-[10px] text-foreground/50 mb-4">Se han detectado {multiRelModal.rels.length} tipos de relación entre estos nodos. Selecciona los que deseas gestionar:</p>
                 <div className="space-y-2">
                    {Array.isArray(multiRelModal.rels) && multiRelModal.rels.map((rel) => (
                      <div key={rel.id} className="flex items-center justify-between p-3 bg-white/[0.03] border border-white/5 hover:border-primary/30 transition-all">
                        <span className="text-[11px] font-bold uppercase text-foreground/80 tracking-tighter">{rel.tipo}</span>
                        <div className="flex items-center gap-2">
                          <button 
                            className="text-[9px] font-black text-foreground/40 hover:text-red-400 uppercase"
                            onClick={async () => {
                              await relationshipService.delete(rel.id);
                              loadGraph();
                              setMultiRelModal(null);
                            }}
                          >
                            Eliminar
                          </button>
                        </div>
                      </div>
                    ))}
                 </div>
              </div>
              <div className="p-4 bg-white/5 flex justify-end">
                <Button size="sm" onClick={() => setMultiRelModal(null)} className="text-[9px] font-black uppercase tracking-widest px-8">Listo</Button>
              </div>
           </GlassPanel>
        </div>
      )}
    </div>
  );
};

export default GeneralGraphView;
