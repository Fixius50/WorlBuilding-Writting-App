import React, { useRef, useState, useEffect } from 'react';
import { Stage, Layer, Line, Circle, Text, Group } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';

export interface CanvasNode {
  id: string;
  x: number;
  y: number;
  label: string;
  tipo: string;
}

export interface CanvasEdge {
  id: string;
  from: string;
  to: string;
}

const defaultNodes: CanvasNode[] = [
  { id: '1', x: 400, y: 300, label: 'El Sol Rojo', tipo: 'estrella' },
  { id: '2', x: 200, y: 150, label: 'Planeta Alpha', tipo: 'planeta' },
  { id: '3', x: 600, y: 450, label: 'Planeta Omega', tipo: 'planeta' },
];

const defaultEdges: CanvasEdge[] = [
  { id: 'e1-2', from: '1', to: '2' },
  { id: 'e1-3', from: '1', to: '3' },
];

export interface UniversalCanvasProps {
  initialNodes?: CanvasNode[];
  initialEdges?: CanvasEdge[];
  onNodeClick?: (id: string) => void;
  backgroundColor?: string;
}

const UniversalCanvas: React.FC<UniversalCanvasProps> = ({
  initialNodes = defaultNodes,
  initialEdges = defaultEdges,
  onNodeClick,
  backgroundColor
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<Konva.Stage>(null);
  
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });
  const [nodes, setNodes] = useState<CanvasNode[]>(initialNodes);
  const [edges, setEdges] = useState<CanvasEdge[]>(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges]);
  
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight
        });
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    const stage = stageRef.current;
    if (!stage) return;
    
    const scaleBy = 1.1;
    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;
    
    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };
    
    const newScale = e.evt.deltaY > 0 ? oldScale / scaleBy : oldScale * scaleBy;
    setScale(newScale);
    
    setPosition({
      x: pointer.x - mousePointTo.x * newScale,
      y: pointer.y - mousePointTo.y * newScale,
    });
  };

  const handleDragMoveNode = (id: string, e: KonvaEventObject<DragEvent>) => {
    const newNodes = nodes.map(n => {
      if (n.id === id) {
        return { ...n, x: e.target.x(), y: e.target.y() };
      }
      return n;
    });
    setNodes(newNodes);
  };

  // Cálculo para grid infinito simulado
  const BACKGROUND_GRID_SIZE = 50;
  // Aumentamos el margen de renderizado de la grid basándonos en la escala y posición
  const startX = Math.floor((-position.x / scale) / BACKGROUND_GRID_SIZE) * BACKGROUND_GRID_SIZE - BACKGROUND_GRID_SIZE * 10;
  const endX = startX + (dimensions.width / scale) + BACKGROUND_GRID_SIZE * 20;
  const startY = Math.floor((-position.y / scale) / BACKGROUND_GRID_SIZE) * BACKGROUND_GRID_SIZE - BACKGROUND_GRID_SIZE * 10;
  const endY = startY + (dimensions.height / scale) + BACKGROUND_GRID_SIZE * 20;

  const verticalLines = [];
  for (let x = startX; x < endX; x += BACKGROUND_GRID_SIZE) {
    verticalLines.push(x);
  }
  
  const horizontalLines = [];
  for (let y = startY; y < endY; y += BACKGROUND_GRID_SIZE) {
    horizontalLines.push(y);
  }

  return (
    <div ref={containerRef} className="w-full h-full overflow-hidden relative" style={{ backgroundColor: backgroundColor || '#0a0a0a' }}>
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        draggable
        onWheel={handleWheel}
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onDragEnd={(e) => {
          if (e.target === stageRef.current) {
            setPosition({ x: e.target.x(), y: e.target.y() });
          }
        }}
        ref={stageRef}
      >
        <Layer id="background-grid">
          {verticalLines.map((x, i) => (
            <Line
              key={`v-${i}`}
              points={[x, startY - 1000, x, endY + 1000]}
              stroke="rgba(0, 255, 255, 0.05)"
              strokeWidth={1 / scale}
            />
          ))}
          {horizontalLines.map((y, i) => (
            <Line
              key={`h-${i}`}
              points={[startX - 1000, y, endX + 1000, y]}
              stroke={backgroundColor === '#ffffff' ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 255, 255, 0.05)'}
              strokeWidth={1 / scale}
            />
          ))}
        </Layer>
        
        <Layer id="edges">
          {edges.map(edge => {
            const fromNode = nodes.find(n => n.id === edge.from);
            const toNode = nodes.find(n => n.id === edge.to);
            if (!fromNode || !toNode) return null;
            return (
              <Line
                key={edge.id}
                points={[fromNode.x, fromNode.y, toNode.x, toNode.y]}
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                opacity={0.8}
              />
            );
          })}
        </Layer>
        
        <Layer id="nodes">
          {nodes.map(node => (
            <Group
              key={node.id}
              x={node.x}
              y={node.y}
              draggable
              onDragMove={(e) => handleDragMoveNode(node.id, e)}
              onClick={() => onNodeClick && onNodeClick(node.id)}
              onTap={() => onNodeClick && onNodeClick(node.id)}
            >
              <Circle
                radius={25}
                fill="#111111"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
              />
              <Text
                text={node.label}
                fill={backgroundColor === '#ffffff' ? '#111111' : '#ffffff'}
                fontSize={12}
                fontFamily="Inter, sans-serif"
                fontStyle="bold"
                align="center"
                y={35}
                x={-50}
                width={100}
              />
            </Group>
          ))}
        </Layer>
      </Stage>
    </div>
  );
};

export default UniversalCanvas;
