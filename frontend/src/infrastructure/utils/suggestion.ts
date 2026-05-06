import { ReactRenderer } from '@tiptap/react'
import tippy, { Instance, Props } from 'tippy.js'
import MentionList from '@features/Editor/components/MentionList'
import { entityService } from '@repositories/entityService'
import { useAppStore } from '@store/useAppStore'
import { SuggestionOptions } from '@tiptap/suggestion'

/**
 * Lógica de sugerencias para la extensión Mention de Tiptap.
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
             console.error("Error en fallback de menciones:", e);
          }
        }
      }

      if (!projectId) {
        return [];
      }

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
    } catch (err) {
      console.error('Error al obtener sugerencias de menciones:', err);
      return [];
    }
  },

  render: () => {
    let component: any;
    let popup: Instance<Props>[];

    return {
      onStart: (props: any) => {
        component = new ReactRenderer(MentionList, {
          props,
          editor: props.editor,
        });

        if (!props.clientRect) {
          return;
        }

        popup = tippy('body', {
          getReferenceClientRect: props.clientRect,
          appendTo: () => document.body,
          content: component.element,
          showOnCreate: true,
          interactive: true,
          trigger: 'manual',
          placement: 'bottom-start',
        }) as unknown as Instance<Props>[];
      },

      onUpdate(props: any) {
        component.updateProps(props);

        if (!props.clientRect) {
          return;
        }

        popup[0].setProps({
          getReferenceClientRect: props.clientRect,
        });
      },

      onKeyDown(props: any) {
        if (props.event.key === 'Escape') {
          popup[0].hide();
          return true;
        }

        return component.ref?.onKeyDown(props);
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
