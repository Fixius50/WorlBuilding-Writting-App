import { Extension } from "@tiptap/core";
import { Plugin, PluginKey } from "@tiptap/pm/state";
import { Decoration, DecorationSet } from "@tiptap/pm/view";

export interface CommentAnchorRange {
  id: number;
  from: number;
  to: number;
  resolved?: boolean;
}

interface CommentAnchorsPluginState {
  anchors: CommentAnchorRange[];
}

export const commentAnchorsPluginKey = new PluginKey<CommentAnchorsPluginState>("commentAnchors");

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    commentAnchors: {
      setCommentAnchors: (anchors: CommentAnchorRange[]) => ReturnType;
    };
  }
}

const normalizeAnchors = (anchors: CommentAnchorRange[]): CommentAnchorRange[] => {
  return anchors.filter((anchor) => {
    const hasValidId = Number.isFinite(anchor.id);
    const hasValidFrom = Number.isFinite(anchor.from);
    const hasValidTo = Number.isFinite(anchor.to);
    const hasRange = anchor.to > anchor.from;

    return hasValidId && hasValidFrom && hasValidTo && hasRange;
  });
};

export const CommentAnchors = Extension.create({
  name: "commentAnchors",

  addCommands() {
    return {
      setCommentAnchors:
        (anchors: CommentAnchorRange[]) =>
        ({ tr, dispatch }) => {
          const safeAnchors = normalizeAnchors(anchors || []);
          const nextTransaction = tr.setMeta(commentAnchorsPluginKey, {
            anchors: safeAnchors,
          });

          dispatch ? dispatch(nextTransaction) : null;
          return true;
        },
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin<CommentAnchorsPluginState>({
        key: commentAnchorsPluginKey,
        state: {
          init() {
            return { anchors: [] };
          },
          apply(tr, value) {
            const meta = tr.getMeta(commentAnchorsPluginKey) as
              | CommentAnchorsPluginState
              | undefined;
            return meta ? { anchors: normalizeAnchors(meta.anchors) } : value;
          },
        },
        props: {
          decorations(state) {
            const pluginState = commentAnchorsPluginKey.getState(state);
            const anchors = pluginState ? pluginState.anchors : [];

            if (!anchors.length) {
              return DecorationSet.empty;
            }

            const maxPos = state.doc.content.size;
            const decorations: Decoration[] = [];

            anchors.forEach((anchor) => {
              const safeFrom = Math.max(1, Math.min(Math.floor(anchor.from), maxPos));
              const safeTo = Math.max(safeFrom, Math.min(Math.floor(anchor.to), maxPos));

              if (safeTo <= safeFrom) {
                return;
              }

              decorations.push(
                Decoration.inline(safeFrom, safeTo, {
                  class: anchor.resolved ? "comment-anchor-range resolved" : "comment-anchor-range",
                }),
              );

              decorations.push(
                Decoration.widget(
                  safeFrom,
                  () => {
                    const widget = document.createElement("span");
                    widget.className = "comment-anchor-widget";
                    widget.setAttribute("aria-hidden", "true");
                    return widget;
                  },
                  { side: -1 },
                ),
              );
            });

            return DecorationSet.create(state.doc, decorations);
          },
        },
      }),
    ];
  },
});
