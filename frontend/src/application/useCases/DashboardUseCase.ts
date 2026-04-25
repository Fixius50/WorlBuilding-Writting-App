import { entityService } from '@repositories/entityService';
import { folderService } from '@repositories/folderService';
import { notebookService } from '@repositories/notebookService';
import { Entidad } from '@domain/models/database';

export interface DashboardStats {
  entityCount: number;
  folderCount: number;
  entitiesByType: { id: string; label: string; value: number; color: string }[];
  recentActivity: Entidad[];
  wordCount: number;
  pageCount: number;
  notebookCount: number;
}

export class DashboardUseCase {
  static async getStats(projectId: number): Promise<DashboardStats> {
    const entities = await entityService.getAllByProject(projectId);
    const folders = await folderService.getByProject(projectId);
    
    // Agrupar por tipo
    const typeMap: Record<string, number> = {};
    entities.forEach(e => {
      const type = e.tipo || 'Sin tipo';
      typeMap[type] = (typeMap[type] || 0) + 1;
    });

    const entitiesByType = Object.entries(typeMap).map(([id, value]) => ({
      id,
      label: id,
      value,
      color: `hsl(${Math.random() * 360}, 70%, 50%)`
    }));

    // Datos de Escritura
    const notebooks = await notebookService.getAllByProject(projectId);
    let pageCount = 0;
    let wordCount = 0;

    for (const nb of notebooks) {
      const pages = await notebookService.getPagesByNotebook(nb.id);
      pageCount += pages.length;
      pages.forEach(p => {
        const text = p.contenido || '';
        // Limpieza básica de HTML si es necesario, pero split funciona aceptablemente
        wordCount += text.trim().split(/\s+/).filter(Boolean).length;
      });
    }

    return {
      entityCount: entities.length,
      folderCount: folders.length,
      entitiesByType,
      recentActivity: entities.slice(0, 5),
      wordCount,
      pageCount,
      notebookCount: notebooks.length
    };
  }
}
