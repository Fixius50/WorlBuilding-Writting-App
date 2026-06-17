import { calendarService } from '@repositories/calendarService';
import { Calendario } from '@domain/database';

export class CalendarUseCase {
  static async getByProject(projectId: number): Promise<Calendario[]> {
    return await calendarService.getByProject(projectId);
  }
  
  static async create(data: Omit<Calendario, 'id' | 'borrado'>): Promise<number> {
    return await calendarService.create(data);
  }
  
  static async update(calendarId: number, data: Partial<Omit<Calendario, 'id' | 'project_id'>>): Promise<void> {
    await calendarService.update(calendarId, data);
  }
  
  static async delete(calendarId: number): Promise<void> {
    await calendarService.delete(calendarId);
  }
}
