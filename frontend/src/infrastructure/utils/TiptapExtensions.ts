import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import CharacterCount from '@tiptap/extension-character-count'
import Underline from '@tiptap/extension-underline'
import TextStyle from '@tiptap/extension-text-style'
import Color from '@tiptap/extension-color'
import Highlight from '@tiptap/extension-highlight'
import TextAlign from '@tiptap/extension-text-align'
import Link from '@tiptap/extension-link'
import suggestion from './suggestion'
import slashSuggestion from './slashSuggestion'
import { AnyExtension, Extension } from '@tiptap/core'
import { Suggestion } from '@tiptap/suggestion'
import { SelectionHighlight } from './selectionHighlight'
import { AutoLinker } from './autoLinker'
import { Entidad } from '@domain/database'
import { PagePaginationPlugin } from '@features/Editor/utils/PagePaginationPlugin'

const SlashCommands = Extension.create({
  name: 'slashCommands',
  addOptions() {
    return {
      suggestion: {
        char: '/',
        ...slashSuggestion,
      },
    }
  },
  addProseMirrorPlugins() {
    return [
      Suggestion({
        editor: this.editor,
        ...this.options.suggestion,
      }),
    ]
  },
})

const PagePagination = Extension.create({
  name: 'pagePagination',
  addProseMirrorPlugins() {
    return [PagePaginationPlugin()];
  }
})

/**
 * Colección centralizada de extensiones para el editor Tiptap (ZenEditor).
 * Incluye soporte para menciones (@), comandos de barra (/), placeholders y conteo de caracteres.
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
  // Usamos nuestra nueva extensión funcional para evitar problemas de nodos fantasmas
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
  PagePagination,
];

