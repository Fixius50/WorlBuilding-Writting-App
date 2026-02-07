import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import React, { useEffect } from 'react'
import suggestion from '../../../js/suggestion'
import MentionHoverCard from './MentionHoverCard'; // ADDED

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
        renderLabel({ options, node }) {
          return `${node.attrs.label ?? node.attrs.id}`
        },
      }).extend({
        parseHTML() {
          return [
            { tag: 'span[data-type]' },
            { tag: 'span.mention' }
          ]
        },
        addAttributes() {
          return {
            id: {
              default: null,
              parseHTML: element => element.getAttribute('data-id'),
              renderHTML: attributes => ({
                'data-id': attributes.id,
              }),
            },
            label: {
              default: null,
              parseHTML: element => element.getAttribute('data-label'),
              renderHTML: attributes => ({
                'data-label': attributes.label,
              }),
            },
            type: {
              default: 'generic',
              parseHTML: element => element.getAttribute('data-type'),
              renderHTML: attributes => ({
                'data-type': attributes.type,
                'class': `mention mention-${attributes.type?.toLowerCase() || 'generic'}`,
              }),
            },
            desc: {
              default: null,
              parseHTML: element => element.getAttribute('data-desc'),
              renderHTML: attributes => ({
                'data-desc': attributes.desc,
              }),
            },
          }
        }
      }),
    ],
    content: content,
    editable: editable,
    onUpdate: ({ editor }) => {
      onUpdate(editor.getHTML())
    },
    editorProps: {
      attributes: {
        class: `prose ${paperMode ? 'prose-invert' : 'prose-invert'} max-w-none focus:outline-none min-h-[300px] p-8 ${paperMode ? 'text-slate-100' : 'text-foreground/90'} leading-relaxed text-lg transition-all`,
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

  /* Click Logic for Mention Card */
  const [activeMention, setActiveMention] = React.useState(null);

  useEffect(() => {
    const handleClick = (e) => {
      // 1. Check if clicked on a mention
      const mention = e.target.closest('.mention');

      if (mention) {
        e.preventDefault(); // Prevent editor cursor placement specific quirks if needed
        const rect = mention.getBoundingClientRect();
        setActiveMention({
          x: rect.left,
          y: rect.bottom,
          data: {
            label: mention.getAttribute('data-label') || mention.innerText.replace('@', ''),
            type: mention.getAttribute('data-type'),
            desc: mention.getAttribute('data-desc'),
            id: mention.getAttribute('data-id')
          }
        });
        return;
      }
    };

    const handleGlobalClick = (e) => {
      // If we have an active mention, and we click something that is NOT a mention and NOT the card...
      if (activeMention) {
        const isMention = e.target.closest('.mention');
        const isCard = e.target.closest('.mention-card-portal'); // We will add this class to the card

        if (!isMention && !isCard) {
          setActiveMention(null);
        }
      }
    };

    const container = document.querySelector('.zen-editor-container');
    if (container) {
      container.addEventListener('click', handleClick);
    }
    window.addEventListener('mousedown', handleGlobalClick);

    return () => {
      if (container) container.removeEventListener('click', handleClick);
      window.removeEventListener('mousedown', handleGlobalClick);
    };
  }, [activeMention]);



  /* ... inside return ... */

  return (
    <div className={`zen-editor-container w-full h-full overflow-y-auto no-scrollbar ${paperMode ? 'bg-transparent border-none shadow-none' : 'bg-card/20 rounded-lg border border-border/50'}`}>
      <EditorContent editor={editor} className="h-full" />
      {activeMention && (
        <MentionHoverCard
          x={activeMention.x}
          y={activeMention.y}
          data={activeMention.data}
          onClose={() => setActiveMention(null)}
        />
      )}
    </div>
  )
}

export default ZenEditor
