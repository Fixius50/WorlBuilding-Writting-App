import React, { useState, useEffect } from 'react';
import UniversalCanvas, { CanvasNode, CanvasEdge } from '@presentation/organisms/editor/UniversalCanvas';
import { EntityUseCase } from '@application/useCases/EntityUseCase';
import { useOutletContext } from 'react-router-dom';

interface Props {
  entityId?: number;
  [key: string]: unknown;
}

const CosmicCanvasEditor: React.FC<Props> = (props) => {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const outletCtx = useOutletContext<{ projectId?: number } | null>();
  const projectId = outletCtx?.projectId || 1;

  useEffect(() => {
    EntityUseCase.getAllByProject(projectId).then(entities => {
      setNodes(entities.map((e, i) => ({
        id: e.id.toString(),
        x: 300 + (i % 6) * 150,
        y: 200 + Math.floor(i / 6) * 150,
        label: e.nombre,
        tipo: e.tipo
      })));
    });
  }, [projectId]);

  return (
    <div className="w-full h-full relative bg-background-dark">
       <UniversalCanvas initialNodes={nodes} initialEdges={edges} />
       
       <div className="absolute top-6 left-6 bg-background/80 p-5 border border-primary/30 backdrop-blur-md shadow-2xl max-w-xs">
          <div className="flex items-center gap-3 mb-2">
             <span className="material-symbols-outlined text-primary text-xl">all_inclusive</span>
             <h2 className="text-xs font-black uppercase tracking-[0.2em] text-primary">Cosmic Canvas</h2>
          </div>
          <p className="text-[10px] text-foreground/70 leading-relaxed">
            Motor de renderizado <strong className="text-foreground">HTML5 Konva</strong> activo. Arrastra los nodos para reordenar la constelación. El grid infinito es explorable con la rueda del ratón y arrastre.
          </p>
       </div>
    </div>
  );
};

export default CosmicCanvasEditor;
