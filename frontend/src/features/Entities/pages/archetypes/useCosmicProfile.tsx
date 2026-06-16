import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { EntityUseCase } from "@application/EntityUseCase";
import { TemplateUseCase } from "@application/TemplateUseCase";
import { Entidad, Valor } from "@domain/database";
import {
  CanvasNode,
  CanvasEdge,
} from "@presentation/organisms/editor/UniversalCanvas";
import { useQuery } from "@tanstack/react-query";
import { entityService } from "@repositories/entityService";

// --- Interfaces ---
export interface ProfileOutletContext {
  setRightOpen: (open: boolean) => void;
  setRightPanelTab: (tab: string) => void;
  setRightPanelContent: (content: React.ReactNode) => void;
  setRightPanelTitle: (title: React.ReactNode) => void;
}

export interface CosmicEntityData extends Entidad {
  images?: string[];
  notes?: string[];
  [key: string]: unknown;
}

export const cosmicEntityQueryKey = (entityId: number) =>
  ["cosmic-entity", entityId] as const;

/**
 * 🧠 useCosmicProfile
 * Logic hook for CosmicProfileView.
 */
export const useCosmicProfile = (propEntityId?: string | number) => {
  const { username, entityId: paramEntityId, projectName } = useParams();
  const entityId = propEntityId || paramEntityId;
  const numericEntityId = Number(entityId);
  const navigate = useNavigate();
  const {
    setRightOpen,
    setRightPanelTab,
    setRightPanelContent,
    setRightPanelTitle,
  } = useOutletContext<ProfileOutletContext>();

  // --- States ---
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<string>("REGISTRO");

  const { data: cosmicData, isLoading: loading } = useQuery({
    queryKey: cosmicEntityQueryKey(numericEntityId),
    enabled: Number.isFinite(numericEntityId) && numericEntityId > 0,
    queryFn: async (): Promise<{
      entity: CosmicEntityData | null;
      nodes: CanvasNode[];
      edges: CanvasEdge[];
      subNodes: Entidad[];
      attributes: Valor[];
    }> => {
      const data = await entityService.getById(numericEntityId);

      switch (!!data) {
        case false:
          return {
            entity: null,
            nodes: [],
            edges: [],
            subNodes: [],
            attributes: [],
          };
        default:
          break;
      }

      const cosmicEntity: Entidad = data!;

      const extra =
        typeof cosmicEntity.contenido_json === "string"
          ? JSON.parse(cosmicEntity.contenido_json)
          : cosmicEntity.contenido_json || {};

      const vals = await TemplateUseCase.getEntityValues(cosmicEntity.id);

      const allEntities = await EntityUseCase.getAllByProject(
        cosmicEntity.project_id,
      );
      const children = allEntities.filter((e) => {
        const eExtra =
          typeof e.contenido_json === "string"
            ? JSON.parse(e.contenido_json)
            : e.contenido_json || {};
        return (
          e.carpeta_id === cosmicEntity.id ||
          eExtra.padre_id === cosmicEntity.id ||
          eExtra.parent_id === cosmicEntity.id
        );
      });

      const newNodes: CanvasNode[] = children.map((c, i) => {
        const radius = 250;
        const angle = (i / (children.length || 1)) * 2 * Math.PI;
        return {
          id: String(c.id),
          x: 600 + radius * Math.cos(angle),
          y: 400 + radius * Math.sin(angle),
          label: c.nombre,
          tipo: c.tipo || "DESCONOCIDO",
        };
      });

      newNodes.push({
        id: String(cosmicEntity.id),
        x: 600,
        y: 400,
        label: cosmicEntity.nombre,
        tipo: cosmicEntity.tipo || "DESCONOCIDO",
      });

      const newEdges: CanvasEdge[] = children.map((c) => ({
        id: `e-${cosmicEntity.id}-${c.id}`,
        from: String(cosmicEntity.id),
        to: String(c.id),
      }));

      return {
        entity: { ...extra, ...cosmicEntity },
        nodes: newNodes,
        edges: newEdges,
        subNodes: children,
        attributes: vals,
      };
    },
  });

  const entity = cosmicData?.entity || null;
  const nodes = cosmicData?.nodes || [];
  const edges = cosmicData?.edges || [];
  const subNodes = cosmicData?.subNodes || [];
  const attributes = cosmicData?.attributes || [];

  // --- Right Panel Orchestration ---
  useEffect(() => {
    if (entity) {
      setRightOpen(true);
      setRightPanelTab("HIERARCHY");
      setRightPanelTitle(
        <div className="flex items-center justify-center gap-2 font-mono w-full">
          <span className="material-symbols-outlined text-foreground/40 text-sm">
            hub
          </span>
          <span className="text-[10px] font-black uppercase tracking-widest text-center">
            CUERPOS VINCULADOS
          </span>
        </div>,
      );

      setRightPanelContent(
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 border-b border-foreground/5">
            <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">
              Órbitas de {entity.nombre}
            </span>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {subNodes.length > 0 ? (
              subNodes.map((node) => (
                <div
                  key={node.id}
                  onClick={() =>
                    navigate(
                      `/${username || "local"}/${projectName}/bible/entity/${node.id}`,
                    )
                  }
                  className="p-6 bg-background border-b border-foreground/5 hover:bg-foreground/[0.02] cursor-pointer group flex items-center justify-between transition-all"
                >
                  <div className="flex flex-col">
                    <span className="text-xs font-black text-foreground/60 group-hover:text-foreground uppercase tracking-widest transition-colors">
                      {node.nombre}
                    </span>
                    <span className="text-[8px] font-bold text-foreground/20 uppercase mt-1">
                      {node.tipo}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-foreground/10 text-sm group-hover:text-foreground/40 transition-all">
                    arrow_forward_ios
                  </span>
                </div>
              ))
            ) : (
              <div className="p-16 text-center flex flex-col items-center gap-4">
                <span className="material-symbols-outlined text-4xl text-foreground/5">
                  public
                </span>
                <div className="text-[10px] uppercase tracking-widest font-black text-foreground/20">
                  Sector Vacío
                </div>
              </div>
            )}
          </div>
        </div>,
      );
    }
  }, [
    entity,
    subNodes,
    username,
    projectName,
    navigate,
    setRightOpen,
    setRightPanelTab,
    setRightPanelTitle,
    setRightPanelContent,
  ]);

  // --- Actions ---
  const handleDelete = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      setTimeout(() => setConfirmDelete(false), 3000);
      return;
    }
    try {
      await EntityUseCase.delete(Number(entityId));
      navigate(`/${username || "local"}/${projectName}/bible`);
    } catch (err) {
      console.error("Error deleting entity:", err);
    }
  };

  return {
    entity,
    attributes,
    loading,
    confirmDelete,
    activeTab,
    setActiveTab,
    handleDelete,
    projectName,
    username,
    navigate,
    nodes,
    edges,
    entityId,
  };
};
