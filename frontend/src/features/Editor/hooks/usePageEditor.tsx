import { useEditor } from "@tiptap/react";
import { useRef, useEffect } from "react";
import { getZenExtensions } from "@utils/TiptapExtensions";
import { Hoja, Entidad } from "@domain/database";
import { CommentAnchorRange } from "@utils/commentAnchors";

interface UsePageEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  autoFocus?: boolean;
  onMentionClick?: (id: string) => void;
  projectEntities?: Entidad[];
  onSuggestLink?: (
    entity: Entidad,
    range: { from: number; to: number },
  ) => void;
  onSelectionChange?: (
    selection: {
      text: string;
      from: number;
      to: number;
    } | null,
  ) => void;
  commentAnchors?: CommentAnchorRange[];
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
  onSelectionChange,
  commentAnchors = [],
}: UsePageEditorProps) => {
  const skipExternalSyncUntilRef = useRef<number>(0);
  const knownHtmlRef = useRef<string>(content);
  const onUpdateRef = useRef<(html: string) => void>(onUpdate);

  useEffect(() => {
    knownHtmlRef.current = content;
  }, [content]);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  const editor = useEditor({
    extensions: getZenExtensions("Empieza a escribir esta página...", {
      entities: projectEntities,
      onSuggestLink,
    }),
    content: content,
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      knownHtmlRef.current = html;
      onUpdateRef.current(html);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to, empty } = editor.state.selection;
      empty
        ? onSelectionChange
          ? onSelectionChange(null)
          : null
        : (() => {
            const selectedText = editor.state.doc
              .textBetween(from, to, " ")
              .trim();
            selectedText.length > 0
              ? onSelectionChange
                ? onSelectionChange({ text: selectedText, from, to })
                : null
              : onSelectionChange
                ? onSelectionChange(null)
                : null;
          })();
    },
    onCreate: ({ editor }) => {
      autoFocus ? setTimeout(() => editor.commands.focus("start"), 10) : null;

      const originalDispatch = editor.view.dispatch.bind(editor.view);
      editor.view.dispatch = (tr) => {
        const isImageMutation = !!tr.getMeta("wb:imageMutation");

        if (isImageMutation) {
          skipExternalSyncUntilRef.current = Date.now() + 220;
        }

        originalDispatch(tr);
      };
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
    const hasEditor = !!editor;
    const isBlockedByRecentImageMutation =
      Date.now() < skipExternalSyncUntilRef.current;
    const shouldUpdate =
      hasEditor &&
      content !== knownHtmlRef.current &&
      content !== editor.getHTML() &&
      !isBlockedByRecentImageMutation;

    shouldUpdate && editor ? editor.commands.setContent(content, false) : null;
  }, [content, editor]);

  useEffect(() => {
    const onWindowError = (event: ErrorEvent) => {
      const message = String(event.message || "");
      const isInsertBeforeError = message.includes("insertBefore");

      if (isInsertBeforeError && editor) {
        const selection = editor.state.selection;
        console.error("[EditorRuntimeError:insertBefore]", {
          message,
          selectionFrom: selection.from,
          selectionTo: selection.to,
          selectionType: selection.constructor.name,
        });
      }
    };

    window.addEventListener("error", onWindowError);
    return () => window.removeEventListener("error", onWindowError);
  }, [editor]);

  useEffect(() => {
    autoFocus && editor && !editor.isFocused
      ? editor.commands.focus("start")
      : null;
  }, [autoFocus, editor]);

  useEffect(() => {
    editor ? editor.commands.setCommentAnchors(commentAnchors) : null;
  }, [commentAnchors, editor]);

  return { editor };
};

// Re-exportar tipo Hoja para conveniencia de otros módulos que lo necesiten
export type { Hoja };
