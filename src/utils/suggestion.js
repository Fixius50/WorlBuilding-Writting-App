import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'

import MentionList from '../features/Editor/components/MentionList'
import { entityService } from '../database/entityService'

export default {
    items: async ({ query }) => {
        try {
            // Fetch all entities locally (Unified Architecture)
            // Using project_id 1 as default for search if not provided in context
            // In a better version we would get current project from editor props
            const response = await entityService.getAllByProject(1); 

            return response
                .filter(item => item.nombre.toLowerCase().includes(query.toLowerCase()))
                .slice(0, 10) 
                .map(item => {
                    const extra = item.contenido_json ? JSON.parse(item.contenido_json) : {};
                    return {
                        id: item.id,
                        label: item.nombre,
                        type: item.tipo || 'Generic',
                        subtype: extra.tipoEspecial || null,
                        description: item.descripcion || extra.definicion 
                    };
                });
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
