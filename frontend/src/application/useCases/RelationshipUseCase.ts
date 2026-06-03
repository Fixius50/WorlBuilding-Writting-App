import { entityService } from '@repositories/entityService';
import { relationshipService } from '@repositories/relationshipService';
import { Relacion, RelacionEnriquecida } from '@domain/models/database';
import { folderService } from '@repositories/folderService';
import { Entidad, Carpeta } from '@domain/models/database';

/**
 * 🕸️ RELATIONSHIP USE CASE (Capa de Aplicación)
 * 
 * ORÍGENES DE LA REFACTORIZACIÓN:
 * Extraído desde:
 * - src/features/Relationships/components/RelationshipManager.tsx
 * - src/features/Graph/pages/GeneralGraphView.tsx
 * - src/features/Graph/components/EntityDatabase.tsx
 * - src/features/Genealogy/pages/GenealogyView.tsx
 * 
 * PROPÓSITO:
 * Centralizar la lógica de obtención de redes de entidades (grafos, árboles genealógicos) 
 * y la gestión de relaciones/vínculos entre ellas.
 */
export class RelationshipUseCase {
  
  // ==========================================
  // OBTENCIÓN DE REDES (GRAFOS/GENEALOGÍA)
  // ==========================================

  /** Obtiene todas las entidades y relaciones de un proyecto para mapear la red completa */
  static async getFullNetwork(projectId: number): Promise<{ entities: Entidad[], relationships: Relacion[] }> {
    const [entities, relationships] = await Promise.all([
      entityService.getAllByProject(projectId),
      relationshipService.getByProject(projectId)
    ]);
    return { entities, relationships };
  }

  /** Obtiene las carpetas para poder estructurar la base de datos visual o agrupar nodos */
  static async getNetworkFolders(projectId: number): Promise<Carpeta[]> {
    return await folderService.getByProject(projectId);
  }

  /** Obtiene una entidad específica por su ID (para ventanas de información en el grafo) */
  static async getEntityDetails(entityId: number): Promise<Entidad | null> {
    return await entityService.getById(entityId);
  }

  // ==========================================
  // GESTIÓN DE RELACIONES ESPECÍFICAS
  // ==========================================

  /** Obtiene los detalles de una relación enriquecida por su ID sin usar return en if */
  static async getRelationshipDetails(id: number): Promise<RelacionEnriquecida | null> {
    const rel = await relationshipService.getById(id);
    let result: RelacionEnriquecida | null = null;
    
    switch (!!rel) {
      case true: {
        const [origen, destino] = await Promise.all([
          entityService.getById(rel!.origen_id),
          entityService.getById(rel!.destino_id)
        ]);
        result = {
          ...rel!,
          nombre_origen: origen?.nombre || 'Desconocido',
          nombre_destino: destino?.nombre || 'Desconocido'
        };
        break;
      }
      default:
        break;
    }
    
    return result;
  }

  /** Obtiene las relaciones directas de una única entidad */
  static async getRelationshipsByEntity(entityId: number): Promise<RelacionEnriquecida[]> {
    return await relationshipService.getByEntity(entityId);
  }

  /** Crea una nueva relación entre dos entidades */
  static async createRelationship(data: Omit<Relacion, 'id' | 'created_at'>): Promise<Relacion> {
    return await relationshipService.create(data);
  }

  /** Actualiza los metadatos de una relación (tipo, peso, descripción) */
  static async updateRelationship(relationshipId: number, updates: Partial<Omit<Relacion, 'id' | 'project_id'>>): Promise<void> {
    await relationshipService.update(relationshipId, updates);
  }

  /** Elimina una relación específica */
  static async deleteRelationship(relationshipId: number): Promise<void> {
    await relationshipService.delete(relationshipId);
  }

  /** Guarda la posición de un nodo (entidad) en la tabla grafo_posiciones */
  static async saveNodePosition(entityId: number, x: number, y: number, context: string = 'general'): Promise<void> {
    await entityService.savePosition(entityId, x, y, context);
  }

  /** Obtiene las posiciones de todos los nodos de un proyecto y contexto específico */
  static async getAllNodePositions(projectId: number, context: string = 'general'): Promise<Record<number, { x: number, y: number }>> {
    const list = await entityService.getAllPositions(projectId, context);
    const positions: Record<number, { x: number, y: number }> = {};
    list.forEach(item => {
      positions[item.entidad_id] = { x: item.x, y: item.y };
    });
    return positions;
  }
}
