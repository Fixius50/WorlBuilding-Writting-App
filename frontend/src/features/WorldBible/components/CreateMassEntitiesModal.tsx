import React from "react";
import { Carpeta, Plantilla } from "@domain/database";
import { getHierarchyType } from "@infrastructure/utils/constants/hierarchy_types";
import { WorldBibleUseCase } from "@features/WorldBible";
import { useCreateMassEntities } from "../hooks/useCreateMassEntities";

interface CreateMassEntitiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated: () => void;
  projectId: number;
  allFolders: Carpeta[];
  initialFolderId?: number | null;
}

interface MassTypeOption {
  id: string;
  label: string;
}

const MASS_ENTITY_TYPE_IDS = [
  "UNIVERSE",
  "PLANET",
  "DIMENSION",
  "PERSONAJE",
  "OBJETO",
  "ENTIDAD",
  "LUGAR",
  "MAP",
  "ORGANIZACION",
  "CONLANG",
  "EVENTO",
  "TIMELINE",
] as const;

const ENTITY_TYPE_TO_HIERARCHY_ID: Partial<
  Record<(typeof MASS_ENTITY_TYPE_IDS)[number], string>
> = {
  UNIVERSE: "universe",
  PLANET: "planet",
  DIMENSION: "dimension",
  PERSONAJE: "personaje",
  OBJETO: "objeto",
  LUGAR: "lugar",
  MAP: "map",
  ORGANIZACION: "organizacion",
  CONLANG: "conlang",
  EVENTO: "evento",
  TIMELINE: "timeline",
};

const TYPE_OPTIONS: MassTypeOption[] = MASS_ENTITY_TYPE_IDS.map((id) => {
  const hierarchyId = ENTITY_TYPE_TO_HIERARCHY_ID[id];
  const fallbackLabel = id === "ENTIDAD" ? "Generico" : id;

  return {
    id,
    label: hierarchyId ? getHierarchyType(hierarchyId).label : fallbackLabel,
  };
});

const CreateMassEntitiesModal: React.FC<CreateMassEntitiesModalProps> = ({
  isOpen,
  onClose,
  onCreated,
  projectId,
  allFolders,
  initialFolderId,
}) => {
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
    handleCreateTemplate,
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
  const [selectedTypes, setSelectedTypes] = React.useState<string[]>([]);
  const [folderInput, setFolderInput] = React.useState("");
  const [selectedFolders, setSelectedFolders] = React.useState<number[]>([]);
  const [folderOptions, setFolderOptions] =
    React.useState<Carpeta[]>(allFolders);
  const [isCreatingTemplate, setIsCreatingTemplate] = React.useState(false);
  const [templateForm, setTemplateForm] = React.useState<{
    nombre: string;
    tipo: Plantilla["tipo"];
    valor_defecto: string;
    es_obligatorio: boolean;
  }>({
    nombre: "",
    tipo: "text",
    valor_defecto: "",
    es_obligatorio: false,
  });
  const [isSavingTemplate, setIsSavingTemplate] = React.useState(false);
  const [isClassDropdownOpen, setIsClassDropdownOpen] = React.useState(false);
  const [isFolderDropdownOpen, setIsFolderDropdownOpen] = React.useState(false);
  const classDropdownRef = React.useRef<HTMLDivElement | null>(null);
  const folderDropdownRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    setFolderOptions(allFolders);
  }, [allFolders]);

  React.useEffect(() => {
    if (isOpen) {
      setClassInput("");
      setFolderInput("");
      setSelectedTypes([]);
      setSelectedFolders(folderId ? [folderId] : []);
      setIsCreatingTemplate(false);
      setTemplateForm({
        nombre: "",
        tipo: "text",
        valor_defecto: "",
        es_obligatorio: false,
      });
      setIsSavingTemplate(false);
      setIsClassDropdownOpen(false);
      setIsFolderDropdownOpen(false);
    }
  }, [isOpen]);

  const onCreateTemplate = async () => {
    if (isSavingTemplate || !templateForm.nombre.trim()) {
      return;
    }

    setIsSavingTemplate(true);
    try {
      const createdTemplate = await handleCreateTemplate({
        nombre: templateForm.nombre,
        tipo: templateForm.tipo,
        valor_defecto: templateForm.valor_defecto,
        es_obligatorio: templateForm.es_obligatorio ? 1 : 0,
      });

      if (createdTemplate) {
        handleAddAttribute(createdTemplate.id, createdTemplate);
        setTemplateForm({
          nombre: "",
          tipo: "text",
          valor_defecto: "",
          es_obligatorio: false,
        });
        setIsCreatingTemplate(false);
      }
    } finally {
      setIsSavingTemplate(false);
    }
  };

  React.useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const targetNode = event.target as Node;
      const classClickedInside =
        classDropdownRef.current?.contains(targetNode) ?? false;
      const folderClickedInside =
        folderDropdownRef.current?.contains(targetNode) ?? false;

      if (!classClickedInside) {
        setIsClassDropdownOpen(false);
      }
      if (!folderClickedInside) {
        setIsFolderDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [isOpen]);

  const sortedNameEntries = React.useMemo(
    () =>
      nameEntries
        .map((entry, index) => ({ entry, index }))
        .sort((a, b) => a.entry.name.length - b.entry.name.length),
    [nameEntries],
  );

  const folderLabelMap = React.useMemo(
    () =>
      new Map(
        folderOptions.map((folder) => [Number(folder.id), folder.nombre]),
      ),
    [folderOptions],
  );

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

  const resolveTypeIdFuzzy = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const fromAvailable = availableTypeOptions.find(
      (option) =>
        option.label.toLowerCase().includes(normalized) ||
        option.id.toLowerCase().includes(normalized),
    );
    return fromAvailable ? fromAvailable.id : null;
  };

  const resolveFolderId = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const byName = folderOptions.find(
      (folder) => folder.nombre.toLowerCase() === normalized,
    );
    if (byName) {
      return byName.id;
    }
    const byIdNumber = Number(value.trim());
    if (!Number.isNaN(byIdNumber)) {
      const byId = folderOptions.find((folder) => folder.id === byIdNumber);
      if (byId) {
        return byId.id;
      }
    }
    return null;
  };

  const resolveFolderIdFuzzy = (value: string) => {
    const normalized = value.trim().toLowerCase();
    const fromAvailable = availableFolderOptions.find(
      (folder) =>
        folder.nombre.toLowerCase().includes(normalized) ||
        String(folder.id).includes(normalized),
    );
    return fromAvailable ? fromAvailable.id : null;
  };

  const createMissingFolderAndSelect = async (rawValue: string) => {
    const folderName = rawValue.trim();
    if (!folderName || noFolders) {
      return null;
    }

    const existingFolderId = resolveFolderId(folderName);
    if (existingFolderId) {
      setSelectedFolders((prev) =>
        prev.includes(existingFolderId) ? prev : [...prev, existingFolderId],
      );
      setFolderId(existingFolderId);
      return existingFolderId;
    }

    try {
      const createdFolder = await WorldBibleUseCase.createCategory(
        folderName,
        projectId,
        "FOLDER",
      );

      setFolderOptions((prev) =>
        prev.some((folder) => folder.id === createdFolder.id)
          ? prev
          : [...prev, createdFolder],
      );
      setSelectedFolders((prev) =>
        prev.includes(createdFolder.id) ? prev : [...prev, createdFolder.id],
      );
      setFolderId(createdFolder.id);

      return createdFolder.id;
    } catch {
      return null;
    }
  };

  const handleClassKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const parts = classInput
        .split(";")
        .map((p) => p.trim())
        .filter((p) => !!p);
      const newTypeIds: string[] = [];
      parts.forEach((part) => {
        const resolved = resolveTypeId(part) ?? resolveTypeIdFuzzy(part);
        const isDuplicate = resolved
          ? selectedTypes.includes(resolved) || newTypeIds.includes(resolved)
          : false;
        resolved && !isDuplicate ? newTypeIds.push(resolved) : undefined;
      });

      if (newTypeIds.length > 0) {
        setSelectedTypes((prev) => [...prev, ...newTypeIds]);
        setType(newTypeIds[newTypeIds.length - 1]);
      } else if (parts.length === 1 && filteredTypeOptions.length > 0) {
        const firstAvailableMatch = filteredTypeOptions.find(
          (option) => !selectedTypes.includes(option.id),
        );
        if (firstAvailableMatch) {
          setSelectedTypes((prev) => [...prev, firstAvailableMatch.id]);
          setType(firstAvailableMatch.id);
        }
      }
      setClassInput("");
      setIsClassDropdownOpen(false);
    } else if (
      e.key === "Backspace" &&
      !classInput &&
      selectedTypes.length > 0
    ) {
      setSelectedTypes((prev) => prev.slice(0, -1));
    }
  };

  const handleFolderKeyDown = async (
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const parts = folderInput
        .split(";")
        .map((p) => p.trim())
        .filter((p) => !!p);
      const newFolderIds: number[] = [];
      for (const part of parts) {
        const resolved = resolveFolderId(part) ?? resolveFolderIdFuzzy(part);
        const isDuplicate = resolved
          ? selectedFolders.includes(resolved) ||
            newFolderIds.includes(resolved)
          : false;
        if (resolved && !isDuplicate) {
          newFolderIds.push(resolved);
          continue;
        }

        if (!resolved) {
          const createdFolderId = await createMissingFolderAndSelect(part);
          if (
            createdFolderId &&
            !selectedFolders.includes(createdFolderId) &&
            !newFolderIds.includes(createdFolderId)
          ) {
            newFolderIds.push(createdFolderId);
          }
        }
      }

      if (newFolderIds.length > 0) {
        setSelectedFolders((prev) =>
          Array.from(new Set([...prev, ...newFolderIds])),
        );
        setFolderId(newFolderIds[newFolderIds.length - 1]);
      } else if (parts.length === 1 && filteredFolderOptions.length > 0) {
        const firstMatch = filteredFolderOptions[0].id;
        if (!selectedFolders.includes(firstMatch)) {
          setSelectedFolders((prev) => [...prev, firstMatch]);
          setFolderId(firstMatch);
        }
      }
      setFolderInput("");
      setIsFolderDropdownOpen(false);
    } else if (
      e.key === "Backspace" &&
      !folderInput &&
      selectedFolders.length > 0
    ) {
      setSelectedFolders((prev) => prev.slice(0, -1));
    }
  };

  const removeSelectedType = (typeId: string) => {
    setSelectedTypes((prev) =>
      prev.filter((selectedTypeId) => selectedTypeId !== typeId),
    );
  };

  const removeSelectedFolder = (folderToRemove: number) => {
    setSelectedFolders((prev) =>
      prev.filter((selectedFolderId) => selectedFolderId !== folderToRemove),
    );
  };

  const getTypeLabel = (typeId: string) => {
    const option = TYPE_OPTIONS.find((typeOption) => typeOption.id === typeId);
    if (option) {
      return option.label;
    }
    return typeId;
  };

  const getFolderLabel = (folderValueId: number) => {
    const normalizedId = Number(folderValueId);
    const labelFromMap = folderLabelMap.get(normalizedId);
    if (labelFromMap) {
      return labelFromMap;
    }

    const fallbackFolder = folderOptions.find(
      (folderItem) => String(folderItem.id) === String(folderValueId),
    );
    if (fallbackFolder) {
      return fallbackFolder.nombre;
    }

    return String(folderValueId);
  };

  const availableTypeOptions = TYPE_OPTIONS.filter(
    (option) => !selectedTypes.includes(option.id),
  );

  const availableFolderOptions = folderOptions.filter(
    (folder) => !selectedFolders.includes(folder.id),
  );

  const filteredTypeOptions = availableTypeOptions.filter((option) => {
    const normalized = classInput.trim().toLowerCase();
    if (!normalized) {
      return true;
    }
    return (
      option.label.toLowerCase().includes(normalized) ||
      option.id.toLowerCase().includes(normalized)
    );
  });

  const filteredFolderOptions = availableFolderOptions.filter((folder) => {
    const normalized = folderInput.trim().toLowerCase();
    if (!normalized) {
      return true;
    }
    return (
      folder.nombre.toLowerCase().includes(normalized) ||
      String(folder.id).includes(normalized)
    );
  });

  const shouldShowCreateFolderOption =
    !noFolders &&
    folderInput.trim().length > 0 &&
    filteredFolderOptions.length === 0;

  const sortedSelectedTypes = React.useMemo(
    () =>
      [...selectedTypes].sort(
        (left, right) => getTypeLabel(left).length - getTypeLabel(right).length,
      ),
    [selectedTypes],
  );

  const sortedSelectedFolders = React.useMemo(
    () =>
      [...selectedFolders].sort(
        (left, right) =>
          getFolderLabel(left).length - getFolderLabel(right).length,
      ),
    [selectedFolders, folderOptions],
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
          <div className="relative z-20 p-6 space-y-4 border-r border-white/5 bg-background">
            <div className="flex flex-wrap items-center justify-between gap-3 border border-white/5 bg-background/40 px-3 py-2">
              <div className="flex items-center gap-3 min-w-0">
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
                <div className="text-[10px] font-bold text-foreground/40 tracking-tight truncate">
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
              <div className="flex items-center gap-2">
                <button
                  onClick={onClose}
                  className="px-4 py-2 bg-background hover:bg-background text-[10px] font-black uppercase tracking-widest text-foreground/60 transition-all border border-white/5"
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
                  className={`px-5 py-2 bg-primary text-white text-[10px] font-black uppercase tracking-widest shadow-xl hover:scale-[1.02] active:scale-[0.98] transition-all ${loading || noFolders ? "opacity-50 cursor-not-allowed grayscale" : ""}`}
                >
                  {loading ? "Sincronizando..." : "Ejecutar Carga Masiva"}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 h-[420px] max-h-[calc(90vh-21rem)] overflow-hidden">
              <section className="relative z-10 p-3 bg-background border border-white/5 space-y-2 h-full flex flex-col overflow-visible min-h-0">
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
                <div className="flex-1 overflow-y-auto custom-scrollbar mass-scrollbar flex flex-wrap gap-2 content-start pt-1 pr-1 min-h-0">
                  {sortedNameEntries.map(({ entry, index }) => (
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

              <section className="p-3 bg-background border border-white/5 space-y-2 h-full flex flex-col overflow-hidden min-h-0">
                <div className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                  Clases
                </div>
                <div ref={classDropdownRef} className="relative z-20">
                  <input
                    disabled={noFolders}
                    value={classInput}
                    onChange={(e) => {
                      setClassInput(e.target.value);
                      if (!noFolders) {
                        setIsClassDropdownOpen(true);
                      }
                    }}
                    onFocus={() => {
                      if (!noFolders) {
                        setIsClassDropdownOpen(true);
                      }
                    }}
                    onClick={() => {
                      if (!noFolders) {
                        setIsClassDropdownOpen(true);
                      }
                    }}
                    onKeyDown={handleClassKeyDown}
                    placeholder={
                      noFolders ? "Crea carpeta primero..." : "Clase + Enter"
                    }
                    className="w-full bg-transparent border border-white/10 px-3 py-2 outline-none text-[11px] font-bold italic text-foreground placeholder:text-foreground/20 disabled:cursor-not-allowed"
                  />
                  {isClassDropdownOpen && !noFolders && (
                    <div className="absolute z-50 mt-1 w-full max-h-36 overflow-y-auto custom-scrollbar mass-scrollbar border border-white/5 bg-background shadow-xl">
                      {filteredTypeOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => {
                            setSelectedTypes((prev) => [...prev, option.id]);
                            setType(option.id);
                            setClassInput("");
                            setIsClassDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors text-foreground/80 hover:bg-primary/10 hover:text-primary"
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar mass-scrollbar flex flex-wrap gap-2 content-start pt-1 pr-1 min-h-0">
                  {sortedSelectedTypes.map((selectedTypeId) => (
                    <div
                      key={selectedTypeId}
                      className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2 py-1 animate-in zoom-in-95"
                    >
                      <span className="text-[10px] font-black uppercase tracking-tighter text-primary-light">
                        {getTypeLabel(selectedTypeId)}
                      </span>
                      <button
                        onClick={() => removeSelectedType(selectedTypeId)}
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

              <section className="relative z-20 p-3 bg-background border border-white/5 space-y-2 h-full flex flex-col overflow-visible min-h-0">
                <div className="text-[9px] font-black text-foreground/40 uppercase tracking-widest">
                  Carpetas
                </div>
                <div ref={folderDropdownRef} className="relative z-30">
                  <input
                    disabled={noFolders}
                    value={folderInput}
                    onChange={(e) => {
                      setFolderInput(e.target.value);
                      if (!noFolders) {
                        setIsFolderDropdownOpen(true);
                      }
                    }}
                    onFocus={() => {
                      if (!noFolders) {
                        setIsFolderDropdownOpen(true);
                      }
                    }}
                    onClick={() => {
                      if (!noFolders) {
                        setIsFolderDropdownOpen(true);
                      }
                    }}
                    onKeyDown={handleFolderKeyDown}
                    placeholder={
                      noFolders ? "Sin carpetas" : "Carpeta o ID + Enter"
                    }
                    className="w-full bg-transparent border border-white/10 px-3 py-2 outline-none text-[11px] font-bold italic text-foreground placeholder:text-foreground/20 disabled:cursor-not-allowed"
                  />
                  {isFolderDropdownOpen && !noFolders && (
                    <div className="absolute z-50 mt-1 w-full max-h-36 overflow-y-auto custom-scrollbar mass-scrollbar border border-white/5 bg-background shadow-xl">
                      {filteredFolderOptions.map((folder) => {
                        return (
                          <button
                            key={folder.id}
                            type="button"
                            onClick={() => {
                              setSelectedFolders((prev) => [
                                ...prev,
                                folder.id,
                              ]);
                              setFolderId(folder.id);
                              setFolderInput("");
                              setIsFolderDropdownOpen(false);
                            }}
                            className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors text-foreground/80 hover:bg-primary/10 hover:text-primary"
                          >
                            {folder.nombre}
                          </button>
                        );
                      })}
                      {shouldShowCreateFolderOption && (
                        <button
                          type="button"
                          onClick={async () => {
                            await createMissingFolderAndSelect(folderInput);
                            setFolderInput("");
                            setIsFolderDropdownOpen(false);
                          }}
                          className="w-full text-left px-3 py-2 text-[10px] font-bold uppercase tracking-wide transition-colors text-primary hover:bg-primary/10"
                        >
                          + Crear carpeta: {folderInput.trim()}
                        </button>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-y-auto custom-scrollbar mass-scrollbar flex flex-wrap gap-2 content-start pt-1 pr-1 min-h-0">
                  {sortedSelectedFolders.map((selectedFolderId) => (
                    <div
                      key={selectedFolderId}
                      className="flex items-center gap-1.5 bg-primary/10 border border-primary/20 px-2 py-1 animate-in zoom-in-95"
                    >
                      <span className="text-[10px] font-black uppercase tracking-tighter text-primary-light">
                        {getFolderLabel(selectedFolderId)}
                      </span>
                      <button
                        onClick={() => removeSelectedFolder(selectedFolderId)}
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

            <div className="text-[9px] text-foreground/30 font-bold uppercase tracking-widest italic px-1">
              * Cada Enter crea una etiqueta debajo. Puedes quitarla con la X.
            </div>
          </div>

          {/* Columna 2: Atributos Comunes */}
          <div className="relative z-10 p-6 space-y-6 bg-background flex flex-col h-full">
            <header className="flex items-center justify-between shrink-0">
              <div className="text-[10px] font-black text-foreground/30 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="material-symbols-outlined text-xs">
                  assignment
                </span>
                Atributos Comunes
              </div>
              <div className="flex items-center gap-2">
                <select
                  disabled={noFolders}
                  onChange={(e) => handleAddAttribute(Number(e.target.value))}
                  value=""
                  className="bg-primary/10 border border-primary/20 text-primary text-[10px] font-black uppercase px-4 py-2 outline-none hover:bg-primary/20 transition-all cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <option value="" disabled>
                    Inyectar Plantilla...
                  </option>
                  {Array.from(
                    new Map(
                      availableTemplates.map((t) => [
                        `${t.nombre}-${t.categoria || ""}`,
                        t,
                      ]),
                    ).values(),
                  ).map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.nombre} ({t.categoria || "Sin CategorÃƒÂ­a"})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  disabled={noFolders}
                  onClick={() => setIsCreatingTemplate((prev) => !prev)}
                  className="bg-background border border-white/10 text-foreground/80 text-[10px] font-black uppercase px-3 py-2 outline-none hover:border-primary/40 hover:text-primary transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  {isCreatingTemplate ? "Cancelar" : "+ Crear"}
                </button>
              </div>
            </header>

            {isCreatingTemplate && (
              <div className="border border-primary/20 bg-primary/5 p-3 space-y-3">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <input
                    value={templateForm.nombre}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        nombre: e.target.value,
                      }))
                    }
                    placeholder="Nombre del atributo"
                    className="bg-background border border-white/10 p-2 text-[11px] font-bold outline-none focus:border-primary/50"
                  />
                  <select
                    value={templateForm.tipo}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        tipo: e.target.value as Plantilla["tipo"],
                      }))
                    }
                    className="bg-background border border-white/10 p-2 text-[11px] font-bold outline-none focus:border-primary/50"
                  >
                    <option value="text">Texto Corto</option>
                    <option value="long_text">Texto Largo</option>
                    <option value="number">Numero</option>
                    <option value="date">Fecha</option>
                    <option value="boolean">Interruptor</option>
                    <option value="select">Lista</option>
                  </select>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 items-center">
                  <input
                    value={templateForm.valor_defecto}
                    onChange={(e) =>
                      setTemplateForm((prev) => ({
                        ...prev,
                        valor_defecto: e.target.value,
                      }))
                    }
                    placeholder="Valor por defecto (opcional)"
                    className="bg-background border border-white/10 p-2 text-[11px] font-bold outline-none focus:border-primary/50"
                  />
                  <label className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-foreground/60">
                    <input
                      type="checkbox"
                      checked={templateForm.es_obligatorio}
                      onChange={(e) =>
                        setTemplateForm((prev) => ({
                          ...prev,
                          es_obligatorio: e.target.checked,
                        }))
                      }
                      className="size-4 accent-primary"
                    />
                    Obligatorio
                  </label>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={onCreateTemplate}
                      disabled={isSavingTemplate || !templateForm.nombre.trim()}
                      className="bg-primary text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {isSavingTemplate ? "Guardando..." : "Crear e Inyectar"}
                    </button>
                  </div>
                </div>
              </div>
            )}

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
                    Usa el selector superior para aÃƒÂ±adir campos de datos que
                    compartirÃƒÂ¡n todos los entes.
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
      </div>
    </div>
  );
};

export default CreateMassEntitiesModal;


