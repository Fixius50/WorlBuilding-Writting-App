import React from "react";
import { Hoja } from "@domain/database";
import { Switch } from "@components";
import WritingCommentsPanel from "./WritingCommentsPanel";
import { CommentAnchorRange } from "@utils/commentAnchors";

type SectionKey = "pages" | "comments";

interface OutlineHeading {
  level: number;
  text: string;
}

interface OutlineImage {
  src: string;
  alt: string;
}

interface ImagePreviewState {
  src: string;
  alt: string;
  x: number;
  y: number;
}

interface OutlineLink {
  href: string;
  text: string;
}

interface PageOutline {
  headings: OutlineHeading[];
  images: OutlineImage[];
  links: OutlineLink[];
}

interface PageListPanelProps {
  pageId: number | null;
  commentSelection: {
    text: string;
    from: number;
    to: number;
  } | null;
  commentComposeRequestKey: number;
  onCommentAnchorsChange: (anchors: CommentAnchorRange[]) => void;
  pages: Hoja[];
  filteredPages: Hoja[];
  currentPageIndex: number;
  isCorkboardMode: boolean;
  setIsCorkboardMode: (value: boolean) => void;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  editingPageId: number | null;
  setEditingPageId: (id: number | null) => void;
  handlePageSelect: (index: number) => void;
  handleTitleChangeInternal: (index: number, newTitle: string) => void;
  handleCreatePage: () => void;
  deletePage: (e: React.MouseEvent, id: number, index: number) => void;
}

/**
 * 📋 PageListPanel
 * Panel del índice lateral: buscador, toggle de vista de corcho,
 * lista/corcho de hojas con sub-índice de headings H1–H6 por hoja activa,
 * y botón de añadir hoja.
 *
 * Incluye WritingCommentsPanel en la parte inferior.
 *
 * Extraído de WritingView.tsx para separar responsabilidades.
 */
const PageListPanel: React.FC<PageListPanelProps> = ({
  pageId,
  commentSelection,
  commentComposeRequestKey,
  onCommentAnchorsChange,
  pages,
  filteredPages,
  currentPageIndex,
  isCorkboardMode,
  setIsCorkboardMode,
  searchTerm,
  setSearchTerm,
  editingPageId,
  setEditingPageId,
  handlePageSelect,
  handleTitleChangeInternal,
  handleCreatePage,
  deletePage,
}) => {
  const [sectionOrder, setSectionOrder] = React.useState<SectionKey[]>([
    "pages",
    "comments",
  ]);
  const [collapsedSections, setCollapsedSections] = React.useState<
    Record<SectionKey, boolean>
  >({
    pages: false,
    comments: false,
  });
  const [splitRatio, setSplitRatio] = React.useState<number>(0.62);
  const [isResizing, setIsResizing] = React.useState<boolean>(false);
  const [expandedPages, setExpandedPages] = React.useState<Record<number, boolean>>({});
  const [expandedGroups, setExpandedGroups] = React.useState<Record<string, boolean>>({});
  const [imagePreview, setImagePreview] = React.useState<ImagePreviewState | null>(null);
  const sectionsContainerRef = React.useRef<HTMLDivElement | null>(null);

  const toggleSection = (section: SectionKey): void => {
    setCollapsedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  const moveSection = (section: SectionKey, direction: "up" | "down"): void => {
    const currentIndex = sectionOrder.indexOf(section);
    const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
    const canMove = targetIndex >= 0 && targetIndex < sectionOrder.length;

    canMove
      ? setSectionOrder((prev) => {
          const next = [...prev];
          const temp = next[currentIndex];
          next[currentIndex] = next[targetIndex];
          next[targetIndex] = temp;
          return next;
        })
      : null;
  };

  const sectionTitle: Record<SectionKey, string> = {
    pages: "Índice",
    comments: "Comentarios",
  };

  const pageOutlineMap = React.useMemo<Record<number, PageOutline>>(() => {
    const parser = typeof window !== "undefined" ? new DOMParser() : null;

    return pages.reduce<Record<number, PageOutline>>((acc, page) => {
      const html = page.contenido || "";

      if (!parser || html.trim().length === 0) {
        acc[page.id] = { headings: [], images: [], links: [] };
        return acc;
      }

      const doc = parser.parseFromString(html, "text/html");

      const headings = Array.from(
        doc.querySelectorAll("h1, h2, h3, h4, h5, h6"),
      ).map((el) => ({
        level: Number(el.tagName.replace("H", "")),
        text: (el.textContent || "").trim(),
      }))
        .filter((item) => item.text.length > 0);

      const images = Array.from(doc.querySelectorAll("img"))
        .map((el) => ({
          src: (el.getAttribute("src") || "").trim(),
          alt: (el.getAttribute("alt") || "").trim(),
        }))
        .filter((item) => item.src.length > 0);

      const links = Array.from(doc.querySelectorAll("a[href]"))
        .map((el) => ({
          href: (el.getAttribute("href") || "").trim(),
          text: (el.textContent || "").trim(),
        }))
        .filter((item) => item.href.length > 0);

      acc[page.id] = { headings, images, links };
      return acc;
    }, {});
  }, [pages]);

  const togglePageNode = (pageId: number): void => {
    setExpandedPages((prev) => ({
      ...prev,
      [pageId]: !prev[pageId],
    }));
  };

  const toggleGroupNode = (groupKey: string): void => {
    setExpandedGroups((prev) => ({
      ...prev,
      [groupKey]: !prev[groupKey],
    }));
  };

  const handleImagePreviewEnter = (
    event: React.MouseEvent<HTMLDivElement>,
    image: OutlineImage,
  ): void => {
    const rect = event.currentTarget.getBoundingClientRect();
    const previewWidth = 220;
    const spaceRight = window.innerWidth - rect.right;
    const placeRight = spaceRight > previewWidth + 20;

    setImagePreview({
      src: image.src,
      alt: image.alt,
      x: placeRight ? rect.right + 12 : rect.left - previewWidth - 12,
      y: rect.top + rect.height / 2,
    });
  };

  const handleImagePreviewLeave = (): void => {
    setImagePreview(null);
  };

  const openExternalLink = (href: string): void => {
    const trimmed = href.trim();
    const hasProtocol = /^https?:\/\//i.test(trimmed);
    const targetUrl = hasProtocol ? trimmed : `https://${trimmed}`;
    window.open(targetUrl, "_blank", "noopener,noreferrer");
  };

  const topSection = sectionOrder[0];
  const bottomSection = sectionOrder[1];
  const topCollapsed = collapsedSections[topSection];
  const bottomCollapsed = collapsedSections[bottomSection];
  const bothExpanded = !topCollapsed && !bottomCollapsed;

  const handleResizeStart = (event: React.MouseEvent<HTMLDivElement>): void => {
    event.preventDefault();
    const container = sectionsContainerRef.current;

    container
      ? (() => {
          setIsResizing(true);
          document.body.style.cursor = "row-resize";
          document.body.style.userSelect = "none";

          const onMouseMove = (moveEvent: MouseEvent): void => {
            const rect = container.getBoundingClientRect();
            const rawRatio = (moveEvent.clientY - rect.top) / rect.height;
            const clampedRatio = Math.min(0.8, Math.max(0.2, rawRatio));
            setSplitRatio(clampedRatio);
          };

          const onMouseUp = (): void => {
            setIsResizing(false);
            document.body.style.cursor = "";
            document.body.style.userSelect = "";
            window.removeEventListener("mousemove", onMouseMove);
            window.removeEventListener("mouseup", onMouseUp);
          };

          window.addEventListener("mousemove", onMouseMove);
          window.addEventListener("mouseup", onMouseUp);
        })()
      : null;
  };

  const renderPagesSection = (): React.ReactNode => {
    return (
      <>
        {/* Buscador plano de Hojas */}
        <div className="p-3 border-b border-foreground/5 flex flex-col gap-3">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-sm text-foreground/35">
              search
            </span>
            <input
              type="text"
              placeholder="Buscar en el índice..."
              className="w-full bg-foreground/[0.03] border border-foreground/10 py-2 pl-9 pr-4 text-[10px] font-sans rounded-md outline-none focus:border-primary/50 transition-all text-foreground placeholder:text-foreground/30 select-text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between px-1 gap-2">
            <Switch
              checked={isCorkboardMode}
              onChange={setIsCorkboardMode}
              label="Vista de Corcho"
            />
            <button
              onClick={handleCreatePage}
              className="px-3 py-1.5 bg-primary hover:bg-primary/95 text-primary-foreground rounded-md text-[9px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all hover:scale-[1.01] active:scale-[0.98] shadow-sm shadow-primary/10"
            >
              <span className="material-symbols-outlined text-sm">add</span>
              <span>Añadir hoja</span>
            </button>
          </div>
        </div>

        {/* Lista o Corcho de páginas con anidamiento dinámico */}
        <div
          className={`flex-grow overflow-y-auto overflow-x-hidden p-2 custom-scrollbar ${isCorkboardMode ? "grid grid-cols-2 gap-2 content-start" : "flex flex-col space-y-0.5"}`}
        >
          {filteredPages.map((page) => {
            const globalIdx = pages.findIndex((p) => p.id === page.id);
            const isSelected = globalIdx === currentPageIndex;

            // Anidamiento dinámico: si no empieza por "Capítulo", se indenta sutilmente a la derecha
            const isChapter =
              (page.titulo || "").toLowerCase().startsWith("capítulo") ||
              (page.titulo || "").toLowerCase().startsWith("capitulo");

            // --- MODO CORCHO ---
            if (isCorkboardMode) {
              return (
                <div key={page.id} className="group relative aspect-square">
                  <button
                    onClick={() => handlePageSelect(globalIdx)}
                    className={`w-full h-full text-left p-3 rounded-md transition-all flex flex-col justify-start border overflow-hidden ${
                      isSelected
                        ? "bg-primary/10 border-primary/30 shadow-[inset_0_0_10px_hsl(var(--primary)/0.12)]"
                        : "bg-foreground/[0.02] border-foreground/10 hover:border-primary/20 hover:bg-foreground/[0.04]"
                    }`}
                  >
                    <span
                      className={`font-sans text-[11px] font-bold mb-2 truncate w-full ${
                        isSelected ? "font-bold" : "font-medium"
                      }`}
                    >
                      {page.titulo || `Hoja ${globalIdx + 1}`}
                    </span>
                    <div
                      className="text-[9px] text-foreground/50 font-serif leading-relaxed line-clamp-5 whitespace-pre-wrap break-words"
                      dangerouslySetInnerHTML={{
                        __html:
                          page.contenido?.replace(/<[^>]*>?/gm, "") ||
                          "Sin contenido...",
                      }}
                    />
                  </button>
                  {/* Opciones de borrado rápidas */}
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 bg-background/80 backdrop-blur-sm rounded">
                    <button
                      onClick={(e) => deletePage(e, page.id, globalIdx)}
                      className="p-1 rounded-sm text-foreground/35 hover:text-[hsl(var(--color-destructive))] hover:bg-[hsl(var(--color-destructive)/0.12)] transition-colors"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined text-sm">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              );
            }

            // --- MODO LISTA ---
            return (
              <div key={page.id} className="group relative">
                {(() => {
                  const isExpanded = expandedPages[page.id] ?? isSelected;
                  const outline = pageOutlineMap[page.id] || {
                    headings: [],
                    images: [],
                    links: [],
                  };

                  const structureKey = `page:${page.id}:structure`;
                  const imagesKey = `page:${page.id}:images`;
                  const linksKey = `page:${page.id}:links`;

                  const structureOpen = expandedGroups[structureKey] ?? true;
                  const imagesOpen = expandedGroups[imagesKey] ?? true;
                  const linksOpen = expandedGroups[linksKey] ?? true;

                  return (
                    <>
                      <div
                        className={`w-full px-2 py-1.5 rounded-sm transition-colors flex items-center gap-1.5 ${
                          isChapter ? "" : "ml-1"
                        } ${
                          isSelected
                            ? "text-primary bg-primary/10"
                            : "text-foreground/70 hover:text-foreground hover:bg-foreground/[0.04]"
                        }`}
                      >
                        <button
                          onClick={() => handlePageSelect(globalIdx)}
                          className="min-w-0 max-w-[70%] text-left"
                        >
                          {editingPageId === page.id ? (
                            <input
                              autoFocus
                              onBlur={() => setEditingPageId(null)}
                              onKeyDown={(e) => {
                                e.key === "Enter" ? setEditingPageId(null) : null;
                                e.stopPropagation();
                              }}
                              onClick={(e) => e.stopPropagation()}
                              className="bg-background border-b border-primary font-sans font-bold text-xs outline-none w-full px-1 text-foreground"
                              value={page.titulo || ""}
                              onChange={(e) =>
                                handleTitleChangeInternal(globalIdx, e.target.value)
                              }
                              placeholder={`Hoja ${globalIdx + 1}`}
                            />
                          ) : (
                            <span
                              className={`font-sans text-[12px] truncate block ${
                                isChapter ? "font-bold" : "font-medium"
                              }`}
                            >
                              {page.titulo || `Hoja ${globalIdx + 1}`}
                            </span>
                          )}
                        </button>

                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => togglePageNode(page.id)}
                            className="p-0.5 rounded-sm hover:bg-foreground/10 transition-colors"
                            title={isExpanded ? "Plegar hoja" : "Desplegar hoja"}
                          >
                            <span className="material-symbols-outlined text-sm">
                              {isExpanded ? "expand_more" : "chevron_right"}
                            </span>
                          </button>

                          {!editingPageId ? (
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setEditingPageId(page.id);
                                }}
                                className="p-1 rounded-sm text-foreground/35 hover:text-primary hover:bg-primary/10 transition-colors"
                                title="Renombrar"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  edit
                                </span>
                              </button>
                              <button
                                onClick={(e) => deletePage(e, page.id, globalIdx)}
                                className="p-1 rounded-sm text-foreground/35 hover:text-[hsl(var(--color-destructive))] hover:bg-[hsl(var(--color-destructive)/0.12)] transition-colors"
                                title="Eliminar"
                              >
                                <span className="material-symbols-outlined text-sm">
                                  delete
                                </span>
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {isExpanded ? (
                        <div className="pl-6 pr-2 py-1 space-y-1">
                          <div className="text-[9px] text-foreground/45 uppercase tracking-wider font-bold">
                            Árbol de contenido
                          </div>

                          <div className="space-y-1">
                            <button
                              onClick={() => toggleGroupNode(structureKey)}
                              className="w-full flex items-center gap-1.5 text-[10px] text-foreground/65 hover:text-foreground transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">
                                {structureOpen ? "expand_more" : "chevron_right"}
                              </span>
                              <span className="material-symbols-outlined text-sm">segment</span>
                              <span>Estructura ({outline.headings.length})</span>
                            </button>
                            {structureOpen ? (
                              outline.headings.length > 0 ? (
                                outline.headings.map((heading, i) => (
                                  <div
                                    key={`${structureKey}-${i}`}
                                    className="flex items-center gap-1.5 text-[10px] text-foreground/55 hover:text-primary transition-colors"
                                    style={{ paddingLeft: `${heading.level * 8}px` }}
                                  >
                                    <span className="material-symbols-outlined text-xs">
                                      {heading.level <= 2 ? "title" : "subtitles"}
                                    </span>
                                    <span className="truncate">
                                      H{heading.level}: {heading.text}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="pl-9 text-[10px] text-foreground/35 italic">
                                  Sin encabezados
                                </div>
                              )
                            ) : null}
                          </div>

                          <div className="space-y-1">
                            <button
                              onClick={() => toggleGroupNode(imagesKey)}
                              className="w-full flex items-center gap-1.5 text-[10px] text-foreground/65 hover:text-foreground transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">
                                {imagesOpen ? "expand_more" : "chevron_right"}
                              </span>
                              <span className="material-symbols-outlined text-sm">image</span>
                              <span>Imágenes ({outline.images.length})</span>
                            </button>
                            {imagesOpen ? (
                              outline.images.length > 0 ? (
                                outline.images.map((image, i) => (
                                  <div
                                    key={`${imagesKey}-${i}`}
                                    className="pl-9 flex items-center gap-1.5 text-[10px] text-foreground/55 hover:text-primary transition-colors"
                                    onMouseEnter={(event) =>
                                      handleImagePreviewEnter(event, image)
                                    }
                                    onMouseLeave={handleImagePreviewLeave}
                                  >
                                    <span className="material-symbols-outlined text-xs">photo</span>
                                    <span className="truncate">
                                      {image.alt || `Imagen ${i + 1}`}
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="pl-9 text-[10px] text-foreground/35 italic">
                                  Sin imágenes
                                </div>
                              )
                            ) : null}
                          </div>

                          <div className="space-y-1">
                            <button
                              onClick={() => toggleGroupNode(linksKey)}
                              className="w-full flex items-center gap-1.5 text-[10px] text-foreground/65 hover:text-foreground transition-colors"
                            >
                              <span className="material-symbols-outlined text-sm">
                                {linksOpen ? "expand_more" : "chevron_right"}
                              </span>
                              <span className="material-symbols-outlined text-sm">link</span>
                              <span>Enlaces ({outline.links.length})</span>
                            </button>
                            {linksOpen ? (
                              outline.links.length > 0 ? (
                                outline.links.map((link, i) => (
                                  <button
                                    key={`${linksKey}-${i}`}
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openExternalLink(link.href);
                                    }}
                                    className="w-full pl-9 pr-1 flex items-center gap-1.5 text-[10px] text-foreground/55 hover:text-primary transition-colors group/link text-left"
                                    title={link.href}
                                  >
                                    <span className="material-symbols-outlined text-xs">north_east</span>
                                    <span className="truncate flex-1 min-w-0">
                                      {link.text || link.href}
                                    </span>
                                    <span className="material-symbols-outlined text-xs opacity-0 group-hover/link:opacity-100 text-foreground/35 transition-opacity">
                                      link_off
                                    </span>
                                  </button>
                                ))
                              ) : (
                                <div className="pl-9 text-[10px] text-foreground/35 italic">
                                  Sin enlaces
                                </div>
                              )
                            ) : null}
                          </div>
                        </div>
                      ) : null}
                    </>
                  );
                })()}

                
              </div>
            );
          })}
        </div>
      </>
    );
  };

  const renderCommentsSection = (): React.ReactNode => {
    return (
      <div className="h-full min-h-0">
        <WritingCommentsPanel
          pageId={pageId}
          selection={commentSelection}
          composeRequestKey={commentComposeRequestKey}
          onAnchorsChange={onCommentAnchorsChange}
          embedded={true}
          showHeader={false}
        />
      </div>
    );
  };

  const renderSectionBody = (section: SectionKey): React.ReactNode => {
    switch (section) {
      case "pages":
        return renderPagesSection();
      case "comments":
        return renderCommentsSection();
      default:
        return null;
    }
  };

  const sectionStyle = (section: SectionKey): React.CSSProperties => {
    const isTopSection = section === topSection;

    return bothExpanded
      ? isTopSection
        ? { flex: `0 0 ${Math.round(splitRatio * 100)}%` }
        : { flex: "1 1 auto" }
      : collapsedSections[section]
        ? { flex: "0 0 auto" }
        : { flex: "1 1 auto" };
  };

  const renderSection = (section: SectionKey): React.ReactNode => {
    const isCollapsed = collapsedSections[section];
    const index = sectionOrder.indexOf(section);
    const canMoveUp = index > 0;
    const canMoveDown = index < sectionOrder.length - 1;

    return (
      <section
        key={section}
        className="min-h-0 flex flex-col overflow-hidden"
        style={sectionStyle(section)}
      >
        <div className="h-9 px-2 flex items-center justify-between bg-foreground/[0.04] border-b border-foreground/15">
          <button
            onClick={() => toggleSection(section)}
            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-foreground/80 hover:text-foreground transition-colors"
          >
            <span className="material-symbols-outlined text-sm">
              {isCollapsed ? "chevron_right" : "expand_more"}
            </span>
            <span>{sectionTitle[section]}</span>
          </button>

          <div className="flex items-center gap-0.5">
            <button
              onClick={() => moveSection(section, "up")}
              disabled={!canMoveUp}
              className="p-1 rounded-sm text-foreground/55 hover:text-foreground hover:bg-foreground/12 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Mover arriba"
            >
              <span className="material-symbols-outlined text-sm">
                arrow_upward
              </span>
            </button>
            <button
              onClick={() => moveSection(section, "down")}
              disabled={!canMoveDown}
              className="p-1 rounded-sm text-foreground/55 hover:text-foreground hover:bg-foreground/12 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
              title="Mover abajo"
            >
              <span className="material-symbols-outlined text-sm">
                arrow_downward
              </span>
            </button>
          </div>
        </div>

        {!isCollapsed ? (
          <div className="flex-1 min-h-0 overflow-hidden">
            {renderSectionBody(section)}
          </div>
        ) : null}
      </section>
    );
  };

  return (
    <div
      ref={sectionsContainerRef}
      className="flex flex-col h-full flex-grow overflow-hidden"
    >
      {renderSection(topSection)}

      {bothExpanded ? (
        <div
          onMouseDown={handleResizeStart}
          className={`h-2 flex items-center justify-center bg-foreground/[0.04] hover:bg-primary/10 transition-colors ${isResizing ? "cursor-row-resize" : "cursor-row-resize"}`}
          title="Arrastra para ajustar el tamaño"
        >
          <div className="w-full h-px bg-foreground/30" />
        </div>
      ) : (
        <div className="h-px bg-foreground/20" />
      )}

      {renderSection(bottomSection)}

      {imagePreview ? (
        <div
          className="fixed z-[80] pointer-events-none"
          style={{
            left: imagePreview.x,
            top: imagePreview.y,
            transform: "translateY(-50%)",
          }}
        >
          <div className="w-[220px] p-2 rounded-md border border-foreground/15 bg-background shadow-2xl">
            <div className="w-full h-[120px] overflow-hidden rounded-sm bg-foreground/5 flex items-center justify-center">
              <img
                src={imagePreview.src}
                alt={imagePreview.alt || "Vista previa"}
                className="max-w-full max-h-full object-contain"
              />
            </div>
            <div className="mt-1.5 text-[10px] text-foreground/70 truncate">
              {imagePreview.alt || "Imagen insertada"}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default PageListPanel;
