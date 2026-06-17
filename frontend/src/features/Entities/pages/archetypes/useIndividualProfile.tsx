import React, { useState, useEffect } from "react";
import { useParams, useNavigate, useOutletContext } from "react-router-dom";
import { EntityUseCase } from "@features/Entities";
import { TemplateUseCase } from "@features/Settings";
import { Entidad, Valor } from "@domain/database";
import { useQuery } from "@tanstack/react-query";

// --- Interfaces ---
export interface ProfileOutletContext {
  setRightOpen: (open: boolean) => void;
  setRightPanelTab: (tab: string) => void;
  setRightPanelContent: (content: React.ReactNode) => void;
  setRightPanelTitle: (title: React.ReactNode) => void;
}

export interface SpecificEntityData extends Entidad {
  images?: string[];
  notes?: string[];
  [key: string]: unknown;
}

export const individualEntityQueryKey = (entityId: number) =>
  ["individual-entity", entityId] as const;

/**
 * ðŸ§  useIndividualProfile
 * Logic hook for IndividualProfileView.
 * Handles data fetching, side panel synchronization, and business actions.
 */
export const useIndividualProfile = (propEntityId?: string | number) => {
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

  const { data: profileData, isLoading: loading } = useQuery({
    queryKey: individualEntityQueryKey(numericEntityId),
    enabled: Number.isFinite(numericEntityId) && numericEntityId > 0,
    queryFn: async (): Promise<{
      entity: SpecificEntityData | null;
      attributes: Valor[];
      subNodes: Entidad[];
    }> => {
      const data = await EntityUseCase.getById(numericEntityId);

      switch (!!data) {
        case false:
          return {
            entity: null,
            attributes: [],
            subNodes: [],
          };
        default:
          break;
      }

      const individualEntity: Entidad = data!;
      const extra =
        typeof individualEntity.contenido_json === "string"
          ? JSON.parse(individualEntity.contenido_json)
          : individualEntity.contenido_json || {};

      const vals = await TemplateUseCase.getEntityValues(individualEntity.id);
      const allEntities = await EntityUseCase.getAllByProject(
        individualEntity.project_id,
      );
      const children = allEntities.filter((e) => {
        const eExtra =
          typeof e.contenido_json === "string"
            ? JSON.parse(e.contenido_json)
            : e.contenido_json || {};
        return (
          e.carpeta_id === individualEntity.id ||
          eExtra.padre_id === individualEntity.id ||
          eExtra.parent_id === individualEntity.id
        );
      });

      return {
        entity: { ...extra, ...individualEntity },
        attributes: vals,
        subNodes: children,
      };
    },
  });

  const entity = profileData?.entity || null;
  const attributes = profileData?.attributes || [];
  const subNodes = profileData?.subNodes || [];

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
            ELEMENTOS VINCULADOS
          </span>
        </div>,
      );

      setRightPanelContent(
        <div className="flex flex-col h-full bg-background">
          <div className="p-6 border-b border-foreground/5">
            <span className="text-[10px] font-black text-foreground/20 uppercase tracking-widest">
              Dependencias de {entity.nombre}
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
                  inventory_2
                </span>
                <div className="text-[10px] uppercase tracking-widest font-black text-foreground/20">
                  Sin nodos asociados
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
    entityId,
  };
};

