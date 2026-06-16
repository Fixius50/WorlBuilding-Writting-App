import { useState, useEffect, useCallback } from 'react';
import { RelationshipUseCase } from '@application/RelationshipUseCase';
import { CanvasNode, CanvasEdge } from '@presentation/organisms/editor/UniversalCanvas';

/**
 * 🧠 useGeneralGraph
 * Logic for fetching and processing the global relationship network.
 */
export const useGeneralGraph = (projectId: number | undefined) => {
  const [loading, setLoading] = useState(true);
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [canvasEdges, setCanvasEdges] = useState<CanvasEdge[]>([]);

  const loadGraph = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const [networkData, savedPositions] = await Promise.all([
        RelationshipUseCase.getFullNetwork(projectId),
        RelationshipUseCase.getAllNodePositions(projectId, 'general')
      ]);
      const { entities: allEntities, relationships: allRels } = networkData;

      const filteredEntities = allEntities.filter(ent => ent.carpeta_id !== null);

      const newNodes: CanvasNode[] = filteredEntities.map((ent, idx) => {
        const pos = savedPositions[ent.id] || (savedPositions as any)[ent.id.toString()];
        const hasPos = pos !== undefined;
        const angle = (idx / filteredEntities.length) * 2 * Math.PI;
        const radius = 350 + Math.random() * 50;

        return {
          id: ent.id.toString(),
          x: hasPos ? pos.x : (Math.cos(angle) * radius + 500),
          y: hasPos ? pos.y : (Math.sin(angle) * radius + 500),
          label: ent.nombre,
          tipo: ent.tipo
        };
      });

      const groupedEdgesMap = new Map<string, { from: string; to: string; relations: string[]; id: string }>();
      allRels.forEach((rel) => {
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

      setCanvasNodes(newNodes);
      setCanvasEdges(newEdges);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  useEffect(() => {
    loadGraph();
  }, [loadGraph]);

  // Reactividad en tiempo real ante cualquier cambio en los datos del proyecto
  useEffect(() => {
    const handleDataChange = (): void => {
      loadGraph();
    };
    window.addEventListener("app-data-changed", handleDataChange);
    return () => {
      window.removeEventListener("app-data-changed", handleDataChange);
    };
  }, [loadGraph]);

  return {
    loading,
    canvasNodes,
    canvasEdges,
    loadGraph
  };
};
