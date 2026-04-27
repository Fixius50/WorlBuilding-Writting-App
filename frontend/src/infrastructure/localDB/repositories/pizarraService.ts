import { sql } from '../client';

export interface Pizarra {
  id: number;
  titulo: string;
  project_id: number;
  carpeta_id: number | null;
  nodos_json: string;
  aristas_json: string;
  viewport_json: string;
  fecha_creacion: string;
}

export const pizarraService = {
  async getByProject(projectId: number): Promise<Pizarra[]> {
    const result = await sql`SELECT * FROM pizarras WHERE project_id = ${projectId} ORDER BY fecha_creacion DESC`;
    return result as Pizarra[];
  },

  async getById(id: number): Promise<Pizarra | null> {
    const result = await sql`SELECT * FROM pizarras WHERE id = ${id}`;
    return (result[0] as Pizarra) || null;
  },

  async create(pizarra: Omit<Pizarra, 'id' | 'fecha_creacion'>): Promise<number> {
    const result = await sql`
      INSERT INTO pizarras (titulo, project_id, carpeta_id, nodos_json, aristas_json, viewport_json)
      VALUES (${pizarra.titulo}, ${pizarra.project_id}, ${pizarra.carpeta_id}, ${pizarra.nodos_json}, ${pizarra.aristas_json}, ${pizarra.viewport_json})
    `;
    return (result as any).insertId;
  },

  async update(id: number, pizarra: Partial<Pizarra>): Promise<void> {
    const fields = [];
    const values = [];

    if (pizarra.titulo !== undefined) { fields.push('titulo = ?'); values.push(pizarra.titulo); }
    if (pizarra.nodos_json !== undefined) { fields.push('nodos_json = ?'); values.push(pizarra.nodos_json); }
    if (pizarra.aristas_json !== undefined) { fields.push('aristas_json = ?'); values.push(pizarra.aristas_json); }
    if (pizarra.viewport_json !== undefined) { fields.push('viewport_json = ?'); values.push(pizarra.viewport_json); }

    if (fields.length === 0) return;

    await sql`UPDATE pizarras SET ${sql(fields.join(', '), ...values)} WHERE id = ${id}`;
  },

  async delete(id: number): Promise<void> {
    await sql`DELETE FROM pizarras WHERE id = ${id}`;
  }
};
