import React, { useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import UniversalCanvas from "@components/ui/editor/UniversalCanvas";
import { useGeneralGraph } from "./useGeneralGraph";
import { RelationshipUseCase } from "@application/RelationshipUseCase";

interface GraphViewProps {
  projectId?: number;
  projectName?: string;
}

const GeneralGraphView: React.FC<GraphViewProps> = (props) => {
  const outletCtx = useOutletContext<{
    projectId?: number;
    projectName?: string;
  } | null>();
  const projectId: number | undefined = props.projectId ?? outletCtx?.projectId;

  const { loading, canvasNodes, canvasEdges } = useGeneralGraph(projectId);

  const handleNodeClick = useCallback((id: string) => {
    // Panel derecho eliminado: antes abría el inspector de entidad.
  }, []);

  const handleEdgeClick = useCallback((id: string) => {
    // Panel derecho eliminado: antes abría el inspector de relación.
  }, []);

  const handleNodeDragEnd = useCallback(async (id: string, x: number, y: number) => {
    await RelationshipUseCase.saveNodePosition(Number(id), x, y, 'general');
  }, []);

  if (loading) {
    return (
      <div className="p-8 text-foreground/50">
        Cargando motor Konva Canvas...
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <UniversalCanvas
        initialNodes={canvasNodes}
        initialEdges={canvasEdges}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onNodeDragEnd={handleNodeDragEnd}
      />
    </div>
  );
};

export default GeneralGraphView;
