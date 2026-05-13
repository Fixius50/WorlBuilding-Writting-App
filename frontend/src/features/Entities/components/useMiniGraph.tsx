import { useState, useEffect, useCallback } from 'react';
import { CanvasNode, CanvasEdge } from '@presentation/organisms/editor/UniversalCanvas';
import { RelationshipUseCase } from '@application/useCases/RelationshipUseCase';

/**
 * 🧠 useMiniGraph
 * Hook to handle relationship loading and transformation into a star-shaped graph layout.
 */
export const useMiniGraph = (entityId?: number) => {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGraph = useCallback(async (id: number) => {
    setLoading(true);
    try {
      const rels = await RelationshipUseCase.getRelationshipsByEntity(id);
      const nodeMap = new Map<string, CanvasNode>();
      const newEdges: CanvasEdge[] = [];

      rels.forEach((rel, i) => {
        const angle = (i / rels.length) * 2 * Math.PI;
        
        // Ensure both origin and destination nodes are in the map
        if (!nodeMap.has(rel.origen_id.toString())) {
          nodeMap.set(rel.origen_id.toString(), {
            id: rel.origen_id.toString(),
            x: 400 + Math.cos(angle) * 150,
            y: 300 + Math.sin(angle) * 150,
            label: rel.nombre_origen || 'Desconocido',
            tipo: 'entidad'
          });
        }

        if (!nodeMap.has(rel.destino_id.toString())) {
          nodeMap.set(rel.destino_id.toString(), {
            id: rel.destino_id.toString(),
            x: 400 + Math.cos(angle) * 150,
            y: 300 + Math.sin(angle) * 150,
            label: rel.nombre_destino || 'Desconocido',
            tipo: 'entidad'
          });
        }

        newEdges.push({
          id: rel.id.toString(),
          from: rel.origen_id.toString(),
          to: rel.destino_id.toString()
        });
      });

      // Centralize the target entity
      if (nodeMap.has(id.toString())) {
        const center = nodeMap.get(id.toString())!;
        center.x = 400;
        center.y = 300;
      }

      setNodes(Array.from(nodeMap.values()));
      setEdges(newEdges);
    } catch (err) {
      console.error('Failed to load mini-graph:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (entityId) {
      loadGraph(entityId);
    }
  }, [entityId, loadGraph]);

  return {
    nodes,
    edges,
    loading
  };
};
