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

const TYPE_OPTIONS = ARQUETIPOS_GROUPS.flatMap((group) => group.types);

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
    nameEntries,
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
    removeNameAt,
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

  const noFolders = !allFolders || allFolders.length === 0;
  const [classInput, setClassInput] = React.useState("");
  const [classSelectValue, setClassSelectValue] = React.useState("");
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [folderInput, setFolderInput] = React.useState("");
  const [folderSelectValue, setFolderSelectValue] = React.useState("");
  const [selectedFolders, setSelectedFolders] = React.useState<number[]>([]);

  React.useEffect(() => {
    if (isOpen) {
      setClassInput("");
      setClassSelectValue("");
      setFolderInput("");
      setFolderSelectValue("");
      setSelectedTypes([]);
      setSelectedFolders(folderId ? [folderId] : []);
    }
  }, [isOpen]);

  const resolveTypeId = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const byId = TYPE_OPTIONS.find(
      (option) => option.id.toLowerCase() === normalized,
    );
    if (byId) {
      return byId.id;
    }
    const byLabel = TYPE_OPTIONS.find(
      (option) => option.label.toLowerCase() === normalized,
    );
    if (byLabel) {
      return byLabel.id;
    }
    return null;
  };

  const resolveFolderId = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const byName = allFolders.find(
      (folder) => folder.nombre.toLowerCase() === normalized,
    );
    if (byName) {
      return byName.id;
    }
    const byIdNumber = Number(value.trim());
    if (!Number.isNaN(byIdNumber)) {
      const byId = allFolders.find((folder) => folder.id === byIdNumber);
      if (byId) {
        return byId.id;
      }
    }
    return null;
  };

  const handleClassKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const resolvedTypeId = resolveTypeId(classInput);
      if (!resolvedTypeId) {
        return;
      }
      if (selectedTypes.includes(resolvedTypeId)) {
        setClassInput("");
        return;
      }
      setSelectedTypes((prev) => [...prev, resolvedTypeId]);
      setType(resolvedTypeId);
      setClassInput("");
    } else if (
      e.key === "Backspace" &&
      !classInput &&
      selectedTypes.length > 0
    ) {
      setSelectedTypes((prev) => prev.slice(0, -1));
    }
  };

  const handleFolderKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const resolvedFolderId = resolveFolderId(folderInput);
      if (!resolvedFolderId) {
        return;
      }
      if (selectedFolders.includes(resolvedFolderId)) {
        setFolderInput("");
        return;
      }
      setSelectedFolders((prev) => [...prev, resolvedFolderId]);
      setFolderId(resolvedFolderId);
      setFolderInput("");
    } else if (
      e.key === "Backspace" &&
      !folderInput &&
      selectedFolders.length > 0
    ) {
      setSelectedFolders((prev) => prev.slice(0, -1));
    }
  };

  const removeSelectedTypeAt = (indexToRemove: number) => {
    setSelectedTypes((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const removeSelectedFolderAt = (indexToRemove: number) => {
    setSelectedFolders((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleClassSelect = (value: string) => {
    if (!value) {
      return;
    }
    if (selectedTypes.includes(value)) {
      setClassSelectValue("");
      return;
    }
    setSelectedTypes((prev) => [...prev, value]);
    setType(value);
    setClassSelectValue("");
  };

  const handleFolderSelect = (value: string) => {
    if (!value) {
      return;
    }
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      return;
    }
    if (selectedFolders.includes(parsed)) {
      setFolderSelectValue("");
      return;
    }
    setSelectedFolders((prev) => [...prev, parsed]);
    setFolderId(parsed);
    setFolderSelectValue("");
  };

  const getTypeLabel = (typeId: string) => {
    const option = TYPE_OPTIONS.find((typeOption) => typeOption.id === typeId);
    if (option) {
      return option.label;
    }
    return typeId;
  };

  const getFolderLabel = (folderValueId: number) => {
    const folder = allFolders.find(
      (folderItem) => folderItem.id === folderValueId,
    );
    if (folder) {
      return folder.nombre;
    }
    return String(folderValueId);
  };

  const availableTypeOptions = TYPE_OPTIONS.filter(
    (option) => !selectedTypes.includes(option.id),
  );

  const availableFolderOptions = allFolders.filter(
    (folder) => !selectedFolders.includes(folder.id),
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 animate-in fade-in duration-300">
      <div className="w-full max-w-5xl monolithic-panel bg-background border border-white/10 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Header */}
        <header className="p-6 border-b border-white/5 bg-background flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="size-10 bg-primary/10 flex items-center justify-center border border-primary/20">
              <span className="material-symbols-outlined text-primary">
                dynamic_feed
              </span>
            </div>
            <div>
              <div className="text-[10px] font-black uppercase tracking-[0.4em] text-primary mb-1 italic">
                Entrada Masiva de Datos
              </div>
              <h2 className="text-2xl font-black text-foreground tracking-tighter uppercase">
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
          {/* Columna 1: Entrada tipo Notion */}
          <div className="p-6 space-y-4 border-r border-white/5 bg-background">
            <div className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="material-symbols-outlined text-xs">label</span>
              Entrada Rápida En Serie
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[320px] overflow-hidden">
              <section className="p-3 bg-background border border-white/5 space-y-2 h-full flex flex-col overflow-hidden">
                <div className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                  Nombres
                </div>
                <input
                  autoFocus
                  disabled={noFolders}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    noFolders ? "Crea carpeta primero..." : "Nombre + Enter"
                  }
                  className="w-full bg-transparent border border-white/10 px-3 py-2 outline-none text-[11px] font-bold italic text-foreground placeholder:text-foreground/20 disabled:cursor-not-allowed"
                />
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 content-start pt-1 pr-1">
                  {nameEntries.map((entry, index) => (
                    <div
                      key={`${entry.name}-${index}`}
                      className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2 py-1 animate-in zoom-in-95"
                    >
                      <span className="text-[10px] font-black uppercase tracking-tighter text-primary-light">
                        {entry.name}
                      </span>
                      <button
                        onClick={() => removeNameAt(index)}
                        className="size-4 flex items-center justify-center hover:text-rose-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[12px] font-bold">
                          close
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-3 bg-background border border-white/5 space-y-2 h-full flex flex-col overflow-hidden">
                <div className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                  Clases
                </div>
                <input
                  disabled={noFolders}
                  list="worldbible-class-options"
                  value={classInput}
                  onChange={(e) => setClassInput(e.target.value)}
                  onKeyDown={handleClassKeyDown}
                  placeholder={
                    noFolders ? "Crea carpeta primero..." : "Clase + Enter"
                  }
                  className="w-full bg-transparent border border-white/10 px-3 py-2 outline-none text-[11px] font-bold italic text-foreground placeholder:text-foreground/20 disabled:cursor-not-allowed"
                />
                <select
                  disabled={noFolders}
                  value={classSelectValue}
                  onChange={(e) => handleClassSelect(e.target.value)}
                  className="w-full h-9 bg-background border border-white/10 px-3 py-2 outline-none text-[10px] font-bold text-foreground/80 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar clase existente...</option>
                  {availableTypeOptions.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 content-start pt-1 pr-1">
                  {selectedTypes.map((selectedTypeId, index) => (
                    <div
                      key={`${selectedTypeId}-${index}`}
                      className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2 py-1 animate-in zoom-in-95"
                    >
                      <span className="text-[10px] font-black uppercase tracking-tighter text-primary-light">
                        {getTypeLabel(selectedTypeId)}
                      </span>
                      <button
                        onClick={() => removeSelectedTypeAt(index)}
                        className="size-4 flex items-center justify-center hover:text-rose-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[12px] font-bold">
                          close
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>

              <section className="p-3 bg-background border border-white/5 space-y-2 h-full flex flex-col overflow-hidden">
                <div className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                  Carpetas
                </div>
                <input
                  disabled={noFolders}
                  value={folderInput}
                  onChange={(e) => setFolderInput(e.target.value)}
                  onKeyDown={handleFolderKeyDown}
                  placeholder={
                    noFolders ? "Sin carpetas" : "Carpeta o ID + Enter"
                  }
                  className="w-full bg-transparent border border-white/10 px-3 py-2 outline-none text-[11px] font-bold italic text-foreground placeholder:text-foreground/20 disabled:cursor-not-allowed"
                />
                <select
                  disabled={noFolders}
                  value={folderSelectValue}
                  onChange={(e) => handleFolderSelect(e.target.value)}
                  className="w-full h-9 bg-background border border-white/10 px-3 py-2 outline-none text-[10px] font-bold text-foreground/80 disabled:cursor-not-allowed"
                >
                  <option value="">Seleccionar carpeta existente...</option>
                  {availableFolderOptions.map((folder) => (
                    <option key={folder.id} value={folder.id}>
                      {folder.nombre}
                    </option>
                  ))}
                </select>
                <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-wrap gap-2 content-start pt-1 pr-1">
                  {selectedFolders.map((selectedFolderId, index) => (
                    <div
                      key={`${selectedFolderId}-${index}`}
                      className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2 py-1 animate-in zoom-in-95"
                    >
                      <span className="text-[10px] font-black uppercase tracking-tighter text-primary-light">
                        {getFolderLabel(selectedFolderId)}
                      </span>
                      <button
                        onClick={() => removeSelectedFolderAt(index)}
                        className="size-4 flex items-center justify-center hover:text-rose-500 transition-colors"
                      >
                        <span className="material-symbols-outlined text-[12px] font-bold">
                          close
                        </span>
                      </button>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <datalist id="worldbible-class-options">
              {availableTypeOptions.map((option) => (
                <option key={option.id} value={option.label} />
              ))}
            </datalist>

            <div className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest italic px-1">
              * Cada Enter crea una etiqueta debajo. Puedes quitarla con la X.
            </div>
          </div>

          {/* Columna 2: Atributos Comunes */}
          <div className="p-6 space-y-6 bg-background flex flex-col h-full">
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
                    className="p-4 bg-background border border-white/5 space-y-3 group animate-in slide-in-from-right-2"
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
                      className="w-full bg-background border border-white/10 p-2.5 rounded-none outline-none focus:border-primary/50 text-[11px] font-bold italic transition-all"
                    />
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="p-6 border-t border-white/5 bg-background flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex -space-x-2">
              {nameEntries.slice(0, 3).map((_, i) => (
                <div
                  key={i}
                  className="size-6 rounded-full border border-background bg-primary/20 flex items-center justify-center text-[8px] font-black text-primary"
                >
                  {i + 1}
                </div>
              ))}
              {nameEntries.length > 3 && (
                <div className="size-6 rounded-full border border-background bg-surface-dark flex items-center justify-center text-[8px] font-black text-foreground/40">
                  +{nameEntries.length - 3}
                </div>
              )}
            </div>
            <div className="text-[10px] font-bold text-foreground/40 tracking-tight">
              {noFolders ? (
                <span className="text-rose-500 font-black uppercase">
                  Bloqueado: Crea una carpeta primero
                </span>
              ) : nameEntries.length > 0 ? (
                `Listo: ${nameEntries.length} nombres, ${selectedTypes.length} clases, ${selectedFolders.length} carpetas`
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
              onClick={() => handleSubmit(selectedTypes, selectedFolders)}
              disabled={
                loading ||
                nameEntries.length === 0 ||
                noFolders ||
                selectedTypes.length === 0 ||
                selectedFolders.length === 0
              }
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
