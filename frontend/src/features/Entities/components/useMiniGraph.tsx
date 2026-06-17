import { useState, useEffect, useCallback } from 'react';
import { CanvasNode, CanvasEdge } from '@components/ui/editor/UniversalCanvas';
import { RelationshipUseCase } from '@features/Relationships/application/RelationshipUseCase';

/**
 * 🧠 useMiniGraph
 * Hook to handle relationship loading and transformation into a star-shaped graph layout.
 */
export const useMiniGraph = (entityId?: number, projectId?: number) => {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGraph = useCallback(async (id: number) => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [rels, savedPositions] = await Promise.all([
        RelationshipUseCase.getRelationshipsByEntity(id),
        RelationshipUseCase.getAllNodePositions(projectId, `minigraph_${id}`)
      ]);
      const nodeMap = new Map<string, CanvasNode>();

      rels.forEach((rel, i) => {
        const angle = (i / rels.length) * 2 * Math.PI;
        
        const fromId = rel.origen_id.toString();
        const posFrom = savedPositions[rel.origen_id] || (savedPositions as any)[fromId];
        const hasPosFrom = posFrom !== undefined;

        if (!nodeMap.has(fromId)) {
          nodeMap.set(fromId, {
            id: fromId,
            x: hasPosFrom ? posFrom.x : (400 + Math.cos(angle) * 150),
            y: hasPosFrom ? posFrom.y : (300 + Math.sin(angle) * 150),
            label: rel.nombre_origen || 'Desconocido',
            tipo: 'entidad'
          });
        }

        const toId = rel.destino_id.toString();
        const posTo = savedPositions[rel.destino_id] || (savedPositions as any)[toId];
        const hasPosTo = posTo !== undefined;

        if (!nodeMap.has(toId)) {
          nodeMap.set(toId, {
            id: toId,
            x: hasPosTo ? posTo.x : (400 + Math.cos(angle) * 150),
            y: hasPosTo ? posTo.y : (300 + Math.sin(angle) * 150),
            label: rel.nombre_destino || 'Desconocido',
            tipo: 'entidad'
          });
        }
      });

      const groupedEdgesMap = new Map<string, { from: string; to: string; relations: string[]; id: string }>();
      rels.forEach((rel) => {
        const key = `${rel.origen_id}-${rel.destino_id}`;
        const existing = groupedEdgesMap.get(key);
        if (existing) {
          if (!existing.relations.includes(rel.tipo)) {
            existing.relations.push(rel.tipo);
          }
        } else {
          groupedEdgesMap.set(key, {
            id: rel.id.toString(),
            from: rel.origen_id.toString(),
            to: rel.destino_id.toString(),
            relations: [rel.tipo],
          });
        }
      });

      const newEdges: CanvasEdge[] = Array.from(groupedEdgesMap.values()).map((edge) => ({
        id: edge.id,
        from: edge.from,
        to: edge.to,
        relation: edge.relations.join(", "),
      }));

      // Centralize the target entity
      if (nodeMap.has(id.toString())) {
        const center = nodeMap.get(id.toString())!;
        const posCenter = savedPositions[id] || (savedPositions as any)[id.toString()];
        if (posCenter !== undefined) {
          center.x = posCenter.x;
          center.y = posCenter.y;
        } else {
          center.x = 400;
          center.y = 300;
        }
      }

      setNodes(Array.from(nodeMap.values()));
      setEdges(newEdges);
    } catch (err) {
      console.error('Failed to load mini-graph:', err);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    if (entityId && projectId) {
      loadGraph(entityId);
    }
  }, [entityId, projectId, loadGraph]);

  const handleNodeDragEnd = useCallback(async (nodeId: string, x: number, y: number) => {
    const canSave = !!projectId && !!entityId;
    switch (canSave) {
      case true:
        await RelationshipUseCase.saveNodePosition(Number(nodeId), x, y, `minigraph_${entityId}`);
        break;
      default:
        break;
    }
  }, [projectId, entityId]);

  return {
    nodes,
    edges,
    loading,
    handleNodeDragEnd
  };
};

