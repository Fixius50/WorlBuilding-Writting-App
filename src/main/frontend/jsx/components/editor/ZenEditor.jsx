import React, { useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
/* 
   WORKAROUND: In version 3.x/beta of tiptap, menus seem to be split. 
   Package.json 'exports' shows "./menus" -> "./dist/menus/index.js".
   If this fails, we will try another path, but this matches the package.json definition.
*/
import { BubbleMenu, FloatingMenu } from '@tiptap/react/menus';

import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Typography from '@tiptap/extension-typography';

const ZenEditor = ({ content, onUpdate }) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Typography,
            Placeholder.configure({
                placeholder: 'Escribe algo increíble...',
            }),
        ],
        content: content || '',
        onUpdate: ({ editor }) => {
            const html = editor.getHTML();
            if (onUpdate) {
                onUpdate(html);
            }
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert prose-lg max-w-none focus:outline-none min-h-[500px] text-text-main font-serif leading-relaxed selection:bg-primary/30',
            },
        },
    });

    // Update content if it changes externally (careful with loops)
    useEffect(() => {
        if (editor && content !== editor.getHTML()) {
            // Only update if difference to avoid cursor jumps?
            // Usually need a diff check or just set content.
            // For now, let's assume one-way binding priority or check empty.
            if (editor.getText() === '' && content) {
                editor.commands.setContent(content);
            }
        }
    }, [content, editor]);

    if (!editor) {
        return null;
    }

    return (
        <div className="zen-editor-container relative w-full h-full">
            {/* BUBBLE MENU: Selection formatting */}
            <BubbleMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-surface-dark border border-glass-border rounded-lg shadow-xl overflow-hidden p-1 gap-1">
                <button
                    onClick={() => editor.chain().focus().toggleBold().run()}
                    className={`p-1 rounded hover:bg-white/10 ${editor.isActive('bold') ? 'text-primary' : 'text-text-muted'}`}
                >
                    <span className="material-symbols-outlined text-sm">format_bold</span>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleItalic().run()}
                    className={`p-1 rounded hover:bg-white/10 ${editor.isActive('italic') ? 'text-primary' : 'text-text-muted'}`}
                >
                    <span className="material-symbols-outlined text-sm">format_italic</span>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleStrike().run()}
                    className={`p-1 rounded hover:bg-white/10 ${editor.isActive('strike') ? 'text-primary' : 'text-text-muted'}`}
                >
                    <span className="material-symbols-outlined text-sm">strikethrough_s</span>
                </button>
            </BubbleMenu>

            {/* FLOATING MENU: Empty line actions */}
            <FloatingMenu editor={editor} tippyOptions={{ duration: 100 }} className="flex bg-surface-dark border border-glass-border rounded-lg shadow-xl overflow-hidden p-1 gap-1">
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-1 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 1 }) ? 'text-primary' : 'text-text-muted'}`}
                >
                    <span className="material-symbols-outlined text-sm">format_h1</span>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1 rounded hover:bg-white/10 ${editor.isActive('heading', { level: 2 }) ? 'text-primary' : 'text-text-muted'}`}
                >
                    <span className="material-symbols-outlined text-sm">format_h2</span>
                </button>
                <button
                    onClick={() => editor.chain().focus().toggleBulletList().run()}
                    className={`p-1 rounded hover:bg-white/10 ${editor.isActive('bulletList') ? 'text-primary' : 'text-text-muted'}`}
                >
                    <span className="material-symbols-outlined text-sm">format_list_bulleted</span>
                </button>
            </FloatingMenu>

            <EditorContent editor={editor} className="w-full h-full" />

            <style>{`
                /* Tiptap Placeholder */
                .ProseMirror p.is-editor-empty:first-child::before {
                    color: #adb5bd;
                    content: attr(data-placeholder);
                    float: left;
                    height: 0;
                    pointer-events: none;
                }
            `}</style>
        </div>
    );
};

export default ZenEditor;
