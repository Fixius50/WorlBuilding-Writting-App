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
    const baseSlug = entity.nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await sql`SELECT id FROM entidades WHERE project_id = ${entity.project_id} AND slug = ${slug} LIMIT 1`;
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter++}`;
    }

    await sql`
      INSERT INTO entidades (nombre, slug, tipo, folder_slug, project_id, carpeta_id, contenido_json, imagen_url)
      VALUES (${entity.nombre}, ${slug}, ${entity.tipo}, ${entity.folder_slug}, ${entity.project_id}, ${entity.carpeta_id}, ${JSON.stringify(entity.contenido_json)}, ${entity.imagen_url})
    `;
    
    const result = await sql<Entidad>`SELECT * FROM entidades WHERE project_id = ${entity.project_id} AND slug = ${slug} LIMIT 1`;
    return result[0];
  },

  async update(id: number, entity: Partial<Entidad>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (entity.nombre !== undefined) {
      fields.push(`nombre = @nombre`);
    }
    if (entity.tipo !== undefined) {
      fields.push(`tipo = @tipo`);
    }
    if (entity.contenido_json !== undefined) {
      fields.push(`contenido_json = @contenido_json`);
    }
    if (entity.imagen_url !== undefined) {
      fields.push(`imagen_url = @imagen_url`);
    }
    if (entity.carpeta_id !== undefined) {
      fields.push(`carpeta_id = @carpeta_id`);
    }

    if (fields.length === 0) return;

    const query = `UPDATE entidades SET ${fields.join(', ')}, fecha_actualizacion = CURRENT_TIMESTAMP WHERE id = ${id}`;
    
    // Simplificado para SQLocal handle
    await sql(query, {
      nombre: entity.nombre,
      tipo: entity.tipo,
      contenido_json: entity.contenido_json ? JSON.stringify(entity.contenido_json) : undefined,
      imagen_url: entity.imagen_url,
      carpeta_id: entity.carpeta_id
    });
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
