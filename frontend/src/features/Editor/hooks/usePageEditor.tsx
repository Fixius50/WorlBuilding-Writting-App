import { useEditor } from "@tiptap/react";
import { useRef, useEffect } from "react";
import { getZenExtensions } from "@utils/TiptapExtensions";
import { Hoja, Entidad } from "@domain/database";

interface UsePageEditorProps {
  content: string;
  onUpdate: (html: string) => void;
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
  autoFocus = false,
  onMentionClick,
  projectEntities = [],
  onSuggestLink,
}: UsePageEditorProps) => {
  const editor = useEditor({
    extensions: getZenExtensions("Empieza a escribir esta página...", {
      entities: projectEntities,
      onSuggestLink,
    }),
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
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
        return false;
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
