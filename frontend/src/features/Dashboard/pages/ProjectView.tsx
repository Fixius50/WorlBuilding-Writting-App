import React, { useState } from "react";
import { useProjectView } from "./useProjectView";
import "@assets/ProjectView.css";

interface VolumeCard {
  icon: string;
  label: string;
  title: string;
  desc: string;
  path: string;
}

const getEntityIcon = (tipo: string): string => {
  let icon = "article";
  const t = tipo.toLowerCase();
  switch (t) {
    case "personaje":
    case "character":
      icon = "person";
      break;
    case "lugar":
    case "location":
      icon = "location_on";
      break;
    case "objeto":
    case "item":
      icon = "token";
      break;
    case "evento":
    case "event":
      icon = "event";
      break;
    default:
      icon = "article";
      break;
  }
  return icon;
};

const ProjectView: React.FC = () => {
  const { projectName, navigate, t, user, baseUrl, stats, loading } = useProjectView();
  const [activeVolIndex, setActiveVolIndex] = useState<number>(0);

  const projectTitle: string = projectName || "Crónicas de Aethelgard";
  const architectName: string = user?.displayName || user?.username || t("common.architect");

  const volumes: VolumeCard[] = [
    {
      icon: "menu_book",
      label: "Codex",
      title: t("project.codex_title") || "Biblia del Mundo",
      desc: t("project.codex_desc") || "El compendio histórico y enciclopedia de tu universo.",
      path: `${baseUrl}/bible`,
    },
    {
      icon: "map",
      label: "Atlas",
      title: t("project.atlas_title") || "Atlas y Mapas",
      desc: t("project.atlas_desc") || "Cartografía interactiva y geografía política de tus reinos.",
      path: `${baseUrl}/map`,
    },
    {
      icon: "edit_note",
      label: "Crónicas",
      title: t("project.chronicles_title") || "Escritura",
      desc: t("project.chronicles_desc") || "Gestión de cuadernos y manuscritos del mundo.",
      path: `${baseUrl}/writing`,
    },
    {
      icon: "hub",
      label: "Conexión",
      title: t("project.graph_title") || "Grafo de Relaciones",
      desc: t("project.graph_desc") || "Relaciones dinámicas e interconexión entre tus entidades.",
      path: `${baseUrl}/graph`,
    },
    {
      icon: "calendar_month",
      label: "Cronos",
      title: t("project.timeline_title") || "Dimensiones temporales",
      desc: t("project.timeline_desc") || "Líneas temporales y eventos cronológicos del universo.",
      path: `${baseUrl}/timeline`,
    },
    {
      icon: "translate",
      label: "Verbo",
      title: t("project.linguistics_title") || "Lingüística",
      desc: t("project.linguistics_desc") || "Creación de glifos, evolución fonética y dialectos fantásticos.",
      path: `${baseUrl}/linguistics`,
    },
    {
      icon: "analytics",
      label: "Esencia",
      title: t("project.analytics_title") || "Estadísticas del Mundo",
      desc: t("project.analytics_desc") || "Densidad de datos y distribución de entidades en el cosmos.",
      path: `${baseUrl}/analytics`,
    },
  ];

  const activeVol = volumes[activeVolIndex] || volumes[0];

  const renderPreviewContent = () => {
    let preview = null;

    const isLoading = loading || !stats;

    switch (isLoading) {
      case true:
        preview = (
          <div className="flex-1 flex flex-col items-center justify-center text-foreground/40 font-mono text-[10px] tracking-widest uppercase">
            <span className="material-symbols-outlined text-2xl animate-spin mb-3">sync</span>
            Cargando registros...
          </div>
        );
        break;
      default:
        if (stats) {
          switch (activeVolIndex) {
            case 0: // Codex
              preview = (
                <div className="flex flex-col gap-5 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-foreground/[0.02] border border-foreground/5 rounded-none flex flex-col">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/45">Entidades Totales</span>
                      <span className="font-mono text-3xl font-light text-primary mt-1">{String(stats.bible.entitiesCount).padStart(2, '0')}</span>
                    </div>
                    <div className="p-3 bg-foreground/[0.02] border border-foreground/5 rounded-none flex flex-col">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/45">Carpetas / Temas</span>
                      <span className="font-mono text-3xl font-light text-zinc-400 mt-1">{String(stats.bible.foldersCount).padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 border-b border-foreground/10 pb-1.5 mb-1">Últimas ediciones</span>
                    {stats.bible.recentEntities.length > 0 ? (
                      stats.bible.recentEntities.map((ent) => (
                        <div key={ent.id} className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-foreground/5 transition-colors border border-transparent hover:border-foreground/5">
                          <div className="flex items-center gap-2.5 truncate">
                            <span className="material-symbols-outlined text-[15px] text-foreground/50">{getEntityIcon(ent.tipo)}</span>
                            <span className="font-serif tracking-wide text-foreground/80 truncate">{ent.nombre}</span>
                          </div>
                          <span className="font-mono text-[9px] text-foreground/35 uppercase">{ent.tipo}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-foreground/30 italic">No hay entidades creadas aún en este universo.</span>
                    )}
                  </div>
                </div>
              );
              break;
            case 1: // Atlas
              preview = (
                <div className="flex flex-col gap-5 flex-1">
                  <div className="p-3 bg-foreground/[0.02] border border-foreground/5 rounded-none flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/45">Mapas Registrados</span>
                    <span className="font-mono text-3xl font-light text-primary mt-1">{String(stats.atlas.mapsCount).padStart(2, '0')}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 border-b border-foreground/10 pb-1.5 mb-1">Mapas Recientes</span>
                    {stats.atlas.recentMaps.length > 0 ? (
                      stats.atlas.recentMaps.map((map) => (
                        <div key={map.id} className="flex items-center gap-2.5 text-xs py-1.5 px-2 hover:bg-foreground/5 transition-colors border border-transparent hover:border-foreground/5">
                          <span className="material-symbols-outlined text-[15px] text-indigo-400">map</span>
                          <span className="font-serif tracking-wide text-foreground/80 truncate">{map.nombre}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-foreground/30 italic">No hay mapas creados todavía.</span>
                    )}
                  </div>
                </div>
              );
              break;
            case 2: // Crónicas
              preview = (
                <div className="flex flex-col gap-5 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-foreground/[0.02] border border-foreground/5 rounded-none flex flex-col">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/45">Cuadernos</span>
                      <span className="font-mono text-3xl font-light text-primary mt-1">{String(stats.chronicles.notebooksCount).padStart(2, '0')}</span>
                    </div>
                    <div className="p-3 bg-foreground/[0.02] border border-foreground/5 rounded-none flex flex-col">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/45">Hojas Totales</span>
                      <span className="font-mono text-3xl font-light text-zinc-400 mt-1">{String(stats.chronicles.pagesCount).padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 border-b border-foreground/10 pb-1.5 mb-1">Manuscritos en curso</span>
                    {stats.chronicles.recentPages.length > 0 ? (
                      stats.chronicles.recentPages.map((p) => (
                        <div key={p.id} className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-foreground/5 transition-colors border border-transparent hover:border-foreground/5">
                          <div className="flex items-center gap-2 truncate">
                            <span className="material-symbols-outlined text-[15px] text-foreground/50">description</span>
                            <span className="font-serif tracking-wide text-foreground/80 truncate">{p.titulo || "Sin título"}</span>
                          </div>
                          <span className="font-mono text-[8px] text-foreground/30 uppercase max-w-[80px] truncate">{p.cuaderno_titulo}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-foreground/30 italic">No hay páginas escritas aún.</span>
                    )}
                  </div>
                </div>
              );
              break;
            case 3: // Conexión
              preview = (
                <div className="flex flex-col gap-5 flex-1 justify-center">
                  <div className="flex flex-col items-center justify-center p-6 border border-dashed border-foreground/10 rounded-none bg-foreground/[0.01]">
                    <span className="material-symbols-outlined text-4xl text-primary/50 mb-3 animate-pulse">hub</span>
                    <span className="font-mono text-2xl font-light text-foreground/80">{String(stats.graph.relationsCount).padStart(2, '0')}</span>
                    <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/45 mt-1">Conexiones Activas</span>
                    <p className="text-[10px] text-foreground/40 text-center max-w-[200px] mt-3 font-serif leading-relaxed">
                      Representación tridimensional de los vínculos narrativos, familiares y políticos de tus personajes.
                    </p>
                  </div>
                </div>
              );
              break;
            case 4: // Cronos
              preview = (
                <div className="flex flex-col gap-5 flex-1">
                  <div className="p-3 bg-foreground/[0.02] border border-foreground/5 rounded-none flex flex-col">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/45">Eventos Cronológicos</span>
                    <span className="font-mono text-3xl font-light text-primary mt-1">{String(stats.timeline.eventsCount).padStart(2, '0')}</span>
                  </div>
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 border-b border-foreground/10 pb-1.5 mb-1">Últimos Eventos</span>
                    {stats.timeline.recentEvents.length > 0 ? (
                      stats.timeline.recentEvents.map((ev) => (
                        <div key={ev.id} className="flex items-center justify-between text-xs py-1.5 px-2 hover:bg-foreground/5 transition-colors border border-transparent hover:border-foreground/5">
                          <span className="font-serif tracking-wide text-foreground/80 truncate">{ev.titulo}</span>
                          <span className="font-mono text-[9px] text-indigo-400 font-bold shrink-0">{ev.fecha_simulada || "Era Inc."}</span>
                        </div>
                      ))
                    ) : (
                      <span className="text-[11px] text-foreground/30 italic">No se han registrado eventos temporales.</span>
                    )}
                  </div>
                </div>
              );
              break;
            case 5: // Verbo
              preview = (
                <div className="flex flex-col gap-5 flex-1">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-foreground/[0.02] border border-foreground/5 rounded-none flex flex-col">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/45">Conlangs</span>
                      <span className="font-mono text-3xl font-light text-primary mt-1">{String(stats.linguistics.conlangsCount).padStart(2, '0')}</span>
                    </div>
                    <div className="p-3 bg-foreground/[0.02] border border-foreground/5 rounded-none flex flex-col">
                      <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/45">Vocabulario</span>
                      <span className="font-mono text-3xl font-light text-zinc-400 mt-1">{String(stats.linguistics.wordsCount).padStart(2, '0')}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-foreground/[0.02] border border-foreground/5 rounded-none flex flex-col mt-1">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/45">Idioma Oficial</span>
                    <span className="font-serif text-sm tracking-wide text-primary mt-1 font-light italic">
                      {stats.linguistics.mainLangName || "Ninguno configurado"}
                    </span>
                  </div>
                </div>
              );
              break;
            case 6: // Esencia
              preview = (
                <div className="flex flex-col gap-4 flex-1 justify-center">
                  <div className="flex flex-col gap-2">
                    <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/40 border-b border-foreground/10 pb-1.5 mb-2">Densidad de Información</span>
                    <div className="space-y-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-mono text-[9px] text-foreground/60 uppercase">
                          <span>Entidades de Biblia</span>
                          <span>{stats.bible.entitiesCount}</span>
                        </div>
                        <div className="h-1 bg-foreground/10 w-full rounded-none overflow-hidden">
                          <div className="h-full bg-primary" style={{ width: `${Math.min(100, stats.bible.entitiesCount * 5)}%` }}></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-mono text-[9px] text-foreground/60 uppercase">
                          <span>Mapas</span>
                          <span>{stats.atlas.mapsCount}</span>
                        </div>
                        <div className="h-1 bg-foreground/10 w-full rounded-none overflow-hidden">
                          <div className="h-full bg-indigo-500" style={{ width: `${Math.min(100, stats.atlas.mapsCount * 20)}%` }}></div>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <div className="flex justify-between font-mono text-[9px] text-foreground/60 uppercase">
                          <span>Vínculos de Grafo</span>
                          <span>{stats.graph.relationsCount}</span>
                        </div>
                        <div className="h-1 bg-foreground/10 w-full rounded-none overflow-hidden">
                          <div className="h-full bg-emerald-500" style={{ width: `${Math.min(100, stats.graph.relationsCount * 10)}%` }}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
              break;
            default:
              preview = null;
              break;
          }
        }
        break;
    }

    return preview;
  };

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar bg-background text-foreground font-serif p-8 md:p-16 justify-start items-center">
      <div className="max-w-5xl w-full flex flex-col items-start">
        
        {/* CABECERA LITERARIA */}
        <header className="mb-10 select-none w-full border-b border-foreground/5 pb-8">
          <h1 className="text-4xl md:text-5xl font-light italic tracking-wide text-zinc-300">
            {projectTitle}
          </h1>
          <p className="text-[10px] text-foreground/45 font-mono mt-4 uppercase tracking-[0.2em] font-light">
            {t("project.welcome")}{" "}
            <span className="text-primary font-bold">
              {architectName}
            </span>
          </p>
        </header>

        {/* ESTRUCTURA DE DOS COLUMNAS */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full items-start">
          
          {/* COLUMNA IZQUIERDA: SELECTOR VERTICAL DE HERRAMIENTAS */}
          <div className="lg:col-span-5 flex flex-col gap-3.5 w-full">
            {volumes.map((vol: VolumeCard, index: number) => {
              const isActive = index === activeVolIndex;
              return (
                <div
                  key={vol.path}
                  onMouseEnter={() => setActiveVolIndex(index)}
                  onClick={() => navigate(vol.path)}
                  className={`volume-selector-item ${isActive ? "active" : ""}`}
                >
                  <span className="material-symbols-outlined text-2xl font-light leading-none shrink-0">
                    {vol.icon}
                  </span>
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="font-serif text-[13px] tracking-wide font-medium leading-none text-foreground/90">
                      {vol.title}
                    </span>
                    <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-foreground/40 mt-1.5 leading-none">
                      {vol.label}
                    </span>
                  </div>
                  <span className="material-symbols-outlined text-xs text-foreground/30 opacity-0 group-hover:opacity-100 transition-opacity translate-x-1 group-hover:translate-x-0 transition-transform duration-300">
                    arrow_forward_ios
                  </span>
                </div>
              );
            })}
          </div>

          {/* COLUMNA DERECHA: PANEL DE PREVISUALIZACIÓN EN TIEMPO REAL */}
          <div className="lg:col-span-7 w-full h-[395px] flex flex-col">
            <div className="volume-preview-panel">
              {/* Header del Panel */}
              <div className="flex items-start justify-between mb-4 border-b border-foreground/5 pb-4">
                <div className="flex flex-col min-w-0 pr-4">
                  <h3 className="font-serif text-lg text-zinc-200 tracking-wide leading-tight">
                    {activeVol.title}
                  </h3>
                  <p className="font-sans text-[11px] text-foreground/45 italic leading-relaxed mt-1.5">
                    {activeVol.desc}
                  </p>
                </div>
                <span className="material-symbols-outlined text-3xl text-primary/20 shrink-0 font-light select-none">
                  {activeVol.icon}
                </span>
              </div>

              {/* Contenido Dinámico Real */}
              <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar">
                {renderPreviewContent()}
              </div>

              {/* Footer con Acción */}
              <button 
                onClick={() => navigate(activeVol.path)}
                className="mt-4 w-full py-2.5 border border-foreground/10 hover:border-primary/40 bg-foreground/[0.01] hover:bg-primary/5 transition-all text-foreground/80 hover:text-primary font-mono text-[9px] uppercase tracking-widest flex items-center justify-center gap-2 group/btn"
              >
                Ingresar al {activeVol.label}
                <span className="material-symbols-outlined text-xs transition-transform duration-300 group-hover/btn:translate-x-1">
                  arrow_right_alt
                </span>
              </button>
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
};

export default ProjectView;

