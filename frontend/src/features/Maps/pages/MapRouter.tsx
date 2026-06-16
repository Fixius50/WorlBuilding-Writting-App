import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  useOutletContext,
  Routes,
  Route,
} from "react-router-dom";
import MapCreationWizard from "./MapCreationWizard";
import MapEditor from "@features/Specialized/pages/MapEditor";
import InteractiveMapView from "./InteractiveMapView";
import MapManager from "./MapManager";
import { EntityUseCase } from "@application/useCases/EntityUseCase";
import { WorkspaceUseCase } from "@application/useCases/WorkspaceUseCase";
import ConfirmationModal from "@organisms/ConfirmationModal";
import { Entidad } from "@domain/models/database";
import {
  MapAggregateService,
  MapCreationConfig,
} from "../domain/MapAggregateService";

const MapRouter = () => {
  const outletContext = useOutletContext<unknown>();
  const { projectId } = outletContext as { projectId: number };
  const { projectName } = useParams<{ projectName: string }>();
  const navigate = useNavigate();
  const [maps, setMaps] = useState<Entidad[]>([]);
  const [mapToDelete, setMapToDelete] = useState<Entidad | null>(null);

  useEffect(() => {
    projectId ? loadMaps() : null;
    const handleRefresh = () => loadMaps();
    window.addEventListener("map-updated", handleRefresh);
    return () => window.removeEventListener("map-updated", handleRefresh);
  }, [projectId]);

  const loadMaps = async () => {
    if (!projectId) return;
    try {
      const allEntities = await EntityUseCase.getAllByProject(projectId);
      const mapEntities = MapAggregateService.extractMapEntities(allEntities);
      setMaps(mapEntities);
    } catch (_err) {
      // [LOG REMOVED]
    }
  };

  const handleDuplicateMap = async (map: Entidad) => {
    if (!projectId) return;
    try {
      const duplicateContent = MapAggregateService.duplicateMapContent(map);
      await EntityUseCase.create({
        nombre: `${map.nombre} (Copia)`,
        tipo: map.tipo,
        descripcion: map.descripcion,
        project_id: projectId,
        carpeta_id: map.carpeta_id,
        contenido_json: duplicateContent,
        slug: "",
        folder_slug: "",
        imagen_url: "",
      });
      await loadMaps();
    } catch (_err) {
      // [LOG REMOVED]
    }
  };

  const confirmDeleteMap = async () => {
    if (!mapToDelete) return;
    try {
      await EntityUseCase.delete(mapToDelete.id);
      setMapToDelete(null);
      await loadMaps();
    } catch (err) {
      /* Ignored */
    }
  };

  const handleCreateMap = async (
    mapName: string,
    config: MapCreationConfig,
  ) => {
    if (!projectId) return;
    try {
      const folders = await WorkspaceUseCase.getRootFolders(projectId);
      const defaultFolder =
        folders.find((f) => f.nombre.toLowerCase().includes("map")) ||
        folders[0];
      if (!defaultFolder) return;

      const payload = MapAggregateService.buildMapPayload(
        mapName,
        projectId,
        defaultFolder.id,
        config,
      );
      const newEntity = await EntityUseCase.create(payload);
      await loadMaps();
      navigate(
        `/local/${projectName}/map/editor/${newEntity.slug || newEntity.id}`,
      );
    } catch (_err) {
      // [LOG REMOVED]
    }
  };

  const MapViewerWrapper = () => {
    const { mapId } = useParams();
    const map = MapAggregateService.resolveMapByIdOrSlug(maps, mapId);
    const content = !map ? (
      <div className="p-10 text-foreground/50 uppercase text-[10px] font-black">
        Cargando mapa...
      </div>
    ) : (
      <InteractiveMapView
        map={map}
        onBack={() => navigate(`/local/${projectName}/map`)}
      />
    );
    return content;
  };

  const MapEditorWrapper = () => {
    return <MapEditor />;
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
      <Routes>
        <Route
          index
          element={
            <MapManager
              maps={maps}
              onSelectMap={(map: Entidad) =>
                navigate(`viewer/${map.slug || map.id}`)
              }
              onCreateMap={() => navigate(`wizard`)}
              onDuplicateMap={handleDuplicateMap}
              onDeleteMap={(map: Entidad) => setMapToDelete(map)}
              onEditMap={(map: Entidad) =>
                navigate(`editor/${map.slug || map.id}`)
              }
            />
          }
        />
        <Route path="viewer/:mapId" element={<MapViewerWrapper />} />
        <Route path="editor/:entityId" element={<MapEditorWrapper />} />
        <Route
          path="wizard"
          element={
            <MapCreationWizard
              onCancel={() => navigate("..")}
              onCreate={handleCreateMap}
              projectName={projectName || ""}
            />
          }
        />
      </Routes>

      <ConfirmationModal
        isOpen={!!mapToDelete}
        onClose={() => setMapToDelete(null)}
        onConfirm={confirmDeleteMap}
        title="Eliminar Mapa"
        message={`¿Estás seguro de que quieres eliminar el mapa "${mapToDelete?.nombre}"? Esta acción no se puede deshacer.`}
        confirmText="Eliminar"
        type="danger"
      />
    </div>
  );
};

export default MapRouter;
