import { folderService } from '@repositories/folderService';
import { timelineService } from '@repositories/timelineService';
import { entityService } from '@repositories/entityService';
import { Carpeta, Evento, Entidad } from '@domain/models/database';

/**
 * ⏳ TIMELINE USE CASE (Capa de Aplicación)
 * 
 * ORÍGENES DE LA REFACTORIZACIÓN:
 * Extraído desde:
 * - src/features/Timeline/pages/TimelineView.tsx
 * - src/features/Timeline/components/EventInspector.tsx
 * 
 * PROPÓSITO:
 * Centralizar la lógica de universos, líneas de tiempo, eventos y sus relaciones con entidades.
 */
export class TimelineUseCase {
  
  // ==========================================
  // GESTIÓN DE UNIVERSOS Y LÍNEAS (CARPETAS)
  // ==========================================

  /** Obtiene todos los universos (carpetas raíz de tipo TIMELINE) del proyecto */
  static async getUniverses(projectId: number): Promise<Carpeta[]> {
    return await folderService.getByProject(projectId);
  }

  /** Crea un nuevo universo (carpeta raíz de tipo TIMELINE) */
  static async createUniverse(name: string, projectId: number): Promise<Carpeta> {
    const safeName = name.trim() || 'Nuevo Universo';
    return await folderService.create(safeName, projectId, null, 'TIMELINE');
  }

  /** Crea una nueva línea temporal dentro de un universo */
  static async createTimeline(name: string, projectId: number, universeId: number): Promise<Carpeta> {
    const safeName = name.trim() || 'Nueva Línea';
    return await folderService.create(safeName, projectId, universeId, 'TIMELINE');
  }

  /** Actualiza el nombre de un universo o línea */
  static async updateTimelineFolder(folderId: number, newName: string, projectId: number): Promise<void> {
    const safeName = newName.trim();
    if (!safeName) return;
    await folderService.update(folderId, safeName, projectId);
  }

  /** Elimina un universo (y todo su contenido en cascada) */
  static async deleteUniverse(universeId: number): Promise<void> {
    await folderService.delete(universeId);
  }

  /** Elimina una línea temporal (carpeta) y sus eventos asociados */
  static async deleteTimeline(timelineId: number): Promise<void> {
    await folderService.delete(timelineId);
    await timelineService.deleteLine(timelineId);
  }

  // ==========================================
  // EVENTOS (SUCESOS)
  // ==========================================

  static async getLinesByFolder(folderId: number): Promise<Entidad[]> {
    return await timelineService.getLinesByFolder(folderId);
  }

  static async getByTimeline(timelineId: number): Promise<Evento[]> {
    return await timelineService.getByTimeline(timelineId);
  }

  static async create(data: Omit<Evento, 'id' | 'borrado' | 'created_at'>): Promise<Evento> {
    return await timelineService.create(data);
  }

  static async update(id: number, updates: Partial<Omit<Evento, 'id' | 'project_id' | 'borrado' | 'created_at'>>): Promise<void> {
    return await timelineService.update(id, updates);
  }

  static async delete(id: number): Promise<void> {
    return await timelineService.delete(id);
  }

  /** Obtiene todos los eventos asociados a una entidad */
  static async getEventsByEntity(entityId: number): Promise<Evento[]> {
    return await timelineService.getByEntity(entityId);
  }

  /** Obtiene todos los eventos de un universo entero (incluyendo todas sus líneas) */
  static async getEventsByUniverse(universeId: number): Promise<Evento[]> {
    return await timelineService.getByTimeline(universeId);
  }

  /** Obtiene el detalle de un evento */
  static async getEventById(eventId: number): Promise<Evento | null> {
    return await timelineService.getById(eventId);
  }

  /** Crea un evento nuevo */
  static async createEvent(data: Omit<Evento, 'id' | 'borrado' | 'created_at'>): Promise<Evento> {
    return await timelineService.create(data);
  }

  /** Actualiza un evento */
  static async updateEvent(id: number, updates: Partial<Omit<Evento, 'id' | 'project_id' | 'borrado' | 'created_at'>>): Promise<void> {
    await timelineService.update(id, updates);
  }

  /** Elimina un evento (Soft Delete) */
  static async deleteEvent(eventId: number): Promise<void> {
    await timelineService.delete(eventId);
  }

  // ==========================================
  // VINCULACIÓN DE ENTIDADES
  // ==========================================

  /** Obtiene todas las entidades del proyecto (para el selector de vinculación) */
  static async getAllEntities(projectId: number): Promise<Entidad[]> {
    return await entityService.getAllByProject(projectId);
  }

  /** Obtiene las entidades vinculadas a un evento */
  static async getLinkedEntities(eventId: number): Promise<Entidad[]> {
    return await timelineService.getLinkedEntities(eventId);
  }

  /** Vincula una entidad a un evento */
  static async linkEntity(eventId: number, entityId: number): Promise<void> {
    await timelineService.linkEntity(eventId, entityId);
  }

  /** Desvincula una entidad de un evento */
  static async unlinkEntity(eventId: number, entityId: number): Promise<void> {
    await timelineService.unlinkEntity(eventId, entityId);
  }
}
