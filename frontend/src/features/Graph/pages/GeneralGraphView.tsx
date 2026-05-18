import React, { useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import UniversalCanvas from '@presentation/organisms/editor/UniversalCanvas';
import { useGeneralGraph } from './useGeneralGraph';
import { useRightPanelStore } from '@store/useRightPanelStore';

interface GraphViewProps {
  projectId?: number;
  projectName?: string;
}

const GeneralGraphView: React.FC<GraphViewProps> = (props) => {
  const outletCtx = useOutletContext<{ projectId?: number; projectName?: string } | null>();
  const projectId: number | undefined = props.projectId ?? outletCtx?.projectId;

  const { loading, canvasNodes, canvasEdges } = useGeneralGraph(projectId);
  const openPanel = useRightPanelStore((state) => state.openPanel);

  const handleNodeClick = useCallback((id: string) => {
    openPanel('entity', Number(id));
  }, [openPanel]);

  const handleEdgeClick = useCallback((id: string) => {
    openPanel('relationship', Number(id));
  }, [openPanel]);

  if (loading) {
    return <div className="p-8 text-foreground/50">Cargando motor Konva Canvas...</div>;
  }

  return (
    <div className="w-full h-full relative">
      <UniversalCanvas 
        initialNodes={canvasNodes} 
        initialEdges={canvasEdges} 
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
      />
    </div>
  );
};

export default GeneralGraphView;

