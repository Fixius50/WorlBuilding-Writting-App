import { sql } from '../client';
import { Proyecto } from '@domain/models/database';

export const projectService = {
 async list(): Promise<Proyecto[]> {
    try {
      const data = await sql<Proyecto>`SELECT * FROM proyectos ORDER BY ultima_modificacion DESC`;
      console.log(`[DB] Proyectos cargados: ${data.length}`);
      return data;
    } catch (err) {
      console.error(`[DB] Fallo al listar proyectos:`, err);
      return [];
    }
 },

 async create(name: string, title?: string, tag?: string, image_url?: string): Promise<Proyecto> {
    const initials = (title || name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
    try {
      console.log(`[DB] Creando proyecto: ${name}`);
      await sql`
        INSERT INTO proyectos (nombre, descripcion, tag, image_url, initials)
        VALUES (${name}, ${title || ''}, ${tag || ''}, ${image_url || ''}, ${initials})
      `;
      
      // Pequeña espera para asegurar que el sistema de archivos (OPFS) se sincronice antes del select
      await new Promise(r => setTimeout(r, 50)); 
      
      const result = await sql<Proyecto>`SELECT * FROM proyectos WHERE nombre = ${name} LIMIT 1`;
      console.log(`[DB] Proyecto creado con éxito:`, result[0]);
      return result[0];
    } catch (err) {
      console.error(`[DB] Error crítico al crear proyecto:`, err);
      throw err;
    }
 },

 async getByName(name: string): Promise<Proyecto | null> {
 const result = await sql<Proyecto>`SELECT * FROM proyectos WHERE nombre = ${name} LIMIT 1`;
 return result[0] || null;
 },

 async delete(id: number): Promise<void> {
 await sql`DELETE FROM proyectos WHERE id = ${id}`;
 },

 async update(id: number, data: Partial<Proyecto>): Promise<void> {
 if (data.nombre) {
 await sql`UPDATE proyectos SET nombre = ${data.nombre}, ultima_modificacion = CURRENT_TIMESTAMP WHERE id = ${id}`;
 }
 if (data.descripcion) {
 await sql`UPDATE proyectos SET descripcion = ${data.descripcion}, ultima_modificacion = CURRENT_TIMESTAMP WHERE id = ${id}`;
 }
 }
};
