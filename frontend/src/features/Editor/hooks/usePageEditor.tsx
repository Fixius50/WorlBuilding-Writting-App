import { useEditor } from "@tiptap/react";
import { useRef, useEffect } from "react";
import { getZenExtensions } from "@utils/TiptapExtensions";
import { Hoja, Entidad } from "@domain/database";
import { CommentAnchorRange } from "@utils/commentAnchors";
import { TextSelection, EditorState } from "@tiptap/pm/state";
import { Mark } from "@tiptap/pm/model";

const CARET_SAFE_MARGIN_PX = 180;
const CARET_HEADER_GUARD_SCROLL_TOP_PX = 140;
const CARET_MIN_DYNAMIC_MARGIN_PX = 72;
const CARET_SCROLL_PADDING_PX = 18;

const keepCaretVisibleWithMargin = (editorInstance: {
  state: EditorState;
  view: {
    dom: HTMLElement;
    coordsAtPos: (pos: number) => { top: number; bottom: number };
  };
}): void => {
  const scrollContainer = editorInstance.view.dom.closest(
    ".prose-editor-wrapper",
  ) as HTMLElement | null;

  if (!scrollContainer) {
    return;
  }

  window.requestAnimationFrame(() => {
    const anchorPos = editorInstance.state.selection.$anchor.pos;
    const coords = editorInstance.view.coordsAtPos(anchorPos);
    const containerRect = scrollContainer.getBoundingClientRect();
    const maxAllowedMargin = Math.max(
      CARET_MIN_DYNAMIC_MARGIN_PX,
      Math.floor(containerRect.height / 2) - 80,
    );
    const effectiveMargin = Math.min(CARET_SAFE_MARGIN_PX, maxAllowedMargin);
    const safeTop = containerRect.top + effectiveMargin;
    const safeBottom = containerRect.bottom - effectiveMargin;

    const shouldProtectHeaderZone =
      scrollContainer.scrollTop < CARET_HEADER_GUARD_SCROLL_TOP_PX;

    if (shouldProtectHeaderZone && coords.top < safeTop) {
      return;
    }

    if (coords.top < safeTop) {
      const delta = safeTop - coords.top + CARET_SCROLL_PADDING_PX;
      scrollContainer.scrollTop = Math.max(0, scrollContainer.scrollTop - delta);
      return;
    }

    if (coords.bottom > safeBottom) {
      const delta = coords.bottom - safeBottom + CARET_SCROLL_PADDING_PX;
      scrollContainer.scrollTop = scrollContainer.scrollTop + delta;
    }
  });
};

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

const isApplyAllShortcut = (event: KeyboardEvent | React.KeyboardEvent): boolean => {
  const isCtrlOrCmd = event.ctrlKey || event.metaKey;
  const keyLower = event.key.toLowerCase();
  const isKeyD = event.code === "KeyD" || keyLower === "d";
  const isKeyL = event.code === "KeyL" || keyLower === "l";

  const isApplyAllByPrimaryD =
    isCtrlOrCmd && !event.shiftKey && !event.altKey && isKeyD;
  const isApplyAllByShiftD = isCtrlOrCmd && event.shiftKey && isKeyD;
  const isApplyAllByShiftL = isCtrlOrCmd && event.shiftKey && isKeyL;

  return isApplyAllByPrimaryD || isApplyAllByShiftD || isApplyAllByShiftL;
};

const isApplyNextShortcut = (event: KeyboardEvent | React.KeyboardEvent): boolean => {
  const isCtrlOrCmd = event.ctrlKey || event.metaKey;
  const keyLower = event.key.toLowerCase();
  const isKeyD = event.code === "KeyD" || keyLower === "d";
  return isCtrlOrCmd && event.altKey && !event.shiftKey && isKeyD;
};

const handleWritingShortcut = (
  state: EditorState,
  event: KeyboardEvent | React.KeyboardEvent,
): { handled: boolean; tr?: EditorState["tr"] } => {
  const getMarksFromSelection = (): Mark[] => {
    const { from, to } = state.selection;
    const selectedMarksMap = new Map<string, Mark>();

    state.doc.nodesBetween(from, to, (node) => {
      if (!node.isText) {
        return true;
      }

      node.marks.forEach((mark) => {
        const key = `${mark.type.name}:${JSON.stringify(mark.attrs || {})}`;
        selectedMarksMap.set(key, mark);
      });

      return true;
    });

    const marks = Array.from(selectedMarksMap.values());
    const storedMarks = state.storedMarks ? [...state.storedMarks] : [];
    return marks.length > 0 ? marks : storedMarks;
  };

  if (isApplyAllShortcut(event)) {
    const { from, to, empty } = state.selection;

    if (empty) {
      return { handled: true };
    }

    const selectedText = state.doc.textBetween(from, to, " ").trim();
    if (selectedText.length === 0) {
      return { handled: true };
    }

    const marksToApply = getMarksFromSelection();

    if (marksToApply.length === 0) {
      return { handled: true };
    }

    const matches = findAllMatches(state, selectedText);
    if (matches.length === 0) {
      return { handled: true };
    }

    const tr = matches.reduce((acc, match) => {
      marksToApply.forEach((mark) => {
        acc.addMark(match.from, match.to, mark);
      });
      return acc;
    }, state.tr);

    return { handled: true, tr };
  }

  if (isApplyNextShortcut(event)) {
    const { from, to, empty } = state.selection;

    if (empty) {
      return { handled: true };
    }

    const selectedText = state.doc.textBetween(from, to, " ").trim();
    if (selectedText.length === 0) {
      return { handled: true };
    }

    const marksToApply = getMarksFromSelection();

    const nextMatch = findNextMatch(state, selectedText, from);
    if (!nextMatch) {
      return { handled: true };
    }

    const withMarks = marksToApply.reduce((acc, mark) => {
      acc.addMark(nextMatch.from, nextMatch.to, mark);
      return acc;
    }, state.tr);

    const tr = withMarks.setSelection(
      TextSelection.create(state.doc, nextMatch.from, nextMatch.to),
    );

    return { handled: true, tr };
  }

  return { handled: false };
};

interface UsePageEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  focusMode?: boolean;
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
  focusMode = false,
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
      keepCaretVisibleWithMargin(editor);
    },
    onSelectionUpdate: ({ editor }) => {
      const { from, to, empty } = editor.state.selection;
      keepCaretVisibleWithMargin(editor);
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
        style: `font-family: "Cormorant Garamond", serif;`,
      },
      handleClick: (view, pos, event) => {
        const target = event.target as HTMLElement;
        const mention = target.closest(".mention");
        const id = mention ? mention.getAttribute("data-id") : null;
        const anchor = target.closest("a[href]") as HTMLAnchorElement | null;

        if (anchor) {
          const href = (anchor.getAttribute("href") || "").trim();
          if (href.length > 0) {
            const hasProtocol = /^https?:\/\//i.test(href);
            const targetUrl = hasProtocol ? href : `https://${href}`;
            window.open(targetUrl, "_blank", "noopener,noreferrer");
            return true;
          }
        }

        return mention && id && onMentionClick
          ? (onMentionClick(id), true)
          : false;
      },
      handleKeyDown: (view, event) => {
        const isWritingShortcut =
          isApplyAllShortcut(event) || isApplyNextShortcut(event);

        if (!focusMode && isWritingShortcut) {
          return false;
        }

        if (!isWritingShortcut) {
          return false;
        }

        const result = handleWritingShortcut(view.state, event);
        result.tr ? view.dispatch(result.tr.scrollIntoView()) : null;
        event.preventDefault();
        return result.handled;
      },
    },
  });

  useEffect(() => {
    if (!editor) {
      return;
    }

    const onGlobalKeyDown = (event: KeyboardEvent): void => {
      if (!focusMode) {
        return;
      }

      if (!editor.isFocused) {
        return;
      }

      const isWritingShortcut =
        isApplyAllShortcut(event) || isApplyNextShortcut(event);

      if (!isWritingShortcut) {
        return;
      }

      const result = handleWritingShortcut(editor.state, event);
      if (result.tr) {
        editor.view.dispatch(result.tr.scrollIntoView());
      }

      if (result.handled) {
        event.preventDefault();
        event.stopPropagation();
      }
    };

    window.addEventListener("keydown", onGlobalKeyDown, true);
    return () => {
      window.removeEventListener("keydown", onGlobalKeyDown, true);
    };
  }, [editor, focusMode]);

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
