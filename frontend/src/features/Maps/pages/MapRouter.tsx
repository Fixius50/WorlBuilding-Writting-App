import React, { useState, useEffect } from "react";
import {
  useParams,
  useNavigate,
  useOutletContext,
  Routes,
  Route,
} from "react-router-dom";
import MapCreationWizard from "./MapCreationWizard";
import { MapEditor } from "@features/Specialized";
import InteractiveMapView from "./InteractiveMapView";
import MapManager from "./MapManager";
import { EntityUseCase } from "@features/Entities";
import { WorkspaceUseCase } from "@features/Workspaces";
import { ConfirmationModal } from "@components";
import { Entidad } from "@domain/database";
import {
  MapAggregateService,
  MapCreationConfig,
} from "../domain/MapAggregateService";

const MapViewerWrapper = ({ maps, projectName }: { maps: Entidad[]; projectName: string }) => {
  const { mapId } = useParams();
  const navigate = useNavigate();
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
  ): Promise<void> => {
    projectId ? await (async (): Promise<void> => {
      try {
        const folders = await WorkspaceUseCase.getRootFolders(projectId);
        let defaultFolder =
          folders.find((f) => f.nombre.toLowerCase().includes("map")) ||
          folders[0];

        const hasFolder = !!defaultFolder;
        defaultFolder = hasFolder ? defaultFolder : await WorkspaceUseCase.createFolder(
          "Mapas",
          projectId,
          null,
          "FOLDER"
        );

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
        throw _err;
      }
    })() : null;
  };

  return (
    <div className="relative flex-1 flex flex-col h-full bg-background overflow-hidden">
      <Routes>
        <Route
          index
          element={
            <MapManager
              maps={maps}
              onSelectMap={(map: Entidad) =>
                navigate(`editor/${map.slug || map.id}`)
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
        <Route path="viewer/:mapId" element={<MapViewerWrapper maps={maps} projectName={projectName || ""} />} />
        <Route path="editor/:entityId" element={<MapEditor />} />
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
