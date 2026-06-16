import React from 'react';
import UniversalCanvas from '@components/ui/editor/UniversalCanvas';
import { useMiniGraph } from './useMiniGraph';

interface Props {
  entityId?: number;
  onNavigate?: (id: string) => void;
  [key: string]: unknown;
}

const MiniGraph: React.FC<Props> = ({ entityId, projectId }) => {
  const { nodes, edges, loading, handleNodeDragEnd } = useMiniGraph(entityId, projectId as number);

  if (loading) return (
    <div className="w-full h-64 flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-primary animate-pulse border border-primary/20">
      Tejiendo Constelación...
    </div>
  );

  if (nodes.length === 0) return (
    <div className="w-full h-64 flex flex-col items-center justify-center p-6 text-center border border-foreground/10 bg-foreground/5">
      <span className="material-symbols-outlined text-4xl text-foreground/20 mb-2">hub</span>
      <p className="text-[10px] text-foreground/40 font-black tracking-widest uppercase">Sin Conexiones Detectadas</p>
    </div>
  );

  return (
    <div className="w-full h-full bg-background relative overflow-hidden group">
       <UniversalCanvas 
         initialNodes={nodes} 
         initialEdges={edges} 
         onNodeDragEnd={handleNodeDragEnd} 
       />
    </div>
  );
};

export default MiniGraph;

