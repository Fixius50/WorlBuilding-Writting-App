import React from "react";
import { Editor } from "@tiptap/react";
import { useEditorTopBar } from "../hooks/useEditorTopBar";
import { runExportPipeline } from "../application/exportPipeline";

const MIN_ZOOM_PERCENT = 1;
const MIN_FONT_SIZE_PX = 1;
const FONT_SIZE_PRESETS_PX = [12, 14, 16, 18, 20, 24, 28, 32, 36];
const ZOOM_PRESETS_PERCENT = [80, 100, 120, 150];

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
  focusMode?: boolean;
  onToggleFocusMode?: () => void;
  onPrint?: () => void;
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
  focusMode = false,
  onToggleFocusMode = () => {},
  onPrint,
}) => {
  const {
    showSnapshots,
    setShowSnapshots,
    toggleSnapshots,
    handleManualSnapshot,
    handleRestoreSnapshot,
  } = useEditorTopBar(wordCount, wordGoal, onManualSnapshot, onRestoreSnapshot);

  const [updateTick, setUpdateTick] = React.useState(0);
  const [showLineHeight, setShowLineHeight] = React.useState(false);
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const [zoomInputValue, setZoomInputValue] = React.useState<string>(
    String(zoom),
  );
  const [fontSizeInputValue, setFontSizeInputValue] =
    React.useState<string>("20");
  const selectionRangeRef = React.useRef<{ from: number; to: number } | null>(
    null,
  );

  React.useEffect(() => {
    const handleTransaction = () => {
      if (editor) {
        const { from, to } = editor.state.selection;
        selectionRangeRef.current = { from, to };
      }
      setUpdateTick((prev) => prev + 1);
    };
    editor?.on("transaction", handleTransaction);
    return () => {
      editor?.off("transaction", handleTransaction);
    };
  }, [editor]);

  React.useEffect(() => {
    if (editor) {
      const { from, to } = editor.state.selection;
      selectionRangeRef.current = { from, to };
    }
  }, [editor]);

  const captureSelectionRange = React.useCallback((): void => {
    if (!editor) {
      return;
    }

    const { from, to } = editor.state.selection;
    selectionRangeRef.current = { from, to };
  }, [editor]);

  React.useEffect(() => {
    setZoomInputValue(String(zoom));
  }, [zoom]);

  React.useEffect(() => {
    const rawFontSize =
      ((editor?.getAttributes("textStyle").fontSize as string) || "20px").trim();
    const parsedFontSize = Number(rawFontSize.replace("px", ""));
    const safeFontSize =
      Number.isFinite(parsedFontSize) && parsedFontSize > 0
        ? Math.round(parsedFontSize)
        : 20;
    setFontSizeInputValue(String(safeFontSize));
  }, [editor, updateTick]);

  const applyZoomInput = React.useCallback(
    (rawValue: string): void => {
      const normalizedRaw = rawValue.replace("%", "").trim();
      const parsed = Number(normalizedRaw);
      const fallback = Number.isFinite(zoom) ? Math.round(zoom) : 100;
      const safe =
        Number.isFinite(parsed) && normalizedRaw.length > 0
          ? Math.max(MIN_ZOOM_PERCENT, Math.round(parsed))
          : Math.max(MIN_ZOOM_PERCENT, fallback);

      onZoomChange(safe);
      setZoomInputValue(String(safe));
    },
    [onZoomChange, zoom],
  );

  const applyFontSizeInput = React.useCallback(
    (rawValue: string): void => {
      if (!editor) {
        return;
      }

      const normalizedRaw = rawValue.replace("px", "").trim();
      const parsed = Number(normalizedRaw);
      const rawFontSize =
        ((editor.getAttributes("textStyle").fontSize as string) || "20px").trim();
      const fallbackParsed = Number(rawFontSize.replace("px", ""));
      const fallback =
        Number.isFinite(fallbackParsed) && fallbackParsed > 0
          ? Math.round(fallbackParsed)
          : 20;
      const safe =
        Number.isFinite(parsed) && normalizedRaw.length > 0
          ? Math.max(MIN_FONT_SIZE_PX, Math.round(parsed))
          : Math.max(MIN_FONT_SIZE_PX, fallback);

      const rememberedSelection = selectionRangeRef.current;
      const shouldRestoreSelection =
        !!rememberedSelection && rememberedSelection.from <= rememberedSelection.to;

      shouldRestoreSelection
        ? editor
            .chain()
            .focus()
            .setTextSelection({
              from: rememberedSelection.from,
              to: rememberedSelection.to,
            })
            .setFontSize(`${safe}px`)
            .run()
        : editor.chain().focus().setFontSize(`${safe}px`).run();

      setFontSizeInputValue(String(safe));
    },
    [editor],
  );

  const isLeftAlignActive = React.useMemo(() => {
    if (!editor) {
      return true;
    }

    const isLeft = editor.isActive({ textAlign: "left" });
    const isCenter = editor.isActive({ textAlign: "center" });
    const isRight = editor.isActive({ textAlign: "right" });
    const isJustify = editor.isActive({ textAlign: "justify" });

    return isLeft || (!isCenter && !isRight && !isJustify);
  }, [editor, updateTick]);

  const buttonClass = (isActive: boolean) =>
    `p-1 rounded hover:bg-foreground/5 transition-all duration-150 flex items-center justify-center ${
      isActive
        ? "text-primary bg-primary/10 hover:bg-primary/15"
        : "text-foreground/60"
    }`;

  const selectStyle =
    "bg-transparent text-[11px] text-foreground/75 font-sans border-none outline-none cursor-pointer hover:bg-foreground/5 py-1 px-1.5 rounded transition-colors";

  return (
    <div className="flex flex-col w-full shrink-0 z-50">
      {/* FILA SUPERIOR: Título, Palabras y Snapshots */}
      <header
        className={`${minimal ? "h-11 px-4" : "h-14 px-8"} flex items-center justify-between bg-background border-b border-foreground/5 select-none shrink-0 font-sans`}
      >
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
          <div className="flex items-center gap-2">
            <span className="text-[12px] text-foreground/50 font-medium">
              {wordCount} palabras
            </span>
            <div className="relative group">
              <button
                type="button"
                className="p-0.5 rounded text-foreground/45 hover:text-foreground/80 hover:bg-foreground/10 transition-colors outline-none"
                title="Ayuda de comandos"
                aria-label="Ayuda de comandos"
              >
                <span className="material-symbols-outlined text-[15px]">help</span>
              </button>
              <div className="pointer-events-none absolute top-full right-0 mt-2 w-72 rounded-md border border-foreground/15 bg-background px-3 py-2 text-[10px] leading-relaxed text-foreground/80 shadow-xl opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 group-focus-within:opacity-100 group-focus-within:translate-y-0 transition-all z-50">
                <div className="font-black uppercase tracking-wider text-foreground/65 mb-1">
                  Atajos Writing
                </div>
                <div>
                  <span className="font-black text-foreground">@</span> abre el selector de menciones para enlazar entidades.
                </div>
                <div className="mt-1">
                  <span className="font-black text-foreground">/</span> abre el menú de comandos rápidos del editor.
                </div>
                <div className="mt-1">
                  <span className="font-black text-foreground">Ctrl+Z</span> deshacer, <span className="font-black text-foreground">Ctrl+Y</span> rehacer.
                </div>
                <div className="mt-1">
                  <span className="font-black text-foreground">Ctrl+D</span> aplica formato a todas las coincidencias.
                </div>
                <div className="mt-1">
                  <span className="font-black text-foreground">Ctrl+Alt+D</span> aplica formato paso a paso a la siguiente coincidencia.
                </div>
                <div className="mt-1">
                  Alternativa multi: <span className="font-black text-foreground">Ctrl+Shift+L</span>.
                </div>
                <div className="mt-2 pt-1 border-t border-foreground/10 text-foreground/55">
                  Los atajos avanzados funcionan en modo enfoque y con el cursor dentro del editor.
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-1.5 text-[12px] text-foreground/40 font-medium">
            {saving ? (
              <>
                <span className="material-symbols-outlined text-xs animate-spin">
                  sync
                </span>
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
              <span className="material-symbols-outlined text-lg">
                more_horiz
              </span>
            </button>

            {showSnapshots && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowSnapshots(false)}
                />
                <div className="absolute top-full right-0 mt-1 w-64 bg-background border border-foreground/10 rounded-lg shadow-2xl z-50 p-1 animate-in fade-in zoom-in-95 duration-200">
                  <div className="p-2 border-b border-foreground/5 flex justify-between items-center mb-1">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground/45">
                      Versiones
                    </span>
                    <button
                      onClick={handleManualSnapshot}
                      className="text-primary hover:text-primary/80 transition-colors"
                      title="Crear Snapshot"
                    >
                      <span className="material-symbols-outlined text-sm">
                        add_circle
                      </span>
                    </button>
                  </div>
                  <div className="max-h-60 overflow-y-auto no-scrollbar flex flex-col gap-0.5">
                    {snapshots.length === 0 ? (
                      <div className="p-3 text-center text-[10px] text-foreground/30 italic font-sans">
                        No hay capturas previas
                      </div>
                    ) : (
                      snapshots.map((snap) => (
                        <button
                          key={snap.id}
                          onClick={() => handleRestoreSnapshot(snap.id)}
                          className="w-full text-left p-2 hover:bg-primary/10 rounded-md transition-colors flex items-center justify-between group outline-none"
                        >
                          <div className="flex flex-col">
                            <span className="text-[10px] text-foreground font-bold">
                              {new Date(snap.timestamp).toLocaleString()}
                            </span>
                            <span className="text-[9px] text-foreground/45 font-mono">
                              ID: {snap.id}
                            </span>
                          </div>
                          <span className="material-symbols-outlined text-sm opacity-0 group-hover:opacity-100 text-primary transition-opacity">
                            restore
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Toggle Focus Mode */}
          <button
            onClick={onToggleFocusMode}
            className={`p-1 transition-colors flex items-center justify-center outline-none ${focusMode ? "text-primary" : "text-foreground/40 hover:text-foreground/75"}`}
            title={
              focusMode ? "Desactivar modo enfoque" : "Activar modo enfoque"
            }
          >
            <span className="material-symbols-outlined text-lg">
              {focusMode ? "visibility" : "visibility_off"}
            </span>
          </button>

          {/* Toggle Sidebar */}
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className={`p-1 transition-colors flex items-center justify-center outline-none ${sidebarOpen ? "text-primary" : "text-foreground/40 hover:text-foreground/75"}`}
              title={
                sidebarOpen ? "Ocultar panel lateral" : "Mostrar panel lateral"
              }
            >
              <span className="material-symbols-outlined text-lg">
                {sidebarOpen ? "first_page" : "menu"}
              </span>
            </button>
          )}
        </div>
      </header>

      {/* FILA INFERIOR: Barra de herramientas con Historial y Zoom de Página */}
      {editor && !focusMode && (
        <div className="flex items-center gap-1 py-1.5 px-6 border-b border-foreground/5 bg-background select-none overflow-visible shrink-0">
          {/* Historial, Impresión e Imagen */}
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
          {/* Desplegable de Imprimir/Exportar */}
          <div className="relative">
            <button
              onClick={(): void => setShowExportMenu(!showExportMenu)}
              className={buttonClass(showExportMenu)}
              title="Imprimir o Exportar documento"
            >
              <span className="material-symbols-outlined text-[16px]">
                print
              </span>
            </button>

            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(): void => setShowExportMenu(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-56 bg-background border border-foreground/10 rounded-lg shadow-2xl z-50 p-1 animate-in fade-in zoom-in-95 duration-100 font-sans text-xs">
                  <button
                    onClick={(): void => {
                      onPrint ? onPrint() : window.print();
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 text-foreground/85 outline-none font-sans"
                  >
                    <span className="material-symbols-outlined text-sm">
                      print
                    </span>
                    <span>Imprimir</span>
                  </button>
                  <div className="h-px bg-foreground/10 my-1" />
                  <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground/45 font-sans">
                    Descargar como...
                  </div>
                  <button
                    onClick={async (): Promise<void> => {
                      setShowExportMenu(false);
                      try {
                        await runExportPipeline("pdf", { editor, title }, () =>
                          onPrint ? onPrint() : window.print(),
                        );
                      } catch (err) {
                        console.error(
                          "Error de red al exportar PDF, usando fallback de impresión:",
                          err,
                        );
                        onPrint ? onPrint() : window.print();
                      }
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 text-foreground/85 outline-none font-sans"
                  >
                    <span className="material-symbols-outlined text-sm">
                      picture_as_pdf
                    </span>
                    <span>Documento PDF (.pdf)</span>
                  </button>
                  <button
                    onClick={(): void => {
                      runExportPipeline("html", { editor, title }, () =>
                        onPrint ? onPrint() : window.print(),
                      );
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 text-foreground/85 outline-none font-sans"
                  >
                    <span className="material-symbols-outlined text-sm">
                      html
                    </span>
                    <span>Página Web (.html)</span>
                  </button>
                  <button
                    onClick={(): void => {
                      runExportPipeline("txt", { editor, title }, () =>
                        onPrint ? onPrint() : window.print(),
                      );
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 text-foreground/85 outline-none font-sans"
                  >
                    <span className="material-symbols-outlined text-sm">
                      description
                    </span>
                    <span>Texto Plano (.txt)</span>
                  </button>
                  <button
                    onClick={(): void => {
                      runExportPipeline("md", { editor, title }, () =>
                        onPrint ? onPrint() : window.print(),
                      );
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 text-foreground/85 outline-none font-sans"
                  >
                    <span className="material-symbols-outlined text-sm">
                      markdown
                    </span>
                    <span>Markdown (.md)</span>
                  </button>
                  <button
                    onClick={async (): Promise<void> => {
                      setShowExportMenu(false);
                      await runExportPipeline("docx", { editor, title }, () =>
                        onPrint ? onPrint() : window.print(),
                      );
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 text-foreground/85 outline-none font-sans"
                  >
                    <span className="material-symbols-outlined text-sm">
                      article
                    </span>
                    <span>Documento Word (.docx)</span>
                  </button>
                  <button
                    onClick={async (): Promise<void> => {
                      setShowExportMenu(false);
                      await runExportPipeline("epub", { editor, title }, () =>
                        onPrint ? onPrint() : window.print(),
                      );
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 text-foreground/85 outline-none font-sans"
                  >
                    <span className="material-symbols-outlined text-sm">
                      import_contacts
                    </span>
                    <span>Libro electrónico (.epub)</span>
                  </button>
                </div>
              </>
            )}
          </div>
          <button
            onClick={() => {
              const input: HTMLInputElement = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e: Event): void => {
                const target: HTMLInputElement = e.target as HTMLInputElement;
                const file: File | undefined = target.files?.[0];
                if (file) {
                  const reader: FileReader = new FileReader();
                  reader.onload = (): void => {
                    const result: string = reader.result as string;
                    editor.chain().focus().setImage({ src: result }).run();
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}
            className={buttonClass(false)}
            title="Insertar imagen"
          >
            <span className="material-symbols-outlined text-[16px]">image</span>
          </button>

          <div className="w-px h-4 bg-foreground/10 mx-1 shrink-0" />

          {/* Tamaño de Letra */}
          <div className="flex items-center gap-1" title="Tamaño de letra">
            <input
              type="text"
              inputMode="numeric"
              value={fontSizeInputValue}
              onMouseDown={(): void => captureSelectionRange()}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                setFontSizeInputValue(e.target.value.replace(/[^\d]/g, ""));
              }}
              onBlur={(): void => applyFontSizeInput(fontSizeInputValue)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => {
                if (e.key === "Enter") {
                  applyFontSizeInput(fontSizeInputValue);
                }
              }}
              className={`${selectStyle} w-12 text-right`}
              aria-label="Tamaño de letra en píxeles"
            />
            <span className="text-[11px] text-foreground/55 font-sans">px</span>
            <select
              value=""
              onMouseDown={(): void => captureSelectionRange()}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                applyFontSizeInput(e.target.value);
              }}
              className={`${selectStyle} w-16`}
              aria-label="Presets de tamaño de letra"
            >
              <option value="" className="bg-background text-foreground text-xs">
                Preset
              </option>
              {FONT_SIZE_PRESETS_PX.map((preset) => (
                <option
                  key={preset}
                  value={String(preset)}
                  className="bg-background text-foreground text-xs"
                >
                  {preset}px
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-4 bg-foreground/10 mx-1 shrink-0" />

          {/* Alineaciones */}
          <button
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) =>
              e.preventDefault()
            }
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={buttonClass(isLeftAlignActive)}
            title="Alinear a la izquierda"
          >
            <span className="material-symbols-outlined text-[16px]">
              format_align_left
            </span>
          </button>
          <button
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) =>
              e.preventDefault()
            }
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={buttonClass(editor.isActive({ textAlign: "center" }))}
            title="Centrar"
          >
            <span className="material-symbols-outlined text-[16px]">
              format_align_center
            </span>
          </button>
          <button
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) =>
              e.preventDefault()
            }
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={buttonClass(editor.isActive({ textAlign: "right" }))}
            title="Alinear a la derecha"
          >
            <span className="material-symbols-outlined text-[16px]">
              format_align_right
            </span>
          </button>
          <button
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) =>
              e.preventDefault()
            }
            onClick={() => editor.chain().focus().setTextAlign("justify").run()}
            className={buttonClass(editor.isActive({ textAlign: "justify" }))}
            title="Justificar"
          >
            <span className="material-symbols-outlined text-[16px]">
              format_align_justify
            </span>
          </button>

          {/* Desplegable de Interlineado */}
          <div className="relative">
            <button
              onClick={(): void => setShowLineHeight(!showLineHeight)}
              className={buttonClass(showLineHeight)}
              title="Interlineado y espaciado"
            >
              <span className="material-symbols-outlined text-[16px]">
                format_line_spacing
              </span>
            </button>

            {showLineHeight && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={(): void => setShowLineHeight(false)}
                />
                <div className="absolute top-full left-0 mt-1 w-56 bg-background border border-foreground/10 rounded-lg shadow-2xl z-50 p-1 animate-in fade-in zoom-in-95 duration-100 font-sans">
                  {[
                    { label: "Sencillo", value: "1.0" },
                    { label: "1,15", value: "1.15" },
                    { label: "1,5", value: "1.5" },
                    { label: "Doble", value: "2.0" },
                  ].map(
                    (opt: {
                      label: string;
                      value: string;
                    }): React.JSX.Element => {
                      const attrs: Record<string, any> =
                        editor.getAttributes("paragraph") || {};
                      const isSel: boolean =
                        ((attrs.lineHeight as string) || "1.5") === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={(): void => {
                            editor
                              .chain()
                              .focus()
                              .setLineHeight(opt.value)
                              .run();
                            setShowLineHeight(false);
                          }}
                          className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center justify-between text-xs outline-none"
                        >
                          <span className="text-foreground/80">
                            {opt.label}
                          </span>
                          {isSel && (
                            <span className="text-primary font-bold">✓</span>
                          )}
                        </button>
                      );
                    },
                  )}
                  <div className="h-px bg-foreground/10 my-1" />
                  <button
                    onClick={(): void => {
                      editor
                        .chain()
                        .focus()
                        .setParagraphSpacing("1.0em", null)
                        .run();
                      setShowLineHeight(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors text-xs text-foreground/80 outline-none"
                  >
                    Añadir espacio antes del párrafo
                  </button>
                  <button
                    onClick={(): void => {
                      editor
                        .chain()
                        .focus()
                        .setParagraphSpacing(null, "1.2em")
                        .run();
                      setShowLineHeight(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors text-xs text-foreground/80 outline-none"
                  >
                    Añadir espacio después del párrafo
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="w-px h-4 bg-foreground/10 mx-1 shrink-0" />

          {/* Zoom */}
          <div className="flex items-center gap-1" title="Zoom de página">
            <input
              type="text"
              inputMode="numeric"
              value={zoomInputValue}
              onChange={(e: React.ChangeEvent<HTMLInputElement>): void => {
                setZoomInputValue(e.target.value.replace(/[^\d]/g, ""));
              }}
              onBlur={(): void => applyZoomInput(zoomInputValue)}
              onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>): void => {
                if (e.key === "Enter") {
                  applyZoomInput(zoomInputValue);
                }
              }}
              className={`${selectStyle} w-12 text-right`}
              aria-label="Zoom en porcentaje"
            />
            <span className="text-[11px] text-foreground/55 font-sans">%</span>
            <select
              value=""
              onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                applyZoomInput(e.target.value);
              }}
              className={`${selectStyle} w-16`}
              aria-label="Presets de zoom"
            >
              <option value="" className="bg-background text-foreground text-xs">
                Preset
              </option>
              {ZOOM_PRESETS_PERCENT.map((preset) => (
                <option
                  key={preset}
                  value={String(preset)}
                  className="bg-background text-foreground text-xs"
                >
                  {preset}%
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorTopBar;
