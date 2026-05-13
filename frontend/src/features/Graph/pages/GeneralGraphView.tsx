import React from 'react';
import { useOutletContext } from 'react-router-dom';
import UniversalCanvas from '@presentation/organisms/editor/UniversalCanvas';
import { useGeneralGraph } from './useGeneralGraph';

interface GraphViewProps {
  projectId?: number;
  projectName?: string;
}

const GeneralGraphView: React.FC<GraphViewProps> = (props) => {
  const outletCtx = useOutletContext<{ projectId?: number; projectName?: string } | null>();
  const projectId: number | undefined = props.projectId ?? outletCtx?.projectId;

  const { loading, canvasNodes, canvasEdges } = useGeneralGraph(projectId);

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

