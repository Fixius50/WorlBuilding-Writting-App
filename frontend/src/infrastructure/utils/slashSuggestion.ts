import { ReactRenderer } from '@tiptap/react';
import tippy from 'tippy.js';
import SlashMenuList from '@features/Editor/components/SlashMenuList';

export default {
  items: ({ query }: { query: string }) => {
    return [
      {
        title: 'Encabezado 1',
        icon: 'format_h1',
        command: ({ editor }: any) => {
          editor.chain().focus().toggleHeading({ level: 1 }).run();
        },
      },
      {
        title: 'Encabezado 2',
        icon: 'format_h2',
        command: ({ editor }: any) => {
          editor.chain().focus().toggleHeading({ level: 2 }).run();
        },
      },
      {
        title: 'Lista de viñetas',
        icon: 'format_list_bulleted',
        command: ({ editor }: any) => {
          editor.chain().focus().toggleBulletList().run();
        },
      },
      {
        title: 'Cita',
        icon: 'format_quote',
        command: ({ editor }: any) => {
          editor.chain().focus().toggleBlockquote().run();
        },
      },
      {
        title: 'Separador',
        icon: 'horizontal_rule',
        command: ({ editor }: any) => {
          editor.chain().focus().setHorizontalRule().run();
        },
      },
    ].filter(item => item.title.toLowerCase().startsWith(query.toLowerCase()));
  },

  command: ({ editor, range, props }: any) => {
    // Usamos una transacción única para borrar y ejecutar, evitando saltos de línea
    editor.chain()
      .focus()
      .deleteRange(range)
      .run();
    
    // Ejecutamos la lógica del ítem (ej: toggleHeading)
    // Pasamos el editor ya enfocado
    props.command({ editor });
  },

  render: () => {
    let component: any;
    let popup: any;

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(SlashMenuList, {
          props,
          editor: props.editor,
        });

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        });
      },

      onUpdate(props: any) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }

        return component.ref?.onKeyDown(props);
      },

      onExit() {
        popup[0].destroy();
        component.destroy();
      },
    };
  },
};
