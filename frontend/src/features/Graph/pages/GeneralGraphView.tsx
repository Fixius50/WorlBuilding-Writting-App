import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { RelationshipUseCase } from '@application/useCases/RelationshipUseCase';
import { useLanguage } from '@context/LanguageContext';
import UniversalCanvas, { CanvasNode, CanvasEdge } from '@presentation/organisms/editor/UniversalCanvas';

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

  const [loading, setLoading] = useState(true);
  const [canvasNodes, setCanvasNodes] = useState<CanvasNode[]>([]);
  const [canvasEdges, setCanvasEdges] = useState<CanvasEdge[]>([]);

  const loadGraph = useCallback(async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const { entities: allEntities, relationships: allRels } = await RelationshipUseCase.getFullNetwork(projectId);

      const filteredEntities = allEntities.filter(ent => ent.carpeta_id !== null);

      const newNodes: CanvasNode[] = filteredEntities.map((ent, idx) => {
        const angle = (idx / filteredEntities.length) * 2 * Math.PI;
        const radius = 350 + Math.random() * 50;

        return {
          id: ent.id.toString(),
          x: Math.cos(angle) * radius + 500,
          y: Math.sin(angle) * radius + 500,
          label: ent.nombre,
          tipo: ent.tipo
        };
      });

      const newEdges: CanvasEdge[] = allRels.map(rel => ({
        id: rel.id.toString(),
        from: rel.origen_id.toString(),
        to: rel.destino_id.toString()
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

  if (loading) {
    return <div className="p-8 text-foreground/50">Cargando motor Konva Canvas...</div>;
  }

  return (
    <div className="w-full h-full relative">
      <UniversalCanvas initialNodes={canvasNodes} initialEdges={canvasEdges} />
    </div>
  );
};

export default GeneralGraphView;
