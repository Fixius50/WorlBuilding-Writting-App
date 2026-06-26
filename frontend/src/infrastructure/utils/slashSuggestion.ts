import { ReactRenderer } from "@tiptap/react";
import type { Editor } from "@tiptap/core";
import tippy, { Instance as TippyInstance } from "tippy.js";
import { SlashMenuList } from "@features/Editor";
import { SuggestionProps } from "@tiptap/suggestion";

export default {
  items: ({ query }: { query: string }) => {
    const rawItems = [
      {
        title: "Texto Normal",
        label: "P",
        command: ({ editor }: { editor: Editor }) => {
          editor.chain().focus().setParagraph().run();
        },
      },
      {
        title: "Títulos",
        label: "H",
        subItems: [
          {
            title: "Título 1",
            label: "H1",
            command: ({ editor }: { editor: Editor }) => {
              editor.chain().focus().toggleHeading({ level: 1 }).run();
            },
          },
          {
            title: "Título 2",
            label: "H2",
            command: ({ editor }: { editor: Editor }) => {
              editor.chain().focus().toggleHeading({ level: 2 }).run();
            },
          },
          {
            title: "Título 3",
            label: "H3",
            command: ({ editor }: { editor: Editor }) => {
              editor.chain().focus().toggleHeading({ level: 3 }).run();
            },
          },
          {
            title: "Título 4",
            label: "H4",
            command: ({ editor }: { editor: Editor }) => {
              editor.chain().focus().toggleHeading({ level: 4 }).run();
            },
          },
          {
            title: "Título 5",
            label: "H5",
            command: ({ editor }: { editor: Editor }) => {
              editor.chain().focus().toggleHeading({ level: 5 }).run();
            },
          },
          {
            title: "Título 6",
            label: "H6",
            command: ({ editor }: { editor: Editor }) => {
              editor.chain().focus().toggleHeading({ level: 6 }).run();
            },
          },
        ],
      },
      {
        title: "Cita Narrativa",
        label: "99",
        command: ({ editor }: { editor: Editor }) => {
          editor.chain().focus().toggleBlockquote().run();
        },
      },
      {
        title: "Listas",
        label: "LI",
        subItems: [
          {
            title: "Lista de Viñetas",
            label: "•",
            command: ({ editor }: { editor: Editor }) => {
              editor.chain().focus().toggleBulletList().run();
            },
          },
          {
            title: "Lista Numerada",
            label: "1.",
            command: ({ editor }: { editor: Editor }) => {
              editor.chain().focus().toggleOrderedList().run();
            },
          },
        ],
      },
      {
        title: "Separador",
        label: "—",
        command: ({ editor }: { editor: Editor }) => {
          editor.chain().focus().setHorizontalRule().run();
        },
      },
    ];

    const cleanQuery = query.toLowerCase().trim();
    if (!cleanQuery) {
      return rawItems;
    }

    return rawItems
      .map((item) => {
        const itemMatches = item.title.toLowerCase().includes(cleanQuery);

        if (!item.subItems || item.subItems.length === 0) {
          return itemMatches ? item : null;
        }

        if (itemMatches) {
          return item;
        }

        const matchedSubItems = item.subItems.filter((sub) =>
          sub.title.toLowerCase().includes(cleanQuery),
        );

        return matchedSubItems.length > 0
          ? {
              ...item,
              subItems: matchedSubItems,
            }
          : null;
      })
      .filter(Boolean);
  },

  command: ({
    editor,
    range,
    props,
  }: SuggestionProps & {
    props: {
      command: (args: Pick<SuggestionProps, "editor" | "range">) => void;
    };
  }) => {
    // Usamos una transacción única para borrar y ejecutar, evitando saltos de línea
    editor.chain().focus().deleteRange(range).run();

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

        popup = tippy("body", {
          getReferenceClientRect: (props.clientRect ??
            (() => document.body.getBoundingClientRect())) as () => DOMRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: "manual",
          placement: "bottom-start",
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
        if (props.event.key === "Escape") {
          if (popup) popup[0].hide();
          result = true;
        } else {
          result = (
            component?.ref as { onKeyDown?: (p: unknown) => boolean } | null
          )?.onKeyDown?.(props);
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
