import React, { useMemo, useState } from "react";
import UniversalCanvasCore, {
  CanvasNode,
  CanvasEdge,
} from "@components/ui/editor/UniversalCanvasCore";
import { getHierarchyVisuals } from "@features/WorldBible/components/hierarchyVisuals";

export type { CanvasNode, CanvasEdge };

export interface UniversalCanvasProps {
  initialNodes?: CanvasNode[];
  initialEdges?: CanvasEdge[];
  onNodeClick?: (id: string) => void;
  onEdgeClick?: (id: string) => void;
  onNodeDragEnd?: (id: string, x: number, y: number) => void;
  backgroundColor?: string;
  onDropNode?: (entityId: string, x: number, y: number) => void;
  draggableEntities?: { id: string; label: string; tipo: string }[];
  onClearCanvas?: () => void;
}

const UniversalCanvas: React.FC<UniversalCanvasProps> = ({
  initialNodes,
  initialEdges,
  onNodeClick,
  onEdgeClick,
  onNodeDragEnd,
  backgroundColor,
  onDropNode,
  draggableEntities,
  onClearCanvas,
}) => {
  const [dragSearchTerm, setDragSearchTerm] = useState("");

  const filteredDraggables = useMemo(() => {
    const normalizedTerm = dragSearchTerm.toLowerCase().trim();
    return (draggableEntities || []).filter((ent) =>
      ent.label.toLowerCase().includes(normalizedTerm),
    );
  }, [draggableEntities, dragSearchTerm]);

  const rightPanelExtra = draggableEntities ? (
    <div className="border-t border-foreground/10 pt-2.5 flex flex-col gap-2">
      <div>
        <label className="text-[0.69rem] font-bold text-muted-foreground uppercase tracking-wider">
          Biblia de Mundos
        </label>
        <p className="text-[9px] text-muted-foreground/60 leading-tight mt-0.5">
          Arrastra un elemento al lienzo para graficar sus relaciones.
        </p>
      </div>
      <input
        type="text"
        placeholder="Buscar para arrastrar..."
        value={dragSearchTerm}
        onChange={(e) => setDragSearchTerm(e.target.value)}
        className="w-full bg-muted text-foreground border border-foreground/10 rounded px-2 py-1 text-[0.69rem] outline-none focus:border-primary/50 transition-colors"
      />
      {initialNodes && initialNodes.length > 0 && onClearCanvas && (
        <button
          onClick={onClearCanvas}
          className="w-full bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/20 rounded py-1 text-[0.69rem] font-bold transition-all"
        >
          Limpiar Lienzo
        </button>
      )}
      <div
        className="flex flex-col gap-1 overflow-y-auto pr-1"
        style={{ maxHeight: filteredDraggables.length > 5 ? "150px" : "auto" }}
      >
        {filteredDraggables.map((ent) => {
          const visuals = getHierarchyVisuals(ent.tipo);
          return (
            <div
              key={ent.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData("text/plain", ent.id);
              }}
              className="flex items-center gap-2 px-2 py-1 rounded bg-muted/40 hover:bg-muted/80 border border-foreground/5 cursor-grab active:cursor-grabbing select-none transition-all duration-200"
            >
              <span
                className={`material-symbols-outlined text-[10px] ${visuals.color}`}
              >
                {visuals.icon}
              </span>
              <span className="text-[10px] truncate font-medium text-foreground/80">
                {ent.label}
              </span>
            </div>
          );
        })}
        {filteredDraggables.length === 0 && (
          <div className="text-[9px] text-center text-muted-foreground/50 py-2">
            Sin elementos
          </div>
        )}
      </div>
    </div>
  ) : null;

  return (
    <UniversalCanvasCore
      initialNodes={initialNodes}
      initialEdges={initialEdges}
      onNodeClick={onNodeClick}
      onEdgeClick={onEdgeClick}
      onNodeDragEnd={onNodeDragEnd}
      backgroundColor={backgroundColor}
      onDropData={onDropNode}
      dropDataMimeType="text/plain"
      rightPanelExtra={rightPanelExtra}
    />
  );
};

export default UniversalCanvas;
