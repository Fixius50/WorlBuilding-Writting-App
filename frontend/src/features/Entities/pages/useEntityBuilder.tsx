import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  useParams,
  useOutletContext,
  useNavigate,
  useLocation,
} from "react-router-dom";
import { WorkspaceUseCase } from "@application/useCases/WorkspaceUseCase";
import { EntityUseCase } from "@application/useCases/EntityUseCase";
import { TemplateUseCase } from "@application/useCases/TemplateUseCase";
import { Entidad, Plantilla, Carpeta, Valor } from "@domain/models/database";
import { useQuery } from "@tanstack/react-query";
import { getThemePrimaryHex } from "@infrastructure/utils/themeColor";

// --- Interfaces ---
export interface LayoutContext {
  projectId: number;
}

export interface EntityField {
  id: number | string;
  attribute: Plantilla;
  value: string;
  isTemp: boolean;
}

export interface EntityExtras {
  color?: string;
  tags?: string;
  iconUrl?: string | null;
  categoria?: string;
  appearance?: string;
  notes?: string;
  images?: string[];
}

/**
 * 🧠 useEntityBuilder
 * The master brain behind EntityBuilder.tsx.
 * Orchestrates entity lifecycle (creation/edit), attribute management,
 * image gallery, and path synchronization.
 */
export const useEntityBuilder = (mode: "creation" | "edit") => {
  const { username, projectName, entityId, folderId, type } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isCreation, setIsCreation] = useState(mode === "creation");

  const { projectId } = useOutletContext<LayoutContext>();

  const primaryHex = getThemePrimaryHex();

  // --- Core Data State ---
  const [entity, setEntity] = useState<Partial<Entidad>>({
    nombre: "",
    tipo: type || "PERSONAJE",
    descripcion: "",
    contenido_json: JSON.stringify({
      color: primaryHex,
      tags: "",
      iconUrl: null,
      categoria: "Individual",
      appearance: "",
      notes: "",
      images: [],
    }),
    project_id: projectId || 1,
    carpeta_id: folderId ? Number(folderId) : null,
  });

  const [path, setPath] = useState<Carpeta[]>([]);
  const [fields, setFields] = useState<EntityField[]>([]);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [removedFieldIds, setRemovedFieldIds] = useState<number[]>([]);
  const [availableTemplates, setAvailableTemplatesLocal] = useState<
    Plantilla[]
  >([]);
  const [activeEntityTab, setActiveEntityTab] = useState("identity");
  const [zoomImage, setZoomImage] = useState<string | null>(null);
  const [showLibrary, setShowLibrary] = useState<boolean>(false);
  const [editingTemplate, setEditingTemplate] = useState<Plantilla | null>(
    null,
  );
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  const entityBuilderQueryKey = [
    "entity-builder-init",
    projectId || 1,
    isCreation,
    entityId ? Number(entityId) : 0,
  ] as const;

  // --- Safe Extra Management ---
  const getExtra = useCallback((): EntityExtras => {
    try {
      return JSON.parse(entity.contenido_json || "{}") as EntityExtras;
    } catch (e) {
      return {};
    }
  }, [entity.contenido_json]);

  const updateExtra = useCallback(
    (updates: Partial<EntityExtras>) => {
      const current = getExtra();
      setEntity((prev) => ({
        ...prev,
        contenido_json: JSON.stringify({ ...current, ...updates }),
      }));
    },
    [getExtra],
  );

  // --- Initialization & Data Fetching ---
  const {
    data: builderInitData,
    isLoading: loading,
    refetch: refetchBuilderInit,
  } = useQuery({
    queryKey: entityBuilderQueryKey,
    enabled: Number.isFinite(projectId || 1),
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<{
      templates: Plantilla[];
      loadedEntity: Partial<Entidad> | null;
      loadedFields: EntityField[];
    }> => {
      const templates = await TemplateUseCase.getTemplates(projectId || 1);

      switch (true) {
        case !isCreation && !!entityId: {
          const data = await EntityUseCase.getById(Number(entityId));
          if (data) {
            const vals = await TemplateUseCase.getEntityValues(data.id);
            const loadedFields: EntityField[] = vals.map((v) => ({
              id: v.id,
              attribute:
                v.plantilla ||
                ({
                  id: v.plantilla_id,
                  nombre: "Unknown",
                  tipo: "text",
                } as Plantilla),
              value: v.valor || "",
              isTemp: false,
            }));

            return {
              templates,
              loadedEntity: data,
              loadedFields,
            };
          }
          break;
        }
        default:
          break;
      }

      return {
        templates,
        loadedEntity: null,
        loadedFields: [],
      };
    },
  });

  const refreshTemplates = useCallback(async () => {
    try {
      const result = await refetchBuilderInit();
      const templates = result.data?.templates || [];
      setAvailableTemplatesLocal(templates);
      return templates;
    } catch (err) {
      console.error("Error refreshing templates:", err);
      return [];
    }
  }, [refetchBuilderInit]);

  useEffect(() => {
    // Panel derecho eliminado: antes se publicaba "Constructor de Entidad" en panel contextual.
  }, []);

  useEffect(() => {
    if (!builderInitData) {
      return;
    }

    setAvailableTemplatesLocal(builderInitData.templates || []);

    if (!isCreation && builderInitData.loadedEntity) {
      setEntity(builderInitData.loadedEntity);
      setFields(builderInitData.loadedFields || []);
    }
  }, [builderInitData, isCreation]);

  // Sync projectId
  useEffect(() => {
    if (projectId && entity.project_id !== projectId) {
      setEntity((prev) => ({ ...prev, project_id: projectId }));
    }
  }, [projectId, entity.project_id]);

  // Sync Folder Path
  useEffect(() => {
    const loadPath = async () => {
      if (entity.carpeta_id) {
        const p = await WorkspaceUseCase.getFolderPath(entity.carpeta_id);
        setPath(p);
      }
    };
    loadPath();
  }, [entity.carpeta_id]);

  // --- Handlers ---
  const handleSave = useCallback(
    async (redirect = true) => {
      setSaving(true);
      try {
        let savedEntity: Entidad;
        if (isCreation) {
          savedEntity = await EntityUseCase.create(
            entity as Omit<
              Entidad,
              "id" | "fecha_creacion" | "fecha_actualizacion" | "borrado"
            >,
          );
        } else {
          await EntityUseCase.update(entity.id!, entity as Partial<Entidad>);
          const refreshed = await EntityUseCase.getById(entity.id!);
          savedEntity = refreshed ?? (entity as unknown as Entidad);
        }

        window.dispatchEvent(
          new CustomEvent("folder-update", {
            detail: { folderId: savedEntity.carpeta_id },
          }),
        );

        for (const f of fields) {
          if (f.isTemp) {
            await TemplateUseCase.addEntityValue(
              savedEntity.id,
              f.attribute.id,
              f.value,
            );
          } else {
            await TemplateUseCase.updateEntityValue(f.id as number, f.value);
          }
        }

        for (const rid of removedFieldIds) {
          await TemplateUseCase.deleteEntityValue(rid);
        }

        if (redirect) {
          navigate(-1);
        } else {
          setEntity(savedEntity);
          setIsCreation(false);
          setRemovedFieldIds([]);
          const freshValues = await TemplateUseCase.getEntityValues(
            savedEntity.id,
          );
          setFields(
            freshValues.map((v) => ({
              id: v.id,
              attribute:
                v.plantilla ||
                ({
                  id: v.plantilla_id,
                  nombre: "Unknown",
                  tipo: "text",
                } as Plantilla),
              value: v.valor || "",
              isTemp: false,
            })),
          );
        }
      } catch (err) {
        console.error("Error saving entity:", err);
      } finally {
        setSaving(false);
      }
    },
    [entity, fields, isCreation, navigate, removedFieldIds],
  );

  const handleFieldChange = (fieldId: number | string, value: string) => {
    setFields((prev) =>
      prev.map((f) => (f.id === fieldId ? { ...f, value } : f)),
    );
  };

  const handleRemoveField = (fieldId: number | string) => {
    const field = fields.find((f) => f.id === fieldId);
    if (field && !field.isTemp) {
      setRemovedFieldIds((prev) => [...prev, field.id as number]);
    }
    setFields((prev) => prev.filter((f) => f.id !== fieldId));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const readAsDataUrl = (file: File) =>
      new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result || ""));
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });

    try {
      const uploadedImages = await Promise.all(
        Array.from(files).map((file) => readAsDataUrl(file)),
      );

      const current = getExtra();
      const mergedImages = [
        ...(current.images || []),
        ...uploadedImages,
      ].filter((img) => !!img);
      updateExtra({ images: mergedImages });
    } catch (err) {
      console.error("Error uploading images:", err);
    } finally {
      e.target.value = "";
    }
  };

  const removeImage = (index: number) => {
    const current = getExtra();
    const imgs = (current.images || []).filter(
      (_: string, i: number) => i !== index,
    );
    updateExtra({ images: imgs });
  };

  // --- Drag & Drop ---
  const handleDragOverArea = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    setIsDraggingOver(true);
  };

  const handleDragLeaveArea = () => {
    setIsDraggingOver(false);
  };

  const handleDropArea = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingOver(false);
    try {
      const data =
        e.dataTransfer.getData("application/worldbuilder/attribute") ||
        e.dataTransfer.getData("text/plain");
      if (data) {
        const tpl = JSON.parse(data) as Plantilla;
        setFields((prev) => [
          ...prev,
          {
            id: `temp-${tpl.id}-${Date.now()}`,
            attribute: tpl,
            value: tpl.valor_defecto || "",
            isTemp: true,
          },
        ]);
      }
    } catch (err) {
      console.error("Error dropping attribute:", err);
    }
  };

  const handleDeleteEntity = async () => {
    if (entity.id) {
      await EntityUseCase.delete(entity.id);
      window.dispatchEvent(
        new CustomEvent("folder-update", {
          detail: { folderId: entity.carpeta_id },
        }),
      );
      navigate(-1);
    }
  };

  const isInBible = location.pathname.includes("/bible");

  return {
    // States
    entity,
    setEntity,
    fields,
    loading,
    saving,
    deleteModalOpen,
    setDeleteModalOpen,
    availableTemplates,
    activeEntityTab,
    setActiveEntityTab,
    zoomImage,
    setZoomImage,
    showLibrary,
    setShowLibrary,
    editingTemplate,
    setEditingTemplate,
    isDraggingOver,

    // Computed
    extras: getExtra(),
    projectName,
    projectId,

    // Handlers
    handleSave,
    handleFieldChange,
    handleRemoveField,
    handleImageUpload,
    removeImage,
    handleDragOverArea,
    handleDragLeaveArea,
    handleDropArea,
    handleDeleteEntity,
    updateExtra,
    refreshTemplates,
    navigate,
  };
};
