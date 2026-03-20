import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Transformer } from 'react-konva';

interface Shape {
  id: string;
  type: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  radius?: number;
  points?: number[];
  stroke?: string;
  strokeWidth?: number;
  opacity?: number;
  lineCap?: 'butt' | 'round' | 'square';
  lineJoin?: 'round' | 'bevel' | 'miter';
  dash?: number[];
  tension?: number;
  globalCompositeOperation?: string;
}

interface LayerData {
  id: string;
  name: string;
  visible: boolean;
  locked: boolean;
  shapes: Shape[];
}

interface UniversalCanvasProps {
  stageRef: any;
  layers: LayerData[];
  selectedShapeId: string | string[] | null;
  onSelectShape: (id: string | null) => void;
  onChangeShape: (id: string, attrs: any) => void;
  tool: string;
  color: string;
  strokeWidth: number;
  onDrawEnd: (phase: string, data: any) => void;
}

const UniversalCanvas: React.FC<UniversalCanvasProps> = ({
  stageRef,
  layers,
  selectedShapeId,
  onSelectShape,
  onChangeShape,
  tool,
  onDrawEnd
}) => {
  const isDrawing = useRef(false);
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    if (tool === 'select' && transformerRef.current && selectedShapeId && !Array.isArray(selectedShapeId)) {
      const stage = stageRef.current;
      const selectedNode = stage.findOne(`#${selectedShapeId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        transformerRef.current.getLayer().batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedShapeId, tool, layers]);

  const handleMouseDown = (e: any) => {
    // Si la herramienta es select y el usuario clica en el escenario vacío, deseleccionamos
    if (tool === 'select') {
      const clickedOnEmpty = e.target === e.target.getStage();
      if (clickedOnEmpty) {
        onSelectShape(null);
      }
      return;
    }

    isDrawing.current = true;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    onDrawEnd('START', { pos });
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current || tool === 'select') return;
    const stage = e.target.getStage();
    const pos = stage.getPointerPosition();
    onDrawEnd('MOVE', { pos });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || tool === 'select') return;
    isDrawing.current = false;
    onDrawEnd('END', {});
  };

  const handleShapeClick = (e: any, shapeId: string) => {
    if (tool === 'select') {
      onSelectShape(shapeId);
      e.cancelBubble = true;
    }
  };

  return (
    <div className="w-full h-full cursor-crosshair relative bg-background/20" id="canvas-container">
      <Stage
        width={1000} // Se puede ajustar este width/height con un ResizeObserver
        height={800}
        onMouseDown={handleMouseDown}
        onMousemove={handleMouseMove}
        onMouseup={handleMouseUp}
        onTouchStart={handleMouseDown}
        onTouchMove={handleMouseMove}
        onTouchEnd={handleMouseUp}
        ref={stageRef}
      >
        {layers.map((layer) => (
          <Layer key={layer.id} visible={layer.visible}>
            {layer.shapes.map((shape) => {
              const shapeProps: any = {
                id: shape.id,
                onClick: (e: any) => handleShapeClick(e, shape.id),
                onTap: (e: any) => handleShapeClick(e, shape.id),
                stroke: shape.stroke || '#ffffff',
                strokeWidth: shape.strokeWidth || 4,
                opacity: shape.opacity || 1,
                lineCap: shape.lineCap || 'round',
                lineJoin: shape.lineJoin || 'round',
                dash: shape.dash,
                tension: shape.tension,
                globalCompositeOperation: shape.globalCompositeOperation,
                draggable: tool === 'select' && selectedShapeId === shape.id,
                onDragEnd: (e: any) => {
                  onChangeShape(shape.id, {
                    x: e.target.x(),
                    y: e.target.y()
                  });
                },
                onTransformEnd: (e: any) => {
                  const node = e.target;
                  onChangeShape(shape.id, {
                    x: node.x(),
                    y: node.y(),
                    scaleX: node.scaleX(),
                    scaleY: node.scaleY(),
                    rotation: node.rotation()
                  });
                }
              };

              if (shape.type === 'brush' || shape.type === 'eraser' || shape.type === 'line') {
                return <Line key={shape.id} points={shape.points || []} {...shapeProps} />;
              }
              if (shape.type === 'rect') {
                return <Rect key={shape.id} x={shape.x} y={shape.y} width={shape.width} height={shape.height} {...shapeProps} />;
              }
              if (shape.type === 'circle') {
                return <Circle key={shape.id} x={shape.x} y={shape.y} radius={shape.radius} {...shapeProps} />;
              }
              return null;
            })}
          </Layer>
        ))}
        {tool === 'select' && (
          <Layer>
            <Transformer
              ref={transformerRef}
              boundBoxFunc={(oldBox, newBox) => {
                if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) return oldBox;
                return newBox;
              }}
            />
          </Layer>
        )}
      </Stage>
    </div>
  );
};

export default UniversalCanvas;
