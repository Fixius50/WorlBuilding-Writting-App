import React from "react";

/**
 * 📝 WritingCommentsPanel
 * Panel inferior de comentarios del documento (estilo VSCode Git).
 * Actualmente muestra un placeholder; futuro: lista de anotaciones por selección de texto.
 *
 * Extraído de WritingView.tsx para separar responsabilidades.
 */
const WritingCommentsPanel: React.FC = () => {
  return (
    <div className="h-1/3 min-h-[200px] border-t-2 border-foreground/10 bg-background/50 flex flex-col shrink-0">
      <div className="p-2 border-b border-foreground/5 flex items-center gap-2 bg-background sticky top-0">
        <span className="material-symbols-outlined text-sm text-foreground/40">
          forum
        </span>
        <span className="text-[10px] font-sans font-bold uppercase tracking-wider text-foreground/60">
          Comentarios del Documento
        </span>
      </div>
      <div className="flex-grow overflow-y-auto p-3 custom-scrollbar flex flex-col gap-2">
        {/* Placeholder para los comentarios */}
        <div className="flex flex-col items-center justify-center h-full text-center p-4 opacity-50">
          <span className="material-symbols-outlined text-2xl mb-2">
            speaker_notes_off
          </span>
          <span className="text-[10px] font-sans">
            No hay comentarios en esta hoja.
          </span>
          <span className="text-[9px] font-sans mt-1">
            Selecciona texto para añadir una anotación.
          </span>
        </div>
      </div>
    </div>
  );
};

export default WritingCommentsPanel;
