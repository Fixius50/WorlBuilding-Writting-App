import { useEditor, EditorContent, BubbleMenu } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import CharacterCount from '@tiptap/extension-character-count'
import React, { useEffect, useState, useCallback, useRef } from 'react'
import suggestion from '@utils/suggestion'
import slashSuggestion from '@utils/slashSuggestion'
import MentionHoverCard from './MentionHoverCard'
import EditorTopBar from './EditorTopBar'
import { EditorSettings, MentionData } from '@domain/models/writing'
import { useDashboardStore } from '@store/useDashboardStore'

interface ZenEditorProps {
  content: string;
  title: string;
  onUpdate: (html: string) => void;
  onTitleChange: (newTitle: string) => void;
  onSnapshot: (html: string) => void;
  snapshots?: { id: number; timestamp: string }[];
  onRestoreSnapshot?: (id: number) => void;
  editable?: boolean;
  onMentionClick?: (id: string) => void;
  minimal?: boolean;
}

const ZenEditor: React.FC<ZenEditorProps> = ({ 
  content, 
  title,
  onUpdate, 
  onTitleChange,
  onSnapshot,
  snapshots = [],
  onRestoreSnapshot = () => {},
  editable = true,
  onMentionClick = () => {},
  minimal = false
}) => {
  const [settings] = useState<EditorSettings>({
    font: 'Cormorant Garamond',
    fontSize: 18
  });

  const updateGlobalWordCount = useDashboardStore(state => state.updateWordCount);
  const [wordCount, setWordCount] = useState(0);
  const snapshotTimer = useRef<ReturnType<typeof setInterval> | null>(null);
  const mentionClickRef = useRef(onMentionClick);

  useEffect(() => {
    mentionClickRef.current = onMentionClick;
  }, [onMentionClick]);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Escribe tu historia aquí... Usa / para comandos o @ para mencionar.',
      }),
      Mention.configure({
        HTMLAttributes: { class: 'mention' },
        suggestion,
      }),
      Mention.extend({
        name: 'slashMenu',
      }).configure({
        HTMLAttributes: { class: 'slash-command' },
        suggestion: {
          ...slashSuggestion,
          char: '/',
        },
      }),
      CharacterCount,
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML());
      const words = editor.storage.characterCount?.words?.() || 0;
      setWordCount(words);
      updateGlobalWordCount(words);
    },
    editorProps: {
      attributes: {
        class: `prose prose-invert max-w-none focus:outline-none ${minimal ? 'min-h-[300px]' : 'min-h-[70vh]'} text-foreground/90 leading-relaxed text-lg pb-40 px-4 md:px-0`,
        style: `font-family: "${settings.font}", serif; font-size: ${settings.fontSize}px;`,
      },
      handleClick: (view, pos, event) => {
        const { target } = event;
        const mentionEl = (target as HTMLElement).closest('.mention');
        if (mentionEl) {
          const id = mentionEl.getAttribute('data-id');
          if (id && mentionClickRef.current) {
            mentionClickRef.current(id);
            return true;
          }
        }
        return false;
      }
    },
  });

  // Snapshot Logic: Auto 5 min
  useEffect(() => {
    snapshotTimer.current = setInterval(() => {
      if (editor && !editor.isEmpty) {
        onSnapshot(editor.getHTML());
      }
    }, 5 * 60 * 1000);

    return () => {
      if (snapshotTimer.current) clearInterval(snapshotTimer.current);
    };
  }, [editor, onSnapshot]);

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content);
      const words = editor.storage.characterCount?.words?.() || 0;
      setWordCount(words);
      updateGlobalWordCount(words);
    }
  }, [content, editor, updateGlobalWordCount]);

  if (!editor) return null;

  return (
    <div className="flex flex-col w-full h-full bg-background overflow-hidden">
      {/* HEADER DE PRODUCTIVIDAD */}
      <EditorTopBar 
        title={title}
        onTitleChange={onTitleChange}
        wordCount={wordCount}
        wordGoal={2000} 
        saving={false} 
        onManualSnapshot={() => onSnapshot(editor.getHTML())}
        snapshots={snapshots}
        onRestoreSnapshot={onRestoreSnapshot}
        minimal={minimal}
      />

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className={`max-w-4xl mx-auto ${minimal ? 'py-6' : 'py-20'} relative`}>
          
          {/* BUBBLE MENU (FORMATO RÁPIDO) */}
          {editor && (
            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }}>
              <div className="flex items-center gap-1 p-1 bg-background border border-foreground/10 shadow-2xl backdrop-blur-md">
                <button
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  className={`p-2 hover:bg-foreground/10 transition-colors ${editor.isActive('bold') ? 'text-primary' : 'text-foreground/60'}`}
                >
                  <span className="material-symbols-outlined text-lg">format_bold</span>
                </button>
                <button
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  className={`p-2 hover:bg-foreground/10 transition-colors ${editor.isActive('italic') ? 'text-primary' : 'text-foreground/60'}`}
                >
                  <span className="material-symbols-outlined text-lg">format_italic</span>
                </button>
                <div className="w-px h-4 bg-foreground/10 mx-1" />
                <button
                  onClick={() => {
                     const url = window.prompt('URL del enlace:');
                     if (url) (editor.chain().focus() as any).setLink({ href: url }).run();
                  }}
                  className={`p-2 hover:bg-foreground/10 transition-colors ${editor.isActive('link') ? 'text-primary' : 'text-foreground/60'}`}
                >
                  <span className="material-symbols-outlined text-lg">link</span>
                </button>
              </div>
            </BubbleMenu>
          )}

          <EditorContent editor={editor} />
        </div>
      </div>
    </div>
  )
}

export default ZenEditor
