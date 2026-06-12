import { EditorContent, BubbleMenu } from "@tiptap/react";
import React from "react";
import EditorTopBar from "./EditorTopBar";
import { Hoja as HojaModel } from "@domain/models/database";
import { usePageEditor } from "./useZenEditor";

interface PageContentEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  onMentionClick?: (id: string) => void;
}

const PageContentEditor: React.FC<PageContentEditorProps> = ({ content, onUpdate, onMentionClick }) => {
  const { editor } = usePageEditor({
    content,
    onUpdate,
    isLastPage: false,
    onNearEnd: () => {},
    autoFocus: true,
    onMentionClick,
  });

  return (
    <div className="flex-1 w-full relative">
      {editor && (
        <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
          <div className="flex items-center gap-1 p-1 bg-background border border-foreground/10 rounded-md shadow-2xl">
            <button
              onClick={() => editor.chain().focus().toggleBold().run()}
              className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors ${editor.isActive("bold") ? "text-primary bg-primary/10" : "text-foreground/60"}`}
            >
              <span className="material-symbols-outlined text-lg">format_bold</span>
            </button>
            <button
              onClick={() => editor.chain().focus().toggleItalic().run()}
              className={`p-1.5 rounded-md hover:bg-foreground/5 transition-colors ${editor.isActive("italic") ? "text-primary bg-primary/10" : "text-foreground/60"}`}
            >
              <span className="material-symbols-outlined text-lg">format_italic</span>
            </button>
          </div>
        </BubbleMenu>
      )}
      <EditorContent editor={editor} className="h-full prose-editor" />
      <style
        dangerouslySetInnerHTML={{
          __html: `
            .prose-editor .ProseMirror {
               height: 100% !important;
               outline: none !important;
               font-family: "Cormorant Garamond", serif;
               font-size: 20px;
               line-height: 1.8;
               color: hsl(var(--foreground) / 0.9);
            }
            .prose-editor .ProseMirror p {
               margin-bottom: 1.2em;
               text-align: justify;
            }
            .prose-editor .ProseMirror p.is-editor-empty:first-child::before {
              content: attr(data-placeholder);
              float: left;
              color: var(--editor-placeholder);
              pointer-events: none;
              height: 0;
              text-indent: 0;
              font-style: italic;
            }
            /* Estilos de las menciones de Tiptap */
            .prose-editor .ProseMirror .mention {
              font-family: "Outfit", sans-serif;
              font-size: 15px;
            }
          `,
        }}
      />
    </div>
  );
};

interface ZenEditorProps {
  pages: HojaModel[];
  currentPageIndex: number;
  onUpdate: (html: string, index?: number) => void;
  onTitleChange: (index: number, newTitle: string) => void;
  onCreatePage: () => void;
  onAutoDeletePage: (index: number) => void;
  onSnapshot: (html: string) => void;
  snapshots?: { id: number; timestamp: string }[];
  onRestoreSnapshot?: (id: number) => void;
  onMentionClick?: (id: string) => void;
  minimal?: boolean;
  notebookTitle?: string;
  sidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const ZenEditor: React.FC<ZenEditorProps> = ({
  pages,
  currentPageIndex,
  onUpdate,
  onTitleChange,
  onSnapshot,
  snapshots = [],
  onRestoreSnapshot = () => {},
  onMentionClick,
  minimal = false,
  notebookTitle,
  sidebarOpen = true,
  onToggleSidebar,
}) => {
  const currentPage = pages[currentPageIndex];

  if (!currentPage) {
    return (
      <div className="flex-1 flex items-center justify-center bg-editor-elevated select-none">
        <span className="text-xs font-black uppercase tracking-widest text-foreground/20 font-sans">
          Crea una hoja para comenzar
        </span>
      </div>
    );
  }

  const wordCount = currentPage.contenido
    ? currentPage.contenido.replace(/<[^>]+>/g, "").trim().split(/\s+/).filter(Boolean).length
    : 0;

  return (
    <div className="flex flex-col w-full h-full bg-editor-base select-text">
      <EditorTopBar
        title={currentPage.titulo || `Hoja ${currentPageIndex + 1}`}
        onTitleChange={(newTitle) => onTitleChange(currentPageIndex, newTitle)}
        wordCount={wordCount}
        wordGoal={2000}
        saving={false}
        onManualSnapshot={() => onSnapshot(currentPage.contenido || "")}
        snapshots={snapshots}
        onRestoreSnapshot={onRestoreSnapshot}
        minimal={minimal}
        notebookTitle={notebookTitle}
        sidebarOpen={sidebarOpen}
        onToggleSidebar={onToggleSidebar}
      />

      <div className="flex-1 relative bg-editor-elevated overflow-y-auto custom-scrollbar flex justify-center py-16 px-6">
        <div className="w-full max-w-2xl flex flex-col gap-8 h-full">
          {/* TÍTULO EDITABLE EN EL PROPIO MANUSCRITO */}
          <input
            value={currentPage.titulo || ""}
            onChange={(e) => onTitleChange(currentPageIndex, e.target.value)}
            className="w-full bg-transparent border-none text-foreground font-serif font-semibold text-[38px] outline-none focus:ring-0 placeholder:text-foreground/15 p-0"
            placeholder={`Hoja ${currentPageIndex + 1}`}
          />

          {/* CUERPO DEL TEXTO */}
          <PageContentEditor
            content={currentPage.contenido || ""}
            onUpdate={(html) => onUpdate(html, currentPageIndex)}
            onMentionClick={onMentionClick}
          />
        </div>
      </div>
    </div>
  );
};

export default ZenEditor;

