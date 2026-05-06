import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import React, { useEffect, useState } from 'react'
import { getZenExtensions } from '@utils/TiptapExtensions'
import EditorTopBar from './EditorTopBar'
import { Hoja as HojaModel } from '@repositories/notebookService'

interface PageEditorProps {
  content: string;
  onUpdate: (html: string) => void;
  numero: number;
  lado: 'izq' | 'der';
}

// COMPONENTE DE PÁGINA INDIVIDUAL CON SU PROPIO EDITOR
const PageEditor: React.FC<PageEditorProps> = ({ content, onUpdate, numero, lado }) => {
  const editor = useEditor({
    extensions: getZenExtensions('Empieza a escribir esta página...'),
    content: content,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none text-foreground/90 leading-relaxed text-lg`,
        style: `font-family: "Cormorant Garamond", serif; font-size: 18px;`,
      },
    },
  });

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content, false);
    }
  }, [content, editor]);

  return (
    <div 
      className={`w-[40vw] h-[1200px] border border-white/10 bg-white/5 shadow-2xl relative flex flex-col mb-[60px] group transition-all duration-500`}
      style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.8)' }}
    >
      {/* Margen Superior */}
      <div className="h-[100px] flex items-center px-16 opacity-10 border-b border-white/5">
        <span className="text-[9px] font-mono uppercase tracking-[0.4em]">Manuscrito</span>
      </div>

      {/* ÁREA DE ESCRITURA (CONFINADA A LA HOJA CON MÁRGENES) */}
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

      {/* Margen Inferior con Número de Página */}
      <div className={`h-[100px] flex items-center px-16 border-t border-white/5 opacity-30`}>
        <div className={`w-full flex ${lado === 'izq' ? 'justify-start' : 'justify-end'}`}>
          <span className="text-[11px] font-mono font-bold tracking-[0.5em]">PAGE {numero}</span>
        </div>
      </div>
      
      <style dangerouslySetInnerHTML={{ __html: `
        .prose-editor .ProseMirror {
           height: 100% !important;
           outline: none !important;
           text-align: justify;
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
  onSnapshot,
  snapshots = [],
  onRestoreSnapshot = () => {},
  minimal = false
}) => {
  // Calculamos los pares de páginas para renderizarlos de dos en dos
  const pagePairs: HojaModel[][] = [];
  for (let i = 0; i < pages.length; i += 2) {
    pagePairs.push(pages.slice(i, i + 2));
  }

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
                    return (
                      <PageEditor 
                        key={page.id || globalIndex}
                        content={page.contenido || ''}
                        onUpdate={(html) => onUpdate(html, globalIndex)}
                        numero={globalIndex + 1}
                        lado={subIndex === 0 ? 'izq' : 'der'}
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
