import { ReactRenderer } from '@tiptap/react';
import tippy, { Instance, Props } from 'tippy.js';
import MentionList from '@features/Editor/components/MentionList';
import { entityService } from '@repositories/entityService';
import { useAppStore } from '@features/App/store/useAppStore';
import { SuggestionOptions, SuggestionProps } from '@tiptap/suggestion';

/**
 * LÃ³gica de sugerencias para la extensiÃ³n Mention de Tiptap.
 * Conecta con el motor de base de datos local (entityService) y filtra por el proyecto actual.
 */
const suggestion: Omit<SuggestionOptions, 'editor'> = {
  items: async ({ query }: { query: string }) => {
    try {
      let projectId = useAppStore.getState().lastProjectId;
      
      // Fallback: Si el store no tiene el ID, intentamos obtenerlo por el nombre del proyecto en la URL
      if (!projectId) {
        const pathParts = window.location.pathname.split('/');
        const projectNameFromUrl = pathParts[2]; 
        
        if (projectNameFromUrl && projectNameFromUrl !== 'local') {
          try {
            const { projectService } = await import('@repositories/projectService');
            const project = await projectService.getByName(projectNameFromUrl);
            if (project) {
              projectId = project.id;
              useAppStore.getState().setLastProjectId(project.id);
            }
          } catch (e) {
             /* [LOG REMOVED] */
          }
        }
      }

      if (projectId) {
        // 2. Obtener todas las entidades del proyecto desde SQLite
        const entities = await entityService.getAllByProject(Number(projectId));

        // 3. Filtrar por el query del usuario (case-insensitive)
        return (entities || [])
          .filter(item => 
            item.nombre.toLowerCase().includes(query.toLowerCase())
          )
          .slice(0, 10) 
          .map(item => {
            const extra = item.contenido_json 
              ? (typeof item.contenido_json === 'string' ? JSON.parse(item.contenido_json) : item.contenido_json) 
              : {};
              
            return {
              id: item.id.toString(),
              label: item.nombre,
              type: item.tipo || 'Generic',
              description: item.descripcion || extra.definicion || ''
            };
          });
      }
      return [];
    } catch (err) {
      /* [LOG REMOVED] */
      return [];
    }
  },

  render: () => {
    let component: ReactRenderer | null = null;
    let popup: Instance<Props>[] | null = null;

    return {
      onStart: (props: SuggestionProps) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (props.clientRect) {
          popup = tippy('body', {
            getReferenceClientRect: props.clientRect as () => DOMRect,
            appendTo: () => document.body,
            content: component.element,
            showOnCreate: true,
            interactive: true,
            trigger: 'manual',
            placement: 'bottom-start',
          }) as unknown as Instance<Props>[];
        }
      },

      onUpdate(props: SuggestionProps) {
        if (component) {
          component.updateProps(props);
        }

        if (props.clientRect && popup) {
          popup[0].setProps({
            getReferenceClientRect: props.clientRect as () => DOMRect,
          });
        }
      },

      onKeyDown(props: { event: KeyboardEvent }): boolean {
        let result = false;
        if (props.event.key === 'Escape') {
          if (popup) popup[0].hide();
          result = true;
        } else {
          result = (component?.ref as { onKeyDown?: (p: unknown) => boolean } | null)?.onKeyDown?.(props) ?? false;
        }
        return result;
      },

      onExit() {
        if (popup && popup[0]) {
          popup[0].destroy();
        }
        if (component) {
          component.destroy();
        }
      },
    };
  },
};

export default suggestion;

