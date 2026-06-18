import { EditorContent, BubbleMenu, Editor } from "@tiptap/react";
import React from "react";

interface BubbleToolbarProps {
  editor: Editor | null;
  onMentionClick?: (id: string) => void;
  zoom: number;
}

/**
 * 🎨 BubbleToolbar
 * Renderiza el BubbleMenu flotante con herramientas de formato inline
 * (negrita, cursiva, subrayado, tachado, color de texto, resaltado, enlace)
 * y el contenido editable del editor (EditorContent).
 *
 * Extraído de ZenEditor.tsx → PageContentEditor.
 */
const BubbleToolbar: React.FC<BubbleToolbarProps> = ({
  editor,
  zoom,
}) => {
  const [showTextColor, setShowTextColor] = React.useState(false);
  const [showHighlightColor, setShowHighlightColor] = React.useState(false);
  const textColorInputRef = React.useRef<HTMLInputElement>(null);
  const highlightColorInputRef = React.useRef<HTMLInputElement>(null);

  const textColors = [
    { name: "Normal", value: "hsl(var(--foreground))" },
    { name: "Gris", value: "#a1a1aa" },
    { name: "Rojo", value: "#ef4444" },
    { name: "Naranja", value: "#f97316" },
    { name: "Amarillo", value: "#eab308" },
    { name: "Verde", value: "#22c55e" },
    { name: "Azul", value: "#3b82f6" },
    { name: "Púrpura", value: "#a855f7" },
  ];

  const highlightColors = [
    { name: "Ninguno", value: "transparent" },
    { name: "Amarillo", value: "rgba(234, 179, 8, 0.3)" },
    { name: "Verde", value: "rgba(34, 197, 94, 0.3)" },
    { name: "Azul", value: "rgba(59, 130, 246, 0.3)" },
    { name: "Rojo", value: "rgba(239, 68, 68, 0.3)" },
    { name: "Púrpura", value: "rgba(168, 85, 247, 0.3)" },
  ];

  const currentTextColor =
    editor?.getAttributes("textStyle").color || "hsl(var(--foreground))";
  const currentHighlightColor =
    editor?.getAttributes("highlight").color || "transparent";

  return (
    <div className="flex-1 w-full relative">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center gap-1 p-1 bg-background border border-foreground/10 rounded-md shadow-2xl">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors ${editor.isActive("bold") ? "text-primary bg-primary/10" : "text-foreground/60"}`}
              title="Negrita"
            >
              <span className="material-symbols-outlined text-lg">
                format_bold
              </span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors ${editor.isActive("italic") ? "text-primary bg-primary/10" : "text-foreground/60"}`}
              title="Cursiva"
            >
              <span className="material-symbols-outlined text-lg">
                format_italic
              </span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors ${editor.isActive("underline") ? "text-primary bg-primary/10" : "text-foreground/60"}`}
              title="Subrayado"
            >
              <span className="material-symbols-outlined text-lg">
                format_underlined
              </span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors ${editor.isActive("strike") ? "text-primary bg-primary/10" : "text-foreground/60"}`}
              title="Tachado"
            >
              <span className="material-symbols-outlined text-lg">
                format_strikethrough
              </span>
            </button>

            <div className="w-px h-5 bg-foreground/10 mx-1 shrink-0" />

            {/* Color del texto */}
            <div className="relative">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setShowTextColor(!showTextColor);
                  setShowHighlightColor(false);
                }}
                className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors relative flex items-center justify-center ${showTextColor ? "text-primary bg-primary/10" : "text-foreground/60"}`}
                title="Color del texto"
              >
                <span className="material-symbols-outlined text-lg">
                  format_color_text
                </span>
                <span
                  className="w-3.5 h-0.5 mt-0.5 absolute bottom-1 rounded-full"
                  style={{ backgroundColor: currentTextColor }}
                />
              </button>
              {showTextColor && (
                <>
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowTextColor(false)}
                  />
                  <div className="absolute top-full left-0 mt-1.5 bg-background border border-foreground/10 rounded-lg p-2 shadow-2xl z-50 grid grid-cols-4 gap-1.5 w-36 animate-in fade-in zoom-in-95 duration-100">
                    {textColors.map((color) => (
                      <button
                        key={color.name}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          editor.chain().focus().setColor(color.value).run();
                          setShowTextColor(false);
                        }}
                        className="w-6 h-6 rounded-full border border-foreground/10 flex items-center justify-center hover:scale-110 transition-transform"
                        style={{
                          backgroundColor:
                            color.value === "hsl(var(--foreground))"
                              ? "#fff"
                              : color.value,
                        }}
                        title={color.name}
                      >
                        {currentTextColor === color.value && (
                          <span className="text-[10px] text-background font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                    <div className="col-span-4 mt-1 border-t border-foreground/10 pt-1 flex justify-center">
                      <label
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => textColorInputRef.current?.click()}
                        className="text-[10px] font-sans flex items-center gap-2 text-foreground/60 cursor-pointer hover:text-foreground relative"
                      >
                        <span className="material-symbols-outlined text-sm">palette</span> Custom
                        <input
                          ref={textColorInputRef}
                          type="color"
                          className="w-0 h-0 opacity-0 absolute pointer-events-none"
                          onChange={(e) => {
                            editor.chain().focus().setColor(e.target.value).run();
                            setShowTextColor(false);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Resaltado del texto */}
            <div className="relative">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setShowHighlightColor(!showHighlightColor);
                  setShowTextColor(false);
                }}
                className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors relative flex items-center justify-center ${showHighlightColor ? "text-primary bg-primary/10" : "text-foreground/60"}`}
                title="Color de resaltado"
              >
                <span className="material-symbols-outlined text-lg">
                  border_color
                </span>
                <span
                  className="w-3.5 h-0.5 mt-0.5 absolute bottom-1 rounded-full"
                  style={{
                    backgroundColor:
                      currentHighlightColor === "transparent"
                        ? "#fff"
                        : currentHighlightColor,
                  }}
                />
              </button>
              {showHighlightColor && (
                <>
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowHighlightColor(false)}
                  />
                  <div className="absolute top-full left-0 mt-1.5 bg-background border border-foreground/10 rounded-lg p-2 shadow-2xl z-50 grid grid-cols-3 gap-1.5 w-32 animate-in fade-in zoom-in-95 duration-100">
                    {highlightColors.map((color) => (
                      <button
                        key={color.name}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          const isClear = color.value === "transparent";
                          isClear
                            ? editor.chain().focus().unsetHighlight().run()
                            : editor
                                .chain()
                                .focus()
                                .toggleHighlight({ color: color.value })
                                .run();
                          setShowHighlightColor(false);
                        }}
                        className="w-6 h-6 rounded border border-foreground/10 flex items-center justify-center hover:scale-110 transition-transform"
                        style={{
                          backgroundColor:
                            color.value === "transparent"
                              ? "rgba(255,255,255,0.05)"
                              : color.value,
                        }}
                        title={color.name}
                      >
                        {currentHighlightColor === color.value && (
                          <span className="text-[10px] text-foreground font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                    <div className="col-span-3 mt-1 border-t border-foreground/10 pt-1 flex justify-center">
                      <label
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => highlightColorInputRef.current?.click()}
                        className="text-[10px] font-sans flex items-center gap-2 text-foreground/60 cursor-pointer hover:text-foreground relative"
                      >
                        <span className="material-symbols-outlined text-sm">palette</span> Custom
                        <input
                          ref={highlightColorInputRef}
                          type="color"
                          className="w-0 h-0 opacity-0 absolute pointer-events-none"
                          onChange={(e) => {
                            const hex = e.target.value;
                            editor.chain().focus().toggleHighlight({ color: hex + "4D" }).run();
                            setShowHighlightColor(false);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-5 bg-foreground/10 mx-1 shrink-0" />

            {/* Enlace (Link) */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const isLinkActive = editor.isActive("link");
                const url = isLinkActive
                  ? null
                  : window.prompt("Introduce la URL del enlace:", "https://");

                const applyLink = () => {
                  url && editor.chain().focus().setLink({ href: url }).run();
                };

                const removeLink = () => {
                  editor.chain().focus().unsetLink().run();
                };

                isLinkActive ? removeLink() : applyLink();
              }}
              className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors ${editor.isActive("link") ? "text-primary bg-primary/10" : "text-foreground/60"}`}
              title="Insertar enlace"
            >
              <span className="material-symbols-outlined text-lg">link</span>
            </button>
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} className="h-full prose-editor" />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .prose-editor .ProseMirror {
               height: 100% !important;
               outline: none !important;
               font-family: "Cormorant Garamond", serif;
               font-size: ${20 * (zoom / 100)}px;
               line-height: 1.8;
               color: hsl(var(--foreground) / 0.9);
            }
            .prose-editor .ProseMirror p {
               margin-bottom: 1.2em;
               text-align: justify;
            }
             .prose-editor .ProseMirror p.is-editor-empty:first-child::before {
               content: attr(data-placeholder);
               float: left;
               color: var(--editor-placeholder);
               pointer-events: none;
               height: 0;
               text-indent: 0;
               font-style: italic;
             }
              /* Focus Mode Styling (Highlight matching words on selection) */
              .prose-editor .ProseMirror .focus-match-highlight {
                 background-color: hsl(var(--primary) / 0.18);
                 border-bottom: 2px dashed hsl(var(--primary) / 0.7);
                 border-radius: 2px;
                 padding: 0 1px;
                 color: inherit;
                 transition: background-color 0.2s ease;
              }
              .prose-editor .ProseMirror .focus-match-selected {
                 background-color: hsl(var(--primary) / 0.35);
                 border-bottom: 2px solid hsl(var(--primary));
                 border-radius: 2px;
                 padding: 0 1px;
                 color: inherit;
              }
             /* Estilos de las menciones de Tiptap */
            .prose-editor .ProseMirror .mention {
              font-family: "Outfit", sans-serif;
              font-size: 15px;
            }
            /* Alineaciones de Tiptap */
            .prose-editor .ProseMirror .text-align-left {
               text-align: left !important;
            }
            .prose-editor .ProseMirror .text-align-center {
               text-align: center !important;
            }
            .prose-editor .ProseMirror .text-align-right {
               text-align: right !important;
            }
            .prose-editor .ProseMirror .text-align-justify {
               text-align: justify !important;
            }
            /* Formatos de texto de Tiptap */
            .prose-editor .ProseMirror u {
               text-decoration: underline !important;
            }
            .prose-editor .ProseMirror s, .prose-editor .ProseMirror del {
               text-decoration: line-through !important;
            }
            .prose-editor .ProseMirror mark {
               background-color: rgba(234, 179, 8, 0.3);
               color: inherit;
               border-radius: 2px;
               padding: 0 2px;
            }
            .prose-editor .ProseMirror a {
               color: hsl(var(--primary)) !important;
               text-decoration: underline !important;
               cursor: pointer;
            }
            .prose-editor .ProseMirror a:hover {
               color: hsl(var(--primary) / 0.8) !important;
            }
            /* Listas */
            .prose-editor .ProseMirror ul {
               list-style-type: disc !important;
               padding-left: 1.5em !important;
               margin-bottom: 1em !important;
            }
            .prose-editor .ProseMirror ol {
               list-style-type: decimal !important;
               padding-left: 1.5em !important;
               margin-bottom: 1em !important;
            }
            .prose-editor .ProseMirror li {
               margin-bottom: 0.25em !important;
            }
            .prose-editor .ProseMirror li p {
               margin-bottom: 0px !important;
               display: inline;
            }
            /* Citas */
            .prose-editor .ProseMirror blockquote {
               border-left: 3px solid hsl(var(--primary) / 0.5) !important;
               padding-left: 1.25em !important;
               font-style: italic !important;
               color: hsl(var(--foreground) / 0.7) !important;
               margin: 1.5em 0 !important;
            }
          `,
        }}
      />
    </div>
  );
};

export default BubbleToolbar;
