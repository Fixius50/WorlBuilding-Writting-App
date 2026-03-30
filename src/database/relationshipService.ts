import { sql } from './db';

export interface Relacion {
  id: number;
  origen_id: number;
  destino_id: number;
  tipo: string;
  descripcion: string | null;
  project_id: number;
  origen_handle?: string | null;
  destino_handle?: string | null;
}

export const relationshipService = {
  async getByProject(projectId: number): Promise<Relacion[]> {
    return await sql<Relacion>`SELECT * FROM relaciones WHERE project_id = ${projectId}`;
  },

  async getByEntity(entityId: number): Promise<Relacion[]> {
    return await sql<Relacion>`
      SELECT r.*, e.nombre as nombreDestino, e.tipo as tipoEntidadDestino 
      FROM relaciones r
      LEFT JOIN entidades e ON r.destino_id = e.id
      WHERE r.origen_id = ${entityId} OR r.destino_id = ${entityId}
    `;
  },

  async create(rel: Omit<Relacion, 'id'>): Promise<Relacion> {
    const results = await sql<Relacion>`
      INSERT INTO relaciones (origen_id, destino_id, tipo, descripcion, project_id, origen_handle, destino_handle)
      VALUES (${rel.origen_id}, ${rel.destino_id}, ${rel.tipo}, ${rel.descripcion || ''}, ${rel.project_id}, ${rel.origen_handle || null}, ${rel.destino_handle || null})
      RETURNING *
    `;
    return results[0];
  },

  async delete(id: number): Promise<void> {
    await sql`DELETE FROM relaciones WHERE id = ${id}`;
  },

  async update(id: number, updates: Partial<Relacion>): Promise<void> {
    const fields: string[] = [];
    const vals: any[] = [];
    
    if (updates.tipo) { fields.push(`tipo = ${updates.tipo}`); }
    if (updates.descripcion !== undefined) { fields.push(`descripcion = ${updates.descripcion}`); }
    if (updates.origen_handle !== undefined) { fields.push(`origen_handle = ${updates.origen_handle}`); }
    if (updates.destino_handle !== undefined) { fields.push(`destino_handle = ${updates.destino_handle}`); }
    
    if (fields.length === 0) return;
    
    await sql`UPDATE relaciones SET ${fields.join(', ')} WHERE id = ${id}`;
  }
};
