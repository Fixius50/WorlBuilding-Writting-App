import { useEditor } from "@tiptap/react";
import { useRef, useEffect } from "react";
import { getZenExtensions } from "@utils/TiptapExtensions";
import { Hoja, Entidad } from "@domain/database";
import { CommentAnchorRange } from "@utils/commentAnchors";
import { TextSelection, EditorState } from "@tiptap/pm/state";

const findNextMatch = (
  state: EditorState,
  query: string,
  currentFrom: number,
): { from: number; to: number } | null => {
  const matches: Array<{ from: number; to: number }> = [];
  const lowerQuery = query.toLowerCase();

  state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text || node.text.length === 0) {
      return true;
    }

    const text = node.text;
    const lowerText = text.toLowerCase();
    let index = lowerText.indexOf(lowerQuery);
    while (index !== -1) {
      const from = pos + index;
      const to = from + query.length;
      matches.push({ from, to });
      index = lowerText.indexOf(lowerQuery, index + query.length);
    }

    return true;
  });

  if (matches.length === 0) {
    return null;
  }

  const next = matches.find((match) => match.from > currentFrom);
  return next || matches[0];
};

const findAllMatches = (
  state: EditorState,
  query: string,
): Array<{ from: number; to: number }> => {
  const matches: Array<{ from: number; to: number }> = [];
  const lowerQuery = query.toLowerCase();

  state.doc.descendants((node, pos) => {
    if (!node.isText || !node.text || node.text.length === 0) {
      return true;
    }

    const text = node.text;
    const lowerText = text.toLowerCase();
    let index = lowerText.indexOf(lowerQuery);
    while (index !== -1) {
      const from = pos + index;
      const to = from + query.length;
      matches.push({ from, to });
      index = lowerText.indexOf(lowerQuery, index + query.length);
    }

    return true;
  });

  return matches;
};

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
        const isCtrlOrCmd = event.ctrlKey || event.metaKey;
        const keyLower = event.key.toLowerCase();
        const isKeyD = event.code === "KeyD" || keyLower === "d";
        const isKeyL = event.code === "KeyL" || keyLower === "l";
        const isApplyAllByShiftD = isCtrlOrCmd && event.shiftKey && isKeyD;
        const isApplyAllByShiftL = isCtrlOrCmd && event.shiftKey && isKeyL;
        const isApplyAllByAltD = isCtrlOrCmd && event.altKey && isKeyD;
        const isApplyAllMatchesShortcut =
          isApplyAllByShiftD || isApplyAllByShiftL || isApplyAllByAltD;
        const isSelectNextShortcut =
          isCtrlOrCmd && !event.shiftKey && !event.altKey && isKeyD;

        if (isApplyAllMatchesShortcut) {
          const { state } = view;
          const { from, to, empty } = state.selection;

          if (empty) {
            return false;
          }

          const selectedText = state.doc.textBetween(from, to, " ").trim();
          if (selectedText.length === 0) {
            return false;
          }

          const selectionMarks =
            state.selection.$from.marksAcross(state.selection.$to) ||
            state.selection.$from.marks();
          const marksToApply =
            selectionMarks.length > 0
              ? selectionMarks
              : state.storedMarks || [];

          if (marksToApply.length === 0) {
            event.preventDefault();
            return true;
          }

          const matches = findAllMatches(state, selectedText);
          if (matches.length === 0) {
            event.preventDefault();
            return true;
          }

          const tr = matches.reduce((acc, match) => {
            marksToApply.forEach((mark) => {
              acc.addMark(match.from, match.to, mark);
            });
            return acc;
          }, state.tr);

          view.dispatch(tr.scrollIntoView());
          event.preventDefault();
          return true;
        }

        if (!isSelectNextShortcut) {
          return false;
        }

        const { state } = view;
        const { from, to, empty } = state.selection;

        if (empty) {
          return false;
        }

        const selectedText = state.doc.textBetween(from, to, " ").trim();
        if (selectedText.length === 0) {
          return false;
        }

        const selectionMarks =
          state.selection.$from.marksAcross(state.selection.$to) ||
          state.selection.$from.marks();
        const marksToApply =
          selectionMarks.length > 0
            ? selectionMarks
            : state.storedMarks || [];

        const nextMatch = findNextMatch(state, selectedText, from);
        if (!nextMatch) {
          event.preventDefault();
          return true;
        }

        const withMarks = marksToApply.reduce((acc, mark) => {
          acc.addMark(nextMatch.from, nextMatch.to, mark);
          return acc;
        }, state.tr);

        const tr = withMarks.setSelection(
          TextSelection.create(state.doc, nextMatch.from, nextMatch.to),
        );
        view.dispatch(tr.scrollIntoView());
        event.preventDefault();
        return true;
      },
    },
  });

  useEffect(() => {
    const hasEditor = !!editor;
    const isBlockedByRecentImageMutation =
      Date.now() < skipExternalSyncUntilRef.current;
    const shouldUpdate =
      hasEditor &&
      content !== editor.getHTML() &&
      !isBlockedByRecentImageMutation;

    shouldUpdate && editor
      ? (() => {
          editor.commands.setContent(content, false);
          knownHtmlRef.current = content;
        })()
      : null;
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
