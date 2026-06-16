import React from "react";
import { useIndividualProfile } from "./useIndividualProfile";
import SecondaryTabs from "@components/ui/SecondaryTabs";
import DynamicAttributeForm from "@features/Entities/components/DynamicAttributeForm";
import MiniGraph from "@features/Entities/components/MiniGraph";
import NarrativeRichText from "@features/Entities/components/NarrativeRichText";
import {
  getPresetTabsByEntityType,
  mergeTabs,
} from "@features/Entities/utils/entityPresetTabs";

const IndividualProfileView: React.FC<{ entityId?: string | number }> = ({
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
  } = useIndividualProfile(propEntityId);

  const baseTabs = [
    { id: "REGISTRO", label: "REGISTRO", icon: "menu_book" },
    { id: "RED_DE_CONTACTOS", label: "RELACIONES", icon: "hub" },
    { id: "DATOS_TÉCNICOS", label: "DATOS TÉCNICOS", icon: "bar_chart" },
  ];
  const presetTabs = getPresetTabsByEntityType(entity?.tipo || "");
  const tabs = mergeTabs(baseTabs, presetTabs);
  const presetTabIds = presetTabs.map((tab) => tab.id);
  const isPresetTechnicalTab = presetTabIds.includes(activeTab);

  const narrativeContent = String(entity?.appearance || "").trim();
  const narrativeStory = String(entity?.descripcion || "").trim();
  const narrativeLength = narrativeContent.length;
  const narrativeGrowth = Math.min(560, Math.floor(narrativeLength / 3));
  const panelMinHeight = 360 + narrativeGrowth;

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-foreground/20 font-black tracking-[0.4em] text-[10px] animate-pulse">
          SINCRONIZANDO REGISTRO...
        </div>
      </div>
    );

  if (!entity)
    return (
      <div className="p-20 text-center text-destructive bg-background h-full font-black uppercase tracking-widest">
        404: ENTIDAD NO ENCONTRADA
      </div>
    );

  return (
    <div className="flex-1 bg-background flex flex-col h-full w-full">
      <header className="bg-background border-b border-foreground/5 px-8 py-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-6">
          <h1 className="font-sans font-bold text-3xl tracking-wider uppercase text-foreground">
            {entity.nombre}
          </h1>
          <span className="font-mono text-[10px] tracking-[0.2em] text-foreground/60 border border-foreground/20 px-3 py-1 bg-foreground/5 uppercase">
            {entity.tipo}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleDelete}
            className={`px-4 py-2 border transition-all text-[9px] font-mono tracking-[0.2em] uppercase flex items-center justify-center gap-2 ${
              confirmDelete
                ? "bg-destructive text-primary-foreground border-destructive animate-pulse"
                : "bg-background border-foreground/20 text-foreground/70 hover:border-red-500/50 hover:text-red-500 hover:bg-red-500/10"
            }`}
          >
            {confirmDelete ? "¿CONFIRMAR?" : "ELIMINAR"}
          </button>

          <button
            onClick={() =>
              navigate(`/local/${projectName}/bible/entity/${entity.id}/edit`)
            }
            className="px-4 py-2 bg-background border border-foreground/20 text-foreground/70 text-[9px] font-mono tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:border-green-500/50 hover:text-green-500 hover:bg-green-500/10 transition-all"
          >
            EDITAR
          </button>

          <div className="h-4 w-px bg-foreground/10 mx-1" />

          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-background border border-foreground/20 text-foreground/70 text-[9px] font-mono tracking-[0.2em] uppercase flex items-center justify-center gap-2 hover:border-blue-500/50 hover:text-blue-500 hover:bg-blue-500/10 transition-all"
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
        className={`flex-1 relative ${activeTab === "RED_DE_CONTACTOS" ? "overflow-hidden" : "overflow-y-auto custom-scrollbar"}`}
      >
        {activeTab === "REGISTRO" && (
          <main className="p-8 lg:p-16 grid grid-cols-1 lg:grid-cols-2 gap-8 items-start max-w-[90rem] mx-auto w-full">
            <div
              className="border border-foreground/20 bg-background p-4 flex flex-col"
              style={{ minHeight: `${panelMinHeight}px` }}
            >
              <div className="flex justify-center mb-4">
                <h3 className="font-mono font-black text-sm tracking-[0.2em] uppercase text-foreground border-b border-foreground/30 pb-1">
                  CRÓNICA Y BIOGRAFÍA
                </h3>
              </div>
              {!narrativeContent || narrativeContent === "Sin descripción." ? (
                <div className="flex justify-center mt-10">
                  <span className="font-serif italic text-foreground/50 text-xl">
                    Sin descripción.
                  </span>
                </div>
              ) : (
                <div className="w-full">
                  <NarrativeRichText content={narrativeContent} galleryImages={entity?.images} />
                </div>
              )}
            </div>

            <div
              className="border border-foreground/20 bg-background p-4 flex flex-col"
              style={{
                minHeight: `${panelMinHeight}px`,
                maxHeight: `${panelMinHeight}px`,
              }}
            >
              <div className="flex justify-center mb-4">
                <h3 className="font-mono font-black text-sm tracking-[0.2em] uppercase text-foreground border-b border-foreground/30 pb-1">
                  REGISTROS VISUALES
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-1 flex flex-col">
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
                          alt={`Evidence ${idx}`}
                          className="w-full h-full object-cover opacity-60 group-hover:opacity-100 grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="w-full h-full min-h-[150px] p-8 flex flex-col items-center justify-center bg-background border border-dashed border-foreground/20 shadow-[inset_0_2px_10px_rgba(0,0,0,0.5),_inset_0_0_0_1px_rgba(240,240,245,0.05)]">
                    <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-foreground/40">
                      SIN IMÁGENES EN GALERÍA
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="border border-foreground/20 bg-background p-4 flex flex-col lg:col-span-2">
              <div className="flex justify-center mb-2">
                <h3 className="font-mono font-black text-sm tracking-[0.2em] uppercase text-foreground border-b border-foreground/30">
                  NARRATIVA
                </h3>
              </div>
              {!narrativeStory || narrativeStory === "Sin narrativa." ? (
                <div className="flex justify-center mt-10">
                  <span className="font-serif italic text-foreground/50 text-xl">
                    Sin narrativa.
                  </span>
                </div>
              ) : (
                <div className="w-full">
                  <NarrativeRichText content={narrativeStory} galleryImages={entity?.images} />
                </div>
              )}
            </div>
          </main>
        )}

        {activeTab === "RED_DE_CONTACTOS" && (
          <div className="w-full h-full relative bg-background">
            <MiniGraph entityId={Number(entity.id)} projectId={entity.project_id} />
          </div>
        )}

        {(activeTab === "DATOS_TÉCNICOS" || isPresetTechnicalTab) && (
          <div className="p-8 lg:p-16 max-w-[90rem] mx-auto">
            <DynamicAttributeForm
              key={`dynamic-attributes-${entity.project_id}-${entity.id}`}
              entity={entity}
            />
          </div>
        )}

        {zoomImage && (
          <div
            className="fixed inset-0 z-[120] flex items-center justify-center bg-black/95 animate-in fade-in duration-300"
            onClick={() => setZoomImage(null)}
          >
            <button
              className="absolute top-10 right-10 text-foreground/40 hover:text-foreground transition-colors"
              onClick={() => setZoomImage(null)}
            >
              <span className="material-symbols-outlined text-4xl">close</span>
            </button>
            <img
              src={zoomImage}
              className="max-w-[90vw] max-h-[85vh] object-contain border border-foreground/10 shadow-2xl"
              alt="Zoom"
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualProfileView;
