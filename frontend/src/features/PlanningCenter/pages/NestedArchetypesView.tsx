import React from "react";
import { useNestedArchetypes } from "../hooks/useNestedArchetypes";
import CosmologyCanvas from "../components/CosmologyCanvas";
import CosmologyControlPanel from "../components/CosmologyControlPanel";
import CosmologyMinimap from "../components/CosmologyMinimap";

interface NestedArchetypesViewProps {
  projectId?: number;
}

const NestedArchetypesView: React.FC<NestedArchetypesViewProps> = ({ projectId }) => {
  const {
    loading,
    containerRef,
    stageRef,
    dimensions,
    scale,
    position,
    selectedNodeId,
    setSelectedNodeId,
    themeCanvasBackground,
    flatCircles,
    visibleEntities,
    groupedEntities,
    selectedEntityDetails,
    gridLines,
    handleWheel,
    handleDragEnd,
    handleFocusNode,
    minimapCanvasRef,
    minimapWidth,
    minimapHeight,
    handleMinimapMouseDown,
    handleMinimapMouseMove,
    handleMinimapMouseUp,
  } = useNestedArchetypes({ projectId });

  switch (loading) {
    case true:
      return (
        <div className="flex flex-col items-center justify-center h-full w-full opacity-35 font-mono text-xs tracking-widest uppercase gap-3">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent animate-spin rounded-none" />
          Mapeando Cosmología...
        </div>
      );
    default:
      break;
  }

  return (
    <div className="w-full h-full flex flex-col md:flex-row relative overflow-hidden bg-background">
      <CosmologyCanvas
        containerRef={containerRef}
        stageRef={stageRef}
        dimensions={dimensions}
        scale={scale}
        position={position}
        selectedNodeId={selectedNodeId}
        setSelectedNodeId={setSelectedNodeId}
        themeCanvasBackground={themeCanvasBackground}
        flatCircles={flatCircles}
        gridLines={gridLines}
        onWheel={handleWheel}
        onDragEnd={handleDragEnd}
      />
      <CosmologyControlPanel
        visibleEntities={visibleEntities}
        groupedEntities={groupedEntities}
        selectedEntityDetails={selectedEntityDetails}
        selectedNodeId={selectedNodeId}
        onFocusNode={handleFocusNode}
        onDeselect={() => setSelectedNodeId(null)}
      />
      <CosmologyMinimap
        minimapCanvasRef={minimapCanvasRef}
        minimapWidth={minimapWidth}
        minimapHeight={minimapHeight}
        onMouseDown={handleMinimapMouseDown}
        onMouseMove={handleMinimapMouseMove}
        onMouseUp={handleMinimapMouseUp}
      />
    </div>
  );
};

export default NestedArchetypesView;
