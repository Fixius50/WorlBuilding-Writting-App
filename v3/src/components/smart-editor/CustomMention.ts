/**
 * CustomMention - Extensión TipTap personalizada para renderizar EntityChip
 * 
 * Extiende la extensión Mention base para usar React NodeView
 */

import { Mention, MentionOptions } from '@tiptap/extension-mention';
import { ReactNodeViewRenderer } from '@tiptap/react';
import { EntityChip } from './EntityChip';

export interface CustomMentionOptions extends MentionOptions {
    // Opciones adicionales si se necesitan
}

export const CustomMention = Mention.extend<CustomMentionOptions>({
    name: 'mention',

    addAttributes() {
        return {
            ...this.parent?.(),
            type: {
                default: 'character',
                parseHTML: element => element.getAttribute('data-type'),
                renderHTML: attributes => ({
                    'data-type': attributes.type,
                }),
            },
        };
    },

    addNodeView() {
        return ReactNodeViewRenderer(EntityChip);
    },
});

export default CustomMention;
