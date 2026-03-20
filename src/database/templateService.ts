import { sql } from './db';
import { Plantilla } from './types';

export const templateService = {
 async getAll(): Promise<Plantilla[]> {
 return await sql<Plantilla>`SELECT * FROM plantillas ORDER BY nombre ASC`;
 },

 async getByProject(projectId: number): Promise<Plantilla[]> {
 return await sql<Plantilla>`SELECT * FROM plantillas WHERE project_id = ${projectId} ORDER BY nombre ASC`;
 },

 async getById(id: number): Promise<Plantilla | null> {
 const result = await sql<Plantilla>`SELECT * FROM plantillas WHERE id = ${id} LIMIT 1`;
 return result[0] || null;
 },

 async create(template: Omit<Plantilla, 'id' | 'created_at'>): Promise<Plantilla> {
 const result = await sql<Plantilla>`
 INSERT INTO plantillas (nombre, tipo, valor_defecto, metadata, es_obligatorio, project_id)
 VALUES (${template.nombre}, ${template.tipo}, ${template.valor_defecto}, ${template.metadata}, ${template.es_obligatorio ? 1 : 0}, ${template.project_id})
 RETURNING *
 `;
 return result[0];
 },

 async update(id: number, template: Partial<Plantilla>): Promise<Plantilla> {
 const result = await sql<Plantilla>`
 UPDATE plantillas
 SET 
 nombre = COALESCE(${template.nombre}, nombre),
 tipo = COALESCE(${template.tipo}, tipo),
 valor_defecto = COALESCE(${template.valor_defecto}, valor_defecto),
 metadata = COALESCE(${template.metadata}, metadata),
 es_obligatorio = COALESCE(${template.es_obligatorio}, es_obligatorio)
 WHERE id = ${id}
 RETURNING *
 `;
 return result[0];
 },

 async delete(id: number): Promise<void> {
 await sql`DELETE FROM plantillas WHERE id = ${id}`;
 }
};
