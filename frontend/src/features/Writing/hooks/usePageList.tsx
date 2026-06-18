import { useState, useMemo, useCallback } from "react";
import { Hoja } from "@domain/database";

interface UsePageListProps {
  pages: Hoja[];
  searchTerm: string;
  setPageToDelete: (value: { id: number; index: number; error?: string } | null) => void;
  setDeleteModalOpen: (value: boolean) => void;
}

/**
 * 🧠 usePageList
 * Lógica del panel de lista de hojas:
 * - Modo corcho (corkboard) vs lista
 * - Filtrado de páginas por término de búsqueda
 * - Callback de borrado con guard de "última hoja"
 *
 * Extraído de WritingView.tsx para separar responsabilidades.
 */
export const usePageList = ({
  pages,
  searchTerm,
  setPageToDelete,
  setDeleteModalOpen,
}: UsePageListProps) => {
  const [isCorkboardMode, setIsCorkboardMode] = useState(false);

  const filteredPages = useMemo(() => {
    return pages.filter(
      (p) =>
        (p.titulo || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.contenido || "").toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [pages, searchTerm]);

  const deletePage = useCallback(
    (e: React.MouseEvent, id: number, index: number) => {
      e.stopPropagation();
      // Si sólo hay una página, mostrar aviso en lugar de borrar
      const isLastPage = pages.length <= 1;
      isLastPage
        ? (() => {
            setPageToDelete({ id, index, error: "one_page" });
            setDeleteModalOpen(true);
          })()
        : (() => {
            setPageToDelete({ id, index });
            setDeleteModalOpen(true);
          })();
    },
    [pages.length, setPageToDelete, setDeleteModalOpen],
  );

  return {
    isCorkboardMode,
    setIsCorkboardMode,
    filteredPages,
    deletePage,
  };
};
