import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import CharacterCount from '@tiptap/extension-character-count'
import suggestion from './suggestion'
import slashSuggestion from './slashSuggestion'
import { AnyExtension } from '@tiptap/core'

/**
 * Colección centralizada de extensiones para el editor Tiptap (ZenEditor).
 * Incluye soporte para menciones (@), comandos de barra (/), placeholders y conteo de caracteres.
 */
export const getZenExtensions = (placeholderText: string = 'Escribe tu historia aquí...'): AnyExtension[] => [
  StarterKit,
  Placeholder.configure({
    placeholder: placeholderText,
  }),
  Mention.configure({
    HTMLAttributes: { 
        class: 'mention bg-primary/10 text-primary px-1.5 py-0.5 rounded-sm border border-primary/20 font-medium inline-block cursor-pointer hover:bg-primary/20 transition-colors' 
    },
    suggestion,
  }),
  // Extensión para Comandos de Barra (Slash Menu)
  Mention.extend({
    name: 'slashMenu',
  }).configure({
    HTMLAttributes: { 
        class: 'slash-command text-primary font-bold' 
    },
    suggestion: {
      ...slashSuggestion,
      char: '/',
    },
  }),
  CharacterCount,
];
