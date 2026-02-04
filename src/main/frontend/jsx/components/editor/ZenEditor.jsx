import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import React, { useEffect } from 'react'
import suggestion from './suggestion' // We will create this next

const ZenEditor = ({ content, onUpdate, editable = true, paperMode = false }) => {
  // Load local settings for typography
  const [settings, setSettings] = React.useState({
    font: 'Cormorant Garamond',
    fontSize: 18
  });

  React.useEffect(() => {
    const savedSettings = localStorage.getItem('app_settings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const editor = useEditor({
    extensions: [
      StarterKit,
      Placeholder.configure({
        placeholder: 'Escribe tu historia aquí... Usa @ para mencionar entidades.',
      }),
      Mention.configure({
        HTMLAttributes: {
          class: 'mention',
        },
        suggestion,
      }),
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose ${paperMode ? 'prose-slate' : 'prose-invert'} max-w-none focus:outline-none min-h-[300px] p-8 ${paperMode ? 'text-slate-900' : 'text-foreground/90'} leading-relaxed text-lg transition-all`,
        style: `font-family: "${settings.font}", serif; font-size: ${settings.fontSize}px;`,
      },
    },
  })

  useEffect(() => {
    if (editor && content !== editor.getHTML()) {
      editor.commands.setContent(content)
    }
  }, [content, editor])

  if (!editor) {
    return null
  }

  return (
    <div className={`zen-editor-container w-full h-full overflow-y-auto no-scrollbar ${paperMode ? 'bg-transparent border-none shadow-none' : 'bg-card/20 rounded-lg border border-border/50'}`}>
      <EditorContent editor={editor} className="h-full" />
    </div>
  )
}

export default ZenEditor
