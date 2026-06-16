import { trashService } from '@repositories/trashService';

export interface TrashItem {
  id: number;
  item_tipo: string;
  nombre: string;
  deleted_date: string;
}

/**
 * 🗑️ TRASH USE CASE (Capa de Aplicación)
 * 
 * ORÍGENES DE LA REFACTORIZACIÓN:
 * Extraído desde:
 * - src/features/Trash/pages/TrashView.tsx
 * 
 * PROPÓSITO:
 * Centralizar la lógica de recuperación y purga definitiva de elementos borrados.
 * Abstrae a la UI de si estamos restaurando una carpeta o una entidad.
 */
export class TrashUseCase {
  
  /** Obtiene todos los elementos marcados como borrados (Soft Delete) */
  static async getDeletedItems(projectId: number): Promise<TrashItem[]> {
    const rawData = await trashService.getItems(projectId);
    // Realizamos el casting seguro aquí en lugar de en la UI
    return rawData as TrashItem[];
  }

  /** Restaura un elemento a su estado original */
  static async restoreItem(type: string, id: number): Promise<void> {
    if (!type || !id) throw new Error("Parámetros inválidos para restauración");
    await trashService.restore(type, id);
  }

  /** Elimina un elemento físicamente de la base de datos (Hard Delete) */
  static async purgeItem(type: string, id: number): Promise<void> {
    if (!type || !id) throw new Error("Parámetros inválidos para purga");
    await trashService.permanentlyDelete(type, id);
  }
}
