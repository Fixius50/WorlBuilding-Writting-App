import { sql } from './db';
import { Entidad, Carpeta } from './types';

export const trashService = {
  async getItems(projectId: number): Promise<unknown[]> {
    const entities = await sql<unknown>`
      SELECT id, nombre, tipo, fecha_creacion as deleted_date, 'ENTIDAD' as item_tipo
      FROM entidades 
      WHERE project_id = ${projectId} AND borrado = 1
    `;
    const folders = await sql<unknown>`
      SELECT id, nombre, tipo, 'FOLDER' as item_tipo, NULL as deleted_date
      FROM carpetas
      WHERE project_id = ${projectId} AND borrado = 1
    `;
    return [...entities, ...folders];
  },

  async restore(type: string, id: number): Promise<void> {
    if (type === 'FOLDER') {
      await sql`UPDATE carpetas SET borrado = 0 WHERE id = ${id}`;
    } else {
      await sql`UPDATE entidades SET borrado = 0 WHERE id = ${id}`;
    }
  },

  async permanentlyDelete(type: string, id: number): Promise<void> {
    if (type === 'FOLDER') {
      await sql`DELETE FROM carpetas WHERE id = ${id}`;
    } else {
      await sql`DELETE FROM entidades WHERE id = ${id}`;
    }
  }
};
