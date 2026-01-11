
import { MergeAttributes } from '@tiptap/core'
import Mention from '@tiptap/extension-mention'
import StarterKit from '@tiptap/starter-kit'
import { ReactRenderer } from '@tiptap/react'
import tippy from 'tippy.js'
import MentionList from './MentionList'

const suggestion = {
    items: ({ query }) => {
        // MOCK DATA FOR NOW - In production this should fetch from API
        // Filtering 5 mock items based on query
        return [
            'Geralt de Rivia',
            'Yennefer de Vengerberg',
            'Ciri',
            'Kaer Morhen',
            'Novigrad',
            'Imperio de Nilfgaard',
            'Jaskier',
        ].filter(item => item.toLowerCase().startsWith(query.toLowerCase())).slice(0, 5)
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

export const ZenExtensions = [
    StarterKit,
    // Mention.configure({
    //     HTMLAttributes: {
    //         class: 'bg-indigo-500/20 text-indigo-200 px-1 py-0.5 rounded border border-indigo-500/30 font-medium inline-block align-middle mx-0.5',
    //     },
    //     suggestion,
    // }),
]
