import { useState, useMemo, useRef, useCallback } from "react";
import { Hoja } from "@domain/database";

interface UseZenEditorProps {
  pages: Hoja[];
  onCreatePage: () => void;
}

/**
 * 🧠 useZenEditor
 * Orchestrates the full manuscript editor.
 * Manages page pairs, focus jumping, and auto-creation.
 *
 * Nota: usePageEditor se ha separado a su propio fichero (usePageEditor.tsx).
 */
export const useZenEditor = ({ pages, onCreatePage }: UseZenEditorProps) => {
  const [focusedPageIndex, setFocusedPageIndex] = useState<number | null>(null);
  const isCreatingPageRef = useRef(false);

  const handleAutoCreate = useCallback(() => {
    // Guard: evitar creación duplicada en un ciclo corto
    const shouldCreate = !isCreatingPageRef.current;
    shouldCreate ? (() => {
      isCreatingPageRef.current = true;
      onCreatePage();
      setTimeout(() => {
        isCreatingPageRef.current = false;
      }, 1000);
    })() : null;
  }, [onCreatePage]);

  const pagePairs = useMemo(() => {
    const pairs: Hoja[][] = [];
    for (let i = 0; i < pages.length; i += 2) {
      pairs.push(pages.slice(i, i + 2));
    }
    return pairs;
  }, [pages]);

  const handleJumpNext = useCallback(
    (currentIndex: number) => {
      if (currentIndex < pages.length - 1) {
        setFocusedPageIndex(currentIndex + 1);
      } else {
        handleAutoCreate();
        setFocusedPageIndex(currentIndex + 1);
      }
    },
    [pages.length, handleAutoCreate],
  );

  const handleJumpBack = useCallback((currentIndex: number) => {
    currentIndex > 0 ? setFocusedPageIndex(currentIndex - 1) : null;
  }, []);

  return {
    focusedPageIndex,
    setFocusedPageIndex,
    handleAutoCreate,
    pagePairs,
    handleJumpNext,
    handleJumpBack,
  };
};
