import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { DrawMode } from "../domain/types";

// Extracted from MapEditor constants or define here
export const DRAW_MODE_LABELS: Record<DrawMode, string> = {
  none: "Seleccionar / Mover",
  spray: "Pincel (Muros / Entorno)",
  line: "Línea Continua",
  rectangle: "Dibujar Rectángulo",
  circle: "Dibujar Círculo",
  fill: "Bote de Pintura (Relleno)",
  marker: "Añadir Marcador (POI)",
  eraser: "Borrador de Trazos",
};

export const DRAW_MODE_ICONS: Record<DrawMode, string> = {
  none: "near_me",
  spray: "brush",
  line: "polyline",
  rectangle: "rectangle",
  circle: "circle",
  fill: "format_color_fill",
  marker: "location_on",
  eraser: "ink_eraser",
};

export const GEOM_MODE_LABELS = {
  line: "Líneas Libres",
  rectangle: "Rectángulos",
  circle: "Círculos",
};

export const GEOM_MODE_ICONS = {
  line: "polyline",
  rectangle: "rectangle",
  circle: "circle",
};

export const GRID_MODE_LABELS = {
  none: "Libre (Sin Rejilla)",
  square: "Rejilla Cuadrada",
  isometric: "Rejilla Isométrica",
  dots: "Puntos de Anclaje",
};

export const GRID_MODE_ICONS = {
  none: "grid_off",
  square: "grid_4x4",
  isometric: "view_in_ar",
  dots: "grain",
};

export const BRUSH_COLORS = [
  "#262626", // Black/Dark
  "#ef4444", // Red
  "#3b82f6", // Blue
  "#22c55e", // Green
  "#eab308", // Yellow
  "#a855f7", // Purple
  "#fb923c", // Orange
  "#64748b", // Slate
];

interface MapEditorToolbarProps {
  mapEntityId?: string;
  drawMode: DrawMode;
  setDrawMode: (mode: DrawMode) => void;
  activeGeomType: "line" | "rectangle" | "circle";
  setActiveGeomType: (type: "line" | "rectangle" | "circle") => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  gridMode: "none" | "square" | "isometric" | "dots";
  setGridMode: (mode: "none" | "square" | "isometric" | "dots") => void;
  is3D: boolean;
  setIs3D: (is3D: boolean) => void;
}

export const MapEditorToolbar: React.FC<MapEditorToolbarProps> = ({
  mapEntityId,
  drawMode,
  setDrawMode,
  activeGeomType,
  setActiveGeomType,
  brushColor,
  setBrushColor,
  gridMode,
  setGridMode,
  is3D,
  setIs3D,
}) => {
  const navigate = useNavigate();
  const [isToolMenuOpen, setIsToolMenuOpen] = useState(false);
  const [isGeomMenuOpen, setIsGeomMenuOpen] = useState(false);
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);
  const [isGridMenuOpen, setIsGridMenuOpen] = useState(false);

  return (
    <div className="absolute top-6 left-6 z-[50] flex gap-4">
      <div className="flex bg-background/90 shadow-2xl border border-foreground/10 monolithic-panel overflow-hidden">
        <button
          onClick={() => navigate(-2)}
          className="p-3 text-foreground/60 hover:text-primary hover:bg-primary/10 border-r border-foreground/10 transition-all duration-300 flex items-center justify-center"
          title="Volver a Mapas"
        >
          <span className="material-symbols-outlined text-xl font-bold">arrow_back</span>
        </button>
        
        <button
          onClick={() => navigate(`../viewer/${mapEntityId}`)}
          className="p-3 text-foreground/60 hover:text-primary hover:bg-primary/10 transition-all duration-300 flex items-center justify-center"
          title="Alternar a Modo Visor"
        >
          <span className="material-symbols-outlined text-xl font-bold">visibility</span>
        </button>
      </div>

      <div className="monolithic-panel px-2 flex gap-1 bg-background/90 shadow-2xl border border-foreground/10 items-center">
        {/* Select / Move Tool (Always accessible) */}
        {!is3D && (
          <button
            onClick={() => setDrawMode("none")}
            title={DRAW_MODE_LABELS["none"]}
            className={`p-3 rounded transition-colors flex items-center justify-center ${
              drawMode === "none"
                ? "bg-primary/20 text-primary font-bold"
                : "text-foreground/60 hover:bg-foreground/5"
            }`}
          >
            <span className="material-symbols-outlined text-xl">{DRAW_MODE_ICONS["none"]}</span>
          </button>
        )}

        {!is3D && <div className="w-px h-6 bg-foreground/10 mx-1" />}

        {/* Tool Dropdown */}
        {!is3D && (
          <div className="relative">
            <button
              onClick={() => setIsToolMenuOpen(!isToolMenuOpen)}
              title={["marker", "spray", "fill", "eraser"].includes(drawMode) ? DRAW_MODE_LABELS[drawMode] : "Herramientas de Dibujo"}
              className={`p-3 rounded transition-colors flex items-center gap-1 ${
                ["marker", "spray", "fill", "eraser"].includes(drawMode)
                  ? "bg-primary/10 text-primary font-bold"
                  : "text-foreground/60 hover:bg-foreground/5"
              }`}
            >
              <span className="material-symbols-outlined text-xl">
                {["marker", "spray", "fill", "eraser"].includes(drawMode) ? DRAW_MODE_ICONS[drawMode] : "brush"}
              </span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            {isToolMenuOpen && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setIsToolMenuOpen(false)} />
                <div className="absolute top-full left-0 mt-1 flex flex-col bg-background border border-foreground/10 shadow-2xl rounded p-1 z-[100]">
                  {(Object.entries(DRAW_MODE_LABELS) as [DrawMode, string][])
                    .filter(([m]) => ["marker", "spray", "fill", "eraser"].includes(m))
                    .map(([m, label]) => (
                      <button
                        key={m}
                        onClick={() => { setDrawMode(m as DrawMode); setIsToolMenuOpen(false); }}
                        title={label}
                        className={`p-2 rounded flex items-center gap-3 whitespace-nowrap transition-colors ${drawMode === m ? "bg-primary/20 text-primary font-bold" : "text-foreground/60 hover:bg-foreground/5"}`}
                      >
                        <span className="material-symbols-outlined text-xl">{DRAW_MODE_ICONS[m as DrawMode]}</span>
                        <span className="text-sm">{label}</span>
                      </button>
                    ))}
                </div>
              </>
            )}
          </div>
        )}
        
        {!is3D && <div className="w-px h-6 bg-foreground/10 mx-2" />}

        {/* Geometry Dropdown */}
        {!is3D && (
          <div className="relative">
            <button
              onClick={() => setIsGeomMenuOpen(!isGeomMenuOpen)}
              title={`Forma Geométrica: ${GEOM_MODE_LABELS[activeGeomType]}`}
              className={`p-3 rounded transition-colors flex items-center gap-1 ${
                ["line", "rectangle", "circle"].includes(drawMode)
                  ? "bg-primary/10 text-primary border border-primary/20 font-bold"
                  : "text-foreground/60 hover:bg-foreground/5"
              }`}
            >
              <span className="material-symbols-outlined text-xl">{GEOM_MODE_ICONS[activeGeomType]}</span>
              <span className="material-symbols-outlined text-sm">expand_more</span>
            </button>
            {isGeomMenuOpen && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setIsGeomMenuOpen(false)} />
                <div className="absolute top-full left-0 mt-1 flex flex-col bg-background border border-foreground/10 shadow-2xl rounded p-1 z-[100]">
                  {(Object.entries(GEOM_MODE_LABELS) as [keyof typeof GEOM_MODE_LABELS, string][]).map(([m, label]) => (
                    <button
                      key={m}
                      onClick={() => {
                        setActiveGeomType(m);
                        setDrawMode(m as DrawMode);
                        setIsGeomMenuOpen(false);
                      }}
                      title={label}
                      className={`p-2 rounded flex items-center gap-3 whitespace-nowrap transition-colors ${drawMode === m ? "bg-primary/20 text-primary font-bold" : "text-foreground/60 hover:bg-foreground/5"}`}
                    >
                      <span className="material-symbols-outlined text-xl">{GEOM_MODE_ICONS[m]}</span>
                      <span className="text-sm">{label}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
        
        {!is3D && <div className="w-px h-6 bg-foreground/10 mx-2" />}

        {/* Color Dropdown */}
        {!is3D && (
          <div className="relative">
            <button
              onClick={() => setIsColorMenuOpen(!isColorMenuOpen)}
              title="Color de Pincel"
              className="p-2 rounded transition-colors hover:bg-foreground/5 flex items-center gap-1"
            >
              <div className="size-6 rounded-full border-2 border-foreground/20" style={{ backgroundColor: brushColor }} />
              <span className="material-symbols-outlined text-sm text-foreground/40">expand_more</span>
            </button>
            {isColorMenuOpen && (
              <>
                <div className="fixed inset-0 z-[90]" onClick={() => setIsColorMenuOpen(false)} />
                <div className="absolute top-full left-0 mt-1 flex flex-wrap w-32 gap-2 bg-background border border-foreground/10 shadow-2xl rounded p-2 z-[100]">
                  {BRUSH_COLORS.map(c => (
                    <button
                      key={c}
                      onClick={() => { setBrushColor(c); setIsColorMenuOpen(false); }}
                      className={`size-6 rounded-full border-2 transition-all ${brushColor === c ? 'border-primary scale-110' : 'border-transparent hover:scale-105 hover:border-foreground/20'}`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                  <label className="size-6 rounded-full border-2 border-dashed border-foreground/40 cursor-pointer flex items-center justify-center hover:border-primary transition-colors overflow-hidden relative">
                    <span className="material-symbols-outlined text-[14px] text-foreground/60 pointer-events-none absolute">add</span>
                    <input 
                      type="color" 
                      value={brushColor}
                      onChange={(e) => setBrushColor(e.target.value)}
                      className="opacity-0 w-10 h-10 absolute cursor-pointer"
                    />
                  </label>
                </div>
              </>
            )}
          </div>
        )}

        {!is3D && <div className="w-px h-6 bg-foreground/10 mx-2" />}

        {/* Grid Mode Selector Dropdown */}
        <div className="relative">
          <button
            onClick={() => setIsGridMenuOpen(!isGridMenuOpen)}
            title={`Modo de Rejilla: ${GRID_MODE_LABELS[gridMode as keyof typeof GRID_MODE_LABELS]}`}
            className={`p-2.5 rounded transition-colors flex items-center gap-1 ${gridMode !== "none" ? "bg-primary/10 text-primary border border-primary/20 font-bold" : "text-foreground/40 hover:bg-foreground/5"}`}
          >
            <span className="material-symbols-outlined text-xl">
              {GRID_MODE_ICONS[gridMode as keyof typeof GRID_MODE_ICONS]}
            </span>
            <span className="material-symbols-outlined text-sm">expand_more</span>
          </button>
          {isGridMenuOpen && (
            <>
              <div className="fixed inset-0 z-[90]" onClick={() => setIsGridMenuOpen(false)} />
              <div className="absolute top-full left-0 mt-1 flex flex-col bg-background border border-foreground/10 shadow-2xl rounded p-1 z-[100]">
                {(Object.entries(GRID_MODE_LABELS) as [keyof typeof GRID_MODE_LABELS, string][]).map(([m, label]) => (
                  <button
                    key={m}
                    onClick={() => {
                      setGridMode(m);
                      setIsGridMenuOpen(false);
                    }}
                    title={label}
                    className={`p-2 rounded flex items-center gap-3 whitespace-nowrap transition-colors ${gridMode === m ? "bg-primary/20 text-primary font-bold" : "text-foreground/60 hover:bg-foreground/5"}`}
                  >
                    <span className="material-symbols-outlined text-xl">{GRID_MODE_ICONS[m]}</span>
                    <span className="text-sm">{label}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        <div className="w-px h-6 bg-foreground/10 mx-2" />

        {/* Toggle 3D */}
        <button
          onClick={() => setIs3D(!is3D)}
          title="Activar vista 3D Multinivel"
          className={`px-3 py-1.5 flex items-center gap-2 rounded transition-colors ${is3D ? "bg-primary/20 text-primary border border-primary/40 font-bold" : "text-foreground/40 hover:text-foreground border border-transparent"}`}
        >
          <span className="material-symbols-outlined text-lg">{is3D ? "view_in_ar" : "map"}</span>
          {is3D ? "3D Activo" : "Modo 2D"}
        </button>
      </div>
    </div>
  );
};
