import { sql } from './db';
import { Carpeta, FolderType } from './types';

export const folderService = {
  async getByProject(projectId: number): Promise<Carpeta[]> {
    return await sql<Carpeta>`
      SELECT c.*, 
        (SELECT COUNT(*) FROM carpetas c2 WHERE c2.padre_id = c.id AND c2.borrado = 0) +
        (SELECT COUNT(*) FROM entidades e WHERE e.carpeta_id = c.id AND e.borrado = 0) as itemCount
      FROM carpetas c 
      WHERE c.project_id = ${projectId} AND c.borrado = 0 
      ORDER BY c.nombre ASC`;
  },

  async create(nombre: string, projectId: number, padreId: number | null = null, tipo: FolderType = 'FOLDER'): Promise<Carpeta> {
    const baseSlug = nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let slug = baseSlug;
    let counter = 1;

    while (true) {
      const existing = await sql`SELECT id FROM carpetas WHERE project_id = ${projectId} AND slug = ${slug} LIMIT 1`;
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter++}`;
    }

    await sql`
       INSERT INTO carpetas (nombre, project_id, padre_id, tipo, slug)
       VALUES (${nombre}, ${projectId}, ${padreId}, ${tipo}, ${slug})
     `;
    const result = await sql<Carpeta>`SELECT * FROM carpetas WHERE project_id = ${projectId} AND slug = ${slug} LIMIT 1`;
    return result[0];
  },

  async update(id: number, nombre: string, projectId: number): Promise<void> {
    const baseSlug = nombre.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
    let slug = baseSlug;
    let counter = 1;

    // Verificar unicidad del slug en el proyecto (excluyendo la carpeta actual)
    while (true) {
      const existing = await sql`SELECT id FROM carpetas WHERE project_id = ${projectId} AND slug = ${slug} AND id != ${id} LIMIT 1`;
      if (existing.length === 0) break;
      slug = `${baseSlug}-${counter++}`;
    }

    await sql`UPDATE carpetas SET nombre = ${nombre}, slug = ${slug} WHERE id = ${id}`;
  },

  async delete(id: number): Promise<void> {
    // 1. Soft Delete de la propia carpeta
    await sql`UPDATE carpetas SET borrado = 1 WHERE id = ${id}`;
    
    // 2. Soft Delete de todas las entidades contenidas
    await sql`UPDATE entidades SET borrado = 1 WHERE carpeta_id = ${id}`;

    // 3. Obtener subcarpetas para borrar recursivamente
    const subs = await sql<{ id: number }>`SELECT id FROM carpetas WHERE padre_id = ${id}`;
    for (const sub of subs) {
      await this.delete(sub.id);
    }
    
    // 4. Si la carpeta es una cronología/dimensión, marcar sus eventos
    await sql`UPDATE eventos SET borrado = 1 WHERE timeline_id = ${id}`;
  },

  async getBySlug(projectId: number, slug: string): Promise<Carpeta | null> {
    const result = await sql<Carpeta>`SELECT * FROM carpetas WHERE project_id = ${projectId} AND slug = ${slug} AND borrado = 0 LIMIT 1`;
    return result[0] || null;
  },

  async getSubfolders(parent_id: number): Promise<Carpeta[]> {
    return await sql<Carpeta>`
      SELECT c.*, 
        (SELECT COUNT(*) FROM carpetas c2 WHERE c2.padre_id = c.id AND c2.borrado = 0) +
        (SELECT COUNT(*) FROM entidades e WHERE e.carpeta_id = c.id AND e.borrado = 0) as itemCount
      FROM carpetas c 
      WHERE c.padre_id = ${parent_id} AND c.borrado = 0 
      ORDER BY c.nombre ASC`;
  },

  async getPath(folderId: number): Promise<Carpeta[]> {
    const path: Carpeta[] = [];
    let currentId: number | null = folderId;

    while (currentId !== null) {
      const results: Carpeta[] = await sql<Carpeta>`SELECT * FROM carpetas WHERE id = ${currentId} LIMIT 1`;
      if (results.length === 0) break;
      const folder: Carpeta = results[0];
      path.push(folder);
      currentId = folder.padre_id;
    }

    return path.reverse();
  },

  async getById(id: number): Promise<Carpeta | null> {
    const result = await sql<Carpeta>`SELECT * FROM carpetas WHERE id = ${id} AND borrado = 0 LIMIT 1`;
    return result[0] || null;
  },

  async move(id: number, targetPadreId: number | null): Promise<void> {
    await sql`UPDATE carpetas SET padre_id = ${targetPadreId} WHERE id = ${id}`;
  }
};
