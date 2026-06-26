import { ReactRenderer } from "@tiptap/react";
import { SuggestionOptions, SuggestionProps } from "@tiptap/suggestion";
import tippy, { Instance, Props } from "tippy.js";
import { MentionList } from "@features/Editor";
import { useAppStore } from "@features/App";
import { useSettingsStore } from "@features/Settings";
import { entityService } from "@repositories/entityService";

type MentionEntity = {
  id: number | string;
  nombre: string;
  tipo?: string;
  descripcion?: string;
  contenido_json?: unknown;
  borrado?: number;
};

type MentionItem = {
  id: string;
  label: string;
  type: string;
  description: string;
};

type CachedEntities = {
  entities: MentionEntity[];
  loadedAt: number;
};

const ENTITY_CACHE_TTL_MS = 30_000;
const MAX_ITEMS = 30;
const entityCacheByProject = new Map<number, CachedEntities>();
let lastMentionErrorNotificationAt = 0;

const normalizeText = (value: string): string => {
  return (value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
};

const notifyMentionError = (): void => {
  const now = Date.now();

  if (now - lastMentionErrorNotificationAt < 4000) {
    return;
  }

  lastMentionErrorNotificationAt = now;
  useSettingsStore
    .getState()
    .addNotification(
      "No se pudieron cargar las sugerencias de menciones.",
      "error",
    );
};

const getProjectId = async (): Promise<number | null> => {
  const lastProjectId = useAppStore.getState().lastProjectId;
  const projectId = lastProjectId ?? null;

  if (projectId) {
    return Number(projectId);
  }

  const pathParts = window.location.pathname.split("/");
  const projectNameFromUrl = pathParts[2];

  if (!projectNameFromUrl || projectNameFromUrl === "local") {
    return null;
  }

  try {
    const { projectService } = await import("@repositories/projectService");
    const project = await projectService.getByName(projectNameFromUrl);

    if (!project?.id) {
      return null;
    }

    useAppStore.getState().setLastProjectId(project.id);
    return Number(project.id);
  } catch (_error) {
    return null;
  }
};

const getProjectEntities = async (
  projectId: number,
): Promise<MentionEntity[]> => {
  const cached = entityCacheByProject.get(projectId);
  const now = Date.now();

  if (cached && now - cached.loadedAt <= ENTITY_CACHE_TTL_MS) {
    return cached.entities;
  }

  const entities = (await entityService.getAllByProject(
    projectId,
  )) as MentionEntity[];
  entityCacheByProject.set(projectId, {
    entities,
    loadedAt: now,
  });

  return entities;
};

const getEntityDescription = (entity: MentionEntity): string => {
  const baseDescription = entity.descripcion || "";

  if (baseDescription) {
    return baseDescription;
  }

  if (!entity.contenido_json || typeof entity.contenido_json !== "string") {
    return "";
  }

  try {
    const parsed = JSON.parse(entity.contenido_json) as {
      definicion?: unknown;
    };
    return typeof parsed.definicion === "string" ? parsed.definicion : "";
  } catch (_error) {
    return "";
  }
};

const toMentionItems = (
  entities: MentionEntity[],
  query: string,
): MentionItem[] => {
  const normalizedQuery = normalizeText(query);

  return entities
    .filter((entity) => !entity.borrado)
    .filter((entity) => {
      if (!normalizedQuery) {
        return true;
      }

      const normalizedName = normalizeText(entity.nombre);
      const normalizedDescription = normalizeText(getEntityDescription(entity));

      return (
        normalizedName.includes(normalizedQuery) ||
        normalizedDescription.includes(normalizedQuery)
      );
    })
    .sort((a, b) => {
      const aType = a.tipo || "";
      const bType = b.tipo || "";
      const typeCompare = aType.localeCompare(bType);

      if (typeCompare !== 0) {
        return typeCompare;
      }

      return a.nombre.localeCompare(b.nombre);
    })
    .slice(0, MAX_ITEMS)
    .map((entity) => ({
      id: String(entity.id),
      label: entity.nombre,
      type: entity.tipo || "",
      description: getEntityDescription(entity),
    }));
};

const suggestion: Omit<SuggestionOptions, "editor"> = {
  items: async ({ query }: { query: string }) => {
    try {
      const projectId = await getProjectId();

      if (!projectId) {
        return [];
      }

      const entities = await getProjectEntities(projectId);
      return toMentionItems(entities, query);
    } catch (_error) {
      notifyMentionError();
      return [];
    }
  },

  render: () => {
    let component: ReactRenderer | null = null;
    let popup: Instance<Props>[] | null = null;

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (props.clientRect) {
          popup = tippy("body", {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: "manual",
            placement: "bottom-start",
          }) as unknown as Instance<Props>[];
        }
      },

      onUpdate(props: SuggestionProps) {
        if (component) {
          component.updateProps(props);
        }

        if (props.clientRect && popup) {
          popup[0].setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });
        }
      },

      onKeyDown(props: { event: KeyboardEvent }): boolean {
        const isArrowKey = props.event.key.startsWith("Arrow");
        const isArrowMovementCombo =
          isArrowKey &&
          (props.event.ctrlKey || props.event.metaKey || props.event.altKey || props.event.shiftKey);

        if (isArrowMovementCombo) {
          props.event.preventDefault();
          props.event.stopPropagation();
          return true;
        }

        if (props.event.key === "Escape") {
          if (popup) {
            popup[0].hide();
          }
          return true;
        }

        return (
          (
            component?.ref as { onKeyDown?: (p: unknown) => boolean } | null
          )?.onKeyDown?.(props) ?? false
        );
      },

      onExit() {
        if (popup && popup[0]) {
          popup[0].destroy();
        }

        if (component) {
          component.destroy();
        }
      },
    };
  },
};

export default suggestion;
