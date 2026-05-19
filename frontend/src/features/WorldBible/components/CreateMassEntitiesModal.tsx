import React from "react";
import { useLanguage } from "@context/LanguageContext";
import { Carpeta } from "@domain/models/database";
import { useCreateMassEntities } from "./useCreateMassEntities";

interface CreateMassEntitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  projectId: number;
  allFolders: Carpeta[];
  initialFolderId?: number | null;
}

const ARQUETIPOS_GROUPS = [
  {
    name: "CÓSMICO",
    types: [
      {
        id: "UNIVERSE",
        label: "Universo",
        icon: "auto_awesome",
        color: "text-indigo-400",
      },
      {
        id: "PLANET",
        label: "Planeta",
        icon: "public",
        color: "text-blue-400",
      },
      {
        id: "DIMENSION",
        label: "Dimensión",
        icon: "layers",
        color: "text-cyan-400",
      },
    ],
  },
  {
    name: "INDIVIDUAL",
    types: [
      {
        id: "PERSONAJE",
        label: "Personaje",
        icon: "person",
        color: "text-blue-400",
      },
      {
        id: "OBJETO",
        label: "Objeto",
        icon: "category",
        color: "text-purple-400",
      },
      {
        id: "ENTIDAD",
        label: "Genérico",
        icon: "token",
        color: "text-slate-400",
      },
    ],
  },
  {
    name: "TERRITORIAL",
    types: [
      {
        id: "LUGAR",
        label: "Lugar",
        icon: "location_on",
        color: "text-emerald-400",
      },
      { id: "MAP", label: "Mapa", icon: "map", color: "text-teal-400" },
    ],
  },
  {
    name: "COLECTIVO",
    types: [
      {
        id: "ORGANIZACION",
        label: "Facción",
        icon: "groups",
        color: "text-amber-400",
      },
      {
        id: "CONLANG",
        label: "Lengua",
        icon: "translate",
        color: "text-orange-400",
      },
    ],
  },
  {
    name: "HISTÓRICO",
    types: [
      { id: "EVENTO", label: "Evento", icon: "event", color: "text-rose-400" },
      {
        id: "TIMELINE",
        label: "Línea",
        icon: "history",
        color: "text-red-400",
      },
    ],
  },
];

const CreateMassEntitiesModal: React.FC<CreateMassEntitiesModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  projectId,
  allFolders,
  initialFolderId,
}) => {
  const { t } = useLanguage();
  const {
    nameList,
    inputValue,
    setInputValue,
    type,
    setType,
    folderId,
    setFolderId,
    loading,
    availableTemplates,
    selectedAttributes,
    handleKeyDown,
    removeName,
    handleAddAttribute,
    handleRemoveAttribute,
    handleAttributeValueChange,
    handleSubmit,
  } = useCreateMassEntities(
    isOpen,
    projectId,
    allFolders,
    onCreated,
    onClose,
    initialFolderId,
  );

  if (!isOpen) return null;

  const noFolders = !allFolders || allFolders.length === 0;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl monolithic-panel bg-background border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <header className="p-8 border-b border-white/5 bg-background flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="size-12 bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary">
                dynamic_feed
              </span>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1 italic">
                Entrada Masiva de Datos
              </div>
              <h2 className="text-3xl font-black text-foreground tracking-tighter uppercase">
                Creador de Entidades en Serie
              </h2>
            </div>
          </div>
          <button
            onClick={onClose}
            className="size-12 flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all border border-white/5"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="flex-1 overflow-y-auto no-scrollbar grid grid-cols-1 lg:grid-cols-2 gap-0">
          {/* Columna 1: Identidad y Nombres */}
          <div className="p-8 space-y-10 border-r border-white/5 bg-background">
            <section className="space-y-4">
              <div className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">label</span>
                Identidades a Generar
              </div>

              <div className="space-y-3 p-6 bg-background border border-white/5 min-h-[160px] max-h-[240px] overflow-y-auto custom-scrollbar flex flex-wrap gap-2 content-start group focus-within:border-primary/30 transition-all">
                {nameList.map((name) => (
                  <div
                    key={name}
                    className="flex items-center gap-2 bg-primary/10 border border-primary/20 px-3 py-1.5 animate-in zoom-in-95"
                  >
                    <span className="text-[11px] font-black uppercase tracking-tighter text-primary-light">
                      {name}
                    </span>
                    <button
                      onClick={() => removeName(name)}
                      className="size-4 flex items-center justify-center hover:text-rose-500 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[12px] font-bold">
                        close
                      </span>
                    </button>
                  </div>
                ))}
                <input
                  autoFocus
                  disabled={noFolders}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    noFolders
                      ? "Crea una carpeta primero..."
                      : nameList.length === 0
                        ? "Escribe nombres + [Espacio]..."
                        : ""
                  }
                  className="flex-1 min-w-[120px] bg-transparent border-none outline-none text-xs font-bold italic text-foreground placeholder:text-foreground/20 disabled:cursor-not-allowed"
                />
              </div>
              <div className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest italic px-2">
                * Pulsa ESPACIO o ENTER para añadir cada nombre.
              </div>
            </section>

            <section className="space-y-4">
              <div className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">
                  category
                </span>
                Configuración de Clase
              </div>
              <div className="space-y-6">
                {ARQUETIPOS_GROUPS.map((group) => (
                  <div key={group.name} className="space-y-2">
                    <div className="text-[8px] font-black text-foreground/20 uppercase tracking-[0.3em] px-2">
                      {group.name}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {group.types.map((t) => (
                        <button
                          key={t.id}
                          disabled={noFolders}
                          onClick={() => setType(t.id)}
                          className={`flex flex-col items-center justify-center gap-2 p-4 border transition-all ${
                            type === t.id
                              ? "bg-primary/10 border-primary/40 shadow-lg shadow-primary/5"
                              : "bg-background border-white/10 hover:border-white/20 opacity-50 grayscale hover:grayscale-0"
                          } disabled:opacity-10 disabled:cursor-not-allowed`}
                        >
                          <span
                            className={`material-symbols-outlined ${type === t.id ? t.color : "text-foreground/40"}`}
                          >
                            {t.icon}
                          </span>
                          <span
                            className={`text-[9px] font-black uppercase tracking-widest ${type === t.id ? "text-foreground" : "text-foreground/40"}`}
                          >
                            {t.label}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between px-2">
                  <label className="text-[9px] font-black text-foreground/30 uppercase tracking-widest">
                    Carpeta de Destino Obligatoria
                  </label>
                </div>
                {noFolders ? (
                  <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-500 text-[10px] font-black uppercase tracking-widest flex flex-col items-center gap-4 text-center">
                    <div className="size-10 rounded-full bg-rose-500/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-sm">
                        warning
                      </span>
                    </div>
                    <div className="space-y-1">
                      <p>No hay carpetas en el proyecto</p>
                      <p className="text-[8px] opacity-60">
                        Crea una carpeta desde la vista principal y vuelve a
                        intentar.
                      </p>
                    </div>
                  </div>
                ) : (
                  <select
                    value={folderId || ""}
                    onChange={(e) => setFolderId(Number(e.target.value))}
                    className="w-full bg-background border border-white/10 p-4 rounded-none outline-none focus:border-primary/50 text-xs font-black uppercase tracking-widest cursor-pointer hover:bg-background transition-all"
                  >
                    {allFolders.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.nombre}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            </section>
          </div>

          {/* Columna 2: Atributos Comunes */}
          <div className="p-8 space-y-8 bg-background flex flex-col h-full">
            <header className="flex items-center justify-between shrink-0">
              <div className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">
                  assignment
                </span>
                Atributos Comunes
              </div>
              <select
                disabled={noFolders}
                onChange={(e) => handleAddAttribute(Number(e.target.value))}
                value=""
                className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase px-4 py-2 outline-none hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <option value="" disabled>
                  Inyectar Plantilla...
                </option>
                {availableTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} ({t.categoria || "Sin Categoría"})
                  </option>
                ))}
              </select>
            </header>

            <div className="flex-1 overflow-y-auto no-scrollbar space-y-4">
              {selectedAttributes.length === 0 ? (
                <div className="h-full border border-dashed border-white/10 flex flex-col items-center justify-center opacity-30 text-center p-10">
                  <span className="material-symbols-outlined text-5xl mb-4 font-light">
                    list_alt
                  </span>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em]">
                    Sin herencia de atributos
                  </p>
                  <p className="text-[9px] mt-2 italic text-foreground/60 max-w-[200px]">
                    Usa el selector superior para añadir campos de datos que
                    compartirán todos los entes.
                  </p>
                </div>
              ) : (
                selectedAttributes.map((attr) => (
                  <div
                    key={attr.template.id}
                    className="p-5 bg-background border border-white/5 space-y-4 group animate-in slide-in-from-right-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="size-2 bg-primary/40 rounded-full" />
                        <span className="text-[10px] font-black text-foreground uppercase tracking-widest">
                          {attr.template.nombre}
                        </span>
                      </div>
                      <button
                        onClick={() => handleRemoveAttribute(attr.template.id)}
                        className="material-symbols-outlined text-sm text-foreground/20 hover:text-rose-500 transition-colors"
                      >
                        delete
                      </button>
                    </div>
                    <input
                      value={attr.value}
                      onChange={(e) =>
                        handleAttributeValueChange(
                          attr.template.id,
                          e.target.value,
                        )
                      }
                      placeholder={`Definir ${attr.template.nombre.toLowerCase()}...`}
                      className="w-full bg-background border border-white/10 p-3 rounded-none outline-none focus:border-primary/50 text-[11px] font-bold italic transition-all"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-8 border-t border-white/5 bg-background flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {nameList.slice(0, 3).map((_, i) => (
                <div
                  key={i}
                  className="size-6 rounded-full border border-background bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary"
                >
                  {i + 1}
                </div>
              ))}
              {nameList.length > 3 && (
                <div className="size-6 rounded-full border border-background bg-surface-dark flex items-center justify-center text-[8px] font-black text-foreground/40">
                  +{nameList.length - 3}
                </div>
              )}
            </div>
            <div className="text-[10px] font-bold text-foreground/40 tracking-tight">
              {noFolders ? (
                <span className="text-rose-500 font-black uppercase">
                  Bloqueado: Crea una carpeta primero
                </span>
              ) : nameList.length > 0 ? (
                `Listo para generar ${nameList.length} ${nameList.length === 1 ? "entidad" : "entidades"} en carpeta específica`
              ) : (
                "Introduce nombres para comenzar..."
              )}
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={onClose}
              className="px-8 py-3 bg-background hover:bg-background text-[10px] font-black uppercase tracking-widest text-foreground/60 transition-all border border-white/5"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={loading || nameList.length === 0 || noFolders}
              className={`px-12 py-3 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98] transition-all ${loading || noFolders ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
            >
              {loading ? "Sincronizando..." : "Ejecutar Carga Masiva"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default CreateMassEntitiesModal;
