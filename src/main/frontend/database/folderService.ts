import { sql } from './db';
import { Carpeta, FolderType } from './types';

export const folderService = {
    async getByProject(projectId: number): Promise<Carpeta[]> {
        return await sql<Carpeta>`SELECT * FROM carpetas WHERE project_id = ${projectId} ORDER BY nombre ASC`;
    },

    async create(nombre: string, projectId: number, padreId: number | null = null, tipo: FolderType = 'FOLDER'): Promise<Carpeta> {
        const slug = nombre.toLowerCase().replace(/\s+/g, '-');
        await sql`
            INSERT INTO carpetas (nombre, project_id, padre_id, tipo, slug)
            VALUES (${nombre}, ${projectId}, ${padreId}, ${tipo}, ${slug})
        `;
        const result = await sql<Carpeta>`
            SELECT * FROM carpetas 
            WHERE project_id = ${projectId} AND nombre = ${nombre} 
            ORDER BY id DESC LIMIT 1
        `;
        return result[0];
    },

    async update(id: number, nombre: string): Promise<void> {
        const slug = nombre.toLowerCase().replace(/\s+/g, '-');
        await sql`UPDATE carpetas SET nombre = ${nombre}, slug = ${slug} WHERE id = ${id}`;
    },

    async delete(id: number): Promise<void> {
        await sql`DELETE FROM carpetas WHERE id = ${id}`;
    },

    async getBySlug(projectId: number, slug: string): Promise<Carpeta | null> {
        const result = await sql<Carpeta>`SELECT * FROM carpetas WHERE project_id = ${projectId} AND slug = ${slug} LIMIT 1`;
        return result[0] || null;
    },

    async getSubfolders(parent_id: number): Promise<Carpeta[]> {
        return await sql<Carpeta>`SELECT * FROM carpetas WHERE padre_id = ${parent_id} ORDER BY nombre ASC`;
    },

    async getPath(folderId: number): Promise<Carpeta[]> {
        const path: Carpeta[] = [];
        let currentId: number | null = folderId;

        while (currentId !== null) {
            const results: Carpeta[] = await sql<Carpeta>`SELECT * FROM carpetas WHERE id = ${currentId} LIMIT 1`;
            if (results.length === 0) break;
            const folder: Carpeta = results[0];
            path.unshift(folder);
            currentId = folder.padre_id;
        }

        return path;
    },

    async getById(id: number): Promise<Carpeta | null> {
        const result = await sql<Carpeta>`SELECT * FROM carpetas WHERE id = ${id} LIMIT 1`;
        return result[0] || null;
    }
};
