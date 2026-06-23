import React, { useState, useRef, useEffect } from "react";
import { ConfirmationModal } from "@components";
import { Proyecto } from "@domain/database";
import { useWorkspaceSelector } from "./useWorkspaceSelector";
import { WorkspaceUseCase } from "@features/Workspaces";
import { getModuleCache, setModuleCache } from "@utils/moduleCache";
import { useCoverImageValidation } from "../hooks/useCoverImageValidation";

// --- COMPONENTES ATÓMICOS ---

const Icon: React.FC<{
  name: string;
  filled?: boolean;
  className?: string;
}> = ({ name, filled = false, className = "" }) => (
  <span
    className={`material-symbols-outlined normal-case ${filled ? "icon-filled" : ""} ${className}`}
    style={
      filled
        ? { fontVariationSettings: "'FILL' 1, 'wght' 300, 'GRAD' 0, 'opsz' 24" }
        : undefined
    }
  >
    {name}
  </span>
);

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <label className="font-mono text-[10px] text-foreground/50 tracking-[0.2em] uppercase mb-2 block">
    {children}
  </label>
);

const CarvedInput: React.FC<{
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  type?: string;
  icon?: string;
}> = ({ value, onChange, placeholder, type = "text", icon }) => (
  <div className="relative group w-full">
    {icon && (
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-foreground/30 group-focus-within:text-primary transition-colors">
        <Icon name={icon} />
      </div>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`w-full bg-background border border-foreground/10 shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] p-3 
                 font-sans text-foreground/90 placeholder:text-foreground/20 placeholder:font-mono placeholder:text-xs
                 focus:outline-none focus:border-primary/50 transition-colors rounded-none
                 ${icon ? "pl-10" : ""}`}
    />
  </div>
);

const PrimaryButton: React.FC<{
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  icon?: string;
  className?: string;
  disabled?: boolean;
}> = ({ children, onClick, icon, className = "", disabled = false }) => (
  <button
    disabled={disabled}
    onClick={onClick}
    className={`flex items-center justify-center gap-2 bg-primary/10 border border-primary/30 
               text-primary hover:bg-primary hover:text-background hover:border-primary
               px-6 py-3 font-mono text-[10px] tracking-widest uppercase transition-all duration-300 rounded-none disabled:opacity-30 disabled:pointer-events-none ${className}`}
  >
    {icon && <Icon name={icon} />}
    {children}
  </button>
);

const GhostButton: React.FC<{
  children: React.ReactNode;
  onClick: (e: React.MouseEvent) => void;
  icon?: string;
  className?: string;
}> = ({ children, onClick, icon, className = "" }) => (
  <button
    onClick={onClick}
    className={`flex items-center justify-center gap-2 bg-transparent border border-foreground/10
               text-foreground/60 hover:bg-foreground/5 hover:text-foreground hover:border-foreground/30
               px-6 py-3 font-mono text-[10px] tracking-widest uppercase transition-all duration-300 rounded-none ${className}`}
  >
    {icon && <Icon name={icon} />}
    {children}
  </button>
);

const Badge: React.FC<{ children: React.ReactNode; active?: boolean }> = ({
  children,
  active = false,
}) => (
  <span
    className={`font-mono text-[9px] tracking-[0.2em] uppercase px-2 py-1 border rounded-none transition-colors
              ${active ? "border-primary/50 bg-primary/10 text-primary" : "border-foreground/10 bg-foreground/5 text-foreground/50"}`}
  >
    {children}
  </span>
);

// --- SELECTOR DUAL DE IMAGENES (LOCAL / URL) ---

interface ImageUploaderProps {
  currentUrl: string;
  onImageUpdate: (url: string) => void;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  currentUrl,
  onImageUpdate,
}) => {
  const galleryKey = "codex_session_gallery_v2";
  const [mode, setMode] = useState<"url" | "local">("url");
  const [localGallery, setLocalGallery] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadGallery = async () => {
      const cachedGallery = getModuleCache<string[]>(galleryKey);
      if (cachedGallery) {
        setLocalGallery(cachedGallery);
      } else {
        const savedGallery = await WorkspaceUseCase.getSetting(galleryKey);
        if (savedGallery) {
          const parsedGallery = JSON.parse(savedGallery) as string[];
          setLocalGallery(parsedGallery);
          setModuleCache(galleryKey, parsedGallery);
        }
      }
    };
    loadGallery();
  }, []);

  useEffect(() => {
    setModuleCache(galleryKey, localGallery);

    const flushGallery = () => {
      WorkspaceUseCase.saveSetting(
        galleryKey,
        JSON.stringify(localGallery),
      ).catch(() => {
        // [LOG REMOVED]
      });
    };

    window.addEventListener("beforeunload", flushGallery);
    return () => {
      window.removeEventListener("beforeunload", flushGallery);
      flushGallery();
    };
  }, [localGallery]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const newGallery = [
          base64String,
          ...localGallery.filter((img) => img !== base64String),
        ].slice(0, 10);
        setLocalGallery(newGallery);
        setModuleCache(galleryKey, newGallery);
        onImageUpdate(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-4">
      {/* Tabs de modo (Estilo Técnico) */}
      <div className="flex gap-px bg-foreground/10 border border-foreground/10 p-px rounded-none">
        <button
          type="button"
          onClick={() => setMode("url")}
          className={`flex-1 py-2 font-mono text-[10px] tracking-widest uppercase transition-colors flex items-center justify-center gap-1.5 ${mode === "url" ? "bg-background text-foreground" : "text-foreground/40 hover:bg-foreground/5 hover:text-foreground/80"}`}
        >
          <Icon name="link" className="text-sm align-middle" /> Enlace URL
        </button>
        <button
          type="button"
          onClick={() => setMode("local")}
          className={`flex-1 py-2 font-mono text-[10px] tracking-widest uppercase transition-colors flex items-center justify-center gap-1.5 ${mode === "local" ? "bg-background text-foreground" : "text-foreground/40 hover:bg-foreground/5 hover:text-foreground/80"}`}
        >
          <Icon name="folder" className="text-sm align-middle" /> Archivo Local
        </button>
      </div>

      {/* Contenido según el modo */}
      {mode === "url" ? (
        <div className="animate-in fade-in duration-200">
          <CarvedInput
            icon="language"
            value={currentUrl.startsWith("data:") ? "" : currentUrl}
            onChange={(e) => onImageUpdate(e.target.value.trimStart())}
            placeholder="Ej: https://images.unsplash.com/..."
          />
          <p className="font-mono text-[9px] text-foreground/30 mt-2 tracking-widest uppercase">
            Pegar enlace directo de la imagen de portada.
          </p>
        </div>
      ) : (
        <div className="animate-in fade-in duration-200 space-y-4">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-full h-24 border border-dashed border-foreground/20 bg-background shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] rounded-none
                       flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all group"
          >
            <Icon
              name="upload_file"
              className="text-foreground/30 group-hover:text-primary mb-2 transition-colors"
            />
            <span className="font-mono text-[10px] text-foreground/50 group-hover:text-primary tracking-widest uppercase transition-colors">
              Haz clic para buscar en el sistema
            </span>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept="image/*"
            className="hidden"
          />

          {/* Galería de Sesión Local */}
          {localGallery.length > 0 && (
            <div className="mt-4 pt-4 border-t border-foreground/10">
              <p className="font-mono text-[9px] text-foreground/50 tracking-widest uppercase mb-3 flex items-center justify-between">
                <span>Memoria de Sesión Local</span>
                <span className="text-primary">
                  {localGallery.length} Artefactos
                </span>
              </p>
              <div className="grid grid-cols-5 gap-2">
                {localGallery.map((imgUrl, idx) => (
                  <div
                    key={idx}
                    onClick={() => onImageUpdate(imgUrl)}
                    className={`aspect-square relative cursor-pointer border rounded-none overflow-hidden transition-all
                              ${currentUrl === imgUrl ? "border-primary shadow-[0_0_10px_rgba(99,102,241,0.3)]" : "border-foreground/20 hover:border-foreground/50 opacity-60 hover:opacity-100"}`}
                  >
                    <img
                      src={imgUrl}
                      className="w-full h-full object-cover"
                      alt={`Upload ${idx}`}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

// --- CONSOLA DE CONFIGURACION MONOLITICA ---

interface EditorMonolithicPanelProps {
  projectToEdit?: Proyecto | null;
  onSave: (data: {
    nombre: string;
    descripcion: string;
    tag: string;
    coverUrl: string;
  }) => void | Promise<void>;
  onCancel: () => void;
  isCreating: boolean;
}

const EditorMonolithicPanel: React.FC<EditorMonolithicPanelProps> = ({
  projectToEdit,
  onSave,
  onCancel,
  isCreating,
}) => {
  const [title, setTitle] = useState(projectToEdit?.nombre || "");
  const [description, setDescription] = useState(
    projectToEdit?.descripcion || "",
  );
  const [tag, setTag] = useState(projectToEdit?.tag || "Fantasía");
  const [coverUrl, setCoverUrl] = useState(projectToEdit?.image_url || "");
  const {
    normalizedCoverUrl,
    coverProbe,
    setPreviewError,
    isCoverUrlInvalid,
    isSaveBlocked,
  } = useCoverImageValidation(coverUrl);

  const handleSave = () => {
    if (!title.trim()) return;
    onSave({
      nombre: title,
      descripcion: description,
      tag: tag,
      coverUrl: normalizedCoverUrl,
    });
  };

  const displayId = projectToEdit
    ? `CN-${projectToEdit.id}`
    : `CN-${Math.floor(Math.random() * 9000) + 1000}`;

  return (
    <div className="fixed inset-0 bg-background/95 z-[500] flex items-center justify-center p-4 sm:p-8 animate-in fade-in duration-200">
      {/* THE MONOLITHIC BOX */}
      <div className="w-full max-w-6xl h-[75vh] bg-background border border-foreground/10 shadow-2xl flex flex-col md:flex-row relative overflow-hidden">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-foreground/40 hover:text-foreground z-20 p-2 bg-background border border-foreground/10 rounded-none transition-colors"
          title="Cerrar Panel"
        >
          <Icon name="close" />
        </button>

        {/* --- COLUMNA IZQUIERDA: VISOR DE ARTE PRISTINO --- */}
        <div className="hidden md:flex w-1/2 border-r border-foreground/10 flex-col bg-foreground/5 relative">
          <div className="flex-1 relative overflow-hidden shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)]">
            {normalizedCoverUrl && !isCoverUrlInvalid ? (
              <img
                src={normalizedCoverUrl}
                alt="Portada del proyecto"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={() => setPreviewError(true)}
                onLoad={() => setPreviewError(false)}
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-foreground/20 bg-background">
                <Icon
                  name="broken_image"
                  className="text-6xl mb-4 opacity-50"
                />
                <span className="font-mono text-xs tracking-[0.2em] uppercase">
                  Ausencia de Artefacto Visual
                </span>
              </div>
            )}

            {/* Overlay Técnico Sutil */}
            <div className="absolute top-4 left-4 flex items-center gap-2">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase px-2 py-1 border border-foreground bg-foreground text-background rounded-none shadow-md">
                {displayId}
              </span>
              <span className="font-mono text-[0.6rem] tracking-[0.2em] uppercase px-[0.5rem] py-[0.25rem] border border-primary/30 bg-primary/20 text-primary rounded-none shadow-md truncate max-w-[150px]">
                {tag || "SIN CLASIFICAR"}
              </span>
            </div>
          </div>
        </div>

        {/* --- COLUMNA DERECHA: CONSOLA DE CONFIGURACION --- */}
        <div className="w-full md:w-1/2 flex flex-col h-full overflow-y-auto bg-background">
          <div className="p-8 border-b border-foreground/10 bg-background/95 sticky top-0 z-10">
            <h1 className="font-sans text-2xl font-light tracking-wide text-foreground flex items-center gap-3 min-w-0">
              <Icon name="edit_note" className="text-primary flex-shrink-0" />
              <span className="truncate">{title || "Nuevo Universo"}</span>
            </h1>
          </div>

          <div className="p-8 space-y-10 flex-1">
            <div>
              <Label>Título del Proyecto</Label>
              <CarvedInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ej: Crónicas del Abismo"
                icon="title"
              />
            </div>

            <div>
              <Label>Descripción del Universo</Label>
              <CarvedInput
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Ej: Una tierra de ingeniería cósmica monolítica..."
                icon="description"
              />
            </div>

            <div>
              <Label>Clasificación (Género o Tag)</Label>
              <CarvedInput
                value={tag}
                onChange={(e) => setTag(e.target.value)}
                placeholder="Ej: Fantasía, Cyberpunk, Sci-Fi..."
                icon="category"
              />
            </div>

            <div>
              <Label>Artefacto Visual (Portada)</Label>
              <ImageUploader
                currentUrl={coverUrl}
                onImageUpdate={setCoverUrl}
              />
              <div className="mt-3 font-mono text-[9px] tracking-widest uppercase">
                {coverProbe.status === "checking" && (
                  <span className="text-primary/80">{coverProbe.message}</span>
                )}
                {coverProbe.status === "valid" && (
                  <span className="text-emerald-400">{coverProbe.message}</span>
                )}
                {coverProbe.status === "invalid" && (
                  <span className="text-red-400">{coverProbe.message}</span>
                )}
                {coverProbe.status === "empty" && (
                  <span className="text-foreground/40">
                    {coverProbe.message}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 border-t border-foreground/10 bg-foreground/5 flex justify-end gap-4 mt-auto">
            <GhostButton onClick={onCancel} icon="block">
              Descartar
            </GhostButton>
            <PrimaryButton
              onClick={handleSave}
              icon="save"
              disabled={!title.trim() || isSaveBlocked}
            >
              {isCreating ? "Inicializar Universo" : "Guardar Configuración"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- TARJETA DE CUADERNO PRINCIPAL (ARTEFACT CARD) ---

interface NotebookCardProps {
  data: Proyecto;
  onSelect: (name: string) => void;
  onEdit: (project: Proyecto) => void;
  onDelete: (id: number) => void;
}

const NotebookCard: React.FC<{
  data: Proyecto;
  onSelect: (name: string) => void;
  onEdit: (project: Proyecto) => void;
  onDelete: (id: number) => void;
}> = ({ data, onSelect, onEdit, onDelete }) => {
  const [showDesc, setShowDesc] = useState(false);
  const displayImg =
    data.image_url ||
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=800";

  return (
    <div
      onClick={() => onSelect(data.nombre)}
      className="workspace-card-shell group relative bg-background border border-foreground/10 overflow-hidden cursor-pointer hover:border-foreground/30 shadow-lg transition-all animate-in fade-in duration-500 flex flex-col"
    >
      {/* Imagen de Fondo (Protagonista) */}
      <img
        src={displayImg}
        alt={data.nombre}
        className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-100 grayscale-[0.8] group-hover:grayscale-0 transition-all duration-700"
        referrerPolicy="no-referrer"
      />

      <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent opacity-60"></div>

      {/* ID Técnico y Género/Tag */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-20">
        <div className="flex items-center gap-1.5 overflow-hidden opacity-40 group-hover:opacity-100 transition-opacity duration-300">
          <span className="font-mono text-[8px] tracking-[0.2em] uppercase px-1.5 py-0.5 border border-foreground/15 bg-background/90 text-foreground/80 rounded-none shadow-sm">
            CN-{data.id}
          </span>
          <span className="font-mono text-[0.56rem] tracking-[0.2em] uppercase px-1.5 py-0.5 border border-primary/30 bg-background/90 text-primary rounded-none truncate shadow-sm">
            {data.tag || "GENERAL"}
          </span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            setShowDesc(!showDesc);
          }}
          className="w-5 h-5 rounded-full bg-background/80 hover:bg-background border border-foreground/20 hover:border-primary text-foreground/75 hover:text-primary flex items-center justify-center font-mono text-[10px] font-bold transition-all shadow-md z-30"
          title="Ver Descripción del Universo"
        >
          ?
        </button>
      </div>

      {/* Bocadillo de Descripción del Universo */}
      {showDesc && (
        <div
          onClick={(e) => e.stopPropagation()}
          className="absolute top-10 right-3 left-3 bg-background/95 border border-foreground/15 p-3.5 shadow-2xl z-30 animate-in fade-in zoom-in-95 duration-200 flex flex-col gap-2 rounded-none"
          style={{ height: "calc(100% - 3.5rem)" }}
        >
          <div className="flex items-center justify-between border-b border-foreground/10 pb-1.5 flex-shrink-0">
            <span className="font-mono text-[9px] tracking-widest text-primary uppercase font-bold">
              Descripción del Universo
            </span>
            <button
              onClick={() => setShowDesc(false)}
              className="text-foreground/40 hover:text-foreground flex items-center justify-center transition-colors"
              title="Cerrar"
            >
              <Icon name="close" className="text-sm" />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar pr-1">
            <p className="font-serif text-[11px] leading-relaxed text-foreground/80 whitespace-pre-wrap">
              {data.descripcion || "Sin descripción registrada para este universo."}
            </p>
          </div>
        </div>
      )}

      {/* Bloque de Información y Acciones */}
      <div className="absolute bottom-0 left-0 w-full p-2.5 flex items-stretch justify-between gap-1.5 z-20">
        {/* Caja de Título */}
        <div className="bg-background/95 border border-foreground/10 px-3 py-1.5 relative overflow-hidden flex-1 min-w-0 flex items-center">
          <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-primary"></div>
          <h3 className="font-serif text-xs text-foreground leading-tight truncate pl-1">
            {data.nombre}
          </h3>
        </div>

        {/* Acciones en Hover */}
        <div className="hidden group-hover:flex items-stretch gap-1.5 flex-shrink-0">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(data);
            }}
            className="flex items-center justify-center bg-background/95 border border-foreground/10 text-foreground/60 hover:text-foreground w-8 h-8 rounded-none transition-all"
            title="Editar Cuaderno"
          >
            <Icon name="settings" className="text-sm" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(data.id);
            }}
            className="flex items-center justify-center bg-background/95 border border-foreground/10 text-foreground/40 hover:text-red-400 hover:border-red-500/30 w-8 h-8 rounded-none transition-all"
            title="Eliminar Cuaderno"
          >
            <Icon name="delete" className="text-sm" />
          </button>
        </div>
      </div>
    </div>
  );
};

// --- PAGINA PRINCIPAL ---

const WorkspaceSelector: React.FC = () => {
  const {
    navigate,
    workspaces,
    loading,
    error,
    searchTerm,
    setSearchTerm,
    isCreating,
    setIsCreating,
    projectToEdit,
    setProjectToEdit,
    projectToDelete,
    setProjectToDelete,
    importConfirmOpen,
    setImportConfirmOpen,
    statusModal,
    setStatusModal,
    handleSelect,
    handleSaveWorkspace,
    handleDeleteConfirm,
    handleExport,
    executeImport,
    handleStatusAcknowledge,
    filteredWorkspaces,
  } = useWorkspaceSelector();

  return (
    <div className="min-h-screen bg-background relative flex flex-col selection:bg-primary/30 selection:text-foreground overflow-x-hidden">
      {/* Canvas Principal */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          {/* Toolbar superior (Unificado sin header superior) */}
          <div className="flex items-end gap-4 mb-8 border-b border-foreground/10 pb-4">
            <div className="flex-shrink-0">
              <h2 className="font-serif text-2xl text-foreground">
                Mis proyectos
              </h2>
              <p className="font-mono text-[10px] text-foreground/40 uppercase tracking-widest mt-1">
                {workspaces.length} proyecto/s creado/s
              </p>
            </div>
            <div className="flex-1">
              <CarvedInput
                placeholder="Buscar por título..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                icon="search"
              />
            </div>
            {/* Bloque cuádruple de acciones (Mini tarjetas en el Toolbar) */}
            <div className="w-[24rem] h-[3.2rem] grid grid-cols-4 gap-1.5 flex-shrink-0">
              {/* Botón 1: Nuevo Cuaderno */}
              <button
                onClick={() => setIsCreating(true)}
                className="flex flex-col items-center justify-center gap-0.5 bg-foreground/5 border border-foreground/10 hover:border-primary hover:text-primary transition-all p-1 rounded-none group/btn text-foreground/75"
                title="Inicializar Nuevo Universo"
              >
                <Icon name="add" className="text-base group-hover/btn:scale-110 transition-transform" />
                <span className="font-mono text-[8px] tracking-wider uppercase">Nuevo</span>
              </button>

              {/* Botón 2: Respaldar */}
              <button
                onClick={handleExport}
                className="flex flex-col items-center justify-center gap-0.5 bg-foreground/5 border border-foreground/10 hover:border-primary hover:text-primary transition-all p-1 rounded-none group/btn text-foreground/75"
                title="Respaldar datos"
              >
                <Icon name="cloud_upload" className="text-base group-hover/btn:scale-110 transition-transform" />
                <span className="font-mono text-[8px] tracking-wider uppercase">Respaldar</span>
              </button>

              {/* Botón 3: Importar */}
              <button
                onClick={() => setImportConfirmOpen(true)}
                className="flex flex-col items-center justify-center gap-0.5 bg-foreground/5 border border-foreground/10 hover:border-primary hover:text-primary transition-all p-1 rounded-none group/btn text-foreground/75"
                title="Importar respaldo"
              >
                <Icon name="cloud_download" className="text-base group-hover/btn:scale-110 transition-transform" />
                <span className="font-mono text-[8px] tracking-wider uppercase">Importar</span>
              </button>

              {/* Botón 4: Ajustes */}
              <button
                onClick={() => navigate("/settings")}
                className="flex flex-col items-center justify-center gap-0.5 bg-foreground/5 border border-foreground/10 hover:border-primary hover:text-primary transition-all p-1 rounded-none group/btn text-foreground/75"
                title="Ajustes de sistema"
              >
                <Icon name="settings" className="text-base group-hover/btn:scale-110 transition-transform" />
                <span className="font-mono text-[8px] tracking-wider uppercase">Ajustes</span>
              </button>
            </div>
            {/* CÓDIGO ANTERIOR DE BOTONES SUPERIORES PRESERVADO
            <div className="flex items-center gap-2">
              <GhostButton
                onClick={handleExport}
                icon="cloud_upload"
              >
                Respaldar
              </GhostButton>
              <GhostButton
                onClick={() => setImportConfirmOpen(true)}
                icon="cloud_download"
              >
                Importar
              </GhostButton>
              <GhostButton
                onClick={() => navigate("/settings")}
                icon="settings"
              >
                Ajustes
              </GhostButton>
              <PrimaryButton onClick={() => setIsCreating(true)} icon="add">
                Nuevo Cuaderno
              </PrimaryButton>
            </div>
            */}
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center gap-6 py-20 opacity-20">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-none animate-spin"></div>
              <p className="font-mono text-[10px] uppercase tracking-widest">
                Accediendo al Sector Local...
              </p>
            </div>
          ) : (
            /* GRID DE CUADERNOS */
            <div className="workspace-scroll">
              <div className="workspace-cards-wrap">
                {/* TARJETA ESPECIAL DE AÑADIR NUEVO COMENTADA
                <div
                  onClick={() => setIsCreating(true)}
                  className="workspace-card-shell border border-dashed border-foreground/20 bg-foreground/5 hover:bg-foreground/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] cursor-pointer flex flex-col items-center justify-center group rounded-none p-4"
                >
                  <div className="w-8 h-8 rounded-none bg-background border border-foreground/10 flex items-center justify-center mb-2 group-hover:border-primary group-hover:text-primary transition-colors">
                    <Icon name="add" className="text-sm" />
                  </div>
                  <span className="font-mono text-[9px] tracking-[0.2em] uppercase text-foreground/60 group-hover:text-foreground">
                    Inicializar
                  </span>
                  <span className="font-serif text-sm text-foreground/40 mt-1">
                    Nuevo Universo
                  </span>
                </div>
                */}

                {/* PANEL DE CONTROL DE SEGUNDA PRUEBA PRESERVADO (COMENTADO)
                <div className="workspace-card-shell grid grid-cols-2 grid-rows-2 gap-2 p-2 bg-foreground/5 border border-foreground/10 relative">
                  <button
                    onClick={() => setIsCreating(true)}
                    className="flex flex-col items-center justify-center gap-1 bg-background border border-foreground/10 hover:border-primary hover:text-primary transition-all p-2 rounded-none group/btn text-foreground/75"
                  >
                    <Icon name="add" className="text-lg group-hover/btn:scale-110 transition-transform" />
                    <span className="font-mono text-[9px] tracking-wider uppercase">Nuevo</span>
                  </button>
                  <button
                    onClick={handleExport}
                    className="flex flex-col items-center justify-center gap-1 bg-background border border-foreground/10 hover:border-primary hover:text-primary transition-all p-2 rounded-none group/btn text-foreground/75"
                  >
                    <Icon name="cloud_upload" className="text-lg group-hover/btn:scale-110 transition-transform" />
                    <span className="font-mono text-[9px] tracking-wider uppercase">Respaldar</span>
                  </button>
                  <button
                    onClick={() => setImportConfirmOpen(true)}
                    className="flex flex-col items-center justify-center gap-1 bg-background border border-foreground/10 hover:border-primary hover:text-primary transition-all p-2 rounded-none group/btn text-foreground/75"
                  >
                    <Icon name="cloud_download" className="text-lg group-hover/btn:scale-110 transition-transform" />
                    <span className="font-mono text-[9px] tracking-wider uppercase">Importar</span>
                  </button>
                  <button
                    onClick={() => navigate("/settings")}
                    className="flex flex-col items-center justify-center gap-1 bg-background border border-foreground/10 hover:border-primary hover:text-primary transition-all p-2 rounded-none group/btn text-foreground/75"
                  >
                    <Icon name="settings" className="text-lg group-hover/btn:scale-110 transition-transform" />
                    <span className="font-mono text-[9px] tracking-wider uppercase">Ajustes</span>
                  </button>
                </div>
                */}

                {/* Tarjetas de Cuadernos */}
                {filteredWorkspaces.map((ws) => (
                  <NotebookCard
                    key={ws.id}
                    data={ws}
                    onSelect={handleSelect}
                    onEdit={(proj) => setProjectToEdit(proj)}
                    onDelete={(id) => setProjectToDelete(id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Editor Monolítico (Se muestra si editamos o creamos) */}
      {(projectToEdit || isCreating) && (
        <EditorMonolithicPanel
          projectToEdit={projectToEdit}
          onSave={handleSaveWorkspace}
          onCancel={() => {
            setProjectToEdit(null);
            setIsCreating(false);
          }}
          isCreating={isCreating}
        />
      )}

      {/* Diálogos de Confirmación */}
      <ConfirmationModal
        isOpen={projectToDelete !== null}
        onClose={() => setProjectToDelete(null)}
        onConfirm={handleDeleteConfirm}
        title="¿Eliminar Proyecto?"
        message="Estás a punto de borrar este cuaderno y todo su contenido permanentemente. Esta acción no se puede deshacer."
        confirmText="Eliminar Universo"
        cancelText="Cancelar"
        type="danger"
      />

      <ConfirmationModal
        isOpen={importConfirmOpen}
        onClose={() => setImportConfirmOpen(false)}
        onConfirm={() => {
          setImportConfirmOpen(false);
          executeImport();
        }}
        title="¿Importar respaldo del servidor?"
        message="Esto sobrescribirá los datos actuales del universo con la versión respaldada."
        confirmText="Sí, importar"
        cancelText="Cancelar"
        type="warning"
      />

      <ConfirmationModal
        isOpen={statusModal !== null}
        onClose={() => setStatusModal(null)}
        onConfirm={handleStatusAcknowledge}
        title={statusModal?.title || "Operación completada"}
        message={statusModal?.message || ""}
        confirmText="Aceptar"
        cancelText="Cerrar"
        type="warning"
      />

      {error && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 px-6 py-3 bg-red-500/20 border border-red-500/30 text-red-200 rounded-none text-xs font-bold shadow-2xl animate-bounce z-[600]">
          {error}
        </div>
      )}
    </div>
  );
};

export default WorkspaceSelector;
