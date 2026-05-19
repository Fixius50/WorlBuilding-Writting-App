import React from "react";
import { useTerritoryProfile } from "./useTerritoryProfile";
import SecondaryTabs from "@presentation/molecules/SecondaryTabs";
import DynamicAttributeForm from "@features/Entities/components/DynamicAttributeForm";

const TerritoryProfileView: React.FC<{ entityId?: string | number }> = ({
  entityId: propEntityId,
}) => {
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
  } = useTerritoryProfile(propEntityId);

  const tabs = [
    { id: "REGISTRO", label: "REGISTRO", icon: "menu_book" },
    { id: "MAPA_TACTICO", label: "MAPA TÁCTICO", icon: "map" },
    { id: "DATOS_TÉCNICOS", label: "DATOS TÉCNICOS", icon: "bar_chart" },
  ];

  if (loading)
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-foreground/20 font-black tracking-[0.4em] text-[10px] animate-pulse">
          ACCEDIENDO A CARTOGRAFÍA...
        </div>
      </div>
    );

  if (!entity)
    return (
      <div className="p-20 text-center text-destructive bg-background h-full font-black uppercase tracking-widest">
        404: TERRITORIO NO ENCONTRADA
      </div>
    );

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
        className={`flex-1 relative ${activeTab === "MAPA_TACTICO" ? "overflow-hidden" : "overflow-y-auto custom-scrollbar"}`}
      >
        {activeTab === "REGISTRO" && (
          <main className="p-12 lg:p-24 space-y-24 max-w-6xl mx-auto w-full">
            <section className="space-y-12">
              <div className="flex flex-col items-center gap-4">
                <h3 className="text-[10px] font-black text-foreground uppercase tracking-[0.4em] border-b border-primary/40 pb-2">
                  CRÓNICA TERRITORIAL
                </h3>
              </div>
              <div className="max-w-4xl mx-auto">
                <div className="text-lg text-foreground/80 leading-relaxed font-light italic">
                  {entity.descripcion || "Sin descripción."}
                </div>
              </div>
            </section>
          </main>
        )}

        {activeTab === "MAPA_TACTICO" && (
          <div className="w-full h-full relative bg-background flex flex-col items-center justify-center p-24">
            <div className="size-64 rounded-full border-4 border-foreground/5 flex items-center justify-center relative mb-12">
              <div className="absolute inset-4 rounded-full border border-foreground/10 border-dashed animate-[spin_20s_linear_infinite]" />
              <span className="material-symbols-outlined text-6xl text-foreground/5">
                map
              </span>
            </div>
            <div className="text-foreground/20 font-black tracking-[0.4em] text-[10px] uppercase text-center max-w-sm">
              Cargando Mapa Táctico...
            </div>
          </div>
        )}

        {activeTab === "DATOS_TÉCNICOS" && (
          <div className="p-12 lg:p-24 max-w-5xl mx-auto">
            <DynamicAttributeForm entity={entity} />
          </div>
        )}
      </div>
    </div>
  );
};

export default TerritoryProfileView;
