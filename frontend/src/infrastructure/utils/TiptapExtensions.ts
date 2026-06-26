import StarterKit from '@tiptap/starter-kit';
import Placeholder from '@tiptap/extension-placeholder';
import Mention from '@tiptap/extension-mention';
import CharacterCount from '@tiptap/extension-character-count';
import Underline from '@tiptap/extension-underline';
import TextStyle from '@tiptap/extension-text-style';
import Color from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import TextAlign from '@tiptap/extension-text-align';
import Link from '@tiptap/extension-link';
import suggestion from './suggestion';
import slashSuggestion from './slashSuggestion';
import { AnyExtension, Extension, Node, CommandProps } from '@tiptap/core';
import { Suggestion } from '@tiptap/suggestion';
import { SelectionHighlight } from './selectionHighlight';
import { AutoLinker } from './autoLinker';
import { Entidad } from '@domain/database';
import { PagePaginationPlugin } from '@features/Editor/utils/PagePaginationPlugin';

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    fontSize: {
      setFontSize: (fontSize: string) => ReturnType;
      unsetFontSize: () => ReturnType;
    };
    lineHeight: {
      setLineHeight: (lineHeight: string) => ReturnType;
      unsetLineHeight: () => ReturnType;
    };
    paragraphSpacing: {
      setParagraphSpacing: (marginTop: string | null, marginBottom: string | null) => ReturnType;
    };
    image: {
      setImage: (options: { src: string; alt?: string; title?: string; width?: string }) => ReturnType;
    };
  }
}

// 🔍 Extensión personalizada para cambiar el tamaño de la letra
export const FontSize: Extension = Extension.create({
  name: 'fontSize',
  addOptions() {
    return {
      types: ['textStyle'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element: HTMLElement): string | null => element.style.fontSize.replace(/['"]+/g, '') || null,
            renderHTML: (attributes: { fontSize?: string }): Record<string, string> => {
              const hasFont: boolean = !!attributes.fontSize;
              return hasFont ? { style: `font-size: ${attributes.fontSize}` } : {};
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setFontSize: (fontSize: string) => ({ chain }: CommandProps) => {
        return chain()
          .setMark('textStyle', { fontSize })
          .run();
      },
      unsetFontSize: () => ({ chain }: CommandProps) => {
        return chain()
          .setMark('textStyle', { fontSize: null })
          .removeEmptyTextStyle()
          .run();
      },
    } as any;
  },
});

// 📏 Extensión personalizada para interlineado
export const LineHeight: Extension = Extension.create({
  name: 'lineHeight',
  addOptions() {
    return {
      types: ['paragraph', 'heading'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          lineHeight: {
            default: null,
            parseHTML: (element: HTMLElement): string | null => element.style.lineHeight || null,
            renderHTML: (attributes: { lineHeight?: string }): Record<string, string> => {
              const hasLineHeight: boolean = !!attributes.lineHeight;
              return hasLineHeight ? { style: `line-height: ${attributes.lineHeight}` } : {};
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setLineHeight: (lineHeight: string) => ({ commands }: CommandProps) => {
        return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight }));
      },
      unsetLineHeight: () => ({ commands }: CommandProps) => {
        return this.options.types.every((type: string) => commands.updateAttributes(type, { lineHeight: null }));
      },
    } as any;
  },
});

// ↔️ Extensión personalizada para espaciado de párrafo antes y después
export const ParagraphSpacing: Extension = Extension.create({
  name: 'paragraphSpacing',
  addOptions() {
    return {
      types: ['paragraph'],
    };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          marginTop: {
            default: null,
            parseHTML: (element: HTMLElement): string | null => element.style.marginTop || null,
            renderHTML: (attributes: { marginTop?: string }): Record<string, string> => {
              const hasMarginTop: boolean = !!attributes.marginTop;
              return hasMarginTop ? { style: `margin-top: ${attributes.marginTop}` } : {};
            },
          },
          marginBottom: {
            default: null,
            parseHTML: (element: HTMLElement): string | null => element.style.marginBottom || null,
            renderHTML: (attributes: { marginBottom?: string }): Record<string, string> => {
              const hasMarginBottom: boolean = !!attributes.marginBottom;
              return hasMarginBottom ? { style: `margin-bottom: ${attributes.marginBottom}` } : {};
            },
          },
        },
      },
    ];
  },
  addCommands() {
    return {
      setParagraphSpacing: (marginTop: string | null, marginBottom: string | null) => ({ commands }: CommandProps) => {
        return commands.updateAttributes('paragraph', { marginTop, marginBottom });
      },
    } as any;
  },
});

// 🖼️ Extensión de nodo de imagen personalizada
export const CustomImage: Node = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  defining: true,
  selectable: true,
  draggable: true,
  isolating: true,

  addAttributes() {
    return {
      src: {
        default: null,
      },
      alt: {
        default: null,
      },
      title: {
        default: null,
      },
      width: {
        default: null,
        parseHTML: (element: HTMLElement): string | null => {
          const styleWidth = element.style.width;
          const attrWidth = element.getAttribute('width');
          const hasStyleWidth = !!styleWidth && styleWidth.trim().length > 0;
          const hasAttrWidth = !!attrWidth && attrWidth.trim().length > 0;

          return hasStyleWidth ? styleWidth : (hasAttrWidth ? attrWidth : null);
        },
      },
    };
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
      },
    ];
  },

  renderHTML({ HTMLAttributes }: { HTMLAttributes: Record<string, any> }) {
    const { width, style, ...rest } = HTMLAttributes;
    const baseStyle = typeof style === 'string' ? style : '';
    const widthStyle = width ? `width: ${width}; ` : '';
    const responsiveStyle = 'max-width: 100%; height: auto;';
    const mergedStyle = `${baseStyle}${baseStyle ? '; ' : ''}${widthStyle}${responsiveStyle}`.trim();

    return ['img', { ...rest, style: mergedStyle }];
  },

  addCommands() {
    return {
      setImage: (options: { src: string; alt?: string; title?: string; width?: string }) => ({ chain }: CommandProps) => {
        return chain()
          .insertContent({
            type: this.name,
            attrs: options,
          })
          .run();
      },
    } as any;
  },
});

const SlashCommands: Extension = Extension.create({
  name: 'slashCommands',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        ...slashSuggestion,
      },
    };
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ];
  },
});

const PagePagination: Extension = Extension.create({
  name: 'pagePagination',
  addProseMirrorPlugins() {
    return [PagePaginationPlugin()];
  }
});

const ENABLE_PAGE_PAGINATION = false;

/**
 * Colección centralizada de extensiones para el editor Tiptap (ZenEditor).
 * Incluye soporte para menciones (@), comandos de barra (/), placeholders, imágenes y espaciados.
 */
export const getZenExtensions = (
  placeholderText: string = 'Escribe tu historia aquí...',
  options?: {
    entities?: Entidad[];
    onSuggestLink?: (entity: Entidad, range: { from: number; to: number }) => void;
  }
): AnyExtension[] => [
  StarterKit,
  Placeholder.configure({
    placeholder: placeholderText,
  }),
  Mention.configure({
    HTMLAttributes: { 
        class: 'mention text-primary font-medium inline cursor-pointer hover:underline transition-colors' 
    },
    suggestion,
  }),
  SlashCommands,
  CharacterCount,
  Underline,
  TextStyle,
  Color,
  Highlight.configure({ multicolor: true }),
  TextAlign.configure({
    types: ['heading', 'paragraph'],
  }),
  Link.configure({
    openOnClick: false,
    HTMLAttributes: {
      class: 'text-primary underline cursor-pointer hover:text-primary/80 transition-colors',
    },
  }),
  SelectionHighlight.configure({
    active: false,
  }),
  AutoLinker.configure({
    entities: options?.entities || [],
    onSuggestLink: options?.onSuggestLink,
  }),
  ...(ENABLE_PAGE_PAGINATION ? [PagePagination] : []),
  CustomImage,
  FontSize,
  LineHeight,
  ParagraphSpacing,
];
