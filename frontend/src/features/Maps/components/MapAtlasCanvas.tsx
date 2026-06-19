import React from "react";
import { AtlasLevel } from "@domain/maps";

interface MapAtlasCanvasProps {
  imageWidth: number;
  imageHeight: number;
  appMode: "EDIT" | "VIEW";
  viewMode: "2D" | "3D";
  pan: { x: number; y: number };
  zoom: number;
  spacebarPanning: boolean;
  isPanning: boolean;
  mapImage: string | null;
  levels: AtlasLevel[];
  activeLevelId: string;
  canvasStates: Record<string, string | null>;
  levelOpacities: Record<string, number>;
  levelBgImages: Record<string, string | null>;
  backdropOpacity: number;
  overlayAllLayers: boolean;
  drawTool: "brush" | "eraser";
  brushSize: number;
  eraserCursor: { x: number; y: number } | null;
  canvasRef: React.RefObject<HTMLCanvasElement | null>;
  // Handlers de interacción
  onWheel: (e: React.WheelEvent<HTMLDivElement>) => void;
  onMouseDown: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseMove: (e: React.MouseEvent<HTMLElement>) => void;
  onMouseUp: () => void;
  onTouchStart: (e: React.TouchEvent<HTMLElement>) => void;
  onTouchMove: (e: React.TouchEvent<HTMLElement>) => void;
}

// Lienzo principal del mapa 2D con soporte de capas, calcos y canvas de dibujo
const MapAtlasCanvas: React.FC<MapAtlasCanvasProps> = ({
  imageWidth,
  imageHeight,
  appMode,
  pan,
  zoom,
  spacebarPanning,
  isPanning,
  mapImage,
  levels,
  activeLevelId,
  canvasStates,
  levelOpacities,
  levelBgImages,
  backdropOpacity,
  overlayAllLayers,
  drawTool,
  brushSize,
  eraserCursor,
  canvasRef,
  onWheel,
  onMouseDown,
  onMouseMove,
  onMouseUp,
  onTouchStart,
  onTouchMove,
}) => (
  <div
    className="w-full h-full blueprint-grid flex items-center justify-center relative select-none"
    style={{
      transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
      transformOrigin: "0 0",
      cursor: spacebarPanning || isPanning ? "grab" : "crosshair",
    }}
    onMouseDown={onMouseDown}
    onMouseMove={onMouseMove}
    onMouseUp={onMouseUp}
    onMouseLeave={onMouseUp}
    onTouchStart={onTouchStart}
    onTouchMove={onTouchMove}
    onTouchEnd={onMouseUp}
  >
    {/* Contenedor exacto del mapa */}
    <div className="relative shadow-2xl flex-shrink-0" style={{ width: `${imageWidth}px`, height: `${imageHeight}px` }}>
      {/* Imagen Base / Calco Base de la Capa Activa (Fondo) */}
      <div className="absolute inset-0 w-full h-full pointer-events-none select-none">
        {levelBgImages[activeLevelId] || mapImage ? (
          <img
            src={(levelBgImages[activeLevelId] || mapImage)!}
            alt="Base"
            className="w-full h-full object-fill transition-all duration-300"
            style={{ opacity: appMode === "VIEW" && !overlayAllLayers ? 1.0 : backdropOpacity }}
          />
        ) : (
          <div className="w-full h-full border border-foreground/10 flex items-center justify-center">
            <svg viewBox="0 0 800 600" className="w-full h-full stroke-foreground/10 fill-none">
              <path d="M50,50 L750,50 L750,550 L50,550 Z" strokeWidth="1" />
              <path d="M50,150 L750,150 M50,450 L750,450" />
              <circle cx="400" cy="300" r="180" strokeDasharray="4,6" />
              <text x="420" y="280" className="fill-foreground/20 font-serif text-[1.8rem] italic tracking-wider">
                Sector de Contención
              </text>
              <path d="M150,150 L650,450" strokeWidth="0.5" strokeDasharray="1,4" />
            </svg>
          </div>
        )}
      </div>

      {/* CAPAS NO ACTIVAS (Fondo de calco en modo EDITAR) */}
      {appMode === "EDIT" && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
          {levels
            .slice()
            .reverse()
            .map((lvl) => {
              if (lvl.id === activeLevelId) return null;
              const savedState = canvasStates[lvl.id];
              return savedState ? (
                <img
                  key={lvl.id}
                  src={savedState}
                  alt={lvl.name}
                  className="absolute inset-0 w-full h-full object-fill transition-opacity duration-300"
                  style={{ opacity: levelOpacities[lvl.id] ?? 0.5 }}
                />
              ) : null;
            })}
        </div>
      )}

      {/* MODO DIBUJAR: Canvas interactivo único de nivel activo */}
      {appMode === "EDIT" && (
        <canvas ref={canvasRef} width={imageWidth} height={imageHeight} className="absolute inset-0 w-full h-full z-10" />
      )}

      {/* Guía visual del borrador (Círculo de cota) */}
      {eraserCursor && drawTool === "eraser" && appMode === "EDIT" && (
        <div
          className="absolute rounded-full border border-foreground/30 pointer-events-none z-20"
          style={{
            left: `${eraserCursor.x}px`,
            top: `${eraserCursor.y}px`,
            width: `${brushSize}px`,
            height: `${brushSize}px`,
            transform: "translate(-50%, -50%)",
            boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.5)",
          }}
        />
      )}

      {/* MODO VISUALIZAR: Superpone todos los niveles o muestra solo el activo */}
      {appMode === "VIEW" && (
        <div className="absolute inset-0 w-full h-full pointer-events-none z-10">
          {overlayAllLayers
            ? levels
                .slice()
                .reverse()
                .map((lvl) => {
                  const savedState = canvasStates[lvl.id];
                  return savedState ? (
                    <img
                      key={lvl.id}
                      src={savedState}
                      alt={lvl.name}
                      className="absolute inset-0 w-full h-full object-fill transition-opacity duration-300"
                      style={{ opacity: levelOpacities[lvl.id] ?? 1.0 }}
                    />
                  ) : null;
                })
            : (() => {
                const savedState = canvasStates[activeLevelId];
                return savedState ? (
                  <img src={savedState} alt="Capa Activa" className="absolute inset-0 w-full h-full object-fill" />
                ) : null;
              })()}
        </div>
      )}
    </div>
  </div>
);

export default MapAtlasCanvas;
