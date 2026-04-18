import { sql } from '../client';

export interface Cuaderno {
  id: number;
  titulo: string;
  genero: string | null;
  image_url: string | null;
  project_id: number;
  created_at: string;
}

export interface Hoja {
  id: number;
  titulo: string | null;
  contenido: string | null;
  cuaderno_id: number;
  orden: number;
  created_at: string;
}

export const notebookService = {
  async getAllByProject(projectId: number): Promise<Cuaderno[]> {
    return await sql<Cuaderno>`SELECT * FROM cuadernos WHERE project_id = ${projectId} ORDER BY created_at DESC`;
  },

  async getById(id: number): Promise<Cuaderno | null> {
    const results = await sql<Cuaderno>`SELECT * FROM cuadernos WHERE id = ${id}`;
    return results.length > 0 ? results[0] : null;
  },

  async create(projectId: number, titulo: string, genero: string = 'Fantasy', imageUrl: string = ''): Promise<Cuaderno> {
    await sql`INSERT INTO cuadernos (titulo, genero, image_url, project_id) VALUES (${titulo}, ${genero}, ${imageUrl}, ${projectId})`;
    const results = await sql<Cuaderno>`SELECT * FROM cuadernos WHERE project_id = ${projectId} ORDER BY id DESC LIMIT 1`;
    return results[0];
  },

  async update(id: number, updates: Partial<Pick<Cuaderno, 'titulo' | 'genero' | 'image_url'>>): Promise<void> {
    const current = await this.getById(id);
    if (!current) return;

    await sql`
      UPDATE cuadernos 
      SET 
        titulo = ${updates.titulo !== undefined ? updates.titulo : current.titulo},
        genero = ${updates.genero !== undefined ? updates.genero : current.genero},
        image_url = ${updates.image_url !== undefined ? updates.image_url : current.image_url}
      WHERE id = ${id}
    `;
  },

  async delete(id: number): Promise<void> {
    await sql`DELETE FROM cuadernos WHERE id = ${id}`;
  },

  // --- Hojas ---
  async getPagesByNotebook(notebookId: number): Promise<Hoja[]> {
    return await sql<Hoja>`SELECT * FROM hojas WHERE cuaderno_id = ${notebookId} ORDER BY orden ASC, id ASC`;
  },

  async getPageById(id: number): Promise<Hoja | null> {
    const results = await sql<Hoja>`SELECT * FROM hojas WHERE id = ${id}`;
    return results.length > 0 ? results[0] : null;
  },

  async createPage(notebookId: number, titulo: string = '', contenido: string = ''): Promise<Hoja> {
    await sql`INSERT INTO hojas (cuaderno_id, titulo, contenido) VALUES (${notebookId}, ${titulo}, ${contenido})`;
    const results = await sql<Hoja>`SELECT * FROM hojas WHERE cuaderno_id = ${notebookId} ORDER BY id DESC LIMIT 1`;
    return results[0];
  },

  async updatePage(id: number, updates: Partial<Pick<Hoja, 'titulo' | 'contenido' | 'orden'>>): Promise<void> {
    const current = await this.getPageById(id);
    if (!current) return;
    
    await sql`
      UPDATE hojas 
      SET 
        titulo = ${updates.titulo !== undefined ? updates.titulo : current.titulo},
        contenido = ${updates.contenido !== undefined ? updates.contenido : current.contenido},
        orden = ${updates.orden !== undefined ? updates.orden : current.orden}
      WHERE id = ${id}
    `;
  },

  async deletePage(id: number): Promise<void> {
    await sql`DELETE FROM hojas WHERE id = ${id}`;
  }
};
