import { sql } from './db';
import { Entidad, Valor, Plantilla } from './types';

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

  async getValues(entidadId: number): Promise<(Valor & { attribute: Plantilla })[]> {
    const results = await sql<any>`
      SELECT v.*, 
             p.id as p_id, p.nombre as p_nombre, p.tipo as p_tipo, 
             p.valor_defecto as p_valor_defecto, p.metadata as p_metadata,
             p.es_obligatorio as p_es_obligatorio, p.project_id as p_project_id,
             p.created_at as p_created_at
      FROM valores v
      JOIN plantillas p ON v.plantilla_id = p.id
      WHERE v.entidad_id = ${entidadId}
    `;
    
    return results.map(r => ({
      id: r.id,
      entidad_id: r.entidad_id,
      plantilla_id: r.plantilla_id,
      valor: r.valor,
      updated_at: r.updated_at || new Date().toISOString(),
      attribute: {
        id: r.p_id,
        nombre: r.p_nombre,
        tipo: r.p_tipo,
        valor_defecto: r.p_valor_defecto,
        metadata: r.p_metadata,
        es_obligatorio: r.p_es_obligatorio,
        project_id: r.p_project_id,
        created_at: r.p_created_at
      }
    }));
  },

  async addValue(entidadId: number, plantillaId: number, valor: string): Promise<void> {
    await sql`INSERT INTO valores (entidad_id, plantilla_id, valor) VALUES (${entidadId}, ${plantillaId}, ${valor})`;
  },

  async updateValue(valorId: number, valor: string): Promise<void> {
    await sql`UPDATE valores SET valor = ${valor}, updated_at = CURRENT_TIMESTAMP WHERE id = ${valorId}`;
  },

  async saveValue(entidadId: number, plantillaId: number, valor: string): Promise<void> {
    const existing = await sql`SELECT id FROM valores WHERE entidad_id = ${entidadId} AND plantilla_id = ${plantillaId}`;
    if (existing.length > 0) {
      await this.updateValue(existing[0].id, valor);
    } else {
      await this.addValue(entidadId, plantillaId, valor);
    }
  },

 async deleteValue(valorId: number): Promise<void> {
 await sql`DELETE FROM valores WHERE id = ${valorId}`;
 },

  async delete(id: number): Promise<void> {
    // 1. Eliminar relaciones asociadas
    await sql`DELETE FROM relaciones WHERE origen_id = ${id} OR destino_id = ${id}`;
    // 2. Eliminar la entidad
    await sql`DELETE FROM entidades WHERE id = ${id}`;
  },

  async move(id: number, targetCarpetaId: number | null): Promise<void> {
    await sql`UPDATE entidades SET carpeta_id = ${targetCarpetaId} WHERE id = ${id}`;
  }
};
