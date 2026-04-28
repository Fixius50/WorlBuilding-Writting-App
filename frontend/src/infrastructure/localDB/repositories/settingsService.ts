import { sql } from '../client';

export const settingsService = {
  // Obtener una configuración específica
  async get(clave: string): Promise<string | null> {
    const result = await sql`SELECT valor FROM configuraciones WHERE clave = ${clave}`;
    return result.length > 0 ? (result[0] as any).valor : null;
  },

  // Guardar o actualizar una configuración (Upsert)
  async set(clave: string, valor: string): Promise<void> {
    await sql`
      INSERT INTO configuraciones (clave, valor)
      VALUES (${clave}, ${valor})
      ON CONFLICT(clave) DO UPDATE SET
        valor = excluded.valor,
        updated_at = CURRENT_TIMESTAMP
    `;
  },

  // Obtener todas las configuraciones de golpe (ideal para arrancar la app)
  async getAll(): Promise<Record<string, string>> {
    const result = await sql`SELECT clave, valor FROM configuraciones`;
    const settings: Record<string, string> = {};
    result.forEach((row: any) => {
      settings[row.clave] = row.valor;
    });
    return settings;
  }
};
