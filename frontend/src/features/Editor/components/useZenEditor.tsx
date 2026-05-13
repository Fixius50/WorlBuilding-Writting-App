import { useEditor } from '@tiptap/react';
import { useRef, useEffect, useCallback } from 'react';
import { getZenExtensions } from '@utils/TiptapExtensions';

interface UsePageEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  isLastPage: boolean;
  onNearEnd: () => void;
  onJumpNext?: () => void;
  onJumpBack?: () => void;
  onAutoDelete?: () => void;
  autoFocus?: boolean;
}

/**
 * 🧠 usePageEditor
 * Logic for a single page in the manuscript.
 * Handles Tiptap initialization, height detection, and keyboard navigation.
 */
export const usePageEditor = ({
  content,
  onUpdate,
  isLastPage,
  onNearEnd,
  onJumpNext,
  onJumpBack,
  onAutoDelete,
  autoFocus = false
}: UsePageEditorProps) => {
  const lastHeightRef = useRef(0);
  const isDeletingRef = useRef(false);

  const editor = useEditor({
    extensions: getZenExtensions('Empieza a escribir esta página...'),
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
      if (autoFocus) {
        setTimeout(() => editor.commands.focus('start'), 10);
      }
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none text-foreground/90 leading-relaxed text-lg`,
        style: `font-family: "Cormorant Garamond", serif; font-size: 18px;`,
      },
      handleKeyDown: (view, event) => {
        const { selection } = view.state;
        const isAtStart = selection.$from.pos <= 1;
        const isAtEnd = selection.$to.pos === view.state.doc.content.size;
        
        if (event.key === 'Backspace') {
          isDeletingRef.current = true;
          setTimeout(() => { isDeletingRef.current = false; }, 100);
        } else {
          isDeletingRef.current = false;
        }

        if (event.key === 'Tab' || event.key === 'Enter') {
          const height = view.dom.scrollHeight;
          if (height > 950 && isAtEnd && onJumpNext) {
            event.preventDefault();
            onJumpNext();
            return true;
          }
        }

        if (event.key === 'Backspace' && isAtStart) {
          const isEmpty = view.state.doc.textContent.trim().length === 0;
          if (isEmpty && onAutoDelete) {
            event.preventDefault();
            onAutoDelete();
            return true;
          } else if (onJumpBack) {
            event.preventDefault();
            onJumpBack();
            return true;
          }
        }
        return false;
      }
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      if (!editor.isFocused) {
        editor.commands.setContent(content, false);
      }
    }
  }, [content, editor]);

  useEffect(() => {
    if (autoFocus && editor && !editor.isFocused) {
      editor.commands.focus('start');
    }
  }, [autoFocus, editor]);

  return { editor };
};

interface UseZenEditorProps {
  pages: any[];
  onCreatePage: () => void;
}

/**
 * 🧠 useZenEditor
 * Orchestrates the full manuscript editor.
 * Manages page pairs, focus jumping, and auto-creation.
 */
export const useZenEditor = ({ pages, onCreatePage }: UseZenEditorProps) => {
  const [focusedPageIndex, setFocusedPageIndex] = useState<number | null>(null);
  const isCreatingPageRef = useRef(false);

  const handleAutoCreate = useCallback(() => {
    if (isCreatingPageRef.current) return;
    isCreatingPageRef.current = true;
    onCreatePage();
    setTimeout(() => { isCreatingPageRef.current = false; }, 1000);
  }, [onCreatePage]);

  const pagePairs = useMemo(() => {
    const pairs: any[][] = [];
    for (let i = 0; i < pages.length; i += 2) {
      pairs.push(pages.slice(i, i + 2));
    }
    return pairs;
  }, [pages]);

  const handleJumpNext = useCallback((currentIndex: number) => {
    if (currentIndex < pages.length - 1) {
      setFocusedPageIndex(currentIndex + 1);
    } else {
      handleAutoCreate();
      setFocusedPageIndex(currentIndex + 1);
    }
  }, [pages.length, handleAutoCreate]);

  const handleJumpBack = useCallback((currentIndex: number) => {
    if (currentIndex > 0) {
      setFocusedPageIndex(currentIndex - 1);
    }
  }, []);

  return {
    focusedPageIndex,
    setFocusedPageIndex,
    handleAutoCreate,
    pagePairs,
    handleJumpNext,
    handleJumpBack
  };
};

// Auxiliary to avoid importing useState from react-router or similar
import { useState, useMemo } from 'react';
