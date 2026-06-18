import React from "react";
import { useProjectView } from "./useProjectView";
import "./ProjectView.css";

interface VolumeCard {
  icon: string;
  label: string;
  title: string;
  desc: string;
  path: string;
}

const ProjectView: React.FC = () => {
  const { projectName, navigate, t, user, baseUrl } = useProjectView();

  const projectTitle: string = projectName || "Crónicas de Aethelgard";
  const architectName: string = user?.displayName || user?.username || t("common.architect");

  const volumes: VolumeCard[] = [
    {
      icon: "menu_book",
      label: "Codex",
      title: t("project.codex_title"),
      desc: t("project.codex_desc"),
      path: `${baseUrl}/bible`,
    },
    {
      icon: "map",
      label: "Atlas",
      title: t("project.atlas_title"),
      desc: t("project.atlas_desc"),
      path: `${baseUrl}/map`,
    },
    {
      icon: "edit_note",
      label: "Crónicas",
      title: t("project.chronicles_title"),
      desc: t("project.chronicles_desc"),
      path: `${baseUrl}/writing`,
    },
    {
      icon: "hub",
      label: "Conexión",
      title: t("project.graph_title"),
      desc: t("project.graph_desc"),
      path: `${baseUrl}/graph`,
    },
    {
      icon: "calendar_month",
      label: "Cronos",
      title: t("project.timeline_title"),
      desc: t("project.timeline_desc"),
      path: `${baseUrl}/timeline`,
    },
    {
      icon: "translate",
      label: "Verbo",
      title: t("project.linguistics_title"),
      desc: t("project.linguistics_desc"),
      path: `${baseUrl}/linguistics`,
    },
    {
      icon: "analytics",
      label: "Esencia",
      title: t("project.analytics_title"),
      desc: t("project.analytics_desc"),
      path: `${baseUrl}/analytics`,
    },
  ];

  return (
    <div className="flex-1 flex flex-col h-screen overflow-y-auto no-scrollbar bg-background text-foreground font-serif p-8 md:p-16 justify-start items-center">
      {/* CONTENEDOR CENTRAL DE LA BIBLIOTECA */}
      <div className="max-w-4xl w-full flex flex-col items-start">
        
        {/* CABECERA LITERARIA LIMPIA Y PRÓXIMA */}
        <header className="mb-12 select-none w-full">
          <h1 className="text-5xl md:text-6xl font-light italic tracking-wide text-zinc-300 underline underline-offset-[16px] decoration-foreground/10 decoration-1">
            {projectTitle}
          </h1>
          <p className="text-[10px] text-foreground/45 font-mono mt-8 uppercase tracking-[0.2em] font-light">
            {t("project.welcome")}{" "}
            <span className="text-primary font-bold">
              {architectName}
            </span>
          </p>
        </header>

        {/* LISTA DE LIBROS (FLEXBOX PURO - COMPRESIÓN DINÁMICA CON POSICIONES ALTERNADAS) */}
        <div className="flex flex-col gap-6 items-start w-full">
          {volumes.map((vol: VolumeCard, index: number) => {
            const isLeft: boolean = index % 2 === 0;
            return (
              <div
                key={vol.path}
                onClick={() => navigate(vol.path)}
                className={`book-card ${isLeft ? "book-card-left" : "book-card-right"} group`}
              >
                {/* Bloque Fijo (Símbolo de iconografía oficial y título) */}
                <div className="book-symbol-block">
                  <span className="material-symbols-outlined text-4xl font-light leading-none text-foreground/70 group-hover:text-primary transition-colors duration-300">
                    {vol.icon}
                  </span>
                  <span className="font-mono text-[9px] uppercase tracking-[0.25em] text-primary/70 mt-3 text-center">
                    {vol.label}
                  </span>
                </div>
                
                {/* Bloque de Expansión Oculto */}
                <div className="reveal-content">
                  <div className="reveal-inner">
                    <p className="font-sans text-xs text-foreground/50 italic font-light tracking-wide max-w-[13.5rem] whitespace-normal">
                      {vol.desc}
                    </p>
                    <div className={`flex items-center gap-2 text-primary/70 hover:text-primary transition-colors shrink-0 ${isLeft ? "pr-6" : "pl-6"}`}>
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] font-light">
                        {t("project.explore_tool")}
                      </span>
                      {/* Flecha cinética deslizable adaptable */}
                      <span className={`text-xs ${isLeft ? "arrow-slide" : "arrow-slide-left"}`}>
                        {isLeft ? "→" : "←"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ProjectView;
