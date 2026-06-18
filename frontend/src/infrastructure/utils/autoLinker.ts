import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Entidad } from "@domain/database";

export const autoLinkerPluginKey = new PluginKey("autoLinker");

export interface AutoLinkerOptions {
  entities: Entidad[];
  onSuggestLink?: (entity: Entidad, range: { from: number; to: number }) => void;
}

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    autoLinker: {
      setAutoLinkerEntities: (entities: Entidad[]) => ReturnType;
    };
  }
}

export const AutoLinker = Extension.create<AutoLinkerOptions>({
  name: "autoLinker",

  addOptions() {
    return {
      entities: [],
      onSuggestLink: undefined,
    };
  },

  addCommands() {
    return {
      setAutoLinkerEntities: (entities: Entidad[]) => ({ tr }) => {
        this.options.entities = entities;
        return true;
      },
    };
  },

  addProseMirrorPlugins() {
    const extensionThis = this;
    let typingTimeout: ReturnType<typeof setTimeout> | null = null;

    return [
      new Plugin({
        key: autoLinkerPluginKey,
        view(editorView) {
          return {
            update(view, prevState) {
              const docChanged = !view.state.doc.eq(prevState.doc);
              
              docChanged ? (() => {
                typingTimeout ? clearTimeout(typingTimeout) : null;
                
                typingTimeout = setTimeout(() => {
                  const { state } = view;
                  const { selection } = state;
                  const $pos = selection.$from;
                  const parent = $pos.parent;
                  
                  const isParagraph = parent.type.name === "paragraph";
                  
                  isParagraph ? (() => {
                    const parentPos = $pos.start($pos.depth);
                    const text = parent.textContent;
                    
                    const entities = extensionThis.options.entities;
                    let foundMatch = false;
                    
                    for (let i = 0; i < entities.length; i++) {
                      const entity = entities[i];
                      const isNameTooShort = (entity.nombre || "").trim().length < 3;
                      const shouldProcess = !isNameTooShort;
                      
                      shouldProcess ? (() => {
                        const escapedName = entity.nombre.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
                        const regex = new RegExp(`\\b${escapedName}\\b`, "gi");
                        let match;
                        
                        while ((match = regex.exec(text)) !== null) {
                          const from = parentPos + match.index + 1;
                          const to = from + entity.nombre.length;
                          
                          let hasExistingLinkOrMention = false;
                          state.doc.nodesBetween(from, to, (node) => {
                            const isLinkOrMention = node.type.name === "mention" || node.marks.some(m => m.type.name === "link");
                            isLinkOrMention ? (hasExistingLinkOrMention = true) : null;
                          });
                          
                          const isEligibleForLink = !hasExistingLinkOrMention;
                          
                          isEligibleForLink ? (() => {
                            extensionThis.options.onSuggestLink ? extensionThis.options.onSuggestLink(entity, { from, to }) : null;
                            foundMatch = true;
                          })() : null;
                          
                          if (foundMatch) {
                            break;
                          }
                        }
                      })() : null;
                      
                      if (foundMatch) {
                        break;
                      }
                    }
                  })() : null;
                }, 500);
              })() : null;
            },
            destroy() {
              typingTimeout ? clearTimeout(typingTimeout) : null;
            },
          };
        },
      }),
    ];
  },
});
