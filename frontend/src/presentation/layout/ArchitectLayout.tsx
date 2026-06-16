import React, { useEffect, useState } from "react";
import { Outlet, NavLink, Link } from "react-router-dom";
import { useLanguage } from "@context/LanguageContext";
import GlobalRightPanel from "./GlobalRightPanel";
import ConfirmationModal from "@organisms/ConfirmationModal";
import CommandPalette from "@organisms/CommandPalette";
import EntityDatabase from "@features/Graph/components/EntityDatabase";
import NotebookManager from "@features/Writing/components/NotebookManager";
import { SyncView } from "@features/Sync";
import { ResponsiveBar } from "@nivo/bar";
import { useArchitectLayout } from "./useArchitectLayout";
import { WorkspaceUseCase } from "@application/WorkspaceUseCase";
import { getModuleCache, setModuleCache } from "@utils/moduleCache";

// --- Subcomponente de Gráficos para el Modal Central ---
const WritingStatsChart: React.FC<{ pages: { contenido?: string }[] }> = ({
  pages,
}) => {
  const data = pages.map((p, i) => ({
    hoja: `H${i + 1}`,
    palabras:
      p.contenido
        ?.replace(/<[^>]+>/g, "")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length || 0,
  }));

  return (
    <div className="w-full h-full">
      <ResponsiveBar
        data={data}
        keys={["palabras"]}
        indexBy="hoja"
        margin={{ top: 20, right: 30, bottom: 50, left: 60 }}
        padding={0.3}
        valueScale={{ type: "linear" }}
        indexScale={{ type: "band", round: true }}
        colors={["hsl(var(--primary))"]}
        enableLabel={false}
        theme={{
          text: { fontSize: 8, fontWeight: 900, fontFamily: "monospace" },
          axis: {
            domain: { line: { stroke: "hsl(var(--foreground) / 0.1)" } },
            ticks: {
              line: { stroke: "hsl(var(--foreground) / 0.1)" },
              text: { fill: "hsl(var(--foreground) / 0.3)" },
            },
            legend: {
              text: {
                fill: "hsl(var(--foreground) / 0.2)",
                textTransform: "uppercase",
                letterSpacing: "1px",
              },
            },
          },
          grid: { line: { stroke: "hsl(var(--foreground) / 0.05)" } },
          tooltip: {
            container: {
              background: "hsl(var(--background))",
              color: "hsl(var(--foreground))",
              fontSize: "10px",
              borderRadius: "0px",
              border: "1px solid hsl(var(--foreground) / 0.1)",
            },
          },
        }}
        axisTop={null}
        axisRight={null}
        axisBottom={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Hojas",
          legendPosition: "middle",
          legendOffset: 40,
        }}
        axisLeft={{
          tickSize: 5,
          tickPadding: 5,
          tickRotation: 0,
          legend: "Palabras",
          legendPosition: "middle",
          legendOffset: -50,
        }}
        role="application"
      />
    </div>
  );
};

interface NavItemProps {
  to: string;
  icon: string;
  label: string;
  level?: 0 | 1;
  end?: boolean;
}

const NavItem: React.FC<NavItemProps> = ({
  to,
  icon,
  label,
  level = 1,
  end,
}) => (
  <NavLink
    to={to}
    end={end}
    className={({ isActive }) => `
      flex items-center gap-2.5 px-2 py-1.5 border-l transition-all duration-200 group
      ${
        isActive
          ? "border-primary text-primary bg-primary/10"
          : "border-transparent text-foreground/65 hover:text-primary hover:bg-foreground/5"
      }
      ${level === 1 ? "ml-4 border-dashed" : ""}
    `}
    title={label}
  >
    <span className="material-symbols-outlined text-[1rem] transition-transform group-hover:scale-105">
      {icon}
    </span>
    <span className="text-[0.74rem] font-sans tracking-wide font-medium leading-none">
      {label}
    </span>
  </NavLink>
);

interface DirectoryActionItemProps {
  icon: string;
  label: string;
  onClick: () => void;
}

type SidebarSectionKey = "constructor" | "gestor" | "otros" | "sistema";

type SidebarSectionsState = Record<SidebarSectionKey, boolean>;

const DEFAULT_SIDEBAR_SECTIONS: SidebarSectionsState = {
  constructor: true,
  gestor: true,
  otros: true,
  sistema: true,
};

const buildSidebarSectionsKey = (project: string | undefined): string =>
  `architect.sidebar.sections:${project || "global"}`;

interface DirectorySectionHeaderProps {
  label: string;
  isOpen: boolean;
  onToggle: () => void;
}

const DirectorySectionHeader: React.FC<DirectorySectionHeaderProps> = ({
  label,
  isOpen,
  onToggle,
}) => (
  <button
    onClick={onToggle}
    className="w-full px-2 py-1 flex items-center justify-between text-foreground/40 hover:text-foreground/70 text-[0.62rem] uppercase tracking-[0.22em] font-black transition-colors"
  >
    <span className="flex items-center gap-2">
      <span className="material-symbols-outlined text-[0.86rem]">
        folder_open
      </span>
      {label}
    </span>
    <span className="material-symbols-outlined text-[0.82rem]">
      {isOpen ? "expand_more" : "chevron_right"}
    </span>
  </button>
);

const DirectoryActionItem: React.FC<DirectoryActionItemProps> = ({
  icon,
  label,
  onClick,
}) => (
  <button
    onClick={onClick}
    className="w-full flex items-center gap-2.5 px-2 py-1.5 ml-4 border-l border-dashed border-transparent text-foreground/65 hover:text-primary hover:bg-foreground/5 transition-all duration-200 text-left"
  >
    <span className="material-symbols-outlined text-[1rem]">{icon}</span>
    <span className="text-[0.74rem] font-sans tracking-wide font-medium leading-none">
      {label}
    </span>
  </button>
);

const ArchitectLayout: React.FC = () => {
  const { t } = useLanguage();
  const {
    projectName,
    baseUrl,
    leftOpen,
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
  } = useArchitectLayout();

  const sidebarSectionsStorageKey = buildSidebarSectionsKey(projectName);
  const [sidebarSections, setSidebarSections] = useState<SidebarSectionsState>(
    DEFAULT_SIDEBAR_SECTIONS,
  );

  useEffect(() => {
    const cached = getModuleCache<SidebarSectionsState>(
      sidebarSectionsStorageKey,
    );
    const applySections = (parsed: Partial<SidebarSectionsState>) => {
      setSidebarSections({
        constructor: parsed.constructor ?? true,
        gestor: parsed.gestor ?? true,
        otros: parsed.otros ?? true,
        sistema: parsed.sistema ?? true,
      });
    };

    switch (!!cached) {
      case true:
        if (cached) {
          applySections(cached);
        }
        break;
      default:
        WorkspaceUseCase.getSetting(sidebarSectionsStorageKey)
          .then((saved) => {
            switch (!!saved) {
              case true:
                try {
                  const parsed = JSON.parse(
                    saved as string,
                  ) as Partial<SidebarSectionsState>;
                  applySections(parsed);
                  setModuleCache(sidebarSectionsStorageKey, {
                    constructor: parsed.constructor ?? true,
                    gestor: parsed.gestor ?? true,
                    otros: parsed.otros ?? true,
                    sistema: parsed.sistema ?? true,
                  });
                } catch (_error) {
                  setSidebarSections(DEFAULT_SIDEBAR_SECTIONS);
                }
                break;
              default:
                setSidebarSections(DEFAULT_SIDEBAR_SECTIONS);
                break;
            }
          })
          .catch(() => {
            setSidebarSections(DEFAULT_SIDEBAR_SECTIONS);
          });
        break;
    }
  }, [sidebarSectionsStorageKey]);

  useEffect(() => {
    setModuleCache(sidebarSectionsStorageKey, sidebarSections);

    const flushSidebarState = () => {
      WorkspaceUseCase.saveSetting(
        sidebarSectionsStorageKey,
        JSON.stringify(sidebarSections),
      ).catch(() => {
        // [LOG REMOVED]
      });
    };

    window.addEventListener("beforeunload", flushSidebarState);
    return () => {
      window.removeEventListener("beforeunload", flushSidebarState);
      flushSidebarState();
    };
  }, [sidebarSections, sidebarSectionsStorageKey]);

  const toggleSidebarSection = (section: SidebarSectionKey) => {
    setSidebarSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  if (hideSidebarParam) {
    return (
      <div className="h-screen w-screen bg-background">
        <Outlet context={outletContextValue} />
      </div>
    );
  }

  const sidebarClasses =
    panelMode === "floating"
      ? `fixed top-[calc(4.5vh+1.5vh)] left-[2vw] h-[calc(100vh-7.5vh)] rounded-none border border-foreground/10 shadow-2xl z-[200] transition-all duration-300 flex flex-col monolithic-panel ${leftOpen ? "w-64 opacity-100 translate-y-0" : "w-64 opacity-0 -translate-y-4 pointer-events-none"}`
      : `fixed top-[4.5vh] left-0 h-[calc(100vh-4.5vh)] monolithic-panel border-y-0 border-l-0 shadow-2xl z-[200] ${panelMode === "binder" ? "" : "transition-all duration-500"} flex flex-col rounded-none ${leftOpen ? (panelMode === "binder" && rightOpen ? "w-0 -translate-x-full" : "w-64 translate-x-0") : "w-64 -translate-x-full"}`;

  return (
    <div className="flex flex-col h-screen w-full overflow-hidden bg-background text-foreground font-sans selection:bg-primary/30">
      {/* MICROHEADER GLOBAL STYLE VSCODE */}
      <header className="h-[4.5vh] flex-shrink-0 bg-background border-b border-border flex items-center justify-between px-0 text-[11px] tracking-wide select-none z-[250] text-foreground/80 font-sans font-bold">
        {/* Left Section: Menús desplegables */}
        <div className="flex items-center gap-1.5 h-full">
          {/* Botón Home / Panel de Control */}
          <Link
            to={baseUrl}
            onClick={() => {
              setActiveDropdown(null);
            }}
            className="px-2 h-full flex items-center justify-center hover:bg-foreground/5 hover:text-primary transition-colors text-foreground/80"
            title="Panel de Control"
          >
            <span className="material-symbols-outlined text-[15px] font-bold">
              home
            </span>
          </Link>

          {/* Dropdown Constructor */}
          <div className="relative h-full flex items-center">
            <button
              onClick={(e) => toggleDropdown("constructor", e)}
              onMouseEnter={() => handleDropdownMouseEnter("constructor")}
              className={`px-2.5 h-full flex items-center transition-colors duration-150 rounded-none hover:bg-foreground/5 hover:text-primary font-bold ${activeDropdown === "constructor" ? "bg-foreground/5 text-primary" : ""}`}
            >
              <span className="font-bold">Constructor</span>
              <span className="material-symbols-outlined text-[11px] ml-0.5 opacity-60 font-bold">
                keyboard_arrow_down
              </span>
            </button>

            {activeDropdown === "constructor" && (
              <div
                className="absolute top-[4.5vh] left-0 w-48 bg-background border border-border py-1 shadow-2xl z-[300] flex flex-col font-bold"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  to={`${baseUrl}/bible`}
                  onClick={() => handleDropdownNav(`${baseUrl}/bible`)}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-foreground/5 transition-colors text-foreground/85 font-bold"
                >
                  <span className="material-symbols-outlined text-xs text-indigo-400 font-bold">
                    menu_book
                  </span>
                  <span className="font-bold">Biblia del Mundo</span>
                </Link>
                <Link
                  to={`${baseUrl}/planning`}
                  onClick={() => handleDropdownNav(`${baseUrl}/planning`)}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-foreground/5 transition-colors text-foreground/85 font-bold"
                >
                  <span className="material-symbols-outlined text-xs text-indigo-400 font-bold">
                    dashboard_customize
                  </span>
                  <span className="font-bold">Centro Planificación</span>
                </Link>
                <Link
                  to={`${baseUrl}/writing`}
                  onClick={() => handleDropdownNav(`${baseUrl}/writing`)}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-foreground/5 transition-colors text-foreground/85 font-bold"
                >
                  <span className="material-symbols-outlined text-xs text-indigo-400 font-bold">
                    edit_note
                  </span>
                  <span className="font-bold">Escritura creativa</span>
                </Link>
              </div>
            )}
          </div>

          {/* Dropdown Gestor */}
          <div className="relative h-full flex items-center">
            <button
              onClick={(e) => toggleDropdown("gestor", e)}
              onMouseEnter={() => handleDropdownMouseEnter("gestor")}
              className={`px-2.5 h-full flex items-center transition-colors duration-150 rounded-none hover:bg-foreground/5 hover:text-primary font-bold ${activeDropdown === "gestor" ? "bg-foreground/5 text-primary" : ""}`}
            >
              <span className="font-bold">Gestor</span>
              <span className="material-symbols-outlined text-[11px] ml-0.5 opacity-60 font-bold">
                keyboard_arrow_down
              </span>
            </button>

            {activeDropdown === "gestor" && (
              <div
                className="absolute top-[4.5vh] left-0 w-44 bg-background border border-border py-1 shadow-2xl z-[300] flex flex-col font-bold"
                onClick={(e) => e.stopPropagation()}
              >
                <Link
                  to={`${baseUrl}/map`}
                  onClick={() => handleDropdownNav(`${baseUrl}/map`)}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-foreground/5 transition-colors text-foreground/85 font-bold"
                >
                  <span className="material-symbols-outlined text-xs text-indigo-400 font-bold">
                    map
                  </span>
                  <span className="font-bold">Atlas y Mapas</span>
                </Link>
                <Link
                  to={`${baseUrl}/timeline`}
                  onClick={() => handleDropdownNav(`${baseUrl}/timeline`)}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-foreground/5 transition-colors text-foreground/85 font-bold"
                >
                  <span className="material-symbols-outlined text-xs text-indigo-400 font-bold">
                    calendar_month
                  </span>
                  <span className="font-bold">Dimensiones (Timeline)</span>
                </Link>
                <Link
                  to={`${baseUrl}/time`}
                  onClick={() => handleDropdownNav(`${baseUrl}/time`)}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-foreground/5 transition-colors text-foreground/85 font-bold"
                >
                  <span className="material-symbols-outlined text-xs text-indigo-400 font-bold">
                    schedule
                  </span>
                  <span className="font-bold">Calendarios</span>
                </Link>
                <Link
                  to={`${baseUrl}/languages`}
                  onClick={() => handleDropdownNav(`${baseUrl}/languages`)}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-foreground/5 transition-colors text-foreground/85 font-bold"
                >
                  <span className="material-symbols-outlined text-xs text-indigo-400 font-bold">
                    translate
                  </span>
                  <span className="font-bold">Lingüística</span>
                </Link>
              </div>
            )}
          </div>

          {/* Dropdown Otros */}
          <div className="relative h-full flex items-center">
            <button
              onClick={(e) => toggleDropdown("otros", e)}
              onMouseEnter={() => handleDropdownMouseEnter("otros")}
              className={`px-2.5 h-full flex items-center transition-colors duration-150 rounded-none hover:bg-foreground/5 hover:text-primary font-bold ${activeDropdown === "otros" ? "bg-foreground/5 text-primary" : ""}`}
            >
              <span className="font-bold">Otros</span>
              <span className="material-symbols-outlined text-[11px] ml-0.5 opacity-60 font-bold">
                keyboard_arrow_down
              </span>
            </button>

            {activeDropdown === "otros" && (
              <div
                className="absolute top-[4.5vh] left-0 w-44 bg-background border border-border py-1 shadow-2xl z-[300] flex flex-col font-bold"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => handleOtrosAction("database")}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-foreground/5 transition-colors text-foreground/85 font-bold"
                >
                  <span className="material-symbols-outlined text-xs text-indigo-400 font-bold">
                    table_chart
                  </span>
                  <span className="font-bold">Explorador de Datos</span>
                </button>
                <button
                  onClick={() => handleOtrosAction("notes")}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-foreground/5 transition-colors text-foreground/85 font-bold"
                >
                  <span className="material-symbols-outlined text-xs text-indigo-400 font-bold">
                    sticky_note_2
                  </span>
                  <span className="font-bold">Notas rápidas</span>
                </button>
                <button
                  onClick={() => handleOtrosAction("stats")}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-foreground/5 transition-colors text-foreground/85 font-bold"
                >
                  <span className="material-symbols-outlined text-xs text-indigo-400 font-bold">
                    analytics
                  </span>
                  <span className="font-bold">Estadísticas</span>
                </button>
                <button
                  onClick={() => handleOtrosAction("sync")}
                  className="flex items-center gap-2 px-3 py-1.5 text-left text-[11px] hover:bg-foreground/5 transition-colors text-foreground/85 font-bold"
                >
                  <span className="material-symbols-outlined text-xs text-indigo-400 font-bold">
                    sync
                  </span>
                  <span className="font-bold">Sincronizar</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Center Section: Proyecto › Página */}
        <div className="font-sans text-foreground/80 flex items-center gap-1.5 truncate max-w-[40vw] font-bold text-[0.69rem]">
          <span className="hover:text-foreground/70 transition-colors duration-150 cursor-default font-bold">
            {projectName}
          </span>
          <span className="opacity-40 font-bold">›</span>
          <span className="truncate cursor-default font-bold">
            {getPageName()}
          </span>
        </div>

        {/* Right Section: Ayuda (Enlace Directo), Papelera, Ajustes, Salir (Iconos Directos) */}
        <div className="flex items-center gap-0.5 h-full font-bold">
          {/* Enlace Ayuda (Manual de Usuario) */}
          <a
            href="/manual/Guia_Usuario.html"
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 h-full flex items-center hover:bg-foreground/5 hover:text-primary transition-colors text-foreground/80 gap-1 no-underline font-bold"
            title="Manual de Usuario"
          >
            <span className="material-symbols-outlined text-[14px] font-bold">
              help
            </span>
            <span className="font-bold">Ayuda</span>
          </a>

          <div className="h-4 w-px bg-foreground/10 mx-1"></div>

          {/* Botón Papelera */}
          <Link
            to={`${baseUrl}/trash`}
            className="px-2.5 h-full flex items-center justify-center hover:bg-foreground/5 hover:text-primary transition-colors text-foreground/80"
            title="Papelera de Reciclaje"
          >
            <span className="material-symbols-outlined text-[15px] font-bold">
              delete
            </span>
          </Link>

          {/* Botón Ajustes */}
          <Link
            to={`${baseUrl}/settings`}
            className="px-2.5 h-full flex items-center justify-center hover:bg-foreground/5 hover:text-primary transition-colors text-foreground/80"
            title="Ajustes del Sistema"
          >
            <span className="material-symbols-outlined text-[15px] font-bold">
              settings
            </span>
          </Link>

          {/* Botón Salir */}
          <Link
            to="/"
            className="px-2.5 h-full flex items-center justify-center hover:bg-foreground/5 hover:text-red-400 transition-colors text-foreground/80"
            title="Salir del Proyecto"
          >
            <span className="material-symbols-outlined text-[15px] font-bold">
              logout
            </span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <aside className={sidebarClasses}>
          <div className="w-full h-full flex flex-col overflow-hidden">
            <div className="h-14 flex items-center border-b relative bg-foreground/[0.02] px-3">
              <div className="flex items-center gap-2 w-full">
                <div className="size-7 rounded-none bg-indigo-500/20 flex items-center justify-center text-indigo-400 shadow-inner">
                  <span className="material-symbols-outlined text-sm">
                    folder_managed
                  </span>
                </div>
                <div className="flex flex-col min-w-0">
                  <span className="text-[0.62rem] font-black uppercase tracking-[0.18em] text-foreground/45">
                    Estructura
                  </span>
                  <span className="text-[0.78rem] font-bold tracking-wide text-foreground/85 truncate">
                    Directorio
                  </span>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
              <div className="p-2.5 space-y-2">
                <NavItem
                  to={baseUrl}
                  icon="folder"
                  label="Inicio"
                  level={0}
                  end
                />

                <div className="space-y-0.5">
                  <DirectorySectionHeader
                    label="Constructor"
                    isOpen={sidebarSections.constructor}
                    onToggle={() => toggleSidebarSection("constructor")}
                  />
                  {sidebarSections.constructor && (
                    <>
                      <NavItem
                        to={`${baseUrl}/bible`}
                        icon="menu_book"
                        label={t("nav.bible")}
                        level={1}
                      />
                      <NavItem
                        to={`${baseUrl}/planning`}
                        icon="dashboard_customize"
                        label="Centro de Planificación"
                        level={1}
                      />
                      <NavItem
                        to={`${baseUrl}/writing`}
                        icon="edit_note"
                        label={t("nav.writing")}
                        level={1}
                      />
                    </>
                  )}
                </div>

                <div className="space-y-0.5">
                  <DirectorySectionHeader
                    label="Gestor"
                    isOpen={sidebarSections.gestor}
                    onToggle={() => toggleSidebarSection("gestor")}
                  />
                  {sidebarSections.gestor && (
                    <>
                      <NavItem
                        to={`${baseUrl}/map`}
                        icon="map"
                        label={t("nav.atlas")}
                        level={1}
                      />
                      <NavItem
                        to={`${baseUrl}/timeline`}
                        icon="calendar_month"
                        label={t("nav.chronology")}
                        level={1}
                      />
                      <NavItem
                        to={`${baseUrl}/time`}
                        icon="schedule"
                        label="Calendarios"
                        level={1}
                      />
                      <NavItem
                        to={`${baseUrl}/languages`}
                        icon="translate"
                        label={t("nav.languages")}
                        level={1}
                      />
                    </>
                  )}
                </div>

                <div className="space-y-0.5">
                  <DirectorySectionHeader
                    label="Otros"
                    isOpen={sidebarSections.otros}
                    onToggle={() => toggleSidebarSection("otros")}
                  />
                  {sidebarSections.otros && (
                    <>
                      <DirectoryActionItem
                        icon="table_chart"
                        label="Explorador de Datos"
                        onClick={() => handleOtrosAction("database")}
                      />
                      <DirectoryActionItem
                        icon="sticky_note_2"
                        label="Notas rápidas"
                        onClick={() => handleOtrosAction("notes")}
                      />
                      <DirectoryActionItem
                        icon="analytics"
                        label="Estadísticas"
                        onClick={() => handleOtrosAction("stats")}
                      />
                      <DirectoryActionItem
                        icon="sync"
                        label="Sincronizar"
                        onClick={() => handleOtrosAction("sync")}
                      />
                    </>
                  )}
                </div>

                <div className="h-px bg-foreground/10 my-2 mx-2 opacity-50"></div>

                <div className="space-y-0.5">
                  <DirectorySectionHeader
                    label="Sistema"
                    isOpen={sidebarSections.sistema}
                    onToggle={() => toggleSidebarSection("sistema")}
                  />
                  {sidebarSections.sistema && (
                    <>
                      <NavItem
                        to={`${baseUrl}/trash`}
                        icon="delete"
                        label={t("nav.trash")}
                        level={1}
                      />
                      <NavItem
                        to={`${baseUrl}/settings`}
                        icon="settings"
                        label={t("nav.settings")}
                        level={1}
                      />
                      <NavItem
                        to="/"
                        icon="logout"
                        label={t("nav.logout")}
                        level={1}
                      />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* STANDARDIZED LEFT COLLAPSE BUTTON - FOR CLASSIC & BINDER MODES */}
          {(panelMode === "classic" || panelMode === "binder") && (
            <button
              onClick={() => {
                setLeftOpen(!leftOpen);
              }}
              className={`
              absolute top-1/2 -translate-y-1/2 -right-10 w-10 h-24 
              bg-background border border-foreground/10 border-l-0
              rounded-none flex flex-col items-center justify-center gap-1
              transition-all duration-300 group
              hover:bg-indigo-500/10 hover:border-indigo-500/30
              ${leftOpen ? "text-indigo-500 shadow-[4px_0_15px_-5px_rgba(99,102,241,0.3)] border-l-transparent" : "text-foreground/60"}
            `}
              style={{
                borderLeftColor: leftOpen ? "transparent" : undefined,
                right: "-40px",
              }}
              title={
                leftOpen ? t("common.close_panel") : t("common.open_panel")
              }
            >
              <div
                className={`w-1 h-3 bg-current opacity-20 transition-all duration-500 ${leftOpen ? "h-6 opacity-40" : ""}`}
              ></div>
              <span
                className={`material-symbols-outlined text-lg transition-transform duration-500 ${!leftOpen ? "rotate-180" : ""}`}
              >
                side_navigation
              </span>
              <div
                className={`w-1 h-3 bg-current opacity-20 transition-all duration-500 ${leftOpen ? "h-6 opacity-40" : ""}`}
              ></div>
            </button>
          )}
        </aside>

        {/* BINDER MODE TABS */}
        {panelMode === "binder" && leftOpen && (
          <div className="fixed top-32 z-[60] flex flex-col gap-2 left-64">
            <button
              onClick={() => {
                setLeftOpen(!leftOpen);
              }}
              className={`w-10 py-5 bg-background border border-foreground/10 border-l-0 rounded-r-md flex justify-center text-foreground/60 hover:text-indigo-400 group relative ${leftOpen ? "bg-indigo-500/10 text-indigo-500 border-indigo-500/50 shadow-[4px_0_15px_-5px_rgba(99,102,241,0.3)] border-l-transparent" : ""}`}
              title="Navegación"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-current opacity-20"></div>
              <span className="material-symbols-outlined text-xl">map</span>
            </button>
            {/* 
            <button
              onClick={() => {
                if (leftOpen && rightOpen) {
                  setLeftOpen(false);
                  closePanel();
                } else {
                  setLeftOpen(true);
                  openPanel('notes');
                }
              }}
              className={`w-10 py-5 bg-background border border-foreground/10 border-l-0 rounded-r-md flex justify-center text-foreground/60 hover:text-indigo-400 group relative ${leftOpen && rightOpen ? 'bg-indigo-500/10 text-indigo-500 border-indigo-500/50 shadow-[4px_0_15px_-5px_rgba(99,102,241,0.3)] border-l-transparent' : ''}`}
              title="Archivos / Propiedades"
            >
              <div className="absolute inset-y-0 left-0 w-1 bg-current opacity-20"></div>
              <span className="material-symbols-outlined text-xl">folder_special</span>
            </button>
            */}
          </div>
        )}

        {/* FLOATING MODE TOGGLES (2vw / 2vh) */}
        {panelMode === "floating" && (
          <div className="contents">
            <button
              id="floating-left-toggle"
              onClick={() => setLeftOpen(!leftOpen)}
              className={`fixed top-[2vh] left-[2vw] z-[70] size-12 rounded-none bg-background border transition-all flex items-center justify-center shadow-2xl ${leftOpen ? "border-indigo-500 text-indigo-400 bg-indigo-500/10" : "border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/30"}`}
              title="Menú Navegación"
            >
              <span className="material-symbols-outlined">
                {leftOpen ? "close" : "menu"}
              </span>
            </button>

            {/*
            <button
              id="floating-right-toggle"
              onClick={toggleRightPanel}
              className={`fixed top-[2vh] right-[2vw] z-[70] size-12 rounded-none bg-background border transition-all flex items-center justify-center shadow-2xl ${rightOpen ? 'border-primary text-primary bg-primary/10' : 'border-foreground/10 text-foreground/60 hover:text-foreground hover:border-foreground/30'}`}
              title="Panel de Propiedades"
            >
              <span className="material-symbols-outlined">{rightOpen ? 'close' : 'folder_special'}</span>
            </button>
            */}
          </div>
        )}

        {/* Main Content */}
        <main className="flex-1 flex flex-col min-w-0 bg-background relative transition-all duration-500">
          <div className="flex-1 flex flex-col min-w-0 bg-background relative overflow-hidden">
            <Outlet context={outletContextValue} />
          </div>

          {/*
          <GlobalRightPanel panelMode={panelMode} />
          */}

          {/*
          <ControlPanel
            isOpen={bottomGraphOpen}
            onToggle={() => setBottomGraphOpen((prev) => !prev)}
            projectId={projectId ?? undefined}
            projectName={projectName}
          />
          */}
        </main>
      </div>

      {/* MODAL CENTRAL FLOTANTE PARA "OTROS" */}
      {activeModal && (
        <div
          className="fixed inset-0 z-[400] bg-black/75 flex items-center justify-center animate-in fade-in duration-200"
          onClick={() => setActiveModal(null)}
        >
          <div
            className="w-[70vw] max-w-4xl h-[70vh] max-h-[72vh] bg-background border border-border shadow-2xl flex flex-col overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background shrink-0">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[1.2rem]">
                  {activeModal === "database" && "table_chart"}
                  {activeModal === "notes" && "sticky_note_2"}
                  {activeModal === "stats" && "analytics"}
                  {activeModal === "sync" && "sync"}
                </span>
                <span className="text-xs font-black uppercase tracking-widest text-foreground/80">
                  {activeModal === "database" && "Explorador de Datos"}
                  {activeModal === "notes" && "Notas rápidas"}
                  {activeModal === "stats" && "Estadísticas del Proyecto"}
                  {activeModal === "sync" && "Sincronizar"}
                </span>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="text-foreground/40 hover:text-foreground/80 hover:bg-foreground/5 p-1 transition-all rounded-none flex items-center justify-center"
                title="Cerrar modal"
              >
                <span className="material-symbols-outlined text-[1.2rem]">
                  close
                </span>
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-hidden relative">
              {activeModal === "database" && (
                <EntityDatabase projectId={projectId ?? undefined} />
              )}
              {activeModal === "notes" && (
                <NotebookManager projectId={projectId ?? null} />
              )}
              {activeModal === "stats" && (
                <div className="flex flex-col h-full bg-[#0a0a0a] p-8 overflow-y-auto no-scrollbar">
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-full">
                    {/* Columna Reloj y Estado */}
                    <div className="flex flex-col space-y-6">
                      <div className="p-8 bg-foreground/[0.03] border border-foreground/10 flex flex-col items-center justify-center space-y-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-primary">
                          Hora Actual
                        </span>
                        <span className="text-5xl font-black tracking-tighter text-foreground tabular-nums">
                          {currentTime.toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                          })}
                        </span>
                        <span className="text-[9px] font-bold text-foreground/30 uppercase tracking-widest pt-2">
                          {currentTime.toLocaleDateString("es-ES", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="p-4 bg-foreground/[0.02] border border-foreground/5 flex flex-col space-y-1">
                          <span className="text-[8px] font-black uppercase text-foreground/40 tracking-widest">
                            Palabras Totales
                          </span>
                          <span className="text-xl font-black text-foreground tabular-nums">
                            {stats.wordCount.toLocaleString()}
                          </span>
                        </div>
                        <div className="p-4 bg-foreground/[0.02] border border-foreground/5 flex flex-col space-y-1">
                          <span className="text-[8px] font-black uppercase text-foreground/40 tracking-widest">
                            Páginas Totales
                          </span>
                          <span className="text-xl font-black text-foreground tabular-nums">
                            {stats.pageCount}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 bg-primary/5 border border-primary/20 flex items-center gap-3">
                        <div className="size-2 rounded-full bg-primary animate-pulse"></div>
                        <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                          Sesión de Escritura Activa
                        </span>
                      </div>
                    </div>

                    {/* Columna Gráfica Distribución */}
                    <div className="lg:col-span-2 flex flex-col space-y-4">
                      <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-foreground/60 flex items-center gap-2">
                          <span className="material-symbols-outlined text-sm">
                            bar_chart
                          </span>
                          Distribución por Hojas
                        </h3>
                        <span className="text-[9px] font-bold text-foreground/30 font-mono">
                          PROYECTO: {projectName}
                        </span>
                      </div>

                      <div className="flex-1 bg-foreground/[0.01] border border-foreground/5 p-4 min-h-[300px]">
                        <div className="w-full h-full flex flex-col items-center justify-center text-foreground/20 space-y-2">
                          <span className="material-symbols-outlined text-4xl">
                            edit_note
                          </span>
                          <span className="text-[10px] font-black uppercase tracking-widest italic">
                            Abre un cuaderno para ver analíticas
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {activeModal === "sync" && <SyncView />}
            </div>
          </div>
        </div>
      )}

      <ConfirmationModal
        isOpen={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={confirmDeletion}
        title={t("common.confirm_deletion")}
        message={t("common.are_you_sure_delete")}
        confirmText={t("common.delete")}
        type="danger"
      />
      {/* TOAST NOTIFICATIONS */}
      <div className="fixed top-24 right-8 z-[100] flex flex-col gap-3 pointer-events-none">
        {notifications.map((n) => (
          <div
            key={n.id}
            className="min-w-[340px] px-6 py-4 monolithic-panel border border-foreground/40 rounded-none shadow-2xl animate-slide-in-right pointer-events-auto"
          >
            <div className="flex items-start gap-3">
              <span
                className={`material-symbols-outlined ${n.type === "success" ? "text-emerald-400" : n.type === "error" ? "text-red-500" : "text-primary"}`}
              >
                {n.type === "success"
                  ? "check_circle"
                  : n.type === "error"
                    ? "report"
                    : "info"}
              </span>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-bold break-words">{n.message}</div>
                {typeof n.progressCurrent === "number" &&
                typeof n.progressTotal === "number" &&
                n.progressTotal > 0 ? (
                  <>
                    <div className="mt-2 h-1.5 w-full bg-foreground/15 overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{
                          width: `${Math.max(0, Math.min(100, (n.progressCurrent / n.progressTotal) * 100))}%`,
                        }}
                      />
                    </div>
                    <div className="mt-1 text-[10px] font-black uppercase tracking-widest text-foreground/55">
                      {Math.min(n.progressCurrent, n.progressTotal)}/
                      {n.progressTotal}
                    </div>
                  </>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </div>
      {/* COMMAND PALETTE — Ctrl+K */}
      <CommandPalette folders={folders} />
    </div>
  );
};

export default ArchitectLayout;
