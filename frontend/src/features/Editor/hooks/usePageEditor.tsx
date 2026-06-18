import { useEditor } from "@tiptap/react";
import { useRef, useEffect } from "react";
import { getZenExtensions } from "@utils/TiptapExtensions";
import { Hoja, Entidad } from "@domain/database";

interface UsePageEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  isLastPage: boolean;
  onNearEnd: () => void;
  onJumpNext?: () => void;
  onJumpBack?: () => void;
  onAutoDelete?: () => void;
  autoFocus?: boolean;
  onMentionClick?: (id: string) => void;
  projectEntities?: Entidad[];
  onSuggestLink?: (entity: Entidad, range: { from: number; to: number }) => void;
}

/**
 * 🧠 usePageEditor
 * Logic for a single page in the manuscript.
 * Handles Tiptap initialization, height detection, and keyboard navigation.
 *
 * Extraído de useZenEditor.tsx para separar responsabilidades.
 */
export const usePageEditor = ({
  content,
  onUpdate,
  isLastPage,
  onNearEnd,
  onJumpNext,
  onJumpBack,
  onAutoDelete,
  autoFocus = false,
  onMentionClick,
  projectEntities = [],
  onSuggestLink,
}: UsePageEditorProps) => {
  const lastHeightRef = useRef(0);
  const isDeletingRef = useRef(false);

  const editor = useEditor({
    extensions: getZenExtensions("Empieza a escribir esta página...", {
      entities: projectEntities,
      onSuggestLink,
    }),
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());

      if (isLastPage && !isDeletingRef.current) {
        const height = editor.view.dom.scrollHeight;
        if (height > 900 && height > lastHeightRef.current) {
          onNearEnd();
        }
        lastHeightRef.current = height;
      }
    },
    onCreate: ({ editor }) => {
      autoFocus
        ? setTimeout(() => editor.commands.focus("start"), 10)
        : null;
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none text-foreground/90 leading-relaxed text-lg`,
        style: `font-family: "Cormorant Garamond", serif; font-size: 18px;`,
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        const mention = target.closest(".mention");
        const id = mention ? mention.getAttribute("data-id") : null;

        return mention && id && onMentionClick
          ? (onMentionClick(id), true)
          : false;
      },
      handleKeyDown: (view, event) => {
        const { selection } = view.state;
        const isAtStart = selection.$from.pos <= 1;
        const isAtEnd = selection.$to.pos === view.state.doc.content.size;

        // Marcar que se está borrando para evitar auto-creación
        isDeletingRef.current = event.key === "Backspace";
        event.key !== "Backspace"
          ? (isDeletingRef.current = false)
          : setTimeout(() => { isDeletingRef.current = false; }, 100);

        // Navegación Tab/Enter → saltar a la siguiente hoja
        const isTabOrEnter = event.key === "Tab" || event.key === "Enter";
        const shouldJumpNext =
          isTabOrEnter && view.dom.scrollHeight > 950 && isAtEnd && !!onJumpNext;

        // Navegación Backspace → borrar hoja vacía o saltar a la anterior
        const isBackspaceAtStart = event.key === "Backspace" && isAtStart;
        const isEmpty = view.state.doc.textContent.trim().length === 0;
        const shouldAutoDelete = isBackspaceAtStart && isEmpty && !!onAutoDelete;
        const shouldJumpBack = isBackspaceAtStart && !isEmpty && !!onJumpBack;

        switch (true) {
          case shouldJumpNext:
            event.preventDefault();
            onJumpNext!();
            return true;
          case shouldAutoDelete:
            event.preventDefault();
            onAutoDelete!();
            return true;
          case shouldJumpBack:
            event.preventDefault();
            onJumpBack!();
            return true;
          default:
            return false;
        }
      },
    },
  });

  useEffect(() => {
    const shouldUpdate = editor && content !== editor.getHTML();
    shouldUpdate && editor
      ? editor.commands.setContent(content, false)
      : null;
  }, [content, editor]);

  useEffect(() => {
    autoFocus && editor && !editor.isFocused
      ? editor.commands.focus("start")
      : null;
  }, [autoFocus, editor]);

  return { editor };
};

// Re-exportar tipo Hoja para conveniencia de otros módulos que lo necesiten
export type { Hoja };
