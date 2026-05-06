import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import React, { useEffect, useRef } from 'react'
import { getZenExtensions } from '@utils/TiptapExtensions'
import EditorTopBar from './EditorTopBar'
import { Hoja as HojaModel } from '@repositories/notebookService'

interface PageEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  numero: number;
  lado: 'izq' | 'der';
  isLastPage: boolean;
  onNearEnd: () => void;
  onJumpNext?: () => void;
  onJumpBack?: () => void;
  onAutoDelete?: () => void;
  autoFocus?: boolean;
}

const PageEditor: React.FC<PageEditorProps> = ({ 
  content, 
  onUpdate, 
  numero, 
  lado, 
  isLastPage, 
  onNearEnd, 
  onJumpNext,
  onJumpBack,
  onAutoDelete,
  autoFocus = false
}) => {
  const lastHeightRef = useRef(0);
  const isDeletingRef = useRef(false);

  const editor = useEditor({
    extensions: getZenExtensions('Empieza a escribir esta página...'),
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
      
      // Solo creamos página si estamos CRECIENDO y es la última página
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
        
        // Marcamos si estamos borrando para evitar disparar la creación de página por error
        if (event.key === 'Backspace') {
          isDeletingRef.current = true;
          setTimeout(() => { isDeletingRef.current = false; }, 100);
        } else {
          isDeletingRef.current = false;
        }

        // SALTO ADELANTE (Tab / Enter al final)
        if (event.key === 'Tab' || event.key === 'Enter') {
          const height = view.dom.scrollHeight;
          if (height > 950 && isAtEnd && onJumpNext) {
            event.preventDefault();
            onJumpNext();
            return true;
          }
        }

        // SALTO ATRÁS / BORRADO AUTO (Backspace al inicio)
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

  return (
    <div 
      className={`w-[40vw] h-[1200px] border border-white/10 bg-white/5 shadow-2xl relative flex flex-col mb-[60px] group transition-all duration-500`}
      style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}
    >
      <div className="h-[100px] flex items-center px-16 opacity-10 border-b border-white/5">
        <span className="text-[9px] font-mono uppercase tracking-[0.4em]">Manuscrito</span>
      </div>

      <div className="flex-1 overflow-hidden relative p-[40px_60px]">
         {editor && (
            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
              <div className="flex items-center gap-1 p-1 bg-background border border-foreground/10 shadow-2xl ">
                <button onClick={() => editor.chain().focus().toggleBold().run()} className={`p-2 hover:bg-foreground/10 ${editor.isActive('bold') ? 'text-primary' : 'text-foreground/60'}`}><span className="material-symbols-outlined text-lg">format_bold</span></button>
                <button onClick={() => editor.chain().focus().toggleItalic().run()} className={`p-2 hover:bg-foreground/10 ${editor.isActive('italic') ? 'text-primary' : 'text-foreground/60'}`}><span className="material-symbols-outlined text-lg">format_italic</span></button>
              </div>
            </BubbleMenu>
          )}
         <EditorContent editor={editor} className="h-full prose-editor" />
      </div>

      <div className={`h-[100px] flex items-center px-16 border-t border-white/5 opacity-30`}>
        <div className={`w-full flex ${lado === 'izq' ? 'justify-start' : 'justify-end'}`}>
          <span className="text-[11px] font-mono font-bold tracking-[0.5em]">PAGE {numero}</span>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .prose-editor .ProseMirror {
           height: 100% !important;
           max-height: 1000px !important;
           overflow: hidden !important;
           outline: none !important;
           text-align: justify;
        }
        /* Corregimos para que el placeholder no afecte a la altura visual */
        .prose-editor .ProseMirror p.is-editor-empty:first-child::before {
          content: attr(data-placeholder);
          float: left;
          color: #adb5bd;
          pointer-events: none;
          height: 0;
        }
      `}} />
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
}

const ZenEditor: React.FC<ZenEditorProps> = ({ 
  pages, 
  currentPageIndex,
  onUpdate, 
  onTitleChange,
  onCreatePage,
  onAutoDeletePage,
  onSnapshot,
  snapshots = [],
  onRestoreSnapshot = () => {},
  minimal = false
}) => {
  const [focusedPageIndex, setFocusedPageIndex] = React.useState<number | null>(null);
  const isCreatingPageRef = useRef(false);

  // Evitamos creaciones múltiples en ráfaga
  const handleAutoCreate = () => {
    if (isCreatingPageRef.current) return;
    isCreatingPageRef.current = true;
    onCreatePage();
    setTimeout(() => { isCreatingPageRef.current = false; }, 1000);
  };

  const pagePairs: HojaModel[][] = [];
  for (let i = 0; i < pages.length; i += 2) {
    pagePairs.push(pages.slice(i, i + 2));
  }

  const handleJumpNext = (currentIndex: number) => {
    if (currentIndex < pages.length - 1) {
      setFocusedPageIndex(currentIndex + 1);
    } else {
      handleAutoCreate();
      setFocusedPageIndex(currentIndex + 1);
    }
  };

  const handleJumpBack = (currentIndex: number) => {
    if (currentIndex > 0) {
      setFocusedPageIndex(currentIndex - 1);
    }
  };

  const currentPage = pages[currentPageIndex];

  return (
    <div className="flex flex-col w-full h-full bg-[#0a0a0a]">
      <EditorTopBar 
        title={currentPage?.titulo || 'Sin Título'}
        onTitleChange={(newTitle) => onTitleChange(currentPageIndex, newTitle)}
        wordCount={0} 
        wordGoal={2000} 
        saving={false} 
        onManualSnapshot={() => onSnapshot(currentPage?.contenido || '')}
        snapshots={snapshots}
        onRestoreSnapshot={onRestoreSnapshot}
        minimal={minimal}
      />

      <div className="flex-1 relative bg-[#0f0f0f] overflow-hidden">
        <div className="absolute inset-0 overflow-auto custom-scrollbar">
          <div className="w-full min-h-full py-[10vh] flex flex-col items-center">
            
            <div className="flex flex-col gap-[20px]">
              {pagePairs.map((pair, pairIndex) => (
                <div key={pairIndex} className="flex flex-row gap-[4vw]">
                  {pair.map((page, subIndex) => {
                    const globalIndex = pairIndex * 2 + subIndex;
                    const isLast = globalIndex === pages.length - 1;
                    return (
                      <PageEditor 
                        key={page.id || globalIndex}
                        content={page.contenido || ''}
                        onUpdate={(html) => onUpdate(html, globalIndex)}
                        numero={globalIndex + 1}
                        lado={subIndex === 0 ? 'izq' : 'der'}
                        isLastPage={isLast}
                        onNearEnd={handleAutoCreate}
                        onJumpNext={() => handleJumpNext(globalIndex)}
                        onJumpBack={() => handleJumpBack(globalIndex)}
                        onAutoDelete={() => onAutoDeletePage(globalIndex)}
                        autoFocus={focusedPageIndex === globalIndex}
                      />
                    );
                  })}
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default ZenEditor
