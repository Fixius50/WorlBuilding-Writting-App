import { sql } from './db';
import { Proyecto } from './types';

export const projectService = {
 async list(): Promise<Proyecto[]> {
 return await sql<Proyecto>`SELECT * FROM proyectos ORDER BY ultima_modificacion DESC`;
 },

 async create(name: string, title?: string, tag?: string, image_url?: string): Promise<Proyecto> {
 const initials = (title || name || 'P').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);
 await sql`
 INSERT INTO proyectos (nombre, descripcion, tag, image_url, initials)
 VALUES (${name}, ${title || ''}, ${tag || ''}, ${image_url || ''}, ${initials})
 `;
 const result = await sql<Proyecto>`SELECT * FROM proyectos WHERE nombre = ${name} LIMIT 1`;
 return result[0];
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
