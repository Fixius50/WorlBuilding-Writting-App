import React from "react";
import { Entidad } from "@domain/database";

interface AutoLinkPromptProps {
  entity: Entidad;
  onConfirm: () => void;
  onDiscard: () => void;
}

const AutoLinkPrompt: React.FC<AutoLinkPromptProps> = ({
  entity,
  onConfirm,
  onDiscard,
}) => {
  return (
    <div className="bg-background/95 border border-foreground/10 shadow-2xl rounded-lg p-2.5 flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-bottom-1 duration-200 pointer-events-auto select-none">
      <span className="material-symbols-outlined text-sm text-primary animate-pulse">
        link
      </span>
      <div className="flex flex-col font-sans">
        <span className="text-[10px] text-foreground/45 font-bold uppercase tracking-wider leading-none">
          ¿Enlazar entidad?
        </span>
        <span className="text-xs font-semibold text-foreground/90 mt-0.5">
          {entity.nombre}{" "}
          <span className="text-[10px] text-primary/75 font-normal">
            ({entity.tipo})
          </span>
        </span>
      </div>
      <div className="w-px h-6 bg-foreground/10 shrink-0" />
      <div className="flex items-center gap-1">
        <button
          onClick={onConfirm}
          className="p-1 rounded hover:bg-primary/20 text-primary transition-colors flex items-center justify-center cursor-pointer"
          title="Enlazar"
        >
          <span className="material-symbols-outlined text-base">check</span>
        </button>
        <button
          onClick={onDiscard}
          className="p-1 rounded hover:bg-foreground/10 text-foreground/50 hover:text-foreground transition-colors flex items-center justify-center cursor-pointer"
          title="Ignorar"
        >
          <span className="material-symbols-outlined text-base">close</span>
        </button>
      </div>
    </div>
  );
};

export default AutoLinkPrompt;
