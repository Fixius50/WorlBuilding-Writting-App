import { Plugin, PluginKey, EditorState, Transaction } from "@tiptap/pm/state";
import { Decoration, DecorationSet, EditorView } from "@tiptap/pm/view";

export const pagePaginationPluginKey: PluginKey = new PluginKey("pagePagination");

/**
 * 🎨 createPageBreakWidget
 * Crea el elemento del DOM correspondiente al widget de salto de página virtual A4.
 */
const createPageBreakWidget = (pageNumber: number): HTMLDivElement => {
  const wrapper: HTMLDivElement = document.createElement("div");
  wrapper.className = "virtual-page-break";
  wrapper.innerHTML = `
    <div class="page-footer">Capítulo — Página ${pageNumber}</div>
    <div class="page-break-line-wrapper">
      <div class="page-break-line"></div>
    </div>
    <div class="page-header">Página ${pageNumber + 1}</div>
  `;
  return wrapper;
};

/**
 * 📏 calculateDecorations
 * Mide las alturas de los nodos directos del editor en el DOM
 * y calcula dónde insertar decoraciones virtuales que simulen saltos de página A4.
 */
const calculateDecorations = (view: EditorView): Decoration[] => {
  const domElements: HTMLCollection = view.dom.children;
  const hasElements: boolean = domElements && domElements.length > 0;

  return hasElements ? (() => {
    const newDecorations: Decoration[] = [];
    const PAGE_HEIGHT_PX: number = 1050; // Altura aproximada de un folio A4 en pantalla a 96dpi (márgenes incluidos)
    
    // Obtener la altura física del título si existe en la primera página
    const titleEl: HTMLElement | null = view.dom.parentElement?.querySelector(".editor-title-input") as HTMLElement | null;
    const titleHeight: number = titleEl ? titleEl.offsetHeight : 0;
    
    let accumulatedHeight: number = titleHeight;
    let pageNumber: number = 1;

    Array.from(domElements).forEach((childNode: Element) => {
      const child: HTMLElement = childNode as HTMLElement;
      const isPageBreak: boolean = child.classList.contains("virtual-page-break");

      if (!isPageBreak) {
        const childHeight: number = child.offsetHeight;
        const style: CSSStyleDeclaration = window.getComputedStyle(child);
        const marginTop: number = parseFloat(style.marginTop || "0");
        const marginBottom: number = parseFloat(style.marginBottom || "0");
        
        accumulatedHeight += childHeight + marginTop + marginBottom;

        const mustBreak: boolean = accumulatedHeight > PAGE_HEIGHT_PX;
        if (mustBreak) {
          try {
            const pos: number = view.posAtDOM(child, 0);
            const decoration: Decoration = Decoration.widget(
              pos,
              (): HTMLDivElement => createPageBreakWidget(pageNumber),
              { side: -1 } // Renderiza justo antes del elemento que desborda
            );

            newDecorations.push(decoration);
            pageNumber++;
            accumulatedHeight = childHeight + marginTop + marginBottom; // Reiniciar con el elemento que desbordó
          } catch (e: unknown) {
            // Evitar fallos si ProseMirror no puede resolver el nodo en esa posición
          }
        }
      }
    });
    return newDecorations;
  })() : [];
};

/**
 * 📃 PagePaginationPlugin
 * Plugin de ProseMirror que implementa la simulación visual interactiva
 * de folios A4 con saltos de página automáticos y flujo de texto continuo.
 */
export const PagePaginationPlugin = (): Plugin => {
  return new Plugin({
    key: pagePaginationPluginKey,
    state: {
      init: (): DecorationSet => DecorationSet.empty,
      apply: (tr: Transaction, value: DecorationSet): DecorationSet => {
        const action: { decorations?: DecorationSet } | undefined = tr.getMeta(pagePaginationPluginKey);
        const hasAction: boolean = !!(action && action.decorations);
        return hasAction && action ? action.decorations! : value.map(tr.mapping, tr.doc);
      },
    },
    props: {
      decorations: (state: EditorState): DecorationSet | undefined => pagePaginationPluginKey.getState(state),
    },
    view: (editorView: EditorView) => {
      let isScheduled: boolean = false;

      const updateDecorations = (): void => {
        isScheduled = false;
        const isDestroyed: boolean = editorView.isDestroyed;

        if (!isDestroyed) {
          const decs: DecorationSet = DecorationSet.create(
            editorView.state.doc,
            calculateDecorations(editorView)
          );

          const currentDecs: DecorationSet | undefined = pagePaginationPluginKey.getState(editorView.state);
          const currentCount: number = currentDecs ? currentDecs.find().length : 0;
          const newCount: number = decs.find().length;

          const shouldUpdate: boolean = currentCount !== newCount || newCount > 0;
          if (shouldUpdate) {
            editorView.dispatch(
              editorView.state.tr.setMeta(pagePaginationPluginKey, {
                decorations: decs,
              })
            );
          }
        }
      };

      // Calcular la primera vez tras el render inicial
      setTimeout(updateDecorations, 50);

      return {
        update: (view: EditorView, prevState: EditorState): void => {
          const shouldTrigger: boolean = view.state.doc !== prevState.doc && !isScheduled;
          if (shouldTrigger) {
            isScheduled = true;
            setTimeout(updateDecorations, 10);
          }
        },
        destroy: (): void => {
          isScheduled = false;
        }
      };
    },
  });
};
