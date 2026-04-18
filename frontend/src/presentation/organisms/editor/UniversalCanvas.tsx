import React, { useRef, useEffect } from 'react';
import { Stage, Layer, Line, Rect, Circle, Transformer } from 'react-konva';
import Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import { Shape, LayerData } from '@domain/models/canvas';

interface UniversalCanvasProps {
  stageRef: React.RefObject<Konva.Stage | null>;
  layers: LayerData[];
  selectedShapeId: string | string[] | null;
  onSelectShape: (id: string | null) => void;
  onChangeShape: (id: string, attrs: Partial<Shape>) => void;
  tool: string;
  color: string;
  strokeWidth: number;
  onDrawEnd: (phase: 'START' | 'MOVE' | 'END', data: { pos?: { x: number, y: number } }) => void;
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
  const transformerRef = useRef<Konva.Transformer>(null);

  useEffect(() => {
    if (tool === 'select' && transformerRef.current && selectedShapeId && !Array.isArray(selectedShapeId)) {
      const stage = stageRef.current;
      if (!stage) return;
      const selectedNode = stage.findOne(`#${selectedShapeId}`);
      if (selectedNode) {
        transformerRef.current.nodes([selectedNode]);
        const layer = transformerRef.current.getLayer();
        if (layer) layer.batchDraw();
      } else {
        transformerRef.current.nodes([]);
      }
    } else if (transformerRef.current) {
      transformerRef.current.nodes([]);
    }
  }, [selectedShapeId, tool, layers]);

  const handleMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
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
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (pos) onDrawEnd('START', { pos });
  };

  const handleMouseMove = (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
    if (!isDrawing.current || tool === 'select') return;
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = stage.getPointerPosition();
    if (pos) onDrawEnd('MOVE', { pos });
  };

  const handleMouseUp = () => {
    if (!isDrawing.current || tool === 'select') return;
    isDrawing.current = false;
    onDrawEnd('END', {});
  };

  const handleShapeClick = (e: KonvaEventObject<MouseEvent | TouchEvent>, shapeId: string) => {
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
              const shapeProps: Record<string, unknown> = {
                id: shape.id,
                onClick: (e: KonvaEventObject<MouseEvent>) => handleShapeClick(e, shape.id),
                onTap: (e: KonvaEventObject<TouchEvent>) => handleShapeClick(e, shape.id),
                stroke: shape.stroke || '#ffffff',
                strokeWidth: shape.strokeWidth || 4,
                opacity: shape.opacity || 1,
                lineCap: shape.lineCap || 'round',
                lineJoin: shape.lineJoin || 'round',
                dash: shape.dash,
                tension: shape.tension,
                globalCompositeOperation: shape.globalCompositeOperation,
                draggable: tool === 'select' && selectedShapeId === shape.id,
                onDragEnd: (e: KonvaEventObject<DragEvent>) => {
                  onChangeShape(shape.id, {
                    x: e.target.x(),
                    y: e.target.y()
                  });
                },
                onTransformEnd: (e: KonvaEventObject<Event>) => {
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
