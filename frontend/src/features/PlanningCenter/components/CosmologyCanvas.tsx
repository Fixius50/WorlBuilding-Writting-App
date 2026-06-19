import React from "react";
import { Stage, Layer, Circle as KonvaCircle, Text as KonvaText, Line as KonvaLine, Group } from "react-konva";
import Konva from "konva";
import { KonvaEventObject } from "konva/lib/Node";
import { FlattenedCircle } from "../domain/cosmology.types";
import { getLevelColors } from "../application/cosmologyLayout";

interface CosmologyCanvasProps {
  containerRef: React.RefObject<HTMLDivElement | null>;
  stageRef: React.RefObject<Konva.Stage | null>;
  dimensions: { width: number; height: number };
  scale: number;
  position: { x: number; y: number };
  selectedNodeId: number | null;
  setSelectedNodeId: (id: number | null) => void;
  themeCanvasBackground: string;
  flatCircles: FlattenedCircle[];
  gridLines: {
    verticalLines: number[];
    horizontalLines: number[];
    startX: number;
    endX: number;
    startY: number;
    endY: number;
  };
  onWheel: (e: KonvaEventObject<WheelEvent>) => void;
  onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
}

const CosmologyCanvas: React.FC<CosmologyCanvasProps> = ({
  containerRef,
  stageRef,
  dimensions,
  scale,
  position,
  selectedNodeId,
  setSelectedNodeId,
  themeCanvasBackground,
  flatCircles,
  gridLines,
  onWheel,
  onDragEnd,
}) => {
  const { verticalLines, horizontalLines, startX, endX, startY, endY } = gridLines;

  return (
    <div
      ref={containerRef}
      className="flex-1 h-full relative overflow-hidden outline-none"
      style={{ backgroundColor: themeCanvasBackground }}
    >
      <Stage
        width={dimensions.width}
        height={dimensions.height}
        draggable
        scaleX={scale}
        scaleY={scale}
        x={position.x}
        y={position.y}
        onWheel={onWheel}
        onDragEnd={onDragEnd}
        ref={stageRef}
      >
        {/* Capa de Rejilla de Fondo Técnica */}
        <Layer id="background-grid">
          {verticalLines.map((x, i) => (
            <KonvaLine
              key={`v-${i}`}
              points={[x, startY - 1000, x, endY + 1000]}
              stroke="#000000"
              opacity={0.04}
              strokeWidth={1 / scale}
            />
          ))}
          {horizontalLines.map((y, i) => (
            <KonvaLine
              key={`h-${i}`}
              points={[startX - 1000, y, endX + 1000, y]}
              stroke="#000000"
              opacity={0.04}
              strokeWidth={1 / scale}
            />
          ))}
        </Layer>

        {/* Capa de los Círculos Concéntricos */}
        <Layer id="nested-circles">
          {flatCircles.map((circle) => {
            const isSelected = selectedNodeId === circle.node.id;
            const colors     = getLevelColors(circle.node.level);

            return (
              <Group key={circle.node.id}>
                {/* Círculo de contención visual con Relleno SÓLIDO opaco - NO INTERACTIVO */}
                <KonvaCircle
                  x={circle.x}
                  y={circle.y}
                  radius={circle.r}
                  fill={themeCanvasBackground}
                  stroke={isSelected ? "#3b82f6" : colors.border}
                  strokeWidth={isSelected ? 2.5 : 1.2}
                  dash={circle.node.level === 0 ? [8, 4] : undefined}
                  listening={false}
                />

                {/* Círculo interactivo invisible superpuesto para detectar el clic SOLO en el borde */}
                <KonvaCircle
                  x={circle.x}
                  y={circle.y}
                  radius={circle.r}
                  fill={undefined}
                  stroke="rgba(0,0,0,0)"
                  strokeWidth={15}
                  listening={true}
                  onClick={(e) => { e.cancelBubble = true; setSelectedNodeId(isSelected ? null : circle.node.id); }}
                  onTap={(e)   => { e.cancelBubble = true; setSelectedNodeId(isSelected ? null : circle.node.id); }}
                  onMouseEnter={(e) => { const c = e.target.getStage()?.container(); c ? (c.style.cursor = "pointer") : undefined; }}
                  onMouseLeave={(e) => { const c = e.target.getStage()?.container(); c ? (c.style.cursor = "default") : undefined; }}
                />

                {/* Nombre del elemento en la parte superior de la corona - INTERACTIVO */}
                <KonvaText
                  x={circle.x - circle.r}
                  y={circle.y - circle.r + 10}
                  width={circle.r * 2}
                  align="center"
                  text={circle.node.nombre.toUpperCase()}
                  fontSize={circle.node.level === 0 ? 9 : 8}
                  fontFamily="Space Mono, monospace"
                  fontStyle="bold"
                  fill={colors.label}
                  opacity={isSelected ? 1 : 0.7}
                  listening={true}
                  onClick={(e) => { e.cancelBubble = true; setSelectedNodeId(isSelected ? null : circle.node.id); }}
                  onTap={(e)   => { e.cancelBubble = true; setSelectedNodeId(isSelected ? null : circle.node.id); }}
                  onMouseEnter={(e) => { const c = e.target.getStage()?.container(); c ? (c.style.cursor = "pointer") : undefined; }}
                  onMouseLeave={(e) => { const c = e.target.getStage()?.container(); c ? (c.style.cursor = "default") : undefined; }}
                />
              </Group>
            );
          })}
        </Layer>
      </Stage>
    </div>
  );
};

export default CosmologyCanvas;
