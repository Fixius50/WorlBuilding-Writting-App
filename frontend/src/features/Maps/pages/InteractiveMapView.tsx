import React from "react";
import MapLibreView from "../components/MapLibreView";
import MapAtlasCanvas from "../components/MapAtlasCanvas";
import MapAtlasControlBar from "../components/MapAtlasControlBar";
import MapAtlasSidebar from "../components/MapAtlasSidebar";
import { useInteractiveMapView } from "../hooks/useInteractiveMapView";
import { Entidad } from "@domain/database";

const InteractiveMapView: React.FC<{
  map: Entidad;
  onBack?: () => void;
}> = ({ map, onBack }) => {
  const hook = useInteractiveMapView(map, onBack);

  // Estado local de la barra de control no enlazado al hook
  const [newLevelPosition]              = React.useState<"above" | "below">("above");
  const [overlayAllLayers, setOverlayAllLayers] = React.useState<boolean>(true);

  return (
    <div className="relative w-full h-full bg-background text-foreground overflow-hidden select-none">
      {/* --- LIENZO PRINCIPAL --- */}
      <div
        className="absolute inset-0 bg-background border border-foreground/10 overflow-hidden z-0 shadow-2xl"
        onWheel={hook.handleWheel}
      >
        {hook.viewMode === "2D" ? (
          <MapAtlasCanvas
            imageWidth={hook.imageWidth}
            imageHeight={hook.imageHeight}
            appMode={hook.appMode}
            viewMode={hook.viewMode}
            pan={hook.pan}
            zoom={hook.zoom}
            spacebarPanning={hook.spacebarPanning}
            isPanning={hook.isPanning}
            mapImage={hook.mapImage}
            levels={hook.levels}
            activeLevelId={hook.activeLevelId}
            canvasStates={hook.canvasStates}
            levelOpacities={hook.levelOpacities}
            levelBgImages={hook.levelBgImages}
            backdropOpacity={hook.backdropOpacity}
            overlayAllLayers={overlayAllLayers}
            drawTool={hook.drawTool}
            brushSize={hook.brushSize}
            eraserCursor={hook.eraserCursor}
            canvasRef={hook.canvasRef}
            onWheel={hook.handleWheel}
            onMouseDown={hook.handleStartDrawing}
            onMouseMove={hook.handleDrawing}
            onMouseUp={hook.handleStopDrawing}
            onTouchStart={hook.handleTouchStart}
            onTouchMove={hook.handleTouchMove}
          />
        ) : (
          /* MODO 3D: Visor MapLibreView */
          <div className="w-full h-full relative z-0">
            {hook.mapImage ? (
              <MapLibreView
                mapImage={hook.mapImage}
                markers={hook.markers}
                layers={hook.layers}
                connections={hook.connections}
                features={
                  hook.features as
                    | {
                        type: string;
                        features: Array<{
                          properties?: Record<string, unknown>;
                          geometry: { type: string; coordinates: unknown };
                        }>;
                      }
                    | undefined
                }
                onMarkerClick={hook.handleMarkerClick}
                imageWidth={hook.imageWidth}
                imageHeight={hook.imageHeight}
                is3D={true}
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-foreground/40">
                <div className="text-center space-y-2">
                  <span className="material-symbols-outlined text-5xl">cloud_off</span>
                  <div className="text-xs uppercase font-bold tracking-widest">Sin Cartografía Base para 3D</div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* --- PANEL LATERAL (Solo en modo EDITAR) --- */}
        {hook.appMode === "EDIT" && (
          <MapAtlasSidebar
            activeSidebarTab={hook.activeSidebarTab}
            setActiveSidebarTab={hook.setActiveSidebarTab}
            levels={hook.levels}
            annotations={hook.annotations}
            activeLevelId={hook.activeLevelId}
            levelOpacities={hook.levelOpacities}
            hoveredLevelOpacityId={hook.hoveredLevelOpacityId}
            map={map}
            editingLevelId={hook.editingLevelId}
            levelInputText={hook.levelInputText}
            newLevelName={hook.newLevelName}
            editingAnnotationId={hook.editingAnnotationId}
            annotationInputText={hook.annotationInputText}
            annotationInputLevelId={hook.annotationInputLevelId}
            newAnnotationText={hook.newAnnotationText}
            newAnnotationLevelId={hook.newAnnotationLevelId}
            setHoveredLevelOpacityId={hook.setHoveredLevelOpacityId}
            setLevelOpacities={hook.setLevelOpacities}
            setEditingLevelId={hook.setEditingLevelId}
            setLevelInputText={hook.setLevelInputText}
            setNewLevelName={hook.setNewLevelName}
            setEditingAnnotationId={hook.setEditingAnnotationId}
            setAnnotationInputText={hook.setAnnotationInputText}
            setAnnotationInputLevelId={hook.setAnnotationInputLevelId}
            setNewAnnotationText={hook.setNewAnnotationText}
            setNewAnnotationLevelId={hook.setNewAnnotationLevelId}
            handleTeleport={hook.handleTeleport}
            handleSaveEditLevel={hook.handleSaveEditLevel}
            handleDeleteLevel={hook.handleDeleteLevel}
            handleUploadLevelBgImage={hook.handleUploadLevelBgImage}
            handleAddLevel={hook.handleAddLevel}
            handleAddAnnotation={hook.handleAddAnnotation}
            handleSaveEditAnnotation={hook.handleSaveEditAnnotation}
            handleDeleteAnnotation={hook.handleDeleteAnnotation}
            updateAtlasCache={hook.updateAtlasCache}
          />
        )}
      </div>

      {/* --- BARRA DE CONTROL SUPERIOR --- */}
      <MapAtlasControlBar
        viewMode={hook.viewMode}
        setViewMode={hook.setViewMode}
        appMode={hook.appMode}
        setAppMode={hook.setAppMode}
        activeLevelId={hook.activeLevelId}
        levels={hook.levels}
        overlayAllLayers={overlayAllLayers}
        setOverlayAllLayers={setOverlayAllLayers}
        activeMenu={hook.activeMenu}
        setActiveMenu={hook.setActiveMenu}
        drawTool={hook.drawTool}
        setDrawTool={hook.setDrawTool}
        brushColor={hook.brushColor}
        setBrushColor={hook.setBrushColor}
        brushSize={hook.brushSize}
        setBrushSize={hook.setBrushSize}
        backdropOpacity={hook.backdropOpacity}
        setBackdropOpacity={hook.setBackdropOpacity}
        handleTeleport={hook.handleTeleport}
        handleBack={hook.handleBack}
        handleClearCanvas={hook.handleClearCanvas}
        saveAtlasState={hook.saveAtlasState}
      />
    </div>
  );
};

export default InteractiveMapView;
