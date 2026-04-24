import { entityService } from '@repositories/entityService';
import { folderService } from '@repositories/folderService';
import { Entidad } from '@domain/models/database';

export interface DashboardStats {
  entityCount: number;
  folderCount: number;
  entitiesByType: { id: string; label: string; value: number; color: string }[];
  recentActivity: Entidad[];
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

    return {
      entityCount: entities.length,
      folderCount: folders.length,
      entitiesByType,
      // Devuelve las 5 más recientes
      recentActivity: entities.slice(0, 5)
    };
  }
}
