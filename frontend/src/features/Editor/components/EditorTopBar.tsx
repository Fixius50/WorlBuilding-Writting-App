import React from 'react';
import { Editor } from '@tiptap/react';
import { useEditorTopBar } from '../hooks/useEditorTopBar';

interface EditorTopBarProps {
  editor: Editor | null;
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
  zoom?: number;
  onZoomChange?: (zoom: number) => void;
}

const EditorTopBar: React.FC<EditorTopBarProps> = ({
  editor,
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
  zoom = 100,
  onZoomChange = () => {},
}) => {
  const {
    showSnapshots,
    setShowSnapshots,
    toggleSnapshots,
    handleManualSnapshot,
    handleRestoreSnapshot,
  } = useEditorTopBar(wordCount, wordGoal, onManualSnapshot, onRestoreSnapshot);

  const [updateTick, setUpdateTick] = React.useState(0);

  React.useEffect(() => {
    const handleTransaction = () => {
      setUpdateTick((prev) => prev + 1);
    };
    editor?.on('transaction', handleTransaction);
    return () => {
      editor?.off('transaction', handleTransaction);
    };
  }, [editor]);

  const buttonClass = (isActive: boolean) => 
    `p-1 rounded hover:bg-foreground/5 transition-all duration-150 flex items-center justify-center ${
      isActive ? 'text-primary bg-primary/10 hover:bg-primary/15' : 'text-foreground/60'
    }`;

  const selectStyle = "bg-transparent text-[11px] text-foreground/75 font-sans border-none outline-none cursor-pointer hover:bg-foreground/5 py-1 px-1.5 rounded transition-colors";

  return (
    <div className="flex flex-col w-full shrink-0 z-50">
      {/* FILA SUPERIOR: TÃ­tulo, Palabras y Snapshots */}
      <header className={`${minimal ? 'h-11 px-4' : 'h-14 px-8'} flex items-center justify-between bg-background border-b border-foreground/5 select-none shrink-0 font-sans`}>
        {/* LADO IZQUIERDO: Ruta tipo libro */}
        <div className="flex items-center gap-1.5 flex-1 min-w-0">
          <span className="text-[12px] text-foreground/40 truncate font-medium">
            {notebookTitle || "CrÃ³nicas"}
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
                <span className="text-primary font-bold text-[10px]">âœ“</span>
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

      {/* FILA INFERIOR: Barra de herramientas con Historial y Zoom de PÃ¡gina */}
      {editor && (
        <div className="flex items-center gap-1 py-1.5 px-6 border-b border-foreground/5 bg-background select-none overflow-visible shrink-0">
          
          {/* Historial e ImpresiÃ³n */}
          <button
            onClick={() => editor.chain().focus().undo().run()}
            disabled={!editor.can().undo()}
            className={`${buttonClass(false)} disabled:opacity-30 disabled:pointer-events-none`}
            title="Deshacer (Ctrl+Z)"
          >
            <span className="material-symbols-outlined text-[16px]">undo</span>
          </button>
          <button
            onClick={() => editor.chain().focus().redo().run()}
            disabled={!editor.can().redo()}
            className={`${buttonClass(false)} disabled:opacity-30 disabled:pointer-events-none`}
            title="Rehacer (Ctrl+Y)"
          >
            <span className="material-symbols-outlined text-[16px]">redo</span>
          </button>
          <button
            onClick={() => window.print()}
            className={buttonClass(false)}
            title="Imprimir"
          >
            <span className="material-symbols-outlined text-[16px]">print</span>
          </button>

          <div className="w-px h-4 bg-foreground/10 mx-1 shrink-0" />

          {/* Alineaciones */}
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={buttonClass(editor.isActive({ textAlign: 'left' }))}
            title="Alinear a la izquierda"
          >
            <span className="material-symbols-outlined text-[16px]">format_align_left</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={buttonClass(editor.isActive({ textAlign: 'center' }))}
            title="Centrar"
          >
            <span className="material-symbols-outlined text-[16px]">format_align_center</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={buttonClass(editor.isActive({ textAlign: 'right' }))}
            title="Alinear a la derecha"
          >
            <span className="material-symbols-outlined text-[16px]">format_align_right</span>
          </button>
          <button
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign('justify').run()}
            className={buttonClass(editor.isActive({ textAlign: 'justify' }))}
            title="Justificar"
          >
            <span className="material-symbols-outlined text-[16px]">format_align_justify</span>
          </button>

          <div className="w-px h-4 bg-foreground/10 mx-1 shrink-0" />

          {/* Zoom */}
          <div className="flex items-center" title="Zoom de pÃ¡gina">
            <select
              value={zoom}
              onChange={(e) => onZoomChange(Number(e.target.value))}
              className={selectStyle}
            >
              <option value={80} className="bg-background text-foreground text-xs">80%</option>
              <option value={100} className="bg-background text-foreground text-xs">100%</option>
              <option value={120} className="bg-background text-foreground text-xs">120%</option>
              <option value={150} className="bg-background text-foreground text-xs">150%</option>
            </select>
          </div>

        </div>
      )}
    </div>
  );
};

export default EditorTopBar;


