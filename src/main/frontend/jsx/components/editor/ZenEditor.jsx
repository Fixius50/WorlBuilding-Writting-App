import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import React, { useEffect } from 'react'
import suggestion from './suggestion' // We will create this next

const ZenEditor = ({ content, onUpdate, editable = true }) => {
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
                class: 'prose prose-invert max-w-none focus:outline-none min-h-[300px] p-4 text-foreground/90 leading-relaxed font-serif text-lg',
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
        <div className="zen-editor-container w-full h-full overflow-y-auto no-scrollbar bg-card/20 rounded-lg border border-border/50">
            <EditorContent editor={editor} className="h-full" />
            <style jsx global>{`
        .mention {
          @apply bg-primary/20 text-primary-light font-medium rounded-sm px-1 py-0.5 cursor-pointer hover:bg-primary/30 decoration-clone;
        }
        .tiptap p.is-editor-empty:first-child::before {
          color: #6b7280;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
      `}</style>
        </div>
    )
}

export default ZenEditor
