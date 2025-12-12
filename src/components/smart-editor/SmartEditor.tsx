'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Mention from '@tiptap/extension-mention';
import { useState, useCallback, useEffect } from 'react';

interface SmartEditorProps {
    className?: string;
}

// Mock entities for autocomplete (will be replaced with SQLite queries)
const mockEntities = [
    { id: '1', name: 'Gandalf', type: 'actor' },
    { id: '2', name: 'Mordor', type: 'location' },
    { id: '3', name: 'The One Ring', type: 'item' },
    { id: '4', name: 'Magic System', type: 'rule' },
];

export function SmartEditor({ className = '' }: SmartEditorProps) {
    const [wordCount, setWordCount] = useState(0);

    const editor = useEditor({
        immediatelyRender: false,
        extensions: [
            StarterKit.configure({
                heading: {
                    levels: [1, 2, 3],
                },
            }),
            Mention.configure({
                HTMLAttributes: {
                    class: 'mention',
                },
                suggestion: {
                    items: ({ query }: { query: string }) => {
                        return mockEntities
                            .filter(entity =>
                                entity.name.toLowerCase().includes(query.toLowerCase())
                            )
                            .slice(0, 5);
                    },
                    render: () => {
                        let popup: HTMLElement | null = null;
                        let selectedIndex = 0;

                        return {
                            onStart: (props: any) => {
                                popup = document.createElement('div');
                                popup.className = 'mention-popup absolute z-50 bg-card border border-border rounded-lg shadow-xl overflow-hidden';

                                const updatePopup = () => {
                                    if (!popup) return;
                                    popup.innerHTML = props.items.map((item: any, index: number) => `
                    <div class="px-3 py-2 cursor-pointer flex items-center gap-2 ${index === selectedIndex ? 'bg-primary/20' : 'hover:bg-secondary'}">
                      <span class="w-2 h-2 rounded-full ${item.type === 'actor' ? 'bg-green-500' :
                                            item.type === 'location' ? 'bg-blue-500' :
                                                item.type === 'item' ? 'bg-yellow-500' : 'bg-purple-500'
                                        }"></span>
                      <span>${item.name}</span>
                      <span class="text-xs text-muted-foreground ml-auto">${item.type}</span>
                    </div>
                  `).join('');
                                };

                                updatePopup();
                                document.body.appendChild(popup);

                                const { view } = props.editor;
                                const { from } = view.state.selection;
                                const coords = view.coordsAtPos(from);

                                popup.style.position = 'fixed';
                                popup.style.left = `${coords.left}px`;
                                popup.style.top = `${coords.bottom + 5}px`;
                            },
                            onUpdate: (props: any) => {
                                if (popup) {
                                    const items = props.items;
                                    popup.innerHTML = items.map((item: any, index: number) => `
                    <div class="px-3 py-2 cursor-pointer flex items-center gap-2 ${index === selectedIndex ? 'bg-primary/20' : 'hover:bg-secondary'}"
                         data-index="${index}">
                      <span class="w-2 h-2 rounded-full ${item.type === 'actor' ? 'bg-green-500' :
                                            item.type === 'location' ? 'bg-blue-500' :
                                                item.type === 'item' ? 'bg-yellow-500' : 'bg-purple-500'
                                        }"></span>
                      <span>${item.name}</span>
                      <span class="text-xs text-muted-foreground ml-auto">${item.type}</span>
                    </div>
                  `).join('');
                                }
                            },
                            onKeyDown: (props: any) => {
                                if (props.event.key === 'ArrowDown') {
                                    selectedIndex = (selectedIndex + 1) % props.items.length;
                                    return true;
                                }
                                if (props.event.key === 'ArrowUp') {
                                    selectedIndex = (selectedIndex - 1 + props.items.length) % props.items.length;
                                    return true;
                                }
                                if (props.event.key === 'Enter') {
                                    props.command(props.items[selectedIndex]);
                                    return true;
                                }
                                return false;
                            },
                            onExit: () => {
                                if (popup) {
                                    popup.remove();
                                    popup = null;
                                }
                                selectedIndex = 0;
                            },
                        };
                    },
                },
            }),
        ],
        content: `
      <h1>Welcome to Chronos Atlas</h1>
      <p>Start writing your narrative here. Use <strong>@</strong> to mention entities from your world.</p>
      <p>Try typing: @Gandalf or @Mordor</p>
    `,
        onUpdate: ({ editor }) => {
            const text = editor.getText();
            const words = text.split(/\s+/).filter(word => word.length > 0);
            setWordCount(words.length);
        },
        editorProps: {
            attributes: {
                class: 'prose prose-invert max-w-none focus:outline-none',
            },
        },
    });

    return (
        <div className={`flex flex-col h-full ${className}`}>
            {/* Editor Toolbar */}
            <div className="flex items-center gap-1 p-2 border-b border-border bg-card/50">
                <button
                    onClick={() => editor?.chain().focus().toggleBold().run()}
                    className={`p-1.5 rounded hover:bg-secondary transition-colors ${editor?.isActive('bold') ? 'bg-secondary' : ''}`}
                    title="Bold (Ctrl+B)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                    </svg>
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleItalic().run()}
                    className={`p-1.5 rounded hover:bg-secondary transition-colors ${editor?.isActive('italic') ? 'bg-secondary' : ''}`}
                    title="Italic (Ctrl+I)"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="19" y1="4" x2="10" y2="4" />
                        <line x1="14" y1="20" x2="5" y2="20" />
                        <line x1="15" y1="4" x2="9" y2="20" />
                    </svg>
                </button>
                <div className="w-px h-4 bg-border mx-1" />
                <button
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
                    className={`p-1.5 rounded hover:bg-secondary transition-colors text-xs font-bold ${editor?.isActive('heading', { level: 1 }) ? 'bg-secondary' : ''}`}
                    title="Heading 1"
                >
                    H1
                </button>
                <button
                    onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    className={`p-1.5 rounded hover:bg-secondary transition-colors text-xs font-bold ${editor?.isActive('heading', { level: 2 }) ? 'bg-secondary' : ''}`}
                    title="Heading 2"
                >
                    H2
                </button>
                <div className="w-px h-4 bg-border mx-1" />
                <button
                    onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    className={`p-1.5 rounded hover:bg-secondary transition-colors ${editor?.isActive('bulletList') ? 'bg-secondary' : ''}`}
                    title="Bullet List"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <circle cx="4" cy="6" r="1" fill="currentColor" />
                        <circle cx="4" cy="12" r="1" fill="currentColor" />
                        <circle cx="4" cy="18" r="1" fill="currentColor" />
                    </svg>
                </button>

                <div className="ml-auto text-xs text-muted-foreground">
                    {wordCount} words
                </div>
            </div>

            {/* Editor Content */}
            <div className="flex-1 overflow-auto p-4">
                <EditorContent editor={editor} className="h-full" />
            </div>
        </div>
    );
}
