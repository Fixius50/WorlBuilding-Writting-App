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
  BackgroundVariant
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { entityService } from '../../../database/entityService';
import { relationshipService, Relacion } from '../../../database/relationshipService';
import { Entidad } from '../../../database/types';
import { getHierarchyType } from '../../../utils/constants/hierarchy_types';
import Button from '../../../components/common/Button';
import GlassPanel from '../../../components/common/GlassPanel';
import { useLanguage } from '../../../context/LanguageContext';

const GeneralGraphView = () => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const { projectId, projectName } = useOutletContext<{ projectId: number, projectName: string }>();
  
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
      const newNodes: Node[] = allEntities.map((ent, idx) => {
        const typeInfo = getHierarchyType(ent.tipo);
        const angle = (idx / allEntities.length) * 2 * Math.PI;
        const radius = 300 + Math.random() * 100;

        return {
          id: ent.id.toString(),
          data: { label: ent.nombre, tipo: ent.tipo, icon: typeInfo.icon },
          position: { 
            x: Math.cos(angle) * radius + 500, 
            y: Math.sin(angle) * radius + 500 
          },
          style: {
            background: 'rgba(15, 15, 20, 0.8)',
            color: '#fff',
            border: `1px solid ${typeInfo.color.replace('text-', 'rgba(')}${typeInfo.color.includes('purple') ? '168, 85, 247, 0.3)' : '99, 102, 241, 0.3)'}`,
            borderRadius: '0px',
            padding: '12px',
            fontSize: '11px',
            fontWeight: 'bold',
            backdropFilter: 'blur(12px)',
            width: 160,
            textAlign: 'left',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
          }
        };
      });

      // Create edges from relationships
      const newEdges: Edge[] = allRels.map(rel => ({
        id: `e-${rel.id}`,
        source: rel.origen_id.toString(),
        target: rel.destino_id.toString(),
        label: rel.tipo,
        animated: false,
        style: { stroke: '#6366f1', strokeWidth: 1.5, opacity: 0.6 },
        labelStyle: { fill: '#94a3b8', fontWeight: 800, fontSize: 9, textTransform: 'uppercase' as any },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#6366f1',
        },
      }));

      setNodes(newNodes);
      setEdges(newEdges);
    } catch (error) {
      console.error('Error loading graph:', error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  const onConnect: OnConnect = useCallback(
    async (params) => {
      if (!params.source || !params.target) return;
      
      try {
        const newRel = await relationshipService.create({
          origen_id: parseInt(params.source),
          destino_id: parseInt(params.target),
          tipo: 'Relacionado',
          descripcion: '',
          project_id: projectId
        });

        const edge: Edge = {
          ...params,
          id: `e-${newRel.id}`,
          label: 'Relacionado',
          style: { stroke: '#6366f1', strokeWidth: 1.5 },
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' }
        };

        setEdges((eds) => addEdge(edge, eds));
      } catch (err) {
        console.error("Failed to create relationship", err);
      }
    },
    [projectId, setEdges]
  );

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    // Navigate to entity view
    const ent = entities.find(e => e.id.toString() === node.id);
    if (ent) {
      navigate(`/local/${projectName}/bible/entity/${ent.id}`);
    }
  }, [entities, navigate, projectName]);

  const nodeTypes = useMemo(() => ({}), []);

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
        onNodeClick={onNodeClick}
        nodeTypes={nodeTypes}
        fitView
        colorMode="dark"
        defaultEdgeOptions={{ animated: false }}
        style={{ width: '100%', height: '100%' }}
      >
        <style>{`
          .react-flow__node {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
          }
          .react-flow__node:hover {
            transform: scale(1.05) !important;
            z-index: 100 !important;
          }
          .react-flow__edge-path {
            stroke-dasharray: 5;
            animation: dash 10s linear infinite;
          }
          @keyframes dash {
            from { stroke-dashoffset: 100; }
            to { stroke-dashoffset: 0; }
          }
        `}</style>
        <Background color="#1e1e26" gap={25} variant={BackgroundVariant.Dots} />
        <Controls />
        <MiniMap 
          nodeColor={(n) => {
            const ent = entities.find(e => e.id.toString() === n.id);
            const typeInfo = getHierarchyType(ent?.tipo || '');
            return typeInfo.color.includes('purple') ? '#a855f7' : '#6366f1';
          }}
          maskColor="rgba(0, 0, 0, 0.7)"
          className="monolithic-panel border border-foreground/20 rounded-none bg-black/40 backdrop-blur-md"
        />
        
        <Panel position="top-right" className="p-4">
          <GlassPanel className="p-5 flex flex-col gap-4 min-w-[240px] border-foreground/10">
            <div className="flex items-center gap-3">
              <span className="material-symbols-outlined text-primary">hub</span>
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground">Red Neuronal</h3>
            </div>
            <div className="h-px bg-foreground/10" />
            <p className="text-[10px] text-foreground/50 leading-relaxed">
              Malla de interconexión activa. Arrastra desde los conectores para forjar nuevos vínculos entre {entities.length} entidades.
            </p>
            <div className="flex flex-col gap-2">
              <Button variant="secondary" size="sm" icon="refresh" onClick={loadGraph} className="w-full text-[9px] font-black uppercase tracking-tighter">
                RE-SINCRONIZAR NODO CENTRAL
              </Button>
            </div>
          </GlassPanel>
        </Panel>

        <Panel position="bottom-center" className="p-4 bg-black/40 backdrop-blur-xl border border-foreground/10 px-8 py-3 mb-8 shadow-2xl">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="size-2 bg-indigo-500 rounded-none shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">Vínculos Forjados</span>
            </div>
            <div className="w-px h-3 bg-foreground/10"></div>
            <p className="text-[10px] font-bold text-foreground/60 uppercase tracking-widest flex items-center gap-2">
              <span className="size-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
              Estado: Sincronizado con SQLite
            </p>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

export default GeneralGraphView;
