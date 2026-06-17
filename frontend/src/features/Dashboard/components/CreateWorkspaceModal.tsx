import React from "react";
import { createPortal } from "react-dom";
import { useCreateWorkspaceModal } from "../hooks/useCreateWorkspaceModal";
import ConfirmationModal from "@components/ui/ConfirmationModal";

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (formData: {
    name: string;
    title: string;
    genre: string;
    imageUrl?: string;
  }) => void;
}

const CreateWorkspaceModal: React.FC<CreateWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const {
    formData,
    imgError,
    setImgError,
    validationAlertOpen,
    setValidationAlertOpen,
    isCustomGenre,
    setIsCustomGenre,
    handleChange,
    handleGenreChange,
    handleCustomGenreChange,
    handleImageUrlChange,
    handleSubmit,
    GENRES,
  } = useCreateWorkspaceModal(onClose, onCreate);

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-background/80 animate-in fade-in duration-200"
        onClick={onClose}
      />

      <div className="relative w-full max-w-2xl monolithic-panel rounded-none shadow-2xl overflow-hidden flex animate-in zoom-in-95 duration-200">
        {/* Left: Image Preview */}
        <div className="w-1/3 bg-black relative hidden sm:block">
          <img
            src={formData.imageUrl}
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-500 ${imgError ? "hidden" : ""}`}
            alt="Preview"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent">
            <h4 className="text-foreground font-black text-xl leading-none">
              {formData.title || "Untitled"}
            </h4>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2 block">
              {formData.genre}
            </span>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-black text-foreground mb-6">
            Nuevo Cuaderno
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                Título del Proyecto
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Las Crónicas de Etheria"
                className="w-full monolithic-panel rounded-none px-4 py-3 text-foreground text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                autoFocus
              />
            </div>

            {/* Genre Section */}
            <div className="space-y-3 p-4 monolithic-panel rounded-none">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold uppercase tracking-widest text-primary">
                  Género
                </label>
                <div
                  className="flex items-center gap-2 cursor-pointer"
                  onClick={() => setIsCustomGenre(!isCustomGenre)}
                >
                  <span className="text-[9px] font-bold uppercase text-foreground/30 tracking-widest">
                    Personalizado
                  </span>
                  <div
                    className={`w-9 h-5 rounded-full relative transition-colors duration-300 ${isCustomGenre ? "bg-primary shadow-[0_0_10px_hsla(var(--primary)/0.4)]" : "bg-foreground/10"}`}
                  >
                    <div
                      className={`absolute top-1 left-1 h-3 w-3 bg-white rounded-full transition-transform duration-300 ${isCustomGenre ? "translate-x-4" : "translate-x-0"}`}
                    />
                  </div>
                </div>
              </div>

              {!isCustomGenre ? (
                <select
                  name="genre"
                  value={formData.genre}
                  onChange={(e) => handleGenreChange(e.target.value)}
                  className="w-full monolithic-panel rounded-none px-4 py-3 text-foreground text-[11px] font-bold tracking-widest focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all appearance-none cursor-pointer"
                  style={{
                    backgroundImage:
                      "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236366f1'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='org/19/9 12l-2 2-2-2m14 0l-2 2-2-2' /%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7' /%3E%3C/svg%3E\")",
                    backgroundPosition: "right 1rem center",
                    backgroundRepeat: "no-repeat",
                    backgroundSize: "1.2em",
                  }}
                >
                  {GENRES.map((g) => (
                    <option
                      key={g}
                      value={g}
                      className="bg-background text-foreground py-2"
                    >
                      {g}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  name="genre"
                  value={formData.genre}
                  onChange={(e) => handleCustomGenreChange(e.target.value)}
                  placeholder="E.G. REALISMO MÁGICO"
                  className="w-full bg-background border border-primary/30 rounded-none px-4 py-3 text-foreground text-[10px] font-bold tracking-widest focus:border-primary outline-none transition-all"
                  autoFocus
                />
              )}
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                Imagen de Portada (URL)
              </label>
              <input
                type="text"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                className="w-full monolithic-panel rounded-none px-4 py-3 text-foreground text-xs focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all truncate"
              />
            </div>

            <div className="pt-4 flex gap-3">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 px-4 py-3 bg-foreground/5 hover:bg-foreground/10 border border-foreground/10 rounded-none text-xs font-bold text-foreground/60 transition-all"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 px-4 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-none text-xs font-bold transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-sm">
                  rocket_launch
                </span>
                Crear Universo
              </button>
            </div>
          </form>
        </div>
      </div>

      <ConfirmationModal
        isOpen={validationAlertOpen}
        onClose={() => setValidationAlertOpen(false)}
        onConfirm={() => setValidationAlertOpen(false)}
        title="Título requerido"
        message="Para crear el universo, escribe primero el nombre del cuaderno."
        confirmText="Entendido"
        cancelText="Cerrar"
        type="warning"
      />
    </div>,
    document.body,
  );
};

export default CreateWorkspaceModal;

