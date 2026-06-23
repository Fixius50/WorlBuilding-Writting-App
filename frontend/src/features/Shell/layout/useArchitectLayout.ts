import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  useParams,
  useNavigate,
  useLocation,
  useSearchParams,
} from "react-router-dom";
import { useLanguage } from "@context/LanguageContext";
import { WorkspaceUseCase } from "@features/Workspaces";
import { Carpeta, Proyecto, FolderType } from "@domain/database";
import { useSettingsStore } from "@features/Settings";
import { useDashboardStore } from "@features/Dashboard";
import { useAppStore } from "@features/App";
import { useRightPanelStore } from "@features/Shell/store/useRightPanelStore";
import { useQueryClient } from "@tanstack/react-query";
import { WritingUseCase } from "@features/Writing";

type NamedEntity = {
  id: number;
  nombre?: string;
};

export const useArchitectLayout = () => {
  const { username, projectName } = useParams<{
    username: string;
    projectName: string;
  }>();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const hideSidebarParam = searchParams.get("hideSidebar") === "true";

  const actualUsername = username || "local";
  const baseUrl = `/${actualUsername}/${projectName}`;

  // Layout State
  const [leftOpen, setLeftOpen] = useState<boolean>(true);
  const [loadedProject, setLoadedProject] = useState<Proyecto | null>(null);
  const [projectId, setProjectId] = useState<number | null>(null);
  const [notebookTitle, setNotebookTitle] = useState<string>("");

  // General Settings State
  const panelMode = useAppStore((state) => state.panelMode);
  const notifications = useSettingsStore((state) => state.notifications);
  const queryClient = useQueryClient();

  // Microheader State
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [activeModal, setActiveModal] = useState<
    "database" | "notes" | "stats" | "sync" | null
  >(null);

  const { stats, loadStats } = useDashboardStore();
  const [currentTime, setCurrentTime] = useState<Date>(new Date());
  const [isMenuBarActive, setIsMenuBarActive] = useState<boolean>(false);

  const toggleDropdown = (name: string, e: React.MouseEvent): void => {
    e.stopPropagation();
    setActiveDropdown((prev: string | null): string | null => {
      switch (prev) {
        case name:
          setIsMenuBarActive(false);
          return null;
        default:
          setIsMenuBarActive(true);
          return name;
      }
    });
  };

  const handleDropdownMouseEnter = (name: string): void => {
    switch (isMenuBarActive) {
      case true:
        setActiveDropdown(name);
        break;
      default:
        break;
    }
  };

  const handleDropdownNav = (path: string): void => {
    navigate(path);
    setActiveDropdown(null);
    setIsMenuBarActive(false);
  };

  // Cerrar desplegables al hacer clic fuera de la cabecera (header)
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent): void => {
      const headerElement = document.querySelector("header");
      const targetIsNode = e.target instanceof Node;
      switch (targetIsNode) {
        case true:
          if (headerElement && !headerElement.contains(e.target as Node)) {
            setActiveDropdown(null);
            setIsMenuBarActive(false);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  // Cargar estadisticas cuando el modal stats esta activo
  useEffect(() => {
    switch (activeModal === "stats" && projectId !== null) {
      case true:
        if (projectId !== null) {
          loadStats(projectId);
        }
        break;
      default:
        break;
    }
  }, [activeModal, projectId, loadStats]);

  // Actualizar hora en tiempo real cuando el modal stats esta activo
  useEffect(() => {
    let timer: ReturnType<typeof setInterval> | undefined = undefined;
    switch (activeModal === "stats") {
      case true:
        timer = setInterval(() => {
          setCurrentTime(new Date());
        }, 1000);
        break;
      default:
        break;
    }
    return () => {
      switch (timer !== undefined) {
        case true:
          if (timer !== undefined) {
            clearInterval(timer);
          }
          break;
        default:
          break;
      }
    };
  }, [activeModal]);

  // Bible Explorer State
  const [folders, setFolders] = useState<Carpeta[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterType, setFilterType] = useState<string>("ALL");

  // CRUD Modal State
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const [deletionTarget, setDeletionTarget] = useState<{
    id: number;
    type: "folder" | "entity";
    parentId?: number | null;
  } | null>(null);

  const getPageName = useCallback((): string => {
    const path = location.pathname;
    const isBible = path.endsWith("/bible");
    const isExplorador =
      path.includes("/bible/folder/") || path.includes("/bible/entity/");
    const isMap = path.endsWith("/map");
    const isTimeline = path.endsWith("/timeline");
    const isTime = path.endsWith("/time");
    const isLanguages = path.endsWith("/languages");
    const isPlanning = path.endsWith("/planning");
    const isWriting = path.includes("/writing");
    const isAnalytics = path.endsWith("/analytics");
    const isSync = path.endsWith("/sync");
    const isTrash = path.endsWith("/trash");
    const isSettings = path.endsWith("/settings");

    switch (true) {
      case isBible:
        return t("nav.bible") || "Códice";
      case isExplorador: {
        const baseName = t("nav.bible") || "Códice";
        const folderMatch = path.match(/\/bible\/folder\/(\w+)/);
        const folderIdStr = folderMatch ? folderMatch[1] : null;
        const entityMatch = path.match(/\/entity\/(\d+)/);
        const entityId = entityMatch ? parseInt(entityMatch[1], 10) : null;

        let folderName = "";
        if (folderIdStr) {
          const folder = folders.find((f) => String(f.id) === folderIdStr);
          if (folder) folderName = ` > ${folder.nombre}`;
        }

        let entityName = "";
        if (entityId) {
          const entityData = queryClient.getQueryData<NamedEntity>([
            "entityRouter",
            entityId,
          ]);
          if (entityData && entityData.nombre) {
            entityName = ` > ${entityData.nombre}`;
          } else {
            const bibleEntities = projectId
              ? queryClient.getQueryData<NamedEntity[]>([
                  "worldBible",
                  "all",
                  projectId,
                ])
              : null;
            const found = bibleEntities?.find((e) => e.id === entityId);
            if (found && found.nombre) {
              entityName = ` > ${found.nombre}`;
            }
          }
        }

        return `${baseName}${folderName}${entityName}`;
      }
      case isMap:
        return t("nav.atlas") || "Planos";
      case isTimeline:
        return t("nav.chronology") || "Cronologia";
      case isTime:
        return "Calendarios";
      case isLanguages:
        return t("nav.languages") || "Linguistica";
      case isPlanning:
        return "Centro de Planificacion";
      case isWriting:
        return notebookTitle
          ? `${t("nav.writing") || "Escritura"} > ${notebookTitle}`
          : t("nav.writing") || "Escritura";
      case isAnalytics:
        return t("project.analytics_title") || "Estadisticas";
      case isSync:
        return "Sincronizacion";
      case isTrash:
        return t("nav.trash") || "Papelera";
      case isSettings:
        return t("nav.settings") || "Ajustes";
      default:
        return t("nav.dashboard") || "Panel de Control";
    }
  }, [location.pathname, t, folders, queryClient, projectId, notebookTitle]);

  const handleOtrosAction = useCallback(
    (section: "database" | "notes" | "stats" | "sync"): void => {
      setActiveModal(section);
      setActiveDropdown(null);
    },
    [],
  );

  const loadFolders = useCallback(async (pId: number): Promise<void> => {
    const rootFolders = await WorkspaceUseCase.getRootFolders(pId);
    setFolders(rootFolders);
  }, []);

  // Load project and folders
  useEffect(() => {
    const init = async (): Promise<void> => {
      switch (projectName !== undefined) {
        case true:
          if (projectName) {
            const project =
              await WorkspaceUseCase.getProjectByName(projectName);
            if (project) {
              setLoadedProject(project);
              setProjectId(project.id);
              // Actualizar el store global para que las menciones y sugerencias sepan en que proyecto estan
              await useAppStore.getState().setLastProjectId(project.id);
              await loadFolders(project.id);
            }
          }
          break;
        default:
          break;
      }
    };
    init();
  }, [projectName]);

  // Cargar titulo del cuaderno activo si estamos en la seccion de escritura
  useEffect(() => {
    const match = location.pathname.match(/\/writing\/(\d+)/);
    const notebookId = match ? parseInt(match[1], 10) : null;

    notebookId
      ? WritingUseCase.getNotebookById(notebookId)
          .then((nb) => {
            nb ? setNotebookTitle(nb.titulo) : setNotebookTitle("");
          })
          .catch(() => {
            setNotebookTitle("");
          })
      : setNotebookTitle("");
  }, [location.pathname]);

  // Auto-backup cada 5 minutos
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined = undefined;
    switch (projectName !== undefined) {
      case true:
        if (projectName) {
          interval = setInterval(
            async () => {
              const res = await WorkspaceUseCase.exportBackup(projectName);
              switch (res.success) {
                case true:
                  useSettingsStore
                    .getState()
                    .addNotification(
                      "Copia de seguridad automática realizada",
                      "success",
                    );
                  break;
                default:
                  useSettingsStore
                    .getState()
                    .addNotification("Error en copia automatica", "error");
                  break;
              }
            },
            5 * 60 * 1000,
          ); // 5 minutos
        }
        break;
      default:
        break;
    }

    return () => {
      if (interval !== undefined) {
        clearInterval(interval);
      }
    };
  }, [projectName]);

  // Listener para actualizaciones de carpetas desde otros componentes
  useEffect(() => {
    const handleUpdate = (): void => {
      switch (projectId !== null) {
        case true:
          if (projectId !== null) {
            loadFolders(projectId);
          }
          break;
        default:
          break;
      }
    };
    window.addEventListener("folder-update", handleUpdate);
    return () => window.removeEventListener("folder-update", handleUpdate);
  }, [projectId, loadFolders]);

  // Reset contextual content on navigation if it was custom
  const { mode, reset } = useRightPanelStore();
  useEffect(() => {
    switch (mode === "custom") {
      case true:
        reset();
        break;
      default:
        break;
    }
  }, [location.pathname, mode, reset]);

  const {
    isOpen: rightOpen,
    togglePanel: toggleRightPanel,
    closePanel,
    openPanel,
  } = useRightPanelStore();

  // CRUD Handlers
  const handleCreateSimpleFolder = useCallback(
    async (
      parentId: number | null = null,
      type: string = "FOLDER",
    ): Promise<void> => {
      switch (projectId !== null) {
        case true:
          if (projectId !== null) {
            try {
              const isTimelineFolder = type === "TIMELINE";
              const folderName = isTimelineFolder
                ? t("timeline.title") || "Nueva Dimension"
                : t("bible.new_folder") || "Nueva Carpeta";

              const newFolder = await WorkspaceUseCase.createFolder(
                folderName,
                projectId,
                parentId,
                type as FolderType,
              );
              // [LOG REMOVED]
              await loadFolders(projectId);
              window.dispatchEvent(
                new CustomEvent("folder-update", {
                  detail: {
                    folderId: parentId,
                    type: "folder",
                    item: newFolder,
                    expand: !!parentId,
                  },
                }),
              );
            } catch (err: unknown) {
              useSettingsStore
                .getState()
                .addNotification("Error al crear carpeta", "error");
            }
          }
          break;
        default:
          useSettingsStore
            .getState()
            .addNotification("Error: Proyecto no identificado", "error");
          break;
      }
    },
    [projectId, loadFolders, t],
  );

  const handleCreateQuickEntity = useCallback(
    async (parentId: number, name: string, type: string): Promise<unknown> => {
      switch (projectId !== null) {
        case true:
          if (projectId !== null) {
            try {
              const newEntity = await WorkspaceUseCase.createQuickEntity({
                nombre: name,
                tipo: type,
                slug: name
                  .toLowerCase()
                  .replace(/\s+/g, "-")
                  .replace(/[^\w-]/g, ""),
                descripcion: "",
                carpeta_id: parentId,
                project_id: projectId,
                contenido_json: JSON.stringify({}),
                folder_slug: null,
                imagen_url: null,
              });

              // Notificar al arbol de carpetas para que refresque el contenido de parentId
              window.dispatchEvent(
                new CustomEvent("folder-update", {
                  detail: {
                    folderId: parentId,
                    type: "entity",
                    item: newEntity,
                  },
                }),
              );

              return newEntity;
            } catch (err: unknown) {
              // [LOG REMOVED]
            }
          }
          break;
        default:
          break;
      }
      return undefined;
    },
    [projectId],
  );

  const handleRenameFolder = useCallback(
    async (folderId: number, newName: string): Promise<void> => {
      try {
        if (projectId !== null) {
          await WorkspaceUseCase.renameFolder(folderId, newName, projectId);
          await loadFolders(projectId);
        }
      } catch (err: unknown) {
        // [LOG REMOVED]
      }
    },
    [projectId, loadFolders],
  );

  const handleDeleteFolder = useCallback(
    (folderId: number, parentId: number | null = null): void => {
      setDeletionTarget({ id: folderId, type: "folder", parentId });
      setConfirmOpen(true);
    },
    [],
  );

  const handleDeleteEntity = useCallback(
    (entityId: number, folderId: number): void => {
      setDeletionTarget({ id: entityId, type: "entity", parentId: folderId });
      setConfirmOpen(true);
    },
    [],
  );

  const confirmDeletion = async (): Promise<void> => {
    const isTargetValid = deletionTarget !== null && projectId !== null;
    switch (isTargetValid) {
      case true:
        if (deletionTarget !== null && projectId !== null) {
          const { id, type, parentId } = deletionTarget;

          try {
            const isFolder = type === "folder";
            switch (isFolder) {
              case true:
                await WorkspaceUseCase.deleteFolder(id);
                window.dispatchEvent(
                  new CustomEvent("folder-update", {
                    detail: {
                      folderId: parentId,
                      removeId: id,
                      type: "folder",
                    },
                  }),
                );
                break;
              default:
                await WorkspaceUseCase.deleteEntity(id);
                window.dispatchEvent(
                  new CustomEvent("folder-update", {
                    detail: {
                      folderId: parentId,
                      removeId: id,
                      type: "entity",
                    },
                  }),
                );
                break;
            }
            await loadFolders(projectId);
          } catch (err: unknown) {
            // [LOG REMOVED]
          } finally {
            setDeletionTarget(null);
            setConfirmOpen(false);
          }
        }
        break;
      default:
        break;
    }
  };

  const handleCreateEntity = useCallback(
    (
      folderId: number | string,
      specialType: string = "entidadindividual",
    ): void => {
      const targetSlug = folderId;
      navigate(
        `${baseUrl}/bible/folder/${targetSlug}/entity/new/${specialType}`,
      );
    },
    [baseUrl, navigate],
  );

  const outletContextValue = useMemo(
    () => ({
      toggleRightPanel,
      projectId,
      projectName,
      baseUrl,
      handleCreateSimpleFolder,
      handleCreateQuickEntity,

      handleDeleteFolder,
      handleRenameFolder,
      handleCreateEntity,
      handleDeleteEntity,
      folders,
      searchTerm,
      setSearchTerm,
      filterType,
      setFilterType,
      // MOCK CONTEXT FOR BIBLE PROFILE PREVIEWS
      setRightOpen: () => {},
      setRightPanelTab: () => {},
      setRightPanelContent: () => {},
      setRightPanelTitle: () => {},
    }),
    [
      projectId,
      projectName,
      baseUrl,
      handleCreateSimpleFolder,
      handleDeleteFolder,
      handleRenameFolder,
      handleCreateEntity,
      handleDeleteEntity,
      folders,
      searchTerm,
      filterType,
      setSearchTerm,
      setFilterType,
    ],
  );

  return {
    projectName,
    baseUrl,
    leftOpen,
    loadedProject,
    projectId,
    panelMode,
    notifications,
    activeDropdown,
    activeModal,
    stats,
    currentTime,
    confirmOpen,
    folders,
    rightOpen,
    hideSidebarParam,
    outletContextValue,
    navigate,

    setLeftOpen,
    setActiveModal,
    setActiveDropdown,
    setConfirmOpen,

    toggleDropdown,
    handleDropdownMouseEnter,
    handleDropdownNav,
    getPageName,
    handleOtrosAction,
    confirmDeletion,
    toggleRightPanel,
    closePanel,
    openPanel,
  };
};
