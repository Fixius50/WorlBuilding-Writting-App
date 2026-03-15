import { sql } from './db';

export interface Relacion {
    id: number;
    origen_id: number;
    destino_id: number;
    tipo: string;
    descripcion: string | null;
    project_id: number;
}

export const relationshipService = {
    async getByProject(projectId: number): Promise<Relacion[]> {
        return await sql<Relacion>`SELECT * FROM relaciones WHERE project_id = ${projectId}`;
    },

    async create(rel: Omit<Relacion, 'id'>): Promise<Relacion> {
        const results = await sql<Relacion>`
            INSERT INTO relaciones (origen_id, destino_id, tipo, descripcion, project_id)
            VALUES (${rel.origen_id}, ${rel.destino_id}, ${rel.tipo}, ${rel.descripcion || ''}, ${rel.project_id})
            RETURNING *
        `;
        return results[0];
    },

    async delete(id: number): Promise<void> {
        await sql`DELETE FROM relaciones WHERE id = ${id}`;
    },

    async update(id: number, updates: Partial<Relacion>): Promise<void> {
        if (updates.tipo) await sql`UPDATE relaciones SET tipo = ${updates.tipo} WHERE id = ${id}`;
        if (updates.descripcion !== undefined) await sql`UPDATE relaciones SET descripcion = ${updates.descripcion} WHERE id = ${id}`;
    }
};
