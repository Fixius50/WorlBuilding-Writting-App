import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'

import MentionList from './MentionList'
import api from '../../../js/services/api' // Fixed path

export default {
    items: async ({ query }) => {
        try {
            // Mock API call or Real API call. 
            // We need an endpoint that searches entities.
            // Assuming api.get('/world-bible/entities') returns all, we filter client side for now or search endpoint
            // Ideally: api.get(`/world-bible/search?q=${query}`)

            // Using the existing endpoint pattern from previous code logic
            const response = await api.get('/world-bible/entities')
            return response
                .filter(item => item.nombre.toLowerCase().startsWith(query.toLowerCase()))
                .slice(0, 5)
                .map(item => ({ id: item.id, label: item.nombre }))
        } catch (err) {
            console.error(err)
            return []
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
