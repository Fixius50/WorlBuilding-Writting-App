import { EditorContent, BubbleMenu, Editor } from "@tiptap/react";
import React from "react";
import { createPortal } from "react-dom";
import { NodeSelection, TextSelection } from "prosemirror-state";
import ReactCrop, { type Crop, type PixelCrop } from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface BubbleToolbarProps {
  editor: Editor | null;
  onMentionClick?: (id: string) => void;
  onRequestComment?: () => void;
  zoom: number;
}

/**
 * 🎨 BubbleToolbar
 * Renderiza el BubbleMenu flotante con herramientas de formato inline
 * (negrita, cursiva, subrayado, tachado, color de texto, resaltado, enlace)
 * y el contenido editable del editor (EditorContent).
 *
 * Extraído de ZenEditor.tsx → PageContentEditor.
 */
const BubbleToolbar: React.FC<BubbleToolbarProps> = ({
  editor,
  onRequestComment,
  zoom,
}) => {
  const [showTextColor, setShowTextColor] = React.useState(false);
  const [showHighlightColor, setShowHighlightColor] = React.useState(false);
  const [hoveredLink, setHoveredLink] = React.useState<{
    pos: number;
    rect: DOMRect;
    href: string;
  } | null>(null);
  const hideHoveredLinkTimeoutRef = React.useRef<number | null>(null);
  const [selectedImage, setSelectedImage] = React.useState<{
    pos: number;
    src: string;
    width: string | null;
    rect: DOMRect;
  } | null>(null);
  const [previewImageSrc, setPreviewImageSrc] = React.useState<string | null>(
    null,
  );
  const [cropImageSrc, setCropImageSrc] = React.useState<string | null>(null);
  const [cropTargetPos, setCropTargetPos] = React.useState<number | null>(null);
  const [cropAnchorRect, setCropAnchorRect] = React.useState<DOMRect | null>(null);
  const [cropSelection, setCropSelection] = React.useState<Crop>({
    unit: "%",
    x: 10,
    y: 10,
    width: 80,
    height: 80,
  });
  const [completedCrop, setCompletedCrop] = React.useState<PixelCrop | null>(
    null,
  );
  const cropImageRef = React.useRef<HTMLImageElement | null>(null);
  const textColorInputRef = React.useRef<HTMLInputElement>(null);
  const highlightColorInputRef = React.useRef<HTMLInputElement>(null);

  const textColors = [
    { name: "Normal", value: "hsl(var(--foreground))" },
    { name: "Gris", value: "#a1a1aa" },
    { name: "Rojo", value: "#ef4444" },
    { name: "Naranja", value: "#f97316" },
    { name: "Amarillo", value: "#eab308" },
    { name: "Verde", value: "#22c55e" },
    { name: "Azul", value: "#3b82f6" },
    { name: "Púrpura", value: "#a855f7" },
  ];

  const highlightColors = [
    { name: "Ninguno", value: "transparent" },
    { name: "Amarillo", value: "rgba(234, 179, 8, 0.3)" },
    { name: "Verde", value: "rgba(34, 197, 94, 0.3)" },
    { name: "Azul", value: "rgba(59, 130, 246, 0.3)" },
    { name: "Rojo", value: "rgba(239, 68, 68, 0.3)" },
    { name: "Púrpura", value: "rgba(168, 85, 247, 0.3)" },
  ];

  const currentTextColor =
    editor?.getAttributes("textStyle").color || "hsl(var(--foreground))";
  const currentHighlightColor =
    editor?.getAttributes("highlight").color || "transparent";
  const isCropping = !!cropImageSrc;

  const logImageSyncError = React.useCallback(
    (stage: string, error: unknown) => {
      const selection = editor?.state.selection;
      const message = error instanceof Error ? error.message : String(error);

      console.error("[EditorImageSyncError]", {
        stage,
        message,
        selectionFrom: selection?.from,
        selectionTo: selection?.to,
        selectionType: selection ? selection.constructor.name : "none",
      });
    },
    [editor],
  );

  const getImageRectAtPos = React.useCallback(
    (pos: number): DOMRect | null => {
      const hasEditor = !!editor;

      if (!hasEditor) {
        return null;
      }

      try {
        const nodeDom = editor.view.nodeDOM(pos) as HTMLElement | null;
        return nodeDom ? nodeDom.getBoundingClientRect() : null;
      } catch {
        return null;
      }
    },
    [editor],
  );

  const getCurrentImageContext = React.useCallback(() => {
    const hasEditor = !!editor;

    if (!hasEditor) {
      return null;
    }

    const selection = editor.state.selection;
    const isImageNodeSelection =
      selection instanceof NodeSelection &&
      selection.node.type.name === "image";

    if (isImageNodeSelection) {
      const imagePos = selection.from;
      const imageSrc = String(selection.node.attrs?.src || "");
      const originalSrcAttr = selection.node.attrs?.originalSrc;
      const imageOriginalSrc =
        typeof originalSrcAttr === "string" && originalSrcAttr.trim().length > 0
          ? originalSrcAttr
          : null;
      const imageWidth =
        typeof selection.node.attrs?.width === "string" &&
        selection.node.attrs.width.trim().length > 0
          ? selection.node.attrs.width
          : null;

      return {
        pos: imagePos,
        src: imageSrc,
        originalSrc: imageOriginalSrc,
        width: imageWidth,
      };
    }

    return null;
  }, [editor]);

  React.useEffect(() => {
    const hasEditor = !!editor;
    if (!hasEditor) {
      setSelectedImage(null);
      return;
    }

    const updateSelectedImage = () => {
      const imageContext = getCurrentImageContext();

      if (!imageContext) {
        setSelectedImage(null);
      } else {
        const rect = getImageRectAtPos(imageContext.pos);
        const canShowImageMenu = imageContext.src.length > 0 && rect !== null;

        if (!canShowImageMenu) {
          setSelectedImage(null);
        } else {
          setSelectedImage({
            pos: imageContext.pos,
            src: imageContext.src,
            width: imageContext.width,
            rect: rect!,
          });
        }
      }
    };

    editor.on("selectionUpdate", updateSelectedImage);
    editor.on("update", updateSelectedImage);
    updateSelectedImage();

    return () => {
      editor.off("selectionUpdate", updateSelectedImage);
      editor.off("update", updateSelectedImage);
    };
  }, [editor, getCurrentImageContext, getImageRectAtPos]);

  React.useEffect(() => {
    const hasEditor = !!editor;
    const hasSelectedImage = !!selectedImage;

    if (!hasEditor || !hasSelectedImage) {
      return;
    }

    const refreshImageRect = () => {
      const imageContext = getCurrentImageContext();
      const rect = imageContext ? getImageRectAtPos(imageContext.pos) : null;

      if (rect) {
        setSelectedImage((prev) =>
          prev
            ? {
                ...prev,
                pos: imageContext ? imageContext.pos : prev.pos,
                src: imageContext ? imageContext.src : prev.src,
                width: imageContext ? imageContext.width : prev.width,
                rect,
              }
            : prev,
        );
      } else {
        setSelectedImage(null);
      }
    };

    window.addEventListener("scroll", refreshImageRect, true);
    window.addEventListener("resize", refreshImageRect);

    return () => {
      window.removeEventListener("scroll", refreshImageRect, true);
      window.removeEventListener("resize", refreshImageRect);
    };
  }, [editor, selectedImage?.pos, getCurrentImageContext, getImageRectAtPos]);

  React.useEffect(() => {
    const shouldHandleOutsideClick = !!selectedImage && !isCropping && !previewImageSrc;

    if (!shouldHandleOutsideClick) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const isInsideImageMenu = !!target?.closest('[data-wb-image-menu="true"]');
      const isInsideEditorImage = !!target?.closest(".ProseMirror img");

      if (!isInsideImageMenu && !isInsideEditorImage) {
        setSelectedImage(null);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick, true);
    return () => document.removeEventListener("mousedown", handleOutsideClick, true);
  }, [isCropping, previewImageSrc, selectedImage]);

  const handleViewImage = React.useCallback(() => {
    selectedImage ? setPreviewImageSrc(selectedImage.src) : null;
  }, [selectedImage]);

  const closeCropModal = React.useCallback(() => {
    setCropImageSrc(null);
    setCropTargetPos(null);
    setCropAnchorRect(null);
    setCompletedCrop(null);
    setCropSelection({
      unit: "%",
      x: 10,
      y: 10,
      width: 80,
      height: 80,
    });
  }, []);

  const handleDeleteImage = React.useCallback(() => {
    const hasEditor = !!editor;
    const imageContext = getCurrentImageContext();
    const hasSelectedImage = !!imageContext;

    if (hasEditor && hasSelectedImage) {
      const imageNode = editor.state.doc.nodeAt(imageContext.pos);
      const hasImageNode = !!imageNode && imageNode.type.name === "image";

      if (hasImageNode) {
        const from = imageContext.pos;
        const to = from + imageNode.nodeSize;
        try {
          const transaction = editor.state.tr.delete(from, to);
          transaction.setMeta("wb:imageMutation", true);
          editor.view.dispatch(transaction);
        } catch (error: unknown) {
          logImageSyncError("deleteImage", error);
          setSelectedImage(null);
        }
      }
      setSelectedImage(null);
    }
  }, [editor, getCurrentImageContext]);

  const updateImageWidth = React.useCallback(
    (nextWidth: string | null) => {
      const hasEditor = !!editor;
      const imageContext = getCurrentImageContext();
      const hasSelectedImage = !!imageContext;

      if (hasEditor && hasSelectedImage) {
        const imageNode = editor.state.doc.nodeAt(imageContext.pos);
        const hasImageNode = !!imageNode && imageNode.type.name === "image";

        if (hasImageNode) {
          const attrs = {
            ...imageNode.attrs,
            width: nextWidth,
          };
          try {
            const transaction = editor.state.tr.setNodeMarkup(
              imageContext.pos,
              imageNode.type,
              attrs,
              imageNode.marks,
            );
            transaction.setMeta("wb:imageMutation", true);
            editor.view.dispatch(transaction);
          } catch (error: unknown) {
            logImageSyncError("setImageWidth", error);
            setSelectedImage(null);
          }
        }
      }
    },
    [editor, getCurrentImageContext],
  );

  const handleDecreaseImageSize = React.useCallback(() => {
    const hasSelectedImage = !!selectedImage;

    if (hasSelectedImage) {
      const currentWidth = Math.max(96, Math.round(selectedImage.rect.width));
      const nextWidth = Math.max(96, Math.round(currentWidth * 0.85));
      updateImageWidth(`${nextWidth}px`);
    }
  }, [selectedImage, updateImageWidth]);

  const handleIncreaseImageSize = React.useCallback(() => {
    const hasSelectedImage = !!selectedImage;

    if (hasSelectedImage) {
      const currentWidth = Math.max(96, Math.round(selectedImage.rect.width));
      const nextWidth = Math.min(1600, Math.round(currentWidth * 1.15));
      updateImageWidth(`${nextWidth}px`);
    }
  }, [selectedImage, updateImageWidth]);

  const handleCropImage = React.useCallback(() => {
    const hasEditor = !!editor;
    const imageContext = getCurrentImageContext();
    const hasSelectedImage = !!imageContext;

    if (!hasEditor || !hasSelectedImage) {
      return;
    }

    const hasOriginalSource =
      typeof imageContext.originalSrc === "string" &&
      imageContext.originalSrc.trim().length > 0;
    const currentSrc = String(imageContext.src || "");
    const sourceForCrop = hasOriginalSource ? imageContext.originalSrc! : currentSrc;

    if (!hasOriginalSource && currentSrc.trim().length > 0) {
      try {
        const imageNode = editor.state.doc.nodeAt(imageContext.pos);
        const hasImageNode = !!imageNode && imageNode.type.name === "image";

        if (hasImageNode && imageNode) {
          const attrs = {
            ...imageNode.attrs,
            originalSrc: currentSrc,
          };

          const transaction = editor.state.tr.setNodeMarkup(
            imageContext.pos,
            imageNode.type,
            attrs,
            imageNode.marks,
          );
          transaction.setMeta("wb:imageMutation", true);
          editor.view.dispatch(transaction);
        }
      } catch (error: unknown) {
        logImageSyncError("cropImageBackfillOriginal", error);
      }
    }

    setCropImageSrc(sourceForCrop);
    setCropTargetPos(imageContext.pos);
    setCropAnchorRect(getImageRectAtPos(imageContext.pos));
    setCompletedCrop(null);
    setCropSelection({
      unit: "%",
      x: 10,
      y: 10,
      width: 80,
      height: 80,
    });
  }, [editor, getCurrentImageContext, getImageRectAtPos]);

  const applyCropFromModal = React.useCallback(async () => {
    const hasEditor = !!editor;
    const hasTargetPos = cropTargetPos !== null;
    const hasCompletedCrop = !!completedCrop;
    const hasCropImage = !!cropImageRef.current;

    if (!hasEditor || !hasTargetPos || !hasCompletedCrop || !hasCropImage) {
      return;
    }

    const pixelCrop = completedCrop as PixelCrop;
    const cropHasArea = pixelCrop.width > 0 && pixelCrop.height > 0;

    if (!cropHasArea) {
      window.alert("Selecciona un área válida para recortar.");
      return;
    }

    try {
      const img = cropImageRef.current as HTMLImageElement;
      const scaleX = img.naturalWidth / img.width;
      const scaleY = img.naturalHeight / img.height;

      const sourceX = Math.floor(pixelCrop.x * scaleX);
      const sourceY = Math.floor(pixelCrop.y * scaleY);
      const sourceWidth = Math.floor(pixelCrop.width * scaleX);
      const sourceHeight = Math.floor(pixelCrop.height * scaleY);

      const canvas = document.createElement("canvas");
      canvas.width = sourceWidth;
      canvas.height = sourceHeight;

      const context = canvas.getContext("2d");
      if (!context) {
        return;
      }

      context.drawImage(
        img,
        sourceX,
        sourceY,
        sourceWidth,
        sourceHeight,
        0,
        0,
        sourceWidth,
        sourceHeight,
      );

      const croppedSrc = canvas.toDataURL("image/png", 0.92);
      const imageNode = editor.state.doc.nodeAt(cropTargetPos);
      const hasImageNode = !!imageNode && imageNode.type.name === "image";

      if (hasImageNode) {
        const currentOriginalAttr = imageNode.attrs?.originalSrc;
        const currentOriginalSrc =
          typeof currentOriginalAttr === "string" &&
          currentOriginalAttr.trim().length > 0
            ? currentOriginalAttr
            : null;
        const sourceForFutureRecrops = currentOriginalSrc || String(imageNode.attrs?.src || "");

        const attrs = {
          ...imageNode.attrs,
          src: croppedSrc,
          originalSrc: sourceForFutureRecrops,
        };

        const transaction = editor.state.tr.setNodeMarkup(
          cropTargetPos,
          imageNode.type,
          attrs,
          imageNode.marks,
        );
        transaction.setMeta("wb:imageMutation", true);
        editor.view.dispatch(transaction);
        closeCropModal();
      }
    } catch (error: unknown) {
      logImageSyncError("cropImageApply", error);
      window.alert(
        "No se pudo recortar la imagen seleccionada. Verifica que la imagen sea local o accesible.",
      );
    }
  }, [
    closeCropModal,
    completedCrop,
    cropTargetPos,
    editor,
    logImageSyncError,
  ]);

  const restoreOriginalFromCrop = React.useCallback(() => {
    const hasEditor = !!editor;
    const hasTargetPos = cropTargetPos !== null;

    if (!hasEditor || !hasTargetPos) {
      return;
    }

    try {
      const imageNode = editor.state.doc.nodeAt(cropTargetPos);
      const hasImageNode = !!imageNode && imageNode.type.name === "image";

      if (!hasImageNode || !imageNode) {
        return;
      }

      const originalAttr = imageNode.attrs?.originalSrc;
      const originalSrc =
        typeof originalAttr === "string" && originalAttr.trim().length > 0
          ? originalAttr
          : null;

      if (!originalSrc) {
        window.alert("No hay una versión original guardada para esta imagen.");
        return;
      }

      const attrs = {
        ...imageNode.attrs,
        src: originalSrc,
        originalSrc,
      };

      const transaction = editor.state.tr.setNodeMarkup(
        cropTargetPos,
        imageNode.type,
        attrs,
        imageNode.marks,
      );
      transaction.setMeta("wb:imageMutation", true);
      editor.view.dispatch(transaction);
      closeCropModal();
    } catch (error: unknown) {
      logImageSyncError("restoreOriginal", error);
    }
  }, [closeCropModal, cropTargetPos, editor, logImageSyncError]);

  React.useEffect(() => {
    const hasAnyModal = !!previewImageSrc || !!cropImageSrc;

    if (!hasAnyModal) {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      const isEscape = event.key === "Escape";

      if (isEscape) {
        cropImageSrc ? closeCropModal() : null;
        previewImageSrc ? setPreviewImageSrc(null) : null;
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [closeCropModal, cropImageSrc, previewImageSrc]);

  React.useEffect(() => {
    if (!editor) {
      return;
    }

    const editorDom = editor.view.dom as HTMLElement;

    const handleMouseMove = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const anchor = target?.closest("a[href]") as HTMLAnchorElement | null;

      if (!anchor) {
        if (hideHoveredLinkTimeoutRef.current) {
          window.clearTimeout(hideHoveredLinkTimeoutRef.current);
        }
        hideHoveredLinkTimeoutRef.current = window.setTimeout(() => {
          setHoveredLink(null);
        }, 1500);
        return;
      }

      if (hideHoveredLinkTimeoutRef.current) {
        window.clearTimeout(hideHoveredLinkTimeoutRef.current);
        hideHoveredLinkTimeoutRef.current = null;
      }

      const href = (anchor.getAttribute("href") || "").trim();
      if (href.length === 0) {
        setHoveredLink(null);
        return;
      }

      const pos = editor.view.posAtDOM(anchor, 0);
      const rect = anchor.getBoundingClientRect();

      setHoveredLink({ pos, rect, href });
    };

    const clearHoveredLink = () => {
      if (hideHoveredLinkTimeoutRef.current) {
        window.clearTimeout(hideHoveredLinkTimeoutRef.current);
      }
      hideHoveredLinkTimeoutRef.current = window.setTimeout(() => {
        setHoveredLink(null);
      }, 1500);
    };

    editorDom.addEventListener("mousemove", handleMouseMove);
    editorDom.addEventListener("mouseleave", clearHoveredLink);

    return () => {
      editorDom.removeEventListener("mousemove", handleMouseMove);
      editorDom.removeEventListener("mouseleave", clearHoveredLink);
      if (hideHoveredLinkTimeoutRef.current) {
        window.clearTimeout(hideHoveredLinkTimeoutRef.current);
      }
    };
  }, [editor]);

  const handleUnsetHoveredLink = React.useCallback(() => {
    if (!editor || !hoveredLink) {
      return;
    }

    editor
      .chain()
      .focus()
      .setTextSelection(hoveredLink.pos)
      .extendMarkRange("link")
      .unsetLink()
      .run();

    setHoveredLink(null);
  }, [editor, hoveredLink]);

  const imageMenuStyle: React.CSSProperties | null = selectedImage
    ? {
        position: "fixed",
        top: Math.max(12, selectedImage.rect.top - 48),
        left: selectedImage.rect.left + selectedImage.rect.width / 2,
        transform: "translateX(-50%)",
        zIndex: 70,
      }
    : null;

  const cropInlineStyle: React.CSSProperties | null = cropImageSrc
    ? (() => {
        const anchorRect = cropAnchorRect || selectedImage?.rect || null;

        if (!anchorRect) {
          return null;
        }

        const safeWidth = Math.max(120, Math.round(anchorRect.width));
        const safeHeight = Math.max(120, Math.round(anchorRect.height));
        const safeLeft = Math.max(8, Math.min(Math.round(anchorRect.left), window.innerWidth - safeWidth - 8));
        const safeTop = Math.max(8, Math.min(Math.round(anchorRect.top), window.innerHeight - safeHeight - 8));

        return {
          position: "fixed",
          top: safeTop,
          left: safeLeft,
          width: safeWidth,
          height: safeHeight,
          zIndex: 95,
        };
      })()
    : null;

  return (
    <div className="flex-1 w-full relative">
      {selectedImage && imageMenuStyle && !isCropping
        ? createPortal(
            <div
              style={imageMenuStyle}
              className="pointer-events-auto"
              data-wb-image-menu="true"
            >
              <div className="flex items-center gap-1.5 px-2 py-1 rounded-full border border-foreground/15 bg-background/95 shadow-2xl backdrop-blur-sm">
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleViewImage}
                  className="px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-foreground/80 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors"
                  title="Ver imagen"
                >
                  Ver
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleCropImage}
                  className="px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-foreground/80 hover:text-foreground hover:bg-foreground/10 rounded-full transition-colors"
                  title="Recortar imagen"
                >
                  Recortar
                </button>
                <button
                  type="button"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={handleDeleteImage}
                  className="px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-red-300 hover:text-red-200 hover:bg-red-500/10 rounded-full transition-colors"
                  title="Eliminar imagen"
                >
                  Eliminar
                </button>
              </div>
            </div>,
            document.body,
          )
        : null}

      {editor && (
        <BubbleMenu
          editor={editor}
          tippyOptions={{ duration: 100 }}
          shouldShow={({ editor: currentEditor }) => {
            const selection = currentEditor.state.selection;
            const isImageSelection =
              selection instanceof NodeSelection &&
              selection.node.type.name === "image";
            const isTextSelection = selection instanceof TextSelection;

            return !isCropping && !isImageSelection && isTextSelection && !selection.empty;
          }}
        >
          <div className="flex items-center gap-1 p-1 bg-background border border-foreground/10 rounded-md shadow-2xl">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors ${editor.isActive("bold") ? "text-primary bg-primary/10" : "text-foreground/60"}`}
              title="Negrita"
            >
              <span className="material-symbols-outlined text-lg">
                format_bold
              </span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors ${editor.isActive("italic") ? "text-primary bg-primary/10" : "text-foreground/60"}`}
              title="Cursiva"
            >
              <span className="material-symbols-outlined text-lg">
                format_italic
              </span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleUnderline().run()}
              className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors ${editor.isActive("underline") ? "text-primary bg-primary/10" : "text-foreground/60"}`}
              title="Subrayado"
            >
              <span className="material-symbols-outlined text-lg">
                format_underlined
              </span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleStrike().run()}
              className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors ${editor.isActive("strike") ? "text-primary bg-primary/10" : "text-foreground/60"}`}
              title="Tachado"
            >
              <span className="material-symbols-outlined text-lg">
                format_strikethrough
              </span>
            </button>

            <div className="w-px h-5 bg-foreground/10 mx-1 shrink-0" />

            {/* Color del texto */}
            <div className="relative">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setShowTextColor(!showTextColor);
                  setShowHighlightColor(false);
                }}
                className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors relative flex items-center justify-center ${showTextColor ? "text-primary bg-primary/10" : "text-foreground/60"}`}
                title="Color del texto"
              >
                <span className="material-symbols-outlined text-lg">
                  format_color_text
                </span>
                <span
                  className="w-3.5 h-0.5 mt-0.5 absolute bottom-1 rounded-full"
                  style={{ backgroundColor: currentTextColor }}
                />
              </button>
              {showTextColor && (
                <>
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowTextColor(false)}
                  />
                  <div className="absolute top-full left-0 mt-1.5 bg-background border border-foreground/10 rounded-lg p-2 shadow-2xl z-50 grid grid-cols-4 gap-1.5 w-36 animate-in fade-in zoom-in-95 duration-100">
                    {textColors.map((color) => (
                      <button
                        key={color.name}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          editor.chain().focus().setColor(color.value).run();
                          setShowTextColor(false);
                        }}
                        className="w-6 h-6 rounded-full border border-foreground/10 flex items-center justify-center hover:scale-110 transition-transform"
                        style={{
                          backgroundColor:
                            color.value === "hsl(var(--foreground))"
                              ? "#fff"
                              : color.value,
                        }}
                        title={color.name}
                      >
                        {currentTextColor === color.value && (
                          <span className="text-[10px] text-background font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                    <div className="col-span-4 mt-1 border-t border-foreground/10 pt-1 flex justify-center">
                      <label
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => textColorInputRef.current?.click()}
                        className="text-[10px] font-sans flex items-center gap-2 text-foreground/60 cursor-pointer hover:text-foreground relative"
                      >
                        <span className="material-symbols-outlined text-sm">palette</span> Custom
                        <input
                          ref={textColorInputRef}
                          type="color"
                          className="w-0 h-0 opacity-0 absolute pointer-events-none"
                          onChange={(e) => {
                            editor.chain().focus().setColor(e.target.value).run();
                            setShowTextColor(false);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Resaltado del texto */}
            <div className="relative">
              <button
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => {
                  setShowHighlightColor(!showHighlightColor);
                  setShowTextColor(false);
                }}
                className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors relative flex items-center justify-center ${showHighlightColor ? "text-primary bg-primary/10" : "text-foreground/60"}`}
                title="Color de resaltado"
              >
                <span className="material-symbols-outlined text-lg">
                  border_color
                </span>
                <span
                  className="w-3.5 h-0.5 mt-0.5 absolute bottom-1 rounded-full"
                  style={{
                    backgroundColor:
                      currentHighlightColor === "transparent"
                        ? "#fff"
                        : currentHighlightColor,
                  }}
                />
              </button>
              {showHighlightColor && (
                <>
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    className="fixed inset-0 z-40"
                    onClick={() => setShowHighlightColor(false)}
                  />
                  <div className="absolute top-full left-0 mt-1.5 bg-background border border-foreground/10 rounded-lg p-2 shadow-2xl z-50 grid grid-cols-3 gap-1.5 w-32 animate-in fade-in zoom-in-95 duration-100">
                    {highlightColors.map((color) => (
                      <button
                        key={color.name}
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => {
                          const isClear = color.value === "transparent";
                          isClear
                            ? editor.chain().focus().unsetHighlight().run()
                            : editor
                                .chain()
                                .focus()
                                .toggleHighlight({ color: color.value })
                                .run();
                          setShowHighlightColor(false);
                        }}
                        className="w-6 h-6 rounded border border-foreground/10 flex items-center justify-center hover:scale-110 transition-transform"
                        style={{
                          backgroundColor:
                            color.value === "transparent"
                              ? "rgba(255,255,255,0.05)"
                              : color.value,
                        }}
                        title={color.name}
                      >
                        {currentHighlightColor === color.value && (
                          <span className="text-[10px] text-foreground font-bold">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                    <div className="col-span-3 mt-1 border-t border-foreground/10 pt-1 flex justify-center">
                      <label
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => highlightColorInputRef.current?.click()}
                        className="text-[10px] font-sans flex items-center gap-2 text-foreground/60 cursor-pointer hover:text-foreground relative"
                      >
                        <span className="material-symbols-outlined text-sm">palette</span> Custom
                        <input
                          ref={highlightColorInputRef}
                          type="color"
                          className="w-0 h-0 opacity-0 absolute pointer-events-none"
                          onChange={(e) => {
                            const hex = e.target.value;
                            editor.chain().focus().toggleHighlight({ color: hex + "4D" }).run();
                            setShowHighlightColor(false);
                          }}
                        />
                      </label>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="w-px h-5 bg-foreground/10 mx-1 shrink-0" />

            {/* Enlace (Link) */}
            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                const url = window.prompt(
                  "Introduce la URL del enlace:",
                  "",
                );
                const normalizedUrl = (url || "").trim();
                const isOnlyProtocol =
                  normalizedUrl === "http://" || normalizedUrl === "https://";

                !isOnlyProtocol && normalizedUrl.length > 0
                  ? editor.chain().focus().setLink({ href: normalizedUrl }).run()
                  : null;
              }}
              className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors ${editor.isActive("link") ? "text-primary bg-primary/10" : "text-foreground/60"}`}
              title={editor.isActive("link") ? "Editar enlace" : "Insertar enlace"}
            >
              <span className="material-symbols-outlined text-lg">link</span>
            </button>

            <button
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => {
                onRequestComment ? onRequestComment() : null;
              }}
              className="p-1.5 rounded-md hover:bg-foreground/5 transition-colors text-foreground/60"
              title="Comentar selección"
            >
              <span className="material-symbols-outlined text-lg">add_comment</span>
            </button>
          </div>
        </BubbleMenu>
      )}
      <EditorContent 
        editor={editor} 
        className="h-full prose-editor" 
        style={{ 
          "--editor-zoom-font-size": `${20 * (zoom / 100)}px` 
        } as React.CSSProperties}
      />

      {hoveredLink
        ? createPortal(
            <button
              type="button"
              onMouseEnter={() => {
                if (hideHoveredLinkTimeoutRef.current) {
                  window.clearTimeout(hideHoveredLinkTimeoutRef.current);
                  hideHoveredLinkTimeoutRef.current = null;
                }
              }}
              onMouseLeave={() => {
                if (hideHoveredLinkTimeoutRef.current) {
                  window.clearTimeout(hideHoveredLinkTimeoutRef.current);
                }
                hideHoveredLinkTimeoutRef.current = window.setTimeout(() => {
                  setHoveredLink(null);
                }, 1500);
              }}
              onMouseDown={(e) => e.preventDefault()}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleUnsetHoveredLink();
              }}
              className="fixed z-[85] p-1 rounded-md bg-background border border-foreground/15 text-[hsl(var(--color-destructive))] hover:bg-[hsl(var(--color-destructive)/0.12)] shadow-xl transition-colors"
              style={{
                left: hoveredLink.rect.left + hoveredLink.rect.width / 2,
                top: hoveredLink.rect.top - 6,
                transform: "translate(-50%, -100%)",
              }}
              title="Quitar enlace"
            >
              <span className="material-symbols-outlined text-sm">link_off</span>
            </button>,
            document.body,
          )
        : null}

      {previewImageSrc
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] bg-black/70 backdrop-blur-sm flex items-center justify-center p-6"
              onClick={() => setPreviewImageSrc(null)}
            >
              <button
                type="button"
                className="absolute top-5 right-5 text-white/80 hover:text-white text-xs font-black uppercase tracking-[0.2em]"
                onClick={() => setPreviewImageSrc(null)}
              >
                Cerrar
              </button>
              <img
                src={previewImageSrc}
                alt="Vista previa"
                className="max-w-[90vw] max-h-[85vh] object-contain rounded-md border border-white/20 shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              />
            </div>,
            document.body,
          )
        : null}

      {cropImageSrc
        ? createPortal(
            <div style={cropInlineStyle || undefined} className="pointer-events-auto">
              <div className="relative w-full h-full rounded-md overflow-hidden">
                <ReactCrop
                  crop={cropSelection}
                  onChange={(nextCrop: Crop) => setCropSelection(nextCrop)}
                  onComplete={(pixelCrop: PixelCrop) => setCompletedCrop(pixelCrop)}
                  keepSelection
                  ruleOfThirds
                  className="w-full h-full"
                >
                  <img
                    ref={cropImageRef}
                    src={cropImageSrc}
                    alt="Recorte"
                    className="w-full h-full select-none"
                  />
                </ReactCrop>

                <div className="absolute top-2 right-2 z-20 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={restoreOriginalFromCrop}
                    className="px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/90 hover:text-white rounded-full bg-black/55 border border-white/20"
                  >
                    Original
                  </button>
                  <button
                    type="button"
                    onClick={closeCropModal}
                    className="px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/90 hover:text-white rounded-full bg-black/55 border border-white/20"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={applyCropFromModal}
                    className="px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-black rounded-full bg-primary border border-primary/60 hover:opacity-90"
                  >
                    Aplicar
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )
        : null}
    </div>
  );
};

export default BubbleToolbar;
