import React from "react";
import { Editor } from "@tiptap/react";
import { useEditorTopBar } from "../hooks/useEditorTopBar";

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

  React.useEffect(() => {
    const handleTransaction = () => {
      setUpdateTick((prev) => prev + 1);
    };
    editor?.on("transaction", handleTransaction);
    return () => {
      editor?.off("transaction", handleTransaction);
    };
  }, [editor]);

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
          <span className="text-[12px] text-foreground/50 font-medium">
            {wordCount} palabras
          </span>

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
            title={focusMode ? "Desactivar modo enfoque" : "Activar modo enfoque"}
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
      {editor && (
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
              <span className="material-symbols-outlined text-[16px]">print</span>
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
                    <span className="material-symbols-outlined text-sm">print</span>
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
                        const htmlBody: string = editor.getHTML();
                        const fullHtml: string = `
                          <!DOCTYPE html>
                          <html>
                            <head>
                              <meta charset="utf-8" />
                              <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300..700;1,300..700&amp;family=Outfit:wght@100..900&amp;display=swap" rel="stylesheet" />
                              <style>
                                @page {
                                  size: A4;
                                  margin: 2cm;
                                }
                                body {
                                  font-family: 'Cormorant Garamond', serif;
                                  font-size: 16px;
                                  line-height: 1.5;
                                  color: #000000;
                                  margin: 0;
                                  padding: 0;
                                }
                                h1 {
                                  font-size: 32px;
                                  font-family: 'Outfit', sans-serif;
                                  font-weight: bold;
                                  margin-bottom: 2rem;
                                }
                                p {
                                  margin-bottom: 0.3em;
                                  text-align: justify;
                                }
                                .mention {
                                  font-weight: bold;
                                  color: #000000;
                                  text-decoration: none;
                                }
                                img {
                                  display: block;
                                  max-width: 100%;
                                  height: auto;
                                  margin: 1.5rem auto;
                                }
                              </style>
                            </head>
                            <body>
                              <h1>${title || "Documento"}</h1>
                              <div>${htmlBody}</div>
                            </body>
                          </html>
                        `;

                        const response: Response = await fetch("/api/editor/export-pdf", {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({ html: fullHtml, title }),
                        });

                        const isOk = response.ok;
                        isOk
                          ? await (async (): Promise<void> => {
                              const blob: Blob = await response.blob();
                              const downloadUrl: string = URL.createObjectURL(blob);
                              const link: HTMLAnchorElement = document.createElement("a");
                              link.href = downloadUrl;
                              link.download = `${title || "documento"}.pdf`;
                              link.click();
                              URL.revokeObjectURL(downloadUrl);
                            })()
                          : (() => {
                              console.error("Error al exportar PDF en backend, iniciando fallback");
                              onPrint ? onPrint() : window.print();
                            })();
                      } catch (err) {
                        console.error("Error de red al exportar PDF, usando fallback de impresión:", err);
                        onPrint ? onPrint() : window.print();
                      }
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 text-foreground/85 outline-none font-sans"
                  >
                    <span className="material-symbols-outlined text-sm">picture_as_pdf</span>
                    <span>Documento PDF (.pdf)</span>
                  </button>
                  <button
                    onClick={(): void => {
                      const htmlContent: string = editor.getHTML();
                      const blob: Blob = new Blob([htmlContent], { type: "text/html;charset=utf-8" });
                      const url: string = URL.createObjectURL(blob);
                      const link: HTMLAnchorElement = document.createElement("a");
                      link.href = url;
                      link.download = `${title || "documento"}.html`;
                      link.click();
                      URL.revokeObjectURL(url);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 text-foreground/85 outline-none font-sans"
                  >
                    <span className="material-symbols-outlined text-sm">html</span>
                    <span>Página Web (.html)</span>
                  </button>
                  <button
                    onClick={(): void => {
                      const textContent: string = editor.getText();
                      const blob: Blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
                      const url: string = URL.createObjectURL(blob);
                      const link: HTMLAnchorElement = document.createElement("a");
                      link.href = url;
                      link.download = `${title || "documento"}.txt`;
                      link.click();
                      URL.revokeObjectURL(url);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 text-foreground/85 outline-none font-sans"
                  >
                    <span className="material-symbols-outlined text-sm">description</span>
                    <span>Texto Plano (.txt)</span>
                  </button>
                  <button
                    onClick={(): void => {
                      const htmlContent: string = editor.getHTML();
                      // Convertidor ultra-ligero de HTML a Markdown
                      const mdContent: string = htmlContent
                        .replace(/<h1>(.*?)<\/h1>/gi, '# $1\n\n')
                        .replace(/<h2>(.*?)<\/h2>/gi, '## $1\n\n')
                        .replace(/<h3>(.*?)<\/h3>/gi, '### $1\n\n')
                        .replace(/<strong>(.*?)<\/strong>/gi, '**$1**')
                        .replace(/<b>(.*?)<\/b>/gi, '**$1**')
                        .replace(/<em>(.*?)<\/em>/gi, '*$1*')
                        .replace(/<i>(.*?)<\/i>/gi, '*$1*')
                        .replace(/<p>(.*?)<\/p>/gi, '$1\n\n')
                        .replace(/<li>(.*?)<\/li>/gi, '* $1\n')
                        .replace(/<ul>(.*?)<\/ul>/gi, '$1\n')
                        .replace(/<ol>(.*?)<\/ol>/gi, '$1\n')
                        .replace(/<br\s*\/?>/gi, '\n')
                        .replace(/<[^>]+>/g, '');
                      const blob: Blob = new Blob([mdContent.trim()], { type: "text/markdown;charset=utf-8" });
                      const url: string = URL.createObjectURL(blob);
                      const link: HTMLAnchorElement = document.createElement("a");
                      link.href = url;
                      link.download = `${title || "documento"}.md`;
                      link.click();
                      URL.revokeObjectURL(url);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center gap-2 text-foreground/85 outline-none font-sans"
                  >
                    <span className="material-symbols-outlined text-sm">markdown</span>
                    <span>Markdown (.md)</span>
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
          <div className="flex items-center" title="Tamaño de letra">
            <select
              value={(editor.getAttributes("textStyle").fontSize as string) || "20px"}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => {
                editor.chain().focus().setFontSize(e.target.value).run();
              }}
              className={selectStyle}
            >
              {["12px", "14px", "16px", "18px", "20px", "24px", "28px", "32px", "36px"].map((sz: string): React.JSX.Element => (
                <option key={sz} value={sz} className="bg-background text-foreground text-xs">
                  {sz}
                </option>
              ))}
            </select>
          </div>

          <div className="w-px h-4 bg-foreground/10 mx-1 shrink-0" />

          {/* Alineaciones */}
          <button
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("left").run()}
            className={buttonClass(editor.isActive({ textAlign: "left" }))}
            title="Alinear a la izquierda"
          >
            <span className="material-symbols-outlined text-[16px]">
              format_align_left
            </span>
          </button>
          <button
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("center").run()}
            className={buttonClass(editor.isActive({ textAlign: "center" }))}
            title="Centrar"
          >
            <span className="material-symbols-outlined text-[16px]">
              format_align_center
            </span>
          </button>
          <button
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
            onClick={() => editor.chain().focus().setTextAlign("right").run()}
            className={buttonClass(editor.isActive({ textAlign: "right" }))}
            title="Alinear a la derecha"
          >
            <span className="material-symbols-outlined text-[16px]">
              format_align_right
            </span>
          </button>
          <button
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => e.preventDefault()}
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
                  ].map((opt: { label: string; value: string }): React.JSX.Element => {
                    const attrs: Record<string, any> = editor.getAttributes("paragraph") || {};
                    const isSel: boolean = (attrs.lineHeight as string || "1.5") === opt.value;
                    return (
                      <button
                        key={opt.value}
                        onClick={(): void => {
                          editor.chain().focus().setLineHeight(opt.value).run();
                          setShowLineHeight(false);
                        }}
                        className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors flex items-center justify-between text-xs outline-none"
                      >
                        <span className="text-foreground/80">{opt.label}</span>
                        {isSel && (
                          <span className="text-primary font-bold">✓</span>
                        )}
                      </button>
                    );
                  })}
                  <div className="h-px bg-foreground/10 my-1" />
                  <button
                    onClick={(): void => {
                      editor.chain().focus().setParagraphSpacing("1.0em", null).run();
                      setShowLineHeight(false);
                    }}
                    className="w-full text-left px-3 py-1.5 hover:bg-primary/10 rounded-md transition-colors text-xs text-foreground/80 outline-none"
                  >
                    Añadir espacio antes del párrafo
                  </button>
                  <button
                    onClick={(): void => {
                      editor.chain().focus().setParagraphSpacing(null, "1.2em").run();
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
          <div className="flex items-center" title="Zoom de página">
            <select
              value={zoom}
              onChange={(e: React.ChangeEvent<HTMLSelectElement>): void => onZoomChange(Number(e.target.value))}
              className={selectStyle}
            >
              <option
                value={80}
                className="bg-background text-foreground text-xs"
              >
                80%
              </option>
              <option
                value={100}
                className="bg-background text-foreground text-xs"
              >
                100%
              </option>
              <option
                value={120}
                className="bg-background text-foreground text-xs"
              >
                120%
              </option>
              <option
                value={150}
                className="bg-background text-foreground text-xs"
              >
                150%
              </option>
            </select>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditorTopBar;
