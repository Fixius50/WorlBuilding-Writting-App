import React from "react";
import MonolithicPanel from "@atoms/MonolithicPanel";
import Button from "@atoms/Button";
import { useMapCreationWizard } from "./useMapCreationWizard";

interface MapCreationWizardProps {
  onCancel: () => void;
  onCreate: (
    mapName: string,
    config: {
      bgImage: string;
      mapType: string;
      description: string;
      parentId?: number;
      is3D: boolean;
    },
  ) => void;
  projectName: string;
}

const MapCreationWizard: React.FC<MapCreationWizardProps> = ({
  onCancel,
  onCreate,
  projectName,
}) => {
  const {
    mapType,
    setMapType,
    canvasSource,
    setCanvasSource,
    bgImageUrl,
    setBgImageUrl,
    uploadedFile,
    mapName,
    setMapName,
    description,
    setDescription,
    is3D,
    urlError,
    isValidatingUrl,
    isCreating,
    creationStatusText,
    fileInputRef,
    handleFileSelect,
    handleUploadClick,
    handleCreate,
  } = useMapCreationWizard(onCreate, projectName);

  return (
    <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/90 p-6">
      <div className="w-full max-w-4xl max-h-[90vh] overflow-hidden monolithic-panel bg-background border border-foreground/10 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex flex-col animate-in zoom-in-95 duration-500 relative">
        {isCreating && (
          <div className="absolute inset-0 z-[110] flex flex-col items-center justify-center bg-black/80 backdrop-blur-sm gap-4 animate-in fade-in duration-300">
            <span className="material-symbols-outlined text-4xl text-primary animate-spin">
              sync
            </span>
            <p className="text-xs font-black uppercase tracking-widest text-foreground">
              {creationStatusText}
            </p>
            <p className="text-[9px] font-bold uppercase tracking-widest text-foreground/40">
              Por favor, espera...
            </p>
          </div>
        )}
        <div className="flex-1 overflow-y-auto p-12 space-y-16 custom-scrollbar">
          <section className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-black text-foreground tracking-tight">
                1 IDENTIDAD Y JERARQUÍA
              </h2>
              <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.3em]">
                Define el propósito de esta cartografía
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">
                  Nombre del Mapa
                </label>
                <input
                  type="text"
                  value={mapName}
                  onChange={(e) => setMapName(e.target.value)}
                  className="w-full bg-foreground/5 border border-foreground/10 p-4 text-sm font-bold text-foreground outline-none focus:border-primary transition-all"
                  placeholder="Ej: Las Tierras de Poniente..."
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-foreground/40">
                  Descripción breve
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-foreground/5 border border-foreground/10 p-4 text-sm text-foreground/60 outline-none focus:border-primary transition-all font-medium"
                  placeholder="Opcional..."
                />
              </div>
            </div>
          </section>

          <section className="space-y-6">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-black text-foreground tracking-tight">
                2 TIPO DE MAPA
              </h2>
              <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.3em]">
                Escala y tecnología visual
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TypeCard
                active={mapType === "PLANET"}
                onClick={() => setMapType("PLANET")}
                icon="public"
                label="Planeta / Mundo"
                desc="Vista global de un cuerpo celeste."
              />
              <TypeCard
                active={mapType === "TERRITORY"}
                onClick={() => setMapType("TERRITORY")}
                icon="map"
                label="Territorio"
                desc="Países, reinos o continentes."
              />
              <TypeCard
                active={mapType === "ZONE"}
                onClick={() => setMapType("ZONE")}
                icon="location_on"
                label="Zona / Ciudad"
                desc="Planos detallados o mazmorras."
              />
            </div>
          </section>

          <section className="space-y-10 pb-10">
            <div className="space-y-1">
              <h2 className="text-2xl font-serif font-black text-foreground tracking-tight">
                3 ORIGEN DEL LIENZO
              </h2>
              <p className="text-[10px] text-foreground/40 font-black uppercase tracking-[0.3em]">
                ¿De dónde vendrá la imagen base?
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <input
                type="file"
                ref={fileInputRef}
                accept="image/*,.glb,.gltf,.obj,.fbx,.stl"
                onChange={handleFileSelect}
                className="hidden"
              />
              <SourceCard
                active={canvasSource === "url"}
                onClick={() => setCanvasSource("url")}
                icon="language"
                label="URL Externa"
                desc="Enlazar desde la web"
                subdesc="TAMAÑO INFINITO"
              />
              <SourceCard
                active={canvasSource === "upload"}
                onClick={handleUploadClick}
                icon="cloud_upload"
                label={uploadedFile ? uploadedFile.name : "Archivo Local"}
                desc="Subir desde tu equipo"
                subdesc="SIN LÍMITE"
              />
              <SourceCard
                active={canvasSource === "blank"}
                onClick={() => setCanvasSource("blank")}
                icon="brush"
                label="Lienzo Blanco"
                desc="Dibujar desde cero"
                subdesc="ESCALA INFINITA"
              />
            </div>
            {canvasSource === "url" && (
              <div className="mt-6 space-y-2 animate-in fade-in slide-in-from-top-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-primary">
                  URL de la Imagen
                </label>
                <input
                  type="text"
                  value={bgImageUrl}
                  onChange={(e) => setBgImageUrl(e.target.value)}
                  className={`w-full bg-foreground/5 border p-4 text-xs font-mono text-foreground outline-none transition-all ${urlError ? "border-rose-500/50 focus:border-rose-500 bg-rose-500/5" : "border-foreground/10 focus:border-primary"}`}
                  placeholder="https://..."
                />
                {urlError && (
                  <p className="text-rose-400 text-[10px] font-bold mt-1.5 uppercase tracking-wider animate-in fade-in duration-200 flex items-center gap-1.5 font-mono">
                    <span className="material-symbols-outlined text-xs">
                      warning
                    </span>{" "}
                    {urlError}
                  </p>
                )}
                {isValidatingUrl && (
                  <p className="text-foreground/40 text-[9px] font-bold mt-1.5 uppercase tracking-wider animate-pulse flex items-center gap-1.5 font-mono">
                    <span className="material-symbols-outlined text-xs animate-spin">
                      sync
                    </span>{" "}
                    Validando URL...
                  </p>
                )}
              </div>
            )}
          </section>
        </div>

        <footer className="p-8 bg-background border-t border-foreground/10 flex justify-between items-center sticky bottom-0 z-10 shadow-[0_-10px_30px_rgba(0,0,0,0.3)]">
          <button
            onClick={onCancel}
            className="text-sm font-bold text-foreground/60 hover:text-foreground transition-colors"
          >
            Cancelar
          </button>
          <div className="flex items-center gap-6">
            <span className="text-[9px] font-black uppercase tracking-widest text-foreground/60">
              Cambios guardados localmente
            </span>
            <Button
              variant="primary"
              className="px-10 py-3 shadow-xl"
              onClick={handleCreate}
              disabled={
                canvasSource === "url" &&
                (!!urlError || !bgImageUrl || isValidatingUrl)
              }
            >
              Crear Mapa
            </Button>
          </div>
        </footer>
      </div>
    </div>
  );
};

const TypeCard: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  desc: string;
}> = ({ active, onClick, icon, label, desc }) => (
  <div
    onClick={onClick}
    className={`p-6 border transition-all cursor-pointer group ${active ? "bg-primary/10 border-primary" : "bg-foreground/5 border-foreground/10 hover:border-foreground/40"}`}
  >
    <div
      className={`size-10 mb-4 flex items-center justify-center transition-all ${active ? "bg-primary text-foreground" : "bg-foreground/5 text-foreground/60"}`}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </div>
    <h3
      className={`text-sm font-bold mb-1 ${active ? "text-foreground" : "text-foreground/60"}`}
    >
      {label}
    </h3>
    <p className="text-[10px] text-foreground/60 leading-relaxed">{desc}</p>
  </div>
);

const SourceCard: React.FC<{
  active: boolean;
  onClick: () => void;
  icon: string;
  label: string;
  desc: string;
  subdesc: string;
}> = ({ active, onClick, icon, label, desc, subdesc }) => (
  <div
    onClick={onClick}
    className={`p-8 border transition-all cursor-pointer group flex flex-col items-center text-center gap-4 ${active ? "bg-primary/5 border-primary shadow-lg" : "bg-background border-foreground/10 hover:border-foreground/40"}`}
  >
    <div
      className={`size-14 flex items-center justify-center transition-all ${active ? "bg-primary text-foreground shadow-xl shadow-primary/20" : "bg-foreground/5 text-foreground/60"}`}
    >
      <span className="material-symbols-outlined text-3xl">{icon}</span>
    </div>
    <div className="space-y-1">
      <h3
        className={`text-sm font-bold ${active ? "text-foreground" : "text-foreground/60"}`}
      >
        {label}
      </h3>
      <p className="text-[10px] text-foreground/60">{desc}</p>
    </div>
    <div className="flex gap-2 mt-2">
      {subdesc.split("•").map((s, i) => (
        <span
          key={i}
          className="px-2 py-1 bg-background/20 text-[8px] font-black text-foreground/60 uppercase"
        >
          {s.trim()}
        </span>
      ))}
    </div>
  </div>
);

export default MapCreationWizard;
