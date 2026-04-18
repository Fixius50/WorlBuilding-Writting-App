import React, { useMemo, useEffect, useState } from 'react';
import { ReactFlow, Background, Handle, Position, NodeProps } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { relationshipService } from '@repositories/relationshipService';

interface MiniGraphProps {
  entityId: number;
  onNavigate: (id: number) => void;
}

const CustomNode = ({ data }: NodeProps) => {
  return (
    <div className={`p-3 border-t-2 ${data.isMain ? 'border-primary bg-primary/10 shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)]' : 'border-foreground/20 bg-foreground/5'} backdrop-blur-md flex flex-col items-center justify-center min-w-[120px]`}>
      <Handle type="target" position={Position.Top} className="opacity-0" />
      <span className="text-[10px] font-black uppercase tracking-widest text-foreground truncate w-full text-center">
        {data.label}
      </span>
      <Handle type="source" position={Position.Bottom} className="opacity-0" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

const MiniGraph: React.FC<MiniGraphProps> = ({ entityId, onNavigate }) => {
  const [elements, setElements] = useState<{ nodes: any[]; edges: any[] }>({ nodes: [], edges: [] });

  useEffect(() => {
    const fetchRelations = async () => {
      const relations = await relationshipService.getByEntity(entityId);
      
      const nodes: any[] = [
        {
          id: String(entityId),
          type: 'custom',
          data: { label: 'Principal', isMain: true },
          position: { x: 0, y: 0 },
        }
      ];

      const edges: any[] = [];

      relations.forEach((rel, index) => {
        const otherId = rel.entidad_a_id === entityId ? rel.entidad_b_id : rel.entidad_a_id;
        const otherName = rel.entidad_a_id === entityId ? rel.nombre_b : rel.nombre_a;
        
        const angle = (index / relations.length) * 2 * Math.PI;
        const radius = 180;
        
        nodes.push({
          id: String(otherId),
          type: 'custom',
          data: { label: otherName || 'Entidad', isMain: false },
          position: { x: Math.cos(angle) * radius, y: Math.sin(angle) * radius },
        });

        edges.push({
          id: `e-${rel.id}`,
          source: String(entityId),
          target: String(otherId),
          label: rel.tipo_relacion,
          className: 'stroke-primary/20',
          labelStyle: { fill: 'rgba(255,255,255,0.4)', fontSize: 8, fontWeight: 900, textTransform: 'uppercase' },
        });
      });

      setElements({ nodes, edges });
    };

    fetchRelations();
  }, [entityId]);

  return (
    <div className="w-full h-[350px] bg-foreground/[0.02] border border-foreground/10 relative overflow-hidden group">
      <div className="absolute top-4 left-4 z-10">
        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-foreground/40">Mapa de Influencia</span>
      </div>
      
      <ReactFlow
        nodes={elements.nodes}
        edges={elements.edges}
        nodeTypes={nodeTypes}
        onNodeClick={(_, node) => {
          if (Number(node.id) !== entityId) {
            onNavigate(Number(node.id));
          }
        }}
        fitView
        zoomOnScroll={false}
        panOnDrag={true}
        className="pointer-events-auto"
      >
        <Background color="rgba(255, 255, 255, 0.05)" gap={20} />
      </ReactFlow>

      <div className="absolute bottom-4 right-4 z-10 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity">
        <span className="text-[8px] text-foreground italic">Arrastra para explorar · Click para viajar</span>
      </div>
    </div>
  );
};

export default MiniGraph;
