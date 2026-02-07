import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'

import MentionList from '../jsx/components/editor/MentionList'
import api from './services/api' // Path relative to /js/

export default {
    items: async ({ query }) => {
        try {
            // Fetch all entities (Architecture unificada)
            const response = await api.get('/world-bible/entities');

            return response
                .filter(item => item.nombre.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 10) // Increase limit
                .map(item => ({
                    id: item.id,
                    label: item.nombre,
                    type: item.categoria || 'Generic',
                    subtype: item.tipoEspecial || null,
                    description: item.descripcion // For hover card
                }));
        } catch (err) {
            console.error(err);
            return [];
        }
    },

    render: () => {
        let component
        let popup

        return {
            onStart: props => {
                component = new ReactRenderer(MentionList, {
                    props,
                    editor: props.editor,
                })

                if (!props.clientRect) {
                    return
                }

                popup = tippy('body', {
                    getReferenceClientRect: props.clientRect,
                    appendTo: () => document.body,
                    content: component.element,
                    showOnCreate: true,
                    interactive: true,
                    trigger: 'manual',
                    placement: 'bottom-start',
                })
            },

            onUpdate(props) {
                component.updateProps(props)

                if (!props.clientRect) {
                    return
                }

                popup[0].setProps({
                    getReferenceClientRect: props.clientRect,
                })
            },

            onKeyDown(props) {
                if (props.event.key === 'Escape') {
                    popup[0].hide()

                    return true
                }

                return component.ref?.onKeyDown(props)
            },

            onExit() {
                popup[0].destroy()
                component.destroy()
            },
        }
    },
}
