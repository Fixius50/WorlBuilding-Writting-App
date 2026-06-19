import { sql } from "../client";
import { Cuaderno, Hoja, HojaComentario } from "@domain/database";
import { emitUIRefresh } from "@utils/uiRefresh";

export const notebookService = {
  async getAllByProject(projectId: number): Promise<Cuaderno[]> {
    return await sql<Cuaderno>`SELECT * FROM cuadernos WHERE project_id = ${projectId} ORDER BY created_at DESC`;
  },

  async getById(id: number): Promise<Cuaderno | null> {
    const results =
      await sql<Cuaderno>`SELECT * FROM cuadernos WHERE id = ${id}`;
    return results.length > 0 ? results[0] : null;
  },

  async create(
    projectId: number,
    titulo: string,
    genero: string = "Fantasy",
    metadataJson: string = "",
    imageUrl: string = "",
  ): Promise<Cuaderno> {
    await sql`INSERT INTO cuadernos (titulo, genero, metadata_json, image_url, project_id) VALUES (${titulo}, ${genero}, ${metadataJson}, ${imageUrl}, ${projectId})`;
    const results =
      await sql<Cuaderno>`SELECT * FROM cuadernos WHERE project_id = ${projectId} ORDER BY id DESC LIMIT 1`;
    emitUIRefresh({
      operation: "create",
      scope: "notebook",
      id: results[0].id,
    });
    return results[0];
  },

  async update(
    id: number,
    updates: Partial<
      Pick<Cuaderno, "titulo" | "genero" | "metadata_json" | "image_url">
    >,
  ): Promise<void> {
    const current = await this.getById(id);
    if (current) {
      await sql`
        UPDATE cuadernos 
        SET 
          titulo = ${updates.titulo !== undefined ? updates.titulo : current.titulo},
          genero = ${updates.genero !== undefined ? updates.genero : current.genero},
          metadata_json = ${updates.metadata_json !== undefined ? updates.metadata_json : current.metadata_json},
          image_url = ${updates.image_url !== undefined ? updates.image_url : current.image_url}
        WHERE id = ${id}
      `;
      emitUIRefresh({ operation: "update", scope: "notebook", id });
    }
  },

  async delete(id: number): Promise<void> {
    await sql`DELETE FROM cuadernos WHERE id = ${id}`;
    emitUIRefresh({ operation: "delete", scope: "notebook", id });
  },

  // --- Hojas ---
  async getPagesByNotebook(notebookId: number): Promise<Hoja[]> {
    return await sql<Hoja>`SELECT * FROM hojas WHERE cuaderno_id = ${notebookId} ORDER BY orden ASC, id ASC`;
  },

  async getPageById(id: number): Promise<Hoja | null> {
    const results = await sql<Hoja>`SELECT * FROM hojas WHERE id = ${id}`;
    return results.length > 0 ? results[0] : null;
  },

  async createPage(
    notebookId: number,
    titulo: string = "",
    contenido: string = "",
  ): Promise<Hoja> {
    await sql`INSERT INTO hojas (cuaderno_id, titulo, contenido) VALUES (${notebookId}, ${titulo}, ${contenido})`;
    const results =
      await sql<Hoja>`SELECT * FROM hojas WHERE cuaderno_id = ${notebookId} ORDER BY id DESC LIMIT 1`;
    emitUIRefresh({ operation: "create", scope: "page", id: results[0].id });
    return results[0];
  },

  async updatePage(
    id: number,
    updates: Partial<Pick<Hoja, "titulo" | "contenido" | "orden">>,
  ): Promise<void> {
    const current = await this.getPageById(id);
    if (current) {
      await sql`
        UPDATE hojas 
        SET 
          titulo = ${updates.titulo !== undefined ? updates.titulo : current.titulo},
          contenido = ${updates.contenido !== undefined ? updates.contenido : current.contenido},
          orden = ${updates.orden !== undefined ? updates.orden : current.orden}
        WHERE id = ${id}
      `;
      emitUIRefresh({ operation: "update", scope: "page", id });
    }
  },

  async deletePage(id: number): Promise<void> {
    await sql`DELETE FROM hojas WHERE id = ${id}`;
    emitUIRefresh({ operation: "delete", scope: "page", id });
  },

  // --- Snapshots ---
  async createSnapshot(hojaId: number, contenido: string): Promise<void> {
    await sql`INSERT INTO hojas_snapshots (hoja_id, contenido) VALUES (${hojaId}, ${contenido})`;
  },

  async getSnapshots(
    hojaId: number,
  ): Promise<{ id: number; timestamp: string; contenido: string }[]> {
    const results = await sql<{
      id: number;
      fecha_creacion: string;
      contenido: string;
    }>`
      SELECT id, fecha_creacion, contenido FROM hojas_snapshots 
      WHERE hoja_id = ${hojaId} 
      ORDER BY fecha_creacion DESC 
      LIMIT 20
    `;
    return results.map((r) => ({
      id: r.id,
      timestamp: r.fecha_creacion,
      contenido: r.contenido,
    }));
  },

  // --- Backlinks / Apariciones ---
  async getMentions(
    projectId: number,
    query: string,
  ): Promise<
    {
      hoja_id: number;
      hoja_titulo: string;
      cuaderno_titulo: string;
      cuaderno_id: number;
      snippet: string;
    }[]
  > {
    type MentionRow = {
      hoja_id: number;
      hoja_titulo: string | null;
      content: string | null;
      cuaderno_titulo: string;
      cuaderno_id: number;
    };
    const results = await sql<MentionRow>`
      SELECT 
        h.id as hoja_id, 
        h.titulo as hoja_titulo, 
        h.contenido as content,
        c.titulo as cuaderno_titulo,
        c.id as cuaderno_id
      FROM hojas h
      JOIN cuadernos c ON h.cuaderno_id = c.id
      WHERE c.project_id = ${projectId}
      AND (h.contenido LIKE ${"%" + query + "%"} OR h.titulo LIKE ${"%" + query + "%"})
      LIMIT 50
    `;
    return results.map((r) => {
      const content = r.content || "";
      const queryIdx = content.toLowerCase().indexOf(query.toLowerCase());
      let snippet = "Sin contenido";

      if (queryIdx !== -1) {
        const start = Math.max(0, queryIdx - 60);
        const end = Math.min(content.length, queryIdx + query.length + 60);
        snippet =
          (start > 0 ? "..." : "") +
          content.substring(start, end) +
          (end < content.length ? "..." : "");
      } else if (content) {
        snippet =
          content.substring(0, 120) + (content.length > 120 ? "..." : "");
      }

      return {
        hoja_id: r.hoja_id,
        hoja_titulo: r.hoja_titulo || "Sin título",
        cuaderno_titulo: r.cuaderno_titulo,
        cuaderno_id: r.cuaderno_id,
        snippet,
      };
    });
  },

  // --- Comentarios de hoja ---
  async getCommentsByPage(hojaId: number): Promise<HojaComentario[]> {
    return await sql<HojaComentario>`
      SELECT * FROM hojas_comentarios
      WHERE hoja_id = ${hojaId}
      ORDER BY created_at ASC, id ASC
    `;
  },

  async createComment(input: {
    hojaId: number;
    texto: string;
    parentId?: number | null;
    selectedText?: string | null;
    rangeStart?: number | null;
    rangeEnd?: number | null;
  }): Promise<HojaComentario> {
    const parentId = input.parentId ?? null;
    const selectedText = input.selectedText ?? null;
    const rangeStart = input.rangeStart ?? null;
    const rangeEnd = input.rangeEnd ?? null;

    await sql`
      INSERT INTO hojas_comentarios (
        hoja_id,
        parent_id,
        texto,
        seleccion_texto,
        rango_inicio,
        rango_fin,
        estado
      ) VALUES (
        ${input.hojaId},
        ${parentId},
        ${input.texto},
        ${selectedText},
        ${rangeStart},
        ${rangeEnd},
        'open'
      )
    `;

    const results = await sql<HojaComentario>`
      SELECT * FROM hojas_comentarios
      WHERE hoja_id = ${input.hojaId}
      ORDER BY id DESC
      LIMIT 1
    `;

    return results[0];
  },

  async resolveComment(commentId: number): Promise<void> {
    await sql`
      UPDATE hojas_comentarios
      SET estado = 'resolved', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${commentId}
    `;
  },

  async reopenComment(commentId: number): Promise<void> {
    await sql`
      UPDATE hojas_comentarios
      SET estado = 'open', updated_at = CURRENT_TIMESTAMP
      WHERE id = ${commentId}
    `;
  },

  async deleteComment(commentId: number): Promise<void> {
    await sql`DELETE FROM hojas_comentarios WHERE id = ${commentId}`;
  },
};
