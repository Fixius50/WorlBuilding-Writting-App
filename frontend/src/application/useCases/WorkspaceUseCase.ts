import { projectService } from '@repositories/projectService';
import { folderService } from '@repositories/folderService';
import { entityService } from '@repositories/entityService';
import { syncService } from '@network/syncService';
import { settingsService } from '@repositories/settingsService';
import { Proyecto, Carpeta, Entidad, FolderType } from '@domain/models/database';

/**
 * 🏢 WORKSPACE USE CASE (Capa de Aplicación)
 * 
 * ORÍGENES DE LA REFACTORIZACIÓN:
 * Extraído desde:
 * - src/presentation/pages/WorkspaceSelector.tsx
 * - src/presentation/layout/ArchitectLayout.tsx
 * - src/presentation/layout/GlobalNotes.tsx
 * 
 * PROPÓSITO:
 * Gestionar a alto nivel los Proyectos (Cuadernos), copias de seguridad (Sincronización),
 * ajustes globales y la estructura raíz de las carpetas/entidades para la UI general.
 */
export class WorkspaceUseCase {
  
  // ==========================================
  // GESTIÓN DE PROYECTOS (CUADERNOS)
  // ==========================================

  /** Obtiene todos los proyectos disponibles */
  static async listProjects(): Promise<Proyecto[]> {
    return await projectService.list();
  }

  /** Obtiene un proyecto por su nombre */
  static async getProjectByName(name: string): Promise<Proyecto | null> {
    return await projectService.getByName(name);
  }

  /** Crea un nuevo proyecto */
  static async createProject(name: string, title: string, genre: string, imageUrl?: string): Promise<Proyecto> {
    return await projectService.create(name, title, genre, imageUrl);
  }

  /** Actualiza la configuración de un proyecto */
  static async updateProject(projectId: number, data: Partial<Proyecto>): Promise<void> {
    await projectService.update(projectId, data);
  }

  /** Elimina un proyecto entero y todo su contenido en cascada */
  static async deleteProject(projectId: number): Promise<void> {
    await projectService.delete(projectId);
  }

  // ==========================================
  // GESTIÓN DE ÁRBOL RAÍZ (ARCHITECT LAYOUT)
  // ==========================================

  /** Obtiene las carpetas raíz de un proyecto */
  static async getRootFolders(projectId: number): Promise<Carpeta[]> {
    return await folderService.getByProject(projectId);
  }

  /** Crea una nueva carpeta rápida */
  static async createFolder(name: string, projectId: number, parentId: number | null, type: FolderType): Promise<Carpeta> {
    return await folderService.create(name, projectId, parentId, type);
  }

  /** Renombra una carpeta */
  static async renameFolder(folderId: number, newName: string, projectId: number): Promise<void> {
    await folderService.update(folderId, newName, projectId);
  }

  /** Elimina una carpeta */
  static async deleteFolder(folderId: number): Promise<void> {
    await folderService.delete(folderId);
  }

  /** Obtiene una carpeta por su ID */
  static async getFolderById(folderId: number): Promise<Carpeta | null> {
    return await folderService.getById(folderId);
  }

  /** Obtiene subcarpetas de una carpeta específica */
  static async getSubfolders(folderId: number): Promise<Carpeta[]> {
    return await folderService.getSubfolders(folderId);
  }

  /** Obtiene la ruta completa (migas de pan) de una carpeta */
  static async getFolderPath(folderId: number): Promise<Carpeta[]> {
    return await folderService.getPath(folderId);
  }

  /** Crea una entidad rápida desde el layout */
  static async createQuickEntity(data: Omit<Entidad, 'id' | 'created_at' | 'fecha_creacion' | 'fecha_actualizacion' | 'borrado'>): Promise<Entidad> {
    return await entityService.create(data);
  }

  /** Elimina una entidad rápidamente desde el layout */
  static async deleteEntity(entityId: number): Promise<void> {
    await entityService.delete(entityId);
  }

  // ==========================================
  // SINCRONIZACIÓN Y COPIAS DE SEGURIDAD
  // ==========================================

  /** Exporta una instantánea de la DB local al servidor de backup */
  static async exportBackup(identifier: string) {
    return await syncService.exportToDisk(identifier);
  }

  /** Importa y restaura una instantánea desde el servidor de backup */
  static async importBackup(identifier: string) {
    return await syncService.importFromDisk(identifier);
  }

  // ==========================================
  // AJUSTES Y NOTAS GLOBALES
  // ==========================================

  /** Obtiene una configuración global (ej. notas temporales) */
  static async getSetting(key: string): Promise<string | null> {
    return await settingsService.get(key);
  }

  /** Guarda una configuración global */
  static async saveSetting(key: string, value: string): Promise<void> {
    await settingsService.set(key, value);
  }
}
