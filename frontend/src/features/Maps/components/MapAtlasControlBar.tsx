import React from "react";
import { AtlasLevel } from "@domain/maps";

interface MapAtlasControlBarProps {
  viewMode: "2D" | "3D";
  setViewMode: (mode: "2D" | "3D") => void;
  appMode: "EDIT" | "VIEW";
  setAppMode: (mode: "EDIT" | "VIEW") => void;
  activeLevelId: string;
  levels: AtlasLevel[];
  overlayAllLayers: boolean;
  setOverlayAllLayers: (val: boolean) => void;
  activeMenu: "brush" | "upload" | null;
  setActiveMenu: (menu: "brush" | "upload" | null) => void;
  drawTool: "brush" | "eraser";
  setDrawTool: (tool: "brush" | "eraser") => void;
  brushColor: string;
  setBrushColor: (color: string) => void;
  brushSize: number;
  setBrushSize: (size: number) => void;
  backdropOpacity: number;
  setBackdropOpacity: (opacity: number) => void;
  handleTeleport: (levelId: string) => void;
  handleBack: () => void;
  handleClearCanvas: () => void;
  saveAtlasState: (updates: Record<string, unknown>) => Promise<void>;
}

// Cápsula de control superior: Atrás, 2D/3D, Editar/Ver, Selector de nivel, Pincel
const MapAtlasControlBar: React.FC<MapAtlasControlBarProps> = ({
  viewMode,
  setViewMode,
  appMode,
  setAppMode,
  activeLevelId,
  levels,
  overlayAllLayers,
  setOverlayAllLayers,
  activeMenu,
  setActiveMenu,
  drawTool,
  setDrawTool,
  brushColor,
  setBrushColor,
  brushSize,
  setBrushSize,
  backdropOpacity,
  setBackdropOpacity,
  handleTeleport,
  handleBack,
  handleClearCanvas,
  saveAtlasState,
}) => (
  <div className="absolute top-3 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 bg-background border border-foreground/15 px-4 py-2 rounded-full shadow-2xl text-foreground">
    {/* Botón de Retroceso (Salir del Atlas) */}
    <button
      onClick={handleBack}
      className="size-8 rounded-full text-foreground/60 hover:text-primary hover:bg-foreground/5 flex items-center justify-center transition-all"
      title="Salir del Atlas"
    >
      <span className="material-symbols-outlined text-[18px] font-bold">arrow_back</span>
    </button>
    <div className="h-4 w-px bg-foreground/10" />

    {/* Selector de Vista (2D/3D) */}
    <div className="flex border border-foreground/10 p-[2px] rounded-full bg-foreground/[0.03]">
      {(["2D", "3D"] as const).map((mode) => (
        <button
          key={mode}
          onClick={() => setViewMode(mode)}
          className={`px-4 py-1 rounded-full font-sans text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${viewMode === mode ? "bg-primary text-primary-foreground" : "text-foreground/40 hover:text-foreground"}`}
        >
          <span className="material-symbols-outlined text-[13px]">{mode === "2D" ? "draw" : "language"}</span>
          {mode}
        </button>
      ))}
    </div>

    {/* Selector de Modo EDITAR/VER (Solo en 2D) */}
    {viewMode === "2D" && (
      <>
        <div className="h-4 w-px bg-foreground/10" />
        <div className="flex border border-foreground/10 p-[2px] rounded-full bg-foreground/[0.03]">
          <button
            onClick={() => setAppMode("EDIT")}
            className={`px-4 py-1 rounded-full font-sans text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${appMode === "EDIT" ? "bg-primary text-primary-foreground" : "text-foreground/40 hover:text-foreground"}`}
          >
            <span className="material-symbols-outlined text-[13px]">edit_square</span> Editar
          </button>
          <button
            onClick={() => setAppMode("VIEW")}
            className={`px-4 py-1 rounded-full font-sans text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${appMode === "VIEW" ? "bg-primary text-primary-foreground" : "text-foreground/40 hover:text-foreground"}`}
          >
            <span className="material-symbols-outlined text-[13px]">layers</span> Ver
          </button>
        </div>
      </>
    )}

    {/* Selector de Nivel (Solo en 2D) */}
    {viewMode === "2D" && (
      <>
        <div className="h-4 w-px bg-foreground/10" />
        <div className="flex items-center gap-1.5 bg-foreground/[0.03] border border-foreground/10 px-3 py-1 rounded-full">
          <span className="material-symbols-outlined text-[13px] text-foreground/50">layers</span>
          <select
            value={activeLevelId}
            onChange={(e) => handleTeleport(e.target.value)}
            className="bg-transparent text-foreground border-none text-[10px] font-bold uppercase tracking-wider outline-none cursor-pointer pr-1"
          >
            {levels.map((l) => (
              <option key={l.id} value={l.id} className="bg-background text-foreground text-[10px] font-bold uppercase tracking-wider">
                {l.name.split(":")[0]}
              </option>
            ))}
          </select>
        </div>
      </>
    )}

    {/* Toggle de Superposición de Capas (Solo en 2D Ver) */}
    {viewMode === "2D" && appMode === "VIEW" && (
      <>
        <div className="h-4 w-px bg-foreground/10" />
        <button
          onClick={() => setOverlayAllLayers(!overlayAllLayers)}
          className={`px-3 py-1.5 rounded-full font-sans text-[10px] font-bold tracking-wider uppercase transition-all flex items-center gap-1.5 ${overlayAllLayers ? "bg-primary/20 text-primary border border-primary/25" : "text-foreground/45 hover:text-foreground border border-foreground/10"}`}
          title={overlayAllLayers ? "Ver solo la capa seleccionada" : "Superponer todas las capas del Atlas"}
        >
          <span className="material-symbols-outlined text-[13px]">{overlayAllLayers ? "sheets" : "layers_clear"}</span>
          {overlayAllLayers ? "Ver Todas" : "Solo Activa"}
        </button>
      </>
    )}

    {/* Controles de Dibujo (Solo en 2D Editar) */}
    {viewMode === "2D" && appMode === "EDIT" && (
      <>
        <div className="h-4 w-px bg-foreground/10" />

        <div className="flex items-center gap-1 relative">
          {/* Ajustes de Pincel */}
          <button
            onClick={() => setActiveMenu(activeMenu === "brush" ? null : "brush")}
            className={`size-8 rounded-full flex items-center justify-center transition-all ${activeMenu === "brush" ? "bg-primary/20 text-primary" : "text-foreground/60 hover:bg-foreground/5 hover:text-foreground"}`}
            title="Ajustes de Tinta"
          >
            <span className="material-symbols-outlined text-[18px]">brush</span>
          </button>

          {/* POPOVER: Ajustes de Pincel */}
          {activeMenu === "brush" && (
            <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-56 bg-background border border-foreground/15 p-4 rounded-xl shadow-2xl z-50 speech-bubble text-foreground animate-in fade-in slide-in-from-top-2 duration-200">
              <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-foreground/40 block mb-2">Herramienta</span>
              <div className="flex border border-foreground/10 p-[2px] rounded-full bg-foreground/[0.03] mb-4">
                {(["brush", "eraser"] as const).map((tool) => (
                  <button
                    key={tool}
                    onClick={() => setDrawTool(tool)}
                    className={`flex-1 py-1 rounded-full text-[10px] font-bold uppercase transition-all ${drawTool === tool ? "bg-primary text-primary-foreground" : "text-foreground/40"}`}
                  >
                    {tool === "brush" ? "Pincel" : "Borrador"}
                  </button>
                ))}
              </div>

              <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-foreground/40 block mb-1">Color de tinta</span>
              <div className="grid grid-cols-5 gap-1.5 mb-4">
                {["#6e78fa", "#f87171", "#4ade80", "#fbbf24", "#f472b6"].map((c) => (
                  <button
                    key={c}
                    onClick={() => { setBrushColor(c); saveAtlasState({ brushColor: c }); }}
                    className="size-6 rounded-full border border-foreground/15 flex items-center justify-center transition-transform hover:scale-110"
                    style={{ backgroundColor: c }}
                  >
                    {brushColor === c && <span className="size-2 rounded-full bg-background" />}
                  </button>
                ))}
              </div>

              <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-foreground/40 block mb-1">Grosor: {brushSize}px</span>
              <input
                type="range" min="1" max="20" value={brushSize}
                onChange={(e) => { const size = parseInt(e.target.value); setBrushSize(size); saveAtlasState({ brushSize: size }); }}
                className="w-full accent-primary bg-foreground/10 h-1 rounded cursor-pointer appearance-none outline-none mb-4"
              />

              <span className="font-sans text-[10px] font-bold tracking-wider uppercase text-foreground/40 block mb-1">Opacidad calco: {Math.round(backdropOpacity * 100)}%</span>
              <input
                type="range" min="0" max="100" value={Math.round(backdropOpacity * 100)}
                onChange={(e) => { const opacity = parseFloat(e.target.value) / 100; setBackdropOpacity(opacity); saveAtlasState({ backdropOpacity: opacity }); }}
                className="w-full accent-primary bg-foreground/10 h-1 rounded cursor-pointer appearance-none outline-none"
              />
            </div>
          )}

          {/* Limpiar Canvas */}
          <button
            onClick={handleClearCanvas}
            className="size-8 rounded-full flex items-center justify-center text-foreground/60 hover:bg-foreground/5 hover:text-red-400 transition-all"
            title="Limpiar Capa"
          >
            <span className="material-symbols-outlined text-[18px]">restart_alt</span>
          </button>
        </div>
      </>
    )}
  </div>
);

export default MapAtlasControlBar;
