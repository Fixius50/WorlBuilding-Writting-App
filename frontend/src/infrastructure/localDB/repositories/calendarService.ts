import { sql } from '../client';

export interface Calendario {
  id: number;
  nombre: string;
  project_id: number;
  meses_json: string;
  dias_semana_json: string;
  fecha_inicio_json: string;
  borrado: number;
}

export const calendarService = {
  async getByProject(projectId: number): Promise<Calendario[]> {
    const result = await sql`SELECT * FROM calendarios WHERE project_id = ${projectId} AND borrado = 0`;
    return result as Calendario[];
  },

  async create(calendario: Omit<Calendario, 'id' | 'borrado'>): Promise<number> {
    const result = await sql`
      INSERT INTO calendarios (nombre, project_id, meses_json, dias_semana_json, fecha_inicio_json)
      VALUES (${calendario.nombre}, ${calendario.project_id}, ${calendario.meses_json}, ${calendario.dias_semana_json}, ${calendario.fecha_inicio_json})
    `;
    return (result as any).insertId;
  },

  async update(id: number, calendario: Partial<Calendario>): Promise<void> {
    const fields = [];
    const values = [];

    if (calendario.nombre !== undefined) { fields.push('nombre = ?'); values.push(calendario.nombre); }
    if (calendario.meses_json !== undefined) { fields.push('meses_json = ?'); values.push(calendario.meses_json); }
    if (calendario.dias_semana_json !== undefined) { fields.push('dias_semana_json = ?'); values.push(calendario.dias_semana_json); }
    if (calendario.fecha_inicio_json !== undefined) { fields.push('fecha_inicio_json = ?'); values.push(calendario.fecha_inicio_json); }

    if (fields.length === 0) return;

    await sql`UPDATE calendarios SET ${sql(fields.join(', '), ...values)} WHERE id = ${id}`;
  },

  async delete(id: number): Promise<void> {
    await sql`UPDATE calendarios SET borrado = 1 WHERE id = ${id}`;
  }
};
