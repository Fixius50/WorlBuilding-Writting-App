import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import Mention from '@tiptap/extension-mention'
import CharacterCount from '@tiptap/extension-character-count'
import suggestion from './suggestion'
import slashSuggestion from './slashSuggestion'
import { AnyExtension, Extension } from '@tiptap/core'
import { Suggestion } from '@tiptap/suggestion'

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
        class: 'mention text-primary font-medium inline cursor-pointer hover:underline transition-colors' 
    },
    suggestion,
  }),
  // Usamos nuestra nueva extensión funcional para evitar problemas de nodos fantasmas
  SlashCommands,
  CharacterCount,
];
