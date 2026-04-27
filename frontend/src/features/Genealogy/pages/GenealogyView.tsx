import React, { useState, useEffect, useCallback } from 'react';
import { 
  ReactFlow, 
  Background, 
  Controls, 
  MiniMap, 
  useNodesState, 
  useEdgesState, 
  Node, 
  Edge,
  MarkerType,
  Position,
  ConnectionMode,
  BackgroundVariant,
  Panel
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import dagre from 'dagre';
import { useOutletContext } from 'react-router-dom';
import { entityService } from '@repositories/entityService';
import { relationshipService } from '@repositories/relationshipService';
import { Entidad } from '@domain/models/database';
import GlassPanel from '@atoms/GlassPanel';
import { useLanguage } from '@context/LanguageContext';

const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 180;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
  const isHorizontal = direction === 'LR';
  dagreGraph.setGraph({ rankdir: direction });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const newNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    return {
      ...node,
      targetPosition: isHorizontal ? Position.Left : Position.Top,
      sourcePosition: isHorizontal ? Position.Right : Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: newNodes, edges };
};

const GenealogyView: React.FC = () => {
  const { t } = useLanguage();
  const { projectId } = useOutletContext<{ projectId: number }>();
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);

    try {
      // Obtener todos los personajes
      const allEntities = await entityService.getAllByProject(projectId);
      const characters = allEntities.filter(e => e.tipo === 'personaje' || e.tipo === 'personajeprincipal');
      
      // Obtener todas las relaciones
      const allRelationships = await relationshipService.getByProject(projectId);
      
      // Filtrar solo relaciones familiares
      const familyRels = allRelationships.filter(r => 
        ['FAMILIAR', 'PADRE', 'MADRE', 'HIJO', 'HIJA', 'CONYUGE', 'ESPOSO', 'ESPOSA'].includes(r.tipo.toUpperCase())
      );

      const initialNodes: Node[] = characters.map((c: { id: { toString: () => any; }; nombre: any; tipo: any; }) => ({
        id: c.id.toString(),
        data: { label: c.nombre, tipo: c.tipo },
        position: { x: 0, y: 0 },
        style: {
            background: 'rgba(30, 30, 40, 0.8)',
            color: '#fff',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '0',
            width: nodeWidth,
            fontSize: '11px',
            fontWeight: '900',
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
        }
      }));

      const initialEdges: Edge[] = familyRels.map(r => ({
        id: `e-${r.id}`,
        source: r.origen_id.toString(),
        target: r.destino_id.toString(),
        label: r.tipo.toLowerCase(),
        animated: r.tipo.toUpperCase() === 'CONYUGE',
        markerEnd: { type: MarkerType.ArrowClosed, color: 'rgba(255,255,255,0.2)' },
        style: { stroke: 'rgba(255,255,255,0.2)' },
        labelStyle: { fill: 'rgba(255,255,255,0.5)', fontSize: '8px', fontWeight: 'bold', textTransform: 'uppercase' }
      }));

      const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
        initialNodes,
        initialEdges
      );

      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
    } catch (error) {
      console.error("Error loading genealogy data:", error);
    } finally {
      setLoading(false);
    }
  }, [projectId, setNodes, setEdges]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="h-full w-full relative bg-background">
      {loading ? (
          <div className="h-full w-full flex items-center justify-center">
              <div className="animate-spin size-8 border-2 border-primary border-t-transparent rounded-full" />
          </div>
      ) : (
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          connectionMode={ConnectionMode.Loose}
          fitView
          colorMode="dark"
        >
          <Background variant={BackgroundVariant.Dots} color="rgba(255,255,255,0.05)" />
          <Controls />
          <MiniMap style={{ backgroundColor: 'transparent' }} nodeColor="rgba(255,255,255,0.1)" />
          <Panel position="top-left" className="m-4">
              <GlassPanel className="p-4">
                  <h2 className="text-xl font-black uppercase tracking-tighter text-foreground">
                      Árbol Genealógico
                  </h2>
                  <p className="text-[10px] text-foreground/40 font-bold uppercase tracking-widest mt-1">
                      Visualización jerárquica de linajes
                  </p>
              </GlassPanel>
          </Panel>
        </ReactFlow>
      )}
    </div>
  );
};

export default GenealogyView;
