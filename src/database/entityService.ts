import { sql } from './db';
import { Entidad, Valor } from './types';

export const entityService = {
 async getAllByProject(projectId: number): Promise<Entidad[]> {
 return await sql<Entidad>`SELECT * FROM entidades WHERE project_id = ${projectId} ORDER BY fecha_creacion DESC`;
 },

 async getByFolder(folderId: number): Promise<Entidad[]> {
 return await sql<Entidad>`SELECT * FROM entidades WHERE carpeta_id = ${folderId} ORDER BY nombre ASC`;
 },

 async getById(id: number): Promise<Entidad | null> {
 const results = await sql<Entidad>`SELECT * FROM entidades WHERE id = ${id}`;
 return results.length > 0 ? results[0] : null;
 },

 async getWithValues(id: number): Promise<Entidad | null> {
 const entity = await this.getById(id);
 if (!entity) return null;

 const values = await sql<Valor>`
 SELECT v.*, p.nombre as plantilla_nombre, p.tipo as plantilla_tipo 
 FROM valores v
 JOIN plantillas p ON v.plantilla_id = p.id
 WHERE v.entidad_id = ${id}
 `;
 
 return { ...entity, valores: values };
 },

 async create(entity: Omit<Entidad, 'id' | 'fecha_creacion'>): Promise<Entidad> {
 const results = await sql<Entidad>`
 INSERT INTO entidades (nombre, tipo, descripcion, contenido_json, project_id, carpeta_id)
 VALUES (${entity.nombre}, ${entity.tipo}, ${entity.descripcion || ''}, ${entity.contenido_json}, ${entity.project_id}, ${entity.carpeta_id || null})
 RETURNING *
 `;
 return results[0];
 },

 async update(id: number, updates: Partial<Entidad>): Promise<Entidad> {
 const result = await sql<Entidad>`
 UPDATE entidades 
 SET 
 nombre = COALESCE(${updates.nombre}, nombre),
 tipo = COALESCE(${updates.tipo}, tipo),
 descripcion = COALESCE(${updates.descripcion}, descripcion),
 contenido_json = COALESCE(${updates.contenido_json}, contenido_json),
 carpeta_id = COALESCE(${updates.carpeta_id}, carpeta_id)
 WHERE id = ${id}
 RETURNING *
 `;
 return result[0];
 },

 async saveValue(entidadId: number, plantillaId: number, valor: string): Promise<void> {
 // Upsert logic for values
 const existing = await sql`SELECT id FROM valores WHERE entidad_id = ${entidadId} AND plantilla_id = ${plantillaId}`;
 
 if (existing.length > 0) {
 await sql`UPDATE valores SET valor = ${valor}, updated_at = CURRENT_TIMESTAMP WHERE id = ${existing[0].id}`;
 } else {
 await sql`INSERT INTO valores (entidad_id, plantilla_id, valor) VALUES (${entidadId}, ${plantillaId}, ${valor})`;
 }
 },

 async deleteValue(valorId: number): Promise<void> {
 await sql`DELETE FROM valores WHERE id = ${valorId}`;
 },

 async delete(id: number): Promise<void> {
 await sql`DELETE FROM entidades WHERE id = ${id}`;
 }
};
