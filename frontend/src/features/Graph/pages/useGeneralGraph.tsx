import { useState, useEffect, useCallback } from 'react';
import { RelationshipUseCase } from '@application/useCases/RelationshipUseCase';
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

      const newEdges: CanvasEdge[] = allRels.map(rel => ({
        id: rel.id.toString(),
        from: rel.origen_id.toString(),
        to: rel.destino_id.toString(),
        relation: rel.tipo
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
