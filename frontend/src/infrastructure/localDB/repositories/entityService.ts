import { sql } from '../client';
import { Entidad } from '@domain/models/database';

export const entityService = {
  async getAllByProject(projectId: number): Promise<Entidad[]> {
    return await sql<Entidad>`SELECT * FROM entidades WHERE project_id = ${projectId} AND borrado = 0 ORDER BY fecha_creacion DESC`;
  },

  async getByFolder(folderId: number): Promise<Entidad[]> {
    return await sql<Entidad>`SELECT * FROM entidades WHERE carpeta_id = ${folderId} AND borrado = 0 ORDER BY nombre ASC`;
  },

  async getById(id: number): Promise<Entidad | null> {
    const result = await sql<Entidad>`SELECT * FROM entidades WHERE id = ${id} AND borrado = 0 LIMIT 1`;
    return result[0] || null;
  },

  async getBySlug(projectId: number, slug: string): Promise<Entidad | null> {
    const result = await sql<Entidad>`SELECT * FROM entidades WHERE project_id = ${projectId} AND (slug = ${slug} OR id = ${slug}) AND borrado = 0 LIMIT 1`;
    return result[0] || null;
  },

  async create(entity: Omit<Entidad, 'id' | 'fecha_creacion' | 'fecha_actualizacion' | 'borrado'>): Promise<Entidad> {
    await sql`
      INSERT INTO entidades (nombre, tipo, descripcion, contenido_json, project_id, carpeta_id)
      VALUES (
        ${entity.nombre}, 
        ${entity.tipo}, 
        ${entity.descripcion || ''}, 
        ${entity.contenido_json ? (typeof entity.contenido_json === 'string' ? entity.contenido_json : JSON.stringify(entity.contenido_json)) : null}, 
        ${entity.project_id}, 
        ${entity.carpeta_id}
      )
    `;
    
    // Recuperar la última entidad creada
    const result = await sql<Entidad>`SELECT * FROM entidades WHERE project_id = ${entity.project_id} ORDER BY id DESC LIMIT 1`;
    return result[0];
  },

  async update(id: number, entity: Partial<Entidad>): Promise<Entidad> {
    const fields: string[] = [];

    if (entity.nombre !== undefined) fields.push(`nombre = ${entity.nombre}`);
    if (entity.tipo !== undefined) fields.push(`tipo = ${entity.tipo}`);
    if (entity.descripcion !== undefined) fields.push(`descripcion = ${entity.descripcion}`);
    if (entity.contenido_json !== undefined) {
      const jsonStr = typeof entity.contenido_json === 'string' ? entity.contenido_json : JSON.stringify(entity.contenido_json);
      fields.push(`contenido_json = ${jsonStr}`);
    }
    if (entity.carpeta_id !== undefined) fields.push(`carpeta_id = ${entity.carpeta_id}`);

    if (fields.length > 0) {
      // Usando sintaxis segura de SQLocal con COALESCE para evitar sobrescribir con null si no se desea
      await sql`
        UPDATE entidades SET 
          nombre = COALESCE(${entity.nombre}, nombre),
          tipo = COALESCE(${entity.tipo}, tipo),
          descripcion = COALESCE(${entity.descripcion}, descripcion),
          contenido_json = COALESCE(${entity.contenido_json ? (typeof entity.contenido_json === 'string' ? entity.contenido_json : JSON.stringify(entity.contenido_json)) : null}, contenido_json),
          carpeta_id = COALESCE(${entity.carpeta_id}, carpeta_id)
        WHERE id = ${id}
      `;
    }

    const result = await sql<Entidad>`SELECT * FROM entidades WHERE id = ${id}`;
    return result[0];
  },

  async delete(id: number): Promise<void> {
    // Soft Delete: Marcar como borrado
    await sql`UPDATE entidades SET borrado = 1 WHERE id = ${id}`;
  },

  async move(id: number, targetCarpetaId: number | null): Promise<void> {
    await sql`UPDATE entidades SET carpeta_id = ${targetCarpetaId} WHERE id = ${id}`;
  },

  async getAllByProjectAndType(projectId: number, type: string): Promise<Entidad[]> {
    return await sql<Entidad>`SELECT * FROM entidades WHERE project_id = ${projectId} AND tipo = ${type} AND borrado = 0 ORDER BY nombre ASC`;
  },

  async getValues(entityId: number): Promise<any[]> {
    const rows: any[] = await sql`
      SELECT 
        v.*, 
        p.id as p_id, p.nombre as p_nombre, p.tipo as p_tipo, 
        p.valor_defecto as p_valor_defecto, p.metadata as p_metadata, 
        p.es_obligatorio as p_es_obligatorio, p.project_id as p_project_id
      FROM valores v
      JOIN plantillas p ON v.plantilla_id = p.id
      WHERE v.entidad_id = ${entityId}
    `;
    return rows.map(r => ({
      id: r.id,
      entidad_id: r.entidad_id,
      plantilla_id: r.plantilla_id,
      valor: r.valor,
      updated_at: r.updated_at,
      plantilla: {
        id: r.p_id,
        nombre: r.p_nombre,
        tipo: r.p_tipo,
        valor_defecto: r.p_valor_defecto,
        metadata: r.p_metadata,
        es_obligatorio: r.p_es_obligatorio,
        project_id: r.p_project_id
      },
      attribute: {
        id: r.p_id,
        nombre: r.p_nombre,
        tipo: r.p_tipo,
        valor_defecto: r.p_valor_defecto,
        metadata: r.p_metadata,
        es_obligatorio: r.p_es_obligatorio,
        project_id: r.p_project_id
      }
    }));
  },

  async addValue(entityId: number, templateId: number, value: string): Promise<void> {
    await sql`INSERT INTO valores (entidad_id, plantilla_id, valor) VALUES (${entityId}, ${templateId}, ${value})`;
  },

  async updateValue(valueId: number, value: string): Promise<void> {
    await sql`UPDATE valores SET valor = ${value}, updated_at = CURRENT_TIMESTAMP WHERE id = ${valueId}`;
  },

  async deleteValue(valueId: number): Promise<void> {
    await sql`DELETE FROM valores WHERE id = ${valueId}`;
  }
};
