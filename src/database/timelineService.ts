import { sql } from './db';
import { Evento } from './types';

export const timelineService = {
 async getByProject(projectId: number): Promise<Evento[]> {
 return await sql`SELECT * FROM eventos WHERE project_id = ${projectId} ORDER BY fecha_simulada ASC` as Evento[];
 },

 async getByTimeline(timelineId: number): Promise<Evento[]> {
 return await sql`SELECT * FROM eventos WHERE timeline_id = ${timelineId} ORDER BY fecha_simulada ASC` as Evento[];
 },

 async create(event: Omit<Evento, 'id'>): Promise<Evento> {
 const results = await sql`
 INSERT INTO eventos (titulo, descripcion, fecha_simulada, project_id, timeline_id)
 VALUES (${event.titulo}, ${event.descripcion || ''}, ${event.fecha_simulada || ''}, ${event.project_id}, ${event.timeline_id || null})
 RETURNING *
 ` as Evento[];
 return results[0];
 },

 async update(id: number, updates: Partial<Omit<Evento, 'id' | 'project_id'>>): Promise<void> {
 if (updates.titulo) await sql`UPDATE eventos SET titulo = ${updates.titulo} WHERE id = ${id}`;
 if (updates.descripcion !== undefined) await sql`UPDATE eventos SET descripcion = ${updates.descripcion} WHERE id = ${id}`;
 if (updates.fecha_simulada !== undefined) await sql`UPDATE eventos SET fecha_simulada = ${updates.fecha_simulada} WHERE id = ${id}`;
 if (updates.timeline_id !== undefined) await sql`UPDATE eventos SET timeline_id = ${updates.timeline_id} WHERE id = ${id}`;
 },

 async delete(id: number): Promise<void> {
 await sql`DELETE FROM eventos WHERE id = ${id}`;
 }
};
