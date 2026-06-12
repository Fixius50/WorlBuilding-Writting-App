import React from 'react';
import { motion } from 'framer-motion';
import { useEditorTopBar } from './useEditorTopBar';

interface EditorTopBarProps {
  title: string;
  onTitleChange: (newTitle: string) => void;
  wordCount: number;
  wordGoal: number;
  saving: boolean;
  onManualSnapshot: () => void;
  snapshots: { id: number; timestamp: string }[];
  onRestoreSnapshot: (id: number) => void;
  minimal?: boolean;
  notebookTitle?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const EditorTopBar: React.FC<EditorTopBarProps> = ({
  title,
  wordCount,
  wordGoal,
  saving,
  onManualSnapshot,
  snapshots,
  onRestoreSnapshot,
  minimal = false,
  notebookTitle,
  sidebarOpen = true,
  onToggleSidebar,
}) => {
  const {
    showSnapshots,
    setShowSnapshots,
    toggleSnapshots,
    handleManualSnapshot,
    handleRestoreSnapshot,
  } = useEditorTopBar(wordCount, wordGoal, onManualSnapshot, onRestoreSnapshot);

  return (
    <header className={`${minimal ? 'h-11 px-4' : 'h-14 px-8'} flex items-center justify-between bg-background border-b border-foreground/5 select-none shrink-0 z-50 font-sans`}>
      {/* LADO IZQUIERDO: Ruta tipo libro */}
      <div className="flex items-center gap-1.5 flex-1 min-w-0">
        <span className="text-[12px] text-foreground/40 truncate font-medium">
          {notebookTitle || "Crónicas"}
        </span>
        <span className="text-[11px] text-foreground/20">/</span>
        <span className="text-[12px] text-foreground/80 font-bold truncate">
          {title}
        </span>
      </div>

      {/* LADO DERECHO: Palabras, Guardado, Snapshots y Toggle Sidebar */}
      <div className="flex items-center gap-6 shrink-0">
        <span className="text-[12px] text-foreground/50 font-medium">
          {wordCount} palabras
        </span>

        <div className="flex items-center gap-1.5 text-[12px] text-foreground/40 font-medium">
          {saving ? (
            <>
              <span className="material-symbols-outlined text-xs animate-spin">sync</span>
              <span>Sincronizando...</span>
            </>
          ) : (
            <>
              <span className="text-primary font-bold text-[10px]">✓</span>
              <span>Guardado</span>
            </>
          )}
        </div>

        {/* Snapshots Menu */}
        <div className="relative">
          <button
            onClick={toggleSnapshots}
            className="p-1 hover:text-foreground/80 transition-colors flex items-center justify-center outline-none text-foreground/40"
            title="Versiones guardadas"
          >
            <span className="material-symbols-outlined text-lg">more_horiz</span>
          </button>

          {showSnapshots && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setShowSnapshots(false)} />
              <div className="absolute top-full right-0 mt-1 w-64 bg-background border border-foreground/10 rounded-lg shadow-2xl z-50 p-1 animate-in fade-in zoom-in-95 duration-200">
                <div className="p-2 border-b border-foreground/5 flex justify-between items-center mb-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">Versiones</span>
                  <button
                    onClick={handleManualSnapshot}
                    className="text-primary hover:text-primary/80 transition-colors"
                    title="Crear Snapshot"
                  >
                    <span className="material-symbols-outlined text-sm">add_circle</span>
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto no-scrollbar flex flex-col gap-0.5">
                  {snapshots.length === 0 ? (
                    <div className="p-3 text-center text-[10px] text-foreground/30 italic font-sans">No hay capturas previas</div>
                  ) : (
                    snapshots.map((snap) => (
                      <button
                        key={snap.id}
                        onClick={() => handleRestoreSnapshot(snap.id)}
                        className="w-full text-left p-2 hover:bg-primary/10 rounded-md transition-colors flex items-center justify-between group outline-none"
                      >
                        <div className="flex flex-col">
                          <span className="text-[10px] text-foreground font-bold">{new Date(snap.timestamp).toLocaleString()}</span>
                          <span className="text-[9px] text-foreground/45 font-mono">ID: {snap.id}</span>
                        </div>
                        <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 text-primary transition-opacity">restore</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Toggle Sidebar */}
        {onToggleSidebar && (
          <button
            onClick={onToggleSidebar}
            className={`p-1 transition-colors flex items-center justify-center outline-none ${sidebarOpen ? 'text-primary' : 'text-foreground/40 hover:text-foreground/75'}`}
            title={sidebarOpen ? "Ocultar panel lateral" : "Mostrar panel lateral"}
          >
            <span className="material-symbols-outlined text-lg">
              {sidebarOpen ? "first_page" : "menu"}
            </span>
          </button>
        )}
      </div>
    </header>
  );
};

export default EditorTopBar;

