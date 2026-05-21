import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Cuaderno, Hoja } from "@domain/models/database";
import { WritingUseCase } from "@application/useCases/WritingUseCase";
import { EntityUseCase } from "@application/useCases/EntityUseCase";
import { useSettingsStore } from "@store/useSettingsStore";

/**
 * 🧠 useWritingView
 * Logic for managing a notebook: loading pages, saving content,
 * handling snapshots, and coordinating with the RightPanel.
 */
export const useWritingView = () => {
  const { notebookId } = useParams();
  const navigate = useNavigate();

  const openPanel = (_mode: string, _id?: number, _title?: string) => {
    // Panel derecho eliminado: antes abría entidad o contenedor contextual de archivador.
  };
  const setCustomContent = (_content: unknown, _title?: unknown) => {
    // Panel derecho eliminado: antes inyectaba UI lateral de archivador.
  };

  const [notebook, setNotebook] = useState<Cuaderno | null>(null);
  const [pages, setPages] = useState<Hoja[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [pageToDelete, setPageToDelete] = useState<{
    id: number;
    index: number;
    error?: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [snapshots, setSnapshots] = useState<
    { id: number; timestamp: string; contenido: string }[]
  >([]);

  const saveTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pagesRef = useRef(pages);
  const indexRef = useRef(currentPageIndex);
  const isMounted = useRef(true);

  const [activeTab, setActiveTab] = useState<"index" | "format">("index");
  const [editingPageId, setEditingPageId] = useState<number | null>(null);

  useEffect(() => {
    pagesRef.current = pages;
  }, [pages]);
  useEffect(() => {
    indexRef.current = currentPageIndex;
  }, [currentPageIndex]);

  const loadSnapshots = useCallback(async (hojaId: number) => {
    try {
      const list = await WritingUseCase.getSnapshots(hojaId);
      setSnapshots(list);
    } catch (err) {
      useSettingsStore
        .getState()
        .addNotification("Error al cargar instantáneas", "error");
    }
  }, []);

  const loadNotebookAndPages = useCallback(
    async (id: number) => {
      try {
        setLoading(true);
        const nb = await WritingUseCase.getNotebookById(id);
        setNotebook(nb);

        const pgs = await WritingUseCase.getPages(id);
        if (pgs && pgs.length > 0) {
          setPages(pgs);
          setCurrentPageIndex(0);
          loadSnapshots(pgs[0].id);
        } else {
          const newPage = await WritingUseCase.createPage(id);
          setPages([newPage]);
          setCurrentPageIndex(0);
          loadSnapshots(newPage.id);
        }
      } catch (err) {
        useSettingsStore
          .getState()
          .addNotification("Error al cargar archivador", "error");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    },
    [navigate, loadSnapshots],
  );

  useEffect(() => {
    // Panel derecho eliminado: antes abría pestaña contextual "Archivador".
    if (notebookId) {
      loadNotebookAndPages(Number(notebookId));
    }
  }, [notebookId, loadNotebookAndPages]);

  const savePage = useCallback(async (page: Hoja) => {
    if (isMounted.current) setSaving(true);
    try {
      await WritingUseCase.updatePage(page.id, {
        contenido: page.contenido || "",
        titulo: page.titulo || "",
      });
    } catch (err) {
      // Error handling
    } finally {
      if (isMounted.current) setSaving(false);
    }
  }, []);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
        const currentPage = pagesRef.current[indexRef.current];
        if (currentPage) {
          WritingUseCase.updatePage(currentPage.id, {
            contenido: currentPage.contenido || "",
            titulo: currentPage.titulo || "",
          }).catch(() => {});
        }
      }
    };
  }, []);

  const handleContentChange = useCallback(
    (newContent: string, index?: number) => {
      const targetIndex = index !== undefined ? index : indexRef.current;
      setPages((prev) => {
        if (!prev[targetIndex]) return prev;
        const updated = [...prev];
        updated[targetIndex] = {
          ...updated[targetIndex],
          contenido: newContent,
        };

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
          savePage(updated[targetIndex]);
        }, 800);

        return updated;
      });
    },
    [savePage],
  );

  const handleSnapshot = useCallback(
    async (html: string) => {
      const currentPage = pagesRef.current[indexRef.current];
      if (!currentPage) return;
      try {
        await WritingUseCase.createSnapshot(currentPage.id, html);
        await loadSnapshots(currentPage.id);
      } catch (err) {
        useSettingsStore
          .getState()
          .addNotification("Error al crear instantánea", "error");
      }
    },
    [loadSnapshots],
  );

  const handleMentionClick = useCallback(
    async (id: string) => {
      try {
        const entity = await EntityUseCase.getById(Number(id));
        if (entity) {
          openPanel("entity", Number(id), entity.nombre);
        }
      } catch (err) {
        useSettingsStore
          .getState()
          .addNotification("Error al cargar entidad", "error");
      }
    },
    [openPanel],
  );

  const handleRestoreSnapshot = useCallback(
    async (snapshotId: number) => {
      const snap = snapshots.find((s) => s.id === snapshotId);
      if (!snap) return;

      if (
        !window.confirm(
          "¿Estás seguro de restaurar esta versión? Se perderá el contenido actual no guardado.",
        )
      )
        return;

      setPages((prev) => {
        const updated = [...prev];
        updated[indexRef.current] = {
          ...updated[indexRef.current],
          contenido: snap.contenido,
        };
        savePage(updated[indexRef.current]);
        return updated;
      });
      alert("Versión restaurada con éxito.");
    },
    [snapshots, savePage],
  );

  const handleTitleChangeInternal = useCallback(
    (index: number, newTitle: string) => {
      setPages((prev) => {
        const updated = [...prev];
        updated[index] = { ...updated[index], titulo: newTitle };

        if (saveTimeout.current) clearTimeout(saveTimeout.current);
        saveTimeout.current = setTimeout(() => {
          savePage(updated[index]);
        }, 800);

        return updated;
      });
    },
    [savePage],
  );

  const handleCreatePage = useCallback(async () => {
    if (!notebook) return;
    try {
      const newPage = await WritingUseCase.createPage(notebook.id);
      setPages((prev) => [...prev, newPage]);
    } catch (err) {
      // Error handling
    }
  }, [notebook]);

  const handleAutoDeletePage = useCallback(async (index: number) => {
    if (index < 2) return;

    try {
      const pageId = pagesRef.current[index]?.id;
      if (!pageId) return;
      await WritingUseCase.deletePage(pageId);
      setPages((prev) => {
        const newPages = prev.filter((_, i) => i !== index);
        if (indexRef.current >= index) {
          setCurrentPageIndex(Math.max(0, index - 1));
        }
        return newPages;
      });
    } catch (err) {
      // Error handling
    }
  }, []);

  const handlePageSelect = useCallback(
    async (index: number) => {
      if (saveTimeout.current) {
        clearTimeout(saveTimeout.current);
        const cp = pagesRef.current[indexRef.current];
        if (cp) await savePage(cp);
      }
      setCurrentPageIndex(index);
      loadSnapshots(pagesRef.current[index].id);
    },
    [savePage, loadSnapshots],
  );

  const confirmDeletePage = useCallback(async () => {
    if (!pageToDelete) return;
    const { id, index } = pageToDelete;
    try {
      await WritingUseCase.deletePage(id);
      setPages((prev) => {
        const newPages = prev.filter((p) => p.id !== id);
        let nextIndex = indexRef.current;
        if (indexRef.current === index) {
          nextIndex = Math.max(0, index - 1);
        } else if (indexRef.current > index) {
          nextIndex = indexRef.current - 1;
        }
        setCurrentPageIndex(nextIndex);
        return newPages;
      });
    } catch (err) {
      // Error
    } finally {
      setDeleteModalOpen(false);
      setPageToDelete(null);
    }
  }, [pageToDelete]);

  return {
    notebook,
    pages,
    currentPageIndex,
    saving,
    loading,
    deleteModalOpen,
    setDeleteModalOpen,
    pageToDelete,
    setPageToDelete,
    searchTerm,
    setSearchTerm,
    snapshots,
    activeTab,
    setActiveTab,
    editingPageId,
    setEditingPageId,
    handleContentChange,
    handleSnapshot,
    handleMentionClick,
    handleRestoreSnapshot,
    handleTitleChangeInternal,
    handleCreatePage,
    handleAutoDeletePage,
    handlePageSelect,
    confirmDeletePage,
    setCustomContent,
  };
};
