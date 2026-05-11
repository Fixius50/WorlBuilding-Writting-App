import React, { useEffect, useState } from 'react';
import UniversalCanvas, { CanvasNode, CanvasEdge } from '@presentation/organisms/editor/UniversalCanvas';
import { RelationshipUseCase } from '@application/useCases/RelationshipUseCase';

interface Props {
  entityId?: number;
  onNavigate?: (id: string) => void;
  [key: string]: unknown;
}

const MiniGraph: React.FC<Props> = ({ entityId }) => {
  const [nodes, setNodes] = useState<CanvasNode[]>([]);
  const [edges, setEdges] = useState<CanvasEdge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!entityId) return;

    RelationshipUseCase.getRelationshipsByEntity(entityId).then(rels => {
      const nodeMap = new Map<string, CanvasNode>();
      const newEdges: CanvasEdge[] = [];

      rels.forEach((rel, i) => {
        const angle = (i / rels.length) * 2 * Math.PI;
        nodeMap.set(rel.origen_id.toString(), {
          id: rel.origen_id.toString(),
          x: 400 + Math.cos(angle) * 150,
          y: 300 + Math.sin(angle) * 150,
          label: rel.nombre_origen || 'Desconocido',
          tipo: 'entidad'
        });

        nodeMap.set(rel.destino_id.toString(), {
          id: rel.destino_id.toString(),
          x: 400 + Math.cos(angle) * 150,
          y: 300 + Math.sin(angle) * 150,
          label: rel.nombre_destino || 'Desconocido',
          tipo: 'entidad'
        });

        newEdges.push({
          id: rel.id.toString(),
          from: rel.origen_id.toString(),
          to: rel.destino_id.toString()
        });
      });

      // Forzar nodo central al medio
      if (nodeMap.has(entityId.toString())) {
        const center = nodeMap.get(entityId.toString())!;
        center.x = 400;
        center.y = 300;
      }

      setNodes(Array.from(nodeMap.values()));
      setEdges(newEdges);
      setLoading(false);
    });
  }, [entityId]);

  if (loading) return <div className="w-full h-64 flex items-center justify-center text-[10px] uppercase font-black tracking-widest text-primary animate-pulse border border-primary/20">Tejiendo Constelación...</div>;

  if (nodes.length === 0) return (
    <div className="w-full h-64 flex flex-col items-center justify-center p-6 text-center border border-foreground/10 bg-foreground/5">
      <span className="material-symbols-outlined text-4xl text-foreground/20 mb-2">hub</span>
      <p className="text-[10px] text-foreground/40 font-black tracking-widest uppercase">Sin Conexiones Detectadas</p>
    </div>
  );

  return (
    <div className="w-full h-[350px] border border-primary/20 bg-background relative overflow-hidden group">
       <UniversalCanvas initialNodes={nodes} initialEdges={edges} />
       <div className="absolute bottom-4 right-4 pointer-events-none opacity-50 group-hover:opacity-100 transition-opacity">
          <span className="text-[8px] font-black uppercase tracking-widest text-background bg-primary px-2 py-1">Powered by Konva</span>
       </div>
    </div>
  );
};

export default MiniGraph;
