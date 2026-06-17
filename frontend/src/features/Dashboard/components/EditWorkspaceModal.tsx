import React from "react";
import { createPortal } from "react-dom";
import { Proyecto } from "@domain/database";
import { useEditWorkspaceModal } from "../hooks/useEditWorkspaceModal";

interface EditWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (data: Partial<Proyecto>) => void;
  project: Proyecto;
}

const EditWorkspaceModal: React.FC<EditWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onUpdate,
  project,
}) => {
  const {
    formData,
    imgError,
    setImgError,
    handleFieldChange,
    handleImageUrlChange,
    handleSubmit,
    GENRES,
  } = useEditWorkspaceModal(project, onClose, onUpdate);

  if (!isOpen || !project) return null;

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
            src={formData.image_url}
            onError={() => setImgError(true)}
            className={`absolute inset-0 w-full h-full object-cover opacity-60 transition-opacity duration-500 ${imgError ? "hidden" : ""}`}
            alt="Preview"
          />
          <div className="absolute inset-x-0 bottom-0 p-6 bg-gradient-to-t from-black to-transparent">
            <h4 className="text-foreground font-black text-xl leading-none">
              {formData.nombre || "Untitled"}
            </h4>
            <span className="text-[10px] font-bold text-primary uppercase tracking-widest mt-2 block">
              {formData.tag}
            </span>
          </div>
        </div>

        {/* Right: Form */}
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-black text-foreground mb-6">
            Editar Cuaderno
          </h2>
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                Título del Proyecto
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={(e) => handleFieldChange("nombre", e.target.value)}
                className="w-full monolithic-panel rounded-none px-4 py-3 text-foreground text-sm focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all"
                autoFocus
              />
            </div>

            {/* Genre */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                Género
              </label>
              <div className="grid grid-cols-2 gap-2">
                {GENRES.slice(0, 4).map((g) => (
                  <button
                    key={g}
                    type="button"
                    onClick={() => handleFieldChange("tag", g)}
                    className={`px-3 py-2 rounded-none text-[10px] font-bold border transition-all ${formData.tag === g ? "bg-primary text-primary-foreground border-primary" : "bg-background border-foreground/10 text-foreground/60 hover:border-foreground/40"}`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-widest text-foreground/50">
                Imagen de Portada (URL)
              </label>
              <input
                type="text"
                value={formData.image_url}
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
                <span className="material-symbols-outlined text-sm">save</span>
                Guardar Cambios
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>,
    document.body,
  );
};

export default EditWorkspaceModal;
