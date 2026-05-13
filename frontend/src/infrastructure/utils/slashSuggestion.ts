import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance as TippyInstance } from 'tippy.js';
import SlashMenuList from '@features/Editor/components/SlashMenuList';
import { SuggestionProps } from '@tiptap/suggestion';

export default {
  items: ({ query }: { query: string }) => {
    return [
      {
        title: 'Encabezado 1',
        icon: 'format_h1',
        command: ({ editor }: SuggestionProps) => {
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        },
      },
      {
        title: 'Encabezado 2',
        icon: 'format_h2',
        command: ({ editor }: SuggestionProps) => {
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        },
      },
      {
        title: 'Lista de viñetas',
        icon: 'format_list_bulleted',
        command: ({ editor }: SuggestionProps) => {
          editor.chain().focus().toggleBulletList().run();
        },
      },
      {
        title: 'Cita',
        icon: 'format_quote',
        command: ({ editor }: SuggestionProps) => {
          editor.chain().focus().toggleBlockquote().run();
        },
      },
      {
        title: 'Separador',
        icon: 'horizontal_rule',
        command: ({ editor }: SuggestionProps) => {
          editor.chain().focus().setHorizontalRule().run();
        },
      },
    ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
  },

  command: ({ editor, range, props }: SuggestionProps & { props: { command: (args: Pick<SuggestionProps, 'editor' | 'range'>) => void } }) => {
    // Usamos una transacción única para borrar y ejecutar, evitando saltos de línea
    editor.chain()
      .focus()
      .deleteRange(range)
      .run();
    
    // Ejecutamos la lógica del ítem (ej: toggleHeading)
    // Pasamos el editor ya enfocado
    props.command({ editor, range });
  },

  render: () => {
    let component: ReactRenderer | null = null;
    let popup: TippyInstance[] | null = null;

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(SlashMenuList, {
          props,
          editor: props.editor,
        });

        popup = tippy('body', {
          getReferenceClientRect: (props.clientRect ?? (() => document.body.getBoundingClientRect())) as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: SuggestionProps) {
        if (component) {
          component.updateProps(props);
        }

        if (props.clientRect && popup) {
          popup[0].setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });
        }
      },

      onKeyDown(props: { event: KeyboardEvent }) {
        let result: boolean | undefined = false;
        if (props.event.key === 'Escape') {
          if (popup) popup[0].hide();
          result = true;
        } else {
          result = (component?.ref as { onKeyDown?: (p: unknown) => boolean } | null)?.onKeyDown?.(props);
        }
        return result;
      },

      onExit() {
        if (popup) popup[0].destroy();
        if (component) component.destroy();
      },
    };
  },
};
