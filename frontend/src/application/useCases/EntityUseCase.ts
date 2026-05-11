import { entityService } from '@repositories/entityService';
import { Entidad } from '@domain/models/database';

/**
 * 👤 ENTITY USE CASE (Capa de Aplicación)
 * 
 * PROPÓSITO:
 * Centralizar las operaciones atómicas CRUD sobre las entidades (personajes, lugares, etc.)
 * y aislar a los componentes de UI de la base de datos subyacente.
 */
export class EntityUseCase {
  /** Obtiene una entidad por su ID */
  static async getById(id: number): Promise<Entidad | null> {
    return await entityService.getById(id);
  }

  /** Obtiene todas las entidades de un proyecto filtradas por tipo */
  static async getAllByProjectAndType(projectId: number, type: string): Promise<Entidad[]> {
    return await entityService.getAllByProjectAndType(projectId, type);
  }

  /** Obtiene todas las entidades de un proyecto (para selects, selectores) */
  static async getAllByProject(projectId: number): Promise<Entidad[]> {
    return await entityService.getAllByProject(projectId);
  }

  /** Obtiene todas las entidades que pertenecen a una carpeta específica */
  static async getByFolder(folderId: number): Promise<Entidad[]> {
    return await entityService.getByFolder(folderId);
  }

  /** Crea una nueva entidad */
  static async create(data: Omit<Entidad, 'id' | 'created_at' | 'fecha_creacion' | 'fecha_actualizacion' | 'borrado'>): Promise<Entidad> {
    return await entityService.create(data);
  }

  /** Actualiza los datos base de una entidad */
  static async update(id: number, data: Partial<Omit<Entidad, 'id' | 'project_id'>>): Promise<void> {
    await entityService.update(id, data);
  }

  /** Elimina lógicamente una entidad */
  static async delete(id: number): Promise<void> {
    await entityService.delete(id);
  }

  /** Mueve una entidad a otra carpeta */
  static async move(id: number, targetCarpetaId: number | null): Promise<void> {
    await entityService.move(id, targetCarpetaId);
  }
}
