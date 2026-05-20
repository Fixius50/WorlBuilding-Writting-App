import React from "react";
import { useEventProfile } from "./useEventProfile";
import SecondaryTabs from "@molecules/SecondaryTabs";
import DynamicAttributeForm from "@features/Entities/components/DynamicAttributeForm";
import MiniTimeline from "@features/Entities/components/MiniTimeline";
import SectionErrorBoundary from "@organisms/SectionErrorBoundary";
import NarrativeRichText from "@features/Entities/components/NarrativeRichText";

const EventProfileView: React.FC<{ entityId?: string | number }> = ({
  entityId: propEntityId,
}) => {
  const [zoomImage, setZoomImage] = React.useState<string | null>(null);

  const {
    entity,
    loading,
    confirmDelete,
    activeTab,
    setActiveTab,
    handleDelete,
    projectName,
    username,
    navigate,
    entityId,
  } = useEventProfile(propEntityId);

  const tabs = [
    { id: "REGISTRO", label: "REGISTRO", icon: "menu_book" },
    { id: "CRONOGRAMA", label: "CRONOGRAMA", icon: "history" },
    { id: "DATOS_TÉCNICOS", label: "DATOS TÉCNICOS", icon: "bar_chart" },
  ];

  const narrativeContent = (
    entity?.appearance ||
    entity?.descripcion ||
    ""
  ).trim();
  const narrativeStory = (entity?.descripcion || "").trim();
  const narrativeLength = narrativeContent.length;
  const narrativeGrowth = Math.min(560, Math.floor(narrativeLength / 3));
  const panelMinHeight = 360 + narrativeGrowth;

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-foreground/20 font-black tracking-[0.4em] text-[10px] animate-pulse">
          RECONSTRUYENDO LÍNEA TEMPORAL...
        </div>
      </div>
    );
  }

  if (!entity) {
    return (
      <div className="p-20 text-center text-destructive bg-background h-full font-black uppercase tracking-widest">
        404: EVENTO NO ENCONTRADO
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background flex flex-col h-full w-full animate-in fade-in duration-1000">
      <header className="bg-background border-b border-foreground/5 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="text-lg font-black text-foreground tracking-tighter uppercase">
            {entity.nombre}
          </h1>
          <div className="px-3 py-1 bg-foreground/[0.03] border border-foreground/5 text-[9px] font-black uppercase tracking-widest text-foreground/20">
            {entity.tipo}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className={`px-4 py-2 border transition-all text-[9px] font-black uppercase tracking-widest ${
              confirmDelete
                ? "bg-destructive text-white border-destructive animate-pulse"
                : "border-destructive/20 text-destructive/40 hover:bg-destructive hover:text-white"
            }`}
          >
            {confirmDelete ? "¿CONFIRMAR?" : "ELIMINAR"}
          </button>

          <button
            onClick={() =>
              navigate(
                `/${username || "local"}/${projectName}/bible/entity/${entityId}/edit`,
              )
            }
            className="px-4 py-2 border border-foreground/10 text-foreground/60 text-[9px] font-black uppercase tracking-widest hover:bg-primary hover:text-background transition-all"
          >
            EDITAR
          </button>

          <button
            onClick={() =>
              navigate(`/local/${projectName}/bible/entity/${entity.id}/edit`)
            }
            className="px-4 py-2 border border-foreground/10 text-foreground text-[9px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
          >
            EDITAR
          </button>

          <div className="h-4 w-px bg-foreground/10 mx-1" />

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 border border-foreground/10 text-foreground/40 text-[9px] font-black uppercase tracking-widest hover:bg-foreground hover:text-background transition-all"
          >
            VOLVER / CANCELAR
          </button>
        </div>
      </header>

      <SecondaryTabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={setActiveTab}
        className="bg-foreground/[0.01] border-b border-foreground/5 shrink-0"
      />

      <div
        className={`flex-1 relative ${activeTab === "CRONOGRAMA" ? "overflow-hidden" : "overflow-y-auto custom-scrollbar"}`}
      >
        {activeTab === "REGISTRO" && (
          <main className="p-12 lg:p-24 space-y-24 max-w-6xl mx-auto w-full">
            <section>
              <div className="grid grid-cols-2 gap-8 items-start">
                <div
                  className="border border-foreground/10 bg-foreground/[0.02] p-8"
                  style={{ minHeight: `${panelMinHeight}px` }}
                >
                  <div className="flex flex-col items-center gap-4 mb-8">
                    <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] border-b border-primary/40 pb-2">
                      CRÓNICA DEL EVENTO
                    </h3>
                  </div>
                  <div className="max-w-4xl mx-auto">
                    <NarrativeRichText content={narrativeContent} />
                  </div>
                </div>

                <div
                  className="border border-foreground/10 bg-foreground/[0.02] p-8 flex flex-col"
                  style={{
                    minHeight: `${panelMinHeight}px`,
                    maxHeight: `${panelMinHeight}px`,
                  }}
                >
                  <div className="flex flex-col items-center gap-4 mb-6">
                    <h3 className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.4em]">
                      REGISTROS VISUALES
                    </h3>
                  </div>

                  <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
                    {entity.images && entity.images.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                        {entity.images.map((img, idx) => (
                          <div
                            key={idx}
                            className="aspect-video bg-foreground/[0.02] border border-foreground/5 overflow-hidden group transition-all cursor-zoom-in"
                            onClick={() => setZoomImage(img)}
                          >
                            <img
                              src={img}
                              alt={`Event View ${idx}`}
                              className="w-full h-full object-cover opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-700"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="h-full min-h-[12rem] flex items-center justify-center border border-dashed border-foreground/10 text-foreground/30 text-[10px] font-black uppercase tracking-[0.2em]">
                        Sin imágenes en galería
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section>
              <div className="border border-foreground/10 bg-foreground/[0.02] p-8">
                <div className="flex flex-col items-center gap-4 mb-8">
                  <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] border-b border-primary/40 pb-2">
                    NARRATIVA
                  </h3>
                </div>
                <div className="max-w-4xl mx-auto">
                  <NarrativeRichText
                    content={narrativeStory || "Sin narrativa."}
                  />
                </div>
              </div>
            </section>
          </main>
        )}

        {activeTab === "CRONOGRAMA" && (
          <div className="w-full h-full p-12 lg:p-24 relative bg-background">
            <SectionErrorBoundary sectorName="CRONOGRAMA">
              <MiniTimeline entityId={Number(entityId)} />
            </SectionErrorBoundary>
          </div>
        )}

        {activeTab === "DATOS_TÉCNICOS" && (
          <div className="p-12 lg:p-24 max-w-5xl mx-auto">
            <SectionErrorBoundary sectorName="DATOS TÉCNICOS">
              <DynamicAttributeForm entity={entity} />
            </SectionErrorBoundary>
          </div>
        )}

        {zoomImage && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 animate-in fade-in duration-300"
            onClick={() => setZoomImage(null)}
          >
            <button
              className="absolute top-10 right-10 text-white/40 hover:text-white transition-colors"
              onClick={() => setZoomImage(null)}
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>
            <img
              src={zoomImage}
              className="max-w-[90vw] max-h-[85vh] object-contain border border-white/10 shadow-2xl"
              alt="Zoom"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EventProfileView;
