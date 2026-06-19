import React from "react";

interface CosmologyMinimapProps {
  minimapCanvasRef: React.RefObject<HTMLCanvasElement | null>;
  minimapWidth: number;
  minimapHeight: number;
  onMouseDown: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLCanvasElement>) => void;
  onMouseUp: () => void;
}

// Minimapa de Cosmología - estilo idéntico al de Red Neuronal (transparente, borde negro, cursor crosshair)
const CosmologyMinimap: React.FC<CosmologyMinimapProps> = ({
  minimapCanvasRef,
  minimapWidth,
  minimapHeight,
  onMouseDown,
  onMouseMove,
  onMouseUp,
}) => (
  <div className="absolute bottom-4 left-4 z-30">
    <canvas
      ref={minimapCanvasRef}
      width={minimapWidth}
      height={minimapHeight}
      className="cursor-crosshair border border-black bg-transparent"
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={onMouseUp}
      onMouseLeave={onMouseUp}
    />
  </div>
);

export default CosmologyMinimap;
