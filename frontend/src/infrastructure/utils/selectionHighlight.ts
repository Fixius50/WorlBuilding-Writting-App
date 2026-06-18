import { Extension } from "@tiptap/core";
import { Plugin, PluginKey, EditorState } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export const selectionHighlightPluginKey = new PluginKey("selectionHighlight");

const getDecorationsForMatches = (state: EditorState): DecorationSet => {
  const { selection, doc } = state;
  const isEmpty = selection.empty;
  
  const decorations: Decoration[] = [];
  const hasSelection = !isEmpty;
  
  hasSelection ? (() => {
    const selectedText = doc.textBetween(selection.from, selection.to).trim();
    const isValidSearch = selectedText.length > 0;
    
    isValidSearch ? doc.descendants((node, pos) => {
      const isTextNode = node.isText;
      isTextNode ? (() => {
        const nodeText = node.text || "";
        const lowerNodeText = nodeText.toLowerCase();
        const lowerSearchText = selectedText.toLowerCase();
        
        let index = lowerNodeText.indexOf(lowerSearchText);
        while (index !== -1) {
          const start = pos + index;
          const end = start + selectedText.length;
          
          const isCurrentSelection = start === selection.from && end === selection.to;
          
          const decoration = Decoration.inline(start, end, {
            class: isCurrentSelection ? "focus-match-selected" : "focus-match-highlight",
          });
          
          decorations.push(decoration);
          index = lowerNodeText.indexOf(lowerSearchText, index + 1);
        }
      })() : null;
      return true;
    }) : null;
  })() : null;

  const result = DecorationSet.create(doc, decorations);
  return result;
};

export interface SelectionHighlightOptions {
  active: boolean;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    selectionHighlight: {
      setSelectionHighlight: (active: boolean) => ReturnType;
    };
  }
}

export const SelectionHighlight = Extension.create<SelectionHighlightOptions>({
  name: "selectionHighlight",

  addOptions() {
    return {
      active: false,
    };
  },

  addCommands() {
    return {
      setSelectionHighlight: (active: boolean) => ({ tr, dispatch }) => {
        dispatch ? dispatch(tr.setMeta(selectionHighlightPluginKey, { active })) : null;
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    const extensionThis = this;
    
    return [
      new Plugin({
        key: selectionHighlightPluginKey,
        state: {
          init() {
            return { active: extensionThis.options.active };
          },
          apply(tr, value) {
            const meta = tr.getMeta(selectionHighlightPluginKey) as { active: boolean } | undefined;
            const newValue = meta ? { active: meta.active } : value;
            return newValue;
          },
        },
        props: {
          decorations(state) {
            const pluginState = selectionHighlightPluginKey.getState(state) as { active: boolean } | undefined;
            const active = pluginState ? pluginState.active : false;
            const result = active ? getDecorationsForMatches(state) : DecorationSet.empty;
            return result;
          },
        },
      }),
    ];
  },
});
