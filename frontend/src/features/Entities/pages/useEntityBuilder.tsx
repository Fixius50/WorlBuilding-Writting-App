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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getThemePrimaryHex } from "@infrastructure/utils/themeColor";
import { getPresetTabsByEntityType } from "@features/Entities/utils/entityPresetTabs";

// --- Interfaces ---
export interface LayoutContext {
  projectId: number;
}

export interface EntityField {
  id: number | string;
  attribute: Plantilla & { isModifiedLocal?: boolean };
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
  const queryClient = useQueryClient();
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
  const [editingFieldId, setEditingFieldId] = useState<number | string | null>(
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

  const {
    data: templatesData,
    refetch: refetchTemplatesQuery,
  } = useQuery({
    queryKey: ["entity-builder-templates", projectId || 1],
    enabled: Number.isFinite(projectId || 1),
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<Plantilla[]> => {
      return await TemplateUseCase.getTemplates(projectId || 1);
    }
  });

  const {
    data: entityData,
    isLoading: loading,
  } = useQuery({
    queryKey: ["entity-builder-entity-data", entityId ? Number(entityId) : 0, isCreation],
    enabled: Number.isFinite(projectId || 1),
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<{
      loadedEntity: Partial<Entidad> | null;
      loadedFields: EntityField[];
    }> => {
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
        loadedEntity: null,
        loadedFields: [],
      };
    }
  });

  const { data: linkableEntities = [] } = useQuery({
    queryKey: ["entity-builder-linkable-entities", projectId || 1],
    enabled: Number.isFinite(projectId || 1),
    refetchOnWindowFocus: false,
    queryFn: async (): Promise<Entidad[]> => {
      return await EntityUseCase.getAllByProject(projectId || 1);
    }
  });

  const refreshTemplates = useCallback(async () => {
    try {
      const result = await refetchTemplatesQuery();
      const templates = result.data || [];
      setAvailableTemplatesLocal(templates);
      return templates;
    } catch (err) {
      console.error("Error refreshing templates:", err);
      return [];
    }
  }, [refetchTemplatesQuery]);

  useEffect(() => {
    if (templatesData) {
      setAvailableTemplatesLocal(templatesData);
    }
  }, [templatesData]);

  useEffect(() => {
    if (!entityData) {
      return;
    }

    if (!isCreation && entityData.loadedEntity) {
      setEntity(entityData.loadedEntity);
      setFields(entityData.loadedFields || []);
    }
  }, [entityData, isCreation]);

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
          f.isTemp
            ? await TemplateUseCase.addEntityValue(
                savedEntity.id,
                f.attribute.id,
                f.value,
              )
            : await TemplateUseCase.updateEntityValue(f.id as number, f.value);
        }

        for (const rid of removedFieldIds) {
          await TemplateUseCase.deleteEntityValue(rid);
        }

        await queryClient.invalidateQueries();

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
    [entity, fields, isCreation, navigate, removedFieldIds, projectId],
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

  // --- UI Presentation Constants & State ---
  const defaultEntityColor = getThemePrimaryHex();
  const extras = getExtra();
  const galleryImages = extras.images || [];

  // Pestañas dinámicas y predefinidas del constructor según tipo de entidad
  const baseEditorTabs = [
    { id: "identity", label: "Identidad" },
    { id: "narrative", label: "Narrativa" },
    { id: "attributes", label: "Atributos" },
    { id: "relationships", label: "Relaciones" },
  ];
  const presetEditorTabs = getPresetTabsByEntityType(entity.tipo || "").map(
    (tab) => ({
      id: `preset-${tab.id}`,
      label: tab.label,
      icon: tab.icon,
    }),
  );
  const editorTabs = [...baseEditorTabs];
  presetEditorTabs.forEach((tab) => {
    const exists = editorTabs.some((editorTab) => editorTab.id === tab.id);
    switch (exists) {
      case false:
        editorTabs.push(tab);
        break;
      default:
        break;
    }
  });
  const presetEditorTabIds = presetEditorTabs.map((tab) => tab.id);
  const isPresetEditorTab = presetEditorTabIds.includes(activeEntityTab);

  // Gestión de imágenes principal y secundarias paginadas
  const primaryImage = galleryImages[0] || null;
  const secondaryPool = galleryImages.slice(1);
  const [secondaryPage, setSecondaryPage] = useState(0);
  const secondaryPageSize = 4;
  const secondaryPageCount = Math.max(
    1,
    Math.ceil(secondaryPool.length / secondaryPageSize),
  );

  useEffect(() => {
    if (secondaryPage >= secondaryPageCount) {
      setSecondaryPage(Math.max(0, secondaryPageCount - 1));
    }
  }, [secondaryPage, secondaryPageCount]);

  const secondaryStart = secondaryPage * secondaryPageSize;
  const secondaryImages = secondaryPool.slice(
    secondaryStart,
    secondaryStart + secondaryPageSize,
  );
  const hasMoreImages = secondaryPool.length > secondaryPageSize;

  // Refs de Textareas y control de historial Deshacer/Rehacer
  const appearanceTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const appearanceHistoryRef = React.useRef<string[]>([]);
  const appearanceHistoryIndexRef = React.useRef<number>(-1);
  const narrativeTextareaRef = React.useRef<HTMLTextAreaElement | null>(null);
  const narrativeHistoryRef = React.useRef<string[]>([]);
  const narrativeHistoryIndexRef = React.useRef<number>(-1);

  // Registra un nuevo valor de apariencia en el historial local
  const setAppearanceValue = useCallback(
    (nextValue: string, registerHistory = true) => {
      registerHistory
        ? (() => {
            const history = appearanceHistoryRef.current;
            const currentIndex = appearanceHistoryIndexRef.current;
            const currentValue =
              currentIndex >= 0 ? history[currentIndex] : undefined;

            currentValue !== nextValue
              ? (() => {
                  const truncatedHistory =
                    currentIndex >= 0 ? history.slice(0, currentIndex + 1) : [];
                  truncatedHistory.push(nextValue);

                  appearanceHistoryRef.current = truncatedHistory;
                  appearanceHistoryIndexRef.current = truncatedHistory.length - 1;
                })()
              : undefined;
          })()
        : undefined;
      updateExtra({ appearance: nextValue });
    },
    [updateExtra],
  );

  // Vuelve al estado anterior de la descripción de rasgos
  const handleAppearanceUndo = useCallback(() => {
    const history = appearanceHistoryRef.current;
    const currentIndex = appearanceHistoryIndexRef.current;

    currentIndex > 0
      ? (() => {
          const nextIndex = currentIndex - 1;
          appearanceHistoryIndexRef.current = nextIndex;
          setAppearanceValue(history[nextIndex], false);

          requestAnimationFrame(() => {
            const textarea = appearanceTextareaRef.current;
            textarea && (() => {
              textarea.focus();
              const cursor = textarea.value.length;
              textarea.setSelectionRange(cursor, cursor);
            })();
          });
        })()
      : undefined;
  }, [setAppearanceValue]);

  // Avanza al siguiente estado deshecho de la apariencia
  const handleAppearanceRedo = useCallback(() => {
    const history = appearanceHistoryRef.current;
    const currentIndex = appearanceHistoryIndexRef.current;

    currentIndex < history.length - 1
      ? (() => {
          const nextIndex = currentIndex + 1;
          appearanceHistoryIndexRef.current = nextIndex;
          setAppearanceValue(history[nextIndex], false);

          requestAnimationFrame(() => {
            const textarea = appearanceTextareaRef.current;
            textarea && (() => {
              textarea.focus();
              const cursor = textarea.value.length;
              textarea.setSelectionRange(cursor, cursor);
            })();
          });
        })()
      : undefined;
  }, [setAppearanceValue]);

  useEffect(() => {
    const currentAppearance = extras.appearance || "";
    appearanceHistoryRef.current = [currentAppearance];
    appearanceHistoryIndexRef.current = 0;
  }, [entity.id]);

  // Registra un nuevo valor de la narrativa en el historial local
  const setNarrativeValue = useCallback(
    (nextValue: string, registerHistory = true) => {
      registerHistory
        ? (() => {
            const history = narrativeHistoryRef.current;
            const currentIndex = narrativeHistoryIndexRef.current;
            const currentValue =
              currentIndex >= 0 ? history[currentIndex] : undefined;

            currentValue !== nextValue
              ? (() => {
                  const truncatedHistory =
                    currentIndex >= 0 ? history.slice(0, currentIndex + 1) : [];
                  truncatedHistory.push(nextValue);

                  narrativeHistoryRef.current = truncatedHistory;
                  narrativeHistoryIndexRef.current = truncatedHistory.length - 1;
                })()
              : undefined;
          })()
        : undefined;
      setEntity((prev) => ({ ...prev, descripcion: nextValue }));
    },
    [setEntity],
  );

  // Vuelve al estado de narrativa anterior
  const handleNarrativeUndo = useCallback(() => {
    const history = narrativeHistoryRef.current;
    const currentIndex = narrativeHistoryIndexRef.current;

    currentIndex > 0
      ? (() => {
          const nextIndex = currentIndex - 1;
          narrativeHistoryIndexRef.current = nextIndex;
          setNarrativeValue(history[nextIndex], false);

          requestAnimationFrame(() => {
            const textarea = narrativeTextareaRef.current;
            textarea && (() => {
              textarea.focus();
              const cursor = textarea.value.length;
              textarea.setSelectionRange(cursor, cursor);
            })();
          });
        })()
      : undefined;
  }, [setNarrativeValue]);

  // Avanza al siguiente estado deshecho de la cronología
  const handleNarrativeRedo = useCallback(() => {
    const history = narrativeHistoryRef.current;
    const currentIndex = narrativeHistoryIndexRef.current;

    currentIndex < history.length - 1
      ? (() => {
          const nextIndex = currentIndex + 1;
          narrativeHistoryIndexRef.current = nextIndex;
          setNarrativeValue(history[nextIndex], false);

          requestAnimationFrame(() => {
            const textarea = narrativeTextareaRef.current;
            textarea && (() => {
              textarea.focus();
              const cursor = textarea.value.length;
              textarea.setSelectionRange(cursor, cursor);
            })();
          });
        })()
      : undefined;
  }, [setNarrativeValue]);

  useEffect(() => {
    const currentNarrative = entity.descripcion || "";
    narrativeHistoryRef.current = [currentNarrative];
    narrativeHistoryIndexRef.current = 0;
  }, [entity.id]);

  // Envoltura automática de texto con marcadores Markdown para la narrativa
  const applyNarrativeWrapFormatting = useCallback(
    (wrapper: "**" | "*") => {
      const textarea = narrativeTextareaRef.current;
      if (!textarea) {
        return;
      }
      const currentValue = entity.descripcion || "";
      const start = textarea.selectionStart ?? currentValue.length;
      const end = textarea.selectionEnd ?? currentValue.length;
      const selectedText = currentValue.slice(start, end);
      const wrappedText = `${wrapper}${selectedText}${wrapper}`;
      const nextValue =
        currentValue.slice(0, start) + wrappedText + currentValue.slice(end);

      setNarrativeValue(nextValue);

      requestAnimationFrame(() => {
        const updatedTextarea = narrativeTextareaRef.current;
        if (!updatedTextarea) {
          return;
        }
        updatedTextarea.focus();
        const selectionStart = start + wrapper.length;
        const selectionEnd = selectionStart + selectedText.length;
        updatedTextarea.setSelectionRange(selectionStart, selectionEnd);
      });
    },
    [entity.descripcion, setNarrativeValue],
  );

  // Indentación por tabulación dentro de la caja de narrativa
  const applyNarrativeTabIndent = useCallback(() => {
    const textarea = narrativeTextareaRef.current;
    if (!textarea) {
      return;
    }
    const currentValue = entity.descripcion || "";
    const start = textarea.selectionStart ?? currentValue.length;
    const end = textarea.selectionEnd ?? currentValue.length;
    const selectedText = currentValue.slice(start, end);
    const hasSelection = end > start;

    hasSelection
      ? (() => {
          const indentedSelection = selectedText
            .split("\n")
            .map((line) => `\t${line}`)
            .join("\n");

          const nextValue =
            currentValue.slice(0, start) +
            indentedSelection +
            currentValue.slice(end);

          setNarrativeValue(nextValue);

          requestAnimationFrame(() => {
            const updatedTextarea = narrativeTextareaRef.current;
            updatedTextarea && (() => {
              updatedTextarea.focus();
              updatedTextarea.setSelectionRange(
                start,
                start + indentedSelection.length,
              );
            })();
          });
        })()
      : (() => {
          const nextValue =
            currentValue.slice(0, start) + "\t" + currentValue.slice(end);

          setNarrativeValue(nextValue);

          requestAnimationFrame(() => {
            const updatedTextarea = narrativeTextareaRef.current;
            updatedTextarea && (() => {
              updatedTextarea.focus();
              const cursorPosition = start + 1;
              updatedTextarea.setSelectionRange(cursorPosition, cursorPosition);
            })();
          });
        })();
  }, [entity.descripcion, setNarrativeValue]);

  // Manejo de atajos de teclado del editor Markdown de cronología (Ctrl+B, Ctrl+I, Ctrl+Z, Tab)
  const handleNarrativeKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const hasCommandModifier = event.ctrlKey || event.metaKey;

      switch (true) {
        case hasCommandModifier && event.key.toLowerCase() === "b":
          event.preventDefault();
          applyNarrativeWrapFormatting("**");
          break;
        case hasCommandModifier && event.key.toLowerCase() === "i":
          event.preventDefault();
          applyNarrativeWrapFormatting("*");
          break;
        case hasCommandModifier &&
          event.shiftKey &&
          event.key.toLowerCase() === "z":
          event.preventDefault();
          handleNarrativeRedo();
          break;
        case hasCommandModifier && event.key.toLowerCase() === "z":
          event.preventDefault();
          handleNarrativeUndo();
          break;
        case hasCommandModifier && event.key.toLowerCase() === "y":
          event.preventDefault();
          handleNarrativeRedo();
          break;
        case event.key === "Tab":
          event.preventDefault();
          applyNarrativeTabIndent();
          break;
        default:
          break;
      }
    },
    [
      applyNarrativeTabIndent,
      applyNarrativeWrapFormatting,
      handleNarrativeRedo,
      handleNarrativeUndo,
    ],
  );

  // Envoltura de texto con marcadores Markdown para rasgos/apariencia
  const applyWrapFormatting = useCallback(
    (wrapper: "**" | "*") => {
      const textarea = appearanceTextareaRef.current;
      if (!textarea) {
        return;
      }
      const currentValue = extras.appearance || "";
      const start = textarea.selectionStart ?? currentValue.length;
      const end = textarea.selectionEnd ?? currentValue.length;
      const selectedText = currentValue.slice(start, end);
      const wrappedText = `${wrapper}${selectedText}${wrapper}`;
      const nextValue =
        currentValue.slice(0, start) + wrappedText + currentValue.slice(end);

      setAppearanceValue(nextValue);

      requestAnimationFrame(() => {
        const updatedTextarea = appearanceTextareaRef.current;
        if (!updatedTextarea) {
          return;
        }
        updatedTextarea.focus();
        const selectionStart = start + wrapper.length;
        const selectionEnd = selectionStart + selectedText.length;
        updatedTextarea.setSelectionRange(selectionStart, selectionEnd);
      });
    },
    [extras.appearance, setAppearanceValue],
  );

  // Indentación por tabulación dentro de la caja de rasgos/apariencia
  const applyTabIndent = useCallback(() => {
    const textarea = appearanceTextareaRef.current;
    if (!textarea) {
      return;
    }
    const currentValue = extras.appearance || "";
    const start = textarea.selectionStart ?? currentValue.length;
    const end = textarea.selectionEnd ?? currentValue.length;
    const selectedText = currentValue.slice(start, end);
    const hasSelection = end > start;

    hasSelection
      ? (() => {
          const indentedSelection = selectedText
            .split("\n")
            .map((line) => `\t${line}`)
            .join("\n");

          const nextValue =
            currentValue.slice(0, start) +
            indentedSelection +
            currentValue.slice(end);

          setAppearanceValue(nextValue);

          requestAnimationFrame(() => {
            const updatedTextarea = appearanceTextareaRef.current;
            updatedTextarea && (() => {
              updatedTextarea.focus();
              updatedTextarea.setSelectionRange(
                start,
                start + indentedSelection.length,
              );
            })();
          });
        })()
      : (() => {
          const nextValue =
            currentValue.slice(0, start) + "\t" + currentValue.slice(end);

          setAppearanceValue(nextValue);

          requestAnimationFrame(() => {
            const updatedTextarea = appearanceTextareaRef.current;
            updatedTextarea && (() => {
              updatedTextarea.focus();
              const cursorPosition = start + 1;
              updatedTextarea.setSelectionRange(cursorPosition, cursorPosition);
            })();
          });
        })();
  }, [extras.appearance, setAppearanceValue]);

  // Manejo de atajos de teclado del editor de Apariencia (Ctrl+B, Ctrl+I, Ctrl+Z, Tab)
  const handleAppearanceKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
      const hasCommandModifier = event.ctrlKey || event.metaKey;

      switch (true) {
        case hasCommandModifier && event.key.toLowerCase() === "b":
          event.preventDefault();
          applyWrapFormatting("**");
          break;
        case hasCommandModifier && event.key.toLowerCase() === "i":
          event.preventDefault();
          applyWrapFormatting("*");
          break;
        case hasCommandModifier &&
          event.shiftKey &&
          event.key.toLowerCase() === "z":
          event.preventDefault();
          handleAppearanceRedo();
          break;
        case hasCommandModifier && event.key.toLowerCase() === "z":
          event.preventDefault();
          handleAppearanceUndo();
          break;
        case hasCommandModifier && event.key.toLowerCase() === "y":
          event.preventDefault();
          handleAppearanceRedo();
          break;
        case event.key === "Tab":
          event.preventDefault();
          applyTabIndent();
          break;
        default:
          break;
      }
    },
    [
      applyTabIndent,
      applyWrapFormatting,
      handleAppearanceRedo,
      handleAppearanceUndo,
    ],
  );

  return {
    // States
    entity,
    setEntity,
    fields,
    setFields,
    setRemovedFieldIds,
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
    editingFieldId,
    setEditingFieldId,
    isDraggingOver,

    // UI State & Functions migrated from EntityBuilder.tsx
    defaultEntityColor,
    extras,
    galleryImages,
    editorTabs,
    isPresetEditorTab,
    linkableEntities,
    primaryImage,
    secondaryImages,
    secondaryStart,
    hasMoreImages,
    secondaryPage,
    setSecondaryPage,
    secondaryPageCount,
    appearanceTextareaRef,
    narrativeTextareaRef,
    handleAppearanceUndo,
    handleAppearanceRedo,
    handleAppearanceKeyDown,
    handleNarrativeUndo,
    handleNarrativeRedo,
    handleNarrativeKeyDown,
    setAppearanceValue,
    setNarrativeValue,
    applyWrapFormatting,
    applyTabIndent,
    applyNarrativeWrapFormatting,
    applyNarrativeTabIndent,

    // Computed
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

