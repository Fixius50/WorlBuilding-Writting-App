import React from "react";
import { Editor, ReactRenderer } from "@tiptap/react";
import tippy, { type Instance as TippyInstance } from "tippy.js";
import { useReactToPrint } from "react-to-print";
import EditorTopBar from "./EditorTopBar";
import BubbleToolbar from "./BubbleToolbar";
import AutoLinkPrompt from "./AutoLinkPrompt";
import { Hoja as HojaModel, Entidad } from "@domain/database";
import { usePageEditor } from "../hooks/usePageEditor";

interface ZenEditorProps {
  pages: HojaModel[];
  currentPageIndex: number;
  onUpdate: (html: string, index?: number) => void;
  onTitleChange: (index: number, newTitle: string) => void;
  onCreatePage: () => void;
  onAutoDeletePage: (index: number) => void;
  onSnapshot: (html: string) => void;
  snapshots?: { id: number; timestamp: string }[];
  onRestoreSnapshot?: (id: number) => void;
  onMentionClick?: (id: string) => void;
  minimal?: boolean;
  notebookTitle?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  projectEntities?: Entidad[];
}

const ZenEditor: React.FC<ZenEditorProps> = ({
  pages,
  currentPageIndex,
  onUpdate,
  onTitleChange,
  onSnapshot,
  snapshots = [],
  onRestoreSnapshot = () => {},
  onMentionClick,
  minimal = false,
  notebookTitle,
  sidebarOpen = true,
  onToggleSidebar,
  projectEntities = [],
}) => {
  const currentPage = pages[currentPageIndex];
  const [zoom, setZoom] = React.useState(100);
  const [focusMode, setFocusMode] = React.useState(false);
  const printContainerRef = React.useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({
    contentRef: printContainerRef,
    documentTitle: currentPage?.titulo || `Hoja ${currentPageIndex + 1}`,
  });
  const [activeLinkSuggestion, setActiveLinkSuggestion] = React.useState<{
    entity: Entidad;
    range: { from: number; to: number };
    rect: DOMRect;
  } | null>(null);

  // Tipado estricto: Instance es la forma singular de la instancia de tippy
  const tippyInstanceRef = React.useRef<TippyInstance | null>(null);

  // Ref para romper la dependencia circular entre editor y onSuggestLink
  const onSuggestLinkRef = React.useRef<((entity: Entidad, range: { from: number; to: number }) => void) | null>(null);

  const { editor } = usePageEditor({
    content: currentPage ? (currentPage.contenido || "") : "",
    onUpdate: (html) => onUpdate(html, currentPageIndex),
    autoFocus: true,
    onMentionClick,
    projectEntities,
    onSuggestLink: (entity, range) =>
      onSuggestLinkRef.current ? onSuggestLinkRef.current(entity, range) : null,
  });

  const onSuggestLink = React.useCallback(
    (entity: Entidad, range: { from: number; to: number }) => {
      const isEditorActive = editor && !editor.isDestroyed;
      isEditorActive ? (() => {
        const view = editor.view;
        const startCoords = view.coordsAtPos(range.from);
        const endCoords = view.coordsAtPos(range.to);
        const rect = {
          left: startCoords.left,
          right: endCoords.right,
          top: startCoords.top,
          bottom: endCoords.bottom,
          width: endCoords.right - startCoords.left,
          height: endCoords.bottom - startCoords.top,
          x: startCoords.left,
          y: startCoords.top,
          toJSON: () => {},
        } as DOMRect;
        setActiveLinkSuggestion({ entity, range, rect });
      })() : null;
    },
    [editor],
  );

  React.useEffect(() => {
    onSuggestLinkRef.current = onSuggestLink;
  }, [onSuggestLink]);

  // Ocultar la sugerencia cuando el cursor se mueva en el editor
  React.useEffect(() => {
    const isEditorValid = editor && !editor.isDestroyed;
    const cleanup = isEditorValid ? (() => {
      const handleSelection = () => {
        setActiveLinkSuggestion(null);
      };
      editor.on("selectionUpdate", handleSelection);
      return () => {
        editor.off("selectionUpdate", handleSelection);
      };
    })() : undefined;
    return cleanup;
  }, [editor]);

  // Sincronizar Focus Mode (SelectionHighlight) en Tiptap
  React.useEffect(() => {
    const isEditorValid = editor && !editor.isDestroyed;
    isEditorValid ? editor.commands.setSelectionHighlight(focusMode) : null;
  }, [focusMode, editor]);

  // Sincronizar entidades si cambian en el proyecto
  React.useEffect(() => {
    const isEditorValid = editor && !editor.isDestroyed;
    isEditorValid ? editor.commands.setAutoLinkerEntities(projectEntities) : null;
  }, [projectEntities, editor]);

  // Tippy/ReactRenderer para renderizar el tooltip de AutoLinkPrompt de forma virtual
  React.useEffect(() => {
    const isEditorValid = editor && !editor.isDestroyed;
    const hasSuggestion = activeLinkSuggestion !== null && isEditorValid;

    hasSuggestion ? (() => {
      const suggestion = activeLinkSuggestion!;
      const renderer = new ReactRenderer(AutoLinkPrompt, {
        editor: editor!,
        props: {
          entity: suggestion.entity,
          onConfirm: () => {
            editor!.chain().focus().insertContentAt(suggestion.range, {
              type: "mention",
              attrs: {
                id: suggestion.entity.id.toString(),
                label: suggestion.entity.nombre,
              },
            }).run();
            setActiveLinkSuggestion(null);
          },
          onDiscard: () => {
            setActiveLinkSuggestion(null);
          },
        },
      });

      tippyInstanceRef.current = tippy(document.body, {
        getReferenceClientRect: () => suggestion.rect,
        content: renderer.element,
        showOnCreate: true,
        interactive: true,
        trigger: "manual",
        placement: "top",
        onDestroy: () => {
          renderer.destroy();
        },
      });
    })() : (() => {
      tippyInstanceRef.current?.destroy();
      tippyInstanceRef.current = null;
    })();

    return () => {
      tippyInstanceRef.current?.destroy();
      tippyInstanceRef.current = null;
    };
  }, [activeLinkSuggestion, editor]);

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor-elevated select-none">
        <span className="text-xs font-black uppercase tracking-widest text-foreground/20 font-sans">
          Crea una hoja para comenzar
        </span>
      </div>
    );
  }

  const wordCount = currentPage.contenido
    ? currentPage.contenido
        .replace(/<[^>]+>/g, "")
        .trim()
        .split(/\s+/)
        .filter(Boolean).length
    : 0;

  return (
    <div className="flex flex-col w-full h-full bg-editor-base select-text">
      <EditorTopBar
        editor={editor}
        title={currentPage.titulo || `Hoja ${currentPageIndex + 1}`}
        onTitleChange={(newTitle) => onTitleChange(currentPageIndex, newTitle)}
        wordCount={wordCount}
        wordGoal={2000}
        saving={false}
        onManualSnapshot={() => onSnapshot(currentPage.contenido || "")}
        snapshots={snapshots}
        onRestoreSnapshot={onRestoreSnapshot}
        minimal={minimal}
        notebookTitle={notebookTitle}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={onToggleSidebar}
        zoom={zoom}
        onZoomChange={setZoom}
        focusMode={focusMode}
        onToggleFocusMode={() => setFocusMode(!focusMode)}
        onPrint={handlePrint}
      />

      <div className="flex-1 relative overflow-y-auto custom-scrollbar flex justify-center py-12 px-6 prose-editor-wrapper">
        <div 
          ref={printContainerRef}
          className="editor-sheet"
        >
          {/* TÍTULO EDITABLE EN EL PROPIO MANUSCRITO */}
          <input
            value={currentPage.titulo || ""}
            onChange={(e) => onTitleChange(currentPageIndex, e.target.value)}
            className={`w-full bg-transparent border-none text-foreground font-serif font-semibold text-[38px] outline-none focus:ring-0 placeholder:text-foreground/15 transition-opacity duration-300 px-[2.5cm] pt-[2.5cm] pb-4 editor-title-input ${focusMode ? "opacity-30 hover:opacity-100" : "opacity-100"}`}
            placeholder={`Hoja ${currentPageIndex + 1}`}
          />

          {/* CUERPO DEL TEXTO */}
          <div className={focusMode ? "focus-mode-active" : ""}>
            <BubbleToolbar
              editor={editor}
              onMentionClick={onMentionClick}
              zoom={zoom}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZenEditor;
