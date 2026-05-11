import { templateService } from '@repositories/templateService';
import { entityService } from '@repositories/entityService';
import { folderService } from '@repositories/folderService';
import { Plantilla, Valor, Carpeta } from '@domain/models/database';

/**
 * 📝 TEMPLATE USE CASE (Capa de Aplicación)
 * 
 * ORÍGENES DE LA REFACTORIZACIÓN:
 * Extraído desde:
 * - src/features/Settings/pages/ArchetypeManager.tsx
 * - src/features/Settings/components/TemplateManager.tsx
 * - src/features/Entities/components/DynamicAttributeForm.tsx
 * 
 * PROPÓSITO:
 * Gestionar la configuración de Arquetipos (Plantillas EAV) y la asignación
 * de valores de atributos dinámicos a las entidades del mundo.
 */
export class TemplateUseCase {
  
  // ==========================================
  // GESTIÓN DE PLANTILLAS/ARQUETIPOS
  // ==========================================

  /** Obtiene todos los arquetipos (globales y del proyecto) */
  static async getTemplates(projectId: number): Promise<Plantilla[]> {
    return await templateService.getAll(projectId);
  }

  /** Crea un nuevo arquetipo / plantilla de atributo */
  static async createTemplate(data: Omit<Plantilla, 'id' | 'created_at'>): Promise<Plantilla> {
    return await templateService.create(data);
  }

  /** Actualiza un arquetipo existente */
  static async updateTemplate(templateId: number, data: Partial<Omit<Plantilla, 'id' | 'project_id'>>): Promise<void> {
    await templateService.update(templateId, data);
  }

  /** Elimina un arquetipo (puede requerir limpieza en cascada según DB) */
  static async deleteTemplate(templateId: number): Promise<void> {
    await templateService.delete(templateId);
  }

  /** Obtiene las carpetas para poder filtrar o asignar plantillas por categoría */
  static async getProjectFolders(projectId: number): Promise<Carpeta[]> {
    return await folderService.getByProject(projectId);
  }

  // ==========================================
  // VALORES DE ATRIBUTOS (EAV)
  // ==========================================

  /** Obtiene todos los valores asignados a una entidad específica */
  static async getEntityValues(entityId: number): Promise<Valor[]> {
    return await entityService.getValues(entityId);
  }

  /** Añade un nuevo valor a un atributo para una entidad */
  static async addEntityValue(entityId: number, templateId: number, value: string): Promise<void> {
    return await entityService.addValue(entityId, templateId, value);
  }

  /** Actualiza el valor de un atributo de una entidad */
  static async updateEntityValue(valueId: number, newValue: string): Promise<void> {
    await entityService.updateValue(valueId, newValue);
  }

  /** Elimina un valor de atributo de una entidad */
  static async deleteEntityValue(valueId: number): Promise<void> {
    await entityService.deleteValue(valueId);
  }
}
