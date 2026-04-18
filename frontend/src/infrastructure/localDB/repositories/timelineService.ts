import { sql } from '../client';
import { Evento, DimensionLinea, Entidad } from '@domain/models/database';

export const timelineService = {
  async getByProject(projectId: number): Promise<Evento[]> {
    return await sql`SELECT * FROM eventos WHERE project_id = ${projectId} AND borrado = 0 ORDER BY fecha_simulada ASC` as Evento[];
  },

  async getByTimeline(timelineId: number): Promise<Evento[]> {
    return await sql`SELECT * FROM eventos WHERE timeline_id = ${timelineId} AND borrado = 0 ORDER BY fecha_simulada ASC` as Evento[];
  },

  async create(event: Omit<Evento, 'id' | 'borrado' | 'created_at'>): Promise<Evento> {
    const results = await sql`
      INSERT INTO eventos (titulo, descripcion, fecha_simulada, project_id, timeline_id, linea_id)
      VALUES (${event.titulo}, ${event.descripcion || ''}, ${event.fecha_simulada || ''}, ${event.project_id}, ${event.timeline_id || null}, ${event.linea_id || null})
      RETURNING *
    ` as Evento[];
    return results[0];
  },

  async update(id: number, updates: Partial<Omit<Evento, 'id' | 'project_id' | 'borrado' | 'created_at'>>): Promise<void> {
    if (updates.titulo) await sql`UPDATE eventos SET titulo = ${updates.titulo} WHERE id = ${id}`;
    if (updates.descripcion !== undefined) await sql`UPDATE eventos SET descripcion = ${updates.descripcion} WHERE id = ${id}`;
    if (updates.fecha_simulada !== undefined) await sql`UPDATE eventos SET fecha_simulada = ${updates.fecha_simulada} WHERE id = ${id}`;
    if (updates.timeline_id !== undefined) await sql`UPDATE eventos SET timeline_id = ${updates.timeline_id} WHERE id = ${id}`;
    if (updates.linea_id !== undefined) await sql`UPDATE eventos SET linea_id = ${updates.linea_id} WHERE id = ${id}`;
  },

  async delete(id: number): Promise<void> {
    // Soft Delete: Marcar como borrado
    await sql`UPDATE eventos SET borrado = 1 WHERE id = ${id}`;
  },

  // --- MÉTODOS DE MULTIVERSO (LÍNEAS) ---
  
  async getLinesByFolder(folderId: number): Promise<DimensionLinea[]> {
    return await sql`SELECT * FROM dimension_lineas WHERE carpeta_id = ${folderId}` as DimensionLinea[];
  },

  async createLine(line: Omit<DimensionLinea, 'id'>): Promise<DimensionLinea> {
    const res = await sql`
      INSERT INTO dimension_lineas (nombre, carpeta_id, color)
      VALUES (${line.nombre}, ${line.carpeta_id}, ${line.color || null})
      RETURNING *
    ` as DimensionLinea[];
    return res[0];
  },

  async deleteLine(id: number): Promise<void> {
    // Cascada: Marcar eventos de esta línea como borrados
    await sql`UPDATE eventos SET borrado = 1 WHERE linea_id = ${id}`;
    // Eliminar la línea físicamente
    await sql`DELETE FROM dimension_lineas WHERE id = ${id}`;
  },

  async updateLine(id: number, updates: Partial<Pick<DimensionLinea, 'nombre' | 'color'>>): Promise<void> {
    if (updates.nombre) await sql`UPDATE dimension_lineas SET nombre = ${updates.nombre} WHERE id = ${id}`;
    if (updates.color !== undefined) await sql`UPDATE dimension_lineas SET color = ${updates.color} WHERE id = ${id}`;
  },

  // --- MÉTODOS DE VINCULACIÓN DE ENTIDADES ---

  async linkEntity(eventId: number, entityId: number): Promise<void> {
    await sql`INSERT INTO eventos_entidades (evento_id, entidad_id) VALUES (${eventId}, ${entityId})`;
  },

  async unlinkEntity(eventId: number, entityId: number): Promise<void> {
    await sql`DELETE FROM eventos_entidades WHERE evento_id = ${eventId} AND entidad_id = ${entityId}`;
  },

  async getLinkedEntities(eventId: number): Promise<Entidad[]> {
    return await sql`
      SELECT e.* 
      FROM entidades e
      JOIN eventos_entidades ee ON e.id = ee.entidad_id
      WHERE ee.evento_id = ${eventId} AND e.borrado = 0
    ` as Entidad[];
  },

  async getByEntity(entityId: number): Promise<Evento[]> {
    return await sql`
      SELECT ev.* 
      FROM eventos ev
      JOIN eventos_entidades ee ON ev.id = ee.evento_id
      WHERE ee.entidad_id = ${entityId} AND ev.borrado = 0
      ORDER BY ev.fecha_simulada ASC
    ` as Evento[];
  }
};
