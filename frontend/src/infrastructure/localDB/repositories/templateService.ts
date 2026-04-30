import { sql } from '../client';
import { Plantilla, Valor } from '@domain/models/database';

export const templateService = {
  async getAll(projectId: number): Promise<Plantilla[]> {
    return await sql<Plantilla>`
      SELECT * FROM plantillas 
      WHERE project_id = ${projectId} 
      ORDER BY categoria ASC, orden ASC
    `;
  },

  async getById(id: number): Promise<Plantilla | null> {
    const result = await sql<Plantilla>`SELECT * FROM plantillas WHERE id = ${id} LIMIT 1`;
    return result[0] || null;
  },

  async create(template: Omit<Plantilla, 'id' | 'created_at'>): Promise<Plantilla> {
    await sql`
      INSERT INTO plantillas (nombre, tipo, valor_defecto, metadata, es_obligatorio, project_id, aplica_a_todo, tipo_objetivo, categoria, orden)
      VALUES (
        ${template.nombre}, 
        ${template.tipo}, 
        ${template.valor_defecto || null}, 
        ${template.metadata || null}, 
        ${template.es_obligatorio ? 1 : 0}, 
        ${template.project_id},
        ${template.aplica_a_todo ? 1 : 0},
        ${template.tipo_objetivo || null},
        ${template.categoria || 'General'},
        ${template.orden || 0}
      )
    `;
    const result = await sql<Plantilla>`SELECT * FROM plantillas WHERE project_id = ${template.project_id} ORDER BY id DESC LIMIT 1`;
    return result[0];
  },

  async update(id: number, template: Partial<Plantilla>): Promise<void> {
    await sql`
      UPDATE plantillas SET 
        nombre = COALESCE(${template.nombre}, nombre),
        tipo = COALESCE(${template.tipo}, tipo),
        valor_defecto = COALESCE(${template.valor_defecto}, valor_defecto),
        metadata = COALESCE(${template.metadata}, metadata),
        es_obligatorio = COALESCE(${template.es_obligatorio ? 1 : 0}, es_obligatorio),
        aplica_a_todo = COALESCE(${template.aplica_a_todo ? 1 : 0}, aplica_a_todo),
        tipo_objetivo = COALESCE(${template.tipo_objetivo}, tipo_objetivo),
        categoria = COALESCE(${template.categoria}, categoria),
        orden = COALESCE(${template.orden}, orden)
      WHERE id = ${id}
    `;
  },

  async delete(id: number): Promise<void> {
    await sql`DELETE FROM plantillas WHERE id = ${id}`;
  }
};
